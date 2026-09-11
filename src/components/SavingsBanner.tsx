import type { EquivalentThroughputResult, Savings } from "../lib/calculations";
import { formatCurrency, formatNumber } from "../lib/format";

export function SavingsBanner({
  savings,
  equivalent,
}: {
  savings: Savings;
  equivalent: EquivalentThroughputResult;
}) {
  const winner = savings.amdCheaper ? "AMD" : "NVIDIA";
  const winnerColor = savings.amdCheaper ? "#ED1C24" : "#76B900";
  const winnerBg = savings.amdCheaper ? "rgba(237,28,36,0.10)" : "rgba(118,185,0,0.10)";
  const winnerBorder = savings.amdCheaper ? "rgba(237,28,36,0.4)" : "rgba(118,185,0,0.4)";
  const monthly = Math.abs(savings.monthlySavings);
  const annual = Math.abs(savings.annualSavings);
  const pct = Math.abs(savings.percentSavings);

  return (
    <div
      className="rounded-xl border-2 p-6 relative overflow-hidden"
      style={{ background: winnerBg, borderColor: winnerBorder }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-text-dim font-semibold mb-1">
            TCO Verdict
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text leading-tight">
            <span style={{ color: winnerColor }}>{winner}</span> saves you{" "}
            <span style={{ color: winnerColor }}>{formatCurrency(monthly)}</span> per month
          </h2>
          <p className="text-text-dim text-sm mt-1">
            {formatCurrency(annual)} per year &middot; {formatNumber(pct, 1)}% lower TCO vs{" "}
            {savings.amdCheaper ? "NVIDIA" : "AMD"} for this workload configuration
          </p>
        </div>
        <div className="flex gap-6 md:text-right shrink-0">
          <StatBlock label="Monthly Savings" value={formatCurrency(monthly)} color={winnerColor} />
          <StatBlock label="Annual Savings" value={formatCurrency(annual)} color={winnerColor} />
          <StatBlock label="Savings %" value={`${formatNumber(pct, 1)}%`} color={winnerColor} />
        </div>
      </div>

      {equivalent.needsMoreGpus && (
        <div className="mt-4 pt-4 border-t border-border/60">
          <p className="text-sm text-text-dim">
            <span className="font-semibold text-text">Breakeven note:</span> AMD GPUs deliver less
            throughput per unit for this workload, so matching NVIDIA's total throughput requires{" "}
            <span className="font-semibold text-text">{equivalent.extraGpus} additional AMD GPU{equivalent.extraGpus === 1 ? "" : "s"}</span>{" "}
            ({equivalent.requiredAmdGpus} total). At equivalent throughput, AMD's monthly cost is{" "}
            <span className="font-semibold" style={{ color: equivalent.stillCheaperAtParity ? "#76B900" : "#ED1C24" }}>
              {formatCurrency(equivalent.equivalentMonthlyCost)}
            </span>{" "}
            &mdash; {equivalent.stillCheaperAtParity ? "still cheaper than" : "more expensive than"}{" "}
            NVIDIA at parity throughput.
          </p>
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-xs text-text-faint uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
