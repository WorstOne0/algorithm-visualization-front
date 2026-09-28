// Utils
import type { Recorder } from "../recording";
import { buildBst, treeHeight, treeSession, withSteps, type TreeNode } from "./tree_model";

const NAMES = { inorder: "in-order", preorder: "pre-order", postorder: "post-order", levelorder: "level-order" };

// Line numbers mirror the listing in core/models/algorithms/trees.ts (inorder 1–6, preorder 7–12, postorder 13–18, levelorder 19–27).
export const recordTraversals: Recorder = (n, seed) => {
  const { keys, marks, steps, push, makeNode, setTape, setAside, meta } = treeSession(n, seed);
  const root = buildBst(keys, (key) => makeNode(key));

  const output: number[] = [];
  let traversal: keyof typeof NAMES = "inorder";
  let phase = 0;
  let depth = 0;
  const counters = () => ({ visited: output.length, visitedUnit: `/ ${n}`, traversal: NAMES[traversal], depth, phase: `${phase} / 4`, output: output.join(" ") });
  const visit = (node: TreeNode, line: number) => {
    output.push(node.key);
    setTape(output);
    marks.set(node.id, "cur");
    push(line, { en: `Visit ${node.key}: append it to the output.`, pt: `Visita ${node.key}: anexa à saída.` }, counters(), root);
    marks.set(node.id, "done");
  };
  const begin = (next: keyof typeof NAMES, line: number, why: { en: string; pt: string }) => {
    traversal = next;
    phase++;
    output.length = 0;
    setTape(output);
    setAside("");
    marks.clear();
    push(line, why, counters(), root);
  };

  const inorder = (node: TreeNode | null, level: number) => {
    if (!node) return;
    depth = level;
    marks.set(node.id, "path");
    push(3, { en: `At ${node.key}: the left subtree comes first.`, pt: `Em ${node.key}: a subárvore esquerda vem primeiro.` }, counters(), root);
    inorder(node.left, level + 1);
    depth = level;
    visit(node, 4);
    inorder(node.right, level + 1);
  };
  const preorder = (node: TreeNode | null, level: number) => {
    if (!node) return;
    depth = level;
    visit(node, 9);
    preorder(node.left, level + 1);
    preorder(node.right, level + 1);
  };
  const postorder = (node: TreeNode | null, level: number) => {
    if (!node) return;
    depth = level;
    marks.set(node.id, "path");
    push(15, { en: `At ${node.key}: both subtrees before the node itself.`, pt: `Em ${node.key}: as duas subárvores antes do próprio nó.` }, counters(), root);
    postorder(node.left, level + 1);
    postorder(node.right, level + 1);
    depth = level;
    visit(node, 17);
  };

  begin("inorder", 1, { en: `In-order: left subtree, node, right subtree. On a BST this yields the keys sorted.`, pt: `Em ordem: subárvore esquerda, nó, subárvore direita. Numa BST isso dá as chaves ordenadas.` });
  inorder(root, 0);
  push(6, { en: `In-order done: ${output.join(" ")}. Sorted, as promised.`, pt: `Em ordem concluído: ${output.join(" ")}. Ordenado, como prometido.` }, counters(), root);

  begin("preorder", 7, { en: `Pre-order: node first, then left, then right. Reinserting this sequence rebuilds the same tree.`, pt: `Pré-ordem: nó primeiro, depois esquerda, depois direita. Reinserir essa sequência reconstrói a mesma árvore.` });
  preorder(root, 0);
  push(12, { en: `Pre-order done: ${output.join(" ")}.`, pt: `Pré-ordem concluído: ${output.join(" ")}.` }, counters(), root);

  begin("postorder", 13, { en: `Post-order: left, right, then the node. Children are finished before their parent.`, pt: `Pós-ordem: esquerda, direita, depois o nó. Os filhos terminam antes do pai.` });
  postorder(root, 0);
  push(18, { en: `Post-order done: ${output.join(" ")}. The root comes last.`, pt: `Pós-ordem concluído: ${output.join(" ")}. A raiz vem por último.` }, counters(), root);

  begin("levelorder", 20, { en: `Level-order: a queue, breadth first. The root, then depth 1, then depth 2.`, pt: `Por nível: uma fila, largura primeiro. A raiz, depois profundidade 1, depois 2.` });
  const queue: TreeNode[] = root ? [root] : [];
  const levelOf = new Map<number, number>();
  if (root) levelOf.set(root.id, 0);
  while (queue.length) {
    const node = queue.shift()!;
    depth = levelOf.get(node.id) ?? 0;
    [node.left, node.right].forEach((child) => {
      if (!child) return;
      queue.push(child);
      levelOf.set(child.id, depth + 1);
    });
    setAside(`queue: ${queue.map((item) => item.key).join(" ") || "∅"}`);
    visit(node, 23);
  }
  push(27, { en: `Level-order done: ${output.join(" ")}. Height ${treeHeight(root)} means ${treeHeight(root)} levels.`, pt: `Por nível concluído: ${output.join(" ")}. Altura ${treeHeight(root)} significa ${treeHeight(root)} níveis.` }, counters(), root);
  return { steps, meta: withSteps(meta, steps.length) };
};
