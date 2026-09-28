// Models
import { minimax } from "@/core/algorithms/gameai/minimax";
import { graphBfs } from "@/core/algorithms/graphs/graph_bfs";
import { gridSearch, makeGrid } from "@/core/algorithms/pathfinding/grid_search";
import { ri } from "@/core/algorithms/random";
import { binarySearch } from "@/core/algorithms/searching/binary_search";
import { SORTS } from "@/core/algorithms/sorting/sorts";
import { bstInsert } from "@/core/algorithms/trees/bst_insert";
import type { VizSpec } from "@/core/models";
// Utils
import { startAmbient } from "./ambient";
import { fit, stepper } from "./canvas";
import { drawBars, drawGraph, drawGrid, drawMinimax, drawSearch, drawTree } from "./draw";
import { startRoadShowpiece } from "./road_showpiece";

type Stop = () => void;

// Every starter takes the canvas and returns the function that stops it.
export function startViz(canvas: HTMLCanvasElement, spec: VizSpec): Stop {
  switch (spec.starter) {
    case "sort": {
      const { n = 24, algo = "insertion", ms = 60, gap = 2, radius = 1, indices = false } = spec;
      const make = () => (SORTS[algo] ?? SORTS.insertion)(Array.from({ length: n }, () => ri(8, 100)));
      return stepper(canvas, make, (ctx, w, h, s) => drawBars(ctx, w, h, s, { gap, radius, indices }), ms);
    }
    case "search": {
      const { n = 24, ms = 420, gap = 2 } = spec;
      return stepper(canvas, () => binarySearch(n), (ctx, w, h, s) => drawSearch(ctx, w, h, s, { gap }), ms, 1600);
    }
    case "path": {
      const { cols = 28, rows = 14, density = 0.26, ms = 70, algo = "bfs" } = spec;
      return stepper(canvas, () => gridSearch(makeGrid(cols, rows, density), algo), (ctx, w, h, s) => drawGrid(ctx, w, h, s), ms, 1800);
    }
    case "graph": {
      const { n = 16, ms = 520, r = 4 } = spec;
      const { w, h } = fit(canvas);
      return stepper(canvas, () => graphBfs(n, w, h), (ctx, w, h, s) => drawGraph(ctx, w, h, s, r), ms, 1600);
    }
    case "tree": {
      const { n = 12, ms = 380, r = 5 } = spec;
      return stepper(canvas, () => bstInsert(n), (ctx, w, h, s) => drawTree(ctx, w, h, s, r), ms, 1600);
    }
    case "minimax": {
      const { branch = 3, depth = 3, ms = 260, r = 4 } = spec;
      return stepper(canvas, () => minimax(branch, depth), (ctx, w, h, s) => drawMinimax(ctx, w, h, s, r, depth), ms, 1800);
    }
    case "map":
      return startRoadShowpiece(canvas, spec.algo, spec.perFrame);
    case "ambient":
      return startAmbient(canvas, spec.family, spec.alpha);
  }
}
