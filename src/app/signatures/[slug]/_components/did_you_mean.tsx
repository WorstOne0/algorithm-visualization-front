"use client";

// Next
import { useCallback, useEffect, useMemo, useState } from "react";
// Controllers
import { useLanguageController, useThemeController } from "@/core/controllers";
import { useSignaturePlayerController } from "../_controllers/signature_player_controller";
// Models
import { recordDidYouMean, type EditWeights } from "@/core/algorithms/signatures/did_you_mean";
import { localize, type Localized, type Signature, type VizKey } from "@/core/models";
// Components
import { KpiTiles } from "@/components";
import NoteCard from "./note_card";
import SignatureShell from "./signature_shell";
import StepPlayer from "./step_player";
import TerminalCard, { type TerminalLine } from "./terminal_card";
// Utils
import { counterText } from "@/utils/format";
import { drawEditTable, setVizTheme, type Ctx } from "@/utils/viz";

const LEGEND: [VizKey, Localized][] = [["primary", { en: "row being filled", pt: "linha sendo preenchida" }], ["violet", { en: "answer cell", pt: "célula da resposta" }], ["def", { en: "filled", pt: "preenchida" }]];

const T = {
  en: { candidates: "CANDIDATES", candidatesSub: "git subcommands", compared: "COMPARED", comparedSub: "tables filled so far", cells: "CELLS", cellsSub: "computed, m × n each", best: "BEST DISTANCE", bestSub: "lowest so far", match: "MATCH", matchSub: "the suggestion", weights: "WEIGHTS", plain: "all edits cost 1", git: "git's weights", ranking: "RANKING", searching: "comparing" },
  pt: { candidates: "CANDIDATOS", candidatesSub: "subcomandos do git", compared: "COMPARADOS", comparedSub: "tabelas preenchidas até aqui", cells: "CÉLULAS", cellsSub: "calculadas, m × n cada", best: "MELHOR DISTÂNCIA", bestSub: "menor até aqui", match: "SUGESTÃO", matchSub: "o comando escolhido", weights: "PESOS", plain: "toda edição custa 1", git: "pesos do git", ranking: "RANKING", searching: "comparando" },
};

export default function DidYouMeanPage({ signature }: { signature: Signature }) {
  const lang = useLanguageController((state) => state.lang);
  const theme = useThemeController((state) => state.theme);
  const idx = useSignaturePlayerController((state) => state.idx);
  const restart = useSignaturePlayerController((state) => state.restart);
  const [text, setText] = useState("comit");
  const [weights, setWeights] = useState<EditWeights>("git");

  const t = T[lang];
  const typed = text.trim().toLowerCase().replace(/[^a-z-]/g, "") || "comit";
  const recording = useMemo(() => recordDidYouMean(typed, weights), [typed, weights]);
  const steps = recording.steps;
  const last = steps.length - 1;
  const step = steps[Math.min(idx, last)];
  const isDone = idx >= last;

  useEffect(() => {
    restart(true);
  }, [recording, restart]);

  const draw = useCallback(
    (ctx: Ctx, w: number, h: number) => {
      setVizTheme(theme);
      drawEditTable(ctx, w, h, step);
    },
    [step, theme]
  );

  const kpis = [
    { label: t.candidates, value: counterText(step.counters.candidates, lang), sub: t.candidatesSub, isOn: true },
    { label: t.compared, value: counterText(step.counters.compared, lang), sub: t.comparedSub },
    { label: t.cells, value: counterText(step.counters.cells, lang), sub: t.cellsSub },
    { label: t.best, value: counterText(step.counters.best, lang), sub: t.bestSub },
    { label: t.match, value: counterText(step.counters.match, lang), sub: t.matchSub },
  ];
  const worst = Math.max(1, ...step.ranking.map((entry) => entry.distance));
  const lines: TerminalLine[] = [{ text: `git ${typed}`, kind: "cmd" }];
  if (isDone && step.best) {
    lines.push({ text: `git: '${typed}' is not a git command. See 'git --help'.`, kind: "err" });
    if (step.suggested) {
      lines.push({ text: "" });
      lines.push({ text: "The most similar command is" });
      lines.push({ text: `        ${step.best.word}`, kind: "ok" });
    }
  } else lines.push({ text: `${t.searching} ${step.ranking.length} / ${counterText(step.counters.candidates, lang)}…`, kind: "dim" });

  const buildWeight = (id: EditWeights, label: string) => (
    <button type="button" onClick={() => setWeights(id)} className={`px-[1rem] py-[0.5rem] font-mono text-[1.1rem] ${weights === id ? "bg-primary-tint text-primary" : "text-muted hover:text-text"}`}>
      {label}
    </button>
  );

  return (
    <SignatureShell signature={signature}>
      <KpiTiles kpis={kpis} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-[1.2rem]">
        <StepPlayer legend={LEGEND} meta={localize(recording.meta, lang)} last={last} stepMs={140} draw={draw}>
          <span className="label">{t.weights}</span>
          <div className="flex overflow-hidden rounded-[0.6rem] border border-line-2">
            {buildWeight("plain", t.plain)}
            {buildWeight("git", t.git)}
          </div>
        </StepPlayer>
        <div className="flex min-h-0 flex-col gap-[1.2rem]">
          <div className="card flex flex-col gap-[1.2rem] px-[1.6rem] py-[1.4rem]">
            <div className="flex h-[4.2rem] items-center gap-[0.8rem] rounded-[0.8rem] border border-line-2 bg-side px-[1.4rem] font-mono text-[1.8rem]">
              <span className="text-faint">$ git</span>
              <input type="text" value={text} autoFocus spellCheck={false} onChange={(event) => setText(event.target.value.slice(0, 14))} className="w-full bg-transparent text-text outline-none" />
            </div>
            <div className="flex items-center gap-[1rem]">
              <span className="label">{t.ranking}</span>
            </div>
            <div className="flex flex-col gap-[0.5rem]">
              {step.ranking.slice(0, 8).map((entry, index) => (
                <div key={entry.word} className="grid grid-cols-[2rem_9rem_minmax(0,1fr)_3rem] items-center gap-[1rem] font-mono text-[1.2rem]">
                  <span className="text-[1.05rem] text-faint">{index + 1}</span>
                  <span className={index === 0 ? "font-semibold text-primary" : ""}>{entry.word}</span>
                  <div className="h-[0.8rem] overflow-hidden rounded-[0.4rem] bg-surface-2">
                    <div className={`h-full rounded-[0.4rem] ${index === 0 ? "bg-primary" : "bg-faint"}`} style={{ width: `${Math.max(4, 100 - (entry.distance / worst) * 96).toFixed(0)}%` }} />
                  </div>
                  <span className="text-right">{entry.distance}</span>
                </div>
              ))}
            </div>
          </div>
          <TerminalCard title="bash" lines={lines} minHeight={110} />
          <NoteCard note={localize(step.note, lang)} tag={step.candidate ? `"${typed}" × "${step.candidate}"` : undefined} />
        </div>
      </div>
    </SignatureShell>
  );
}
