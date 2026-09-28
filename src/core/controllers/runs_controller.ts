// Next
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
// Models
import type { AlgorithmId } from "@/core/models";

// One playback taken to its last step; the home dashboard ranks these.
export type Run = { algorithm: AlgorithmId; n: number; seed: number; steps: number; at: string };

type RunsController = {
  runs: Run[];
  addRun: (run: Run) => void;
  clearRuns: () => void;
};

const MAX_RUNS = 300;

export const useRunsController = create<RunsController>()(
  persist(
    (set) => ({
      runs: [],
      addRun: (run) => set((state) => ({ runs: [run, ...state.runs].slice(0, MAX_RUNS) })),
      clearRuns: () => set({ runs: [] }),
    }),
    {
      name: "av_runs",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
