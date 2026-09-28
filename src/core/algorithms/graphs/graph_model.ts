// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Counter, StepBase } from "../recording";

export type GraphNode = { id: number; label: string; x: number; y: number };
export type GraphEdge = { id: number; u: number; v: number; w: number };
// adj[node] lists edge ids: both directions on undirected graphs, outgoing only on a DAG.
export type GraphData = { nodes: GraphNode[]; edges: GraphEdge[]; adj: number[][]; weighted: boolean; directed: boolean };

export type NodeMark = "cur" | "frontier" | "seen" | "done";
export type EdgeMark = "used" | "cur" | "rejected" | "candidate";

export type GraphStep = StepBase & { graph: GraphData; nodeMarks: Map<number, NodeMark>; edgeMarks: Map<number, EdgeMark>; labels: Map<number, string>; aside: string };

const LETTERS = "ABCDEFGHIJKLMNOP";

function unionFind(n: number) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const union = (a: number, b: number) => {
    parent[find(a)] = find(b);
  };
  return { find, union };
}

// Nodes on a jittered grid; undirected graphs join each node to its two nearest and get patched into one
// component, DAGs point every edge from left to right.
export function makeGraph(n: number, seed: number, { weighted, directed }: { weighted: boolean; directed: boolean }): GraphData {
  const rand = seeded(seed);
  const cols = Math.ceil(Math.sqrt(n * 1.7));
  const rows = Math.ceil(n / cols);
  const cells: [number, number][] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([r, c]);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const points = cells.slice(0, n).map(([r, c]) => ({ x: 0.08 + ((c + 0.5) / cols) * 0.84 + (rand() - 0.5) * 0.08, y: 0.12 + ((r + 0.5) / rows) * 0.76 + (rand() - 0.5) * 0.1 }));
  if (directed) points.sort((a, b) => a.x - b.x);
  const nodes: GraphNode[] = points.map((p, id) => ({ id, label: LETTERS[id], x: p.x, y: p.y }));
  const edges: GraphEdge[] = [];
  const has = (a: number, b: number) => edges.some((e) => (e.u === a && e.v === b) || (e.u === b && e.v === a));
  const add = (u: number, v: number) => edges.push({ id: edges.length, u, v, w: weighted ? 1 + Math.floor(rand() * 9) : 1 });
  const distance = (a: number, b: number) => Math.hypot(nodes[a].x - nodes[b].x, (nodes[a].y - nodes[b].y) * 0.6);

  if (directed) {
    for (let i = 0; i < n; i++) {
      const candidates = nodes.slice(i + 1, i + 5).map((node) => node.id);
      candidates.forEach((j) => {
        if (rand() < 0.45) add(i, j);
      });
    }
    for (let j = 1; j < n; j++) {
      if (edges.some((e) => e.v === j)) continue;
      add(Math.floor(rand() * j), j);
    }
  } else {
    nodes.forEach((node) => {
      nodes
        .filter((other) => other.id !== node.id)
        .sort((a, b) => distance(node.id, a.id) - distance(node.id, b.id))
        .slice(0, 2)
        .forEach((other) => {
          if (!has(node.id, other.id)) add(node.id, other.id);
        });
    });
    const uf = unionFind(n);
    edges.forEach((e) => uf.union(e.u, e.v));
    while (true) {
      let best: [number, number] | null = null;
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (uf.find(a) !== uf.find(b) && (!best || distance(a, b) < distance(best[0], best[1]))) best = [a, b];
      if (!best) break;
      add(best[0], best[1]);
      uf.union(best[0], best[1]);
    }
  }

  const adj: number[][] = nodes.map(() => []);
  edges.forEach((e) => {
    adj[e.u].push(e.id);
    if (!directed) adj[e.v].push(e.id);
  });
  return { nodes, edges, adj, weighted, directed };
}

// The mutable marks every graph recorder writes into, snapshotted on each push.
export function graphSession(n: number, seed: number, options: { weighted: boolean; directed: boolean }) {
  const graph = makeGraph(n, seed, options);
  const nodeMarks = new Map<number, NodeMark>();
  const edgeMarks = new Map<number, EdgeMark>();
  const labels = new Map<number, string>();
  const steps: GraphStep[] = [];
  let aside = "";
  const push = (line: number, note: Localized, counters: Record<string, Counter>) => steps.push({ graph, nodeMarks: new Map(nodeMarks), edgeMarks: new Map(edgeMarks), labels: new Map(labels), aside, line, note, counters });
  const setAside = (text: string) => {
    aside = text;
  };
  const name = (id: number) => graph.nodes[id].label;
  const other = (edge: GraphEdge, from: number) => (edge.u === from ? edge.v : edge.u);
  const meta: Localized = { en: `${n} nodes · ${graph.edges.length} edges · seed ${seed}`, pt: `${n} nós · ${graph.edges.length} arestas · seed ${seed}` };
  return { graph, nodeMarks, edgeMarks, labels, steps, push, setAside, name, other, meta, unionFind };
}
