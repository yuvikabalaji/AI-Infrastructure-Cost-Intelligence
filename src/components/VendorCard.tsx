import type { VendorResult, WorkloadConfig } from "../types";
import { formatCompact, formatCurrency, formatNumber } from "../lib/format";
import { HARDWARE } from "../data/pricing";

const CLOUD_SOURCE_LABEL: Record<WorkloadConfig["cloudProvider"], string> = {
  Azure: "Azure ND-series public pricing page",
  "Google Cloud": "Google Cloud A3 VM public pricing page",
  "Oracle Cloud": "OCI Bare Metal GPU public pricing page",
  AWS: "AWS p5 instance public pricing page",
};

const VENDOR_STYLES = {
  AMD: {
    accent: "#ED1C24",
    accentBg: "rgba(237, 28, 36, 0.08)",
    accentBorder: "rgba(237, 28, 36, 0.35)",
    logo: "AMD",
  },
  NVIDIA: {
    accent: "#76B900",
    accentBg: "rgba(118, 185, 0, 0.08)",
    accentBorder: "rgba(118, 185, 0, 0.35)",
    logo: "NVIDIA",
  },
} as const;

export function VendorCard({
  result,
  config,
  isBetter,
}: {
  result: VendorResult;
  config: WorkloadConfig;
  isBetter: boolean;
}) {
  const style = VENDOR_STYLES[result.vendor];
  const isCloud = config.deploymentMode === "cloud";
  const unavailable = isCloud && result.cloudCostPerGpuHour === null;

  return (
    <div
      className="rounded-xl border bg-card p-5 relative overflow-hidden"
      style={{ borderColor: style.accentBorder }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: style.accent }}
      />

      <div className="flex items-start justify-between mb-4">
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold tracking-wide mb-2"
            style={{ background: style.accentBg, color: style.accent }}
          >
            {style.logo}
          </div>
          <h3 className="text-lg font-semibold text-text leading-tight">{result.gpuModel}</h3>
        </div>
        {isBetter && !unavailable && (
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{ background: style.accentBg, color: style.accent }}
          >
            Best Value
          </span>
        )}
      </div>

      {unavailable ? (
        <div className="py-8 text-center">
          <p className="text-text-dim text-sm">
            {result.vendor} GPUs are not currently offered on {config.cloudProvider}.
          </p>
          <p className="text-text-faint text-xs mt-1">Select another provider to compare.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {config.deploymentMode === "onprem" ? (
              <Metric
                label="Hardware Cost / GPU"
                value={formatCurrency(result.hardwareCostPerGpu ?? 0)}
              />
            ) : (
              <Metric
                label="Cloud Cost / GPU-hr"
                value={formatCurrency(result.cloudCostPerGpuHour ?? 0, { decimals: 2 })}
              />
            )}
            <Metric
              label="Throughput / GPU"
              value={`${formatCompact(result.throughputPerGpu)} ${result.costUnitLabel === "tokens" ? "tok/s" : result.costUnitLabel === "images" ? "img/s" : "fr/s"}`}
            />
          </div>

          <div className="h-px bg-border" />

          <div className="grid grid-cols-2 gap-3">
            <Metric
              label="Monthly Cost"
              value={formatCurrency(result.monthlyCost)}
              emphasize
              color={style.accent}
            />
            <Metric
              label="Annual Cost"
              value={formatCurrency(result.annualCost)}
              emphasize
              color={style.accent}
            />
          </div>

          <div className="h-px bg-border" />

          <div className="grid grid-cols-2 gap-3">
            <Metric
              label={`Cost / Million ${capitalize(result.costUnitLabel)}`}
              value={result.costPerMillionUnits ? formatCurrency(result.costPerMillionUnits, { decimals: 2 }) : "—"}
            />
            <Metric
              label="Total Throughput"
              value={`${formatCompact(result.totalThroughput)}/s`}
            />
          </div>

          {config.deploymentMode === "onprem" && config.includePowerCosts && (
            <>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Monthly Power Cost" value={formatCurrency(result.monthlyPowerCost)} />
                <Metric label="TDP" value={`${formatNumber(result.tdpWatts)}W / GPU`} />
              </div>
            </>
          )}

          {result.contractDiscount > 0 && (
            <p className="text-xs text-text-faint pt-1">
              Includes {Math.round(result.contractDiscount * 100)}% reserved-commitment discount for{" "}
              {config.contractLength} contract.
            </p>
          )}

          <p className="text-[11px] text-text-faint/80 pt-1 border-t border-border/60 mt-1">
            Source:{" "}
            {config.deploymentMode === "onprem"
              ? HARDWARE[result.vendor].source
              : CLOUD_SOURCE_LABEL[config.cloudProvider]}
          </p>
        </div>
      )}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Metric({
  label,
  value,
  emphasize,
  color,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  color?: string;
}) {
  return (
    <div>
      <p className="text-xs text-text-faint uppercase tracking-wide mb-0.5">{label}</p>
      <p
        className={emphasize ? "text-xl font-bold" : "text-sm font-semibold text-text"}
        style={emphasize && color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
