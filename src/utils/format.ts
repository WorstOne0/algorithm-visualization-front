// Models
import { LOCALES, type Lang } from "@/core/models";

export const formatNumber = (value: number, lang: Lang) => value.toLocaleString(LOCALES[lang]);
