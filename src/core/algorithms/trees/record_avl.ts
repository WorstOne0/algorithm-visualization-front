// Utils
import type { Recorder } from "../recording";
import { buildBst, treeHeight, treeSession, withSteps, type TreeNode } from "./tree_model";

const height = (node: TreeNode | null) => node?.height ?? 0;
const plainBstHeight = (keys: number[]) => treeHeight(buildBst(keys, (key) => ({ id: -1, key, left: null, right: null, parent: null })));
const balanceOf = (node: TreeNode) => height(node.left) - height(node.right);
const update = (node: TreeNode) => {
  node.height = 1 + Math.max(height(node.left), height(node.right));
};

// Line numbers mirror the listing in core/models/algorithms/trees.ts (insert 1–12, rotateRight 13–19).
export const recordAvl: Recorder = (n, seed) => {
  const { keys, marks, labels, steps, push, makeNode, meta } = treeSession(n, seed);
  let root: TreeNode | null = null;
  let count = 0;
  let rotations = 0;
  let comparisons = 0;
  let balance: number | string = 0;
  const counters = () => ({ nodes: count, nodesUnit: `/ ${n}`, rotations, height: treeHeight(root), balance: typeof balance === "number" && balance > 0 ? `+${balance}` : balance, comparisons });
  const relabel = () => {
    labels.clear();
    const walk = (node: TreeNode | null) => {
      if (!node) return;
      const value = balanceOf(node);
      labels.set(node.id, value > 0 ? `+${value}` : String(value));
      walk(node.left);
      walk(node.right);
    };
    walk(root);
  };
  const snapshot = (line: number, note: { en: string; pt: string }) => {
    relabel();
    push(line, note, counters(), root);
  };

  const rotateRight = (node: TreeNode): TreeNode => {
    const pivot = node.left!;
    node.left = pivot.right;
    if (pivot.right) pivot.right.parent = node;
    pivot.right = node;
    pivot.parent = node.parent;
    node.parent = pivot;
    update(node);
    update(pivot);
    rotations++;
    return pivot;
  };
  const rotateLeft = (node: TreeNode): TreeNode => {
    const pivot = node.right!;
    node.right = pivot.left;
    if (pivot.left) pivot.left.parent = node;
    pivot.left = node;
    pivot.parent = node.parent;
    node.parent = pivot;
    update(node);
    update(pivot);
    rotations++;
    return pivot;
  };
  const reattach = (parent: TreeNode | null, was: TreeNode, now: TreeNode) => {
    if (!parent) root = now;
    else if (parent.left === was) parent.left = now;
    else parent.right = now;
    now.parent = parent;
  };

  const insert = (node: TreeNode | null, parent: TreeNode | null, key: number): TreeNode => {
    if (!node) {
      const fresh = makeNode(key);
      fresh.height = 1;
      fresh.parent = parent;
      count++;
      if (!parent) root = fresh;
      else if (key < parent.key) parent.left = fresh;
      else parent.right = fresh;
      marks.set(fresh.id, "fresh");
      snapshot(2, { en: parent ? `Empty spot under ${parent.key}: ${key} becomes a leaf with height 1.` : `The tree is empty: ${key} becomes the root.`, pt: parent ? `Vaga sob ${parent.key}: ${key} vira uma folha de altura 1.` : `A árvore está vazia: ${key} vira a raiz.` });
      return fresh;
    }
    marks.set(node.id, "cur");
    comparisons++;
    const side = key < node.key ? "left" : "right";
    snapshot(side === "left" ? 3 : 4, { en: `${key} ${side === "left" ? "<" : "≥"} ${node.key}: insert into the ${side} subtree.`, pt: `${key} ${side === "left" ? "<" : "≥"} ${node.key}: insere na subárvore ${side === "left" ? "esquerda" : "direita"}.` });
    marks.set(node.id, "path");
    insert(node[side], node, key);
    update(node);
    balance = balanceOf(node);
    marks.set(node.id, "cur");
    snapshot(6, { en: `Back at ${node.key}: height ${node.height}, balance ${balance > 0 ? "+" : ""}${balance}${Math.abs(balance) > 1 ? ". Out of balance." : ". Fine."}`, pt: `De volta em ${node.key}: altura ${node.height}, balanço ${balance > 0 ? "+" : ""}${balance}${Math.abs(balance) > 1 ? ". Desbalanceado." : ". Ok."}` });
    marks.set(node.id, "path");
    if (Math.abs(balance) <= 1) return node;

    const heavy = balance > 1 ? node.left! : node.right!;
    const single = balance > 1 ? key < heavy.key : key > heavy.key;
    marks.set(node.id, "pivot");
    marks.set(heavy.id, "pivot");
    if (single) {
      const name = balance > 1 ? "right" : "left";
      snapshot(balance > 1 ? 7 : 8, { en: `${balance > 1 ? "Left-left" : "Right-right"} case: one ${name} rotation at ${node.key}, ${heavy.key} comes up.`, pt: `Caso ${balance > 1 ? "esquerda-esquerda" : "direita-direita"}: uma rotação à ${name === "right" ? "direita" : "esquerda"} em ${node.key}, ${heavy.key} sobe.` });
      const top = balance > 1 ? rotateRight(node) : rotateLeft(node);
      reattach(parent, node, top);
      balance = balanceOf(top);
      snapshot(18, { en: `Rotated: ${top.key} is the new root of this subtree, ${node.key} is its child. Balance restored.`, pt: `Rotacionado: ${top.key} é a nova raiz desta subárvore, ${node.key} é seu filho. Balanço restaurado.` });
      return top;
    }
    const inner = balance > 1 ? heavy.right! : heavy.left!;
    marks.set(inner.id, "pivot");
    snapshot(balance > 1 ? 9 : 10, { en: `${balance > 1 ? "Left-right" : "Right-left"} case: first rotate ${heavy.key} ${balance > 1 ? "left" : "right"} so ${inner.key} comes up, then rotate ${node.key}.`, pt: `Caso ${balance > 1 ? "esquerda-direita" : "direita-esquerda"}: primeiro rotaciona ${heavy.key} para a ${balance > 1 ? "esquerda" : "direita"} para ${inner.key} subir, depois rotaciona ${node.key}.` });
    const first = balance > 1 ? rotateLeft(heavy) : rotateRight(heavy);
    if (balance > 1) node.left = first;
    else node.right = first;
    first.parent = node;
    snapshot(balance > 1 ? 9 : 10, { en: `First rotation done: ${inner.key} is above ${heavy.key}. Now the ${balance > 1 ? "right" : "left"} rotation at ${node.key}.`, pt: `Primeira rotação feita: ${inner.key} está acima de ${heavy.key}. Agora a rotação à ${balance > 1 ? "direita" : "esquerda"} em ${node.key}.` });
    const top = balance > 1 ? rotateRight(node) : rotateLeft(node);
    reattach(parent, node, top);
    balance = balanceOf(top);
    snapshot(18, { en: `Rotated: ${top.key} is the new root of this subtree with ${node.key} and ${heavy.key} as children. Balance restored.`, pt: `Rotacionado: ${top.key} é a nova raiz desta subárvore com ${node.key} e ${heavy.key} como filhos. Balanço restaurado.` });
    return top;
  };

  keys.forEach((key) => {
    marks.clear();
    insert(root, null, key);
    marks.clear();
    balance = root ? balanceOf(root) : 0;
    snapshot(11, { en: `${key} is in. Height ${treeHeight(root)}, ${rotations} rotation${rotations === 1 ? "" : "s"} so far.`, pt: `${key} entrou. Altura ${treeHeight(root)}, ${rotations} rotaç${rotations === 1 ? "ão" : "ões"} até aqui.` });
  });
  const plainHeight = plainBstHeight(keys);
  snapshot(11, { en: `Done. ${n} keys, height ${treeHeight(root)}; a plain BST fed the same keys in this order would be ${plainHeight} tall.`, pt: `Pronto. ${n} chaves, altura ${treeHeight(root)}; uma BST comum alimentada com as mesmas chaves nesta ordem teria altura ${plainHeight}.` });
  return { steps, meta: withSteps(meta, steps.length) };
};
