// Utils
import { otherEnd, straightLine, type RoadEdge, type RoadMap } from "./road_map";

export type RoadAlgo = "bfs" | "dijkstra" | "astar";

// The search after each expansion; `order` and `parent` are shared and only grow, so a snapshot is an index into them.
export type RoadSearchState = { cur: number; order: number[]; parent: Int32Array; dist: Float64Array; open: number[]; path: number[]; done: boolean };

// Best-first over the road graph; the strategy only decides which open node comes out next. `cost` is what an edge adds to
// the distance: metres by default, metres × slowdown on the traffic page.
export function* roadSearch(map: RoadMap, algo: RoadAlgo, start: number, goal: number, cost: (edge: RoadEdge) => number = (edge) => edge.length): Generator<RoadSearchState, void, void> {
  const count = map.x.length;
  const dist = new Float64Array(count).fill(Infinity);
  const parent = new Int32Array(count).fill(-1);
  const closed = new Uint8Array(count);
  const order: number[] = [];
  const open: number[] = [start];
  dist[start] = 0;
  const priority = (node: number) => (algo === "astar" ? dist[node] + straightLine(map, node, goal) : algo === "dijkstra" ? dist[node] : order.length);

  while (open.length) {
    let bestIndex = 0;
    if (algo !== "bfs") {
      let bestValue = Infinity;
      open.forEach((node, index) => {
        const value = priority(node);
        if (value >= bestValue) return;
        bestValue = value;
        bestIndex = index;
      });
    }
    const cur = open.splice(bestIndex, 1)[0];
    if (closed[cur]) continue;
    closed[cur] = 1;
    order.push(cur);
    if (cur === goal) {
      const path: number[] = [];
      for (let node = goal; node !== -1; node = parent[node]) path.push(node);
      path.reverse();
      yield { cur, order, parent, dist, open: [...open], path, done: true };
      return;
    }
    for (const edgeId of map.out[cur]) {
      const edge = map.edges[edgeId];
      const next = otherEnd(edge, cur);
      if (closed[next]) continue;
      // BFS counts hops, the others metres.
      const candidate = dist[cur] + (algo === "bfs" ? 1 : cost(edge));
      if (candidate >= dist[next]) continue;
      dist[next] = candidate;
      parent[next] = cur;
      open.push(next);
    }
    yield { cur, order, parent, dist, open: [...open], path: [], done: false };
  }
}

// Metres along the parent chain from the start to `node`, whatever the search counted.
export function pathMetres(map: RoadMap, path: number[]) {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const edge = map.edges.find((candidate) => (candidate.a === path[i - 1] && candidate.b === path[i]) || (!candidate.oneway && candidate.b === path[i - 1] && candidate.a === path[i]));
    total += edge?.length ?? straightLine(map, path[i - 1], path[i]);
  }
  return total;
}
