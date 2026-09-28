// Next
import { create } from "zustand";
// Models
import type { AlgorithmId, CodeLang } from "@/core/models";

export const SPEEDS = [0.5, 1, 2, 4];

type PlayerController = {
  algorithm: AlgorithmId | null;
  idx: number;
  playing: boolean;
  speed: number;
  n: number;
  seed: number;
  codeLang: CodeLang;
  load: (algorithm: AlgorithmId, n: number, seed: number) => void;
  seek: (idx: number) => void;
  tick: (last: number) => void;
  togglePlay: (last: number) => void;
  cycleSpeed: () => void;
  setSpeed: (speed: number) => void;
  setN: (n: number) => void;
  shuffle: () => void;
  setCodeLang: (codeLang: CodeLang) => void;
};

export const usePlayerController = create<PlayerController>()((set) => ({
  algorithm: null,
  idx: 0,
  playing: false,
  speed: 1,
  n: 24,
  seed: 7,
  codeLang: "ts",
  load: (algorithm, n, seed) => set({ algorithm, n, seed, idx: 0, playing: false }),
  seek: (idx) => set({ idx, playing: false }),
  tick: (last) => set((state) => (state.idx >= last ? { playing: false } : { idx: state.idx + 1 })),
  // Pressing play at the end starts over.
  togglePlay: (last) => set((state) => ({ playing: !state.playing, idx: !state.playing && state.idx >= last ? 0 : state.idx })),
  cycleSpeed: () => set((state) => ({ speed: SPEEDS[(SPEEDS.indexOf(state.speed) + 1) % SPEEDS.length] })),
  setSpeed: (speed) => set({ speed }),
  setN: (n) => set({ n, idx: 0, playing: false }),
  shuffle: () => set((state) => ({ seed: state.seed + 1, idx: 0, playing: false })),
  setCodeLang: (codeLang) => set({ codeLang }),
}));
