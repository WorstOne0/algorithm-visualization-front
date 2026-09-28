"use client";

// Next
import { useEffect, useRef } from "react";
// Utils
import { fit, type Ctx } from "@/utils/viz";

export type CanvasPointer = (x: number, y: number, w: number, h: number) => void;

type Props = {
  // Called with the tween progress 0..1 when `animateMs` is set, else once with 1.
  draw: (ctx: Ctx, w: number, h: number, progress: number) => void;
  animateMs?: number;
  onClick?: CanvasPointer;
  onPointerDown?: CanvasPointer;
  onPointerMove?: CanvasPointer;
  onPointerUp?: () => void;
  cursor?: string;
};

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

// A canvas painted when `draw` changes (the player's current step) and on resize; pointer events come back in CSS pixels.
export default function PlayerCanvas({ draw, animateMs = 0, onClick, onPointerDown, onPointerMove, onPointerUp, cursor }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;
    const paint = (progress: number) => {
      const { ctx, w, h } = fit(canvas);
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, progress);
    };
    if (animateMs > 0) {
      const started = performance.now();
      const frame = (now: number) => {
        const t = Math.min(1, (now - started) / animateMs);
        paint(ease(t));
        if (t < 1) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    } else paint(1);
    const onResize = () => paint(1);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [draw, animateMs]);

  const at = (event: React.PointerEvent | React.MouseEvent, handler?: CanvasPointer) => {
    if (!handler || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    handler(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);
  };

  return <canvas ref={canvasRef} className="h-full w-full touch-none" style={cursor ? { cursor } : undefined} onClick={(event) => at(event, onClick)} onPointerDown={(event) => at(event, onPointerDown)} onPointerMove={(event) => at(event, onPointerMove)} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} />;
}
