"use client";

// Next
import { useCallback, useEffect, useMemo, useState } from "react";
// Controllers
import { useLanguageController, useThemeController } from "@/core/controllers";
import { useSignaturePlayerController } from "../_controllers/signature_player_controller";
// Models
import { buildTrie, recordAutocomplete } from "@/core/algorithms/signatures/autocomplete";
import { WORDS } from "@/core/algorithms/signatures/words";
import { localize, type Localized, type Signature, type VizKey } from "@/core/models";
// Components
import { KpiTiles } from "@/components";
import NoteCard from "./note_card";
import SignatureShell from "./signature_shell";
import StepPlayer from "./step_player";
// Utils
import { counterText } from "@/utils/format";
import { drawStep, setVizTheme, type Ctx } from "@/utils/viz";

const LEGEND: [VizKey, Localized][] = [["act", { en: "current", pt: "atual" }], ["primary", { en: "prefix path", pt: "caminho do prefixo" }], ["green", { en: "completion", pt: "sugestão" }], ["def", { en: "other nodes", pt: "outros nós" }]];

const T = {
  en: { words: "WORDS", wordsSub: "in the dictionary", nodes: "TRIE NODES", nodesSub: "one per distinct prefix", visited: "NODES VISITED", visitedSub: "by this query", completions: "COMPLETIONS", completionsSub: "found so far", typed: "TYPED", typedSub: "characters, one edge each", placeholder: "type a prefix…", suggestions: "SUGGESTIONS", none: "no word starts with", scan: "scan" },
  pt: { words: "PALAVRAS", wordsSub: "no dicionário", nodes: "NÓS DA TRIE", nodesSub: "um por prefixo distinto", visited: "NÓS VISITADOS", visitedSub: "por esta consulta", completions: "SUGESTÕES", completionsSub: "encontradas até aqui", typed: "DIGITADO", typedSub: "caracteres, uma aresta cada", placeholder: "digite um prefixo…", suggestions: "SUGESTÕES", none: "nenhuma palavra começa com", scan: "varredura" },
};

export default function AutocompletePage({ signature }: { signature: Signature }) {
  const lang = useLanguageController((state) => state.lang);
  const theme = useThemeController((state) => state.theme);
  const idx = useSignaturePlayerController((state) => state.idx);
  const restart = useSignaturePlayerController((state) => state.restart);
  const [typed, setTyped] = useState("pro");

  const t = T[lang];
  const prefix = typed.trim().toLowerCase();
  const trie = useMemo(() => buildTrie(WORDS[lang]), [lang]);
  const recording = useMemo(() => recordAutocomplete(trie, prefix), [trie, prefix]);
  const steps = recording.steps;
  const last = steps.length - 1;
  const step = steps[Math.min(idx, last)];

  useEffect(() => {
    restart(true);
  }, [recording, restart]);

  const draw = useCallback(
    (ctx: Ctx, w: number, h: number, progress: number) => {
      setVizTheme(theme);
      drawStep(ctx, w, h, "tree", step, progress);
    },
    [step, theme]
  );

  const kpis = [
    { label: t.words, value: trie.words, sub: t.wordsSub, isOn: true },
    { label: t.nodes, value: trie.nodes.length, sub: t.nodesSub },
    { label: t.visited, value: counterText(step.counters.visited, lang), delta: `vs ${trie.words} ${t.scan}`, sub: t.visitedSub },
    { label: t.completions, value: counterText(step.counters.completions, lang), sub: t.completionsSub },
    { label: t.typed, value: prefix.length, sub: t.typedSub },
  ];

  return (
    <SignatureShell signature={signature}>
      <KpiTiles kpis={kpis} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-[1.2rem]">
        <StepPlayer legend={LEGEND} meta={localize(recording.meta, lang)} last={last} stepMs={260} draw={draw} animateMs={220} />
        <div className="flex min-h-0 flex-col gap-[1.2rem]">
          <div className="card flex flex-1 flex-col gap-[1.2rem] px-[1.6rem] py-[1.4rem]">
            <input
              type="text"
              value={typed}
              autoFocus
              spellCheck={false}
              placeholder={t.placeholder}
              onChange={(event) => setTyped(event.target.value.slice(0, 16))}
              className="h-[4.2rem] w-full rounded-[0.8rem] border border-line-2 bg-side px-[1.4rem] font-mono text-[1.8rem] text-text outline-none focus:border-primary"
            />
            <div className="flex items-center gap-[1rem]">
              <span className="label">{t.suggestions}</span>
              <div className="flex-1" />
              <span className="font-mono text-[1.05rem] text-faint">{step.completions.length}</span>
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              {!step.prefixFound && (
                <span className="text-[1.3rem] text-muted">
                  {t.none} &quot;{prefix}&quot;
                </span>
              )}
              {step.completions.map((word, index) => (
                <div key={word} className="flex items-center gap-[1rem] rounded-[0.6rem] px-[0.8rem] py-[0.5rem] font-mono text-[1.35rem] hover:bg-surface-2">
                  <span className="w-[2rem] text-[1.05rem] text-faint">{index + 1}</span>
                  <span>
                    <span className="font-semibold text-primary">{word.slice(0, prefix.length)}</span>
                    {word.slice(prefix.length)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <NoteCard note={localize(step.note, lang)} tag={step.aside} />
        </div>
      </div>
    </SignatureShell>
  );
}
