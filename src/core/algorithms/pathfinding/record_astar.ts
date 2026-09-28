// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import { gridSearch, makeGrid, type Grid, type GridState } from "./grid_search";

export type AstarStep = GridState & { expanded: number; pushed: number; pathLen: number; note: Localized };

export type AstarRecording = { steps: AstarStep[]; grid: Grid };

export function recordAstar(cols: number, rows: number, seed: number, density = 0.28): AstarRecording {
  const rand = seeded(seed);
  const grid = makeGrid(cols, rows, density, rand);
  const goalKey = cols * grid.e[0] + grid.e[1];
  const steps: AstarStep[] = [];
  let expanded = 0;
  let pushed = 0;

  for (const s of gridSearch(grid, "astar")) {
    if (s.line === 5) expanded++;
    if (s.line === 11) pushed++;
    const r = Math.floor(s.cur / cols);
    const c = s.cur % cols;
    const goalG = (s.gmap.get(goalKey) ?? 0) + 1;
    const note: Localized =
      s.line === 2
        ? { en: `Start at (${grid.s[0]}, ${grid.s[1]}), goal at (${grid.e[0]}, ${grid.e[1]}). The open set holds only the start.`, pt: `Início em (${grid.s[0]}, ${grid.s[1]}), destino em (${grid.e[0]}, ${grid.e[1]}). O conjunto aberto só tem o início.` }
        : s.line === 5
          ? { en: `Pop the open cell with the lowest f = g + h: (${r}, ${c}), g = ${s.gmap.get(s.cur)}. It becomes closed.`, pt: `Retira do aberto a célula com menor f = g + h: (${r}, ${c}), g = ${s.gmap.get(s.cur)}. Ela vira fechada.` }
          : s.line === 11
            ? { en: `Relax the neighbours of (${r}, ${c}): cheaper ones get a new g and enter the open set with priority g + h.`, pt: `Relaxa os vizinhos de (${r}, ${c}): os mais baratos recebem novo g e entram no aberto com prioridade g + h.` }
            : s.path.length && s.path.length < goalG
              ? { en: "Goal reached. Walking parents back to the start draws the shortest path.", pt: "Destino alcançado. Seguir os pais de volta ao início desenha o caminho mínimo." }
              : s.path.length
                ? { en: `Done. Path length ${s.path.length - 1}, ${expanded} cells expanded out of ${rows * cols}.`, pt: `Pronto. Caminho de ${s.path.length - 1}, ${expanded} células expandidas de ${rows * cols}.` }
                : { en: "Goal reached.", pt: "Destino alcançado." };
    steps.push({ ...s, expanded, pushed, pathLen: s.path.length ? s.path.length - 1 : 0, note });
  }
  return { steps, grid };
}
