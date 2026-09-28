"use client";

// Controllers
import { useLanguageController, useRunsController } from "@/core/controllers";
// Models
import { ALGORITHMS, algorithmPath, FAMILIES, TRANSLATIONS } from "@/core/models";
// Components
import { KpiTiles, type Kpi } from "@/components";
import RankedList, { type RankedRow } from "./ranked_list";
// Utils
import { formatNumber, timeAgo } from "@/utils/format";

// Everything the visitor has played to the end, ranked: five tiles with a formula each, then three lists.
export default function RunsDashboard() {
  const lang = useLanguageController((state) => state.lang);
  const runs = useRunsController((state) => state.runs);
  const clearRuns = useRunsController((state) => state.clearRuns);

  const t = TRANSLATIONS[lang];
  const today = new Date().toDateString();
  const runsToday = runs.filter((run) => new Date(run.at).toDateString() === today).length;
  const algorithmsRun = new Set(runs.map((run) => run.algorithm));
  const familiesRun = new Set(runs.map((run) => ALGORITHMS[run.algorithm].family));
  const totalSteps = runs.reduce((sum, run) => sum + run.steps, 0);
  const longest = runs.reduce((best, run) => (run.steps > best.steps ? run : best), runs[0]);
  const withUrl = (run: { algorithm: keyof typeof ALGORITHMS; n: number; seed: number }) => `${algorithmPath(ALGORITHMS[run.algorithm])}?n=${run.n}&seed=${run.seed}`;

  const kpis: Kpi[] = [
    { label: t.kRuns, value: formatNumber(runs.length, lang), sub: t.kRunsSub, delta: runsToday ? `+${runsToday} ${t.today}` : undefined, isOn: true, info: { title: t.kRuns, body: t.fRuns } },
    { label: t.kAlgorithms, value: algorithmsRun.size, unit: `/ ${Object.keys(ALGORITHMS).length}`, sub: t.kAlgorithmsSub, info: { title: t.kAlgorithms, body: t.fAlgorithms } },
    { label: t.kSteps, value: formatNumber(totalSteps, lang), sub: t.kStepsSub, info: { title: t.kSteps, body: t.fSteps } },
    { label: t.kFamiliesRun, value: familiesRun.size, unit: `/ ${FAMILIES.length}`, sub: t.kFamiliesRunSub, info: { title: t.kFamiliesRun, body: t.fFamilies } },
    { label: t.kLongest, value: longest ? formatNumber(longest.steps, lang) : "—", unit: longest ? ALGORITHMS[longest.algorithm].name : undefined, sub: t.kLongestSub, info: { title: t.kLongest, body: t.fLongest } },
  ];

  const counts = new Map<string, number>();
  runs.forEach((run) => counts.set(run.algorithm, (counts.get(run.algorithm) ?? 0) + 1));
  const mostRun: RankedRow[] = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, count]) => {
      const algorithm = ALGORITHMS[id as keyof typeof ALGORITHMS];
      return { key: id, name: algorithm.name, meta: `/${algorithm.family}`, value: count, valueText: `${count} ${count === 1 ? t.runUnit : t.runsUnit}`, href: algorithmPath(algorithm) };
    });
  const recent: RankedRow[] = runs.slice(0, 6).map((run, index) => ({ key: `${run.at}-${index}`, name: ALGORITHMS[run.algorithm].name, meta: `n = ${run.n} · ${timeAgo(run.at, lang)}`, value: run.steps, valueText: `${formatNumber(run.steps, lang)} ${t.stepsUnit}`, href: withUrl(run) }));
  const biggest: RankedRow[] = [...runs]
    .sort((a, b) => b.steps - a.steps)
    .slice(0, 6)
    .map((run, index) => ({ key: `${run.at}-${index}`, name: ALGORITHMS[run.algorithm].name, meta: `n = ${run.n} · seed ${run.seed}`, value: run.steps, valueText: `${formatNumber(run.steps, lang)} ${t.stepsUnit}`, href: withUrl(run) }));

  return (
    <section className="flex flex-col gap-[1.4rem]">
      <div className="flex items-end gap-[1.2rem]">
        <div className="flex flex-col gap-[0.4rem]">
          <span className="font-mono text-[1.1rem] tracking-[0.1em] text-violet">{`// ${t.runsKicker}`}</span>
          <h2 className="text-[1.6rem] font-semibold">{t.runsTitle}</h2>
        </div>
        <div className="flex-1" />
        <span className="text-[1.25rem] text-muted">{t.runsHint}</span>
        {runs.length > 0 && (
          <button type="button" onClick={clearRuns} className="btn-outline h-[2.8rem] px-[1rem] text-[1.15rem]">
            {t.clearRuns}
          </button>
        )}
      </div>
      <KpiTiles kpis={kpis} />
      <div className="grid grid-cols-3 gap-[1.4rem]">
        <RankedList title={t.mostRun} rows={mostRun} empty={t.noRuns} />
        <RankedList title={t.recentRuns} rows={recent} empty={t.noRuns} />
        <RankedList title={t.biggestRuns} rows={biggest} empty={t.noRuns} />
      </div>
    </section>
  );
}
