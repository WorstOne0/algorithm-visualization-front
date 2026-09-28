// Utils
import type { Recorder } from "../recording";
import { barsMeta, barsSession, swapAt } from "./bars_recorder";

// Line numbers mirror the selection sort listing in core/models/algorithms/sorting.ts.
export const recordSelection: Recorder = (n, seed) => {
  const { a, done, steps, push, finish } = barsSession(n, seed);
  let comparisons = 0;
  let swaps = 0;
  let pass = 0;
  let minimum: number | string = "—";
  const counters = () => ({ comparisons, swaps, pass, passUnit: `/ ${n - 1}`, minimum, inPlace: done.size, inPlaceUnit: `/ ${n}` });

  push(1, { en: `Start: ${n} values. Each pass finds the minimum of the rest and swaps it to the front.`, pt: `Início: ${n} valores. Cada passada acha o mínimo do resto e o troca para a frente.` }, counters());
  for (let i = 0; i < n - 1; i++) {
    pass++;
    let min = i;
    minimum = a[i];
    push(3, { en: `Slot ${i}: the candidate minimum is array[${i}] = ${a[i]}.`, pt: `Vaga ${i}: o candidato a mínimo é array[${i}] = ${a[i]}.` }, counters(), { pivot: i, range: [i, n - 1] });
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const isSmaller = a[j] < a[min];
      push(5, {
        en: `Compare array[${j}] = ${a[j]} with the minimum array[${min}] = ${a[min]}. ${isSmaller ? "New minimum." : "Not smaller."}`,
        pt: `Compara array[${j}] = ${a[j]} com o mínimo array[${min}] = ${a[min]}. ${isSmaller ? "Novo mínimo." : "Não é menor."}`,
      }, counters(), { pivot: i, i: j, j: min, range: [i, n - 1] });
      if (!isSmaller) continue;
      min = j;
      minimum = a[j];
    }
    if (min !== i) {
      swapAt(a, i, min);
      swaps++;
      done.add(i);
      push(7, { en: `Swap array[${i}] with array[${min}]: ${a[i]} is now in place.`, pt: `Troca array[${i}] com array[${min}]: ${a[i]} está no lugar.` }, counters(), { pivot: i, i, j: min, swap: true, range: [i, n - 1] });
      continue;
    }
    done.add(i);
    push(7, { en: `array[${i}] = ${a[i]} was already the minimum: no swap.`, pt: `array[${i}] = ${a[i]} já era o mínimo: sem troca.` }, counters(), { pivot: i, range: [i, n - 1] });
  }
  finish();
  minimum = "—";
  push(9, { en: `Done. ${comparisons} comparisons and only ${swaps} swaps for n = ${n}.`, pt: `Pronto. ${comparisons} comparações e só ${swaps} trocas para n = ${n}.` }, counters());
  return { steps, meta: barsMeta(n, seed, steps.length) };
};
