// Utils
import { seeded } from "../random";
import type { Recorder } from "../recording";
import { barsMeta, barsSession, swapAt } from "./bars_recorder";

// Line numbers in every recorder mirror the listings in core/models/algorithms/sorting_fun.ts.

// Bogo sort has no upper bound; the recording stops here so the page always ends.
const MAX_SHUFFLES = 400;

const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

export const recordBogo: Recorder = (n, seed) => {
  const { a, steps, push, finish } = barsSession(n, seed);
  const rand = seeded(seed * 31 + 7);
  let shuffles = 0;
  let comparisons = 0;
  let checks = 0;
  let prefix = 0;
  const expected = factorial(n);
  const counters = () => ({ shuffles, comparisons, checks, expected, prefix });

  push(1, { en: `Start: ${n} values in random order. Bogo sort shuffles until the array happens to be sorted; with ${n} values that takes ${expected} shuffles on average (n! = ${expected}).`, pt: `Início: ${n} valores em ordem aleatória. O bogo sort embaralha até o array por acaso estar ordenado; com ${n} valores isso leva ${expected} embaralhamentos em média (n! = ${expected}).` }, counters());
  while (true) {
    checks++;
    let failAt = -1;
    for (let k = 1; k < n; k++) {
      comparisons++;
      if (a[k - 1] > a[k]) {
        failAt = k;
        break;
      }
    }
    prefix = failAt < 0 ? n : failAt;
    if (failAt < 0) {
      finish();
      push(8, { en: `Check ${checks}: every neighbour is in order. Sorted after ${shuffles} shuffle${shuffles === 1 ? "" : "s"}, ${expected} expected. ${shuffles < expected ? "Lucky." : "Unlucky."}`, pt: `Verificação ${checks}: todo vizinho está em ordem. Ordenado depois de ${shuffles} embaralhamento${shuffles === 1 ? "" : "s"}, ${expected} esperados. ${shuffles < expected ? "Sorte." : "Azar."}` }, counters());
      break;
    }
    push(7, { en: `Check ${checks}: array[${failAt - 1}] = ${a[failAt - 1]} > array[${failAt}] = ${a[failAt]}, so it is not sorted; the first ${failAt} value${failAt === 1 ? "" : "s"} were in order.`, pt: `Verificação ${checks}: array[${failAt - 1}] = ${a[failAt - 1]} > array[${failAt}] = ${a[failAt]}, então não está ordenado; os primeiros ${failAt} valor${failAt === 1 ? "" : "es"} estavam em ordem.` }, counters(), { i: failAt - 1, j: failAt });
    if (shuffles >= MAX_SHUFFLES) {
      push(2, { en: `Giving up after ${MAX_SHUFFLES} shuffles: bogo sort has no upper bound, and with ${n} values the expected count is ${expected}. Press Shuffle for a luckier seed, or lower n.`, pt: `Desistindo depois de ${MAX_SHUFFLES} embaralhamentos: o bogo sort não tem limite superior, e com ${n} valores a contagem esperada é ${expected}. Aperte Embaralhar para uma seed mais sortuda, ou reduza n.` }, counters());
      break;
    }
    for (let k = n - 1; k > 0; k--) swapAt(a, k, Math.floor(rand() * (k + 1)));
    shuffles++;
    push(11, { en: `Shuffle ${shuffles}: a fresh random permutation, ${n - 1} swaps. Each one has a 1 in ${expected} chance of being the sorted one.`, pt: `Embaralhamento ${shuffles}: uma permutação aleatória nova, ${n - 1} trocas. Cada uma tem 1 chance em ${expected} de ser a ordenada.` }, counters(), { swap: true });
  }
  return { steps, meta: barsMeta(n, seed, steps.length) };
};

export const recordSleep: Recorder = (n, seed) => {
  const { a, steps, push, finish } = barsSession(n, seed);
  const original = a.slice();
  const max = Math.max(...original);
  let fired = 0;
  let elapsed = 0;
  let ties = 0;
  const counters = () => ({ timers: n, fired, firedUnit: `/ ${n}`, elapsed: `${elapsed} ms`, wall: `${max} ms`, ties });

  push(1, { en: `${n} values. Sleep sort starts one timer per value that sleeps that many milliseconds; whoever wakes first is printed first, so the output comes out sorted.`, pt: `${n} valores. O sleep sort inicia um timer por valor que dorme essa quantidade de milissegundos; quem acorda primeiro é impresso primeiro, então a saída sai ordenada.` }, counters());
  original.forEach((value, k) => {
    push(4, { en: `array[${k}] = ${value}: schedule a timer for ${value} ms. Nothing is compared to anything.`, pt: `array[${k}] = ${value}: agenda um timer de ${value} ms. Nada é comparado com nada.` }, counters(), { i: k });
  });
  // The array on stage becomes [output so far, then the values still sleeping]; a timer fires in value order, ties in scheduling order.
  const order = original.map((value, k) => ({ value, k })).sort((p, q) => p.value - q.value || p.k - q.k);
  const output: number[] = [];
  const pending = original.slice();
  order.forEach(({ value, k }, index) => {
    const isTie = index > 0 && order[index - 1].value === value;
    if (isTie) ties++;
    elapsed = value;
    pending.splice(pending.indexOf(value), 1);
    output.push(value);
    a.splice(0, n, ...output, ...pending);
    fired++;
    const done = output.map((_, position) => position);
    steps.push({ a: a.slice(), done: new Set(done), i: output.length - 1, j: -1, swap: false, range: [output.length, n - 1], line: 5, note: { en: `t = ${value} ms: the timer for array[${k}] = ${value} fires and pushes it to the output${isTie ? "; it was scheduled after the equal value that fired just before, so it comes out after it" : ""}. Output: ${output.join(" ")}.`, pt: `t = ${value} ms: o timer de array[${k}] = ${value} dispara e o coloca na saída${isTie ? "; foi agendado depois do valor igual que disparou antes, então sai depois dele" : ""}. Saída: ${output.join(" ")}.` }, counters: counters() });
  });
  finish();
  push(8, { en: `t = ${max} ms: every timer has fired and the output is sorted. ${n} timers and zero comparisons, but the wall time was the largest value in milliseconds, and the sorting itself was done by the scheduler's timer queue, which is a priority queue.`, pt: `t = ${max} ms: todo timer disparou e a saída está ordenada. ${n} timers e zero comparações, mas o tempo de parede foi o maior valor em milissegundos, e a ordenação em si foi feita pela fila de timers do escalonador, que é uma fila de prioridade.` }, counters());
  return { steps, meta: barsMeta(n, seed, steps.length) };
};
