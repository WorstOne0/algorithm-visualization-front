// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Counter, Recorder } from "../recording";
import { BRANCH, makeGameTree, type GameNode, type GameTree, type GameTreeStep } from "./record_game_tree";

// Line numbers in every recorder mirror the listings in core/models/algorithms/gameai_more.ts.

const withSteps = (meta: Localized, count: number): Localized => ({ en: `${meta.en} · ${count} steps`, pt: `${meta.pt} · ${count} passos` });

function session(tree: GameTree) {
  const steps: GameTreeStep[] = [];
  const visited = new Set<number>();
  const values = new Map<number, number>();
  const best = new Set<number>();
  const labels = new Map<number, string>();
  const push = (line: number, note: Localized, node: GameNode, counters: Record<string, Counter>) => steps.push({ tree, cur: node.id, visited: new Set(visited), values: new Map(values), pruned: new Set(), best: new Set(best), labels: labels.size ? new Map(labels) : undefined, line, note, counters });
  return { steps, visited, values, best, labels, push };
}

// The static evaluation an engine would use at a cut-off: the mean of the leaves below, which a real one only estimates.
const heuristicOf = (node: GameNode): number => (node.leaf !== null ? node.leaf : Math.round(node.kids.reduce((sum, kid) => sum + heuristicOf(kid), 0) / node.kids.length));

export const recordIterativeDeepening: Recorder = (n, seed) => {
  const rand = seeded(seed);
  const tree = makeGameTree(n, rand);
  const { steps, visited, values, best, push } = session(tree);
  let limit = 0;
  let visitedNow = 0;
  let total = 0;
  let bestMove: number | string = "—";
  let rootValue: number | string = "—";
  const counters = () => ({ limit, limitUnit: `/ ${n}`, visitedNow, total, rootValue, bestMove });

  const search = (node: GameNode, depthLeft: number, maximizing: boolean): { value: number; move?: GameNode } => {
    visited.add(node.id);
    visitedNow++;
    total++;
    if (node.leaf !== null) {
      values.set(node.id, node.leaf);
      push(9, { en: `Leaf: the game is over here, score ${node.leaf}.`, pt: `Folha: o jogo acaba aqui, pontuação ${node.leaf}.` }, node, counters());
      return { value: node.leaf };
    }
    if (depthLeft === 0) {
      const estimate = heuristicOf(node);
      values.set(node.id, estimate);
      push(10, { en: `Depth limit reached at ply ${node.d}: no time to look further, the static evaluation estimates ${estimate}.`, pt: `Limite de profundidade no lance ${node.d}: sem tempo para olhar além, a avaliação estática estima ${estimate}.` }, node, counters());
      return { value: estimate };
    }
    push(11, { en: `${maximizing ? "MAX" : "MIN"} node at ply ${node.d}: search each child ${depthLeft - 1} ${depthLeft - 1 === 1 ? "ply" : "plies"} deeper.`, pt: `Nó ${maximizing ? "MAX" : "MIN"} no lance ${node.d}: busca cada filho ${depthLeft - 1} lance${depthLeft - 1 === 1 ? "" : "s"} mais fundo.` }, node, counters());
    let chosen = { value: maximizing ? -Infinity : Infinity, move: node.kids[0] };
    node.kids.forEach((kid) => {
      const result = search(kid, depthLeft - 1, !maximizing);
      if (maximizing ? result.value > chosen.value : result.value < chosen.value) chosen = { value: result.value, move: kid };
      values.set(node.id, chosen.value);
    });
    push(12, { en: `${maximizing ? "MAX" : "MIN"} keeps ${chosen.value} from child ${node.kids.indexOf(chosen.move) + 1}.`, pt: `${maximizing ? "MAX" : "MIN"} guarda ${chosen.value} do filho ${node.kids.indexOf(chosen.move) + 1}.` }, node, counters());
    return chosen;
  };

  for (limit = 1; limit <= n; limit++) {
    visited.clear();
    values.clear();
    best.clear();
    visitedNow = 0;
    push(3, { en: `Iteration ${limit}: search ${limit} ${limit === 1 ? "ply" : "plies"} deep. The move found so far stays valid if time runs out.`, pt: `Iteração ${limit}: busca ${limit} lance${limit === 1 ? "" : "s"} de profundidade. A jogada achada até aqui continua válida se o tempo acabar.` }, tree.root, counters());
    const result = search(tree.root, limit, true);
    rootValue = result.value;
    bestMove = result.move ? tree.root.kids.indexOf(result.move) + 1 : "—";
    best.clear();
    best.add(tree.root.id);
    if (result.move) best.add(result.move.id);
    push(4, { en: `Depth ${limit} done: best move is child ${bestMove} worth ${rootValue}, after ${visitedNow} nodes (${total} so far). Deeper searches may change it.`, pt: `Profundidade ${limit} pronta: a melhor jogada é o filho ${bestMove}, valendo ${rootValue}, depois de ${visitedNow} nós (${total} até aqui). Buscas mais fundas podem mudá-la.` }, tree.root, counters());
  }
  limit = n;
  push(6, { en: `Done. The full-depth answer is child ${bestMove}; the shallow iterations cost only ${total - visitedNow} extra nodes on top of the ${visitedNow} of the last one, and each gave a usable move early.`, pt: `Pronto. A resposta de profundidade total é o filho ${bestMove}; as iterações rasas custaram só ${total - visitedNow} nós extras além dos ${visitedNow} da última, e cada uma deu uma jogada usável cedo.` }, tree.root, counters());
  const meta: Localized = { en: `b = ${BRANCH} · depth ${n} · seed ${seed}`, pt: `b = ${BRANCH} · profundidade ${n} · seed ${seed}` };
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordExpectimax: Recorder = (n, seed) => {
  const rand = seeded(seed);
  const tree = makeGameTree(n, rand);
  tree.levelNames = Array.from({ length: n + 1 }, (_, d) => (d % 2 === 0 ? "MAX" : "CHANCE"));
  const { steps, visited, values, best, push } = session(tree);
  let leavesScored = 0;
  let chanceNodes = 0;
  const round = (value: number) => Math.round(value * 10) / 10;
  const counters = (node: GameNode) => ({ visited: visited.size, visitedUnit: `/ ${tree.nodes.length}`, leaves: leavesScored, leavesUnit: `/ ${tree.leafCount}`, value: values.has(node.id) ? values.get(node.id)! : "—", chance: chanceNodes, probability: `1 / ${BRANCH}` });

  const rec = (node: GameNode, chance: boolean): number => {
    visited.add(node.id);
    if (node.leaf !== null) {
      values.set(node.id, node.leaf);
      leavesScored++;
      push(2, { en: `Leaf: outcome ${node.leaf}.`, pt: `Folha: resultado ${node.leaf}.` }, node, counters(node));
      return node.leaf;
    }
    if (chance) {
      chanceNodes++;
      push(3, { en: `Chance node at ply ${node.d}: a die, a card, a random opponent. Each of the ${node.kids.length} outcomes has probability 1/${node.kids.length}.`, pt: `Nó de chance no lance ${node.d}: um dado, uma carta, um oponente aleatório. Cada um dos ${node.kids.length} resultados tem probabilidade 1/${node.kids.length}.` }, node, counters(node));
      let expected = 0;
      node.kids.forEach((kid, i) => {
        const value = rec(kid, false);
        expected = round(expected + value / node.kids.length);
        values.set(node.id, expected);
        push(5, { en: `Outcome ${i + 1} is worth ${value}: add ${value} × 1/${node.kids.length}; the expectation so far is ${expected}.`, pt: `O resultado ${i + 1} vale ${value}: soma ${value} × 1/${node.kids.length}; a expectativa até aqui é ${expected}.` }, node, counters(node));
      });
      push(6, { en: `Return the expected value ${expected}: not the best case, not the worst, the average.`, pt: `Devolve o valor esperado ${expected}: nem o melhor caso, nem o pior, a média.` }, node, counters(node));
      return expected;
    }
    push(8, { en: `MAX node at ply ${node.d}: pick the child with the highest expected value.`, pt: `Nó MAX no lance ${node.d}: escolhe o filho de maior valor esperado.` }, node, counters(node));
    let bestValue = -Infinity;
    node.kids.forEach((kid, i) => {
      const value = rec(kid, true);
      bestValue = Math.max(bestValue, value);
      values.set(node.id, bestValue);
      push(9, { en: `Child ${i + 1} is worth ${value}: MAX keeps ${bestValue}.`, pt: `O filho ${i + 1} vale ${value}: MAX guarda ${bestValue}.` }, node, counters(node));
    });
    push(10, { en: `Return ${bestValue} from this MAX node.`, pt: `Devolve ${bestValue} deste nó MAX.` }, node, counters(node));
    return bestValue;
  };
  rec(tree.root, false);
  let node: GameNode | undefined = tree.root;
  while (node) {
    best.add(node.id);
    const target: number | undefined = values.get(node.id);
    node = node.d % 2 === 0 ? node.kids.find((kid) => values.get(kid.id) === target) : undefined;
  }
  push(10, { en: `Done. The root is worth ${values.get(tree.root.id)} on average; the violet move is the one with the best expectation, which a minimax player, assuming the worst luck, might have rejected.`, pt: `Pronto. A raiz vale ${values.get(tree.root.id)} em média; a jogada violeta é a de melhor expectativa, que um jogador minimax, supondo a pior sorte, poderia ter rejeitado.` }, tree.root, counters(tree.root));
  const meta: Localized = { en: `b = ${BRANCH} · depth ${n} · seed ${seed}`, pt: `b = ${BRANCH} · profundidade ${n} · seed ${seed}` };
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordMcts: Recorder = (n, seed) => {
  const rand = seeded(seed);
  const DEPTH = 3;
  const tree = makeGameTree(DEPTH, rand);
  const { steps, visited, best, labels, push } = session(tree);
  const visits = new Map<number, number>();
  const totals = new Map<number, number>();
  const parentOf = new Map<number, GameNode>();
  tree.nodes.forEach((node) => node.kids.forEach((kid) => parentOf.set(kid.id, node)));
  const EXPLORE = 1.2;
  let iteration = 0;
  let phase = "—";
  let reward: number | string = "—";
  const mean = (node: GameNode) => (visits.get(node.id) ? totals.get(node.id)! / visits.get(node.id)! : 0);
  const relabel = () => {
    labels.clear();
    tree.nodes.forEach((node) => {
      if (visits.get(node.id)) labels.set(node.id, `${mean(node).toFixed(2)} · ${visits.get(node.id)}`);
    });
  };
  const counters = () => ({ iteration, iterationUnit: `/ ${n}`, phase, reward, rootVisits: visits.get(tree.root.id) ?? 0, bestMove: bestMoveIndex() });
  const bestMoveIndex = () => {
    const ranked = [...tree.root.kids].sort((a, b) => (visits.get(b.id) ?? 0) - (visits.get(a.id) ?? 0));
    return visits.get(ranked[0].id) ? tree.root.kids.indexOf(ranked[0]) + 1 : "—";
  };
  const ucb = (node: GameNode, parent: GameNode, maximizing: boolean) => {
    const count = visits.get(node.id) ?? 0;
    if (!count) return Infinity;
    const explore = EXPLORE * Math.sqrt(Math.log(visits.get(parent.id) ?? 1) / count);
    return maximizing ? mean(node) + explore : -(mean(node) - explore);
  };
  const isExpanded = (node: GameNode) => node.kids.every((kid) => visits.has(kid.id));

  push(1, { en: `An unknown game tree of depth ${DEPTH}: MCTS never scores every leaf, it samples. Rewards are the leaf scores scaled to 0–1 for MAX.`, pt: `Uma árvore de jogo desconhecida de profundidade ${DEPTH}: o MCTS nunca pontua toda folha, ele amostra. As recompensas são as pontuações das folhas escaladas para 0–1 para MAX.` }, tree.root, counters());
  for (iteration = 1; iteration <= n; iteration++) {
    visited.clear();
    best.clear();
    let node = tree.root;
    const path = [node];
    phase = "select";
    while (node.leaf === null && isExpanded(node)) {
      const maximizing = node.d % 2 === 0;
      node = node.kids.reduce((chosen, kid) => (ucb(kid, node, maximizing) > ucb(chosen, node, maximizing) ? kid : chosen), node.kids[0]);
      path.push(node);
    }
    path.forEach((step) => best.add(step.id));
    relabel();
    push(4, { en: `Iteration ${iteration}, selection: follow the child with the best UCB1 score (mean reward + ${EXPLORE} · √(ln parent visits / visits)) down to ply ${node.d}.`, pt: `Iteração ${iteration}, seleção: segue o filho de melhor UCB1 (recompensa média + ${EXPLORE} · √(ln visitas do pai / visitas)) até o lance ${node.d}.` }, node, counters());
    if (node.leaf === null) {
      phase = "expand";
      const fresh = node.kids.find((kid) => !visits.has(kid.id))!;
      node = fresh;
      path.push(node);
      best.add(node.id);
      push(6, { en: `Expansion: add one untried child of that node to the tree.`, pt: `Expansão: adiciona um filho ainda não tentado desse nó à árvore.` }, node, counters());
    }
    phase = "rollout";
    let leaf = node;
    while (leaf.leaf === null) leaf = leaf.kids[Math.floor(rand() * leaf.kids.length)];
    reward = Math.round(((leaf.leaf + 9) / 18) * 100) / 100;
    visited.add(leaf.id);
    push(8, { en: `Simulation: play random moves from there to the end; the game ended at a leaf scoring ${leaf.leaf}, reward ${reward}.`, pt: `Simulação: joga lances aleatórios dali até o fim; o jogo acabou numa folha com ${leaf.leaf}, recompensa ${reward}.` }, leaf, counters());
    phase = "backprop";
    path.forEach((step) => {
      visits.set(step.id, (visits.get(step.id) ?? 0) + 1);
      totals.set(step.id, (totals.get(step.id) ?? 0) + (reward as number));
    });
    relabel();
    push(10, { en: `Backpropagation: every node on the path gets one more visit and ${reward} more reward; the labels read mean · visits.`, pt: `Retropropagação: todo nó do caminho ganha uma visita e ${reward} de recompensa a mais; os rótulos mostram média · visitas.` }, tree.root, counters());
  }
  iteration = n;
  phase = "—";
  best.clear();
  best.add(tree.root.id);
  const chosen = [...tree.root.kids].sort((a, b) => (visits.get(b.id) ?? 0) - (visits.get(a.id) ?? 0))[0];
  best.add(chosen.id);
  push(13, { en: `Done after ${n} iterations: play child ${bestMoveIndex()}, the most visited move, with mean reward ${mean(chosen).toFixed(2)}. Only ${visited.size ? tree.nodes.filter((node) => visits.has(node.id)).length : 0} of ${tree.nodes.length} nodes were ever expanded.`, pt: `Pronto depois de ${n} iterações: joga o filho ${bestMoveIndex()}, a jogada mais visitada, com recompensa média ${mean(chosen).toFixed(2)}. Só ${tree.nodes.filter((node) => visits.has(node.id)).length} dos ${tree.nodes.length} nós foram expandidos.` }, tree.root, counters());
  const meta: Localized = { en: `b = ${BRANCH} · depth ${DEPTH} · ${n} iterations · seed ${seed}`, pt: `b = ${BRANCH} · profundidade ${DEPTH} · ${n} iterações · seed ${seed}` };
  return { steps, meta: withSteps(meta, steps.length) };
};
