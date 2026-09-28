// Models
import { LOCALES, type Lang } from "@/core/models";

export const formatNumber = (value: number, lang: Lang) => value.toLocaleString(LOCALES[lang]);

// Millions and up read as "42 mi" / "42M" so a benchmark bar never pushes its number out of the card.
export const formatCompact = (value: number, lang: Lang) => (value < 1e6 ? formatNumber(value, lang) : new Intl.NumberFormat(LOCALES[lang], { notation: "compact", maximumFractionDigits: 1 }).format(value));
