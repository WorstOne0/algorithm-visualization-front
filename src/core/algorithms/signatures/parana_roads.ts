// Models
import type { Localized } from "@/core/models/translations";
// Utils
import type { Counter, Recording, StepBase } from "../recording";

export type City = { id: number; name: string; lat: number; lon: number };
export type Road = { id: number; a: number; b: number; km: number };
export type RoadMark = "cur" | "used" | "rejected";
export type RoadsStep = StepBase & { cities: City[]; roads: Road[]; roadMarks: Map<number, RoadMark>; connected: Set<number>; sorted: number[]; position: number; total: number };

// Approximate coordinates of the city centres.
const CITIES: [string, number, number][] = [
  ["Curitiba", -25.4284, -49.2733],
  ["Londrina", -23.3045, -51.1696],
  ["Maringá", -23.4205, -51.9333],
  ["Ponta Grossa", -25.0916, -50.1668],
  ["Cascavel", -24.9578, -53.4595],
  ["Foz do Iguaçu", -25.5163, -54.5854],
  ["Guarapuava", -25.3935, -51.4562],
  ["Paranaguá", -25.5205, -48.5095],
  ["Toledo", -24.7246, -53.7412],
  ["Apucarana", -23.5508, -51.461],
  ["Umuarama", -23.7661, -53.325],
  ["Paranavaí", -23.073, -52.4653],
  ["Francisco Beltrão", -26.0811, -53.055],
  ["Pato Branco", -26.2292, -52.6706],
  ["Campo Mourão", -24.0459, -52.3783],
  ["Cianorte", -23.6633, -52.605],
  ["Telêmaco Borba", -24.3245, -50.616],
  ["Castro", -24.7911, -50.0119],
  ["Irati", -25.4672, -50.6511],
  ["União da Vitória", -26.2273, -51.0873],
  ["Cornélio Procópio", -23.181, -50.6468],
  ["Jacarezinho", -23.1608, -49.9691],
  ["Palmas", -26.4842, -51.9905],
  ["Laranjeiras do Sul", -25.4077, -52.4161],
  ["Pitanga", -24.7574, -51.7614],
];

const NEAREST = 3;

export const haversineKm = (a: City, b: City) => {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

// Candidate roads: every city to its nearest neighbours, plus the shortest links needed to make one network.
export function makeRoadNetwork() {
  const cities: City[] = CITIES.map(([name, lat, lon], id) => ({ id, name, lat, lon }));
  const roads: Road[] = [];
  const has = (a: number, b: number) => roads.some((road) => (road.a === a && road.b === b) || (road.a === b && road.b === a));
  const add = (a: number, b: number) => roads.push({ id: roads.length, a, b, km: Math.round(haversineKm(cities[a], cities[b])) });
  cities.forEach((city) => {
    cities
      .filter((other) => other.id !== city.id)
      .sort((p, q) => haversineKm(city, p) - haversineKm(city, q))
      .slice(0, NEAREST)
      .forEach((other) => {
        if (!has(city.id, other.id)) add(city.id, other.id);
      });
  });
  const parent = cities.map((city) => city.id);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  roads.forEach((road) => (parent[find(road.a)] = find(road.b)));
  while (true) {
    let best: [number, number] | null = null;
    for (let a = 0; a < cities.length; a++) for (let b = a + 1; b < cities.length; b++) if (find(a) !== find(b) && (!best || haversineKm(cities[a], cities[b]) < haversineKm(cities[best[0]], cities[best[1]]))) best = [a, b];
    if (!best) break;
    add(best[0], best[1]);
    parent[find(best[0])] = find(best[1]);
  }
  return { cities, roads };
}

export function recordParanaRoads(): Recording<RoadsStep> {
  const { cities, roads } = makeRoadNetwork();
  const steps: RoadsStep[] = [];
  const roadMarks = new Map<number, RoadMark>();
  const connected = new Set<number>();
  const sorted = [...roads].sort((p, q) => p.km - q.km || p.id - q.id).map((road) => road.id);
  const parent = cities.map((city) => city.id);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  let built = 0;
  let rejected = 0;
  let total = 0;
  let components = cities.length;
  let position = -1;
  const name = (id: number) => cities[id].name;
  const label = (road: Road) => `${name(road.a)} – ${name(road.b)} (${road.km} km)`;
  const counters = (): Record<string, Counter> => ({ cities: cities.length, candidates: roads.length, built, builtUnit: `/ ${cities.length - 1}`, km: total, rejected, components });
  const push = (line: number, note: Localized) => steps.push({ cities, roads, roadMarks: new Map(roadMarks), connected: new Set(connected), sorted, position, total, line, note, counters: counters() });

  push(2, { en: `${cities.length} cities and ${roads.length} candidate roads, each city linked to its ${NEAREST} nearest neighbours. Sort the roads by length: the shortest is ${label(roads[sorted[0]])}.`, pt: `${cities.length} cidades e ${roads.length} estradas candidatas, cada cidade ligada às ${NEAREST} vizinhas mais próximas. Ordena as estradas por comprimento: a mais curta é ${label(roads[sorted[0]])}.` });
  sorted.forEach((id, index) => {
    const road = roads[id];
    position = index;
    roadMarks.set(id, "cur");
    push(5, { en: `Road ${index + 1} of ${roads.length}: ${label(road)}.`, pt: `Estrada ${index + 1} de ${roads.length}: ${label(road)}.` });
    if (find(road.a) === find(road.b)) {
      rejected++;
      roadMarks.set(id, "rejected");
      push(6, { en: `${name(road.a)} and ${name(road.b)} are already connected by shorter roads: this one would only close a loop. Rejected.`, pt: `${name(road.a)} e ${name(road.b)} já estão conectadas por estradas mais curtas: esta só fecharia uma volta. Rejeitada.` });
      return;
    }
    parent[find(road.a)] = find(road.b);
    built++;
    total += road.km;
    components--;
    roadMarks.set(id, "used");
    connected.add(road.a);
    connected.add(road.b);
    push(8, { en: `Build it: ${name(road.a)} and ${name(road.b)} join. ${components} network${components === 1 ? "" : "s"} left, ${total} km of road so far.`, pt: `Constrói: ${name(road.a)} e ${name(road.b)} se juntam. ${components} rede${components === 1 ? "" : "s"} restante${components === 1 ? "" : "s"}, ${total} km de estrada até aqui.` });
  });
  position = -1;
  push(10, { en: `Done: ${built} roads, ${total} km, every city reachable from every other. ${rejected} candidates were rejected because a shorter path already existed.`, pt: `Pronto: ${built} estradas, ${total} km, toda cidade alcançável a partir de qualquer outra. ${rejected} candidatas foram rejeitadas porque um caminho mais curto já existia.` });
  const meta: Localized = { en: `${cities.length} cities · ${roads.length} candidate roads · ${steps.length} steps`, pt: `${cities.length} cidades · ${roads.length} estradas candidatas · ${steps.length} passos` };
  return { steps, meta };
}
