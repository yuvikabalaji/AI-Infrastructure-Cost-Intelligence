import type {
  CloudProvider,
  ContractLength,
  DeploymentMode,
  ModelSize,
  WorkloadConfig,
  WorkloadType,
} from "../types";
import { FieldLabel, NumberInput, Select, SimpleToggle, Slider, ToggleSwitch } from "./ui";

const WORKLOAD_TYPES: WorkloadType[] = [
  "LLM Training",
  "LLM Inference",
  "Image Generation",
  "Computer Vision",
  "RAG Pipeline",
];
const MODEL_SIZES: ModelSize[] = ["7B", "13B", "34B", "70B", "180B+"];
const CONTRACT_LENGTHS: ContractLength[] = ["Monthly", "1 Year", "3 Year"];
const CLOUD_PROVIDERS: CloudProvider[] = ["Azure", "Google Cloud", "Oracle Cloud", "AWS"];

export function WorkloadConfigurator({
  config,
  onChange,
}: {
  config: WorkloadConfig;
  onChange: (patch: Partial<WorkloadConfig>) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
      <div className="flex items-center gap-2 pb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
        <h2 className="text-sm font-semibold text-text uppercase tracking-wide">
          Workload Configurator
        </h2>
      </div>

      <div>
        <FieldLabel>Workload Type</FieldLabel>
        <Select
          value={config.workloadType}
          onChange={(v) => onChange({ workloadType: v as WorkloadType })}
          options={WORKLOAD_TYPES}
        />
      </div>

      <div>
        <FieldLabel>Model Size</FieldLabel>
        <Select
          value={config.modelSize}
          onChange={(v) => onChange({ modelSize: v as ModelSize })}
          options={MODEL_SIZES}
        />
      </div>

      <div>
        <FieldLabel>Deployment Mode</FieldLabel>
        <ToggleSwitch
          checked={config.deploymentMode === "onprem"}
          onChange={(v) => onChange({ deploymentMode: v ? "onprem" : ("cloud" as DeploymentMode) })}
          leftLabel="Cloud"
          rightLabel="On-Premises"
        />
      </div>

      <div>
        <FieldLabel>Number of GPUs</FieldLabel>
        <Slider
          value={config.numGpus}
          min={1}
          max={512}
          onChange={(v) => onChange({ numGpus: v })}
        />
      </div>

      <div>
        <FieldLabel>Daily Usage Hours</FieldLabel>
        <Slider
          value={config.dailyUsageHours}
          min={1}
          max={24}
          onChange={(v) => onChange({ dailyUsageHours: v })}
          formatValue={(v) => `${v}h`}
        />
      </div>

      <div>
        <FieldLabel>Contract Length</FieldLabel>
        <Select
          value={config.contractLength}
          onChange={(v) => onChange({ contractLength: v as ContractLength })}
          options={CONTRACT_LENGTHS}
        />
      </div>

      {config.deploymentMode === "cloud" ? (
        <div className="pt-1 border-t border-border space-y-5">
          <div className="pt-4">
            <FieldLabel>Cloud Provider</FieldLabel>
            <Select
              value={config.cloudProvider}
              onChange={(v) => onChange({ cloudProvider: v as CloudProvider })}
              options={CLOUD_PROVIDERS}
            />
          </div>
        </div>
      ) : (
        <div className="pt-1 border-t border-border space-y-5">
          <div className="pt-4">
            <FieldLabel>Include Power Costs</FieldLabel>
            <SimpleToggle
              checked={config.includePowerCosts}
              onChange={(v) => onChange({ includePowerCosts: v })}
              label={config.includePowerCosts ? "Included in TCO" : "Excluded from TCO"}
            />
          </div>

          {config.includePowerCosts && (
            <>
              <div>
                <FieldLabel>Power Cost per kWh</FieldLabel>
                <NumberInput
                  value={config.powerCostPerKwh}
                  onChange={(v) => onChange({ powerCostPerKwh: v })}
                  prefix="$"
                  step={0.01}
                />
              </div>
              <div>
                <FieldLabel hint="Power Usage Effectiveness">Data Center PUE</FieldLabel>
                <NumberInput
                  value={config.dataCenterPue}
                  onChange={(v) => onChange({ dataCenterPue: v })}
                  step={0.05}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
