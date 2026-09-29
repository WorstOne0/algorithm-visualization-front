// Models
import type { EditStep } from "@/core/algorithms/signatures/did_you_mean";
import type { NpmStep } from "@/core/algorithms/signatures/npm_order";
import type { RoadsStep } from "@/core/algorithms/signatures/parana_roads";
import type { Board, TttStep } from "@/core/algorithms/signatures/tic_tac_toe";
import type { TrafficStep } from "@/core/algorithms/signatures/traffic";
// Utils
import { COLORS, monoFont, type Ctx } from "./canvas";
import { drawCaption, drawExplored, drawPin, drawRoute, drawStreets, project } from "./draw_road";

const DIM = "rgba(140,147,168,.35)";
const INK = "#0B0E17";

// The dependency graph: packages as boxes in install layers, arrows from a package to what it depends on.
export function drawDag(ctx: Ctx, w: number, h: number, s: NpmStep) {
  const { pkgs, edges } = s.graph;
  const boxH = 22;
  const boxW = (name: string) => 14 + name.length * 6.4;
  const px = (pkg: { x: number }) => 24 + pkg.x * (w - 48);
  const py = (pkg: { y: number }) => 18 + pkg.y * (h - 60);
  edges.forEach((edge) => {
    const from = pkgs[edge.from];
    const to = pkgs[edge.to];
    const mark = s.edgeMarks.get(edge.id);
    const x1 = px(from) - boxW(from.name) / 2;
    const y1 = py(from);
    const x2 = px(to) + boxW(to.name) / 2 + 3;
    const y2 = py(to);
    ctx.strokeStyle = mark === "cycle" ? COLORS.neg : mark === "done" ? COLORS.primary : COLORS.edge;
    ctx.lineWidth = mark ? 1.8 : 1.1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x1 - (x1 - x2) / 2, y1, x2 + (x1 - x2) / 2, y2, x2, y2);
    ctx.stroke();
    const angle = Math.atan2(y2 - y1, -(x1 - x2) / 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 + 8 * Math.cos(angle - 0.4) * -1, y2 - 8 * Math.sin(angle - 0.4));
    ctx.lineTo(x2 + 8 * Math.cos(angle + 0.4) * -1, y2 - 8 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  });
  pkgs.forEach((pkg) => {
    const mark = s.marks.get(pkg.id);
    const width = boxW(pkg.name);
    const x = px(pkg) - width / 2;
    const y = py(pkg) - boxH / 2;
    ctx.fillStyle = mark === "cur" ? COLORS.act : mark === "done" ? COLORS.green : mark === "queue" ? COLORS.primary : mark === "stuck" ? COLORS.neg : COLORS.def;
    ctx.beginPath();
    ctx.roundRect(x, y, width, boxH, 5);
    ctx.fill();
    ctx.fillStyle = mark === "cur" || mark === "done" ? INK : "#ffffff";
    ctx.font = monoFont(10.5);
    ctx.textAlign = "center";
    ctx.fillText(pkg.name, px(pkg), py(pkg) + 3.5);
    if (mark === "done") return;
    ctx.fillStyle = mark === "stuck" ? COLORS.neg : COLORS.text;
    ctx.font = monoFont(9.5);
    ctx.fillText(String(s.indeg[pkg.id]), px(pkg), y + boxH + 11);
  });
  ctx.fillStyle = COLORS.text;
  ctx.font = monoFont(10);
  ctx.textAlign = "left";
  ctx.fillText(`order: ${s.order.map((id) => pkgs[id].name).join(" → ") || "∅"}`, 12, h - 8);
}

// The edit-distance table: typed word down the side, candidate across the top, filled rows tinted, the answer cell in violet.
export function drawEditTable(ctx: Ctx, w: number, h: number, s: EditStep) {
  ctx.font = monoFont(11);
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.text;
  if (!s.candidate) {
    ctx.fillText(`"${s.typed}"`, 12, 20);
    return;
  }
  const rows = s.typed.length + 2;
  const cols = s.candidate.length + 2;
  const cell = Math.max(14, Math.min(34, (w - 40) / cols, (h - 56) / rows));
  const x0 = (w - cols * cell) / 2;
  const y0 = 30 + (h - 56 - rows * cell) / 2;
  ctx.fillText(`"${s.typed}" → "${s.candidate}"`, 12, 18);
  ctx.textAlign = "right";
  ctx.fillStyle = COLORS.text;
  ctx.fillText(s.rows > s.typed.length ? `distance ${s.table[s.typed.length][s.candidate.length]}` : `row ${s.rows - 1} / ${s.typed.length}`, w - 12, 18);
  ctx.textAlign = "center";
  const fontSize = Math.max(8, Math.min(11, cell * 0.4));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * cell;
      const y = y0 + r * cell;
      const isHeader = r === 0 || c === 0;
      const i = r - 1;
      const j = c - 1;
      if (isHeader) {
        const char = r === 0 && c >= 2 ? s.candidate[c - 2] : c === 0 && r >= 2 ? s.typed[r - 2] : "";
        ctx.fillStyle = COLORS.text;
        ctx.font = monoFont(fontSize + 1);
        ctx.fillText(char, x + cell / 2, y + cell / 2 + 4);
        continue;
      }
      const filled = i < s.rows;
      const isAnswer = i === s.typed.length && j === s.candidate.length && filled;
      const isLastRow = i === s.rows - 1 && s.rows <= s.typed.length;
      ctx.fillStyle = isAnswer ? COLORS.violet : isLastRow ? COLORS.primary : filled ? COLORS.def : COLORS.wall;
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, cell - 2, cell - 2, 3);
      ctx.fill();
      if (!filled) continue;
      ctx.fillStyle = isAnswer || isLastRow ? INK : "#ffffff";
      ctx.font = monoFont(fontSize);
      ctx.fillText(String(s.table[i][j]), x + cell / 2, y + cell / 2 + 4);
    }
  }
}

// The cities on an equirectangular map: candidate roads faint, the one under consideration white, built roads blue, rejected dashed.
export function drawCityMap(ctx: Ctx, w: number, h: number, s: RoadsStep) {
  const { cities, roads } = s;
  const lats = cities.map((city) => city.lat);
  const lons = cities.map((city) => city.lon);
  const midLat = ((Math.min(...lats) + Math.max(...lats)) / 2) * (Math.PI / 180);
  const spanX = (Math.max(...lons) - Math.min(...lons)) * Math.cos(midLat);
  const spanY = Math.max(...lats) - Math.min(...lats);
  const scale = Math.min((w - 150) / spanX, (h - 60) / spanY);
  const ox = (w - spanX * scale) / 2 - 20;
  const oy = (h - spanY * scale) / 2;
  const px = (city: { lon: number }) => ox + (city.lon - Math.min(...lons)) * Math.cos(midLat) * scale;
  const py = (city: { lat: number }) => oy + (Math.max(...lats) - city.lat) * scale;
  const order = [...roads].sort((p, q) => Number(!!s.roadMarks.get(p.id)) - Number(!!s.roadMarks.get(q.id)));
  order.forEach((road) => {
    const mark = s.roadMarks.get(road.id);
    ctx.strokeStyle = mark === "used" ? COLORS.primary : mark === "cur" ? COLORS.act : mark === "rejected" ? DIM : COLORS.edge;
    ctx.lineWidth = mark === "used" ? 2.6 : mark === "cur" ? 2.2 : 1.1;
    ctx.setLineDash(mark === "rejected" ? [4, 4] : []);
    ctx.beginPath();
    ctx.moveTo(px(cities[road.a]), py(cities[road.a]));
    ctx.lineTo(px(cities[road.b]), py(cities[road.b]));
    ctx.stroke();
    if (mark !== "cur" && mark !== "used") return;
    const mx = (px(cities[road.a]) + px(cities[road.b])) / 2;
    const my = (py(cities[road.a]) + py(cities[road.b])) / 2;
    const text = `${road.km}`;
    ctx.fillStyle = COLORS.open;
    ctx.beginPath();
    ctx.roundRect(mx - 4 - text.length * 3, my - 6, 8 + text.length * 6, 12, 3);
    ctx.fill();
    ctx.fillStyle = mark === "cur" ? COLORS.act : COLORS.primary;
    ctx.font = monoFont(9);
    ctx.textAlign = "center";
    ctx.fillText(text, mx, my + 3);
  });
  ctx.setLineDash([]);
  cities.forEach((city) => {
    const x = px(city);
    const y = py(city);
    const isOn = s.connected.has(city.id);
    ctx.fillStyle = isOn ? COLORS.green : COLORS.def;
    ctx.beginPath();
    ctx.arc(x, y, isOn ? 4.5 : 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.text;
    ctx.font = monoFont(9.5);
    const onRight = x > w - 110;
    ctx.textAlign = onRight ? "right" : "left";
    ctx.fillText(city.name, onRight ? x - 7 : x + 7, y + 3.5);
  });
  ctx.fillStyle = COLORS.text;
  ctx.font = monoFont(10);
  ctx.textAlign = "left";
  ctx.fillText(`${s.total} km`, 12, h - 8);
}

function drawBoard(ctx: Ctx, x: number, y: number, size: number, board: Board, border: string, lineWidth = 1.2) {
  const cell = size / 3;
  ctx.fillStyle = COLORS.wall;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 3);
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 3);
  ctx.stroke();
  ctx.strokeStyle = COLORS.edge;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let k = 1; k < 3; k++) {
    ctx.moveTo(x + k * cell, y + 2);
    ctx.lineTo(x + k * cell, y + size - 2);
    ctx.moveTo(x + 2, y + k * cell);
    ctx.lineTo(x + size - 2, y + k * cell);
  }
  ctx.stroke();
  board.forEach((mark, index) => {
    if (!mark) return;
    const cx = x + (index % 3) * cell + cell / 2;
    const cy = y + Math.floor(index / 3) * cell + cell / 2;
    const r = cell * 0.28;
    ctx.strokeStyle = mark === "X" ? COLORS.primary : COLORS.violet;
    ctx.lineWidth = Math.max(1.2, cell * 0.11);
    ctx.beginPath();
    if (mark === "O") ctx.arc(cx, cy, r, 0, Math.PI * 2);
    else {
      ctx.moveTo(cx - r, cy - r);
      ctx.lineTo(cx + r, cy + r);
      ctx.moveTo(cx + r, cy - r);
      ctx.lineTo(cx - r, cy + r);
    }
    ctx.stroke();
  });
}

// The engine's search: the position at the top, its candidate moves scored in a row, and the replies it expects under the chosen one.
export function drawTicTacTree(ctx: Ctx, w: number, h: number, s: TttStep) {
  const count = Math.max(1, s.candidates.length);
  const size = Math.max(30, Math.min(54, ((w - 60) / Math.max(count, s.replies.length || 1)) * 0.72, h * 0.2));
  const rootSize = size * 1.15;
  const rootX = w / 2 - rootSize / 2;
  const rootY = 12;
  const rowY = h * 0.4;
  const replyY = h - size - 30;
  const slot = (index: number, total: number) => 30 + ((index + 0.5) / total) * (w - 60);
  ctx.font = monoFont(9.5);
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.text;
  ctx.fillText(`${s.player} to move`, 8, rootY + rootSize / 2 + 3);
  if (s.shown) ctx.fillText(`${s.player} candidates`, 8, rowY + size / 2 + 3);
  if (s.showReplies && s.replies.length) ctx.fillText(`${s.player === "X" ? "O" : "X"} replies`, 8, replyY + size / 2 + 3);
  s.candidates.slice(0, s.shown).forEach((candidate, index) => {
    const x = slot(index, count) - size / 2;
    const isChosen = s.chosen === index;
    const isCurrent = !s.showReplies && index === s.shown - 1;
    ctx.strokeStyle = isChosen ? COLORS.violet : isCurrent ? COLORS.act : COLORS.primary;
    ctx.lineWidth = isChosen ? 2 : 1.1;
    ctx.beginPath();
    ctx.moveTo(w / 2, rootY + rootSize);
    ctx.lineTo(x + size / 2, rowY);
    ctx.stroke();
    drawBoard(ctx, x, rowY, size, candidate.board, isChosen ? COLORS.violet : isCurrent ? COLORS.act : COLORS.def, isChosen || isCurrent ? 2 : 1.2);
    ctx.fillStyle = isChosen ? COLORS.violet : isCurrent ? COLORS.act : COLORS.text;
    ctx.font = monoFont(10);
    ctx.textAlign = "center";
    ctx.fillText(candidate.value > 0 ? `+${candidate.value}` : String(candidate.value), x + size / 2, rowY + size + 12);
    ctx.fillStyle = COLORS.text;
    ctx.font = monoFont(8.5);
    ctx.fillText(`${candidate.nodes} n`, x + size / 2, rowY + size + 23);
  });
  drawBoard(ctx, rootX, rootY, rootSize, s.root, s.shown ? COLORS.def : COLORS.act, 1.4);
  if (!s.showReplies || s.chosen === null || !s.replies.length) return;
  const chosenX = slot(s.chosen, count);
  s.replies.forEach((reply, index) => {
    const x = slot(index, s.replies.length) - size / 2;
    const isBest = reply.value === Math.min(...s.replies.map((candidate) => candidate.value));
    ctx.strokeStyle = isBest ? COLORS.violet : COLORS.edge;
    ctx.lineWidth = isBest ? 1.8 : 1;
    ctx.beginPath();
    ctx.moveTo(chosenX, rowY + size);
    ctx.lineTo(x + size / 2, replyY);
    ctx.stroke();
    drawBoard(ctx, x, replyY, size, reply.board, isBest ? COLORS.violet : COLORS.def);
    ctx.fillStyle = isBest ? COLORS.violet : COLORS.text;
    ctx.font = monoFont(10);
    ctx.textAlign = "center";
    ctx.fillText(reply.value > 0 ? `+${reply.value}` : String(reply.value), x + size / 2, replyY + size + 12);
  });
}

// The traffic frame: streets, the jammed ones in amber, the search, the shortest route dimmed in violet, the fastest in green.
export function drawTrafficStep(ctx: Ctx, w: number, h: number, s: TrafficStep) {
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
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = COLORS.amber;
  for (const band of [1.6, 2.3, 3]) {
    ctx.globalAlpha = 0.18 + (band - 1.6) * 0.3;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    map.edges.forEach((edge) => {
      const factor = s.factors[edge.id];
      if (factor < band || (band < 3 && factor >= band + 0.7)) return;
      ctx.moveTo(p.px(edge.a), p.py(edge.a));
      ctx.lineTo(p.px(edge.b), p.py(edge.b));
    });
    ctx.stroke();
  }
  ctx.restore();
  drawExplored(ctx, map, p, s.order, s.parent, s.closedUpTo, COLORS.primary, 0.45);
  ctx.fillStyle = COLORS.primary;
  s.open.forEach((node) => {
    ctx.beginPath();
    ctx.arc(p.px(node), p.py(node), 1.8, 0, Math.PI * 2);
    ctx.fill();
  });
  if (s.reference.length) {
    ctx.save();
    ctx.globalAlpha = s.path.length ? 0.55 : 0.35;
    drawRoute(ctx, p, s.reference, COLORS.violet, 2.5);
    ctx.restore();
  }
  drawRoute(ctx, p, s.path, COLORS.green);
  if (s.cur >= 0 && !s.path.length) drawPin(ctx, p.px(s.cur), p.py(s.cur), COLORS.act, 4);
  if (s.start >= 0) drawPin(ctx, p.px(s.start), p.py(s.start), COLORS.green);
  if (s.goal >= 0) drawPin(ctx, p.px(s.goal), p.py(s.goal), COLORS.green);
  drawCaption(ctx, w, h, map, p.scale);
}
