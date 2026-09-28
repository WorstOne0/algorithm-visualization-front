// Models
import type { GraphMatrix, GraphStep } from "@/core/algorithms/graphs/graph_model";
// Utils
import { COLORS, monoFont, type Ctx } from "./canvas";

const NODE_RADIUS = 14;
const DIM = "rgba(140,147,168,.35)";

// Node positions are unit coordinates inside a 28px / 24px margin; the same mapping serves drawing and dragging.
export const graphToCanvas = (w: number, h: number) => ({ px: (x: number) => 28 + x * (w - 56), py: (y: number) => 24 + y * (h - 64) });
export const canvasToGraph = (w: number, h: number, x: number, y: number): [number, number] => [Math.min(0.98, Math.max(0.02, (x - 28) / (w - 56))), Math.min(0.98, Math.max(0.02, (y - 24) / (h - 64)))];

// Drag support: the graph object is shared by every step of a recording, so moving a node moves it in all of them.
export function moveGraphNode(s: GraphStep, id: number, w: number, h: number, x: number, y: number) {
  const node = s.graph.nodes[id];
  [node.x, node.y] = canvasToGraph(w, h, x, y);
}

export function graphNodeAt(s: GraphStep, w: number, h: number, x: number, y: number) {
  const { px, py } = graphToCanvas(w, h);
  const hit = s.graph.nodes.find((node) => Math.hypot(px(node.x) - x, py(node.y) - y) <= NODE_RADIUS + 3);
  return hit ? hit.id : -1;
}

// The graph player: lettered nodes, weight labels on the edges, arrows on a DAG, and a mono aside at the bottom.
export function drawGraphStep(ctx: Ctx, fullWidth: number, h: number, s: GraphStep) {
  const { graph } = s;
  // A matrix takes the right part; the graph keeps the rest.
  const w = s.matrix ? Math.floor(fullWidth * 0.6) : fullWidth;
  const unit = graphToCanvas(w, h);
  const px = (id: number) => unit.px(graph.nodes[id].x);
  const py = (id: number) => unit.py(graph.nodes[id].y);

  graph.edges.forEach((edge) => {
    const mark = s.edgeMarks.get(edge.id);
    const color = mark === "used" ? COLORS.primary : mark === "cur" ? COLORS.act : mark === "candidate" ? COLORS.violet : mark === "rejected" ? DIM : COLORS.edge;
    const x1 = px(edge.u);
    const y1 = py(edge.u);
    const x2 = px(edge.v);
    const y2 = py(edge.v);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const endX = graph.directed ? x2 - Math.cos(angle) * (NODE_RADIUS + 2) : x2;
    const endY = graph.directed ? y2 - Math.sin(angle) * (NODE_RADIUS + 2) : y2;
    ctx.strokeStyle = color;
    ctx.lineWidth = mark === "used" || mark === "cur" ? 2.4 : mark === "candidate" ? 1.8 : 1.3;
    ctx.setLineDash(mark === "rejected" ? [4, 4] : []);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    if (graph.directed) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - Math.cos(angle - 0.45) * 9, endY - Math.sin(angle - 0.45) * 9);
      ctx.lineTo(endX - Math.cos(angle + 0.45) * 9, endY - Math.sin(angle + 0.45) * 9);
      ctx.closePath();
      ctx.fill();
    }
    const text = s.edgeLabels?.get(edge.id) ?? (graph.weighted ? String(edge.w) : null);
    if (text === null) return;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const boxWidth = 8 + text.length * 6;
    ctx.fillStyle = COLORS.open;
    ctx.beginPath();
    ctx.roundRect(mx - boxWidth / 2, my - 7, boxWidth, 14, 3);
    ctx.fill();
    ctx.fillStyle = mark === "used" || mark === "cur" || mark === "candidate" ? color : COLORS.text;
    ctx.font = monoFont(10);
    ctx.textAlign = "center";
    ctx.fillText(text, mx, my + 3.5);
  });

  graph.nodes.forEach((node) => {
    const mark = s.nodeMarks.get(node.id);
    const fill = mark === "cur" ? COLORS.act : mark === "done" ? COLORS.green : mark === "frontier" ? COLORS.primary : mark === "seen" ? COLORS.vis : COLORS.def;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(px(node.id), py(node.id), mark === "cur" ? NODE_RADIUS + 2 : NODE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = mark === "cur" || mark === "done" ? "#0B0E17" : "#ffffff";
    ctx.font = monoFont(12);
    ctx.textAlign = "center";
    ctx.fillText(node.label, px(node.id), py(node.id) + 4);
    const label = s.labels.get(node.id);
    if (label === undefined) return;
    ctx.fillStyle = mark === "cur" ? COLORS.act : COLORS.text;
    ctx.font = monoFont(10);
    ctx.fillText(label, px(node.id), py(node.id) + NODE_RADIUS + 13);
  });

  if (s.matrix) drawMatrix(ctx, w + 8, 0, fullWidth - w - 8, h, s.matrix);
  if (!s.aside) return;
  ctx.fillStyle = COLORS.text;
  ctx.font = monoFont(10);
  ctx.textAlign = "left";
  ctx.fillText(s.aside, 12, h - 8);
}

// The distance table of an all-pairs algorithm: the pivot row and column tinted, the cell being improved lit.
function drawMatrix(ctx: Ctx, x0: number, y0: number, width: number, height: number, m: GraphMatrix) {
  const n = m.labels.length;
  const cell = Math.min(30, (width - 24) / (n + 1), (height - 24) / (n + 1));
  const left = x0 + 12 + cell;
  const top = y0 + 12 + cell;
  ctx.font = monoFont(Math.max(8, Math.min(10, cell * 0.38)));
  ctx.textAlign = "center";
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i === m.pivot ? COLORS.violet : COLORS.text;
    ctx.fillText(m.labels[i], left + i * cell + cell / 2, top - cell / 2 + 3);
    ctx.fillText(m.labels[i], left - cell / 2, top + i * cell + cell / 2 + 3);
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const isHot = m.hot?.[0] === i && m.hot?.[1] === j;
      const onPivot = i === m.pivot || j === m.pivot;
      ctx.fillStyle = isHot ? COLORS.primary : onPivot ? COLORS.vis : COLORS.open;
      ctx.fillRect(left + j * cell + 0.5, top + i * cell + 0.5, cell - 1, cell - 1);
      const value = m.values[i][j];
      ctx.fillStyle = isHot ? "#ffffff" : value === null ? "rgba(140,147,168,.45)" : i === j ? COLORS.text : "#e5e7ef";
      ctx.fillText(value === null ? "∞" : String(value), left + j * cell + cell / 2, top + i * cell + cell / 2 + 3.5);
    }
  }
}
