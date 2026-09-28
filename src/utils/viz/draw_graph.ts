// Models
import type { GraphStep } from "@/core/algorithms/graphs/graph_model";
// Utils
import { COLORS, monoFont, type Ctx } from "./canvas";

const NODE_RADIUS = 14;
const DIM = "rgba(140,147,168,.35)";

// The graph player: lettered nodes, weight labels on the edges, arrows on a DAG, and a mono aside at the bottom.
export function drawGraphStep(ctx: Ctx, w: number, h: number, s: GraphStep) {
  const { graph } = s;
  const px = (id: number) => 28 + graph.nodes[id].x * (w - 56);
  const py = (id: number) => 24 + graph.nodes[id].y * (h - 64);

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
    if (!graph.weighted) return;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    ctx.fillStyle = COLORS.open;
    ctx.beginPath();
    ctx.roundRect(mx - 9, my - 7, 18, 14, 3);
    ctx.fill();
    ctx.fillStyle = mark === "used" || mark === "cur" || mark === "candidate" ? color : COLORS.text;
    ctx.font = monoFont(10);
    ctx.textAlign = "center";
    ctx.fillText(String(edge.w), mx, my + 3.5);
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

  if (!s.aside) return;
  ctx.fillStyle = COLORS.text;
  ctx.font = monoFont(10);
  ctx.textAlign = "left";
  ctx.fillText(s.aside, 12, h - 8);
}
