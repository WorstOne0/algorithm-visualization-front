// Utils
import { ri } from "../random";

export type MinimaxNode = { id: number; d: number; parent: MinimaxNode | null; kids: MinimaxNode[]; val: number | null; x: number; pick?: number };

export type MinimaxState = { nodes: MinimaxNode[]; cur: MinimaxNode | null; visited: Set<number>; pruned: Set<number>; best: Set<number> };

// Full game tree with random leaf values, searched with alpha-beta; yields the recorded visit order.
export function* minimax(branch: number, depth: number): Generator<MinimaxState, void, void> {
  const nodes: MinimaxNode[] = [];
  let id = 0;
  const build = (d: number, parent: MinimaxNode | null): MinimaxNode => {
    const node: MinimaxNode = { id: id++, d, parent, kids: [], val: d === depth ? ri(-9, 10) : null, x: 0 };
    nodes.push(node);
    if (d < depth) for (let i = 0; i < branch; i++) node.kids.push(build(d + 1, node));
    return node;
  };
  const root = build(0, null);
  const leaves = nodes.filter((node) => node.d === depth);
  leaves.forEach((node, i) => (node.x = (i + 0.5) / leaves.length));
  const place = (node: MinimaxNode) => {
    if (!node.kids.length) return;
    node.kids.forEach(place);
    node.x = (node.kids[0].x + node.kids[node.kids.length - 1].x) / 2;
  };
  place(root);

  const state = { cur: null as MinimaxNode | null, visited: new Set<number>(), pruned: new Set<number>(), best: new Set<number>() };
  const steps: MinimaxState[] = [];
  const snapshot = (): MinimaxState => ({ nodes, cur: state.cur, visited: new Set(state.visited), pruned: new Set(state.pruned), best: new Set(state.best) });
  const markPruned = (node: MinimaxNode) => {
    state.pruned.add(node.id);
    node.kids.forEach(markPruned);
  };
  const rec = (node: MinimaxNode, alpha: number, beta: number, max: boolean): number => {
    state.cur = node;
    state.visited.add(node.id);
    steps.push(snapshot());
    if (!node.kids.length) return node.val ?? 0;
    let v = max ? -Infinity : Infinity;
    for (let i = 0; i < node.kids.length; i++) {
      const kid = node.kids[i];
      const r = rec(kid, alpha, beta, !max);
      if (max) {
        if (r > v) {
          v = r;
          node.pick = kid.id;
        }
        alpha = Math.max(alpha, r);
      } else {
        if (r < v) {
          v = r;
          node.pick = kid.id;
        }
        beta = Math.min(beta, r);
      }
      if (beta <= alpha) {
        node.kids.slice(i + 1).forEach(markPruned);
        steps.push(snapshot());
        break;
      }
    }
    node.val = v;
    return v;
  };
  rec(root, -Infinity, Infinity, true);

  let t: MinimaxNode | undefined = root;
  while (t) {
    state.best.add(t.id);
    const pick: number | undefined = t.pick;
    t = nodes.find((node) => node.id === pick);
  }
  state.cur = null;
  steps.push(snapshot());
  for (const step of steps) yield step;
}
