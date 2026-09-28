// Models
import { minimax, type MinimaxState } from "@/core/algorithms/gameai/minimax";
import { ri, rnd } from "@/core/algorithms/random";
import { SORTS, type SortGenerator, type SortId, type SortState } from "@/core/algorithms/sorting/sorts";
import { bstInsert, type TreeState } from "@/core/algorithms/trees/bst_insert";
import type { FamilyId } from "@/core/models";
// Utils
import { COLORS, fit, type Ctx } from "./canvas";

// The ambient band behind the home hero and the category header: one slow, faint scene per family.

type Stop = () => void;
type Scene = { paint: (ctx: Ctx, w: number, h: number, t: number) => void };
type SceneMaker = (w: number, h: number, base: number) => Scene;

const FAINT = "rgba(147,197,253,.07)";
const DIM = "rgba(147,197,253,.16)";

// One cycle's opacity: ramps in over 600 ms from `start`, holds, ramps out over 700 ms after `end` (0 while running).
const envelope = (t: number, start: number, end: number) => Math.min(1, Math.max(0, (t - start) / 600)) * (end ? Math.min(1, Math.max(0, 1 - (t - end) / 700)) : 1);

const glow = (ctx: Ctx, color: string, blur: number) => {
  ctx.shadowBlur = blur;
  ctx.shadowColor = color;
};

const noGlow = (ctx: Ctx) => {
  ctx.shadowBlur = 0;
};

const dot = (ctx: Ctx, x: number, y: number, r: number, color: string) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

// Sorting: a wall of bars the width of the screen, sorted by a different algorithm each cycle.
const sortingScene: SceneMaker = (w, h, base) => {
  const n = Math.max(40, Math.floor(w / 9));
  const gap = 3;
  const bw = (w - gap * (n - 1)) / n;
  let gen: SortGenerator;
  let state: SortState;
  let start = 0;
  let end = 0;
  let last = 0;
  const begin = (t: number) => {
    const algo = (["shell", "merge", "quick", "heap"] as SortId[])[ri(0, 4)];
    gen = SORTS[algo](Array.from({ length: n }, () => ri(8, 100)));
    state = gen.next().value as SortState;
    start = t;
    end = 0;
    last = t;
  };
  return {
    paint(ctx, w, h, t) {
      if (!start) begin(t);
      if (!end && t - last > 16) {
        last = t;
        for (let k = 0; k < 6; k++) {
          const next = gen.next();
          if (next.done) {
            end = t + 1500;
            break;
          }
          state = next.value;
        }
      }
      if (end && t > end + 700) begin(t);
      const env = envelope(t, start, end);
      state.a.forEach((v, k) => {
        const bh = (h * 0.55 * v) / 100;
        const x = k * (bw + gap);
        const isActive = k === state.i || k === state.j;
        const isDone = state.done.has(k);
        ctx.fillStyle = isActive ? (state.swap ? COLORS.swap : COLORS.primary) : isDone ? COLORS.green : k === state.pivot ? COLORS.violet : DIM;
        ctx.globalAlpha = base * env * (isActive ? 1 : isDone ? 0.5 : 0.35);
        if (isActive) glow(ctx, ctx.fillStyle, 12);
        else noGlow(ctx);
        ctx.fillRect(x, h - bh, bw, bh);
      });
    },
  };
};

// Searching: a sorted staircase; the live range brightens and halves until the probe lands on the target.
const searchingScene: SceneMaker = (w, h, base) => {
  const n = Math.max(30, Math.floor(w / 12));
  const gap = 4;
  const bw = (w - gap * (n - 1)) / n;
  const values = Array.from({ length: n }, (_, k) => 10 + (k * 88) / n + rnd(0, 2));
  let lo = 0;
  let hi = n - 1;
  let mid = -1;
  let target = 0;
  let found = false;
  let start = 0;
  let end = 0;
  let last = 0;
  const begin = (t: number) => {
    lo = 0;
    hi = n - 1;
    mid = -1;
    target = ri(0, n);
    found = false;
    start = t;
    end = 0;
    last = t;
  };
  return {
    paint(ctx, w, h, t) {
      if (!start) begin(t);
      if (!end && t - last > 420) {
        last = t;
        if (found) end = t + 1200;
        else if (lo > hi) end = t;
        else {
          mid = (lo + hi) >> 1;
          if (mid === target) found = true;
          else if (mid < target) lo = mid + 1;
          else hi = mid - 1;
        }
      }
      if (end && t > end + 700) begin(t);
      const env = envelope(t, start, end);
      values.forEach((v, k) => {
        const bh = (h * 0.5 * v) / 100;
        const x = k * (bw + gap);
        const isMid = k === mid;
        const isTarget = k === target;
        const inRange = k >= lo && k <= hi;
        ctx.fillStyle = found && isMid ? COLORS.green : isMid ? COLORS.primary : isTarget ? COLORS.violet : DIM;
        ctx.globalAlpha = base * env * (isMid || isTarget ? 1 : inRange ? 0.5 : 0.15);
        if (isMid || isTarget) glow(ctx, ctx.fillStyle, 14);
        else noGlow(ctx);
        ctx.fillRect(x, h - bh, bw, bh);
      });
      noGlow(ctx);
      ctx.lineWidth = 1;
      const column = (k: number) => k * (bw + gap) + bw / 2;
      if (mid >= 0) {
        ctx.globalAlpha = base * env * 0.5;
        ctx.strokeStyle = found ? COLORS.green : COLORS.primary;
        ctx.beginPath();
        ctx.moveTo(column(mid), 0);
        ctx.lineTo(column(mid), h);
        ctx.stroke();
      }
      ctx.globalAlpha = base * env * 0.3;
      ctx.strokeStyle = COLORS.violet;
      ctx.beginPath();
      ctx.moveTo(column(lo) - bw / 2 - gap / 2, h * 0.3);
      ctx.lineTo(column(lo) - bw / 2 - gap / 2, h);
      ctx.moveTo(column(hi) + bw / 2 + gap / 2, h * 0.3);
      ctx.lineTo(column(hi) + bw / 2 + gap / 2, h);
      ctx.stroke();
    },
  };
};

type Net = { pts: { x: number; y: number }[]; edges: [number, number][]; adj: number[][]; cost: number[] };

// A street grid with a few parks and three diagonal avenues; edges carry their length as cost.
function buildNet(w: number, h: number): Net {
  const cell = 30;
  const cols = Math.ceil(w / cell) + 1;
  const rows = Math.ceil(h / cell) + 1;
  const pts: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pts.push({ x: c * cell + rnd(-2, 2), y: r * cell + rnd(-2, 2) });
  const id = (r: number, c: number) => r * cols + c;
  const parks = Array.from({ length: 3 }, () => {
    const r0 = ri(1, Math.max(2, rows - 5));
    const c0 = ri(2, Math.max(3, cols - 8));
    return { r0, r1: r0 + ri(2, 5), c0, c1: c0 + ri(3, 7) };
  });
  const inPark = (r: number, c: number) => parks.some((p) => r > p.r0 && r < p.r1 && c > p.c0 && c < p.c1);
  const edges: [number, number][] = [];
  const cost: number[] = [];
  const adj: number[][] = pts.map(() => []);
  const add = (a: number, b: number) => {
    edges.push([a, b]);
    cost.push(Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y));
    adj[a].push(edges.length - 1);
    adj[b].push(edges.length - 1);
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (inPark(r, c)) continue;
      if (c + 1 < cols && !inPark(r, c + 1) && Math.random() > 0.1) add(id(r, c), id(r, c + 1));
      if (r + 1 < rows && !inPark(r + 1, c) && Math.random() > 0.1) add(id(r, c), id(r + 1, c));
    }
  }
  for (let k = 0; k < 3; k++) {
    let r = ri(0, rows);
    let c = ri(0, Math.max(1, cols >> 1));
    while (r + 1 < rows && c + 1 < cols) {
      if (!inPark(r, c) && !inPark(r + 1, c + 1)) add(id(r, c), id(r + 1, c + 1));
      r++;
      c++;
    }
  }
  return { pts, edges, adj, cost };
}

// Pathfinding: A* between two far points of the street grid; explored streets glow, the path lands in violet.
const pathfindingScene: SceneMaker = (w, h, base) => {
  const net = buildNet(w, h);
  const count = net.pts.length;
  let src = 0;
  let dst = 0;
  let gScore = new Float64Array(0);
  let parentEdge = new Int32Array(0);
  let closed = new Uint8Array(0);
  let open: number[] = [];
  let lit: { e: number; t: number }[] = [];
  let path: number[] = [];
  let pathShown = 0;
  let pathAt = 0;
  let phase: "search" | "path" | "hold" = "search";
  let start = 0;
  let end = 0;
  let last = 0;
  const heuristic = (i: number) => Math.hypot(net.pts[i].x - net.pts[dst].x, net.pts[i].y - net.pts[dst].y);
  const begin = (t: number) => {
    for (let tries = 0; tries < 50; tries++) {
      src = ri(0, count);
      dst = ri(0, count);
      if (net.adj[src].length && net.adj[dst].length && Math.hypot(net.pts[src].x - net.pts[dst].x, net.pts[src].y - net.pts[dst].y) > w * 0.45) break;
    }
    gScore = new Float64Array(count).fill(Infinity);
    gScore[src] = 0;
    parentEdge = new Int32Array(count).fill(-1);
    closed = new Uint8Array(count);
    open = [src];
    lit = [];
    path = [];
    pathShown = 0;
    phase = "search";
    start = t;
    end = 0;
    last = t;
  };
  const expand = (t: number) => {
    let bestIndex = -1;
    let bestF = Infinity;
    for (let i = 0; i < open.length; i++) {
      const f = gScore[open[i]] + heuristic(open[i]);
      if (f < bestF) {
        bestF = f;
        bestIndex = i;
      }
    }
    if (bestIndex < 0) {
      phase = "hold";
      end = t;
      return;
    }
    const u = open.splice(bestIndex, 1)[0];
    if (closed[u]) return;
    closed[u] = 1;
    if (u === dst) {
      let v = dst;
      while (v !== src) {
        const e = parentEdge[v];
        path.push(e);
        const [a, b] = net.edges[e];
        v = a === v ? b : a;
      }
      path.reverse();
      phase = "path";
      pathAt = t;
      return;
    }
    for (const e of net.adj[u]) {
      const [a, b] = net.edges[e];
      const v = a === u ? b : a;
      if (closed[v]) continue;
      const ng = gScore[u] + net.cost[e];
      if (ng >= gScore[v]) continue;
      gScore[v] = ng;
      parentEdge[v] = e;
      open.push(v);
      lit.push({ e, t });
    }
  };
  const strokeEdge = (ctx: Ctx, e: number) => {
    const [a, b] = net.edges[e];
    ctx.moveTo(net.pts[a].x, net.pts[a].y);
    ctx.lineTo(net.pts[b].x, net.pts[b].y);
  };
  return {
    paint(ctx, w, h, t) {
      if (!start) begin(t);
      if (phase === "search" && t - last > 34) {
        last = t;
        for (let k = 0; k < 3 && phase === "search"; k++) expand(t);
      }
      if (phase === "path") {
        pathShown = Math.min(path.length, Math.floor((t - pathAt) / 30));
        if (pathShown === path.length) {
          phase = "hold";
          end = t + 2400;
        }
      }
      if (end && t > end + 700) begin(t);
      const env = envelope(t, start, end);

      noGlow(ctx);
      ctx.globalAlpha = base;
      ctx.lineWidth = 1;
      ctx.strokeStyle = FAINT;
      ctx.beginPath();
      for (let e = 0; e < net.edges.length; e++) strokeEdge(ctx, e);
      ctx.stroke();

      ctx.lineWidth = 1.4;
      ctx.strokeStyle = COLORS.primary;
      ctx.globalAlpha = base * env * 0.2;
      ctx.beginPath();
      for (const item of lit) if (t - item.t >= 2600) strokeEdge(ctx, item.e);
      ctx.stroke();
      for (const item of lit) {
        const age = (t - item.t) / 2600;
        if (age >= 1) continue;
        const isFresh = age < 0.15;
        ctx.strokeStyle = isFresh ? COLORS.violet : COLORS.primary;
        ctx.globalAlpha = base * env * (isFresh ? 1 : Math.max(0.27, 1 - age) * 0.75);
        if (isFresh) glow(ctx, COLORS.violet, 8);
        else noGlow(ctx);
        ctx.beginPath();
        strokeEdge(ctx, item.e);
        ctx.stroke();
      }

      if (pathShown) {
        ctx.strokeStyle = COLORS.violet;
        ctx.lineWidth = 2.2;
        ctx.globalAlpha = base * env;
        glow(ctx, COLORS.violet, 12);
        ctx.beginPath();
        for (let i = 0; i < pathShown; i++) strokeEdge(ctx, path[i]);
        ctx.stroke();
      }

      if (phase === "search") {
        noGlow(ctx);
        ctx.globalAlpha = base * env;
        for (const i of open) dot(ctx, net.pts[i].x, net.pts[i].y, 1.5, "#fff");
      }
      ctx.globalAlpha = base * env;
      glow(ctx, COLORS.green, 14);
      dot(ctx, net.pts[src].x, net.pts[src].y, 3.2, COLORS.green);
      glow(ctx, COLORS.violet, 14);
      dot(ctx, net.pts[dst].x, net.pts[dst].y, 3.2, COLORS.violet);
    },
  };
};

// Graphs: drifting nodes joined to their nearest neighbours; a breadth-first wave lights the edges level by level.
const graphsScene: SceneMaker = (w, h, base) => {
  const n = Math.max(24, Math.round((w * h) / 26000));
  const nodes = Array.from({ length: n }, () => ({ x: rnd(0.04, 0.96) * w, y: rnd(0.08, 0.92) * h, vx: rnd(-0.06, 0.06), vy: rnd(-0.06, 0.06) }));
  const edges: [number, number][] = [];
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 3)
      .forEach((o) => {
        if (!edges.some((e) => (e[0] === i && e[1] === o.j) || (e[0] === o.j && e[1] === i))) edges.push([i, o.j]);
      });
  });
  const adj: number[][] = nodes.map(() => []);
  edges.forEach(([a, b]) => {
    adj[a].push(b);
    adj[b].push(a);
  });
  let seen = new Set<number>();
  let frontier: number[] = [];
  let lit = new Set<string>();
  let start = 0;
  let end = 0;
  let last = 0;
  const begin = (t: number) => {
    const s = ri(0, n);
    seen = new Set([s]);
    frontier = [s];
    lit = new Set();
    start = t;
    end = 0;
    last = t;
  };
  return {
    paint(ctx, w, h, t) {
      if (!start) begin(t);
      nodes.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 10 || p.x > w - 10) p.vx *= -1;
        if (p.y < 10 || p.y > h - 10) p.vy *= -1;
      });
      if (!end && t - last > 520) {
        last = t;
        const next: number[] = [];
        for (const u of frontier) {
          for (const v of adj[u]) {
            if (seen.has(v)) continue;
            seen.add(v);
            next.push(v);
            lit.add(u + "-" + v);
            lit.add(v + "-" + u);
          }
        }
        frontier = next;
        if (!next.length) end = t + 1600;
      }
      if (end && t > end + 700) begin(t);
      const env = envelope(t, start, end);

      noGlow(ctx);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = DIM;
      ctx.globalAlpha = base * 0.6;
      ctx.beginPath();
      edges.forEach(([a, b]) => {
        if (lit.has(a + "-" + b)) return;
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
      });
      ctx.stroke();
      ctx.strokeStyle = COLORS.primary;
      ctx.globalAlpha = base * env * 0.9;
      glow(ctx, COLORS.primary, 6);
      ctx.beginPath();
      edges.forEach(([a, b]) => {
        if (!lit.has(a + "-" + b)) return;
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
      });
      ctx.stroke();

      const frontierSet = new Set(frontier);
      nodes.forEach((p, i) => {
        if (frontierSet.has(i)) {
          ctx.globalAlpha = base * env;
          glow(ctx, COLORS.violet, 10);
          dot(ctx, p.x, p.y, 4, COLORS.violet);
          return;
        }
        noGlow(ctx);
        if (seen.has(i)) {
          ctx.globalAlpha = base * env * 0.8;
          dot(ctx, p.x, p.y, 3, COLORS.green);
          return;
        }
        ctx.globalAlpha = base;
        dot(ctx, p.x, p.y, 2.5, DIM);
      });
    },
  };
};

// Trees: a binary search tree growing from the top; each key walks down from the root before it settles.
const treesScene: SceneMaker = (w, h, base) => {
  let gen: Generator<TreeState, void, void>;
  let state: TreeState;
  let start = 0;
  let end = 0;
  let last = 0;
  const begin = (t: number) => {
    gen = bstInsert(Math.max(24, Math.round(w / 40)));
    state = gen.next().value as TreeState;
    start = t;
    end = 0;
    last = t;
  };
  return {
    paint(ctx, w, h, t) {
      if (!start) begin(t);
      if (!end && t - last > 220) {
        last = t;
        const next = gen.next();
        if (next.done) end = t + 1800;
        else state = next.value;
      }
      if (end && t > end + 700) begin(t);
      const env = envelope(t, start, end);
      const depth = Math.max(6, ...state.nodes.map((node) => node.d ?? 0)) + 1;
      const cw = w / (state.count + 1);
      const rh = (h - 90) / depth;
      const px = (node: { x?: number }) => ((node.x ?? 0) + 1) * cw;
      const py = (node: { d?: number }) => 36 + (node.d ?? 0) * rh;

      noGlow(ctx);
      ctx.lineWidth = 1;
      ctx.strokeStyle = DIM;
      ctx.globalAlpha = base * env * 0.7;
      ctx.beginPath();
      state.nodes.forEach((node) =>
        [node.l, node.r].forEach((child) => {
          if (!child || child.x === undefined || node.x === undefined) return;
          ctx.moveTo(px(node), py(node));
          ctx.lineTo(px(child), py(child));
        })
      );
      ctx.stroke();
      state.nodes.forEach((node) => {
        if (node.x === undefined) return;
        if (node === state.fresh) {
          ctx.globalAlpha = base * env;
          glow(ctx, COLORS.violet, 14);
          dot(ctx, px(node), py(node), 5, COLORS.violet);
          return;
        }
        if (state.hot.has(node)) {
          ctx.globalAlpha = base * env;
          glow(ctx, COLORS.primary, 8);
          dot(ctx, px(node), py(node), 4, COLORS.primary);
          return;
        }
        noGlow(ctx);
        ctx.globalAlpha = base * env * 0.55;
        dot(ctx, px(node), py(node), 4, COLORS.green);
      });
    },
  };
};

// Game AI: a wide game tree searched with alpha-beta; explored branches light up, pruned ones stay dim.
const gameaiScene: SceneMaker = (w, h, base) => {
  const depth = 5;
  let gen: Generator<MinimaxState, void, void>;
  let state: MinimaxState;
  let start = 0;
  let end = 0;
  let last = 0;
  const begin = (t: number) => {
    gen = minimax(3, depth);
    state = gen.next().value as MinimaxState;
    start = t;
    end = 0;
    last = t;
  };
  return {
    paint(ctx, w, h, t) {
      if (!start) begin(t);
      if (!end && t - last > 110) {
        last = t;
        const next = gen.next();
        if (next.done) end = t + 2000;
        else state = next.value;
      }
      if (end && t > end + 700) begin(t);
      const env = envelope(t, start, end);
      const px = (node: { x: number }) => 20 + node.x * (w - 40);
      const py = (node: { d: number }) => 30 + node.d * ((h - 70) / depth);

      noGlow(ctx);
      ctx.lineWidth = 1;
      ctx.strokeStyle = DIM;
      ctx.globalAlpha = base * env * 0.45;
      ctx.beginPath();
      state.nodes.forEach((node) =>
        node.kids.forEach((kid) => {
          if (state.visited.has(kid.id)) return;
          ctx.moveTo(px(node), py(node));
          ctx.lineTo(px(kid), py(kid));
        })
      );
      ctx.stroke();
      ctx.strokeStyle = COLORS.primary;
      ctx.globalAlpha = base * env * 0.8;
      ctx.beginPath();
      state.nodes.forEach((node) =>
        node.kids.forEach((kid) => {
          if (!state.visited.has(kid.id) || (state.best.has(kid.id) && state.best.has(node.id))) return;
          ctx.moveTo(px(node), py(node));
          ctx.lineTo(px(kid), py(kid));
        })
      );
      ctx.stroke();
      ctx.strokeStyle = COLORS.violet;
      ctx.lineWidth = 2;
      ctx.globalAlpha = base * env;
      glow(ctx, COLORS.violet, 10);
      ctx.beginPath();
      state.nodes.forEach((node) =>
        node.kids.forEach((kid) => {
          if (!state.best.has(kid.id) || !state.best.has(node.id)) return;
          ctx.moveTo(px(node), py(node));
          ctx.lineTo(px(kid), py(kid));
        })
      );
      ctx.stroke();

      state.nodes.forEach((node) => {
        const r = node.d === depth ? 1.8 : 3;
        const isCurrent = state.cur !== null && state.cur.id === node.id;
        if (isCurrent) {
          ctx.globalAlpha = base * env;
          glow(ctx, "#fff", 12);
          dot(ctx, px(node), py(node), r + 1.5, "#fff");
          return;
        }
        if (state.best.has(node.id)) {
          ctx.globalAlpha = base * env;
          glow(ctx, COLORS.violet, 10);
          dot(ctx, px(node), py(node), r + 0.5, COLORS.violet);
          return;
        }
        noGlow(ctx);
        if (state.pruned.has(node.id)) {
          ctx.globalAlpha = base * env * 0.15;
          dot(ctx, px(node), py(node), r, DIM);
          return;
        }
        if (state.visited.has(node.id)) {
          ctx.globalAlpha = base * env * 0.8;
          dot(ctx, px(node), py(node), r, COLORS.green);
          return;
        }
        ctx.globalAlpha = base * env * 0.6;
        dot(ctx, px(node), py(node), r, DIM);
      });
    },
  };
};

const SCENES: Record<FamilyId, SceneMaker> = { sorting: sortingScene, searching: searchingScene, pathfinding: pathfindingScene, graphs: graphsScene, trees: treesScene, gameai: gameaiScene };

export function startAmbient(canvas: HTMLCanvasElement, family: FamilyId, alpha = 0.7): Stop {
  let alive = true;
  let raf = 0;
  let scene: Scene | null = null;
  let size = "";
  const frame = (t: number) => {
    if (!alive) return;
    const { ctx, w, h } = fit(canvas);
    const key = `${w}x${h}`;
    if (!scene || size !== key) {
      size = key;
      scene = SCENES[family](w, h, alpha);
    }
    ctx.clearRect(0, 0, w, h);
    scene.paint(ctx, w, h, t);
    ctx.globalAlpha = 1;
    noGlow(ctx);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
  };
}
