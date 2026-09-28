"use client";

// Next
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Controllers
import { useLanguageController, useRoadMapController, useRunsController, useThemeController } from "@/core/controllers";
import { SPEEDS, usePlayerController } from "../_controllers/player_controller";
// Models
import { RECORDERS, type Counter } from "@/core/algorithms";
import { ALGORITHMS, FAMILIES, findAlgorithm, localize, TRANSLATIONS, type AlgorithmId, type Lang } from "@/core/models";
// Components
import { KpiTiles } from "@/components";
import CodePanel from "./code_panel";
import Explanation from "./explanation";
import Player from "./player";
// Icons
import { BackIcon } from "@/components/icons";
// Utils
import { drawStep, setVizTheme, type Ctx } from "@/utils/viz";

const counterText = (value: Counter | undefined, lang: Lang) => (value === undefined ? "" : typeof value === "object" ? localize(value, lang) : String(value));

export default function AlgorithmView({ algorithmId }: { algorithmId: AlgorithmId }) {
  const lang = useLanguageController((state) => state.lang);
  const theme = useThemeController((state) => state.theme);
  const loadedAlgorithm = usePlayerController((state) => state.algorithm);
  const idx = usePlayerController((state) => state.idx);
  const playing = usePlayerController((state) => state.playing);
  const speed = usePlayerController((state) => state.speed);
  const n = usePlayerController((state) => state.n);
  const seed = usePlayerController((state) => state.seed);
  const load = usePlayerController((state) => state.load);
  const tick = usePlayerController((state) => state.tick);
  const seek = usePlayerController((state) => state.seek);
  const togglePlay = usePlayerController((state) => state.togglePlay);
  const mapStatus = useRoadMapController((state) => state.status);
  const loadMap = useRoadMapController((state) => state.load);
  const addRun = useRunsController((state) => state.addRun);
  const [isCopied, setIsCopied] = useState(false);
  const recordedRef = useRef<string | null>(null);

  const t = TRANSLATIONS[lang];
  const algorithm = ALGORITHMS[algorithmId];
  const family = FAMILIES.find((candidate) => candidate.id === algorithm.family)!;
  // Until load() runs for this page the controller still holds the previous algorithm's input.
  const isLoaded = loadedAlgorithm === algorithmId;
  const size = isLoaded ? n : algorithm.defaultN;
  const currentSeed = isLoaded ? seed : 7;
  // The real-map pages record only once the street map has been fetched; before that the recorder yields one loading step.
  const needsMap = algorithm.kind === "map";
  const mapReady = !needsMap || mapStatus === "ready";

  const recording = useMemo(() => RECORDERS[algorithmId](mapReady ? size : 0, currentSeed), [algorithmId, size, currentSeed, mapReady]);
  const steps = recording.steps;
  const last = steps.length - 1;
  const stepIdx = Math.min(idx, last);
  const step = steps[stepIdx];
  const variants = (algorithm.variants ?? []).map((slug) => findAlgorithm(algorithm.family, slug)).filter((variant) => !!variant);

  useEffect(() => {
    if (needsMap) loadMap();
  }, [needsMap, loadMap]);

  // A playback that reaches its last step is a run for the home dashboard, once per input.
  useEffect(() => {
    if (!isLoaded || !mapReady || last <= 0 || stepIdx !== last) return;
    const key = `${algorithmId}:${size}:${currentSeed}`;
    if (recordedRef.current === key) return;
    recordedRef.current = key;
    addRun({ algorithm: algorithmId, n: size, seed: currentSeed, steps: last + 1, at: new Date().toISOString() });
  }, [isLoaded, mapReady, last, stepIdx, algorithmId, size, currentSeed, addRun]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const queryN = Number(query.get("n"));
    const querySeed = Number(query.get("seed"));
    load(algorithmId, queryN >= algorithm.minN && queryN <= algorithm.maxN ? queryN : algorithm.defaultN, querySeed > 0 ? querySeed : 7);
  }, [algorithmId, algorithm, load]);

  useEffect(() => {
    if (!isLoaded) return;
    const url = new URL(window.location.href);
    url.searchParams.set("n", String(size));
    url.searchParams.set("seed", String(currentSeed));
    window.history.replaceState(null, "", url);
  }, [isLoaded, size, currentSeed]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => tick(last), algorithm.stepMs / speed);
    return () => clearInterval(timer);
  }, [playing, speed, last, algorithm.stepMs, tick]);

  // Space plays, arrows step, Home/End jump, R shuffles, 1–4 set the speed. Focused controls keep their own keys.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)) return;
      const player = usePlayerController.getState();
      if (event.code === "Space") player.togglePlay(last);
      else if (event.key === "ArrowRight") player.seek(Math.min(player.idx + 1, last));
      else if (event.key === "ArrowLeft") player.seek(Math.max(player.idx - 1, 0));
      else if (event.key === "Home") player.seek(0);
      else if (event.key === "End") player.seek(last);
      else if (event.key === "r" || event.key === "R") player.shuffle();
      else if (event.key >= "1" && event.key <= "4") player.setSpeed(SPEEDS[Number(event.key) - 1]);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [last]);

  const draw = useCallback(
    (ctx: Ctx, w: number, h: number) => {
      setVizTheme(theme);
      drawStep(ctx, w, h, algorithm.kind, step);
    },
    [step, algorithm.kind, theme]
  );

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      window.prompt(t.share, window.location.href);
    }
  };

  const backToPlayer = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    seek(0);
    togglePlay(last);
  };

  const kpis = algorithm.kpis.map((kpi, index) => ({
    label: localize(kpi.label, lang),
    value: counterText(step.counters[kpi.key], lang),
    unit: kpi.unitKey ? counterText(step.counters[kpi.unitKey], lang) : undefined,
    sub: localize(kpi.sub, lang),
    isOn: index === 0,
  }));

  return (
    <div className="relative z-[1] mx-auto flex w-full min-w-[1180px] max-w-[1920px] flex-col">
      <div className="flex min-h-[calc(100vh-5.2rem)] flex-col gap-[1.2rem] px-[2.8rem] pt-[1.6rem] pb-[2rem]">
        <div className="card flex items-center gap-[1.2rem] rounded-[1rem] px-[1.6rem] py-[1rem]">
          <Link href={`/${family.id}`} title={localize(family.name, lang)} className="icon-btn flex-none rounded-[0.7rem]">
            <BackIcon />
          </Link>
          <span className="h-[0.8rem] w-[0.8rem] rounded-full bg-violet" />
          <h1 className="text-[1.7rem] font-semibold">{algorithm.name}</h1>
          <span className="text-[1.25rem] text-muted">· {localize(algorithm.subtitle, lang)}</span>
          {variants.length > 0 && (
            <div className="ml-[0.8rem] flex items-center gap-[0.8rem]">
              <span className="label">{t.runWith}</span>
              <div className="flex overflow-hidden rounded-[0.6rem] border border-line-2">
                {variants.map((variant) => (
                  <Link key={variant.id} href={`/${variant.family}/${variant.slug}?n=${size}&seed=${currentSeed}`} className={`px-[1rem] py-[0.5rem] font-mono text-[1.1rem] ${variant.id === algorithmId ? "bg-primary-tint text-primary" : "text-muted hover:text-text"}`}>
                    {variant.short ?? variant.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="flex-1" />
          <span className="font-mono text-[1.1rem] text-faint">
            /{algorithm.family}/{algorithm.slug}
          </span>
          <button type="button" onClick={share} className="btn-outline h-[3rem] px-[1.2rem] text-[1.25rem]">
            {isCopied ? t.copied : t.share}
          </button>
        </div>

        <KpiTiles kpis={kpis} />

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-[1.2rem]">
          <Player algorithm={algorithm} draw={draw} meta={localize(recording.meta, lang)} last={last} stepIdx={stepIdx} size={size} />
          <div className="flex min-h-0 flex-col gap-[1.2rem]">
            <CodePanel algorithm={algorithm} currentLine={step.line} />
            <div className="card flex flex-col gap-[0.6rem] px-[1.6rem] py-[1.2rem]">
              <div className="flex items-center gap-[1rem]">
                <span className="label">{t.currentStep}</span>
                <div className="flex-1" />
                <span className="font-mono text-[1.05rem] text-primary">
                  {t.line} {step.line}
                </span>
              </div>
              <p className="min-h-[40px] text-[1.3rem] leading-[1.55] text-pretty">{localize(step.note, lang)}</p>
            </div>
          </div>
        </div>
      </div>

      <Explanation algorithm={algorithm} family={family} onBackToPlayer={backToPlayer} />
    </div>
  );
}
