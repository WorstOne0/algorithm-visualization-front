// Next
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
// Models
import type { Lang } from "@/core/models";

type LanguageController = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

export const useLanguageController = create<LanguageController>()(
  persist(
    (set) => ({
      lang: "en",
      setLang: (lang) => set({ lang }),
    }),
    {
      name: "av_lang",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
