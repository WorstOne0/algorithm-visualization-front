// Utils
import type { Recorder } from "../recording";
import { barsMeta, barsSession, swapAt } from "./bars_recorder";

// Line numbers mirror the bubble sort listing in core/models/algorithms/sorting.ts.
export const recordBubble: Recorder = (n, seed) => {
  const { a, done, steps, push, finish } = barsSession(n, seed);
  let comparisons = 0;
  let swaps = 0;
  let pass = 0;
  const counters = () => ({ comparisons, swaps, pass, passUnit: `/ ${n - 1}`, inPlace: done.size, inPlaceUnit: `/ ${n}`, remaining: n - done.size });

  push(1, { en: `Start: ${n} values in random order. Each pass bubbles the largest unsorted value to the end.`, pt: `Início: ${n} valores em ordem aleatória. Cada passada leva o maior valor desordenado até o fim.` }, counters());
  for (let end = n - 1; end > 0; end--) {
    pass++;
    let swapped = false;
    push(2, { en: `Pass ${pass}: compare neighbours up to index ${end}.`, pt: `Passada ${pass}: compara vizinhos até o índice ${end}.` }, counters(), { range: [0, end] });
    for (let j = 0; j < end; j++) {
      comparisons++;
      const isOut = a[j] > a[j + 1];
      push(5, {
        en: `Compare a[${j}] = ${a[j]} with a[${j + 1}] = ${a[j + 1]}. ${isOut ? "Out of order." : "In order, move on."}`,
        pt: `Compara a[${j}] = ${a[j]} com a[${j + 1}] = ${a[j + 1]}. ${isOut ? "Fora de ordem." : "Em ordem, segue."}`,
      }, counters(), { i: j, j: j + 1, range: [0, end] });
      if (!isOut) continue;
      swapAt(a, j, j + 1);
      swaps++;
      swapped = true;
      push(6, { en: `Swap: ${a[j + 1]} moves right, ${a[j]} moves left.`, pt: `Troca: ${a[j + 1]} vai para a direita, ${a[j]} para a esquerda.` }, counters(), { i: j, j: j + 1, swap: true, range: [0, end] });
    }
    done.add(end);
    if (!swapped) {
      finish();
      push(10, { en: `No swap in this pass: the array is sorted. Early exit after ${pass} passes.`, pt: `Nenhuma troca nesta passada: o vetor está ordenado. Saída antecipada depois de ${pass} passadas.` }, counters());
      break;
    }
    push(10, { en: `Pass ${pass} done: a[${end}] = ${a[end]} is final.`, pt: `Passada ${pass} concluída: a[${end}] = ${a[end]} é definitivo.` }, counters());
  }
  finish();
  push(12, { en: `Done. ${comparisons} comparisons and ${swaps} swaps in ${pass} passes for n = ${n}.`, pt: `Pronto. ${comparisons} comparações e ${swaps} trocas em ${pass} passadas para n = ${n}.` }, counters());
  return { steps, meta: barsMeta(n, seed, steps.length) };
};
