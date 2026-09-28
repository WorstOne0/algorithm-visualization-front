// Models
import type { CodeLang } from "../code";
import type { FamilyId } from "../families";
import type { Localized } from "../translations";
import type { VizKey } from "../viz";

// Which player renderer draws the steps (utils/viz/draw_step.ts).
export type AlgorithmKind = "bars" | "search" | "grid" | "graph" | "tree" | "btree" | "gametree";

// One KPI tile: `key` reads the step's counters; `unitKey` names a counter holding the unit text.
export type KpiSpec = { key: string; label: Localized; sub: Localized; unitKey?: string };

export type AlgorithmSpec = {
  family: FamilyId;
  slug: string;
  kind: AlgorithmKind;
  name: string;
  subtitle: Localized;
  sizeLabel: Localized;
  minN: number;
  maxN: number;
  stepN: number;
  defaultN: number;
  shuffleLabel: Localized;
  // Milliseconds per step at 1×.
  stepMs: number;
  legend: [VizKey, Localized][];
  kpis: KpiSpec[];
  tagline: Localized;
  idea: Localized<string[]>;
  stages: [VizKey, Localized, Localized][];
  complexity: [Localized, string, VizKey, Localized][];
  chartTitle: Localized;
  chart: [string, number, boolean?][];
  chartNote: Localized;
  when: Localized<string[]>;
  pitfalls: Localized<string[]>;
  history: Localized;
  file: string;
  // Every listing keeps the same line count and the same line ↔ step mapping as the recorder.
  code: Record<CodeLang, string[]>;
  pseudo: Localized<string[]>;
};
