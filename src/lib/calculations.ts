import {
  AMORTIZATION_MONTHS,
  BASELINE_THROUGHPUT_70B,
  CLOUD_PRICING,
  CONTRACT_DISCOUNT,
  HARDWARE,
  MODEL_SIZE_MULTIPLIER,
  WORKLOAD_ADJUSTMENT,
} from "../data/pricing";
import type { Vendor, VendorResult, WorkloadConfig } from "../types";

const DAYS_PER_MONTH = 30.44; // 365.25 / 12

function throughputPerGpu(vendor: Vendor, config: WorkloadConfig): number {
  const base = vendor === "AMD" ? BASELINE_THROUGHPUT_70B.AMD : BASELINE_THROUGHPUT_70B.NVIDIA;
  const sizeMult = MODEL_SIZE_MULTIPLIER[config.modelSize];
  const workloadMult = WORKLOAD_ADJUSTMENT[config.workloadType][vendor];
  return base * sizeMult * workloadMult;
}

export function calculateVendor(vendor: Vendor, config: WorkloadConfig): VendorResult {
  const hw = vendor === "AMD" ? HARDWARE.AMD : HARDWARE.NVIDIA;
  const monthlyHours = config.dailyUsageHours * DAYS_PER_MONTH;
  const discount = CONTRACT_DISCOUNT[config.contractLength] ?? 0;

  let monthlyCost = 0;
  let monthlyPowerCost = 0;
  let totalHardwareCost = 0;
  let cloudCostPerGpuHour: number | null = null;
  let hardwareCostPerGpu: number | null = null;

  if (config.deploymentMode === "cloud") {
    const rate = CLOUD_PRICING[config.cloudProvider][vendor];
    cloudCostPerGpuHour = rate;
    if (rate !== null) {
      const effectiveRate = rate * (1 - discount);
      monthlyCost = effectiveRate * monthlyHours * config.numGpus;
    }
  } else {
    hardwareCostPerGpu = hw.pricePerUnit;
    totalHardwareCost = hw.pricePerUnit * config.numGpus;
    const amortMonths = AMORTIZATION_MONTHS[config.contractLength] ?? 36;
    const monthlyHardwareCost = totalHardwareCost / amortMonths;

    if (config.includePowerCosts) {
      const kwPerGpu = hw.tdpWatts / 1000;
      const monthlyKwh = kwPerGpu * monthlyHours * config.dataCenterPue * config.numGpus;
      monthlyPowerCost = monthlyKwh * config.powerCostPerKwh;
    }

    monthlyCost = monthlyHardwareCost + monthlyPowerCost;
  }

  const perGpuThroughput = throughputPerGpu(vendor, config);
  const totalThroughput = perGpuThroughput * config.numGpus;

  let costPerMillionUnits: number | null = null;
  if (totalThroughput > 0 && monthlyCost > 0) {
    const unitsPerMonth = totalThroughput * monthlyHours * 3600;
    const millionUnitsPerMonth = unitsPerMonth / 1_000_000;
    costPerMillionUnits = monthlyCost / millionUnitsPerMonth;
  }

  return {
    vendor,
    gpuModel: config.deploymentMode === "onprem" ? hw.gpuModel : gpuCloudLabel(vendor, config),
    hardwareCostPerGpu,
    cloudCostPerGpuHour,
    totalHardwareCost,
    monthlyPowerCost,
    monthlyCost,
    annualCost: monthlyCost * 12,
    threeYearCost: monthlyCost * 36,
    throughputPerGpu: perGpuThroughput,
    totalThroughput,
    costPerMillionUnits,
    costUnitLabel: costUnitLabelFor(config.workloadType),
    tdpWatts: hw.tdpWatts,
    contractDiscount: discount,
  };
}

function costUnitLabelFor(workloadType: WorkloadConfig["workloadType"]): string {
  switch (workloadType) {
    case "Image Generation":
      return "images";
    case "Computer Vision":
      return "frames";
    default:
      return "tokens";
  }
}

function gpuCloudLabel(vendor: Vendor, config: WorkloadConfig): string {
  return vendor === "AMD"
    ? `AMD MI300X (${config.cloudProvider})`
    : `NVIDIA H100 (${config.cloudProvider})`;
}

export interface Savings {
  monthlySavings: number;
  annualSavings: number;
  percentSavings: number;
  amdCheaper: boolean;
}

export function calculateSavings(amd: VendorResult, nvidia: VendorResult): Savings {
  const monthlySavings = nvidia.monthlyCost - amd.monthlyCost;
  const annualSavings = nvidia.annualCost - amd.annualCost;
  const percentSavings = nvidia.monthlyCost > 0 ? (monthlySavings / nvidia.monthlyCost) * 100 : 0;
  return {
    monthlySavings,
    annualSavings,
    percentSavings,
    amdCheaper: monthlySavings > 0,
  };
}

export interface ThreeYearPoint {
  month: number;
  label: string;
  amd: number;
  nvidia: number;
}

export function threeYearProjection(amd: VendorResult, nvidia: VendorResult): ThreeYearPoint[] {
  const points: ThreeYearPoint[] = [];
  for (let m = 0; m <= 36; m++) {
    points.push({
      month: m,
      label: m === 0 ? "Start" : m % 12 === 0 ? `Yr ${m / 12}` : "",
      amd: amd.monthlyCost * m,
      nvidia: nvidia.monthlyCost * m,
    });
  }
  return points;
}

export function findCrossoverMonth(points: ThreeYearPoint[]): number | null {
  for (let i = 1; i < points.length; i++) {
    const prevDiff = points[i - 1].amd - points[i - 1].nvidia;
    const currDiff = points[i].amd - points[i].nvidia;
    if (prevDiff !== 0 && Math.sign(prevDiff) !== Math.sign(currDiff)) {
      return points[i].month;
    }
  }
  return null;
}

export interface EquivalentThroughputResult {
  needsMoreGpus: boolean;
  requiredAmdGpus: number;
  extraGpus: number;
  equivalentMonthlyCost: number;
  equivalentAnnualCost: number;
  stillCheaperAtParity: boolean;
}

/**
 * If AMD's per-GPU throughput trails NVIDIA's for this workload, AMD needs
 * additional GPUs to match NVIDIA's total throughput. This recomputes AMD's
 * cost at that GPU count so the "money shot" savings figure reflects true
 * equivalent-throughput economics, not just equal GPU counts.
 */
export function equivalentThroughputComparison(
  config: WorkloadConfig,
  amd: VendorResult,
  nvidia: VendorResult
): EquivalentThroughputResult {
  if (amd.throughputPerGpu <= 0 || nvidia.totalThroughput <= 0) {
    return {
      needsMoreGpus: false,
      requiredAmdGpus: config.numGpus,
      extraGpus: 0,
      equivalentMonthlyCost: amd.monthlyCost,
      equivalentAnnualCost: amd.annualCost,
      stillCheaperAtParity: amd.monthlyCost <= nvidia.monthlyCost,
    };
  }

  const requiredAmdGpus = Math.ceil(nvidia.totalThroughput / amd.throughputPerGpu);
  const needsMoreGpus = requiredAmdGpus > config.numGpus;

  if (!needsMoreGpus) {
    return {
      needsMoreGpus: false,
      requiredAmdGpus: config.numGpus,
      extraGpus: 0,
      equivalentMonthlyCost: amd.monthlyCost,
      equivalentAnnualCost: amd.annualCost,
      stillCheaperAtParity: amd.monthlyCost <= nvidia.monthlyCost,
    };
  }

  const scaledConfig = { ...config, numGpus: requiredAmdGpus };
  const scaledAmd = calculateVendor("AMD", scaledConfig);

  return {
    needsMoreGpus: true,
    requiredAmdGpus,
    extraGpus: requiredAmdGpus - config.numGpus,
    equivalentMonthlyCost: scaledAmd.monthlyCost,
    equivalentAnnualCost: scaledAmd.annualCost,
    stillCheaperAtParity: scaledAmd.monthlyCost <= nvidia.monthlyCost,
  };
}

export interface WorkloadCostPoint {
  workloadType: WorkloadConfig["workloadType"];
  amd: number;
  nvidia: number;
}

/**
 * Cost per million throughput-units (tokens for LLM/RAG workloads, images for
 * Image Generation, frames for Computer Vision) across all five workload
 * types, holding model size, deployment mode, GPU count and usage hours
 * constant — used to compare vendor economics workload-by-workload.
 */
export function costPerMillionUnitsAcrossWorkloads(config: WorkloadConfig): WorkloadCostPoint[] {
  const workloadTypes: WorkloadConfig["workloadType"][] = [
    "LLM Training",
    "LLM Inference",
    "Image Generation",
    "Computer Vision",
    "RAG Pipeline",
  ];

  return workloadTypes.map((workloadType) => {
    const scopedConfig = { ...config, workloadType };
    const amd = calculateVendor("AMD", scopedConfig);
    const nvidia = calculateVendor("NVIDIA", scopedConfig);
    const monthlyHours = config.dailyUsageHours * DAYS_PER_MONTH;

    const costPerMillion = (vendorResult: VendorResult) => {
      if (vendorResult.totalThroughput <= 0 || vendorResult.monthlyCost <= 0) return 0;
      const unitsPerMonth = vendorResult.totalThroughput * monthlyHours * 3600;
      return vendorResult.monthlyCost / (unitsPerMonth / 1_000_000);
    };

    return {
      workloadType,
      amd: costPerMillion(amd),
      nvidia: costPerMillion(nvidia),
    };
  });
}
