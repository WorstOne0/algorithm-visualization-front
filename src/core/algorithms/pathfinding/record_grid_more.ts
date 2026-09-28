// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Counter, Recorder } from "../recording";
import { makeGrid, type Cell } from "./grid_search";
import { MAZE_COLS, MAZE_ROWS, type GridStep } from "./record_grid";

// Line numbers in every recorder mirror the listings in core/models/algorithms/pathfinding_more.ts.

const DIRS: Cell[] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

type Session = ReturnType<typeof session>;

function session(n: number, seed: number) {
  const rand = seeded(seed);
  const grid = makeGrid(MAZE_COLS, MAZE_ROWS, n / 100, rand);
  const key = (r: number, c: number) => r * MAZE_COLS + c;
  const at = (k: number): Cell => [Math.floor(k / MAZE_COLS), k % MAZE_COLS];
  const walkable = (r: number, c: number) => r >= 0 && c >= 0 && r < MAZE_ROWS && c < MAZE_COLS && grid.g[r][c] === 0;
  const startKey = key(grid.s[0], grid.s[1]);
  const goalKey = key(grid.e[0], grid.e[1]);
  const steps: GridStep[] = [];
  const visited = new Set<number>();
  const frontier = new Set<number>();
  const gmap = new Map<number, number>();
  const push = (line: number, note: Localized, counters: Record<string, Counter>, cur: number, path: number[] = []) => steps.push({ g: grid.g, cost: grid.cost, s: grid.s, e: grid.e, visited: new Set(visited), frontier: new Set(frontier), cur, path, gmap: new Map(gmap), line, note, counters });
  const label = (k: number) => `(${at(k)[0]}, ${at(k)[1]})`;
  const meta = (extra: Localized): Localized => ({ en: `${MAZE_COLS}×${MAZE_ROWS} · ${n}% walls · seed ${seed} · ${extra.en} · ${steps.length} steps`, pt: `${MAZE_COLS}×${MAZE_ROWS} · ${n}% paredes · seed ${seed} · ${extra.pt} · ${steps.length} passos` });
  return { grid, key, at, walkable, startKey, goalKey, steps, visited, frontier, gmap, push, label, meta };
}

// Every cell on the straight run between two aligned or diagonal-free points, for drawing jump and any-angle paths.
function rasterize(session: Session, waypoints: number[]) {
  const cells: number[] = [];
  for (let i = 0; i < waypoints.length; i++) {
    const [r0, c0] = session.at(waypoints[i]);
    if (i === 0) {
      cells.push(waypoints[0]);
      continue;
    }
    const [r1, c1] = session.at(waypoints[i - 1]);
    const length = Math.max(Math.abs(r0 - r1), Math.abs(c0 - c1));
    for (let t = 1; t <= length; t++) {
      const r = Math.round(r1 + ((r0 - r1) * t) / length);
      const c = Math.round(c1 + ((c0 - c1) * t) / length);
      const k = session.key(r, c);
      if (cells[cells.length - 1] !== k) cells.push(k);
    }
  }
  return cells;
}

export const recordBidirectional: Recorder = (n, seed) => {
  const s = session(n, seed);
  const { steps, visited, frontier, push, label, startKey, goalKey, key, at, walkable } = s;
  const front = { parent: new Map<number, number>([[startKey, -1]]), ring: [startKey] };
  const back = { parent: new Map<number, number>([[goalKey, -1]]), ring: [goalKey] };
  let rings = 0;
  let meeting = -1;
  const counters = (path: number[] = []) => ({ expanded: visited.size, front: front.parent.size, back: back.parent.size, rings, path: path.length ? path.length - 1 : "—", pathUnit: path.length ? { en: "cells", pt: "células" } : "", walls: `${n}%` });
  const showFrontier = () => {
    frontier.clear();
    front.ring.forEach((k) => frontier.add(k));
    back.ring.forEach((k) => frontier.add(k));
  };

  showFrontier();
  push(2, { en: `Two searches: one from the start ${label(startKey)}, one from the goal ${label(goalKey)}. They take turns growing one ring each.`, pt: `Duas buscas: uma do início ${label(startKey)}, uma do destino ${label(goalKey)}. Elas se revezam crescendo um anel cada.` }, counters(), -1);
  const expand = (side: typeof front, other: typeof front, line: number, name: Localized) => {
    rings++;
    const next: number[] = [];
    for (const current of side.ring) {
      visited.add(current);
      for (const [dr, dc] of DIRS) {
        const [r, c] = at(current);
        if (!walkable(r + dr, c + dc)) continue;
        const k = key(r + dr, c + dc);
        if (side.parent.has(k)) continue;
        side.parent.set(k, current);
        next.push(k);
        if (other.parent.has(k)) {
          meeting = k;
          side.ring = next;
          showFrontier();
          push(16, { en: `${name.en} reaches ${label(k)}, which the other side had already reached: the searches meet.`, pt: `${name.pt} chega em ${label(k)}, que o outro lado já tinha alcançado: as buscas se encontram.` }, counters(), k);
          return true;
        }
      }
    }
    side.ring = next;
    showFrontier();
    push(line, { en: `${name.en} grows one ring: ${next.length} new cells, ${side.parent.size} reached from that side so far.`, pt: `${name.pt} cresce um anel: ${next.length} células novas, ${side.parent.size} alcançadas desse lado até aqui.` }, counters(), -1);
    return false;
  };
  while (front.ring.length && back.ring.length && meeting < 0) {
    if (expand(front, back, 4, { en: "The start side", pt: "O lado do início" })) break;
    if (expand(back, front, 6, { en: "The goal side", pt: "O lado do destino" })) break;
  }
  if (meeting >= 0) {
    const path: number[] = [];
    for (let k = meeting; k !== -1; k = front.parent.get(k)!) path.push(k);
    path.reverse();
    for (let k = back.parent.get(meeting)!; k !== -1; k = back.parent.get(k)!) path.push(k);
    for (let i = 2; i <= path.length; i += Math.max(1, Math.floor(path.length / 24))) push(5, { en: `Join the two parent chains through ${label(meeting)}.`, pt: `Une as duas cadeias de pais por ${label(meeting)}.` }, counters(path.slice(0, i)), meeting, path.slice(0, i));
    push(5, { en: `Done. Path of ${path.length - 1} steps; ${visited.size} cells expanded in ${rings} rings, about half of what one-sided BFS would touch.`, pt: `Pronto. Caminho de ${path.length - 1} passos; ${visited.size} células expandidas em ${rings} anéis, cerca de metade do que o BFS de um lado só tocaria.` }, counters(path), -1, path);
  } else push(9, { en: `One side ran out of cells: no path exists.`, pt: `Um lado ficou sem células: não existe caminho.` }, counters(), -1);
  return { steps, meta: s.meta({ en: "two frontiers", pt: "duas fronteiras" }) };
};

export const recordThetaStar: Recorder = (n, seed) => {
  const s = session(n, seed);
  const { steps, visited, frontier, gmap, push, label, startKey, goalKey, key, at, walkable } = s;
  const euclid = (a: number, b: number) => Math.hypot(at(a)[0] - at(b)[0], at(a)[1] - at(b)[1]);
  const lineOfSight = (a: number, b: number) => {
    const [r0, c0] = at(a);
    const [r1, c1] = at(b);
    const length = Math.max(Math.abs(r0 - r1), Math.abs(c0 - c1)) * 2;
    for (let t = 0; t <= length; t++) {
      const r = r0 + ((r1 - r0) * t) / length;
      const c = c0 + ((c1 - c0) * t) / length;
      if (!walkable(Math.round(r), Math.round(c))) return false;
      if (!walkable(Math.floor(r), Math.floor(c)) || !walkable(Math.ceil(r), Math.ceil(c))) return false;
    }
    return true;
  };
  const parent = new Map<number, number>([[startKey, startKey]]);
  const open: number[] = [startKey];
  gmap.set(startKey, 0);
  let expanded = 0;
  let shortcuts = 0;
  let relaxations = 0;
  const counters = (path: number[] = [], waypoints = 0) => ({ expanded, open: open.length, shortcuts, relaxations, path: path.length ? `${gmap.get(goalKey)!.toFixed(1)}` : "—", pathUnit: path.length ? { en: `cells · ${waypoints} turns`, pt: `células · ${waypoints} curvas` } : "", walls: `${n}%` });
  const refreshFrontier = () => {
    frontier.clear();
    open.forEach((k) => frontier.add(k));
  };

  refreshFrontier();
  push(2, { en: `Start at ${label(startKey)}, goal at ${label(goalKey)}. Like A*, but a cell's parent may be any earlier cell it can see in a straight line.`, pt: `Início em ${label(startKey)}, destino em ${label(goalKey)}. Como o A*, mas o pai de uma célula pode ser qualquer célula anterior visível em linha reta.` }, counters(), -1);
  while (open.length) {
    let best = 0;
    open.forEach((k, i) => {
      if (gmap.get(k)! + euclid(k, goalKey) < gmap.get(open[best])! + euclid(open[best], goalKey)) best = i;
    });
    const current = open.splice(best, 1)[0];
    if (visited.has(current)) continue;
    visited.add(current);
    expanded++;
    refreshFrontier();
    push(4, { en: `Pop ${label(current)} with the lowest distance + straight line to the goal (${(gmap.get(current)! + euclid(current, goalKey)).toFixed(1)}).`, pt: `Retira ${label(current)} com a menor distância + linha reta ao destino (${(gmap.get(current)! + euclid(current, goalKey)).toFixed(1)}).` }, counters(), current);
    if (current === goalKey) break;
    const grandparent = parent.get(current)!;
    for (const [dr, dc] of DIRS) {
      const [r, c] = at(current);
      if (!walkable(r + dr, c + dc)) continue;
      const neighbor = key(r + dr, c + dc);
      if (visited.has(neighbor)) continue;
      const sees = grandparent !== current && lineOfSight(grandparent, neighbor);
      const via = sees ? grandparent : current;
      const candidate = gmap.get(via)! + euclid(via, neighbor);
      if (candidate >= (gmap.get(neighbor) ?? Infinity)) continue;
      gmap.set(neighbor, candidate);
      parent.set(neighbor, via);
      open.push(neighbor);
      relaxations++;
      if (sees) shortcuts++;
      refreshFrontier();
      push(sees ? 8 : 11, sees
        ? { en: `${label(neighbor)} can see ${label(grandparent)}, the parent of ${label(current)}: link it straight there, distance ${candidate.toFixed(1)}.`, pt: `${label(neighbor)} enxerga ${label(grandparent)}, o pai de ${label(current)}: liga direto lá, distância ${candidate.toFixed(1)}.` }
        : { en: `No line of sight past ${label(current)}: ${label(neighbor)} hangs off it, distance ${candidate.toFixed(1)}.`, pt: `Sem linha de visão além de ${label(current)}: ${label(neighbor)} pendura nele, distância ${candidate.toFixed(1)}.` }, counters(), current);
    }
  }
  if (gmap.has(goalKey) && visited.has(goalKey)) {
    const waypoints: number[] = [];
    for (let k = goalKey; k !== startKey; k = parent.get(k)!) waypoints.push(k);
    waypoints.push(startKey);
    waypoints.reverse();
    const path = rasterize(s, waypoints);
    for (let i = 2; i <= waypoints.length; i++) push(5, { en: `Follow the parents: ${waypoints.length} waypoints joined by straight segments.`, pt: `Segue os pais: ${waypoints.length} pontos ligados por segmentos retos.` }, counters(rasterize(s, waypoints.slice(0, i)), i - 1), -1, rasterize(s, waypoints.slice(0, i)));
    push(5, { en: `Done. Any-angle path of length ${gmap.get(goalKey)!.toFixed(1)} with ${waypoints.length - 2} turns; ${shortcuts} of ${relaxations} links skipped a parent.`, pt: `Pronto. Caminho de qualquer ângulo de comprimento ${gmap.get(goalKey)!.toFixed(1)} com ${waypoints.length - 2} curvas; ${shortcuts} de ${relaxations} ligações pularam um pai.` }, counters(path, waypoints.length - 2), -1, path);
  } else push(15, { en: `The open set is empty: no path exists.`, pt: `O conjunto aberto está vazio: não existe caminho.` }, counters(), -1);
  return { steps, meta: s.meta({ en: "euclidean", pt: "euclidiano" }) };
};

export const recordJumpPoint: Recorder = (n, seed) => {
  const s = session(n, seed);
  const { steps, visited, frontier, gmap, push, label, startKey, goalKey, key, at, walkable } = s;
  const manhattan = (a: number, b: number) => Math.abs(at(a)[0] - at(b)[0]) + Math.abs(at(a)[1] - at(b)[1]);
  const parent = new Map<number, number>();
  const open: number[] = [startKey];
  const jumpPoints = new Set<number>([startKey]);
  gmap.set(startKey, 0);
  let expanded = 0;
  let scanned = 0;
  let found = 0;
  const counters = (path: number[] = []) => ({ expanded, scanned, jumpPoints: found, open: open.length, path: path.length ? path.length - 1 : "—", pathUnit: path.length ? { en: "cells", pt: "células" } : "", walls: `${n}%` });
  const refreshFrontier = () => {
    frontier.clear();
    open.forEach((k) => frontier.add(k));
  };
  // Cells scanned while jumping are shown as visited; jump points are the frontier, so expanded counts only real pops.
  const scan = (k: number) => {
    if (!visited.has(k)) scanned++;
    visited.add(k);
  };
  const forced = (r: number, c: number, dr: number, dc: number) => {
    if (dr === 0) return (walkable(r - 1, c) && !walkable(r - 1, c - dc)) || (walkable(r + 1, c) && !walkable(r + 1, c - dc));
    return (walkable(r, c - 1) && !walkable(r - dr, c - 1)) || (walkable(r, c + 1) && !walkable(r - dr, c + 1));
  };
  const jump = (from: number, dr: number, dc: number): number | null => {
    const [r, c] = at(from);
    const nr = r + dr;
    const nc = c + dc;
    if (!walkable(nr, nc)) return null;
    const next = key(nr, nc);
    scan(next);
    if (next === goalKey || forced(nr, nc, dr, dc)) return next;
    if (dr !== 0 && (jump(next, 0, 1) !== null || jump(next, 0, -1) !== null)) return next;
    return jump(next, dr, dc);
  };
  const directionsFrom = (k: number): Cell[] => {
    const from = parent.get(k);
    if (from === undefined) return DIRS;
    const [r, c] = at(k);
    const [pr, pc] = at(from);
    const dr = Math.sign(r - pr);
    const dc = Math.sign(c - pc);
    // Straight on, always; sideways only when forced past an obstacle; a vertical run may also turn either way.
    const result: Cell[] = [[dr, dc]];
    if (dr !== 0) result.push([0, 1], [0, -1]);
    else {
      if (walkable(r - 1, c) && !walkable(r - 1, c - dc)) result.push([-1, 0]);
      if (walkable(r + 1, c) && !walkable(r + 1, c - dc)) result.push([1, 0]);
    }
    return result;
  };

  refreshFrontier();
  push(2, { en: `Start at ${label(startKey)}, goal at ${label(goalKey)}. Instead of expanding every neighbour, JPS jumps along straight runs until something interesting.`, pt: `Início em ${label(startKey)}, destino em ${label(goalKey)}. Em vez de expandir todo vizinho, o JPS salta em linha reta até algo interessante.` }, counters(), -1);
  while (open.length) {
    let best = 0;
    open.forEach((k, i) => {
      if (gmap.get(k)! + manhattan(k, goalKey) < gmap.get(open[best])! + manhattan(open[best], goalKey)) best = i;
    });
    const current = open.splice(best, 1)[0];
    expanded++;
    refreshFrontier();
    push(4, { en: `Pop the jump point ${label(current)}, distance ${gmap.get(current)}, lowest distance + heuristic.`, pt: `Retira o ponto de salto ${label(current)}, distância ${gmap.get(current)}, menor distância + heurística.` }, counters(), current);
    if (current === goalKey) break;
    for (const [dr, dc] of directionsFrom(current)) {
      const before = scanned;
      const point = jump(current, dr, dc);
      const direction = dr === 1 ? "down" : dr === -1 ? "up" : dc === 1 ? "right" : "left";
      const directionPt = dr === 1 ? "para baixo" : dr === -1 ? "para cima" : dc === 1 ? "para a direita" : "para a esquerda";
      if (point === null) {
        push(7, { en: `Jump ${direction} from ${label(current)}: ${scanned - before} cells scanned, then a wall or the edge. Nothing there.`, pt: `Salto ${directionPt} de ${label(current)}: ${scanned - before} células varridas, depois uma parede ou a borda. Nada ali.` }, counters(), current);
        continue;
      }
      const candidate = gmap.get(current)! + manhattan(current, point);
      if (candidate >= (gmap.get(point) ?? Infinity)) {
        push(7, { en: `Jump ${direction}: reached ${label(point)} again, no shorter than before.`, pt: `Salto ${directionPt}: chegou de novo em ${label(point)}, não mais curto que antes.` }, counters(), current);
        continue;
      }
      gmap.set(point, candidate);
      parent.set(point, current);
      open.push(point);
      if (!jumpPoints.has(point)) {
        jumpPoints.add(point);
        found++;
      }
      refreshFrontier();
      push(11, { en: `Jump ${direction}: ${scanned - before} cells scanned to the jump point ${label(point)}${point === goalKey ? ", the goal" : ", where a wall forces a turn"}. Open it with distance ${candidate}.`, pt: `Salto ${directionPt}: ${scanned - before} células varridas até o ponto de salto ${label(point)}${point === goalKey ? ", o destino" : ", onde uma parede força uma curva"}. Abre com distância ${candidate}.` }, counters(), current);
    }
  }
  if (parent.has(goalKey) || startKey === goalKey) {
    const waypoints: number[] = [];
    for (let k: number | undefined = goalKey; k !== undefined; k = parent.get(k)) waypoints.push(k);
    waypoints.reverse();
    const path = rasterize(s, waypoints);
    for (let i = 2; i <= waypoints.length; i++) push(5, { en: `Follow the jump points back: ${waypoints.length} of them, joined by straight runs.`, pt: `Segue os pontos de salto de volta: ${waypoints.length}, ligados por trechos retos.` }, counters(rasterize(s, waypoints.slice(0, i))), -1, rasterize(s, waypoints.slice(0, i)));
    push(5, { en: `Done. Path of ${path.length - 1} steps through ${waypoints.length} jump points; ${expanded} pops against the hundreds A* would need on this maze.`, pt: `Pronto. Caminho de ${path.length - 1} passos por ${waypoints.length} pontos de salto; ${expanded} retiradas contra as centenas que o A* precisaria neste labirinto.` }, counters(path), -1, path);
  } else push(15, { en: `The open set is empty: no path exists.`, pt: `O conjunto aberto está vazio: não existe caminho.` }, counters(), -1);
  return { steps, meta: s.meta({ en: "4-connected", pt: "4 vizinhos" }) };
};
