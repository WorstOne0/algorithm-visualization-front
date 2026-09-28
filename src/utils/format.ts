// Models
import { LOCALES, TRANSLATIONS, type Lang } from "@/core/models";

export const formatNumber = (value: number, lang: Lang) => value.toLocaleString(LOCALES[lang]);

export function timeAgo(iso: string, lang: Lang) {
  const t = TRANSLATIONS[lang];
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return t.justNow;
  if (minutes < 60) return t.minutesAgo.replace("{n}", String(minutes));
  if (minutes < 60 * 24) return t.hoursAgo.replace("{n}", String(Math.round(minutes / 60)));
  return t.daysAgo.replace("{n}", String(Math.round(minutes / 1440)));
}
