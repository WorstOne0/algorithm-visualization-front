// Models
import type { GameTreeStep } from "@/core/algorithms/gameai/record_game_tree";
import type { GraphStep } from "@/core/algorithms/graphs/graph_model";
import type { GridStep } from "@/core/algorithms/pathfinding/record_grid";
import type { RoadStep } from "@/core/algorithms/pathfinding/record_road";
import type { StepBase } from "@/core/algorithms/recording";
import type { SearchStep } from "@/core/algorithms/searching/record_search";
import type { BarsStep } from "@/core/algorithms/sorting/bars_recorder";
import type { BTreeStep } from "@/core/algorithms/trees/record_btree";
import type { TreeStep } from "@/core/algorithms/trees/tree_model";
import type { AlgorithmKind } from "@/core/models";
// Utils
import type { Ctx } from "./canvas";
import { drawBars, drawGameTree, drawGrid, drawSearch } from "./draw";
import { drawGraphStep } from "./draw_graph";
import { drawRoadStep } from "./draw_road";
import { drawBTreeStep, drawTreeStep } from "./draw_tree";

// The player's renderer: one branch per algorithm kind; `progress` is the tween into this step for the kinds that move.
export function drawStep(ctx: Ctx, w: number, h: number, kind: AlgorithmKind, step: StepBase, progress = 1) {
  switch (kind) {
    case "bars":
      return drawBars(ctx, w, h, step as BarsStep, { gap: 3, radius: 2, indices: true, values: true });
    case "search":
      return drawSearch(ctx, w, h, step as SearchStep, { gap: 3, indices: true, values: true });
    case "grid":
      return drawGrid(ctx, w, h, step as GridStep, { showCosts: true });
    case "map":
      return drawRoadStep(ctx, w, h, step as RoadStep);
    case "graph":
      return drawGraphStep(ctx, w, h, step as GraphStep);
    case "tree":
      return drawTreeStep(ctx, w, h, step as TreeStep, progress);
    case "btree":
      return drawBTreeStep(ctx, w, h, step as BTreeStep, progress);
    case "gametree":
      return drawGameTree(ctx, w, h, step as GameTreeStep);
    default:
      return;
  }
}
