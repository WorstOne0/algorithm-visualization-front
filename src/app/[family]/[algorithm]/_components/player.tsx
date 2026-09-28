"use client";

// Controllers
import { useLanguageController } from "@/core/controllers";
import { usePlayerController } from "../_controllers/player_controller";
// Models
import { localize, TRANSLATIONS, type Algorithm } from "@/core/models";
// Components
import { PlayerCanvas } from "@/components";
// Icons
import { PauseIcon, PlayIcon, ResetIcon, StepBackIcon, StepForwardIcon } from "@/components/icons";
// Utils
import { VIZ_CSS, type Ctx } from "@/utils/viz";

type Props = { algorithm: Algorithm; draw: (ctx: Ctx, w: number, h: number) => void; meta: string; last: number; stepIdx: number; size: number };

export default function Player({ algorithm, draw, meta, last, stepIdx, size }: Props) {
  const lang = useLanguageController((state) => state.lang);
  const playing = usePlayerController((state) => state.playing);
  const speed = usePlayerController((state) => state.speed);
  const seek = usePlayerController((state) => state.seek);
  const togglePlay = usePlayerController((state) => state.togglePlay);
  const cycleSpeed = usePlayerController((state) => state.cycleSpeed);
  const setN = usePlayerController((state) => state.setN);
  const shuffle = usePlayerController((state) => state.shuffle);

  const t = TRANSLATIONS[lang];

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex items-center gap-[1.2rem] border-b border-line px-[1.6rem] py-[1rem] font-mono text-[1.05rem] text-muted">
        {algorithm.legend.map(([key, label]) => (
          <span key={key} className="flex items-center gap-[0.5rem]">
            <i className="h-[0.8rem] w-[0.8rem] rounded-[2px]" style={{ background: VIZ_CSS[key] }} />
            {localize(label, lang)}
          </span>
        ))}
        <div className="flex-1" />
        <span>{meta}</span>
      </div>
      <div className="well min-h-[340px] flex-1 px-[1.6rem] pt-[1.8rem] pb-[1rem]">
        <PlayerCanvas draw={draw} />
      </div>
      <div className="flex items-center gap-[0.8rem] border-t border-line px-[1.4rem] py-[1rem]">
        <button type="button" title="Reset" onClick={() => seek(0)} className="icon-btn">
          <ResetIcon />
        </button>
        <button type="button" title="Step back" onClick={() => seek(Math.max(stepIdx - 1, 0))} className="icon-btn">
          <StepBackIcon />
        </button>
        <button type="button" title={playing ? "Pause" : "Play"} onClick={() => togglePlay(last)} className="flex h-[3rem] w-[3.4rem] items-center justify-center rounded-[0.6rem] bg-primary text-white hover:bg-primary-hover">
          {playing ? <PauseIcon /> : <PlayIcon color="#fff" />}
        </button>
        <button type="button" title="Step" onClick={() => seek(Math.min(stepIdx + 1, last))} className="icon-btn">
          <StepForwardIcon />
        </button>
        <span className="ml-[0.4rem] font-mono text-[1.1rem] whitespace-nowrap text-muted">
          {t.step} <span className="text-text">{stepIdx}</span> / {last}
        </span>
        <input type="range" min={0} max={last} value={stepIdx} onChange={(event) => seek(Number(event.target.value))} className="mx-[0.8rem] flex-1" />
        <button type="button" onClick={cycleSpeed} className="btn-outline h-[3rem] px-[1rem] font-mono text-[1.1rem] font-normal">
          {speed}×
        </button>
        <div className="ml-[0.4rem] flex items-center gap-[0.8rem] border-l border-line pl-[0.8rem]">
          <span className="text-[1.2rem] text-muted">{localize(algorithm.sizeLabel, lang)}</span>
          <input type="range" min={algorithm.minN} max={algorithm.maxN} step={algorithm.stepN} value={size} onChange={(event) => setN(Number(event.target.value))} className="w-[9rem]" />
          <span className="w-[2.2rem] font-mono text-[1.1rem]">{size}</span>
          <button type="button" onClick={shuffle} className="btn-outline h-[3rem] px-[1rem] text-[1.2rem]">
            {localize(algorithm.shuffleLabel, lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
