// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Counter, Recorder } from "../recording";
import { layout, layoutForest, treeHeight, treeSession, withSteps, type NodeMark, type TreeNode, type TreeStep } from "./tree_model";

// Line numbers in every recorder mirror the listings in core/models/algorithms/trees_more.ts.

const WORDS = ["car", "cart", "care", "cat", "cap", "cape", "case", "dog", "dot", "do", "door", "dare", "art", "arm", "army", "ant", "sun", "sung", "sum", "sad", "sea", "seat", "set"];

export const recordTrie: Recorder = (n, seed) => {
  const rand = seeded(seed);
  const pool = [...WORDS];
  const words: string[] = [];
  while (words.length < n && pool.length) words.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  type TrieNode = { id: number; char: string; parent: number | null; children: Map<string, TrieNode>; end: boolean };
  const nodes: TrieNode[] = [{ id: 0, char: "", parent: null, children: new Map(), end: false }];
  const marks = new Map<number, NodeMark>();
  const steps: TreeStep[] = [];
  let created = 0;
  let stored = 0;
  let op = "insert";
  let matches = "—";
  const counters = (): Record<string, Counter> => ({ nodes: nodes.length, words: stored, wordsUnit: `/ ${n}`, created, op, matches });
  const push = (line: number, note: Localized, aside = "") => {
    const laid = layoutForest(nodes.map((node) => ({ id: node.id, key: node.id, parent: node.parent, text: node.char || "•", label: node.end ? "■" : undefined, mark: marks.get(node.id) })));
    steps.push({ ...laid, tape: [], aside, line, note, counters: counters() });
  };

  push(2, { en: `An empty trie: one root, no characters. ${n} words will go in: ${words.join(", ")}.`, pt: `Uma trie vazia: uma raiz, nenhum caractere. ${n} palavras vão entrar: ${words.join(", ")}.` });
  words.forEach((word) => {
    marks.clear();
    let node = nodes[0];
    marks.set(0, "cur");
    for (const char of word) {
      let next = node.children.get(char);
      if (next) {
        marks.set(node.id, "path");
        marks.set(next.id, "cur");
        push(7, { en: `"${word}": '${char}' already hangs off this node, follow it.`, pt: `"${word}": '${char}' já pende deste nó, segue por ele.` }, `word: ${word}`);
      } else {
        next = { id: nodes.length, char, parent: node.id, children: new Map(), end: false };
        nodes.push(next);
        node.children.set(char, next);
        created++;
        marks.set(node.id, "path");
        marks.set(next.id, "fresh");
        push(6, { en: `"${word}": no child for '${char}', create one.`, pt: `"${word}": nenhum filho para '${char}', cria um.` }, `word: ${word}`);
      }
      node = next;
    }
    node.end = true;
    stored++;
    marks.set(node.id, "done");
    push(9, { en: `Mark the last node as the end of a word: "${word}" is stored${word.length < created ? "" : ""}.`, pt: `Marca o último nó como fim de palavra: "${word}" está guardada.` }, `word: ${word}`);
  });

  op = "search";
  const probe = words[Math.floor(rand() * words.length)];
  marks.clear();
  let node: TrieNode | undefined = nodes[0];
  for (const char of probe) {
    node = node.children.get(char);
    if (!node) break;
    marks.set(node.id, "path");
    push(13, { en: `search("${probe}"): follow '${char}'.`, pt: `search("${probe}"): segue '${char}'.` }, `search: ${probe}`);
  }
  if (node) marks.set(node.id, node.end ? "done" : "cur");
  push(14, node?.end ? { en: `Every character matched and the node is an end: "${probe}" is in the trie, ${probe.length} steps whatever the number of words.`, pt: `Todo caractere casou e o nó é um fim: "${probe}" está na trie, ${probe.length} passos seja qual for o número de palavras.` } : { en: `The path exists but is not marked as an end: "${probe}" is only a prefix.`, pt: `O caminho existe mas não é marcado como fim: "${probe}" é só um prefixo.` }, `search: ${probe}`);

  op = "prefix";
  const prefix = probe.slice(0, Math.max(1, Math.min(2, probe.length - 1)));
  marks.clear();
  node = nodes[0];
  for (const char of prefix) {
    node = node?.children.get(char);
    if (!node) break;
    marks.set(node.id, "path");
  }
  push(18, { en: `startsWith("${prefix}"): walk down the prefix, then collect every end below it.`, pt: `startsWith("${prefix}"): desce pelo prefixo, depois coleta todo fim abaixo dele.` }, `prefix: ${prefix}`);
  const found: string[] = [];
  const collect = (current: TrieNode, text: string) => {
    if (current.end) {
      found.push(text);
      marks.set(current.id, "done");
      matches = found.join(" ");
      push(19, { en: `Reached an end: "${text}" starts with "${prefix}".`, pt: `Chegou num fim: "${text}" começa com "${prefix}".` }, `prefix: ${prefix}`);
    }
    for (const [char, child] of current.children) {
      marks.set(child.id, marks.get(child.id) ?? "cur");
      collect(child, text + char);
    }
  };
  if (node) collect(node, prefix);
  push(21, { en: `Done. ${found.length} word${found.length === 1 ? "" : "s"} share the prefix "${prefix}": ${found.join(", ")}. ${nodes.length} nodes hold ${stored} words of ${words.join("").length} characters.`, pt: `Pronto. ${found.length} palavra${found.length === 1 ? "" : "s"} compartilha${found.length === 1 ? "" : "m"} o prefixo "${prefix}": ${found.join(", ")}. ${nodes.length} nós guardam ${stored} palavras de ${words.join("").length} caracteres.` }, `prefix: ${prefix}`);
  const meta: Localized = { en: `${n} words · seed ${seed}`, pt: `${n} palavras · seed ${seed}` };
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordSegmentTree: Recorder = (n, seed) => {
  const rand = seeded(seed);
  const values = Array.from({ length: n }, () => 1 + Math.floor(rand() * 20));
  const sums: number[] = [];
  const ranges: [number, number][] = [];
  const nodes: TreeNode[] = [];
  const marks = new Map<number, NodeMark>();
  const labels = new Map<number, string>();
  const steps: TreeStep[] = [];
  let visits = 0;
  let op = "build";
  let answer: number | string = "—";
  let ownerOf = (i: number) => i;
  const counters = (): Record<string, Counter> => ({ nodes: nodes.length, visits, op, answer, leaves: n });
  const push = (line: number, note: Localized) => {
    const laid = layout(nodes[0] ?? null, marks, labels);
    laid.nodes.forEach((node) => {
      node.key = sums[node.id];
    });
    steps.push({ ...laid, tape: values, aside: "", line, note, counters: counters() });
  };
  const makeNode = (left: number, right: number): TreeNode => {
    const node: TreeNode = { id: nodes.length, key: 0, left: null, right: null, parent: null };
    nodes.push(node);
    ranges.push([left, right]);
    sums.push(0);
    labels.set(node.id, left === right ? `[${left}]` : `[${left}, ${right}]`);
    return node;
  };
  const build = (left: number, right: number, parent: TreeNode | null): TreeNode => {
    const node = makeNode(left, right);
    node.parent = parent;
    if (left === right) {
      sums[node.id] = values[left];
      marks.set(node.id, "fresh");
      push(3, { en: `Leaf [${left}] holds array[${left}] = ${values[left]}.`, pt: `A folha [${left}] guarda array[${left}] = ${values[left]}.` });
      marks.set(node.id, "done");
      return node;
    }
    const middle = (left + right) >> 1;
    marks.set(node.id, "cur");
    push(5, { en: `Node [${left}, ${right}] splits at ${middle}: build [${left}, ${middle}] and [${middle + 1}, ${right}] first.`, pt: `O nó [${left}, ${right}] divide em ${middle}: constrói [${left}, ${middle}] e [${middle + 1}, ${right}] antes.` });
    node.left = build(left, middle, node);
    node.right = build(middle + 1, right, node);
    sums[node.id] = sums[node.left.id] + sums[node.right.id];
    marks.set(node.id, "fresh");
    push(6, { en: `[${left}, ${right}] = ${sums[node.left.id]} + ${sums[node.right.id]} = ${sums[node.id]}, the sum of its two halves.`, pt: `[${left}, ${right}] = ${sums[node.left.id]} + ${sums[node.right.id]} = ${sums[node.id]}, a soma das duas metades.` });
    marks.set(node.id, "done");
    return node;
  };
  build(0, n - 1, null);
  ownerOf = (i) => nodes.findIndex((_, id) => ranges[id][0] === i && ranges[id][1] === i);

  op = "query";
  const query = (node: TreeNode, left: number, right: number): number => {
    const [from, to] = ranges[node.id];
    visits++;
    if (right < from || to < left) {
      marks.set(node.id, "seen" as NodeMark);
      push(10, { en: `[${from}, ${to}] is outside [${left}, ${right}]: contributes 0.`, pt: `[${from}, ${to}] está fora de [${left}, ${right}]: contribui 0.` });
      return 0;
    }
    if (left <= from && to <= right) {
      marks.set(node.id, "done");
      push(11, { en: `[${from}, ${to}] lies fully inside [${left}, ${right}]: take its sum ${sums[node.id]} whole.`, pt: `[${from}, ${to}] está totalmente dentro de [${left}, ${right}]: pega a soma ${sums[node.id]} inteira.` });
      return sums[node.id];
    }
    marks.set(node.id, "path");
    push(12, { en: `[${from}, ${to}] overlaps [${left}, ${right}] partly: ask both children.`, pt: `[${from}, ${to}] cruza [${left}, ${right}] em parte: pergunta aos dois filhos.` });
    return query(node.left!, left, right) + query(node.right!, left, right);
  };
  for (let round = 0; round < 2; round++) {
    const a = Math.floor(rand() * n);
    const b = Math.floor(rand() * n);
    const [left, right] = a <= b ? [a, b] : [b, a];
    marks.clear();
    visits = 0;
    answer = "—";
    push(9, { en: `Query the sum of array[${left}..${right}]${left === right ? "" : `, ${right - left + 1} elements`}.`, pt: `Consulta a soma de array[${left}..${right}]${left === right ? "" : `, ${right - left + 1} elementos`}.` });
    answer = query(nodes[0], left, right);
    push(13, { en: `Sum of [${left}, ${right}] = ${answer}, from ${visits} node visits instead of ${right - left + 1} array reads.`, pt: `Soma de [${left}, ${right}] = ${answer}, com ${visits} visitas a nós em vez de ${right - left + 1} leituras do vetor.` });
  }

  op = "update";
  const index = Math.floor(rand() * n);
  const newValue = 1 + Math.floor(rand() * 20);
  marks.clear();
  visits = 0;
  answer = "—";
  push(15, { en: `Update array[${index}] from ${values[index]} to ${newValue}: change the leaf, then every ancestor.`, pt: `Atualiza array[${index}] de ${values[index]} para ${newValue}: muda a folha, depois todo ancestral.` });
  values[index] = newValue;
  let node: TreeNode | null = nodes[ownerOf(index)];
  sums[node.id] = newValue;
  marks.set(node.id, "fresh");
  visits++;
  push(16, { en: `Leaf [${index}] = ${newValue}.`, pt: `Folha [${index}] = ${newValue}.` });
  for (node = node.parent; node; node = node.parent) {
    sums[node.id] = sums[node.left!.id] + sums[node.right!.id];
    visits++;
    marks.set(node.id, "fresh");
    push(18, { en: `Ancestor [${ranges[node.id][0]}, ${ranges[node.id][1]}] recomputed: ${sums[node.id]}.`, pt: `Ancestral [${ranges[node.id][0]}, ${ranges[node.id][1]}] recalculado: ${sums[node.id]}.` });
  }
  push(19, { en: `Done. The update touched ${visits} nodes, the height of the tree; queries and updates both stay O(log n).`, pt: `Pronto. A atualização tocou ${visits} nós, a altura da árvore; consultas e atualizações ficam ambas em O(log n).` });
  const meta: Localized = { en: `n = ${n} · seed ${seed}`, pt: `n = ${n} · seed ${seed}` };
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordFenwick: Recorder = (n, seed) => {
  const rand = seeded(seed);
  const values = Array.from({ length: n }, () => 1 + Math.floor(rand() * 20));
  const tree = new Array<number>(n + 1).fill(0);
  const marks = new Map<number, NodeMark>();
  const steps: TreeStep[] = [];
  const lowbit = (i: number) => i & -i;
  let touched = 0;
  let op = "build";
  let answer: number | string = "—";
  const counters = (): Record<string, Counter> => ({ touched, op, answer, size: n, height: Math.floor(Math.log2(n)) + 1 });
  // Node i hangs under i − lowbit(i): the chain a prefix query walks; node 0 is the empty prefix.
  const push = (line: number, note: Localized, aside = "") => {
    const items = Array.from({ length: n + 1 }, (_, i) => ({ id: i, key: tree[i], parent: i === 0 ? null : i - lowbit(i), label: i === 0 ? "prefix 0" : `${i}: (${i - lowbit(i)}, ${i}]`, mark: marks.get(i) }));
    steps.push({ ...layoutForest(items), tape: values, aside, line, note, counters: counters() });
  };

  push(2, { en: `A Fenwick tree over ${n} values. Node i stores the sum of the range (i − lowbit(i), i], where lowbit is the lowest set bit of i.`, pt: `Uma árvore de Fenwick sobre ${n} valores. O nó i guarda a soma do intervalo (i − lowbit(i), i], onde lowbit é o bit 1 mais baixo de i.` });
  values.forEach((value, index) => {
    marks.clear();
    for (let i = index + 1; i <= n; i += lowbit(i)) {
      tree[i] += value;
      touched++;
      marks.set(i, marks.size ? "path" : "cur");
      push(5, { en: `add(${index}, ${value}): node ${i} covers index ${index}, add ${value}; next node is ${i} + lowbit(${i}) = ${i + lowbit(i)}.`, pt: `add(${index}, ${value}): o nó ${i} cobre o índice ${index}, soma ${value}; o próximo nó é ${i} + lowbit(${i}) = ${i + lowbit(i)}.` }, `array[${index}] = ${value}`);
    }
  });
  marks.clear();
  push(17, { en: `Built with ${touched} node updates: each value touched log n nodes on its way up.`, pt: `Construída com ${touched} atualizações de nó: cada valor tocou log n nós na subida.` });

  op = "query";
  for (let round = 0; round < 2; round++) {
    const upTo = 1 + Math.floor(rand() * n);
    marks.clear();
    touched = 0;
    answer = 0;
    push(8, { en: `prefix(${upTo}): sum of array[0..${upTo - 1}]. Walk from node ${upTo} down to 0 by clearing the lowest bit each time.`, pt: `prefix(${upTo}): soma de array[0..${upTo - 1}]. Anda do nó ${upTo} até 0 limpando o bit mais baixo a cada vez.` });
    let sum = 0;
    for (let i = upTo; i > 0; i -= lowbit(i)) {
      sum += tree[i];
      touched++;
      marks.set(i, "done");
      answer = sum;
      push(11, { en: `Node ${i} holds ${tree[i]} for (${i - lowbit(i)}, ${i}]: running sum ${sum}; next ${i} − lowbit(${i}) = ${i - lowbit(i)}.`, pt: `O nó ${i} guarda ${tree[i]} para (${i - lowbit(i)}, ${i}]: soma parcial ${sum}; próximo ${i} − lowbit(${i}) = ${i - lowbit(i)}.` });
    }
    push(13, { en: `prefix(${upTo}) = ${sum} from ${touched} nodes; the naive loop would read ${upTo} values.`, pt: `prefix(${upTo}) = ${sum} com ${touched} nós; o laço ingênuo leria ${upTo} valores.` });
  }

  op = "update";
  const index = Math.floor(rand() * n);
  const delta = 1 + Math.floor(rand() * 9);
  marks.clear();
  touched = 0;
  answer = "—";
  values[index] += delta;
  push(3, { en: `add(${index}, ${delta}): array[${index}] becomes ${values[index]}; every node whose range covers ${index} must grow by ${delta}.`, pt: `add(${index}, ${delta}): array[${index}] vira ${values[index]}; todo nó cujo intervalo cobre ${index} precisa crescer ${delta}.` });
  for (let i = index + 1; i <= n; i += lowbit(i)) {
    tree[i] += delta;
    touched++;
    marks.set(i, "fresh");
    push(5, { en: `Node ${i} += ${delta} → ${tree[i]}; next ${i} + lowbit(${i}) = ${i + lowbit(i)}${i + lowbit(i) > n ? ", past the end" : ""}.`, pt: `Nó ${i} += ${delta} → ${tree[i]}; próximo ${i} + lowbit(${i}) = ${i + lowbit(i)}${i + lowbit(i) > n ? ", além do fim" : ""}.` });
  }
  push(20, { en: `Done. ${touched} nodes updated: O(log n) per update and per prefix query, in an array of n + 1 integers and no pointers.`, pt: `Pronto. ${touched} nós atualizados: O(log n) por atualização e por consulta de prefixo, num vetor de n + 1 inteiros e nenhum ponteiro.` });
  const meta: Localized = { en: `n = ${n} · seed ${seed}`, pt: `n = ${n} · seed ${seed}` };
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordTreap: Recorder = (n, seed) => {
  const { rand, keys, marks, labels, steps, push, makeNode, meta } = treeSession(n, seed);
  const priority = new Map<number, number>();
  let root: TreeNode | null = null;
  let count = 0;
  let rotations = 0;
  let comparisons = 0;
  const counters = () => ({ nodes: count, nodesUnit: `/ ${n}`, rotations, height: treeHeight(root), comparisons, expected: (1.4 * Math.log2(Math.max(2, count))).toFixed(1) });
  const relabel = () => labels.forEach((_, id) => labels.set(id, `p${priority.get(id)}`));
  const snapshot = (line: number, note: Localized) => {
    relabel();
    push(line, note, counters(), root);
  };
  const reattach = (parent: TreeNode | null, was: TreeNode, now: TreeNode) => {
    now.parent = parent;
    if (!parent) root = now;
    else if (parent.left === was) parent.left = now;
    else parent.right = now;
  };
  const rotateRight = (node: TreeNode) => {
    const pivot = node.left!;
    node.left = pivot.right;
    if (pivot.right) pivot.right.parent = node;
    reattach(node.parent, node, pivot);
    pivot.right = node;
    node.parent = pivot;
    rotations++;
    return pivot;
  };
  const rotateLeft = (node: TreeNode) => {
    const pivot = node.right!;
    node.right = pivot.left;
    if (pivot.left) pivot.left.parent = node;
    reattach(node.parent, node, pivot);
    pivot.left = node;
    node.parent = pivot;
    rotations++;
    return pivot;
  };

  keys.forEach((key) => {
    marks.clear();
    const fresh = makeNode(key);
    priority.set(fresh.id, 1 + Math.floor(rand() * 99));
    labels.set(fresh.id, "");
    count++;
    if (!root) {
      root = fresh;
      marks.set(fresh.id, "fresh");
      snapshot(2, { en: `The treap is empty: ${key} with random priority ${priority.get(fresh.id)} becomes the root.`, pt: `O treap está vazio: ${key} com prioridade aleatória ${priority.get(fresh.id)} vira a raiz.` });
      return;
    }
    let node: TreeNode = root;
    while (true) {
      marks.set(node.id, "cur");
      comparisons++;
      const side = key < node.key ? "left" : "right";
      snapshot(side === "left" ? 4 : 7, { en: `${key} ${side === "left" ? "<" : "≥"} ${node.key}: go ${side}, like any BST.`, pt: `${key} ${side === "left" ? "<" : "≥"} ${node.key}: vai para a ${side === "left" ? "esquerda" : "direita"}, como em qualquer BST.` });
      marks.set(node.id, "path");
      const next: TreeNode | null = node[side];
      if (!next) {
        node[side] = fresh;
        fresh.parent = node;
        break;
      }
      node = next;
    }
    marks.set(fresh.id, "fresh");
    snapshot(2, { en: `Attach ${key} as a leaf with priority ${priority.get(fresh.id)}. Now the heap rule: a parent's priority must be larger.`, pt: `Pendura ${key} como folha com prioridade ${priority.get(fresh.id)}. Agora a regra do heap: a prioridade do pai precisa ser maior.` });
    const current = fresh;
    while (current.parent && priority.get(current.parent.id)! < priority.get(current.id)!) {
      const parent = current.parent;
      marks.set(parent.id, "pivot");
      marks.set(current.id, "pivot");
      const direction = parent.left === current ? "right" : "left";
      snapshot(direction === "right" ? 5 : 8, { en: `Priority ${priority.get(current.id)} beats its parent's ${priority.get(parent.id)}: rotate ${parent.key} ${direction} so ${current.key} moves up.`, pt: `A prioridade ${priority.get(current.id)} vence a do pai, ${priority.get(parent.id)}: rotaciona ${parent.key} para a ${direction === "right" ? "direita" : "esquerda"} para ${current.key} subir.` });
      if (direction === "right") rotateRight(parent);
      else rotateLeft(parent);
      marks.delete(parent.id);
      marks.set(current.id, "fresh");
      snapshot(10, { en: `Rotated: ${current.key} is above ${parent.key}; keys are still in order, priorities now respect the heap here.`, pt: `Rotacionado: ${current.key} está acima de ${parent.key}; as chaves continuam em ordem, as prioridades agora respeitam o heap aqui.` });
    }
    marks.clear();
    snapshot(10, { en: `${key} is settled. Height ${treeHeight(root)} with ${count} keys; the priorities do the balancing that AVL does with heights.`, pt: `${key} assentou. Altura ${treeHeight(root)} com ${count} chaves; as prioridades fazem o balanceamento que a AVL faz com alturas.` });
  });
  snapshot(10, { en: `Done. ${n} keys, height ${treeHeight(root)}, ${rotations} rotations; the tree is the BST that inserting the keys in priority order would have built.`, pt: `Pronto. ${n} chaves, altura ${treeHeight(root)}, ${rotations} rotações; a árvore é a BST que inserir as chaves em ordem de prioridade teria construído.` });
  return { steps, meta: withSteps(meta, steps.length) };
};
