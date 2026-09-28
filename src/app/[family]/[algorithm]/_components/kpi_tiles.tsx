export type Kpi = { label: string; value: string | number; unit?: string; sub: string; isOn?: boolean };

export default function KpiTiles({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-5 gap-[1rem]">
      {kpis.map((kpi) => (
        <div key={kpi.label} className={`flex flex-col gap-[0.4rem] rounded-[1rem] border px-[1.4rem] py-[1.1rem] ${kpi.isOn ? "border-primary bg-primary text-white" : "border-line bg-surface text-text"}`}>
          <span className="font-mono text-[1rem] tracking-[0.08em] opacity-80">{kpi.label}</span>
          <div className="flex items-baseline gap-[0.6rem]">
            <span className="font-mono text-[2.4rem] leading-none font-semibold">{kpi.value}</span>
            {kpi.unit && <span className="font-mono text-[1.1rem] opacity-75">{kpi.unit}</span>}
          </div>
          <span className="text-[1.15rem] opacity-80">{kpi.sub}</span>
        </div>
      ))}
    </div>
  );
}
