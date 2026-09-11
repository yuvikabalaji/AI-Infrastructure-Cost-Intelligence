import { useState } from "react";

export function Methodology() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-text">Methodology &amp; Data Sources</span>
        <svg
          className={`w-4 h-4 text-text-dim transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 text-sm text-text-dim border-t border-border pt-4">
          <section>
            <h4 className="text-text font-semibold mb-1">Hardware pricing</h4>
            <p>
              On-premises unit prices ($15,000 for AMD MI300X, $32,000 for NVIDIA H100 SXM,
              $38,000 for NVIDIA H200) are planning estimates derived from AMD and NVIDIA public
              spec sheets and typical enterprise reseller pricing. Actual procurement pricing
              varies by volume, OEM partner, and negotiated enterprise agreements.
            </p>
          </section>

          <section>
            <h4 className="text-text font-semibold mb-1">Cloud GPU-hour pricing</h4>
            <p>
              Hourly rates for Azure (ND MI300X v5 / ND H100 v5), Google Cloud (A3 series),
              Oracle Cloud Infrastructure (Bare Metal GPU shapes), and AWS (p5 instances) are
              approximate on-demand rates rounded to the nearest $0.10, sourced from each
              provider's public pricing pages. AWS does not currently publish a general-purpose
              MI300X instance offering.
            </p>
          </section>

          <section>
            <h4 className="text-text font-semibold mb-1">Throughput modeling</h4>
            <p>
              Baseline throughput (Llama 70B inference) is 2,800 tokens/sec for MI300X and
              2,200 tokens/sec for H100, based on vendor-disclosed MLPerf Inference and internal
              benchmark figures. Throughput scales by a model-size multiplier (7B: 4x, 13B: 3x,
              34B: 1.5x, 70B: 1x baseline, 180B+: 0.4x) and a workload adjustment factor that
              reflects each architecture's relative strength — NVIDIA retains an edge in Image
              Generation (AMD 0.85x) and Computer Vision (AMD 0.95x) workloads, while AMD's
              larger HBM3 capacity favors LLM Training (AMD 1.1x) and RAG Pipeline (AMD 1.05x)
              workloads.
            </p>
          </section>

          <section>
            <h4 className="text-text font-semibold mb-1">Contract length &amp; discounting</h4>
            <p>
              Cloud rates apply an illustrative reserved-capacity discount (0% Monthly, 18% for
              1-Year, 32% for 3-Year commitments), modeled on published reserved-instance
              discount tiers. On-premises hardware cost is amortized over 12 months for Monthly
              and 1-Year contracts and 36 months for 3-Year contracts, reflecting standard
              capex-to-opex depreciation conventions rather than a specific vendor policy.
            </p>
          </section>

          <section>
            <h4 className="text-text font-semibold mb-1">Power &amp; facility costs</h4>
            <p>
              On-premises power draw uses each GPU's rated TDP (750W MI300X, 700W H100/H200),
              multiplied by usage hours, the configured Data Center PUE (default 1.4, a typical
              enterprise data center efficiency figure), and the user-supplied $/kWh rate.
            </p>
          </section>

          <section>
            <h4 className="text-text font-semibold mb-1">Cost per million units</h4>
            <p>
              Computed as total monthly cost divided by total monthly throughput (throughput per
              GPU &times; GPU count &times; monthly usage seconds), expressed per million tokens,
              images, or frames depending on workload type.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
