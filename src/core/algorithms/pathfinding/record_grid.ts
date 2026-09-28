// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Recorder, StepBase } from "../recording";
import { gridSearch, makeGrid, type GridState, type PathAlgo } from "./grid_search";

export type GridStep = StepBase & GridState;

// The maze is always 44×20; the size slider sets the wall density in percent.
export const MAZE_COLS = 44;
export const MAZE_ROWS = 20;

// What each search calls the cell it takes out of the open set, for the line-5 note.
const POP: Record<PathAlgo, Localized> = {
  bfs: { en: "Dequeue the oldest open cell", pt: "Retira a célula aberta mais antiga da fila" },
  dfs: { en: "Pop the newest open cell", pt: "Retira a célula aberta mais recente da pilha" },
  greedy: { en: "Pop the open cell closest to the goal by h", pt: "Retira a célula aberta mais próxima do destino por h" },
  dijkstra: { en: "Pop the open cell with the lowest cost g", pt: "Retira a célula aberta de menor custo g" },
  astar: { en: "Pop the open cell with the lowest f = g + h", pt: "Retira a célula aberta de menor f = g + h" },
};

const RELAX: Record<PathAlgo, Localized> = {
  bfs: { en: "enqueue every unvisited neighbour at distance g + 1", pt: "enfileira cada vizinho não visitado à distância g + 1" },
  dfs: { en: "push every unvisited neighbour onto the stack", pt: "empilha cada vizinho não visitado" },
  greedy: { en: "add every unvisited neighbour, ranked by h alone", pt: "adiciona cada vizinho não visitado, ordenado só por h" },
  dijkstra: { en: "cheaper neighbours get a new g and enter the open set by g", pt: "vizinhos mais baratos recebem novo g e entram no aberto por g" },
  astar: { en: "cheaper neighbours get a new g and enter the open set with priority g + h", pt: "vizinhos mais baratos recebem novo g e entram no aberto com prioridade g + h" },
};

// Builds the recorder for one grid strategy; `mud` adds expensive cells so cost and steps differ.
export const gridRecorder = (algo: PathAlgo, mud = false): Recorder => (n, seed) => {
  const rand = seeded(seed);
  const grid = makeGrid(MAZE_COLS, MAZE_ROWS, n / 100, rand, mud);
  const goalKey = MAZE_COLS * grid.e[0] + grid.e[1];
  const steps: GridStep[] = [];
  let expanded = 0;
  let pushed = 0;

  for (const s of gridSearch(grid, algo)) {
    if (s.line === 5) expanded++;
    if (s.line === 11) pushed++;
    const r = Math.floor(s.cur / MAZE_COLS);
    const c = s.cur % MAZE_COLS;
    const goalG = (s.gmap.get(goalKey) ?? 0) + 1;
    const pathLen = s.path.length ? s.path.length - 1 : 0;
    const note: Localized =
      s.line === 2
        ? { en: `Start at (${grid.s[0]}, ${grid.s[1]}), goal at (${grid.e[0]}, ${grid.e[1]}). The open set holds only the start.`, pt: `Início em (${grid.s[0]}, ${grid.s[1]}), destino em (${grid.e[0]}, ${grid.e[1]}). O conjunto aberto só tem o início.` }
        : s.line === 5
          ? { en: `${POP[algo].en}: (${r}, ${c}), distance = ${s.gmap.get(s.cur)}. It becomes closed.`, pt: `${POP[algo].pt}: (${r}, ${c}), distance = ${s.gmap.get(s.cur)}. Ela vira fechada.` }
          : s.line === 11
            ? { en: `Look at the neighbours of (${r}, ${c}): ${RELAX[algo].en}.`, pt: `Olha os vizinhos de (${r}, ${c}): ${RELAX[algo].pt}.` }
            : s.path.length && s.path.length < goalG
              ? { en: "Goal reached. Walking parents back to the start draws the path.", pt: "Destino alcançado. Seguir os pais de volta ao início desenha o caminho." }
              : s.path.length
                ? { en: `Done. Path of ${pathLen} steps, cost ${s.gmap.get(goalKey)}, ${expanded} cells expanded out of ${MAZE_COLS * MAZE_ROWS}.`, pt: `Pronto. Caminho de ${pathLen} passos, custo ${s.gmap.get(goalKey)}, ${expanded} células expandidas de ${MAZE_COLS * MAZE_ROWS}.` }
                : { en: "Goal reached.", pt: "Destino alcançado." };
    steps.push({ ...s, note, counters: { expanded, open: s.frontier.size, pushed, path: pathLen || "—", pathUnit: pathLen ? { en: "cells", pt: "células" } : "", cost: s.path.length ? (s.gmap.get(goalKey) ?? 0) : "—", walls: `${n}%` } });
  }
  if (!steps.length) return { steps, meta: { en: "", pt: "" } };
  const meta: Localized = { en: `${MAZE_COLS}×${MAZE_ROWS} · ${n}% walls · seed ${seed} · ${steps.length} steps`, pt: `${MAZE_COLS}×${MAZE_ROWS} · ${n}% paredes · seed ${seed} · ${steps.length} passos` };
  return { steps, meta };
};
