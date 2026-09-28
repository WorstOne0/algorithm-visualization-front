// Utils
import type { Recorder } from "../recording";
import { treeHeight, treeSession, withSteps, type TreeNode } from "./tree_model";

// Line numbers mirror the listing in core/models/algorithms/trees.ts (insert 1–6, search 7–10, remove 11–23).
export const recordBst: Recorder = (n, seed) => {
  const { rand, keys, marks, steps, push, makeNode, meta } = treeSession(n, seed);
  let root: TreeNode | null = null;
  let comparisons = 0;
  let count = 0;
  let op = "insert";
  let key = 0;
  const counters = () => ({ nodes: count, nodesUnit: `/ ${n}`, comparisons, height: treeHeight(root), op, key });
  const clear = () => marks.clear();

  const attach = (parent: TreeNode | null, node: TreeNode, side: "left" | "right" | "root") => {
    node.parent = parent;
    if (side === "root") root = node;
    else if (parent) parent[side] = node;
  };

  keys.forEach((value) => {
    key = value;
    clear();
    if (!root) {
      const node = makeNode(value);
      attach(null, node, "root");
      count++;
      marks.set(node.id, "fresh");
      push(2, { en: `The tree is empty: ${value} becomes the root.`, pt: `A árvore está vazia: ${value} vira a raiz.` }, counters(), root);
      return;
    }
    let node: TreeNode = root;
    while (true) {
      marks.set(node.id, "cur");
      comparisons++;
      const side = value < node.key ? "left" : "right";
      push(side === "left" ? 3 : 4, { en: `${value} ${side === "left" ? "<" : "≥"} ${node.key}: go ${side}.`, pt: `${value} ${side === "left" ? "<" : "≥"} ${node.key}: vai para a ${side === "left" ? "esquerda" : "direita"}.` }, counters(), root);
      marks.set(node.id, "path");
      const next = node[side];
      if (!next) {
        const fresh = makeNode(value);
        attach(node, fresh, side);
        count++;
        marks.set(fresh.id, "fresh");
        push(2, { en: `The ${side} of ${node.key} is empty: ${value} is attached there.`, pt: `A ${side === "left" ? "esquerda" : "direita"} de ${node.key} está vazia: ${value} é pendurado ali.` }, counters(), root);
        break;
      }
      node = next;
    }
  });
  clear();
  push(5, { en: `All ${n} keys inserted. Height ${treeHeight(root)}, against ⌈log₂(n + 1)⌉ = ${Math.ceil(Math.log2(n + 1))} for a perfectly balanced tree.`, pt: `Todas as ${n} chaves inseridas. Altura ${treeHeight(root)}, contra ⌈log₂(n + 1)⌉ = ${Math.ceil(Math.log2(n + 1))} de uma árvore perfeitamente balanceada.` }, counters(), root);

  op = "search";
  let missing = 1 + Math.floor(rand() * 99);
  while (keys.includes(missing)) missing = 1 + Math.floor(rand() * 99);
  [keys[Math.floor(n / 2)], missing].forEach((value) => {
    key = value;
    clear();
    let node: TreeNode | null = root;
    while (node) {
      marks.set(node.id, "cur");
      comparisons++;
      if (node.key === value) {
        push(8, { en: `${node.key} = ${value}: found after ${comparisons} comparisons in total.`, pt: `${node.key} = ${value}: encontrado.` }, counters(), root);
        marks.set(node.id, "done");
        return;
      }
      const side = value < node.key ? "left" : "right";
      push(9, { en: `${value} ${side === "left" ? "<" : ">"} ${node.key}: search the ${side} subtree.`, pt: `${value} ${side === "left" ? "<" : ">"} ${node.key}: busca na subárvore ${side === "left" ? "esquerda" : "direita"}.` }, counters(), root);
      marks.set(node.id, "path");
      node = node[side];
    }
    push(8, { en: `Reached an empty subtree: ${value} is not in the tree.`, pt: `Chegou numa subárvore vazia: ${value} não está na árvore.` }, counters(), root);
  });

  op = "delete";
  const all = (): TreeNode[] => {
    const list: TreeNode[] = [];
    const walk = (node: TreeNode | null) => {
      if (!node) return;
      walk(node.left);
      list.push(node);
      walk(node.right);
    };
    walk(root);
    return list;
  };
  const children = (node: TreeNode) => (node.left ? 1 : 0) + (node.right ? 1 : 0);
  const targets = [all().find((node) => children(node) === 0), all().find((node) => children(node) === 1), all().find((node) => children(node) === 2 && node !== root)].filter((node): node is TreeNode => !!node);

  const replace = (node: TreeNode, child: TreeNode | null) => {
    if (child) child.parent = node.parent;
    if (!node.parent) root = child;
    else if (node.parent.left === node) node.parent.left = child;
    else node.parent.right = child;
  };

  targets.forEach((target) => {
    const value = target.key;
    key = value;
    clear();
    let node: TreeNode = root!;
    while (node !== target) {
      marks.set(node.id, "cur");
      comparisons++;
      const side = value < node.key ? "left" : "right";
      push(side === "left" ? 13 : 14, { en: `Remove ${value}: ${value} ${side === "left" ? "<" : ">"} ${node.key}, go ${side}.`, pt: `Remove ${value}: ${value} ${side === "left" ? "<" : ">"} ${node.key}, vai para a ${side === "left" ? "esquerda" : "direita"}.` }, counters(), root);
      marks.set(node.id, "path");
      node = node[side]!;
    }
    marks.set(node.id, "pivot");
    if (!node.left || !node.right) {
      const child = node.left ?? node.right;
      const line = node.left ? 16 : 15;
      push(line, { en: child ? `${value} has one child, ${child.key}: it takes the place of ${value}.` : `${value} is a leaf: unlink it.`, pt: child ? `${value} tem um filho, ${child.key}: ele toma o lugar de ${value}.` : `${value} é folha: desliga o nó.` }, counters(), root);
      replace(node, child);
      count--;
      marks.delete(node.id);
      if (child) marks.set(child.id, "fresh");
      push(22, { en: `Done: ${value} is gone, the rest of the tree is untouched.`, pt: `Pronto: ${value} saiu, o resto da árvore não mudou.` }, counters(), root);
      return;
    }
    let successor = node.right;
    while (successor.left) successor = successor.left;
    marks.set(successor.id, "fresh");
    push(18, { en: `${value} has two children: its successor is ${successor.key}, the smallest key of the right subtree.`, pt: `${value} tem dois filhos: seu sucessor é ${successor.key}, a menor chave da subárvore direita.` }, counters(), root);
    node.key = successor.key;
    push(19, { en: `Copy ${successor.key} over ${value}. The order of the tree still holds.`, pt: `Copia ${successor.key} por cima de ${value}. A ordem da árvore continua válida.` }, counters(), root);
    replace(successor, successor.right);
    count--;
    marks.delete(successor.id);
    push(20, { en: `Remove the old ${successor.key} node, which had at most a right child.`, pt: `Remove o nó antigo de ${successor.key}, que tinha no máximo um filho à direita.` }, counters(), root);
  });
  clear();
  push(22, { en: `Done. ${count} nodes remain, height ${treeHeight(root)}.`, pt: `Pronto. Restam ${count} nós, altura ${treeHeight(root)}.` }, counters(), root);
  return { steps, meta: withSteps(meta, steps.length) };
};
