// Utils
import type { Recorder } from "../recording";
import { barsMeta, barsSession, swapAt } from "./bars_recorder";

// Line numbers in every recorder mirror the listings in core/models/algorithms/sorting_more.ts.

export const recordCocktail: Recorder = (n, seed) => {
  const { a, done, steps, push, finish } = barsSession(n, seed);
  let comparisons = 0;
  let swaps = 0;
  let pass = 0;
  const counters = () => ({ comparisons, swaps, pass, inPlace: done.size, inPlaceUnit: `/ ${n}`, remaining: n - done.size });

  push(1, { en: `Start: ${n} values. Each round sweeps right to carry the largest up, then left to carry the smallest down.`, pt: `Início: ${n} valores. Cada rodada varre à direita levando o maior para cima, depois à esquerda levando o menor para baixo.` }, counters());
  let low = 0;
  let high = n - 1;
  while (low < high) {
    pass++;
    push(3, { en: `Round ${pass}: the unsorted window is [${low}, ${high}].`, pt: `Rodada ${pass}: a janela desordenada é [${low}, ${high}].` }, counters(), { range: [low, high] });
    let swapped = false;
    for (let j = low; j < high; j++) {
      comparisons++;
      const isOut = a[j] > a[j + 1];
      push(5, { en: `Rightwards: compare array[${j}] = ${a[j]} with array[${j + 1}] = ${a[j + 1]}.${isOut ? " Out of order: swap." : ""}`, pt: `Para a direita: compara array[${j}] = ${a[j]} com array[${j + 1}] = ${a[j + 1]}.${isOut ? " Fora de ordem: troca." : ""}` }, counters(), { i: j, j: j + 1, range: [low, high], swap: isOut });
      if (!isOut) continue;
      swapAt(a, j, j + 1);
      swaps++;
      swapped = true;
    }
    done.add(high);
    high--;
    push(7, { en: `The largest of the window, ${a[high + 1]}, is in place at ${high + 1}.`, pt: `O maior da janela, ${a[high + 1]}, está no lugar em ${high + 1}.` }, counters(), { range: [low, high] });
    if (!swapped) break;
    for (let j = high; j > low; j--) {
      comparisons++;
      const isOut = a[j - 1] > a[j];
      push(9, { en: `Leftwards: compare array[${j - 1}] = ${a[j - 1]} with array[${j}] = ${a[j]}.${isOut ? " Out of order: swap." : ""}`, pt: `Para a esquerda: compara array[${j - 1}] = ${a[j - 1]} com array[${j}] = ${a[j]}.${isOut ? " Fora de ordem: troca." : ""}` }, counters(), { i: j - 1, j, range: [low, high], swap: isOut });
      if (!isOut) continue;
      swapAt(a, j - 1, j);
      swaps++;
    }
    done.add(low);
    low++;
    push(11, { en: `The smallest of the window, ${a[low - 1]}, is in place at ${low - 1}.`, pt: `O menor da janela, ${a[low - 1]}, está no lugar em ${low - 1}.` }, counters(), { range: [low, high] });
  }
  finish();
  push(13, { en: `Done. ${comparisons} comparisons and ${swaps} swaps in ${pass} rounds, each round settling both ends.`, pt: `Pronto. ${comparisons} comparações e ${swaps} trocas em ${pass} rodadas, cada rodada assentando as duas pontas.` }, counters());
  return { steps, meta: barsMeta(n, seed, steps.length) };
};

export const recordGnome: Recorder = (n, seed) => {
  const { a, steps, push, finish } = barsSession(n, seed);
  let comparisons = 0;
  let swaps = 0;
  let backSteps = 0;
  let index = 0;
  const counters = () => ({ comparisons, swaps, index, backSteps, prefix: index });

  push(2, { en: `Start at index 0. The gnome keeps everything left of it sorted.`, pt: `Começa no índice 0. O gnomo mantém tudo à esquerda dele ordenado.` }, counters(), { i: 0 });
  while (index < n) {
    if (index === 0) {
      index++;
      push(5, { en: `At the front: nothing to compare, step forward to ${index}.`, pt: `No começo: nada a comparar, avança para ${index}.` }, counters(), { i: index, range: [0, index] });
      continue;
    }
    comparisons++;
    const inOrder = a[index - 1] <= a[index];
    push(4, { en: `Compare array[${index - 1}] = ${a[index - 1]} with array[${index}] = ${a[index]}: ${inOrder ? "in order." : "out of order."}`, pt: `Compara array[${index - 1}] = ${a[index - 1]} com array[${index}] = ${a[index]}: ${inOrder ? "em ordem." : "fora de ordem."}` }, counters(), { i: index - 1, j: index, range: [0, index] });
    if (inOrder) {
      index++;
      push(5, { en: `Step forward to ${index}.`, pt: `Avança para ${index}.` }, counters(), { i: index, range: [0, Math.min(index, n - 1)] });
      continue;
    }
    swapAt(a, index - 1, index);
    swaps++;
    push(7, { en: `Swap them: ${a[index - 1]} moves left.`, pt: `Troca: ${a[index - 1]} vai para a esquerda.` }, counters(), { i: index - 1, j: index, swap: true, range: [0, index] });
    index--;
    backSteps++;
    push(8, { en: `Step back to ${index} and check the pair there too.`, pt: `Volta para ${index} e confere o par dali também.` }, counters(), { i: index, range: [0, index] });
  }
  finish();
  push(11, { en: `Done. ${comparisons} comparisons, ${swaps} swaps and ${backSteps} steps back: gnome sort is insertion sort with swaps instead of shifts.`, pt: `Pronto. ${comparisons} comparações, ${swaps} trocas e ${backSteps} passos atrás: o gnome sort é o insertion sort com trocas em vez de deslocamentos.` }, counters());
  return { steps, meta: barsMeta(n, seed, steps.length) };
};

export const recordComb: Recorder = (n, seed) => {
  const { a, steps, push, finish } = barsSession(n, seed);
  let comparisons = 0;
  let swaps = 0;
  let pass = 0;
  let gap = n;
  const counters = () => ({ comparisons, swaps, gap, pass, shrink: "1.3" });

  push(2, { en: `Start with gap = ${n}, the whole array. Comparing far apart first kills the small values stuck at the end.`, pt: `Começa com gap = ${n}, o vetor inteiro. Comparar de longe primeiro elimina os valores pequenos presos no fim.` }, counters());
  let swapped = true;
  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / 1.3));
    swapped = false;
    pass++;
    push(5, { en: `Pass ${pass}: gap shrinks to ${gap}${gap === 1 ? ", plain bubble passes from here on" : ""}.`, pt: `Passada ${pass}: o gap encolhe para ${gap}${gap === 1 ? ", passadas de bubble sort daqui em diante" : ""}.` }, counters());
    for (let i = 0; i + gap < n; i++) {
      comparisons++;
      const isOut = a[i] > a[i + gap];
      push(8, { en: `Compare array[${i}] = ${a[i]} with array[${i + gap}] = ${a[i + gap]}, ${gap} apart.${isOut ? " Out of order." : ""}`, pt: `Compara array[${i}] = ${a[i]} com array[${i + gap}] = ${a[i + gap]}, a ${gap} de distância.${isOut ? " Fora de ordem." : ""}` }, counters(), { i, j: i + gap });
      if (!isOut) continue;
      swapAt(a, i, i + gap);
      swaps++;
      swapped = true;
      push(9, { en: `Swap: ${a[i + gap]} jumps ${gap} places right.`, pt: `Troca: ${a[i + gap]} salta ${gap} posições para a direita.` }, counters(), { i, j: i + gap, swap: true });
    }
  }
  finish();
  push(14, { en: `Done. ${comparisons} comparisons and ${swaps} swaps in ${pass} passes; the gap sequence did most of the work before gap 1.`, pt: `Pronto. ${comparisons} comparações e ${swaps} trocas em ${pass} passadas; a sequência de gaps fez a maior parte do trabalho antes do gap 1.` }, counters());
  return { steps, meta: barsMeta(n, seed, steps.length) };
};

export const recordShell: Recorder = (n, seed) => {
  const { a, steps, push, finish } = barsSession(n, seed);
  let comparisons = 0;
  let shifts = 0;
  let passes = 0;
  let gap = 0;
  let key: number | string = "—";
  const counters = () => ({ comparisons, shifts, gap, passes, key });

  for (gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    passes++;
    push(2, { en: `Gap ${gap}: insertion sort every subsequence of elements ${gap} apart.`, pt: `Gap ${gap}: insertion sort em cada subsequência de elementos a ${gap} de distância.` }, counters());
    for (let i = gap; i < n; i++) {
      key = a[i];
      let j = i;
      push(4, { en: `Lift array[${i}] = ${key}; compare it with the elements ${gap} to its left.`, pt: `Levanta array[${i}] = ${key}; compara com os elementos ${gap} à esquerda.` }, counters(), { held: { index: i, value: key }, i });
      while (j >= gap) {
        comparisons++;
        const bigger = a[j - gap] > key;
        push(6, { en: `Compare array[${j - gap}] = ${a[j - gap]} with ${key}: ${bigger ? "bigger, shift it right." : "not bigger, the key goes at " + j + "."}`, pt: `Compara array[${j - gap}] = ${a[j - gap]} com ${key}: ${bigger ? "maior, desloca para a direita." : "não é maior, a chave vai em " + j + "."}` }, counters(), { held: { index: i, value: key }, i: j - gap, j });
        if (!bigger) break;
        a[j] = a[j - gap];
        shifts++;
        j -= gap;
        push(7, { en: `Shift ${a[j + gap]} from ${j} to ${j + gap}.`, pt: `Desloca ${a[j + gap]} de ${j} para ${j + gap}.` }, counters(), { held: { index: i, value: key }, i: j, j: j + gap, swap: true });
      }
      a[j] = key;
      push(10, { en: `Place ${key} at index ${j}.`, pt: `Coloca ${key} no índice ${j}.` }, counters(), { i: j, swap: true });
    }
  }
  gap = 0;
  key = "—";
  finish();
  push(13, { en: `Done. ${comparisons} comparisons and ${shifts} shifts over ${passes} gap passes; the last pass (gap 1) found the array nearly sorted.`, pt: `Pronto. ${comparisons} comparações e ${shifts} deslocamentos em ${passes} passadas de gap; a última passada (gap 1) encontrou o vetor quase ordenado.` }, counters());
  return { steps, meta: barsMeta(n, seed, steps.length) };
};

export const recordOddEven: Recorder = (n, seed) => {
  const { a, steps, push, finish } = barsSession(n, seed);
  let comparisons = 0;
  let swaps = 0;
  let rounds = 0;
  let phase = "—";
  const counters = () => ({ comparisons, swaps, rounds, phase, pairs: Math.floor(n / 2) });

  push(2, { en: `Start. Each round has two phases: odd pairs (1-2, 3-4, …) then even pairs (0-1, 2-3, …); every pair in a phase is independent.`, pt: `Início. Cada rodada tem duas fases: pares ímpares (1-2, 3-4, …) e depois pares pares (0-1, 2-3, …); todo par de uma fase é independente.` }, counters());
  let sorted = false;
  while (!sorted) {
    sorted = true;
    rounds++;
    for (const [start, line, name] of [[1, 6, "odd"], [0, 9, "even"]] as const) {
      phase = name;
      push(line === 6 ? 3 : 8, { en: `Round ${rounds}, ${name} phase: pairs starting at ${start}.`, pt: `Rodada ${rounds}, fase ${name === "odd" ? "ímpar" : "par"}: pares começando em ${start}.` }, counters());
      for (let i = start; i + 1 < n; i += 2) {
        comparisons++;
        const isOut = a[i] > a[i + 1];
        push(line, { en: `Compare array[${i}] = ${a[i]} with array[${i + 1}] = ${a[i + 1]}.${isOut ? " Swap." : ""}`, pt: `Compara array[${i}] = ${a[i]} com array[${i + 1}] = ${a[i + 1]}.${isOut ? " Troca." : ""}` }, counters(), { i, j: i + 1, swap: isOut });
        if (!isOut) continue;
        swapAt(a, i, i + 1);
        swaps++;
        sorted = false;
      }
    }
  }
  phase = "—";
  finish();
  push(12, { en: `Done. ${comparisons} comparisons and ${swaps} swaps in ${rounds} rounds; with ${Math.floor(n / 2)} processors each round would take one step.`, pt: `Pronto. ${comparisons} comparações e ${swaps} trocas em ${rounds} rodadas; com ${Math.floor(n / 2)} processadores cada rodada levaria um passo.` }, counters());
  return { steps, meta: barsMeta(n, seed, steps.length) };
};

export const recordRadix: Recorder = (n, seed) => {
  const { a, steps, push, finish } = barsSession(n, seed);
  let reads = 0;
  let writes = 0;
  let pass = 0;
  let digit: number | string = "—";
  const counters = () => ({ pass, passUnit: "/ 2", digit, reads, writes, comparisons: 0 });

  const max = Math.max(...a);
  push(2, { en: `The largest value is ${max}: two digits, so two passes. No comparison is ever made.`, pt: `O maior valor é ${max}: dois dígitos, então duas passadas. Nenhuma comparação é feita.` }, counters());
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    pass++;
    const place = exp === 1 ? { en: "units", pt: "unidades" } : { en: "tens", pt: "dezenas" };
    push(3, { en: `Pass ${pass}: bucket every value by its ${place.en} digit, keeping the current order inside each bucket.`, pt: `Passada ${pass}: distribui cada valor pelo dígito das ${place.pt}, mantendo a ordem atual dentro de cada balde.` }, counters());
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    a.forEach((value, i) => {
      digit = Math.floor(value / exp) % 10;
      buckets[digit].push(value);
      reads++;
      push(5, { en: `array[${i}] = ${value}: ${place.en} digit ${digit}, into bucket ${digit} (now ${buckets[digit].length} value${buckets[digit].length > 1 ? "s" : ""}).`, pt: `array[${i}] = ${value}: dígito das ${place.pt} ${digit}, para o balde ${digit} (agora com ${buckets[digit].length} valor${buckets[digit].length > 1 ? "es" : ""}).` }, counters(), { i, held: { index: i, value } });
    });
    let index = 0;
    for (let b = 0; b < 10; b++) {
      for (const value of buckets[b]) {
        a[index] = value;
        writes++;
        digit = b;
        push(7, { en: `Write bucket ${b} back: array[${index}] = ${value}.`, pt: `Escreve o balde ${b} de volta: array[${index}] = ${value}.` }, counters(), { i: index, swap: true, range: [0, index] });
        index++;
      }
    }
    push(7, { en: `After pass ${pass} the array is sorted by the ${place.en} digit${pass === 2 ? " and, because the pass was stable, by the whole value" : ""}.`, pt: `Depois da passada ${pass} o vetor está ordenado pelo dígito das ${place.pt}${pass === 2 ? " e, como a passada foi estável, pelo valor inteiro" : ""}.` }, counters());
  }
  digit = "—";
  finish();
  push(9, { en: `Done. ${reads} reads and ${writes} writes, zero comparisons: ${n} values sorted in 2 × ${n} moves.`, pt: `Pronto. ${reads} leituras e ${writes} escritas, zero comparações: ${n} valores ordenados em 2 × ${n} movimentos.` }, counters());
  return { steps, meta: barsMeta(n, seed, steps.length) };
};
