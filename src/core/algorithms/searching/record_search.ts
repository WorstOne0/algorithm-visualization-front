// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Recorder, StepBase } from "../recording";
import type { SearchState } from "./binary_search";

export type SearchStep = StepBase & SearchState;

// A sorted array of distinct values and a target picked from it; both searches record over it.
function searchSession(n: number, seed: number) {
  const rand = seeded(seed);
  const pool = new Set<number>();
  while (pool.size < n) pool.add(3 + Math.floor(rand() * 96));
  const a = [...pool].sort((x, y) => x - y);
  const target = Math.floor(rand() * n);
  const steps: SearchStep[] = [];
  const meta: Localized = { en: `n = ${n} · target ${a[target]} · seed ${seed}`, pt: `n = ${n} · alvo ${a[target]} · seed ${seed}` };
  return { a, target, steps, meta };
}

// Line numbers mirror the linear search listing in core/models/algorithms/searching.ts.
export const recordLinear: Recorder = (n, seed) => {
  const { a, target, steps, meta } = searchSession(n, seed);
  const value = a[target];
  let comparisons = 0;
  let result: number | string = "—";
  const push = (line: number, note: Localized, index: number, found: boolean) =>
    steps.push({ a, lo: 0, hi: n - 1, mid: index, target, found, line, note, counters: { comparisons, index: index < 0 ? "—" : index, target: value, checked: comparisons, checkedUnit: `/ ${n}`, result } });

  push(1, { en: `Look for ${value} in ${n} elements, from the first one on.`, pt: `Procura ${value} em ${n} elementos, a partir do primeiro.` }, -1, false);
  for (let i = 0; i < n; i++) {
    comparisons++;
    if (a[i] === value) {
      result = i;
      push(3, { en: `a[${i}] = ${a[i]} is the target. Return ${i} after ${comparisons} comparisons.`, pt: `a[${i}] = ${a[i]} é o alvo. Retorna ${i} depois de ${comparisons} comparações.` }, i, true);
      break;
    }
    push(3, { en: `a[${i}] = ${a[i]} is not ${value}. Move on.`, pt: `a[${i}] = ${a[i]} não é ${value}. Segue.` }, i, false);
  }
  steps.push({ ...steps[steps.length - 1], line: 6, note: { en: `Done. ${comparisons} of ${n} elements were checked.`, pt: `Pronto. ${comparisons} de ${n} elementos foram verificados.` } });
  return { steps, meta: { en: `${meta.en} · ${steps.length} steps`, pt: `${meta.pt} · ${steps.length} passos` } };
};

// Line numbers mirror the binary search listing in core/models/algorithms/searching.ts.
export const recordBinary: Recorder = (n, seed) => {
  const { a, target, steps, meta } = searchSession(n, seed);
  const value = a[target];
  let comparisons = 0;
  let lo = 0;
  let hi = n - 1;
  let result: number | string = "—";
  const push = (line: number, note: Localized, mid: number, found: boolean) =>
    steps.push({ a, lo, hi, mid, target, found, line, note, counters: { comparisons, range: Math.max(0, hi - lo + 1), rangeUnit: `/ ${n}`, mid: mid < 0 ? "—" : mid, target: value, result } });

  push(2, { en: `Look for ${value}. The whole range [0, ${n - 1}] is possible.`, pt: `Procura ${value}. A faixa inteira [0, ${n - 1}] é possível.` }, -1, false);
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    push(4, { en: `Probe the middle of [${lo}, ${hi}]: mid = ${mid}, a[${mid}] = ${a[mid]}.`, pt: `Sonda o meio de [${lo}, ${hi}]: mid = ${mid}, a[${mid}] = ${a[mid]}.` }, mid, false);
    comparisons++;
    if (a[mid] === value) {
      result = mid;
      push(5, { en: `a[${mid}] = ${value} is the target. Return ${mid} after ${comparisons} comparisons.`, pt: `a[${mid}] = ${value} é o alvo. Retorna ${mid} depois de ${comparisons} comparações.` }, mid, true);
      break;
    }
    if (a[mid] < value) {
      lo = mid + 1;
      push(6, { en: `${a[mid]} < ${value}: the target is to the right. Keep [${lo}, ${hi}].`, pt: `${a[mid]} < ${value}: o alvo está à direita. Mantém [${lo}, ${hi}].` }, mid, false);
      continue;
    }
    hi = mid - 1;
    push(7, { en: `${a[mid]} > ${value}: the target is to the left. Keep [${lo}, ${hi}].`, pt: `${a[mid]} > ${value}: o alvo está à esquerda. Mantém [${lo}, ${hi}].` }, mid, false);
  }
  steps.push({ ...steps[steps.length - 1], line: 10, note: { en: `Done. ${comparisons} probes for n = ${n}, against ⌈log₂ n⌉ + 1 = ${Math.ceil(Math.log2(n)) + 1} at most.`, pt: `Pronto. ${comparisons} sondagens para n = ${n}, contra ⌈log₂ n⌉ + 1 = ${Math.ceil(Math.log2(n)) + 1} no máximo.` } });
  return { steps, meta: { en: `${meta.en} · ${steps.length} steps`, pt: `${meta.pt} · ${steps.length} passos` } };
};
