// Utils
import type { Recorder } from "../recording";
import { barsMeta, barsSession } from "./bars_recorder";

// Line numbers mirror the insertion sort listing in core/models/algorithms/sorting.ts.
export const recordInsertion: Recorder = (n, seed) => {
  const { a, done, steps, push, finish } = barsSession(n, seed);
  let comparisons = 0;
  let shifts = 0;
  let key: number | string = "—";
  let gap: number | string = "—";
  let prefix = 1;
  const counters = () => ({ comparisons, shifts, key, prefix, prefixUnit: `/ ${n}`, gap });

  done.add(0);
  push(1, { en: `Start: a[0] = ${a[0]} alone is a sorted prefix of length 1.`, pt: `Início: a[0] = ${a[0]} sozinho é um prefixo ordenado de tamanho 1.` }, counters());
  for (let i = 1; i < n; i++) {
    key = a[i];
    let j = i - 1;
    gap = i;
    push(3, { en: `Lift the key a[${i}] = ${key} out. The prefix [0, ${i - 1}] is sorted.`, pt: `Levanta a chave a[${i}] = ${key}. O prefixo [0, ${i - 1}] está ordenado.` }, counters(), { held: { index: i, value: key }, range: [0, i] });
    while (j >= 0) {
      comparisons++;
      const isBigger = a[j] > key;
      push(5, {
        en: `Compare a[${j}] = ${a[j]} with the key ${key}. ${isBigger ? "Bigger: shift it right." : "Not bigger: the key goes after it."}`,
        pt: `Compara a[${j}] = ${a[j]} com a chave ${key}. ${isBigger ? "Maior: desloca para a direita." : "Não é maior: a chave vai depois dele."}`,
      }, counters(), { i: j, held: { index: j + 1, value: key }, range: [0, i] });
      if (!isBigger) break;
      a[j + 1] = a[j];
      shifts++;
      gap = j;
      push(6, { en: `Shift ${a[j]} from index ${j} to ${j + 1}. The gap moves to ${j}.`, pt: `Desloca ${a[j]} do índice ${j} para ${j + 1}. O buraco vai para ${j}.` }, counters(), { i: j, j: j + 1, swap: true, held: { index: j, value: key }, range: [0, i] });
      j--;
    }
    a[j + 1] = key;
    prefix = i + 1;
    done.add(i);
    push(9, { en: `Drop the key ${key} at index ${j + 1}. The prefix [0, ${i}] is sorted.`, pt: `Solta a chave ${key} no índice ${j + 1}. O prefixo [0, ${i}] está ordenado.` }, counters(), { pivot: j + 1, range: [0, i] });
  }
  finish();
  key = "—";
  gap = "—";
  push(11, { en: `Done. ${comparisons} comparisons and ${shifts} shifts for n = ${n}.`, pt: `Pronto. ${comparisons} comparações e ${shifts} deslocamentos para n = ${n}.` }, counters());
  return { steps, meta: barsMeta(n, seed, steps.length) };
};
