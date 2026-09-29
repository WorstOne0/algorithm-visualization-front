"use client";

// Next
import { useEffect, type ReactNode } from "react";
// Controllers
import { useLanguageController } from "@/core/controllers";
import { SPEEDS, useSignaturePlayerController } from "../_controllers/signature_player_controller";
// Models
import { localize, TRANSLATIONS, type Localized, type VizKey } from "@/core/models";
// Components
import { PlayerCanvas, type CanvasPointer } from "@/components";
// Icons
import { PauseIcon, PlayIcon, ResetIcon, StepBackIcon, StepForwardIcon } from "@/components/icons";
// Utils
import { VIZ_CSS, type Ctx } from "@/utils/viz";

type Props = {
  legend: [VizKey, Localized][];
  meta: string;
  last: number;
  stepMs: number;
  draw: (ctx: Ctx, w: number, h: number, progress: number) => void;
  hint?: string;
  animateMs?: number;
  cursor?: string;
  onClick?: CanvasPointer;
  // Page-specific controls, rendered at the right end of the transport bar.
  children?: ReactNode;
};

// The signature pages' player: same bar as the algorithm pages, driven by the signature controller, with the page's own inputs at the end.
export default function StepPlayer({ legend, meta, last, stepMs, draw, hint, animateMs, cursor, onClick, children }: Props) {
  const lang = useLanguageController((state) => state.lang);
  const idx = useSignaturePlayerController((state) => state.idx);
  const playing = useSignaturePlayerController((state) => state.playing);
  const speed = useSignaturePlayerController((state) => state.speed);
  const seek = useSignaturePlayerController((state) => state.seek);
  const tick = useSignaturePlayerController((state) => state.tick);
  const togglePlay = useSignaturePlayerController((state) => state.togglePlay);
  const cycleSpeed = useSignaturePlayerController((state) => state.cycleSpeed);

  const t = TRANSLATIONS[lang];
  const stepIdx = Math.min(idx, last);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => tick(last), stepMs / speed);
    return () => clearInterval(timer);
  }, [playing, speed, last, stepMs, tick]);

  // Space plays, arrows step, Home/End jump, 1–4 set the speed; typing in the page's inputs keeps its keys.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)) return;
      const player = useSignaturePlayerController.getState();
      if (event.code === "Space") player.togglePlay(last);
      else if (event.key === "ArrowRight") player.seek(Math.min(player.idx + 1, last));
      else if (event.key === "ArrowLeft") player.seek(Math.max(player.idx - 1, 0));
      else if (event.key === "Home") player.seek(0);
      else if (event.key === "End") player.seek(last);
      else if (event.key >= "1" && event.key <= "4") player.setSpeed(SPEEDS[Number(event.key) - 1]);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [last]);

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex items-center gap-[1.2rem] border-b border-line px-[1.6rem] py-[1rem] font-mono text-[1.05rem] text-muted">
        {legend.map(([key, label]) => (
          <span key={key} className="flex items-center gap-[0.5rem]">
            <i className="h-[0.8rem] w-[0.8rem] rounded-[2px]" style={{ background: VIZ_CSS[key] }} />
            {localize(label, lang)}
          </span>
        ))}
        <div className="flex-1" />
        {hint && <span className="text-primary">{hint}</span>}
        <span>{meta}</span>
      </div>
      <div className="well min-h-[340px] flex-1 px-[1.6rem] pt-[1.8rem] pb-[1rem]">
        <PlayerCanvas draw={draw} animateMs={animateMs} cursor={cursor} onClick={onClick} />
      </div>
      <div className="flex items-center gap-[0.8rem] border-t border-line px-[1.4rem] py-[1rem]">
        <button type="button" title="Reset (Home)" onClick={() => seek(0)} className="icon-btn">
          <ResetIcon />
        </button>
        <button type="button" title="Step back (←)" onClick={() => seek(Math.max(stepIdx - 1, 0))} className="icon-btn">
          <StepBackIcon />
        </button>
        <button type="button" title={playing ? "Pause (space)" : "Play (space)"} onClick={() => togglePlay(last)} className="flex h-[3rem] w-[3.4rem] items-center justify-center rounded-[0.6rem] bg-primary text-white hover:bg-primary-hover">
          {playing ? <PauseIcon /> : <PlayIcon color="#fff" />}
        </button>
        <button type="button" title="Step (→)" onClick={() => seek(Math.min(stepIdx + 1, last))} className="icon-btn">
          <StepForwardIcon />
        </button>
        <span className="ml-[0.4rem] font-mono text-[1.1rem] whitespace-nowrap text-muted">
          {t.step} <span className="text-text">{stepIdx}</span> / {last}
        </span>
        <input type="range" min={0} max={last} value={stepIdx} onChange={(event) => seek(Number(event.target.value))} className="mx-[0.8rem] flex-1" />
        <button type="button" title="Speed (1–4)" onClick={cycleSpeed} className="btn-outline h-[3rem] px-[1rem] font-mono text-[1.1rem] font-normal">
          {speed}×
        </button>
        {children && <div className="ml-[0.4rem] flex items-center gap-[0.8rem] border-l border-line pl-[1.2rem]">{children}</div>}
      </div>
    </div>
  );
}
