import { useMemo, useState } from "react";
import { DEFAULT_CONFIG } from "./data/defaults";
import type { WorkloadConfig } from "./types";
import {
  calculateSavings,
  calculateVendor,
  equivalentThroughputComparison,
} from "./lib/calculations";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { WorkloadConfigurator } from "./components/WorkloadConfigurator";
import { VendorCard } from "./components/VendorCard";
import { SavingsBanner } from "./components/SavingsBanner";
import { ChartsPanel } from "./components/ChartsPanel";
import { Methodology } from "./components/Methodology";

function App() {
  const [config, setConfig] = useState<WorkloadConfig>(DEFAULT_CONFIG);

  function updateConfig(patch: Partial<WorkloadConfig>) {
    setConfig((prev) => ({ ...prev, ...patch }));
  }

  const amd = useMemo(() => calculateVendor("AMD", config), [config]);
  const nvidia = useMemo(() => calculateVendor("NVIDIA", config), [config]);
  const savings = useMemo(() => calculateSavings(amd, nvidia), [amd, nvidia]);
  const equivalent = useMemo(
    () => equivalentThroughputComparison(config, amd, nvidia),
    [config, amd, nvidia]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header config={config} amd={amd} nvidia={nvidia} savings={savings} />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          <div className="lg:sticky lg:top-6">
            <WorkloadConfigurator config={config} onChange={updateConfig} />
          </div>

          <div className="space-y-6">
            <SavingsBanner savings={savings} equivalent={equivalent} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VendorCard result={amd} config={config} isBetter={savings.amdCheaper} />
              <VendorCard result={nvidia} config={config} isBetter={!savings.amdCheaper} />
            </div>

            <ChartsPanel config={config} amd={amd} nvidia={nvidia} />

            <Methodology />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
