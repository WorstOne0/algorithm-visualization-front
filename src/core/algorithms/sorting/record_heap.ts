// Utils
import type { Recorder } from "../recording";
import { barsMeta, barsSession, swapAt } from "./bars_recorder";

// Line numbers mirror the heap sort listing in core/models/algorithms/sorting.ts.
export const recordHeap: Recorder = (n, seed) => {
  const { a, done, steps, push, finish } = barsSession(n, seed);
  let comparisons = 0;
  let swaps = 0;
  let heapSize = n;
  let phase = { en: "build", pt: "montar" };
  const counters = () => ({ comparisons, swaps, heapSize, heapUnit: `/ ${n}`, phase, inPlace: done.size, inPlaceUnit: `/ ${n}` });
  const heapRange = (): [number, number] => [0, heapSize - 1];

  push(1, { en: `Start: ${n} values read as a binary tree: the children of i are 2i + 1 and 2i + 2.`, pt: `Início: ${n} valores lidos como uma árvore binária: os filhos de i são 2i + 1 e 2i + 2.` }, counters());
  const sift = (start: number, size: number) => {
    let i = start;
    while (true) {
      const l = 2 * i + 1;
      const r = l + 1;
      let m = i;
      if (l < size) {
        comparisons++;
        push(13, { en: `Compare the left child a[${l}] = ${a[l]} with a[${m}] = ${a[m]}.`, pt: `Compara o filho esquerdo a[${l}] = ${a[l]} com a[${m}] = ${a[m]}.` }, counters(), { i: l, j: m, pivot: i, range: heapRange() });
        if (a[l] > a[m]) m = l;
      }
      if (r < size) {
        comparisons++;
        push(14, { en: `Compare the right child a[${r}] = ${a[r]} with a[${m}] = ${a[m]}.`, pt: `Compara o filho direito a[${r}] = ${a[r]} com a[${m}] = ${a[m]}.` }, counters(), { i: r, j: m, pivot: i, range: heapRange() });
        if (a[r] > a[m]) m = r;
      }
      if (m === i) {
        push(15, { en: `a[${i}] = ${a[i]} is at least as large as its children: the heap holds here.`, pt: `a[${i}] = ${a[i]} é pelo menos tão grande quanto os filhos: o heap vale aqui.` }, counters(), { pivot: i, range: heapRange() });
        return;
      }
      swapAt(a, i, m);
      swaps++;
      push(16, { en: `Swap a[${i}] with a[${m}]: ${a[i]} moves up, ${a[m]} sinks.`, pt: `Troca a[${i}] com a[${m}]: ${a[i]} sobe, ${a[m]} desce.` }, counters(), { i, j: m, swap: true, range: heapRange() });
      i = m;
    }
  };
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    push(3, { en: `Build the heap: sift down from index ${i}.`, pt: `Monta o heap: desce a partir do índice ${i}.` }, counters(), { pivot: i, range: heapRange() });
    sift(i, n);
  }
  phase = { en: "pop", pt: "retirar" };
  for (let end = n - 1; end > 0; end--) {
    swapAt(a, 0, end);
    swaps++;
    heapSize = end;
    done.add(end);
    push(5, { en: `Pop: swap the maximum ${a[end]} with a[${end}]. Index ${end} is final and the heap shrinks to ${end}.`, pt: `Retira: troca o máximo ${a[end]} com a[${end}]. O índice ${end} é definitivo e o heap encolhe para ${end}.` }, counters(), { i: 0, j: end, swap: true, range: heapRange() });
    push(6, { en: `Sift the new root ${a[0]} down inside the heap of size ${end}.`, pt: `Desce a nova raiz ${a[0]} dentro do heap de tamanho ${end}.` }, counters(), { pivot: 0, range: heapRange() });
    sift(0, end);
  }
  heapSize = 0;
  finish();
  push(8, { en: `Done. ${comparisons} comparisons and ${swaps} swaps for n = ${n}.`, pt: `Pronto. ${comparisons} comparações e ${swaps} trocas para n = ${n}.` }, counters());
  return { steps, meta: barsMeta(n, seed, steps.length) };
};
