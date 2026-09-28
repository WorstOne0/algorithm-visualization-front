// Models
import type { GridStep } from "@/core/algorithms/pathfinding/record_grid";
import type { StepBase } from "@/core/algorithms/recording";
import type { BarsStep } from "@/core/algorithms/sorting/bars_recorder";
import type { AlgorithmKind } from "@/core/models";
// Utils
import type { Ctx } from "./canvas";
import { drawBars, drawGrid } from "./draw";

// The player's renderer: one branch per algorithm kind, drawing the recorded step as it is.
export function drawStep(ctx: Ctx, w: number, h: number, kind: AlgorithmKind, step: StepBase) {
  switch (kind) {
    case "bars":
      return drawBars(ctx, w, h, step as BarsStep, { gap: 3, radius: 2, indices: true, values: true });
    case "grid":
      return drawGrid(ctx, w, h, step as GridStep, { showCosts: true });
    default:
      return;
  }
}
