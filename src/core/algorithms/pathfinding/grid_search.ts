export type Cell = [number, number];

// g: 1 is a wall. s and e are [row, col].
export type Grid = { g: number[][]; s: Cell; e: Cell };

export type PathAlgo = "bfs" | "dfs" | "greedy" | "astar" | "dijkstra";

// One snapshot: closed cells, the open set, the cell just popped, the path so far, and the code line that produced it.
export type GridState = { g: number[][]; s: Cell; e: Cell; visited: Set<number>; frontier: Set<number>; cur: number; path: number[]; line: number; gmap: Map<number, number> };

type OpenNode = { k: number; r: number; c: number; g: number; t: number };

const DIRS: Cell[] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

export function makeGrid(cols: number, rows: number, density: number, rand: () => number = Math.random): Grid {
  const g = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rand() < density ? 1 : 0)));
  const s: Cell = [Math.floor(rand() * rows), 1];
  const e: Cell = [Math.floor(rand() * rows), cols - 2];
  g[s[0]][s[1]] = 0;
  g[e[0]][e[1]] = 0;
  g[s[0]][0] = 0;
  g[e[0]][cols - 1] = 0;
  return { g, s, e };
}

// Generic best-first over a grid; the strategy only picks which open node comes out next.
export function* gridSearch(grid: Grid, algo: PathAlgo = "bfs"): Generator<GridState, void, void> {
  const { g, s, e } = grid;
  const rows = g.length;
  const cols = g[0].length;
  const key = (r: number, c: number) => r * cols + c;
  const goalKey = key(e[0], e[1]);
  const h = (r: number, c: number) => Math.abs(r - e[0]) + Math.abs(c - e[1]);
  const gs = new Map<number, number>([[key(s[0], s[1]), 0]]);
  const prev = new Map<number, number>();
  const closed = new Set<number>();
  const open: OpenNode[] = [{ k: key(s[0], s[1]), r: s[0], c: s[1], g: 0, t: 0 }];
  let tick = 0;

  const snapshot = (cur: OpenNode | null, path: number[], line: number): GridState => ({ g, s, e, visited: new Set(closed), frontier: new Set(open.map((o) => o.k)), cur: cur ? cur.k : -1, path, line, gmap: new Map(gs) });

  yield snapshot(null, [], 2);
  let found = false;
  while (open.length && !found) {
    let idx = 0;
    if (algo === "dfs") idx = open.length - 1;
    else if (algo === "greedy") {
      let best = Infinity;
      open.forEach((o, i) => {
        const v = h(o.r, o.c);
        if (v < best) {
          best = v;
          idx = i;
        }
      });
    } else if (algo === "astar" || algo === "dijkstra") {
      let best = Infinity;
      open.forEach((o, i) => {
        const v = algo === "astar" ? o.g + h(o.r, o.c) : o.g;
        // Ties go to the newest node so the search keeps its direction instead of fanning out.
        if (v < best || (v === best && o.t > open[idx].t)) {
          best = v;
          idx = i;
        }
      });
    }
    const cur = open.splice(idx, 1)[0];
    if (closed.has(cur.k)) continue;
    closed.add(cur.k);
    yield snapshot(cur, [], 5);
    if (cur.k === goalKey) {
      found = true;
      yield snapshot(cur, [], 6);
      break;
    }
    for (const [dr, dc] of DIRS) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || g[nr][nc]) continue;
      const nk = key(nr, nc);
      if (closed.has(nk)) continue;
      const ng = cur.g + 1;
      if (ng >= (gs.get(nk) ?? Infinity)) continue;
      gs.set(nk, ng);
      prev.set(nk, cur.k);
      open.push({ k: nk, r: nr, c: nc, g: ng, t: tick++ });
      if (algo !== "bfs" && algo !== "dfs") yield snapshot(cur, [], 11);
    }
    if (algo === "bfs" || algo === "dfs") yield snapshot(cur, [], 11);
  }
  if (!found) return;

  const path: number[] = [];
  let k: number | undefined = goalKey;
  while (k !== undefined) {
    path.push(k);
    k = prev.get(k);
  }
  path.reverse();
  for (let i = 1; i <= path.length; i++) yield snapshot(null, path.slice(0, i), 6);
}
