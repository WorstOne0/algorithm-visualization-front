// Next
import { create } from "zustand";

export const SPEEDS = [0.5, 1, 2, 4];

type SignaturePlayerController = {
  idx: number;
  playing: boolean;
  speed: number;
  seek: (idx: number) => void;
  tick: (last: number) => void;
  togglePlay: (last: number) => void;
  cycleSpeed: () => void;
  setSpeed: (speed: number) => void;
  // A page calls this whenever its recording changes: rewind (or jump to `idx`) and optionally start playing.
  restart: (playing: boolean, idx?: number) => void;
};

export const useSignaturePlayerController = create<SignaturePlayerController>()((set) => ({
  idx: 0,
  playing: false,
  speed: 1,
  seek: (idx) => set({ idx, playing: false }),
  tick: (last) => set((state) => (state.idx >= last ? { playing: false } : { idx: state.idx + 1 })),
  togglePlay: (last) => set((state) => ({ playing: !state.playing, idx: !state.playing && state.idx >= last ? 0 : state.idx })),
  cycleSpeed: () => set((state) => ({ speed: SPEEDS[(SPEEDS.indexOf(state.speed) + 1) % SPEEDS.length] })),
  setSpeed: (speed) => set({ speed }),
  restart: (playing, idx = 0) => set({ idx, playing }),
}));
