// Utils
import { ri, rnd } from "../random";

export type GraphNode = { x: number; y: number };

export type GraphState = { nodes: GraphNode[]; edges: [number, number][]; seen: Set<number>; cur: Set<number>; lit: Set<string> };

// Random planar-ish graph (each node joins its two nearest) and a level-by-level BFS from a random node.
export function* graphBfs(n: number, w: number, h: number): Generator<GraphState, void, void> {
  const nodes: GraphNode[] = Array.from({ length: n }, () => ({ x: rnd(0.08, 0.92), y: rnd(0.12, 0.88) }));
  const edges: [number, number][] = [];
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, (a.y - b.y) * (h / w)) }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach((o) => {
        if (!edges.some((e) => (e[0] === i && e[1] === o.j) || (e[0] === o.j && e[1] === i))) edges.push([i, o.j]);
      });
  });
  const adj: number[][] = Array.from({ length: n }, () => []);
  edges.forEach(([a, b]) => {
    adj[a].push(b);
    adj[b].push(a);
  });
  const start = ri(0, n);
  const seen = new Set<number>([start]);
  const lit = new Set<string>();
  let queue = [start];
  yield { nodes, edges, seen: new Set(seen), cur: new Set(queue), lit: new Set() };
  while (queue.length) {
    const next: number[] = [];
    for (const u of queue) {
      for (const v of adj[u]) {
        if (seen.has(v)) continue;
        seen.add(v);
        next.push(v);
        lit.add(u + "-" + v);
        lit.add(v + "-" + u);
      }
    }
    queue = next;
    yield { nodes, edges, seen: new Set(seen), cur: new Set(queue), lit: new Set(lit) };
  }
}
