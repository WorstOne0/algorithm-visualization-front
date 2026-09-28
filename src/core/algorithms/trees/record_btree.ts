// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Counter, Recorder, StepBase } from "../recording";
import { distinctKeys, withSteps, type NodeMark } from "./tree_model";

// Minimum degree 2: every node holds 1 to 3 keys, so splits happen often enough to watch.
export const MAX_KEYS = 3;

type BNode = { id: number; keys: number[]; children: BNode[] };
export type LaidBNode = { id: number; keys: number[]; x: number; depth: number; parent: number | null; mark?: NodeMark; hot?: number };
export type BTreeStep = StepBase & { nodes: LaidBNode[]; depth: number; aside: string };

// Line numbers mirror the listing in core/models/algorithms/trees.ts (insert 1–8, insertNonFull 9–23).
export const recordBTree: Recorder = (n, seed) => {
  const rand = seeded(seed);
  const keys = distinctKeys(n, rand);
  const steps: BTreeStep[] = [];
  const marks = new Map<number, NodeMark>();
  const hot = new Map<number, number>();
  let nextId = 0;
  const makeNode = (): BNode => ({ id: nextId++, keys: [], children: [] });
  let root = makeNode();
  let count = 0;
  let splits = 0;
  let key = 0;
  const treeHeight = (node: BNode): number => (node.children.length ? 1 + treeHeight(node.children[0]) : 1);
  const nodeCount = (node: BNode): number => 1 + node.children.reduce((sum, child) => sum + nodeCount(child), 0);
  const counters = (): Record<string, Counter> => ({ keys: count, keysUnit: `/ ${n}`, nodes: nodeCount(root), splits, height: treeHeight(root), key });

  const layout = () => {
    const nodes: LaidBNode[] = [];
    let slot = 0;
    let depth = 0;
    const walk = (node: BNode, level: number, parent: number | null): number => {
      depth = Math.max(depth, level);
      const x = node.children.length ? node.children.map((child) => walk(child, level + 1, node.id)).reduce((sum, value) => sum + value, 0) / node.children.length : slot++;
      nodes.push({ id: node.id, keys: [...node.keys], x, depth: level, parent, mark: marks.get(node.id), hot: hot.get(node.id) });
      return x;
    };
    walk(root, 0, null);
    const width = Math.max(slot - 1, 1);
    nodes.forEach((node) => {
      node.x = slot === 1 ? 0.5 : node.x / width;
    });
    return { nodes, depth };
  };
  const push = (line: number, note: Localized) => steps.push({ ...layout(), aside: "", line, note, counters: counters() });
  const show = (node: BNode) => `[${node.keys.join(" ")}]`;

  const splitChild = (parent: BNode, index: number) => {
    const full = parent.children[index];
    const sibling = makeNode();
    const middle = full.keys[1];
    sibling.keys = full.keys.slice(2);
    full.keys = full.keys.slice(0, 1);
    if (full.children.length) {
      sibling.children = full.children.slice(2);
      full.children = full.children.slice(0, 2);
    }
    parent.keys.splice(index, 0, middle);
    parent.children.splice(index + 1, 0, sibling);
    splits++;
    marks.set(full.id, "pivot");
    marks.set(sibling.id, "pivot");
    marks.set(parent.id, "fresh");
    hot.set(parent.id, index);
    return middle;
  };

  const insertNonFull = (node: BNode, value: number) => {
    marks.clear();
    hot.clear();
    marks.set(node.id, "cur");
    let index = node.keys.length - 1;
    while (index >= 0 && value < node.keys[index]) index--;
    if (!node.children.length) {
      push(12, { en: `${show(node)} is a leaf: ${value} goes ${index < 0 ? "in front" : `after ${node.keys[index]}`}.`, pt: `${show(node)} é folha: ${value} entra ${index < 0 ? "na frente" : `depois de ${node.keys[index]}`}.` });
      node.keys.splice(index + 1, 0, value);
      count++;
      hot.set(node.id, index + 1);
      push(13, { en: `Inserted: ${show(node)} now holds ${node.keys.length} key${node.keys.length > 1 ? "s" : ""}.`, pt: `Inserido: ${show(node)} agora tem ${node.keys.length} chave${node.keys.length > 1 ? "s" : ""}.` });
      return;
    }
    index++;
    push(17, { en: `${show(node)} is internal: ${value} belongs in child ${index + 1} of ${node.children.length}.`, pt: `${show(node)} é interno: ${value} pertence ao filho ${index + 1} de ${node.children.length}.` });
    if (node.children[index].keys.length === MAX_KEYS) {
      const full = node.children[index];
      const before = show(full);
      const middle = splitChild(node, index);
      push(19, { en: `That child ${before} is full: split it. ${middle} moves up into ${show(node)}.`, pt: `Esse filho ${before} está cheio: divide. ${middle} sobe para ${show(node)}.` });
      if (value > middle) {
        index++;
        push(20, { en: `${value} > ${middle}: continue into the right half.`, pt: `${value} > ${middle}: continua na metade direita.` });
      }
    }
    insertNonFull(node.children[index], value);
  };

  push(1, { en: `Order 4 B-tree: each node holds 1 to ${MAX_KEYS} keys. Start with an empty root.`, pt: `B-tree de ordem 4: cada nó guarda de 1 a ${MAX_KEYS} chaves. Começa com uma raiz vazia.` });
  keys.forEach((value) => {
    key = value;
    if (root.keys.length === MAX_KEYS) {
      marks.clear();
      hot.clear();
      marks.set(root.id, "cur");
      push(2, { en: `Insert ${value}: the root ${show(root)} is full, so the tree grows a level.`, pt: `Insere ${value}: a raiz ${show(root)} está cheia, então a árvore ganha um nível.` });
      const oldRoot = root;
      root = makeNode();
      root.children.push(oldRoot);
      splitChild(root, 0);
      push(5, { en: `New root ${show(root)}; the old root split into ${show(root.children[0])} and ${show(root.children[1])}. Height is now ${treeHeight(root)}.`, pt: `Nova raiz ${show(root)}; a raiz antiga se dividiu em ${show(root.children[0])} e ${show(root.children[1])}. Altura agora ${treeHeight(root)}.` });
    }
    insertNonFull(root, value);
  });
  marks.clear();
  hot.clear();
  push(8, { en: `Done. ${n} keys in ${nodeCount(root)} nodes, height ${treeHeight(root)}, ${splits} split${splits === 1 ? "" : "s"}. Every leaf sits at the same depth.`, pt: `Pronto. ${n} chaves em ${nodeCount(root)} nós, altura ${treeHeight(root)}, ${splits} divis${splits === 1 ? "ão" : "ões"}. Toda folha está na mesma profundidade.` });
  const meta: Localized = { en: `${n} keys · order 4 · seed ${seed}`, pt: `${n} chaves · ordem 4 · seed ${seed}` };
  return { steps, meta: withSteps(meta, steps.length) };
};
