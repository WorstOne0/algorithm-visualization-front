// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { SortState } from "./sorts";

// One player step: the array snapshot plus the code line that produced it and the sentence for the panel.
export type QuickStep = SortState & { line: number; lo: number; hi: number; comparisons: number; swaps: number; depth: number; note: Localized };

export type QuickRecording = { steps: QuickStep[]; maxDepth: number; initial: number[] };

// Line numbers mirror core/models/code.ts: every language listing keeps the same line ↔ step mapping.
export function recordQuick(n: number, seed: number): QuickRecording {
  const rand = seeded(seed);
  const initial = Array.from({ length: n }, () => 5 + Math.floor(rand() * 95));
  const a = initial.slice();
  const done = new Set<number>();
  const steps: QuickStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  let depth = 0;
  let maxDepth = 0;

  const push = (line: number, i: number, j: number, pivot: number, swap: boolean, lo: number, hi: number, note: Localized) =>
    steps.push({ a: a.slice(), i, j, pivot, swap, done: new Set(done), line, lo, hi, comparisons, swaps, depth, note });

  push(1, -1, -1, -1, false, 0, n - 1, {
    en: `Start: ${n} values in random order. quickSort(a, 0, ${n - 1}) is called on the whole range.`,
    pt: `Início: ${n} valores em ordem aleatória. quickSort(a, 0, ${n - 1}) é chamado no intervalo inteiro.`,
  });

  const rec = (lo: number, hi: number) => {
    depth++;
    maxDepth = Math.max(maxDepth, depth);
    if (lo >= hi) {
      if (lo === hi) done.add(lo);
      push(2, lo, -1, -1, false, lo, hi, {
        en: lo === hi ? `Range [${lo}, ${hi}] has one element. It is already in place.` : `Range [${lo}, ${hi}] is empty. Nothing to do.`,
        pt: lo === hi ? `Intervalo [${lo}, ${hi}] tem um elemento. Já está no lugar.` : `Intervalo [${lo}, ${hi}] está vazio. Nada a fazer.`,
      });
      depth--;
      return;
    }
    const pivot = a[hi];
    let k = lo;
    push(3, -1, -1, hi, false, lo, hi, { en: `Pivot is the last element of [${lo}, ${hi}]: a[${hi}] = ${pivot}.`, pt: `O pivô é o último elemento de [${lo}, ${hi}]: a[${hi}] = ${pivot}.` });
    for (let j = lo; j < hi; j++) {
      comparisons++;
      const smaller = a[j] < pivot;
      push(6, j, -1, hi, false, lo, hi, {
        en: `Compare a[${j}] = ${a[j]} with the pivot ${pivot}. ${smaller ? "Smaller, so it moves left of the frontier." : "Not smaller, so it stays right."}`,
        pt: `Compara a[${j}] = ${a[j]} com o pivô ${pivot}. ${smaller ? "Menor, então vai para a esquerda da fronteira." : "Não é menor, fica à direita."}`,
      });
      if (!smaller) continue;
      if (k !== j) {
        const t = a[k];
        a[k] = a[j];
        a[j] = t;
        swaps++;
      }
      push(7, k, j, hi, true, lo, hi, { en: `Swap a[${k}] and a[${j}]. The frontier i moves to ${k + 1}.`, pt: `Troca a[${k}] com a[${j}]. A fronteira i avança para ${k + 1}.` });
      k++;
    }
    const t = a[k];
    a[k] = a[hi];
    a[hi] = t;
    if (k !== hi) swaps++;
    done.add(k);
    push(11, k, hi, k, true, lo, hi, {
      en: `Place the pivot at index ${k}. Everything left of it is smaller, everything right is not. Index ${k} is final.`,
      pt: `Coloca o pivô no índice ${k}. Tudo à esquerda é menor, tudo à direita não é. O índice ${k} é definitivo.`,
    });
    push(12, -1, -1, -1, false, lo, k - 1, { en: `Recurse on the left part [${lo}, ${k - 1}].`, pt: `Recursão na parte esquerda [${lo}, ${k - 1}].` });
    rec(lo, k - 1);
    push(13, -1, -1, -1, false, k + 1, hi, { en: `Recurse on the right part [${k + 1}, ${hi}].`, pt: `Recursão na parte direita [${k + 1}, ${hi}].` });
    rec(k + 1, hi);
    depth--;
  };

  rec(0, n - 1);
  for (let i = 0; i < n; i++) done.add(i);
  push(14, -1, -1, -1, false, 0, n - 1, {
    en: `Done. ${comparisons} comparisons and ${swaps} swaps for n = ${n}. Max recursion depth ${maxDepth}.`,
    pt: `Pronto. ${comparisons} comparações e ${swaps} trocas para n = ${n}. Profundidade máxima ${maxDepth}.`,
  });
  return { steps, maxDepth, initial };
}
