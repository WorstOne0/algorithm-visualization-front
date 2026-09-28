// Utils
import type { Recorder } from "../recording";
import { layout, treeSession, withSteps, type TreeNode } from "./tree_model";

const parentOf = (index: number) => Math.floor((index - 1) / 2);

// Line numbers mirror the listing in core/models/algorithms/trees.ts (push 1–8, pop 9–15, siftDown 16–26).
export const recordBinaryHeap: Recorder = (n, seed) => {
  const { keys, marks, labels, steps, meta } = treeSession(n, seed);
  const heap: number[] = [];
  let swaps = 0;
  let comparisons = 0;
  let op = "push";
  const popped: number[] = [];
  const counters = () => ({ size: heap.length, sizeUnit: `/ ${n}`, swaps, comparisons, height: heap.length ? Math.floor(Math.log2(heap.length)) + 1 : 0, op, popped: popped.join(" ") || "—" });

  // The array is the tree: index i has children 2i + 1 and 2i + 2; ids are indices so marks follow slots.
  const asTree = () => {
    const nodes: TreeNode[] = heap.map((key, id) => ({ id, key, left: null, right: null, parent: null }));
    nodes.forEach((node, index) => {
      if (index > 0) node.parent = nodes[parentOf(index)];
      if (2 * index + 1 < nodes.length) node.left = nodes[2 * index + 1];
      if (2 * index + 2 < nodes.length) node.right = nodes[2 * index + 2];
    });
    return nodes[0] ?? null;
  };
  const snapshot = (line: number, note: { en: string; pt: string }) => {
    labels.clear();
    heap.forEach((_, index) => labels.set(index, String(index)));
    steps.push({ ...layout(asTree(), marks, labels), tape: [], aside: `heap: [${heap.join(" ")}]`, line, note, counters: counters() });
  };
  const swap = (a: number, b: number) => {
    [heap[a], heap[b]] = [heap[b], heap[a]];
    swaps++;
  };

  keys.forEach((key) => {
    marks.clear();
    heap.push(key);
    let index = heap.length - 1;
    marks.set(index, "fresh");
    snapshot(2, { en: `Push ${key}: append it at index ${index}, the next free slot of the complete tree.`, pt: `Push ${key}: anexa no índice ${index}, a próxima vaga da árvore completa.` });
    while (index > 0) {
      const parent = parentOf(index);
      comparisons++;
      marks.set(index, "cur");
      marks.set(parent, "path");
      if (heap[index] <= heap[parent]) {
        snapshot(4, { en: `${heap[index]} ≤ parent ${heap[parent]}: the heap property holds, stop.`, pt: `${heap[index]} ≤ pai ${heap[parent]}: a propriedade do heap vale, para.` });
        break;
      }
      snapshot(4, { en: `${heap[index]} > parent ${heap[parent]}: swap them and climb.`, pt: `${heap[index]} > pai ${heap[parent]}: troca e sobe.` });
      swap(index, parent);
      marks.delete(index);
      marks.set(parent, "cur");
      snapshot(5, { en: `Swapped: ${heap[parent]} is now at index ${parent}.`, pt: `Trocado: ${heap[parent]} agora está no índice ${parent}.` });
      index = parent;
    }
    marks.clear();
    marks.set(index, "done");
    snapshot(7, { en: `${key} settled at index ${index}. Size ${heap.length}, height ${Math.floor(Math.log2(heap.length)) + 1}.`, pt: `${key} assentou no índice ${index}. Tamanho ${heap.length}, altura ${Math.floor(Math.log2(heap.length)) + 1}.` });
  });

  op = "pop";
  for (let round = 0; round < Math.min(3, n); round++) {
    marks.clear();
    marks.set(0, "cur");
    marks.set(heap.length - 1, "pivot");
    snapshot(10, { en: `Pop: the maximum ${heap[0]} is at the root. The last leaf ${heap[heap.length - 1]} will take its place.`, pt: `Pop: o máximo ${heap[0]} está na raiz. A última folha ${heap[heap.length - 1]} vai ocupar seu lugar.` });
    popped.push(heap[0]);
    heap[0] = heap[heap.length - 1];
    heap.pop();
    marks.clear();
    if (!heap.length) {
      snapshot(14, { en: `Heap empty. Popped so far: ${popped.join(" ")}.`, pt: `Heap vazio. Retirados até aqui: ${popped.join(" ")}.` });
      break;
    }
    marks.set(0, "cur");
    snapshot(12, { en: `${heap[0]} moved to the root. It is probably too small there: sift it down.`, pt: `${heap[0]} foi para a raiz. Provavelmente é pequeno demais ali: desce.` });
    let index = 0;
    while (true) {
      const left = 2 * index + 1;
      const right = left + 1;
      let largest = index;
      marks.clear();
      marks.set(index, "cur");
      if (left < heap.length) {
        comparisons++;
        marks.set(left, "path");
        if (heap[left] > heap[largest]) largest = left;
      }
      if (right < heap.length) {
        comparisons++;
        marks.set(right, "path");
        if (heap[right] > heap[largest]) largest = right;
      }
      if (largest === index) {
        snapshot(22, { en: `${heap[index]} is at least as large as its children: done.`, pt: `${heap[index]} é pelo menos tão grande quanto os filhos: pronto.` });
        break;
      }
      snapshot(largest === left ? 20 : 21, { en: `Largest child is ${heap[largest]}: swap it with ${heap[index]}.`, pt: `O maior filho é ${heap[largest]}: troca com ${heap[index]}.` });
      swap(index, largest);
      marks.set(index, "path");
      marks.set(largest, "cur");
      snapshot(23, { en: `Swapped: ${heap[index]} is up, ${heap[largest]} continues down.`, pt: `Trocado: ${heap[index]} subiu, ${heap[largest]} continua descendo.` });
      index = largest;
    }
    snapshot(14, { en: `Returned ${popped[popped.length - 1]}. Popped so far: ${popped.join(" ")}, in descending order.`, pt: `Devolveu ${popped[popped.length - 1]}. Retirados até aqui: ${popped.join(" ")}, em ordem decrescente.` });
  }
  marks.clear();
  snapshot(14, { en: `Done. ${n} pushes and ${popped.length} pops cost ${swaps} swaps and ${comparisons} comparisons.`, pt: `Pronto. ${n} pushes e ${popped.length} pops custaram ${swaps} trocas e ${comparisons} comparações.` });
  return { steps, meta: withSteps(meta, steps.length) };
};
