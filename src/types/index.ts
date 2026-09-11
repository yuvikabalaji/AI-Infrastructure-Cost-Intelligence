export type WorkloadType =
  | "LLM Training"
  | "LLM Inference"
  | "Image Generation"
  | "Computer Vision"
  | "RAG Pipeline";

export type ModelSize = "7B" | "13B" | "34B" | "70B" | "180B+";

export type DeploymentMode = "cloud" | "onprem";

export type ContractLength = "Monthly" | "1 Year" | "3 Year";

export type CloudProvider = "Azure" | "Google Cloud" | "Oracle Cloud" | "AWS";

export type Vendor = "AMD" | "NVIDIA";

export interface WorkloadConfig {
  workloadType: WorkloadType;
  modelSize: ModelSize;
  deploymentMode: DeploymentMode;
  numGpus: number;
  dailyUsageHours: number;
  contractLength: ContractLength;
  cloudProvider: CloudProvider;
  includePowerCosts: boolean;
  powerCostPerKwh: number;
  dataCenterPue: number;
}

export interface VendorResult {
  vendor: Vendor;
  gpuModel: string;
  hardwareCostPerGpu: number | null;
  cloudCostPerGpuHour: number | null;
  totalHardwareCost: number;
  monthlyPowerCost: number;
  monthlyCost: number;
  annualCost: number;
  threeYearCost: number;
  throughputPerGpu: number;
  totalThroughput: number;
  costPerMillionUnits: number | null;
  costUnitLabel: string;
  tdpWatts: number;
  contractDiscount: number;
}
