// Models
import type { AlgorithmId } from "@/core/models/algorithms";
// Utils
import { gameTreeRecorder } from "./gameai/record_game_tree";
import { recordGraphBfs, recordGraphDfs, recordGraphDijkstra, recordKruskal, recordPrim, recordTopological } from "./graphs/record_graph";
import { gridRecorder } from "./pathfinding/record_grid";
import { roadRecorder } from "./pathfinding/record_road";
import type { Recorder } from "./recording";
import { recordExponential, recordInterpolation, recordJump, recordTernary } from "./searching/record_more";
import { recordBinary, recordLinear } from "./searching/record_search";
import { recordBubble } from "./sorting/record_bubble";
import { recordHeap } from "./sorting/record_heap";
import { recordInsertion } from "./sorting/record_insertion";
import { recordMerge } from "./sorting/record_merge";
import { recordCocktail, recordComb, recordGnome, recordOddEven, recordRadix, recordShell } from "./sorting/record_more";
import { recordQuick } from "./sorting/record_quick";
import { recordSelection } from "./sorting/record_selection";
import { recordAvl } from "./trees/record_avl";
import { recordBinaryHeap } from "./trees/record_binary_heap";
import { recordBst } from "./trees/record_bst";
import { recordBTree } from "./trees/record_btree";
import { recordRedBlack } from "./trees/record_red_black";
import { recordTraversals } from "./trees/record_traversals";

// One recorder per algorithm page; the player calls it with the size and the seed from the URL.
export const RECORDERS: Record<AlgorithmId, Recorder> = {
  bubble: recordBubble,
  selection: recordSelection,
  insertion: recordInsertion,
  merge: recordMerge,
  quick: recordQuick,
  heap: recordHeap,
  cocktail: recordCocktail,
  gnome: recordGnome,
  comb: recordComb,
  shell: recordShell,
  oddeven: recordOddEven,
  radix: recordRadix,
  linear: recordLinear,
  binary: recordBinary,
  jump: recordJump,
  interpolation: recordInterpolation,
  exponential: recordExponential,
  ternary: recordTernary,
  minimax: gameTreeRecorder(false),
  alphabeta: gameTreeRecorder(true),
  graphBfs: recordGraphBfs,
  graphDfs: recordGraphDfs,
  graphDijkstra: recordGraphDijkstra,
  prim: recordPrim,
  kruskal: recordKruskal,
  topological: recordTopological,
  bst: recordBst,
  traversals: recordTraversals,
  avl: recordAvl,
  redBlack: recordRedBlack,
  btree: recordBTree,
  binaryHeap: recordBinaryHeap,
  bfs: gridRecorder("bfs"),
  dfs: gridRecorder("dfs"),
  dijkstra: gridRecorder("dijkstra", true),
  astar: gridRecorder("astar"),
  roadAstar: roadRecorder("astar"),
  roadDijkstra: roadRecorder("dijkstra"),
  roadBfs: roadRecorder("bfs"),
};

export type { Counter, Recorder, RecorderOptions, Recording, Route, StepBase } from "./recording";
