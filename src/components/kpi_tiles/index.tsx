"use client";

// Next
import { useState } from "react";
// Components
import InfoModal from "../info_modal";
// Icons
import { InfoIcon } from "../icons";

export type Kpi = { label: string; value: string | number; unit?: string; sub: string; delta?: string; isOn?: boolean; info?: { title: string; body: string[] } };

// The row of five tiles: mono label, big tabular number with its unit and delta, a sub line, an info corner when the number has a formula.
export default function KpiTiles({ kpis }: { kpis: Kpi[] }) {
  const [openInfo, setOpenInfo] = useState<Kpi["info"] | null>(null);

  return (
    <>
      <div className="grid grid-cols-5 gap-[1rem]">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`relative flex flex-col gap-[0.4rem] rounded-[1rem] border px-[1.4rem] py-[1.1rem] ${kpi.isOn ? "border-primary bg-primary text-white" : "border-line bg-surface text-text"}`}>
            <span className="font-mono text-[1rem] tracking-[0.08em] opacity-80">{kpi.label}</span>
            <div className="flex items-baseline gap-[0.6rem]">
              <span className="font-mono text-[2.4rem] leading-none font-semibold">{kpi.value}</span>
              {kpi.unit && <span className="font-mono text-[1.1rem] opacity-75">{kpi.unit}</span>}
              {kpi.delta && <span className={`font-mono text-[1.1rem] ${kpi.isOn ? "opacity-90" : "text-green"}`}>{kpi.delta}</span>}
            </div>
            <span className="text-[1.15rem] opacity-80">{kpi.sub}</span>
            {kpi.info && (
              <button type="button" aria-label={kpi.info.title} onClick={() => setOpenInfo(kpi.info)} className={`absolute top-[0.9rem] right-[0.9rem] flex h-[2.2rem] w-[2.2rem] items-center justify-center rounded-[0.5rem] ${kpi.isOn ? "text-white/70 hover:bg-white/15 hover:text-white" : "text-faint hover:bg-surface-2 hover:text-text"}`}>
                <InfoIcon />
              </button>
            )}
          </div>
        ))}
      </div>
      {openInfo && <InfoModal title={openInfo.title} body={openInfo.body} onClose={() => setOpenInfo(null)} />}
    </>
  );
}
