// Models
import type { Localized } from "@/core/models/translations";
// Utils
import type { Counter, Recording, StepBase } from "../recording";

// `level` is the install layer (0 = no dependencies); x and y are unit coordinates for the stage.
export type Pkg = { id: number; name: string; level: number; x: number; y: number };
// `from` depends on `to`.
export type DepEdge = { id: number; from: number; to: number };
export type NpmGraph = { pkgs: Pkg[]; edges: DepEdge[] };
export type PkgMark = "queue" | "cur" | "done" | "stuck";
export type NpmStep = StepBase & { graph: NpmGraph; marks: Map<number, PkgMark>; edgeMarks: Map<number, "done" | "cycle">; order: number[]; queue: number[]; indeg: number[]; log: string[] };

export const DEFAULT_PACKAGES = `my-app: next, react, react-dom, zustand, tailwindcss, eslint
next: react, react-dom, postcss, styled-jsx
react-dom: react, scheduler
styled-jsx: react
zustand: react, use-sync-external-store
use-sync-external-store: react
tailwindcss: postcss, picocolors
eslint: espree, debug
espree: acorn`;

export const CYCLE_LINE = "react: my-app";

// One package per line: `name: dep, dep`. Packages that only appear as dependencies get a node too.
export function parsePackages(text: string): NpmGraph {
  const ids = new Map<string, number>();
  const names: string[] = [];
  const idOf = (name: string) => {
    if (!ids.has(name)) {
      ids.set(name, names.length);
      names.push(name);
    }
    return ids.get(name)!;
  };
  const edges: DepEdge[] = [];
  text.split("\n").forEach((line) => {
    const colon = line.indexOf(":");
    const head = (colon < 0 ? line : line.slice(0, colon)).trim();
    if (!head) return;
    const from = idOf(head);
    (colon < 0 ? "" : line.slice(colon + 1))
      .split(/[,\s]+/)
      .filter(Boolean)
      .forEach((dep) => {
        const to = idOf(dep);
        if (to !== from && !edges.some((edge) => edge.from === from && edge.to === to)) edges.push({ id: edges.length, from, to });
      });
  });
  // Layers by a dry run of Kahn: a package sits one column right of its deepest dependency; stranded ones go to the far right.
  const indeg = names.map(() => 0);
  edges.forEach((edge) => indeg[edge.from]++);
  const level = names.map(() => -1);
  const queue = names.map((_, id) => id).filter((id) => indeg[id] === 0);
  const pending = [...indeg];
  while (queue.length) {
    const id = queue.shift()!;
    level[id] = Math.max(0, ...edges.filter((edge) => edge.from === id).map((edge) => level[edge.to] + 1));
    edges.filter((edge) => edge.to === id).forEach((edge) => {
      if (--pending[edge.from] === 0) queue.push(edge.from);
    });
  }
  const deepest = Math.max(0, ...level);
  const stranded = level.some((value) => value < 0);
  level.forEach((value, id) => {
    if (value < 0) level[id] = deepest + 1;
  });
  const columns = deepest + 1 + (stranded ? 1 : 0);
  const rows = names.map(() => 0);
  const perColumn = new Map<number, number>();
  names.forEach((_, id) => {
    rows[id] = perColumn.get(level[id]) ?? 0;
    perColumn.set(level[id], rows[id] + 1);
  });
  const pkgs: Pkg[] = names.map((name, id) => ({ id, name, level: level[id], x: (level[id] + 0.5) / columns, y: (rows[id] + 0.5) / perColumn.get(level[id])! }));
  return { pkgs, edges };
}

export function recordNpmOrder(graph: NpmGraph): Recording<NpmStep> {
  const { pkgs, edges } = graph;
  const steps: NpmStep[] = [];
  const marks = new Map<number, PkgMark>();
  const edgeMarks = new Map<number, "done" | "cycle">();
  const indeg = pkgs.map(() => 0);
  edges.forEach((edge) => indeg[edge.from]++);
  const order: number[] = [];
  const queue: number[] = [];
  const log: string[] = ["$ npm install", `resolving ${pkgs.length} packages, ${edges.length} dependency links`];
  let cycle = "—";
  const name = (id: number) => pkgs[id].name;
  const counters = (): Record<string, Counter> => ({ packages: pkgs.length, edges: edges.length, installed: order.length, installedUnit: `/ ${pkgs.length}`, queue: queue.length, cycle });
  const push = (line: number, note: Localized) => steps.push({ graph, marks: new Map(marks), edgeMarks: new Map(edgeMarks), order: [...order], queue: [...queue], indeg: [...indeg], log: [...log], line, note, counters: counters() });

  push(2, { en: `${pkgs.length} packages, ${edges.length} dependency links. Each package's in-degree is the number of dependencies still not installed.`, pt: `${pkgs.length} pacotes, ${edges.length} ligações de dependência. O grau de entrada de cada pacote é o número de dependências ainda não instaladas.` });
  pkgs.forEach((pkg) => {
    if (indeg[pkg.id]) return;
    queue.push(pkg.id);
    marks.set(pkg.id, "queue");
  });
  push(4, { en: `Packages with no dependencies can be installed right away: ${queue.map(name).join(", ") || "none"} go into the queue.`, pt: `Pacotes sem dependências podem ser instalados de imediato: ${queue.map(name).join(", ") || "nenhum"} entram na fila.` });
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    marks.set(id, "cur");
    log.push(`added ${name(id)}`);
    const freed: number[] = [];
    edges.forEach((edge) => {
      if (edge.to !== id) return;
      indeg[edge.from]--;
      edgeMarks.set(edge.id, "done");
      if (indeg[edge.from] === 0) {
        freed.push(edge.from);
        queue.push(edge.from);
        marks.set(edge.from, "queue");
      }
    });
    push(8, { en: `Install ${name(id)} (position ${order.length}). ${freed.length ? `${freed.map(name).join(", ")} now ${freed.length === 1 ? "has" : "have"} every dependency installed and join${freed.length === 1 ? "s" : ""} the queue.` : "No package was waiting only for it."}`, pt: `Instala ${name(id)} (posição ${order.length}). ${freed.length ? `${freed.map(name).join(", ")} agora ${freed.length === 1 ? "tem" : "têm"} toda dependência instalada e entra${freed.length === 1 ? "" : "m"} na fila.` : "Nenhum pacote esperava só por ele."}` });
    marks.set(id, "done");
  }
  const stuck = pkgs.filter((pkg) => !order.includes(pkg.id)).map((pkg) => pkg.id);
  if (stuck.length) {
    // Follow unmet dependencies among the stranded packages until one repeats: that loop is the cycle to report.
    const trail: number[] = [stuck[0]];
    while (true) {
      const last = trail[trail.length - 1];
      const next = edges.find((edge) => edge.from === last && stuck.includes(edge.to))!.to;
      const at = trail.indexOf(next);
      if (at >= 0) {
        trail.splice(0, at);
        trail.push(next);
        break;
      }
      trail.push(next);
    }
    for (let i = 1; i < trail.length; i++) edgeMarks.set(edges.find((edge) => edge.from === trail[i - 1] && edge.to === trail[i])!.id, "cycle");
    stuck.forEach((id) => marks.set(id, "stuck"));
    cycle = trail.map(name).join(" → ");
    log.push(`npm ERR! code ELOOP`, `npm ERR! dependency cycle: ${cycle}`);
    push(14, { en: `The queue is empty but ${stuck.length} package${stuck.length === 1 ? "" : "s"} never reached in-degree 0: ${cycle}. Each is waiting for the other, so no install order exists; npm reports the cycle.`, pt: `A fila está vazia mas ${stuck.length} pacote${stuck.length === 1 ? "" : "s"} nunca chegou a grau de entrada 0: ${cycle}. Cada um espera pelo outro, então não existe ordem de instalação; o npm reporta o ciclo.` });
  } else {
    log.push(`added ${order.length} packages`);
    push(14, { en: `Done: ${order.map(name).join(" → ")}. Every package comes after all of its dependencies.`, pt: `Pronto: ${order.map(name).join(" → ")}. Todo pacote vem depois de todas as suas dependências.` });
  }
  const meta: Localized = { en: `${pkgs.length} packages · ${edges.length} links · ${steps.length} steps`, pt: `${pkgs.length} pacotes · ${edges.length} ligações · ${steps.length} passos` };
  return { steps, meta };
}
