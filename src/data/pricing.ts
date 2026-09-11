import type { CloudProvider, ModelSize, WorkloadType } from "../types";

/**
 * All figures below are hardcoded planning estimates, not live pricing feeds.
 * Sources are noted per block so procurement teams can independently verify
 * against current vendor/cloud price lists before making purchasing decisions.
 */

// ---------------------------------------------------------------------------
// On-premises hardware — source: AMD & NVIDIA public spec sheets (2025/2026),
// street/reseller pricing for enterprise SXM/OAM accelerators.
// ---------------------------------------------------------------------------
export const HARDWARE = {
  AMD: {
    gpuModel: "AMD Instinct MI300X",
    pricePerUnit: 15000,
    tdpWatts: 750,
    memoryGB: 192,
    memoryBandwidthTBs: 5.3,
    source: "AMD Instinct MI300X data sheet",
  },
  NVIDIA: {
    gpuModel: "NVIDIA H100 SXM",
    pricePerUnit: 32000,
    tdpWatts: 700,
    memoryGB: 80,
    memoryBandwidthTBs: 3.35,
    source: "NVIDIA H100 data sheet",
  },
  NVIDIA_H200: {
    gpuModel: "NVIDIA H200",
    pricePerUnit: 38000,
    tdpWatts: 700,
    memoryGB: 141,
    memoryBandwidthTBs: 4.8,
    source: "NVIDIA H200 data sheet",
  },
} as const;

// ---------------------------------------------------------------------------
// Cloud GPU-hour pricing — source: public on-demand rate cards published by
// each cloud provider for GPU-accelerated VM families (approximate, rounded).
// ---------------------------------------------------------------------------
export const CLOUD_PRICING: Record<CloudProvider, { AMD: number | null; NVIDIA: number }> = {
  Azure: { AMD: 3.2, NVIDIA: 5.5 },
  "Google Cloud": { AMD: 3.5, NVIDIA: 6.0 },
  "Oracle Cloud": { AMD: 2.8, NVIDIA: 4.8 },
  AWS: { AMD: null, NVIDIA: 5.8 },
};

export const CLOUD_INSTANCE_LABEL: Record<CloudProvider, { AMD: string; NVIDIA: string }> = {
  Azure: { AMD: "ND MI300X v5", NVIDIA: "ND H100 v5" },
  "Google Cloud": { AMD: "A3-MI300X (est.)", NVIDIA: "A3 Mega (H100)" },
  "Oracle Cloud": { AMD: "BM.GPU.MI300X.8", NVIDIA: "BM.GPU.H100.8" },
  AWS: { AMD: "Not offered", NVIDIA: "p5.48xlarge (H100)" },
};

export const CLOUD_SOURCE_NOTE =
  "Public on-demand rate cards (Azure ND-series, Google Cloud A3, OCI Bare Metal GPU, AWS p5), approximate and rounded to the nearest $0.10/GPU-hour.";

// ---------------------------------------------------------------------------
// Baseline LLM inference throughput (Llama 70B, tokens/sec per GPU) —
// source: vendor-published MLPerf Inference / internal benchmark disclosures.
// ---------------------------------------------------------------------------
export const BASELINE_THROUGHPUT_70B = {
  AMD: 2800,
  NVIDIA: 2200,
  NVIDIA_H200: 3100,
};

export const MODEL_SIZE_MULTIPLIER: Record<ModelSize, number> = {
  "7B": 4,
  "13B": 3,
  "34B": 1.5,
  "70B": 1,
  "180B+": 0.4,
};

export const WORKLOAD_ADJUSTMENT: Record<WorkloadType, { AMD: number; NVIDIA: number }> = {
  "LLM Training": { AMD: 1.1, NVIDIA: 1.0 },
  "LLM Inference": { AMD: 1.0, NVIDIA: 1.0 },
  "Image Generation": { AMD: 0.85, NVIDIA: 1.0 },
  "Computer Vision": { AMD: 0.95, NVIDIA: 1.0 },
  "RAG Pipeline": { AMD: 1.05, NVIDIA: 1.0 },
};

export const WORKLOAD_UNIT: Record<WorkloadType, string> = {
  "LLM Training": "tokens/sec (training throughput)",
  "LLM Inference": "tokens/sec",
  "Image Generation": "images/sec",
  "Computer Vision": "frames/sec",
  "RAG Pipeline": "tokens/sec (retrieval-augmented)",
};

// Reserved-capacity style discount applied to the effective hourly/amortized
// rate based on contract commitment length. Illustrative — modeled on the
// discount tiers typically published for reserved GPU capacity.
export const CONTRACT_DISCOUNT: Record<string, number> = {
  Monthly: 0,
  "1 Year": 0.18,
  "3 Year": 0.32,
};

// On-prem hardware amortization window (months) tied to contract commitment —
// shorter commitments recover capital faster and so carry a higher effective
// monthly hardware cost; this is a standard capex-to-opex modeling convention.
export const AMORTIZATION_MONTHS: Record<string, number> = {
  Monthly: 12,
  "1 Year": 12,
  "3 Year": 36,
};
