// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Counter, StepBase } from "../recording";
import type { SortState } from "./sorts";

// `range` dims everything outside the current call; `held` is a value lifted out of the array (insertion's key).
export type BarsStep = StepBase & SortState & { range?: [number, number]; held?: { index: number; value: number } };

type View = Partial<Pick<BarsStep, "i" | "j" | "pivot" | "swap" | "range" | "held">>;

// The array, the settled set and the step list every sorting recorder writes into.
export function barsSession(n: number, seed: number) {
  const rand = seeded(seed);
  const a = Array.from({ length: n }, () => 5 + Math.floor(rand() * 95));
  const done = new Set<number>();
  const steps: BarsStep[] = [];
  const push = (line: number, note: Localized, counters: Record<string, Counter>, view: View = {}) =>
    steps.push({ a: a.slice(), done: new Set(done), i: -1, j: -1, swap: false, line, note, counters, ...view });
  const finish = () => {
    for (let k = 0; k < n; k++) done.add(k);
  };
  return { a, done, steps, push, finish };
}

export const swapAt = (a: number[], i: number, j: number) => {
  const t = a[i];
  a[i] = a[j];
  a[j] = t;
};

export const barsMeta = (n: number, seed: number, steps: number): Localized => ({ en: `n = ${n} · seed ${seed} · ${steps} steps`, pt: `n = ${n} · seed ${seed} · ${steps} passos` });
