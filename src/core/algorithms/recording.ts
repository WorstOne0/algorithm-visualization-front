// Models
import type { Localized } from "@/core/models/translations";

// A KPI value: a number, a preformatted string, or a word that needs translating.
export type Counter = number | string | Localized;

// Every player step carries the code line that produced it, the sentence for the panel and the KPI counters;
// the view-specific fields (bars, grid cells, nodes) are added by each recorder's own step type.
export type StepBase = { line: number; note: Localized; counters: Record<string, Counter> };

export type Recording<S extends StepBase = StepBase> = { steps: S[]; meta: Localized };

export type Recorder = (n: number, seed: number) => Recording;
