// Utils
import type { Recorder } from "../recording";
import { barsMeta, barsSession } from "./bars_recorder";

// Line numbers mirror the merge sort listing in core/models/algorithms/sorting.ts.
export const recordMerge: Recorder = (n, seed) => {
  const { a, steps, push, finish } = barsSession(n, seed);
  const maxDepth = Math.ceil(Math.log2(n)) + 1;
  let comparisons = 0;
  let writes = 0;
  let merges = 0;
  let depth = 0;
  let range = `[0, ${n - 1}]`;
  const counters = () => ({ comparisons, writes, depth, depthUnit: `/ ${maxDepth}`, range, merges });

  push(1, { en: `Start: ${n} values. mergeSort(a, 0, ${n - 1}) splits until the ranges have one element, then merges.`, pt: `Início: ${n} valores. mergeSort(a, 0, ${n - 1}) divide até os intervalos terem um elemento, depois funde.` }, counters());
  const sort = (lo: number, hi: number) => {
    depth++;
    range = `[${lo}, ${hi}]`;
    if (hi - lo < 1) {
      push(2, { en: `[${lo}, ${hi}] has one element: sorted by definition.`, pt: `[${lo}, ${hi}] tem um elemento: ordenado por definição.` }, counters(), { range: [lo, hi] });
      depth--;
      return;
    }
    const mid = (lo + hi) >> 1;
    push(3, { en: `Split [${lo}, ${hi}] at ${mid}: sort [${lo}, ${mid}] and [${mid + 1}, ${hi}], then merge them.`, pt: `Divide [${lo}, ${hi}] em ${mid}: ordena [${lo}, ${mid}] e [${mid + 1}, ${hi}], depois funde.` }, counters(), { pivot: mid, range: [lo, hi] });
    sort(lo, mid);
    sort(mid + 1, hi);
    range = `[${lo}, ${hi}]`;
    const tmp: number[] = [];
    let i = lo;
    let j = mid + 1;
    push(7, { en: `Merge [${lo}, ${mid}] with [${mid + 1}, ${hi}]: compare the fronts, take the smaller.`, pt: `Funde [${lo}, ${mid}] com [${mid + 1}, ${hi}]: compara as frentes, pega o menor.` }, counters(), { i, j, range: [lo, hi] });
    while (i <= mid && j <= hi) {
      comparisons++;
      const takeLeft = a[i] <= a[j];
      push(takeLeft ? 9 : 10, {
        en: `Compare a[${i}] = ${a[i]} with a[${j}] = ${a[j]}: take ${takeLeft ? a[i] : a[j]} into the buffer.`,
        pt: `Compara a[${i}] = ${a[i]} com a[${j}] = ${a[j]}: leva ${takeLeft ? a[i] : a[j]} para o buffer.`,
      }, counters(), { i, j, range: [lo, hi] });
      if (takeLeft) tmp.push(a[i++]);
      else tmp.push(a[j++]);
    }
    while (i <= mid) {
      tmp.push(a[i]);
      push(12, { en: `The right half is spent: copy a[${i}] = ${a[i]} into the buffer.`, pt: `A metade direita acabou: copia a[${i}] = ${a[i]} para o buffer.` }, counters(), { i, range: [lo, hi] });
      i++;
    }
    while (j <= hi) {
      tmp.push(a[j]);
      push(13, { en: `The left half is spent: copy a[${j}] = ${a[j]} into the buffer.`, pt: `A metade esquerda acabou: copia a[${j}] = ${a[j]} para o buffer.` }, counters(), { i: j, range: [lo, hi] });
      j++;
    }
    for (let k = 0; k < tmp.length; k++) {
      a[lo + k] = tmp[k];
      writes++;
      push(14, { en: `Write ${tmp[k]} back to index ${lo + k}.`, pt: `Escreve ${tmp[k]} de volta no índice ${lo + k}.` }, counters(), { i: lo + k, swap: true, range: [lo, hi] });
    }
    merges++;
    depth--;
  };
  sort(0, n - 1);
  finish();
  range = "—";
  push(15, { en: `Done. ${comparisons} comparisons, ${writes} writes and ${merges} merges for n = ${n}.`, pt: `Pronto. ${comparisons} comparações, ${writes} escritas e ${merges} fusões para n = ${n}.` }, counters());
  return { steps, meta: barsMeta(n, seed, steps.length) };
};
