"use client";

// Next
import { useEffect, useRef } from "react";
// Controllers
import { useThemeController } from "@/core/controllers";
// Models
import type { VizSpec } from "@/core/models";
// Utils
import { setVizTheme, startViz } from "@/utils/viz";

// A canvas that runs one animation spec until it unmounts; restarts when the spec or the theme changes.
export default function VizCanvas({ spec, className = "h-full w-full" }: { spec: VizSpec; className?: string }) {
  const theme = useThemeController((state) => state.theme);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Compared by value so a fresh object literal on every render does not restart the animation.
  const specKey = JSON.stringify(spec);

  useEffect(() => {
    if (!canvasRef.current) return;
    setVizTheme(theme);
    return startViz(canvasRef.current, JSON.parse(specKey));
  }, [specKey, theme]);

  return <canvas ref={canvasRef} className={className} />;
}
