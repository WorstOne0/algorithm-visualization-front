// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Recorder, StepBase } from "../recording";
import { getRoadMap, pickRoute, straightLine, streetOf, type RoadMap } from "./road_map";
import { pathMetres, roadSearch, type RoadAlgo } from "./road_search";

// closedUpTo counts entries of `order` (shared by every step of one recording) that are closed at this step.
export type RoadStep = StepBase & { map: RoadMap | null; start: number; goal: number; order: number[]; parent: Int32Array; closedUpTo: number; open: number[]; cur: number; path: number[] };

// About this many player steps per run, whatever the route length; each step closes `stride` intersections.
const TARGET_STEPS = 160;

const km = (metres: number) => (metres >= 1000 ? `${(metres / 1000).toFixed(2)} km` : `${Math.round(metres)} m`);

const POP: Record<RoadAlgo, Localized> = {
  bfs: { en: "Dequeue the oldest open intersection", pt: "Retira da fila o cruzamento aberto mais antigo" },
  dijkstra: { en: "Pop the open intersection with the shortest distance so far", pt: "Retira o cruzamento aberto de menor distância até aqui" },
  astar: { en: "Pop the open intersection with the lowest distance + straight line to the goal", pt: "Retira o cruzamento aberto de menor distância + linha reta ao destino" },
};

const LOADING: Localized = { en: "Loading the street map…", pt: "Carregando o mapa de ruas…" };

// One recorder per strategy; the slider is the straight-line distance between start and goal in hundreds of metres.
export const roadRecorder = (algo: RoadAlgo): Recorder => (n, seed) => {
  const map = getRoadMap();
  if (!map) {
    const step: RoadStep = { map: null, start: -1, goal: -1, order: [], parent: new Int32Array(0), closedUpTo: 0, open: [], cur: -1, path: [], line: 1, note: LOADING, counters: {} };
    return { steps: [step], meta: LOADING };
  }
  const rand = seeded(seed);
  const [start, goal] = pickRoute(map, n * 100, rand);
  const straight = straightLine(map, start, goal);
  const total = [...roadSearch(map, algo, start, goal)].length;
  const stride = Math.max(1, Math.ceil(total / TARGET_STEPS));
  const steps: RoadStep[] = [];
  const at = (node: number) => streetOf(map, node) ?? `#${node}`;
  const counters = (state: { order: number[]; open: number[]; dist: Float64Array; cur: number; path: number[] }) => ({
    expanded: state.order.length,
    expandedUnit: `/ ${map.component.length}`,
    open: state.open.length,
    distance: algo === "bfs" ? `${state.dist[state.cur]} hops` : km(state.dist[state.cur]),
    path: state.path.length ? km(pathMetres(map, state.path)) : "—",
    straight: km(straight),
  });

  let index = 0;
  for (const state of roadSearch(map, algo, start, goal)) {
    index++;
    const isFirst = index === 1;
    if (!isFirst && !state.done && index % stride !== 0) continue;
    const note: Localized = isFirst
      ? { en: `Start on ${at(start)}, goal on ${at(goal)}: ${km(straight)} apart in a straight line. The open set holds only the start.`, pt: `Início na ${at(start)}, destino na ${at(goal)}: ${km(straight)} em linha reta. O conjunto aberto só tem o início.` }
      : state.done
        ? { en: `Goal reached on ${at(goal)}. Following parents back draws a route of ${km(pathMetres(map, state.path))} along ${state.path.length - 1} segments; ${state.order.length} of ${map.component.length} intersections were expanded.`, pt: `Destino alcançado na ${at(goal)}. Seguir os pais de volta desenha uma rota de ${km(pathMetres(map, state.path))} por ${state.path.length - 1} trechos; ${state.order.length} de ${map.component.length} cruzamentos foram expandidos.` }
        : { en: `${POP[algo].en}: on ${at(state.cur)}, ${algo === "bfs" ? `${state.dist[state.cur]} hops` : km(state.dist[state.cur])} from the start. ${stride > 1 ? `${stride} intersections closed in this step.` : ""}`, pt: `${POP[algo].pt}: na ${at(state.cur)}, a ${algo === "bfs" ? `${state.dist[state.cur]} saltos` : km(state.dist[state.cur])} do início. ${stride > 1 ? `${stride} cruzamentos fechados neste passo.` : ""}` };
    steps.push({ map, start, goal, order: state.order, parent: state.parent, closedUpTo: state.order.length, open: state.open, cur: state.cur, path: state.path, line: isFirst ? 2 : state.done ? 6 : 5, note, counters: counters(state) });
  }
  const meta: Localized = { en: `${map.city} · ${km(straight)} straight · seed ${seed} · ${steps.length} steps`, pt: `${map.city} · ${km(straight)} em linha reta · seed ${seed} · ${steps.length} passos` };
  return { steps, meta };
};
