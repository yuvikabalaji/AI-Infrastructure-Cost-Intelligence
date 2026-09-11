# AI Infrastructure Cost Intelligence

An enterprise TCO calculator that helps AI infrastructure teams model and compare compute costs across AMD and NVIDIA GPU platforms — across cloud and on-premises deployments — for the AI workloads that actually drive procurement decisions.

**Compare AMD vs NVIDIA TCO for Enterprise AI Workloads.**

## What it does

Configure a workload — LLM training, LLM inference, image generation, computer vision, or a RAG pipeline — at a given model size, GPU count, usage pattern, and contract length, and instantly see:

- **Side-by-side AMD vs NVIDIA cost cards**, covering hardware cost (on-prem) or GPU-hour rate (cloud), monthly/annual TCO, cost per million tokens (or images/frames), and estimated throughput.
- **A savings banner** — the "money shot" — showing which vendor wins for the configured workload, in dollars per month/year and as a percentage, with a breakeven note when AMD would need additional GPUs to match NVIDIA's throughput.
- **Three charts**: monthly cost comparison, a 3-year cumulative cost projection (with crossover point when one exists), and cost-per-million-units across all five workload types.
- **A methodology panel** documenting every pricing assumption and its source, so the numbers can be sanity-checked before anyone takes them into a procurement conversation.

All calculations update in real time as inputs change — nothing requires a submit button or a page reload.

## Deployment modes

- **Cloud**: pick a provider (Azure, Google Cloud, Oracle Cloud, or AWS) and get realistic per-GPU-hour pricing, with reserved-capacity discounts applied for 1-year and 3-year commitments.
- **On-premises**: model hardware capex (amortized over the contract term), optional power costs (driven by GPU TDP, data center PUE, and $/kWh), and see the full blended monthly run rate.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for build tooling
- [Tailwind CSS v4](https://tailwindcss.com/) for styling (dark enterprise theme)
- [Recharts](https://recharts.org/) for data visualization

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Deployment

Deploy-ready for [Vercel](https://vercel.com/) with zero configuration — Vercel auto-detects the Vite framework preset. Connect this repository in the Vercel dashboard, or deploy from the CLI:

```bash
npx vercel
```

## Data sources & assumptions

All GPU pricing, cloud rates, and throughput figures are hardcoded planning estimates, not live pricing feeds — sourced from AMD and NVIDIA public spec sheets and public cloud provider rate cards, current as of 2026. Every figure and modeling assumption (reserved-discount tiers, hardware amortization schedule, power cost modeling, throughput scaling by model size and workload type) is documented in-app under **Methodology & Data Sources**.

**Actual costs may vary. Consult vendor pricing for production deployments.**

---

Built by Yuvika Balaji | Pricing estimates based on public cloud rates and vendor specifications as of 2026. For planning purposes only.
