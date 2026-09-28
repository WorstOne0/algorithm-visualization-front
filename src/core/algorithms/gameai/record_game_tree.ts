// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Recorder, StepBase } from "../recording";

export type GameNode = { id: number; d: number; kids: GameNode[]; leaf: number | null; x: number };

// The tree is fixed for the whole recording; each step carries what the search knows so far.
export type GameTree = { nodes: GameNode[]; root: GameNode; depth: number; leafCount: number };

export type GameTreeStep = StepBase & { tree: GameTree; cur: number; visited: Set<number>; values: Map<number, number>; pruned: Set<number>; best: Set<number> };

const BRANCH = 3;

const bound = (value: number) => (value === Infinity ? "+∞" : value === -Infinity ? "−∞" : String(value));

// Builds the recorder for plain minimax or alpha-beta; `n` is the depth in plies.
export const gameTreeRecorder = (prune: boolean): Recorder => (n, seed) => {
  const rand = seeded(seed);
  const nodes: GameNode[] = [];
  const build = (d: number): GameNode => {
    const node: GameNode = { id: nodes.length, d, kids: [], leaf: d === n ? Math.floor(rand() * 19) - 9 : null, x: 0 };
    nodes.push(node);
    if (d < n) for (let i = 0; i < BRANCH; i++) node.kids.push(build(d + 1));
    return node;
  };
  const root = build(0);
  const leaves = nodes.filter((node) => node.leaf !== null);
  leaves.forEach((node, i) => (node.x = (i + 0.5) / leaves.length));
  const place = (node: GameNode) => {
    if (!node.kids.length) return;
    node.kids.forEach(place);
    node.x = (node.kids[0].x + node.kids[node.kids.length - 1].x) / 2;
  };
  place(root);
  const tree: GameTree = { nodes, root, depth: n, leafCount: leaves.length };
  const subtreeSize = (node: GameNode): number => 1 + node.kids.reduce((sum, kid) => sum + subtreeSize(kid), 0);

  const steps: GameTreeStep[] = [];
  const visited = new Set<number>();
  const values = new Map<number, number>();
  const pruned = new Set<number>();
  let cur = root.id;
  let leavesScored = 0;
  let prunedCount = 0;
  let alpha = -Infinity;
  let beta = Infinity;
  const turnOf = (node: GameNode): Localized => (node.d % 2 === 0 ? { en: "MAX", pt: "MAX" } : { en: "MIN", pt: "MIN" });
  const push = (line: number, note: Localized, node: GameNode) => {
    cur = node.id;
    steps.push({
      tree, cur, visited: new Set(visited), values: new Map(values), pruned: new Set(pruned), best: new Set(), line, note,
      counters: { visited: visited.size, visitedUnit: `/ ${nodes.length}`, leaves: leavesScored, leavesUnit: `/ ${leaves.length}`, best: values.has(node.id) ? values.get(node.id)! : "—", depth: node.d, depthUnit: `/ ${n}`, turn: turnOf(node), pruned: prunedCount, alpha: bound(alpha), beta: bound(beta) },
    });
  };
  const markPruned = (node: GameNode) => {
    pruned.add(node.id);
    node.kids.forEach(markPruned);
  };

  const rec = (node: GameNode, a: number, b: number, isMax: boolean): number => {
    visited.add(node.id);
    alpha = a;
    beta = b;
    const turn = isMax ? "MAX" : "MIN";
    if (node.leaf !== null) {
      values.set(node.id, node.leaf);
      leavesScored++;
      push(2, { en: `Leaf: the static evaluation says ${node.leaf}. Return it.`, pt: `Folha: a avaliação estática diz ${node.leaf}. Devolve.` }, node);
      return node.leaf;
    }
    push(1, prune
      ? { en: `Enter a ${turn} node at depth ${node.d} with α = ${bound(a)}, β = ${bound(b)}.`, pt: `Entra num nó ${turn} na profundidade ${node.d} com α = ${bound(a)}, β = ${bound(b)}.` }
      : { en: `Enter a ${turn} node at depth ${node.d}: ${turn} will keep the ${isMax ? "largest" : "smallest"} child value.`, pt: `Entra num nó ${turn} na profundidade ${node.d}: ${turn} vai guardar o ${isMax ? "maior" : "menor"} valor entre os filhos.` }, node);
    let best = isMax ? -Infinity : Infinity;
    for (let i = 0; i < node.kids.length; i++) {
      const value = rec(node.kids[i], a, b, !isMax);
      best = isMax ? Math.max(best, value) : Math.min(best, value);
      values.set(node.id, best);
      alpha = a;
      beta = b;
      push(6, { en: `Child ${i + 1} returned ${value}: ${turn} keeps ${best}.`, pt: `O filho ${i + 1} devolveu ${value}: ${turn} guarda ${best}.` }, node);
      if (!prune) continue;
      if (isMax) a = Math.max(a, best);
      else b = Math.min(b, best);
      alpha = a;
      beta = b;
      push(7, { en: `Tighten the window: α = ${bound(a)}, β = ${bound(b)}.`, pt: `Aperta a janela: α = ${bound(a)}, β = ${bound(b)}.` }, node);
      if (b > a || i === node.kids.length - 1) continue;
      const rest = node.kids.slice(i + 1);
      const skipped = rest.reduce((sum, kid) => sum + subtreeSize(kid), 0);
      rest.forEach(markPruned);
      prunedCount += skipped;
      push(8, {
        en: `Cut: β ≤ α. The opponent already has a better option above, so the remaining ${rest.length} children cannot change the result. ${skipped} nodes skipped.`,
        pt: `Corte: β ≤ α. O oponente já tem opção melhor acima, então os ${rest.length} filhos restantes não podem mudar o resultado. ${skipped} nós pulados.`,
      }, node);
      break;
    }
    push(prune ? 10 : 8, { en: `Return ${best} from this ${turn} node.`, pt: `Devolve ${best} deste nó ${turn}.` }, node);
    return best;
  };
  rec(root, -Infinity, Infinity, true);

  const best = new Set<number>();
  let node: GameNode | undefined = root;
  while (node) {
    best.add(node.id);
    const target: number | undefined = values.get(node.id);
    node = node.kids.find((kid) => values.get(kid.id) === target);
  }
  const last = steps[steps.length - 1];
  steps.push({ ...last, best, line: prune ? 10 : 8, note: { en: `Done. The root is worth ${values.get(root.id)}: the violet line is the play both sides cannot improve on. ${leavesScored} of ${leaves.length} leaves were scored.`, pt: `Pronto. A raiz vale ${values.get(root.id)}: a linha violeta é o jogo que nenhum dos lados consegue melhorar. ${leavesScored} de ${leaves.length} folhas foram pontuadas.` } });
  const meta: Localized = { en: `b = ${BRANCH} · depth ${n} · ${leaves.length} leaves · seed ${seed} · ${steps.length} steps`, pt: `b = ${BRANCH} · profundidade ${n} · ${leaves.length} folhas · seed ${seed} · ${steps.length} passos` };
  return { steps, meta };
};
