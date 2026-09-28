// Models
import type { MinimaxState } from "@/core/algorithms/gameai/minimax";
import type { GameTreeStep } from "@/core/algorithms/gameai/record_game_tree";
import type { GraphState } from "@/core/algorithms/graphs/graph_bfs";
import type { GridState } from "@/core/algorithms/pathfinding/grid_search";
import type { SearchState } from "@/core/algorithms/searching/binary_search";
import type { SortState } from "@/core/algorithms/sorting/sorts";
import type { TreeState } from "@/core/algorithms/trees/bst_insert";
// Utils
import { COLORS, monoFont, type Ctx } from "./canvas";

export type BarsOptions = { gap?: number; radius?: number; indices?: boolean; values?: boolean };

// `range` dims the bars outside the current call; `held` draws a value lifted out of the array above its gap.
export type BarsView = SortState & { range?: [number, number]; held?: { index: number; value: number } };

export function drawBars(ctx: Ctx, w: number, h: number, s: BarsView, { gap = 2, radius = 1, indices = false, values = false }: BarsOptions = {}) {
  const n = s.a.length;
  const pad = indices ? 16 : 0;
  const top = values ? 14 : 0;
  const bw = (w - gap * (n - 1)) / n;
  const barHeight = (v: number) => Math.max(2, ((h - pad - top - 2) * v) / 100);
  s.a.forEach((v, k) => {
    const bh = barHeight(v);
    const x = k * (bw + gap);
    const y = h - pad - bh;
    const isHole = s.held !== undefined && k === s.held.index;
    const isOutside = s.range !== undefined && (k < s.range[0] || k > s.range[1]) && !s.done.has(k);
    ctx.fillStyle = s.done.has(k) ? COLORS.green : k === s.i || k === s.j ? (s.swap ? COLORS.swap : COLORS.primary) : k === s.pivot ? COLORS.violet : COLORS.def;
    if (k === s.pivot && (k === s.i || k === s.j)) ctx.fillStyle = COLORS.violet;
    ctx.globalAlpha = isHole ? 0.25 : isOutside ? 0.4 : 1;
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, radius);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = monoFont(9);
    ctx.textAlign = "center";
    if (indices && bw > 14) {
      ctx.fillStyle = COLORS.text;
      ctx.fillText(String(k), x + bw / 2, h - 3);
    }
    if (values && bw > 18 && !isHole) {
      ctx.fillStyle = COLORS.text;
      ctx.fillText(String(v), x + bw / 2, y - 3);
    }
  });
  if (!s.held) return;
  const bh = barHeight(s.held.value);
  const x = s.held.index * (bw + gap);
  const y = h - pad - bh - 10;
  ctx.fillStyle = COLORS.violet;
  ctx.beginPath();
  ctx.roundRect(x, y, bw, bh, radius);
  ctx.fill();
  if (values && bw > 18) {
    ctx.fillStyle = COLORS.text;
    ctx.fillText(String(s.held.value), x + bw / 2, y - 3);
  }
}

export type SearchOptions = { gap?: number; indices?: boolean; values?: boolean };

export function drawSearch(ctx: Ctx, w: number, h: number, s: SearchState, { gap = 2, indices = false, values = false }: SearchOptions = {}) {
  const n = s.a.length;
  const pad = indices ? 16 : 0;
  const top = values ? 14 : 0;
  const bw = (w - gap * (n - 1)) / n;
  s.a.forEach((v, k) => {
    const bh = Math.max(2, ((h - pad - top - 4) * v) / 100);
    const x = k * (bw + gap);
    const y = h - pad - bh;
    const inRange = k >= s.lo && k <= s.hi;
    const isMarked = k === s.mid || k === s.target;
    ctx.fillStyle = s.found && k === s.mid ? COLORS.green : k === s.mid ? COLORS.primary : k === s.target ? COLORS.violet : inRange ? COLORS.def : COLORS.vis;
    ctx.globalAlpha = inRange || isMarked ? 1 : 0.45;
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, indices ? 2 : 1);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = monoFont(9);
    ctx.textAlign = "center";
    if (indices && bw > 14) {
      ctx.fillStyle = isMarked ? COLORS.act : COLORS.text;
      ctx.fillText(String(k), x + bw / 2, h - 3);
    }
    if (values && bw > 18) {
      ctx.fillStyle = COLORS.text;
      ctx.globalAlpha = inRange || isMarked ? 1 : 0.45;
      ctx.fillText(String(v), x + bw / 2, y - 3);
      ctx.globalAlpha = 1;
    }
  });
}

// The game tree: MAX and MIN levels labelled on the left, leaf scores under the leaves, resolved values above the nodes.
export function drawGameTree(ctx: Ctx, w: number, h: number, s: GameTreeStep) {
  const { depth, leafCount } = s.tree;
  const r = Math.max(3.5, Math.min(11, (w - 70) / leafCount / 2.8));
  const px = (node: { x: number }) => 48 + node.x * (w - 70);
  const py = (node: { d: number }) => 26 + node.d * ((h - 62) / Math.max(1, depth));
  ctx.font = monoFont(9);
  ctx.textAlign = "left";
  for (let d = 0; d <= depth; d++) {
    ctx.fillStyle = COLORS.text;
    ctx.fillText(d % 2 === 0 ? "MAX" : "MIN", 6, py({ d }) + 3);
  }
  ctx.lineWidth = 1.1;
  s.tree.nodes.forEach((node) =>
    node.kids.forEach((kid) => {
      ctx.strokeStyle = s.pruned.has(kid.id) ? "rgba(58,67,99,.35)" : s.best.has(kid.id) && s.best.has(node.id) ? COLORS.violet : s.visited.has(kid.id) ? COLORS.primary : COLORS.edge;
      ctx.lineWidth = s.best.has(kid.id) && s.best.has(node.id) ? 2 : 1.1;
      ctx.beginPath();
      ctx.moveTo(px(node), py(node));
      ctx.lineTo(px(kid), py(kid));
      ctx.stroke();
    })
  );
  ctx.textAlign = "center";
  s.tree.nodes.forEach((node) => {
    const isCurrent = node.id === s.cur;
    const isPruned = s.pruned.has(node.id);
    ctx.fillStyle = isPruned ? "rgba(58,67,99,.5)" : isCurrent ? COLORS.act : s.best.has(node.id) ? COLORS.violet : s.visited.has(node.id) ? COLORS.green : COLORS.def;
    ctx.beginPath();
    ctx.arc(px(node), py(node), isCurrent ? r + 2 : r, 0, Math.PI * 2);
    ctx.fill();
    const value = node.leaf !== null ? node.leaf : s.values.get(node.id);
    if (value === undefined || r < 4.5) return;
    ctx.font = monoFont(Math.max(8, Math.min(11, r)));
    ctx.fillStyle = isPruned ? "rgba(140,147,168,.4)" : isCurrent ? COLORS.act : COLORS.text;
    ctx.fillText(String(value), px(node), node.leaf !== null ? py(node) + r + 10 : py(node) - r - 4);
  });
}

export function drawGrid(ctx: Ctx, w: number, h: number, s: GridState, { showCosts = false }: { showCosts?: boolean } = {}) {
  const rows = s.g.length;
  const cols = s.g[0].length;
  const cw = w / cols;
  const ch = h / rows;
  const path = new Set(s.path);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = r * cols + c;
      const isWall = s.g[r][c] === 1;
      let color = isWall ? COLORS.wall : COLORS.open;
      if (s.visited.has(k)) color = COLORS.vis;
      if (s.frontier.has(k)) color = COLORS.primary;
      if (k === s.cur) color = COLORS.act;
      if (path.has(k)) color = COLORS.violet;
      if ((r === s.s[0] && c === s.s[1]) || (r === s.e[0] && c === s.e[1])) color = COLORS.green;
      ctx.fillStyle = color;
      ctx.fillRect(c * cw + 0.5, r * ch + 0.5, cw - 1, ch - 1);
      if (!isWall && s.cost[r][c] > 1) {
        ctx.fillStyle = COLORS.amber;
        ctx.globalAlpha = path.has(k) || s.frontier.has(k) || k === s.cur ? 0.35 : 0.22;
        ctx.fillRect(c * cw + 0.5, r * ch + 0.5, cw - 1, ch - 1);
        ctx.globalAlpha = 1;
      }
      if (!showCosts || cw <= 22 || !s.gmap.has(k) || isWall) continue;
      ctx.fillStyle = path.has(k) || s.frontier.has(k) ? "#fff" : COLORS.text;
      ctx.font = monoFont(8);
      ctx.textAlign = "center";
      ctx.fillText(String(s.gmap.get(k)), c * cw + cw / 2, r * ch + ch / 2 + 3);
    }
  }
}

export function drawGraph(ctx: Ctx, w: number, h: number, s: GraphState, r: number) {
  ctx.lineWidth = 1.2;
  s.edges.forEach(([a, b]) => {
    ctx.strokeStyle = s.lit.has(a + "-" + b) ? COLORS.primary : COLORS.edge;
    ctx.beginPath();
    ctx.moveTo(s.nodes[a].x * w, s.nodes[a].y * h);
    ctx.lineTo(s.nodes[b].x * w, s.nodes[b].y * h);
    ctx.stroke();
  });
  s.nodes.forEach((p, i) => {
    ctx.fillStyle = s.cur.has(i) ? COLORS.violet : s.seen.has(i) ? COLORS.green : COLORS.def;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, s.cur.has(i) ? r + 1.5 : r, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawTree(ctx: Ctx, w: number, h: number, s: TreeState, r: number) {
  const cw = w / (s.count + 1);
  const depth = Math.max(4, ...s.nodes.map((t) => t.d ?? 0)) + 1;
  const rh = (h - 2 * r - 6) / depth;
  const px = (t: { x?: number }) => ((t.x ?? 0) + 1) * cw;
  const py = (t: { d?: number }) => r + 4 + (t.d ?? 0) * rh;
  ctx.strokeStyle = COLORS.edge;
  ctx.lineWidth = 1.2;
  s.nodes.forEach((t) =>
    [t.l, t.r].forEach((c) => {
      if (!c || c.x === undefined) return;
      ctx.beginPath();
      ctx.moveTo(px(t), py(t));
      ctx.lineTo(px(c), py(c));
      ctx.stroke();
    })
  );
  s.nodes.forEach((t) => {
    if (t.x === undefined) return;
    ctx.fillStyle = t === s.fresh ? COLORS.violet : s.hot.has(t) ? COLORS.primary : COLORS.green;
    ctx.beginPath();
    ctx.arc(px(t), py(t), r, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawMinimax(ctx: Ctx, w: number, h: number, s: MinimaxState, r: number, depth: number) {
  const py = (n: { d: number }) => r + 4 + n.d * ((h - 2 * r - 8) / depth);
  const px = (n: { x: number }) => 6 + n.x * (w - 12);
  ctx.lineWidth = 1.1;
  s.nodes.forEach((n) =>
    n.kids.forEach((k) => {
      ctx.strokeStyle = s.pruned.has(k.id) ? "rgba(58,67,99,.35)" : s.best.has(k.id) && s.best.has(n.id) ? COLORS.violet : s.visited.has(k.id) ? COLORS.primary : COLORS.edge;
      ctx.beginPath();
      ctx.moveTo(px(n), py(n));
      ctx.lineTo(px(k), py(k));
      ctx.stroke();
    })
  );
  s.nodes.forEach((n) => {
    const isCurrent = s.cur !== null && s.cur.id === n.id;
    ctx.fillStyle = s.pruned.has(n.id) ? "rgba(58,67,99,.5)" : isCurrent ? COLORS.act : s.best.has(n.id) ? COLORS.violet : s.visited.has(n.id) ? COLORS.green : COLORS.def;
    ctx.beginPath();
    ctx.arc(px(n), py(n), isCurrent ? r + 1.5 : r, 0, Math.PI * 2);
    ctx.fill();
  });
}
