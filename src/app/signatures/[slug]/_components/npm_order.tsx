"use client";

// Next
import { useCallback, useEffect, useMemo, useState } from "react";
// Controllers
import { useLanguageController, useThemeController } from "@/core/controllers";
import { useSignaturePlayerController } from "../_controllers/signature_player_controller";
// Models
import { CYCLE_LINE, DEFAULT_PACKAGES, parsePackages, recordNpmOrder } from "@/core/algorithms/signatures/npm_order";
import { localize, TRANSLATIONS, type Localized, type Signature, type VizKey } from "@/core/models";
// Components
import { KpiTiles } from "@/components";
import NoteCard from "./note_card";
import SignatureShell from "./signature_shell";
import StepPlayer from "./step_player";
import TerminalCard, { type TerminalLine } from "./terminal_card";
// Utils
import { counterText } from "@/utils/format";
import { drawDag, setVizTheme, type Ctx } from "@/utils/viz";

const LEGEND: [VizKey, Localized][] = [["primary", { en: "ready (in the queue)", pt: "pronto (na fila)" }], ["act", { en: "installing", pt: "instalando" }], ["green", { en: "installed", pt: "instalado" }], ["neg", { en: "stuck in a cycle", pt: "preso num ciclo" }]];

const T = {
  en: { packages: "PACKAGES", packagesSub: "nodes of the graph", links: "DEPENDENCY LINKS", linksSub: "edges, package → dependency", installed: "INSTALLED", installedSub: "in topological order", queue: "QUEUE", queueSub: "ready, waiting for nothing", cycle: "CYCLE", cycleSub: "what stops the install", editor: "PACKAGE.JSON, ONE PER LINE", addCycle: "Add a cycle", hint: "name: dep, dep" },
  pt: { packages: "PACOTES", packagesSub: "nós do grafo", links: "LIGAÇÕES", linksSub: "arestas, pacote → dependência", installed: "INSTALADOS", installedSub: "em ordem topológica", queue: "FILA", queueSub: "prontos, sem esperar nada", cycle: "CICLO", cycleSub: "o que trava a instalação", editor: "PACKAGE.JSON, UM POR LINHA", addCycle: "Adicionar um ciclo", hint: "nome: dep, dep" },
};

export default function NpmOrderPage({ signature }: { signature: Signature }) {
  const lang = useLanguageController((state) => state.lang);
  const theme = useThemeController((state) => state.theme);
  const idx = useSignaturePlayerController((state) => state.idx);
  const restart = useSignaturePlayerController((state) => state.restart);
  const [text, setText] = useState(DEFAULT_PACKAGES);
  const [applied, setApplied] = useState(DEFAULT_PACKAGES);

  const t = T[lang];
  const shared = TRANSLATIONS[lang];
  const graph = useMemo(() => parsePackages(applied), [applied]);
  const recording = useMemo(() => recordNpmOrder(graph), [graph]);
  const steps = recording.steps;
  const last = steps.length - 1;
  const step = steps[Math.min(idx, last)];

  useEffect(() => {
    restart(true);
  }, [recording, restart]);

  const draw = useCallback(
    (ctx: Ctx, w: number, h: number) => {
      setVizTheme(theme);
      drawDag(ctx, w, h, step);
    },
    [step, theme]
  );

  const addCycle = () => {
    const next = text.includes(CYCLE_LINE) ? text : `${text.trimEnd()}\n${CYCLE_LINE}`;
    setText(next);
    setApplied(next);
  };
  const reset = () => {
    setText(DEFAULT_PACKAGES);
    setApplied(DEFAULT_PACKAGES);
  };

  const cycle = counterText(step.counters.cycle, lang);
  const kpis = [
    { label: t.packages, value: graph.pkgs.length, sub: t.packagesSub, isOn: true },
    { label: t.links, value: graph.edges.length, sub: t.linksSub },
    { label: t.installed, value: counterText(step.counters.installed, lang), unit: counterText(step.counters.installedUnit, lang), sub: t.installedSub },
    { label: t.queue, value: counterText(step.counters.queue, lang), sub: t.queueSub },
    { label: t.cycle, value: cycle === "—" ? "—" : "!", sub: cycle === "—" ? t.cycleSub : cycle },
  ];
  const lines: TerminalLine[] = step.log.map((line) => (line.startsWith("$") ? { text: line.slice(2), kind: "cmd" } : { text: line, kind: line.startsWith("npm ERR!") ? "err" : line.startsWith("added") ? "ok" : "dim" }));

  return (
    <SignatureShell signature={signature}>
      <KpiTiles kpis={kpis} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-[1.2rem]">
        <StepPlayer legend={LEGEND} meta={localize(recording.meta, lang)} last={last} stepMs={420} draw={draw}>
          <button type="button" onClick={addCycle} className="btn-outline h-[3rem] px-[1rem] text-[1.2rem]">
            {t.addCycle}
          </button>
          <button type="button" onClick={reset} className="btn-outline h-[3rem] px-[1rem] text-[1.2rem]">
            {shared.reset}
          </button>
        </StepPlayer>
        <div className="flex min-h-0 flex-col gap-[1.2rem]">
          <div className="card flex flex-col gap-[0.8rem] px-[1.6rem] py-[1.2rem]">
            <div className="flex items-center gap-[1rem]">
              <span className="label">{t.editor}</span>
              <div className="flex-1" />
              <span className="font-mono text-[1.05rem] text-faint">{t.hint}</span>
              <button type="button" onClick={() => setApplied(text)} className="btn-primary h-[2.8rem] px-[1.2rem] text-[1.15rem]">
                {shared.run}
              </button>
            </div>
            <textarea value={text} spellCheck={false} rows={9} onChange={(event) => setText(event.target.value)} className="w-full resize-none rounded-[0.8rem] border border-line-2 bg-side px-[1.2rem] py-[0.8rem] font-mono text-[1.15rem] leading-[1.6] text-text outline-none focus:border-primary" />
          </div>
          <TerminalCard title="npm" lines={lines} minHeight={120} />
          <NoteCard note={localize(step.note, lang)} tag={`queue: ${step.queue.map((id) => graph.pkgs[id].name).join(" ") || "∅"}`} />
        </div>
      </div>
    </SignatureShell>
  );
}
