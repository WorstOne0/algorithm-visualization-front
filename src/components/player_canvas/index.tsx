"use client";

// Next
import { useEffect, useRef } from "react";
// Utils
import { fit, type Ctx } from "@/utils/viz";

// A canvas painted once per `draw` change (the player's current step) and again on resize.
export default function PlayerCanvas({ draw }: { draw: (ctx: Ctx, w: number, h: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      const { ctx, w, h } = fit(canvas);
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h);
    };
    paint();
    window.addEventListener("resize", paint);
    return () => window.removeEventListener("resize", paint);
  }, [draw]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
