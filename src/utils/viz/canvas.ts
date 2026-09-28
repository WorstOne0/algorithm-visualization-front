// Models
import type { Theme, VizKey } from "@/core/models";

// Series colours follow the theme; the well colours (def, vis, wall, open, edge, text) stay dark in both, like --well.
const PALETTES = {
  dark: { primary: "#3b82f6", primaryHover: "#60a5fa", violet: "#a78bfa", swap: "#93c5fd", green: "#4ade80", amber: "#fbbf24", neg: "#f87171", def: "#3A4363", vis: "#22305A", wall: "#1B2136", open: "#0F1322", edge: "rgba(147,197,253,.22)", text: "#8C93A8", act: "#ffffff" },
  light: { primary: "#0b5ecd", primaryHover: "#0a4fae", violet: "#7c3aed", swap: "#60a5fa", green: "#16a34a", amber: "#d97706", neg: "#c8251b", def: "#3A4363", vis: "#22305A", wall: "#1B2136", open: "#0F1322", edge: "rgba(147,197,253,.22)", text: "#8C93A8", act: "#ffffff" },
};

export const COLORS = { ...PALETTES.dark };

export function setVizTheme(theme: Theme) {
  Object.assign(COLORS, PALETTES[theme]);
}

// The legend keys of the models, as CSS values for markup (legends, stage numbers, complexity rows).
export const VIZ_CSS: Record<VizKey, string> = {
  primary: "var(--primary)",
  swap: "var(--swap)",
  violet: "var(--violet)",
  green: "var(--green)",
  neg: "var(--neg)",
  vis: PALETTES.dark.vis,
  def: PALETTES.dark.def,
  act: PALETTES.dark.act,
  text: "var(--text)",
};

export type Ctx = CanvasRenderingContext2D;

// Sizes the bitmap to the element at the device pixel ratio and returns the CSS-pixel size to draw in.
export function fit(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

let monoFamily: string | null = null;

// next/font exposes Geist Mono under a hashed family name; canvas text has to read it from the variable.
export function monoFont(px: number) {
  if (monoFamily === null) monoFamily = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() || "ui-monospace";
  return `${px}px ${monoFamily}, ui-monospace, monospace`;
}

// Runs a generator one step every `ms`, redraws every frame, and restarts it `restMs` after it ends.
export function stepper<S>(canvas: HTMLCanvasElement, makeGen: () => Generator<S, void, void>, draw: (ctx: Ctx, w: number, h: number, state: S, t: number) => void, ms: number, restMs = 1400) {
  let gen = makeGen();
  let state = gen.next().value as S;
  let last = 0;
  let alive = true;
  let resting = 0;
  let raf = 0;
  const frame = (t: number) => {
    if (!alive) return;
    const { ctx, w, h } = fit(canvas);
    if (t - last > ms) {
      last = t;
      if (resting) {
        if (t > resting) {
          resting = 0;
          gen = makeGen();
          state = gen.next().value as S;
        }
      } else {
        const next = gen.next();
        if (next.done) resting = t + restMs;
        else state = next.value;
      }
    }
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h, state, t);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
  };
}
