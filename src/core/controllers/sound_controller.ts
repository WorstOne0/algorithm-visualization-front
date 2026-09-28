// Next
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SoundController = {
  sound: boolean;
  toggleSound: () => void;
};

// Off by default; the player blips once per step while it plays.
export const useSoundController = create<SoundController>()(
  persist(
    (set) => ({
      sound: false,
      toggleSound: () => set((state) => ({ sound: !state.sound })),
    }),
    {
      name: "av_sound",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
