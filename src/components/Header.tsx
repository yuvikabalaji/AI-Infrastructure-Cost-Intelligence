import { useState } from "react";
import type { Savings } from "../lib/calculations";
import type { VendorResult, WorkloadConfig } from "../types";
import { formatCurrency, formatNumber } from "../lib/format";

export function Header({
  config,
  amd,
  nvidia,
  savings,
}: {
  config: WorkloadConfig;
  amd: VendorResult;
  nvidia: VendorResult;
  savings: Savings;
}) {
  const [copied, setCopied] = useState(false);

  async function handleExport() {
    const winner = savings.amdCheaper ? "AMD" : "NVIDIA";
    const summary = `AI Infrastructure Cost Intelligence — TCO Summary
Workload: ${config.workloadType} | Model: ${config.modelSize} | GPUs: ${config.numGpus} | Deployment: ${config.deploymentMode === "cloud" ? `Cloud (${config.cloudProvider})` : "On-Premises"} | Contract: ${config.contractLength}

AMD (${amd.gpuModel})
  Monthly cost: ${formatCurrency(amd.monthlyCost)}
  Annual cost: ${formatCurrency(amd.annualCost)}
  Cost per million ${amd.costUnitLabel}: ${amd.costPerMillionUnits ? formatCurrency(amd.costPerMillionUnits, { decimals: 2 }) : "N/A"}

NVIDIA (${nvidia.gpuModel})
  Monthly cost: ${formatCurrency(nvidia.monthlyCost)}
  Annual cost: ${formatCurrency(nvidia.annualCost)}
  Cost per million ${nvidia.costUnitLabel}: ${nvidia.costPerMillionUnits ? formatCurrency(nvidia.costPerMillionUnits, { decimals: 2 }) : "N/A"}

Verdict: ${winner} saves ${formatCurrency(Math.abs(savings.monthlySavings))}/month (${formatCurrency(Math.abs(savings.annualSavings))}/year, ${formatNumber(Math.abs(savings.percentSavings), 1)}% lower TCO)

Estimates for planning purposes only — consult vendor pricing for production deployments.`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <header className="border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text tracking-tight">
            AI Infrastructure Cost Intelligence
          </h1>
          <p className="text-sm text-text-dim mt-1">
            Compare AMD vs NVIDIA TCO for Enterprise AI Workloads
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors shrink-0 self-start md:self-auto"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied to clipboard
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Export Summary
            </>
          )}
        </button>
      </div>
    </header>
  );
}
