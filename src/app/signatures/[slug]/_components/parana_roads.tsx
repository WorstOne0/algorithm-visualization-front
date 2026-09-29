"use client";

// Next
import { useCallback, useEffect, useMemo, useRef } from "react";
// Controllers
import { useLanguageController, useThemeController } from "@/core/controllers";
import { useSignaturePlayerController } from "../_controllers/signature_player_controller";
// Models
import { recordParanaRoads } from "@/core/algorithms/signatures/parana_roads";
import { localize, type Localized, type Signature, type VizKey } from "@/core/models";
// Components
import { KpiTiles } from "@/components";
import NoteCard from "./note_card";
import SignatureShell from "./signature_shell";
import StepPlayer from "./step_player";
// Utils
import { counterText, formatNumber } from "@/utils/format";
import { drawCityMap, setVizTheme, type Ctx } from "@/utils/viz";

const LEGEND: [VizKey, Localized][] = [["act", { en: "considering", pt: "em análise" }], ["primary", { en: "built", pt: "construída" }], ["def", { en: "rejected (dashed)", pt: "rejeitada (tracejada)" }], ["green", { en: "connected city", pt: "cidade conectada" }]];

const T = {
  en: { cities: "CITIES", citiesSub: "real coordinates", candidates: "CANDIDATE ROADS", candidatesSub: "3 nearest neighbours each", built: "ROADS BUILT", builtSub: "cities − 1 when done", km: "TOTAL KM", kmSub: "of asphalt so far", rejected: "REJECTED", rejectedSub: "would only close a loop", ledger: "ROADS BY LENGTH", built1: "built", rejected1: "rejected" },
  pt: { cities: "CIDADES", citiesSub: "coordenadas reais", candidates: "ESTRADAS CANDIDATAS", candidatesSub: "3 vizinhas mais próximas cada", built: "ESTRADAS CONSTRUÍDAS", builtSub: "cidades − 1 ao terminar", km: "KM TOTAIS", kmSub: "de asfalto até aqui", rejected: "REJEITADAS", rejectedSub: "só fechariam uma volta", ledger: "ESTRADAS POR COMPRIMENTO", built1: "construída", rejected1: "rejeitada" },
};

export default function ParanaRoadsPage({ signature }: { signature: Signature }) {
  const lang = useLanguageController((state) => state.lang);
  const theme = useThemeController((state) => state.theme);
  const idx = useSignaturePlayerController((state) => state.idx);
  const restart = useSignaturePlayerController((state) => state.restart);
  const ledgerRef = useRef<HTMLDivElement>(null);

  const t = T[lang];
  const recording = useMemo(() => recordParanaRoads(), []);
  const steps = recording.steps;
  const last = steps.length - 1;
  const step = steps[Math.min(idx, last)];

  useEffect(() => {
    restart(true);
  }, [recording, restart]);

  useEffect(() => {
    const current = ledgerRef.current?.querySelector("[data-current='true']");
    current?.scrollIntoView({ block: "nearest" });
  }, [step.position]);

  const draw = useCallback(
    (ctx: Ctx, w: number, h: number) => {
      setVizTheme(theme);
      drawCityMap(ctx, w, h, step);
    },
    [step, theme]
  );

  const kpis = [
    { label: t.cities, value: step.cities.length, sub: t.citiesSub, isOn: true },
    { label: t.candidates, value: step.roads.length, sub: t.candidatesSub },
    { label: t.built, value: counterText(step.counters.built, lang), unit: counterText(step.counters.builtUnit, lang), sub: t.builtSub },
    { label: t.km, value: formatNumber(step.total, lang), sub: t.kmSub },
    { label: t.rejected, value: counterText(step.counters.rejected, lang), sub: t.rejectedSub },
  ];

  return (
    <SignatureShell signature={signature}>
      <KpiTiles kpis={kpis} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-[1.2rem]">
        <StepPlayer legend={LEGEND} meta={localize(recording.meta, lang)} last={last} stepMs={380} draw={draw} />
        <div className="flex min-h-0 flex-col gap-[1.2rem]">
          <div className="card flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-[1rem] border-b border-line px-[1.6rem] py-[1rem]">
              <span className="label">{t.ledger}</span>
              <div className="flex-1" />
              <span className="font-mono text-[1.05rem] text-faint">{step.roads.length}</span>
            </div>
            <div ref={ledgerRef} className="max-h-[360px] flex-1 overflow-auto px-[0.8rem] py-[0.6rem]">
              {step.sorted.map((id, index) => {
                const road = step.roads[id];
                const mark = step.roadMarks.get(id);
                const isCurrent = index === step.position;
                return (
                  <div key={id} data-current={isCurrent} className={`grid grid-cols-[2.6rem_minmax(0,1fr)_5rem_7rem] items-center gap-[0.8rem] rounded-[0.6rem] px-[0.8rem] py-[0.35rem] font-mono text-[1.15rem] ${isCurrent ? "bg-primary-tint text-text" : mark ? "text-text-2" : "text-faint"}`}>
                    <span className="text-[1rem] text-faint">{index + 1}</span>
                    <span className="truncate">
                      {step.cities[road.a].name} – {step.cities[road.b].name}
                    </span>
                    <span className="text-right">{road.km} km</span>
                    <span className={`text-right text-[1.05rem] ${mark === "used" ? "text-primary" : mark === "rejected" ? "text-faint line-through" : "text-faint"}`}>{mark === "used" ? t.built1 : mark === "rejected" ? t.rejected1 : "·"}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <NoteCard note={localize(step.note, lang)} tag={`${step.total} km`} />
        </div>
      </div>
    </SignatureShell>
  );
}
