// Next
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
// Models
import type { Theme } from "@/core/models";

type ThemeController = {
  theme: Theme;
  toggleTheme: () => void;
};

// The inline script in app/layout.tsx reads the same "av_theme" key before first paint.
export const useThemeController = create<ThemeController>()(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
    }),
    {
      name: "av_theme",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
