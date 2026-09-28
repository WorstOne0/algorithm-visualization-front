// Fetches a city's drivable streets from OpenStreetMap (Overpass) and writes the compact road graph the
// real-map pages load: node coordinates in 1e-5° steps from the bbox corner, one edge per way segment.
//   node scripts/build_map.mjs            fetches from Overpass
//   node scripts/build_map.mjs raw.json   reuses a saved Overpass response
import { readFileSync, writeFileSync } from "node:fs";

const CITY = { name: "Cascavel", country: "BR", bbox: [-24.9775, -53.48, -24.9325, -53.43] };
const HIGHWAYS = "primary|secondary|tertiary|residential|unclassified|living_street|primary_link|secondary_link|tertiary_link|trunk|trunk_link";
const CLASSES = { trunk: 0, trunk_link: 0, primary: 0, primary_link: 0, secondary: 1, secondary_link: 1, tertiary: 2, tertiary_link: 2 };
const OUT = new URL("../public/data/cascavel.json", import.meta.url);

async function fetchRaw() {
  const [south, west, north, east] = CITY.bbox;
  const query = `[out:json][timeout:120];way["highway"~"^(${HIGHWAYS})$"](${south},${west},${north},${east});out body;>;out skel qt;`;
  const response = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", headers: { "User-Agent": "algorithm-atlas/0.1 (personal project)" }, body: new URLSearchParams({ data: query }) });
  if (!response.ok) throw new Error(`Overpass ${response.status}`);
  return response.json();
}

const meters = (a, b) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(h));
};

const raw = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], "utf8")) : await fetchRaw();
const coords = new Map(raw.elements.filter((element) => element.type === "node").map((node) => [node.id, { lat: node.lat, lon: node.lon }]));
const ways = raw.elements.filter((element) => element.type === "way" && element.nodes.length > 1);

const index = new Map();
const nodes = [];
const names = [];
const nameIndex = new Map();
const edges = [];
const [south, west] = CITY.bbox;

const nodeIndex = (id) => {
  if (!index.has(id)) {
    const { lat, lon } = coords.get(id);
    index.set(id, nodes.length / 2);
    nodes.push(Math.round((lon - west) * 1e5), Math.round((lat - south) * 1e5));
  }
  return index.get(id);
};

ways.forEach((way) => {
  const cls = CLASSES[way.tags.highway] ?? 3;
  const oneway = way.tags.oneway === "yes" || way.tags.oneway === "-1" ? 1 : 0;
  const refs = way.tags.oneway === "-1" ? [...way.nodes].reverse() : way.nodes;
  let name = -1;
  if (way.tags.name) {
    if (!nameIndex.has(way.tags.name)) {
      nameIndex.set(way.tags.name, names.length);
      names.push(way.tags.name);
    }
    name = nameIndex.get(way.tags.name);
  }
  for (let i = 1; i < refs.length; i++) {
    if (!coords.has(refs[i - 1]) || !coords.has(refs[i])) continue;
    edges.push(nodeIndex(refs[i - 1]), nodeIndex(refs[i]), Math.round(meters(coords.get(refs[i - 1]), coords.get(refs[i]))), cls, oneway, name);
  }
});

const output = { city: CITY.name, country: CITY.country, bbox: CITY.bbox, source: "OpenStreetMap contributors, ODbL", fetched: new Date().toISOString().slice(0, 10), names, nodes, edges };
writeFileSync(OUT, JSON.stringify(output));
console.log(`${CITY.name}: ${nodes.length / 2} nodes, ${edges.length / 6} edges, ${names.length} street names, ${(JSON.stringify(output).length / 1024).toFixed(0)} KB`);
