// Models
import type { RoadStep } from "@/core/algorithms/pathfinding/record_road";
import type { RoadMap } from "@/core/algorithms/pathfinding/road_map";
// Utils
import { COLORS, monoFont, type Ctx } from "./canvas";

const STREET = ["rgba(147,197,253,.30)", "rgba(147,197,253,.22)", "rgba(147,197,253,.16)", "rgba(147,197,253,.10)"];
const STREET_WIDTH = [2, 1.5, 1.1, 0.8];

export type Projection = { px: (node: number) => number; py: (node: number) => number; scale: number };

// Fits the map into the canvas keeping metres square, with a 12px margin.
export function project(map: RoadMap, w: number, h: number): Projection {
  const scale = Math.min((w - 24) / map.width, (h - 24) / map.height);
  const ox = (w - map.width * scale) / 2;
  const oy = (h - map.height * scale) / 2;
  return { px: (node) => ox + map.x[node] * scale, py: (node) => oy + map.y[node] * scale, scale };
}

const layers = new Map<string, HTMLCanvasElement>();

// Every street, drawn once per canvas size and reused as the background of each frame.
export function streetLayer(map: RoadMap, w: number, h: number) {
  const key = `${map.city}:${w}x${h}:${window.devicePixelRatio || 1}`;
  const existing = layers.get(key);
  if (existing) return existing;
  const dpr = window.devicePixelRatio || 1;
  const layer = document.createElement("canvas");
  layer.width = Math.round(w * dpr);
  layer.height = Math.round(h * dpr);
  const ctx = layer.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const { px, py } = project(map, w, h);
  ctx.lineCap = "round";
  for (let cls = 3; cls >= 0; cls--) {
    ctx.strokeStyle = STREET[cls];
    ctx.lineWidth = STREET_WIDTH[cls];
    ctx.beginPath();
    map.edges.forEach((edge) => {
      if (edge.cls !== cls) return;
      ctx.moveTo(px(edge.a), py(edge.a));
      ctx.lineTo(px(edge.b), py(edge.b));
    });
    ctx.stroke();
  }
  if (layers.size > 6) layers.clear();
  layers.set(key, layer);
  return layer;
}

export function drawStreets(ctx: Ctx, map: RoadMap, w: number, h: number) {
  ctx.drawImage(streetLayer(map, w, h), 0, 0, w, h);
}

// The parent links of the first `count` closed intersections, as one glowing stroke.
export function drawExplored(ctx: Ctx, map: RoadMap, p: Projection, order: number[], parent: Int32Array, count: number, color: string, alpha = 0.55) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const node = order[i];
    const from = parent[node];
    if (from < 0) continue;
    ctx.moveTo(p.px(from), p.py(from));
    ctx.lineTo(p.px(node), p.py(node));
  }
  ctx.stroke();
  ctx.restore();
}

export function drawRoute(ctx: Ctx, p: Projection, path: number[], color: string, width = 3.5) {
  if (path.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(p.px(path[0]), p.py(path[0]));
  for (let i = 1; i < path.length; i++) ctx.lineTo(p.px(path[i]), p.py(path[i]));
  ctx.stroke();
  ctx.restore();
}

export function drawPin(ctx: Ctx, x: number, y: number, color: string, r = 5) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "#0B0E17";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawCaption(ctx: Ctx, w: number, h: number, map: RoadMap, scale: number) {
  const metres = 500;
  const length = metres * scale;
  ctx.strokeStyle = COLORS.text;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(12, h - 10);
  ctx.lineTo(12 + length, h - 10);
  ctx.moveTo(12, h - 14);
  ctx.lineTo(12, h - 6);
  ctx.moveTo(12 + length, h - 14);
  ctx.lineTo(12 + length, h - 6);
  ctx.stroke();
  ctx.fillStyle = COLORS.text;
  ctx.font = monoFont(9.5);
  ctx.textAlign = "left";
  ctx.fillText(`${metres} m`, 12 + length + 6, h - 7);
  ctx.textAlign = "right";
  ctx.fillText(`${map.city} · © ${map.source}`, w - 10, h - 7);
}

// The player frame: streets, the explored links, the open set, the current intersection, the route, both pins.
export function drawRoadStep(ctx: Ctx, w: number, h: number, s: RoadStep) {
  if (!s.map) {
    ctx.fillStyle = COLORS.text;
    ctx.font = monoFont(11);
    ctx.textAlign = "center";
    ctx.fillText("loading map…", w / 2, h / 2);
    return;
  }
  const map = s.map;
  const p = project(map, w, h);
  drawStreets(ctx, map, w, h);
  drawExplored(ctx, map, p, s.order, s.parent, s.closedUpTo, COLORS.primary);
  ctx.fillStyle = COLORS.primary;
  s.open.forEach((node) => {
    ctx.beginPath();
    ctx.arc(p.px(node), p.py(node), 1.8, 0, Math.PI * 2);
    ctx.fill();
  });
  drawRoute(ctx, p, s.path, COLORS.violet);
  if (s.cur >= 0 && !s.path.length) drawPin(ctx, p.px(s.cur), p.py(s.cur), COLORS.act, 4);
  drawPin(ctx, p.px(s.start), p.py(s.start), COLORS.green);
  drawPin(ctx, p.px(s.goal), p.py(s.goal), COLORS.green);
  drawCaption(ctx, w, h, map, p.scale);
}
