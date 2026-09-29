"use client";

// Next
import { useCallback, useEffect, useMemo, useState } from "react";
// Controllers
import { useLanguageController, useRoadMapController, useThemeController } from "@/core/controllers";
import { useSignaturePlayerController } from "../_controllers/signature_player_controller";
// Models
import { getRoadMap } from "@/core/algorithms/pathfinding/road_map";
import type { Route } from "@/core/algorithms/recording";
import { recordTraffic } from "@/core/algorithms/signatures/traffic";
import { localize, TRANSLATIONS, type Localized, type Signature, type VizKey } from "@/core/models";
// Components
import { KpiTiles } from "@/components";
import NoteCard from "./note_card";
import SignatureShell from "./signature_shell";
import StepPlayer from "./step_player";
// Utils
import { counterText } from "@/utils/format";
import { drawTrafficStep, roadNodeAt, setVizTheme, type Ctx } from "@/utils/viz";

const LEGEND: [VizKey, Localized][] = [["amber", { en: "jammed street", pt: "rua travada" }], ["primary", { en: "explored", pt: "explorado" }], ["violet", { en: "shortest by distance", pt: "mais curta por distância" }], ["green", { en: "fastest by time", pt: "mais rápida por tempo" }]];

const T = {
  en: { expanded: "EXPANDED", expandedSub: "intersections closed", fastest: "FASTEST ROUTE", fastestSub: "minutes, by time", shortest: "SHORTEST ROUTE", shortestSub: "minutes, by distance", saved: "SAVED", savedSub: "minutes by trusting traffic", jammed: "JAMMED", jammedSub: "of the named streets", traffic: "Traffic", newTraffic: "New traffic", newRoute: "New route", model: "THE MODEL", free: "free flow", freeValue: "40 km/h on every street", jam: "a jammed street", jamValue: "1.6× to 3.5× slower, whole street", weight: "edge weight", weightValue: "metres × slowdown", search: "search", searchValue: "Dijkstra, the same one as the algorithm page" },
  pt: { expanded: "EXPANDIDOS", expandedSub: "cruzamentos fechados", fastest: "ROTA MAIS RÁPIDA", fastestSub: "minutos, por tempo", shortest: "ROTA MAIS CURTA", shortestSub: "minutos, por distância", saved: "ECONOMIA", savedSub: "minutos por confiar no trânsito", jammed: "TRAVADAS", jammedSub: "das ruas com nome", traffic: "Trânsito", newTraffic: "Novo trânsito", newRoute: "Nova rota", model: "O MODELO", free: "fluxo livre", freeValue: "40 km/h em toda rua", jam: "uma rua travada", jamValue: "1,6× a 3,5× mais lenta, a rua inteira", weight: "peso da aresta", weightValue: "metros × lentidão", search: "busca", searchValue: "Dijkstra, o mesmo da página do algoritmo" },
};

export default function TrafficPage({ signature }: { signature: Signature }) {
  const lang = useLanguageController((state) => state.lang);
  const theme = useThemeController((state) => state.theme);
  const mapStatus = useRoadMapController((state) => state.status);
  const loadMap = useRoadMapController((state) => state.load);
  const idx = useSignaturePlayerController((state) => state.idx);
  const restart = useSignaturePlayerController((state) => state.restart);
  const [jam, setJam] = useState(3);
  const [seed, setSeed] = useState(7);
  const [trafficSeed, setTrafficSeed] = useState(1);
  const [route, setRoute] = useState<Route | null>(null);

  const t = T[lang];
  const shared = TRANSLATIONS[lang];
  const mapReady = mapStatus === "ready";
  const recording = useMemo(() => recordTraffic(mapReady ? jam / 10 : 0, seed, trafficSeed, route), [mapReady, jam, seed, trafficSeed, route]);
  const steps = recording.steps;
  const last = steps.length - 1;
  const step = steps[Math.min(idx, last)];

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  useEffect(() => {
    restart(true);
  }, [recording, restart]);

  const draw = useCallback(
    (ctx: Ctx, w: number, h: number) => {
      setVizTheme(theme);
      drawTrafficStep(ctx, w, h, step);
    },
    [step, theme]
  );

  const onMapClick = (x: number, y: number, w: number, h: number) => {
    const map = getRoadMap();
    if (!map) return;
    const node = roadNodeAt(map, w, h, x, y);
    if (node < 0) return;
    if (!route || route.to !== null) setRoute({ from: node, to: null });
    else if (node !== route.from) setRoute({ from: route.from, to: node });
  };
  const newRoute = () => {
    setSeed((value) => value + 1);
    setRoute(null);
  };

  const kpis = [
    { label: t.expanded, value: counterText(step.counters.expanded, lang) || "—", unit: counterText(step.counters.expandedUnit, lang), sub: t.expandedSub, isOn: true },
    { label: t.fastest, value: counterText(step.counters.timeMin, lang) || "—", sub: counterText(step.counters.timeKm, lang) || t.fastestSub },
    { label: t.shortest, value: counterText(step.counters.distMin, lang) || "—", sub: counterText(step.counters.distKm, lang) || t.shortestSub },
    { label: t.saved, value: counterText(step.counters.saved, lang) || "—", sub: t.savedSub },
    { label: t.jammed, value: counterText(step.counters.jammed, lang) || "—", sub: t.jammedSub },
  ];
  const model: [string, string][] = [
    [t.free, t.freeValue],
    [t.jam, t.jamValue],
    [t.weight, t.weightValue],
    [t.search, t.searchValue],
  ];

  return (
    <SignatureShell signature={signature}>
      <KpiTiles kpis={kpis} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-[1.2rem]">
        <StepPlayer legend={LEGEND} meta={localize(recording.meta, lang)} last={last} stepMs={90} draw={draw} hint={shared.mapHint} cursor="crosshair" onClick={onMapClick}>
          <span className="text-[1.2rem] text-muted">{t.traffic}</span>
          <input type="range" min={0} max={6} step={1} value={jam} onChange={(event) => setJam(Number(event.target.value))} className="w-[9rem]" />
          <span className="w-[3.4rem] font-mono text-[1.1rem]">{jam * 10}%</span>
          <button type="button" onClick={() => setTrafficSeed((value) => value + 1)} className="btn-outline h-[3rem] px-[1rem] text-[1.2rem]">
            {t.newTraffic}
          </button>
          <button type="button" onClick={newRoute} className="btn-outline h-[3rem] px-[1rem] text-[1.2rem]">
            {t.newRoute}
          </button>
        </StepPlayer>
        <div className="flex min-h-0 flex-col gap-[1.2rem]">
          <div className="card flex flex-1 flex-col gap-[1rem] px-[1.6rem] py-[1.4rem]">
            <span className="label">{t.model}</span>
            <div className="flex flex-col divide-y divide-line">
              {model.map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-[1.2rem] py-[0.8rem]">
                  <span className="w-[12rem] font-mono text-[1.05rem] tracking-[0.04em] text-faint uppercase">{label}</span>
                  <span className="text-[1.3rem] text-text-2">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <NoteCard note={localize(step.note, lang)} tag={step.path.length ? `${step.path.length - 1} segments` : undefined} />
        </div>
      </div>
    </SignatureShell>
  );
}
