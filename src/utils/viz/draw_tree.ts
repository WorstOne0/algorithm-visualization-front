// Models
import type { BTreeStep } from "@/core/algorithms/trees/record_btree";
import type { NodeMark, TreeStep } from "@/core/algorithms/trees/tree_model";
// Utils
import { COLORS, monoFont, type Ctx } from "./canvas";

const markColor = (mark: NodeMark | undefined) => (mark === "cur" ? COLORS.act : mark === "path" ? COLORS.primary : mark === "fresh" ? COLORS.violet : mark === "pivot" ? COLORS.amber : mark === "done" ? COLORS.green : null);

function drawTape(ctx: Ctx, w: number, h: number, tape: number[]) {
  const cell = Math.min(30, (w - 24) / Math.max(tape.length, 1));
  const x0 = (w - cell * tape.length) / 2;
  tape.forEach((value, index) => {
    ctx.fillStyle = COLORS.primary;
    ctx.beginPath();
    ctx.roundRect(x0 + index * cell + 1, h - 26, cell - 2, 20, 3);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = monoFont(10);
    ctx.textAlign = "center";
    ctx.fillText(String(value), x0 + index * cell + cell / 2, h - 12);
  });
}

// Binary trees: nodes on their in-order column, red-black colours as the fill, marks as a ring on top.
export function drawTreeStep(ctx: Ctx, w: number, h: number, s: TreeStep) {
  const footer = (s.tape.length ? 32 : 0) + (s.aside ? 16 : 0);
  const cw = (w - 24) / s.columns;
  const r = Math.max(8, Math.min(14, cw * 0.42));
  const rowH = Math.min(64, (h - footer - 2 * r - 30) / Math.max(s.depth, 1));
  const px = (x: number) => 12 + (x + 0.5) * cw;
  const py = (depth: number) => 14 + r + depth * rowH;
  const byId = new Map(s.nodes.map((node) => [node.id, node]));

  s.nodes.forEach((node) => {
    if (node.parent === null) return;
    const parent = byId.get(node.parent);
    if (!parent) return;
    const lit = !!node.mark && !!parent.mark;
    ctx.strokeStyle = lit ? COLORS.primary : COLORS.edge;
    ctx.lineWidth = lit ? 2 : 1.3;
    ctx.beginPath();
    ctx.moveTo(px(parent.x), py(parent.depth));
    ctx.lineTo(px(node.x), py(node.depth));
    ctx.stroke();
  });

  s.nodes.forEach((node) => {
    const x = px(node.x);
    const y = py(node.depth);
    const accent = markColor(node.mark);
    const coloured = node.red !== undefined;
    ctx.fillStyle = coloured ? (node.red ? COLORS.neg : COLORS.wall) : (accent ?? COLORS.def);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    if (coloured && accent) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = !coloured && (node.mark === "cur" || node.mark === "done" || node.mark === "pivot") ? "#0B0E17" : "#ffffff";
    ctx.font = monoFont(r >= 12 ? 11 : 9.5);
    ctx.textAlign = "center";
    ctx.fillText(String(node.key), x, y + 3.5);
    if (node.label === undefined) return;
    ctx.fillStyle = accent && !coloured ? accent : COLORS.text;
    ctx.font = monoFont(9.5);
    ctx.fillText(node.label, x, y + r + 11);
  });

  if (s.tape.length) drawTape(ctx, w, h, s.tape);
  if (!s.aside) return;
  ctx.fillStyle = COLORS.text;
  ctx.font = monoFont(10);
  ctx.textAlign = "left";
  ctx.fillText(s.aside, 12, h - (s.tape.length ? 34 : 8));
}

const CELL_W = 26;
const CELL_H = 22;

// B-trees: a box of key cells per node, leaves spread evenly and parents centred over their children.
export function drawBTreeStep(ctx: Ctx, w: number, h: number, s: BTreeStep) {
  const rowH = Math.min(72, (h - CELL_H - 28) / Math.max(s.depth, 1));
  const px = (x: number) => 16 + x * (w - 32);
  const py = (depth: number) => 14 + depth * rowH;
  const byId = new Map(s.nodes.map((node) => [node.id, node]));
  const boxWidth = (node: { keys: number[] }) => Math.max(node.keys.length, 1) * CELL_W;

  s.nodes.forEach((node) => {
    if (node.parent === null) return;
    const parent = byId.get(node.parent);
    if (!parent) return;
    ctx.strokeStyle = node.mark ? COLORS.primary : COLORS.edge;
    ctx.lineWidth = node.mark ? 2 : 1.3;
    ctx.beginPath();
    ctx.moveTo(px(parent.x), py(parent.depth) + CELL_H);
    ctx.lineTo(px(node.x), py(node.depth));
    ctx.stroke();
  });

  s.nodes.forEach((node) => {
    const width = boxWidth(node);
    const x0 = px(node.x) - width / 2;
    const y0 = py(node.depth);
    const accent = markColor(node.mark);
    ctx.fillStyle = COLORS.def;
    ctx.beginPath();
    ctx.roundRect(x0, y0, width, CELL_H, 4);
    ctx.fill();
    if (accent) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x0 - 1, y0 - 1, width + 2, CELL_H + 2, 5);
      ctx.stroke();
    }
    node.keys.forEach((key, index) => {
      if (index === node.hot) {
        ctx.fillStyle = accent ?? COLORS.primary;
        ctx.beginPath();
        ctx.roundRect(x0 + index * CELL_W + 1, y0 + 1, CELL_W - 2, CELL_H - 2, 3);
        ctx.fill();
      }
      if (index > 0) {
        ctx.strokeStyle = COLORS.edge;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0 + index * CELL_W, y0 + 3);
        ctx.lineTo(x0 + index * CELL_W, y0 + CELL_H - 3);
        ctx.stroke();
      }
      ctx.fillStyle = index === node.hot && (node.mark === "cur" || node.mark === "pivot") ? "#0B0E17" : "#ffffff";
      ctx.font = monoFont(11);
      ctx.textAlign = "center";
      ctx.fillText(String(key), x0 + index * CELL_W + CELL_W / 2, y0 + CELL_H / 2 + 4);
    });
  });
}
