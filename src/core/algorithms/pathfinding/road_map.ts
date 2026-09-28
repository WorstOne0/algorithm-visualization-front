// The road graph the real-map pages run on: public/data/<city>.json, built by scripts/build_map.mjs from OpenStreetMap.

export type RoadEdge = { id: number; a: number; b: number; length: number; cls: number; oneway: boolean; name: number };

export type RoadMap = {
  city: string;
  source: string;
  names: string[];
  // Metres east and south of the map's top-left corner.
  x: Float64Array;
  y: Float64Array;
  width: number;
  height: number;
  edges: RoadEdge[];
  // Edge ids leaving each node; a one-way segment is listed on its tail only.
  out: number[][];
  // Nodes of the largest strongly connected component, where start and goal are drawn from.
  component: number[];
};

type RoadFile = { city: string; source: string; names: string[]; nodes: number[]; edges: number[] };

const METRES_PER_DEGREE = 111320;

function largestComponent(count: number, edges: RoadEdge[]) {
  const forward: number[][] = Array.from({ length: count }, () => []);
  const backward: number[][] = Array.from({ length: count }, () => []);
  edges.forEach((edge) => {
    forward[edge.a].push(edge.b);
    backward[edge.b].push(edge.a);
    if (edge.oneway) return;
    forward[edge.b].push(edge.a);
    backward[edge.a].push(edge.b);
  });
  const reach = (from: number, adj: number[][]) => {
    const seen = new Uint8Array(count);
    const stack = [from];
    seen[from] = 1;
    while (stack.length) {
      const node = stack.pop()!;
      adj[node].forEach((next) => {
        if (seen[next]) return;
        seen[next] = 1;
        stack.push(next);
      });
    }
    return seen;
  };
  // A few seeds are enough: the component holding the city centre is the big one.
  let best: number[] = [];
  for (let seed = 0; seed < count; seed += Math.max(1, Math.floor(count / 12))) {
    const ahead = reach(seed, forward);
    const behind = reach(seed, backward);
    const members: number[] = [];
    for (let node = 0; node < count; node++) if (ahead[node] && behind[node]) members.push(node);
    if (members.length > best.length) best = members;
  }
  return best;
}

export function parseRoadMap(file: RoadFile): RoadMap {
  const count = file.nodes.length / 2;
  const lat = new Float64Array(count);
  const lon = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    lon[i] = file.nodes[2 * i] / 1e5;
    lat[i] = file.nodes[2 * i + 1] / 1e5;
  }
  const minLon = Math.min(...lon);
  const maxLat = Math.max(...lat);
  const midLat = (Math.min(...lat) + maxLat) / 2;
  const x = new Float64Array(count);
  const y = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    x[i] = (lon[i] - minLon) * METRES_PER_DEGREE * Math.cos((midLat * Math.PI) / 180);
    y[i] = (maxLat - lat[i]) * METRES_PER_DEGREE;
  }
  const edges: RoadEdge[] = [];
  for (let i = 0; i < file.edges.length; i += 6) edges.push({ id: edges.length, a: file.edges[i], b: file.edges[i + 1], length: file.edges[i + 2], cls: file.edges[i + 3], oneway: file.edges[i + 4] === 1, name: file.edges[i + 5] });
  const out: number[][] = Array.from({ length: count }, () => []);
  edges.forEach((edge) => {
    out[edge.a].push(edge.id);
    if (!edge.oneway) out[edge.b].push(edge.id);
  });
  return { city: file.city, source: file.source, names: file.names, x, y, width: Math.max(...x), height: Math.max(...y), edges, out, component: largestComponent(count, edges) };
}

let cached: RoadMap | null = null;
let pending: Promise<RoadMap> | null = null;

export const getRoadMap = () => cached;

export function loadRoadMap(): Promise<RoadMap> {
  if (cached) return Promise.resolve(cached);
  pending ??= fetch("/data/cascavel.json")
    .then((response) => response.json() as Promise<RoadFile>)
    .then((file) => {
      cached = parseRoadMap(file);
      return cached;
    });
  return pending;
}

export const otherEnd = (edge: RoadEdge, from: number) => (edge.a === from ? edge.b : edge.a);

export const straightLine = (map: RoadMap, a: number, b: number) => Math.hypot(map.x[a] - map.x[b], map.y[a] - map.y[b]);

// A start and a goal inside the main component about `metres` apart as the crow flies.
export function pickRoute(map: RoadMap, metres: number, rand: () => number): [number, number] {
  const pool = map.component;
  let best: [number, number] = [pool[0], pool[pool.length - 1]];
  let bestGap = Infinity;
  for (let attempt = 0; attempt < 400; attempt++) {
    const a = pool[Math.floor(rand() * pool.length)];
    const b = pool[Math.floor(rand() * pool.length)];
    if (a === b) continue;
    const gap = Math.abs(straightLine(map, a, b) - metres);
    if (gap >= bestGap) continue;
    bestGap = gap;
    best = [a, b];
    if (gap < metres * 0.08) break;
  }
  return best;
}

// The street a node sits on, for the step notes: the name of its first named edge.
export function streetOf(map: RoadMap, node: number) {
  const edge = map.out[node].map((id) => map.edges[id]).find((candidate) => candidate.name >= 0) ?? map.edges.find((candidate) => (candidate.a === node || candidate.b === node) && candidate.name >= 0);
  return edge ? map.names[edge.name] : null;
}
