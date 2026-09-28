// Models
import type { PathAlgo } from "@/core/algorithms/pathfinding/grid_search";
import type { SortId } from "@/core/algorithms/sorting/sorts";

// A named colour of the canvas palette (utils/viz/canvas.ts); the models point at it by key.
export type VizKey = "primary" | "swap" | "violet" | "green" | "neg" | "vis" | "def" | "act" | "text";

// What a canvas should run; utils/viz/starters.ts turns it into an animation.
export type VizSpec =
  | { starter: "sort"; n?: number; algo?: SortId; ms?: number; gap?: number; radius?: number; indices?: boolean }
  | { starter: "search"; n?: number; ms?: number; gap?: number }
  | { starter: "path"; cols?: number; rows?: number; density?: number; ms?: number; algo?: PathAlgo }
  | { starter: "graph"; n?: number; ms?: number; r?: number }
  | { starter: "tree"; n?: number; ms?: number; r?: number }
  | { starter: "minimax"; branch?: number; depth?: number; ms?: number; r?: number }
  | { starter: "city"; cell?: number; speed?: number; alpha?: number };
