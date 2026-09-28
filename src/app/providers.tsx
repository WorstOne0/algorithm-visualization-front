"use client";

// Next
import { useEffect } from "react";
// Controllers
import { useLanguageController, useRunsController, useThemeController } from "@/core/controllers";

export default function Providers({ children }: { children: React.ReactNode }) {
  const lang = useLanguageController((state) => state.lang);
  const theme = useThemeController((state) => state.theme);

  useEffect(() => {
    useLanguageController.persist.rehydrate();
    useThemeController.persist.rehydrate();
    useRunsController.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return children;
}
