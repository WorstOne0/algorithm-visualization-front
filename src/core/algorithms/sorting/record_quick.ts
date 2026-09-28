// Utils
import type { Recorder } from "../recording";
import { barsMeta, barsSession, swapAt } from "./bars_recorder";

// Line numbers mirror the quick sort listing in core/models/algorithms/sorting.ts.
export const recordQuick: Recorder = (n, seed) => {
  const { a, done, steps, push, finish } = barsSession(n, seed);
  let comparisons = 0;
  let swaps = 0;
  let depth = 0;
  let maxDepth = 0;
  let range = `[0, ${n - 1}]`;
  const counters = () => ({ comparisons, swaps, depth, depthUnit: "", range, inPlace: done.size, inPlaceUnit: `/ ${n}` });

  push(1, { en: `Start: ${n} values in random order. quickSort(a, 0, ${n - 1}) is called on the whole range.`, pt: `Início: ${n} valores em ordem aleatória. quickSort(a, 0, ${n - 1}) é chamado no intervalo inteiro.` }, counters());
  const rec = (lo: number, hi: number) => {
    depth++;
    maxDepth = Math.max(maxDepth, depth);
    range = `[${lo}, ${hi}]`;
    if (lo >= hi) {
      if (lo === hi) done.add(lo);
      push(2, {
        en: lo === hi ? `Range [${lo}, ${hi}] has one element. It is already in place.` : `Range [${lo}, ${hi}] is empty. Nothing to do.`,
        pt: lo === hi ? `Intervalo [${lo}, ${hi}] tem um elemento. Já está no lugar.` : `Intervalo [${lo}, ${hi}] está vazio. Nada a fazer.`,
      }, counters(), { range: [lo, Math.max(lo, hi)] });
      depth--;
      return;
    }
    const pivot = a[hi];
    let k = lo;
    push(3, { en: `Pivot is the last element of [${lo}, ${hi}]: a[${hi}] = ${pivot}.`, pt: `O pivô é o último elemento de [${lo}, ${hi}]: a[${hi}] = ${pivot}.` }, counters(), { pivot: hi, range: [lo, hi] });
    for (let j = lo; j < hi; j++) {
      comparisons++;
      const isSmaller = a[j] < pivot;
      push(6, {
        en: `Compare a[${j}] = ${a[j]} with the pivot ${pivot}. ${isSmaller ? "Smaller, so it moves left of the frontier." : "Not smaller, so it stays right."}`,
        pt: `Compara a[${j}] = ${a[j]} com o pivô ${pivot}. ${isSmaller ? "Menor, então vai para a esquerda da fronteira." : "Não é menor, fica à direita."}`,
      }, counters(), { i: j, pivot: hi, range: [lo, hi] });
      if (!isSmaller) continue;
      if (k !== j) {
        swapAt(a, k, j);
        swaps++;
      }
      push(7, { en: `Swap a[${k}] and a[${j}]. The frontier i moves to ${k + 1}.`, pt: `Troca a[${k}] com a[${j}]. A fronteira i avança para ${k + 1}.` }, counters(), { i: k, j, pivot: hi, swap: true, range: [lo, hi] });
      k++;
    }
    swapAt(a, k, hi);
    if (k !== hi) swaps++;
    done.add(k);
    push(11, {
      en: `Place the pivot at index ${k}. Everything left of it is smaller, everything right is not. Index ${k} is final.`,
      pt: `Coloca o pivô no índice ${k}. Tudo à esquerda é menor, tudo à direita não é. O índice ${k} é definitivo.`,
    }, counters(), { i: k, j: hi, pivot: k, swap: true, range: [lo, hi] });
    push(12, { en: `Recurse on the left part [${lo}, ${k - 1}].`, pt: `Recursão na parte esquerda [${lo}, ${k - 1}].` }, counters(), { range: [lo, Math.max(lo, k - 1)] });
    rec(lo, k - 1);
    push(13, { en: `Recurse on the right part [${k + 1}, ${hi}].`, pt: `Recursão na parte direita [${k + 1}, ${hi}].` }, counters(), { range: [Math.min(k + 1, hi), hi] });
    rec(k + 1, hi);
    depth--;
  };
  rec(0, n - 1);
  finish();
  range = "—";
  push(14, { en: `Done. ${comparisons} comparisons and ${swaps} swaps for n = ${n}. Max recursion depth ${maxDepth}.`, pt: `Pronto. ${comparisons} comparações e ${swaps} trocas para n = ${n}. Profundidade máxima ${maxDepth}.` }, counters());
  // The max depth is only known at the end.
  steps.forEach((step) => (step.counters.depthUnit = `/ ${maxDepth}`));
  return { steps, meta: barsMeta(n, seed, steps.length) };
};
