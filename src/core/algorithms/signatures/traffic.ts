// Models
import type { Localized } from "@/core/models/translations";
// Utils
import type { RoadStep } from "../pathfinding/record_road";
import { getRoadMap, pickRoute, streetOf, type RoadEdge, type RoadMap } from "../pathfinding/road_map";
import { roadSearch } from "../pathfinding/road_search";
import { seeded } from "../random";
import type { Counter, Recording, Route } from "../recording";

// `factors` is the slowdown per edge (1 = free flow); `reference` is the route by distance, drawn beside the route by time.
export type TrafficStep = RoadStep & { factors: Float32Array; reference: number[] };

const TARGET_STEPS = 140;
const ROUTE_METRES = 2200;
const FREE_FLOW_KMH = 40;

const minutesOf = (metres: number) => (metres / 1000 / FREE_FLOW_KMH) * 60;
const km = (metres: number) => `${(metres / 1000).toFixed(2)} km`;
const min = (minutes: number) => `${minutes.toFixed(1)} min`;

const edgeBetween = (map: RoadMap, a: number, b: number) => map.out[a].map((id) => map.edges[id]).find((edge) => edge.a === b || edge.b === b) ?? null;

function routeStats(map: RoadMap, path: number[], factors: Float32Array) {
  let metres = 0;
  let cost = 0;
  const jammed: string[] = [];
  for (let i = 1; i < path.length; i++) {
    const edge = edgeBetween(map, path[i - 1], path[i]);
    if (!edge) continue;
    metres += edge.length;
    cost += edge.length * factors[edge.id];
    if (factors[edge.id] > 1 && edge.name >= 0 && !jammed.includes(map.names[edge.name])) jammed.push(map.names[edge.name]);
  }
  return { metres, minutes: minutesOf(cost), jammed };
}

// A share of the named streets, chosen by seed, slows down between 1.6× and 3.5×; every segment of a street shares its factor.
export function makeTraffic(map: RoadMap, share: number, seed: number) {
  const rand = seeded(seed * 7919 + 17);
  const perStreet = map.names.map(() => (rand() < share ? 1.6 + rand() * 1.9 : 1));
  const factors = new Float32Array(map.edges.length).fill(1);
  map.edges.forEach((edge) => {
    if (edge.name >= 0) factors[edge.id] = perStreet[edge.name];
  });
  return { factors, jammedStreets: perStreet.filter((factor) => factor > 1).length };
}

const LOADING: Localized = { en: "Loading the street map…", pt: "Carregando o mapa de ruas…" };

// `share` is the fraction of streets jammed (0–1) and `trafficSeed` picks which; the route comes from `seed` unless the visitor clicked one.
export function recordTraffic(share: number, seed: number, trafficSeed: number, route: Route | null): Recording<TrafficStep> {
  const map = getRoadMap();
  const empty = { order: [] as number[], parent: new Int32Array(0), closedUpTo: 0, open: [] as number[], cur: -1, path: [] as number[], reference: [] as number[], line: 1 };
  if (!map) return { steps: [{ ...empty, map: null, start: -1, goal: -1, factors: new Float32Array(0), note: LOADING, counters: {} }], meta: LOADING };
  const { factors, jammedStreets } = makeTraffic(map, share, trafficSeed);
  const jammedText = `${Math.round((jammedStreets / map.names.length) * 100)}%`;
  if (route && route.to === null) {
    const note: Localized = { en: `Start placed on ${streetOf(map, route.from) ?? "an unnamed street"}. Now click the goal.`, pt: `Início colocado na ${streetOf(map, route.from) ?? "rua sem nome"}. Agora clique no destino.` };
    return { steps: [{ ...empty, map, start: route.from, goal: -1, factors, note, counters: { expanded: 0, timeMin: "—", distMin: "—", saved: "—", jammed: jammedText } }], meta: { en: `${map.city} · click the goal`, pt: `${map.city} · clique no destino` } };
  }
  const rand = seeded(seed);
  const [start, goal] = route && route.to !== null ? [route.from, route.to] : pickRoute(map, ROUTE_METRES, rand);
  const byTime = (edge: RoadEdge) => edge.length * factors[edge.id];
  const states = [...roadSearch(map, "dijkstra", start, goal, byTime)];
  const distanceRun = [...roadSearch(map, "dijkstra", start, goal)];
  const reference = distanceRun[distanceRun.length - 1]?.path ?? [];
  const shortest = routeStats(map, reference, factors);
  const stride = Math.max(1, Math.ceil(states.length / TARGET_STEPS));
  const at = (node: number) => streetOf(map, node) ?? "?";
  const steps: TrafficStep[] = [];
  const counters = (state: (typeof states)[number], fastest: ReturnType<typeof routeStats> | null): Record<string, Counter> => ({
    expanded: state.order.length,
    expandedUnit: `/ ${map.component.length}`,
    timeMin: fastest ? min(fastest.minutes) : "—",
    timeKm: fastest ? km(fastest.metres) : "",
    distMin: min(shortest.minutes),
    distKm: km(shortest.metres),
    saved: fastest ? min(shortest.minutes - fastest.minutes) : "—",
    jammed: jammedText,
  });

  states.forEach((state, index) => {
    const isFirst = index === 0;
    if (!isFirst && !state.done && (index + 1) % stride !== 0) return;
    const fastest = state.done ? routeStats(map, state.path, factors) : null;
    const avoided = fastest ? shortest.jammed.filter((street) => !fastest.jammed.includes(street)) : [];
    const note: Localized = isFirst
      ? { en: `${jammedText} of the streets are jammed (amber). Start on ${at(start)}, goal on ${at(goal)}. The shortest route by distance takes ${min(shortest.minutes)} through ${shortest.jammed.length} jammed street${shortest.jammed.length === 1 ? "" : "s"}; now search by time instead.`, pt: `${jammedText} das ruas estão travadas (âmbar). Início na ${at(start)}, destino na ${at(goal)}. A rota mais curta por distância leva ${min(shortest.minutes)} passando por ${shortest.jammed.length} rua${shortest.jammed.length === 1 ? "" : "s"} travada${shortest.jammed.length === 1 ? "" : "s"}; agora busca por tempo.` }
      : state.done && fastest
        ? { en: `Goal reached. Fastest route: ${km(fastest.metres)} in ${min(fastest.minutes)}, against ${km(shortest.metres)} in ${min(shortest.minutes)} for the shortest one: ${min(shortest.minutes - fastest.minutes)} saved${avoided.length ? ` by avoiding ${avoided.slice(0, 3).join(", ")}` : ""}. ${state.order.length} intersections expanded.`, pt: `Destino alcançado. Rota mais rápida: ${km(fastest.metres)} em ${min(fastest.minutes)}, contra ${km(shortest.metres)} em ${min(shortest.minutes)} da mais curta: ${min(shortest.minutes - fastest.minutes)} economizados${avoided.length ? ` evitando ${avoided.slice(0, 3).join(", ")}` : ""}. ${state.order.length} cruzamentos expandidos.` }
        : { en: `Pop the open intersection with the shortest time so far: on ${at(state.cur)}, ${min(minutesOf(state.dist[state.cur]))} from the start.${stride > 1 ? ` ${stride} intersections closed in this step.` : ""}`, pt: `Retira o cruzamento aberto de menor tempo até aqui: na ${at(state.cur)}, a ${min(minutesOf(state.dist[state.cur]))} do início.${stride > 1 ? ` ${stride} cruzamentos fechados neste passo.` : ""}` };
    steps.push({ map, start, goal, order: state.order, parent: state.parent, closedUpTo: state.order.length, open: state.open, cur: state.cur, path: state.path, factors, reference, line: isFirst ? 2 : state.done ? 6 : 5, note, counters: counters(state, fastest) });
  });
  const origin = route ? { en: "your route", pt: "sua rota" } : { en: `seed ${seed}`, pt: `seed ${seed}` };
  const meta: Localized = { en: `${map.city} · ${jammedText} jammed · ${origin.en} · ${steps.length} steps`, pt: `${map.city} · ${jammedText} travado · ${origin.pt} · ${steps.length} passos` };
  return { steps, meta };
}
