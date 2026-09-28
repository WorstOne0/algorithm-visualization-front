// Utils
import type { Recorder } from "../recording";
import { treeHeight, treeSession, withSteps, type TreeNode } from "./tree_model";

const isRed = (node: TreeNode | null) => !!node?.red;

// Line numbers mirror the listing in core/models/algorithms/trees.ts (insert 1–4, fixUp 5–22).
export const recordRedBlack: Recorder = (n, seed) => {
  const { keys, marks, steps, push, makeNode, meta } = treeSession(n, seed);
  let root: TreeNode | null = null;
  let count = 0;
  let recolors = 0;
  let rotations = 0;
  let comparisons = 0;
  const blackHeight = () => {
    let value = 0;
    for (let node = root; node; node = node.left) if (!node.red) value++;
    return value;
  };
  const counters = () => ({ nodes: count, nodesUnit: `/ ${n}`, recolors, rotations, blackHeight: blackHeight(), height: treeHeight(root), comparisons });
  const snapshot = (line: number, note: { en: string; pt: string }) => push(line, note, counters(), root);
  const colour = (node: TreeNode) => (node.red ? "red" : "black");

  const rotateLeft = (node: TreeNode) => {
    const pivot = node.right!;
    node.right = pivot.left;
    if (pivot.left) pivot.left.parent = node;
    pivot.parent = node.parent;
    if (!node.parent) root = pivot;
    else if (node === node.parent.left) node.parent.left = pivot;
    else node.parent.right = pivot;
    pivot.left = node;
    node.parent = pivot;
    rotations++;
  };
  const rotateRight = (node: TreeNode) => {
    const pivot = node.left!;
    node.left = pivot.right;
    if (pivot.right) pivot.right.parent = node;
    pivot.parent = node.parent;
    if (!node.parent) root = pivot;
    else if (node === node.parent.right) node.parent.right = pivot;
    else node.parent.left = pivot;
    pivot.right = node;
    node.parent = pivot;
    rotations++;
  };

  keys.forEach((key) => {
    marks.clear();
    const fresh = makeNode(key, true);
    count++;
    if (!root) {
      root = fresh;
      fresh.red = false;
      marks.set(fresh.id, "fresh");
      snapshot(21, { en: `The tree is empty: ${key} becomes the root and is painted black.`, pt: `A árvore está vazia: ${key} vira a raiz e é pintado de preto.` });
      return;
    }
    let cursor: TreeNode = root;
    while (true) {
      marks.set(cursor.id, "cur");
      comparisons++;
      const side = key < cursor.key ? "left" : "right";
      snapshot(2, { en: `${key} ${side === "left" ? "<" : "≥"} ${cursor.key}: go ${side}.`, pt: `${key} ${side === "left" ? "<" : "≥"} ${cursor.key}: vai para a ${side === "left" ? "esquerda" : "direita"}.` });
      marks.set(cursor.id, "path");
      if (!cursor[side]) {
        cursor[side] = fresh;
        fresh.parent = cursor;
        break;
      }
      cursor = cursor[side]!;
    }
    marks.set(fresh.id, "fresh");
    snapshot(2, { en: `Attach ${key} as a red leaf under ${cursor.key}. Red keeps the black height; the red-red rule may now be broken.`, pt: `Pendura ${key} como folha vermelha sob ${cursor.key}. Vermelho mantém a altura negra; a regra vermelho-vermelho pode ter quebrado.` });

    let node = fresh;
    while (isRed(node.parent)) {
      const parent = node.parent!;
      const grandparent = parent.parent!;
      const parentIsLeft = parent === grandparent.left;
      const uncle = parentIsLeft ? grandparent.right : grandparent.left;
      marks.clear();
      marks.set(node.id, "cur");
      marks.set(parent.id, "pivot");
      marks.set(grandparent.id, "pivot");
      if (uncle) marks.set(uncle.id, "pivot");
      snapshot(6, { en: `${node.key} and its parent ${parent.key} are both red. Grandparent ${grandparent.key}, uncle ${uncle ? `${uncle.key} (${colour(uncle)})` : "null (black)"}.`, pt: `${node.key} e seu pai ${parent.key} são ambos vermelhos. Avô ${grandparent.key}, tio ${uncle ? `${uncle.key} (${uncle.red ? "vermelho" : "preto"})` : "nulo (preto)"}.` });
      if (isRed(uncle)) {
        parent.red = false;
        uncle!.red = false;
        grandparent.red = true;
        recolors += 3;
        snapshot(11, { en: `Case 1, red uncle: paint ${parent.key} and ${uncle!.key} black and ${grandparent.key} red. The problem moves up to ${grandparent.key}.`, pt: `Caso 1, tio vermelho: pinta ${parent.key} e ${uncle!.key} de preto e ${grandparent.key} de vermelho. O problema sobe para ${grandparent.key}.` });
        node = grandparent;
        continue;
      }
      const inner = parentIsLeft ? node === parent.right : node === parent.left;
      if (inner) {
        snapshot(parentIsLeft ? 15 : 16, { en: `Case 2, ${node.key} is an inner grandchild: rotate ${parent.key} ${parentIsLeft ? "left" : "right"} to make it an outer one.`, pt: `Caso 2, ${node.key} é neto interno: rotaciona ${parent.key} para a ${parentIsLeft ? "esquerda" : "direita"} para torná-lo externo.` });
        if (parentIsLeft) rotateLeft(parent);
        else rotateRight(parent);
        node = parent;
      }
      const newParent = node.parent!;
      newParent.red = false;
      grandparent.red = true;
      recolors += 2;
      snapshot(18, { en: `Case 3: paint ${newParent.key} black and ${grandparent.key} red, then rotate ${grandparent.key} ${parentIsLeft ? "right" : "left"}.`, pt: `Caso 3: pinta ${newParent.key} de preto e ${grandparent.key} de vermelho, depois rotaciona ${grandparent.key} para a ${parentIsLeft ? "direita" : "esquerda"}.` });
      if (parentIsLeft) rotateRight(grandparent);
      else rotateLeft(grandparent);
      snapshot(19, { en: `Rotated: ${newParent.key} is now above ${grandparent.key}. Both red rules hold again.`, pt: `Rotacionado: ${newParent.key} agora está acima de ${grandparent.key}. As duas regras do vermelho valem de novo.` });
    }
    if (root!.red) {
      root!.red = false;
      recolors++;
      snapshot(21, { en: `The root turned red: paint it black. Black height grows by one.`, pt: `A raiz ficou vermelha: pinta de preto. A altura negra cresce em um.` });
    } else {
      marks.clear();
      snapshot(21, { en: `${key} is in: no red-red pair left, every path has ${blackHeight()} black nodes.`, pt: `${key} entrou: nenhum par vermelho-vermelho restou, todo caminho tem ${blackHeight()} nós pretos.` });
    }
  });
  marks.clear();
  snapshot(21, { en: `Done. ${n} keys, height ${treeHeight(root)}, black height ${blackHeight()}: no path is more than twice as long as another.`, pt: `Pronto. ${n} chaves, altura ${treeHeight(root)}, altura negra ${blackHeight()}: nenhum caminho é mais que o dobro de outro.` });
  return { steps, meta: withSteps(meta, steps.length) };
};
