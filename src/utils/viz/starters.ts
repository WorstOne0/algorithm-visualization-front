// Models
import { minimax } from "@/core/algorithms/gameai/minimax";
import { graphBfs } from "@/core/algorithms/graphs/graph_bfs";
import { gridSearch, makeGrid } from "@/core/algorithms/pathfinding/grid_search";
import { ri, rnd } from "@/core/algorithms/random";
import { binarySearch } from "@/core/algorithms/searching/binary_search";
import { SORTS } from "@/core/algorithms/sorting/sorts";
import { bstInsert } from "@/core/algorithms/trees/bst_insert";
import type { VizSpec } from "@/core/models";
// Utils
import { COLORS, fit, stepper } from "./canvas";
import { drawBars, drawGraph, drawGrid, drawMinimax, drawSearch, drawTree } from "./draw";

type Stop = () => void;

// Every starter takes the canvas and returns the function that stops it.
export function startViz(canvas: HTMLCanvasElement, spec: VizSpec): Stop {
  switch (spec.starter) {
    case "sort": {
      const { n = 24, algo = "insertion", ms = 60, gap = 2, radius = 1, indices = false } = spec;
      const make = () => (SORTS[algo] ?? SORTS.insertion)(Array.from({ length: n }, () => ri(8, 100)));
      return stepper(canvas, make, (ctx, w, h, s) => drawBars(ctx, w, h, s, { gap, radius, indices }), ms);
    }
    case "search": {
      const { n = 24, ms = 420, gap = 2 } = spec;
      return stepper(canvas, () => binarySearch(n), (ctx, w, h, s) => drawSearch(ctx, w, h, s, gap), ms, 1600);
    }
    case "path": {
      const { cols = 28, rows = 14, density = 0.26, ms = 70, algo = "bfs" } = spec;
      return stepper(canvas, () => gridSearch(makeGrid(cols, rows, density), algo), (ctx, w, h, s) => drawGrid(ctx, w, h, s), ms, 1800);
    }
    case "graph": {
      const { n = 16, ms = 520, r = 4 } = spec;
      const { w, h } = fit(canvas);
      return stepper(canvas, () => graphBfs(n, w, h), (ctx, w, h, s) => drawGraph(ctx, w, h, s, r), ms, 1600);
    }
    case "tree": {
      const { n = 12, ms = 380, r = 5 } = spec;
      return stepper(canvas, () => bstInsert(n), (ctx, w, h, s) => drawTree(ctx, w, h, s, r), ms, 1600);
    }
    case "minimax": {
      const { branch = 3, depth = 3, ms = 260, r = 4 } = spec;
      return stepper(canvas, () => minimax(branch, depth), (ctx, w, h, s) => drawMinimax(ctx, w, h, s, r, depth), ms, 1800);
    }
    case "city":
      return startCity(canvas, spec);
  }
}

type CityNet = { pts: { x: number; y: number }[]; edges: [number, number][]; adj: number[][]; w: number; h: number };
type CityWave = { seen: Set<number>; lit: Map<number, number>; frontier: number[] };

// Ambient street grid behind the home hero: a BFS wave keeps lighting streets from a random corner.
function startCity(canvas: HTMLCanvasElement, { cell = 26, speed = 90, alpha = 1 }: { cell?: number; speed?: number; alpha?: number }): Stop {
  let alive = true;
  let raf = 0;
  let net: CityNet | null = null;
  let wave: CityWave | null = null;
  let last = 0;

  const build = (w: number, h: number): CityNet => {
    const cols = Math.ceil(w / cell) + 1;
    const rows = Math.ceil(h / cell) + 1;
    const pts: { x: number; y: number }[] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pts.push({ x: c * cell + rnd(-2, 2), y: r * cell + rnd(-2, 2) });
    const id = (r: number, c: number) => r * cols + c;
    const edges: [number, number][] = [];
    const adj: number[][] = pts.map(() => []);
    const add = (a: number, b: number) => {
      edges.push([a, b]);
      adj[a].push(edges.length - 1);
      adj[b].push(edges.length - 1);
    };
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c + 1 < cols && Math.random() > 0.12) add(id(r, c), id(r, c + 1));
        if (r + 1 < rows && Math.random() > 0.12) add(id(r, c), id(r + 1, c));
      }
    }
    for (let k = 0; k < 3; k++) {
      let r = ri(0, rows);
      let c = 0;
      while (r + 1 < rows && c + 1 < cols) {
        add(id(r, c), id(r + 1, c + 1));
        r++;
        c++;
      }
    }
    return { pts, edges, adj, w, h };
  };

  const frame = (t: number) => {
    if (!alive) return;
    const { ctx, w, h } = fit(canvas);
    if (!net || net.w !== w || net.h !== h) {
      net = build(w, h);
      wave = null;
    }
    if (!wave) {
      const start = ri(0, net.pts.length);
      wave = { seen: new Set([start]), lit: new Map(), frontier: [start] };
    }
    if (t - last > speed) {
      last = t;
      const next: number[] = [];
      for (const u of wave.frontier) {
        for (const ei of net.adj[u]) {
          const [a, b] = net.edges[ei];
          const v = a === u ? b : a;
          if (wave.seen.has(v)) continue;
          wave.seen.add(v);
          next.push(v);
          wave.lit.set(ei, t);
        }
      }
      wave.frontier = next;
      if (!next.length) wave = null;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(147,197,253,.07)";
    ctx.beginPath();
    net.edges.forEach(([a, b]) => {
      ctx.moveTo(net!.pts[a].x, net!.pts[a].y);
      ctx.lineTo(net!.pts[b].x, net!.pts[b].y);
    });
    ctx.stroke();
    if (wave) {
      ctx.lineWidth = 1.4;
      wave.lit.forEach((t0, ei) => {
        const age = (t - t0) / 3200;
        if (age > 1) return;
        const [a, b] = net!.edges[ei];
        const fresh = age < 0.18;
        ctx.strokeStyle = fresh ? COLORS.violet : COLORS.primary;
        ctx.globalAlpha = alpha * (fresh ? 1 : (1 - age) * 0.75);
        ctx.shadowBlur = fresh ? 8 : 0;
        ctx.shadowColor = COLORS.violet;
        ctx.beginPath();
        ctx.moveTo(net!.pts[a].x, net!.pts[a].y);
        ctx.lineTo(net!.pts[b].x, net!.pts[b].y);
        ctx.stroke();
      });
      ctx.shadowBlur = 0;
      ctx.globalAlpha = alpha;
      wave.frontier.forEach((i) => {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(net!.pts[i].x, net!.pts[i].y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
  };
}
