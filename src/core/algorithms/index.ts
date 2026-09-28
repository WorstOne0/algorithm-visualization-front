// Models
import type { AlgorithmId } from "@/core/models/algorithms";
// Utils
import { gridRecorder } from "./pathfinding/record_grid";
import type { Recorder } from "./recording";
import { recordBubble } from "./sorting/record_bubble";
import { recordHeap } from "./sorting/record_heap";
import { recordInsertion } from "./sorting/record_insertion";
import { recordMerge } from "./sorting/record_merge";
import { recordQuick } from "./sorting/record_quick";
import { recordSelection } from "./sorting/record_selection";

// One recorder per algorithm page; the player calls it with the size and the seed from the URL.
export const RECORDERS: Record<AlgorithmId, Recorder> = {
  bubble: recordBubble,
  selection: recordSelection,
  insertion: recordInsertion,
  merge: recordMerge,
  quick: recordQuick,
  heap: recordHeap,
  bfs: gridRecorder("bfs"),
  dfs: gridRecorder("dfs"),
  dijkstra: gridRecorder("dijkstra", true),
  astar: gridRecorder("astar"),
};

export type { Counter, Recorder, Recording, StepBase } from "./recording";
