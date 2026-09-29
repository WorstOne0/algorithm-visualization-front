// Models
import type { Counter } from "@/core/algorithms/recording";
import { localize, LOCALES, type Lang } from "@/core/models";

export const formatNumber = (value: number, lang: Lang) => value.toLocaleString(LOCALES[lang]);

// A KPI counter as text: numbers as they are, words through the translation.
export const counterText = (value: Counter | undefined, lang: Lang) => (value === undefined ? "" : typeof value === "object" ? localize(value, lang) : String(value));

// Millions and up read as "42 mi" / "42M" so a benchmark bar never pushes its number out of the card.
export const formatCompact = (value: number, lang: Lang) => (value < 1e6 ? formatNumber(value, lang) : new Intl.NumberFormat(LOCALES[lang], { notation: "compact", maximumFractionDigits: 1 }).format(value));
