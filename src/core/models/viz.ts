// Models
import type { PathAlgo } from "@/core/algorithms/pathfinding/grid_search";
import type { RoadAlgo } from "@/core/algorithms/pathfinding/road_search";
import type { SortId } from "@/core/algorithms/sorting/sorts";
import type { FamilyId } from "./families";

// A named colour of the canvas palette (utils/viz/canvas.ts); the models point at it by key.
export type VizKey = "primary" | "swap" | "violet" | "green" | "amber" | "neg" | "vis" | "def" | "act" | "text";

// What a canvas should run; utils/viz/starters.ts turns it into an animation.
export type VizSpec =
  | { starter: "sort"; n?: number; algo?: SortId; ms?: number; gap?: number; radius?: number; indices?: boolean }
  | { starter: "search"; n?: number; ms?: number; gap?: number }
  | { starter: "path"; cols?: number; rows?: number; density?: number; ms?: number; algo?: PathAlgo }
  // The real street map, route after route (utils/viz/road_showpiece.ts); perFrame is intersections closed per frame.
  | { starter: "map"; algo?: RoadAlgo; perFrame?: number }
  | { starter: "graph"; n?: number; ms?: number; r?: number }
  | { starter: "tree"; n?: number; ms?: number; r?: number }
  | { starter: "minimax"; branch?: number; depth?: number; ms?: number; r?: number }
  // The faint scene behind the home hero and a category header (utils/viz/ambient.ts).
  | { starter: "ambient"; family: FamilyId; alpha?: number };
