import type { WorkloadConfig } from "../types";

export const DEFAULT_CONFIG: WorkloadConfig = {
  workloadType: "LLM Inference",
  modelSize: "70B",
  deploymentMode: "cloud",
  numGpus: 8,
  dailyUsageHours: 24,
  contractLength: "1 Year",
  cloudProvider: "Azure",
  includePowerCosts: true,
  powerCostPerKwh: 0.1,
  dataCenterPue: 1.4,
};
