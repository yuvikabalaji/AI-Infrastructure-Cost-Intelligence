import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { VendorResult, WorkloadConfig } from "../types";
import {
  costPerMillionUnitsAcrossWorkloads,
  findCrossoverMonth,
  threeYearProjection,
} from "../lib/calculations";
import { formatCompact, formatCurrency } from "../lib/format";

const AMD_COLOR = "#ED1C24";
const NVIDIA_COLOR = "#76B900";

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text mb-0.5">{title}</h3>
      {subtitle && <p className="text-xs text-text-faint mb-4">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-4"}>{children}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a20] border border-border-light rounded-lg px-3 py-2 shadow-xl text-xs">
      {label !== undefined && <p className="text-text-dim mb-1 font-medium">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export function ChartsPanel({
  config,
  amd,
  nvidia,
}: {
  config: WorkloadConfig;
  amd: VendorResult;
  nvidia: VendorResult;
}) {
  const monthlyData = [
    { name: "Monthly Cost", AMD: amd.monthlyCost, NVIDIA: nvidia.monthlyCost },
  ];

  const projection = threeYearProjection(amd, nvidia);
  const crossoverMonth = findCrossoverMonth(projection);

  const workloadCosts = costPerMillionUnitsAcrossWorkloads(config).map((p) => ({
    name: p.workloadType.replace(" Pipeline", "").replace(" Generation", " Gen").replace("Computer Vision", "Comp. Vision"),
    AMD: Math.round(p.amd * 100) / 100,
    NVIDIA: Math.round(p.nvidia * 100) / 100,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Monthly Cost Comparison" subtitle="Current configuration">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} barGap={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#9a9aa5", fontSize: 12 }} axisLine={{ stroke: "#2a2a35" }} tickLine={false} />
            <YAxis
              tick={{ fill: "#9a9aa5", fontSize: 12 }}
              axisLine={{ stroke: "#2a2a35" }}
              tickLine={false}
              tickFormatter={(v) => formatCompact(v)}
            />
            <Tooltip content={<CustomTooltip formatter={(v: number) => formatCurrency(v)} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#9a9aa5" }} />
            <Bar dataKey="AMD" fill={AMD_COLOR} radius={[6, 6, 0, 0]} maxBarSize={80} />
            <Bar dataKey="NVIDIA" fill={NVIDIA_COLOR} radius={[6, 6, 0, 0]} maxBarSize={80} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="3-Year Cumulative Cost Projection"
        subtitle={
          crossoverMonth
            ? `Cost crossover at month ${crossoverMonth}`
            : "No crossover within 3-year horizon"
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={projection} margin={{ left: 4, right: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#9a9aa5", fontSize: 11 }}
              axisLine={{ stroke: "#2a2a35" }}
              tickLine={false}
              tickFormatter={(m) => (m % 6 === 0 ? `${m}mo` : "")}
              interval={0}
            />
            <YAxis
              tick={{ fill: "#9a9aa5", fontSize: 12 }}
              axisLine={{ stroke: "#2a2a35" }}
              tickLine={false}
              tickFormatter={(v) => formatCompact(v)}
            />
            <Tooltip
              content={<CustomTooltip formatter={(v: number) => formatCurrency(v)} />}
              labelFormatter={(m) => `Month ${m}`}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#9a9aa5" }} />
            {crossoverMonth && (
              <ReferenceLine x={crossoverMonth} stroke="#6366f1" strokeDasharray="4 4" />
            )}
            <Line type="monotone" dataKey="amd" stroke={AMD_COLOR} strokeWidth={2.5} dot={false} name="AMD" />
            <Line type="monotone" dataKey="nvidia" stroke={NVIDIA_COLOR} strokeWidth={2.5} dot={false} name="NVIDIA" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="lg:col-span-2">
      <ChartCard
        title="Cost per Million Units Across Workload Types"
        subtitle="Tokens (LLM/RAG), images (Image Gen), frames (Computer Vision) — model size, GPUs & hours held constant"
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={workloadCosts} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#9a9aa5", fontSize: 11 }}
              axisLine={{ stroke: "#2a2a35" }}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fill: "#9a9aa5", fontSize: 12 }}
              axisLine={{ stroke: "#2a2a35" }}
              tickLine={false}
              tickFormatter={(v) => `$${formatCompact(v)}`}
            />
            <Tooltip content={<CustomTooltip formatter={(v: number) => formatCurrency(v, { decimals: 2 })} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#9a9aa5" }} />
            <Bar dataKey="AMD" fill={AMD_COLOR} radius={[6, 6, 0, 0]} maxBarSize={40} />
            <Bar dataKey="NVIDIA" fill={NVIDIA_COLOR} radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      </div>
    </div>
  );
}
