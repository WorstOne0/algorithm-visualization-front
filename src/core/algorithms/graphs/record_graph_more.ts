// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Recorder } from "../recording";
import { graphSession, type GraphData } from "./graph_model";

const withSteps = (meta: Localized, count: number): Localized => ({ en: `${meta.en} · ${count} steps`, pt: `${meta.pt} · ${count} passos` });
const show = (value: number) => (value === Infinity ? "∞" : String(value));

// Line numbers in every recorder mirror the listings in core/models/algorithms/graphs_more.ts.

export const recordBellmanFord: Recorder = (n, seed) => {
  const { graph, nodeMarks, edgeMarks, labels, steps, push, setAside, name, meta } = graphSession(n, seed, { weighted: true, directed: true, negative: true });
  const dist = graph.nodes.map(() => Infinity);
  const parentEdge = new Map<number, number>();
  dist[0] = 0;
  let round = 0;
  let relaxations = 0;
  let examined = 0;
  const negative = graph.edges.filter((edge) => edge.w < 0).length;
  const counters = () => ({ round, roundUnit: `/ ${n - 1}`, relaxations, examined, negative, reached: dist.filter((value) => value < Infinity).length });
  const relabel = () => graph.nodes.forEach((node) => labels.set(node.id, show(dist[node.id])));

  relabel();
  nodeMarks.set(0, "frontier");
  push(2, { en: `Source ${name(0)} gets distance 0, every other node ∞. ${negative} of the ${graph.edges.length} edges are negative: Dijkstra could not be trusted here.`, pt: `A origem ${name(0)} ganha distância 0, todo outro nó ∞. ${negative} das ${graph.edges.length} arestas são negativas: o Dijkstra não seria confiável aqui.` }, counters());
  for (round = 1; round < n; round++) {
    let changed = false;
    setAside(`round ${round}`);
    push(3, { en: `Round ${round} of at most ${n - 1}: relax every edge once, in list order.`, pt: `Rodada ${round} de no máximo ${n - 1}: relaxa toda aresta uma vez, na ordem da lista.` }, counters());
    for (const edge of graph.edges) {
      examined++;
      const candidate = dist[edge.u] + edge.w;
      edgeMarks.set(edge.id, "cur");
      if (candidate >= dist[edge.v]) {
        push(7, { en: `${name(edge.u)} → ${name(edge.v)} (${edge.w}): ${show(dist[edge.u])} + ${edge.w} is not below ${show(dist[edge.v])}. Skip.`, pt: `${name(edge.u)} → ${name(edge.v)} (${edge.w}): ${show(dist[edge.u])} + ${edge.w} não fica abaixo de ${show(dist[edge.v])}. Pula.` }, counters());
        edgeMarks.set(edge.id, parentEdge.get(edge.v) === edge.id ? "used" : "rejected");
        continue;
      }
      const previous = parentEdge.get(edge.v);
      if (previous !== undefined) edgeMarks.set(previous, "rejected");
      dist[edge.v] = candidate;
      parentEdge.set(edge.v, edge.id);
      relaxations++;
      changed = true;
      relabel();
      nodeMarks.set(edge.v, "frontier");
      push(8, { en: `${name(edge.u)} → ${name(edge.v)} (${edge.w}): ${show(dist[edge.u])} + ${edge.w} = ${candidate} < ${show(candidate === dist[edge.v] ? Infinity : dist[edge.v])}. Relax: dist(${name(edge.v)}) = ${candidate}.`, pt: `${name(edge.u)} → ${name(edge.v)} (${edge.w}): ${show(dist[edge.u])} + ${edge.w} = ${candidate}. Relaxa: dist(${name(edge.v)}) = ${candidate}.` }, counters());
      edgeMarks.set(edge.id, "used");
    }
    if (!changed) {
      push(10, { en: `Round ${round} changed nothing: every distance is final. Stop early.`, pt: `A rodada ${round} não mudou nada: toda distância é definitiva. Para cedo.` }, counters());
      break;
    }
  }
  round = Math.min(round, n - 1);
  setAside("");
  graph.nodes.forEach((node) => nodeMarks.set(node.id, dist[node.id] < Infinity ? "done" : "seen"));
  push(12, { en: `One more pass over the edges finds no improvement: no negative cycle is reachable.`, pt: `Mais uma passada pelas arestas não encontra melhora: nenhum ciclo negativo é alcançável.` }, counters());
  push(13, { en: `Done. ${relaxations} relaxations over ${examined} edge checks; the labels are the shortest distances from ${name(0)}, negative edges included.`, pt: `Pronto. ${relaxations} relaxamentos em ${examined} checagens de aresta; os rótulos são as distâncias mínimas a partir de ${name(0)}, arestas negativas incluídas.` }, counters());
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordFloydWarshall: Recorder = (n, seed) => {
  const { graph, nodeMarks, steps, push, name, meta } = graphSession(n, seed, { weighted: true, directed: true });
  const values: (number | null)[][] = graph.nodes.map((_, i) => graph.nodes.map((__, j) => (i === j ? 0 : null)));
  graph.edges.forEach((edge) => {
    values[edge.u][edge.v] = edge.w;
  });
  const labelsOf = graph.nodes.map((node) => node.label);
  let improvements = 0;
  let checks = 0;
  let pivot = -1;
  const reachable = () => values.flat().filter((value) => value !== null).length;
  const matrix = (hot?: [number, number]) => ({ labels: labelsOf, values: values.map((row) => [...row]), hot, pivot: pivot < 0 ? undefined : pivot });
  const counters = () => ({ pivot: pivot < 0 ? "—" : name(pivot), pivotUnit: `/ ${n}`, improvements, checks, reachable: reachable(), pairs: `${reachable()} / ${n * n}` });

  push(4, { en: `Start from the adjacency matrix: 0 on the diagonal, the edge weight where an edge exists, ∞ elsewhere.`, pt: `Começa pela matriz de adjacência: 0 na diagonal, o peso onde existe aresta, ∞ no resto.` }, counters(), { matrix: matrix() });
  for (pivot = 0; pivot < n; pivot++) {
    nodeMarks.clear();
    nodeMarks.set(pivot, "cur");
    push(5, { en: `Pivot ${name(pivot)}: may any pair get closer by passing through ${name(pivot)}?`, pt: `Pivô ${name(pivot)}: algum par fica mais perto passando por ${name(pivot)}?` }, counters(), { matrix: matrix() });
    for (let i = 0; i < n; i++) {
      const improved: string[] = [];
      let hot: [number, number] | undefined;
      for (let j = 0; j < n; j++) {
        checks++;
        const through = values[i][pivot] !== null && values[pivot][j] !== null ? values[i][pivot]! + values[pivot][j]! : null;
        if (through === null || (values[i][j] !== null && through >= values[i][j]!)) continue;
        values[i][j] = through;
        improvements++;
        improved.push(`${name(i)}→${name(j)} = ${through}`);
        hot = [i, j];
      }
      nodeMarks.set(i, i === pivot ? "cur" : "frontier");
      push(8, improved.length ? { en: `Row ${name(i)} through ${name(pivot)}: ${improved.join(", ")}.`, pt: `Linha ${name(i)} por ${name(pivot)}: ${improved.join(", ")}.` } : { en: `Row ${name(i)} through ${name(pivot)}: nothing gets shorter.`, pt: `Linha ${name(i)} por ${name(pivot)}: nada encurta.` }, counters(), { matrix: matrix(hot) });
      if (i !== pivot) nodeMarks.delete(i);
    }
  }
  pivot = -1;
  nodeMarks.clear();
  push(12, { en: `Done. ${improvements} improvements in ${checks} checks (n³ = ${n * n * n}); ${reachable()} of ${n * n} pairs are reachable and the matrix holds every shortest distance.`, pt: `Pronto. ${improvements} melhoras em ${checks} checagens (n³ = ${n * n * n}); ${reachable()} dos ${n * n} pares são alcançáveis e a matriz guarda toda distância mínima.` }, counters(), { matrix: matrix() });
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordTarjan: Recorder = (n, seed) => {
  const { graph, nodeMarks, edgeMarks, labels, steps, push, setAside, name, meta } = graphSession(n, seed, { weighted: false, directed: true, cyclic: true });
  const indexOf = new Map<number, number>();
  const lowLink = new Map<number, number>();
  const stack: number[] = [];
  const onStack = new Set<number>();
  const components: number[][] = [];
  let index = 0;
  const counters = () => ({ components: components.length, visited: indexOf.size, visitedUnit: `/ ${n}`, onStack: stack.length, index, largest: components.reduce((best, component) => Math.max(best, component.length), 0) });
  const relabel = () => graph.nodes.forEach((node) => {
    if (!indexOf.has(node.id)) return;
    const done = components.findIndex((component) => component.includes(node.id));
    labels.set(node.id, done >= 0 ? `C${done + 1}` : `${indexOf.get(node.id)}/${lowLink.get(node.id)}`);
  });
  const showStack = () => setAside(`stack: ${stack.map(name).join(" ") || "∅"}`);

  const visit = (node: number) => {
    indexOf.set(node, index);
    lowLink.set(node, index);
    index++;
    stack.push(node);
    onStack.add(node);
    nodeMarks.set(node, "cur");
    relabel();
    showStack();
    push(5, { en: `Visit ${name(node)}: index ${indexOf.get(node)}, low link ${lowLink.get(node)} (itself, so far). Push it on the stack.`, pt: `Visita ${name(node)}: índice ${indexOf.get(node)}, low link ${lowLink.get(node)} (ele mesmo, por enquanto). Empilha.` }, counters());
    for (const edgeId of graph.adj[node]) {
      const next = graph.edges[edgeId].v;
      if (!indexOf.has(next)) {
        edgeMarks.set(edgeId, "used");
        nodeMarks.set(node, "frontier");
        visit(next);
        lowLink.set(node, Math.min(lowLink.get(node)!, lowLink.get(next)!));
        nodeMarks.set(node, "cur");
        relabel();
        showStack();
        push(8, { en: `Back in ${name(node)} from ${name(next)}: low link becomes min(${lowLink.get(node)}, ${lowLink.get(next)}) = ${lowLink.get(node)}.`, pt: `De volta em ${name(node)} vindo de ${name(next)}: low link vira min(${lowLink.get(node)}, ${lowLink.get(next)}) = ${lowLink.get(node)}.` }, counters());
      } else if (onStack.has(next)) {
        edgeMarks.set(edgeId, "candidate");
        lowLink.set(node, Math.min(lowLink.get(node)!, indexOf.get(next)!));
        relabel();
        push(9, { en: `${name(node)} → ${name(next)} reaches a node still on the stack: a back edge. Low link of ${name(node)} becomes ${lowLink.get(node)}.`, pt: `${name(node)} → ${name(next)} alcança um nó ainda na pilha: aresta de retorno. O low link de ${name(node)} vira ${lowLink.get(node)}.` }, counters());
      } else {
        edgeMarks.set(edgeId, "rejected");
        push(9, { en: `${name(node)} → ${name(next)} leads to a finished component: a cross edge, ignored.`, pt: `${name(node)} → ${name(next)} leva a um componente pronto: aresta cruzada, ignorada.` }, counters());
      }
    }
    if (lowLink.get(node) === indexOf.get(node)) {
      const component: number[] = [];
      let top: number;
      do {
        top = stack.pop()!;
        onStack.delete(top);
        component.push(top);
        nodeMarks.set(top, "done");
      } while (top !== node);
      components.push(component);
      relabel();
      showStack();
      push(13, { en: `${name(node)} has low link = index: it is the root of a component. Pop down to it: { ${component.map(name).join(", ")} } is component C${components.length}.`, pt: `${name(node)} tem low link = índice: é a raiz de um componente. Desempilha até ele: { ${component.map(name).join(", ")} } é o componente C${components.length}.` }, counters());
    } else {
      nodeMarks.set(node, "frontier");
      push(11, { en: `${name(node)} has low link ${lowLink.get(node)} < index ${indexOf.get(node)}: it belongs to an ancestor's component. Stay on the stack, return.`, pt: `${name(node)} tem low link ${lowLink.get(node)} < índice ${indexOf.get(node)}: pertence ao componente de um ancestral. Fica na pilha, retorna.` }, counters());
    }
  };
  graph.nodes.forEach((node) => {
    if (indexOf.has(node.id)) return;
    push(17, { en: `${name(node.id)} is unvisited: start a depth-first search there.`, pt: `${name(node.id)} não foi visitado: começa uma busca em profundidade ali.` }, counters());
    visit(node.id);
  });
  setAside("");
  push(18, { en: `Done. ${components.length} strongly connected component${components.length > 1 ? "s" : ""} in one pass: ${components.map((component, i) => `C${i + 1} = { ${component.map(name).join(", ")} }`).join("; ")}.`, pt: `Pronto. ${components.length} componente${components.length > 1 ? "s" : ""} fortemente conexo${components.length > 1 ? "s" : ""} numa passada só: ${components.map((component, i) => `C${i + 1} = { ${component.map(name).join(", ")} }`).join("; ")}.` }, counters());
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordKosaraju: Recorder = (n, seed) => {
  const { graph, nodeMarks, edgeMarks, labels, steps, push, setAside, name, meta } = graphSession(n, seed, { weighted: false, directed: true, cyclic: true });
  const order: number[] = [];
  const seen = new Set<number>();
  const components: number[][] = [];
  let phase: "finish" | "collect" = "finish";
  const counters = () => ({ phase: phase === "finish" ? { en: "finish order", pt: "ordem de término" } : { en: "reversed graph", pt: "grafo invertido" }, finished: order.length, finishedUnit: `/ ${n}`, components: components.length, collected: components.reduce((sum, component) => sum + component.length, 0), largest: components.reduce((best, component) => Math.max(best, component.length), 0) });
  const showOrder = () => setAside(`finish order: ${order.map(name).join(" ") || "∅"}`);

  const finish = (node: number) => {
    seen.add(node);
    nodeMarks.set(node, "frontier");
    for (const edgeId of graph.adj[node]) {
      const next = graph.edges[edgeId].v;
      if (seen.has(next)) continue;
      edgeMarks.set(edgeId, "used");
      finish(next);
    }
    order.push(node);
    nodeMarks.set(node, "done");
    labels.set(node, String(order.length));
    showOrder();
    push(3, { en: `${name(node)} has no unvisited successor left: it finishes as number ${order.length}.`, pt: `${name(node)} não tem mais sucessor não visitado: termina como número ${order.length}.` }, counters());
  };
  graph.nodes.forEach((node) => {
    if (seen.has(node.id)) return;
    push(4, { en: `${name(node.id)} is unvisited: depth-first search from there, recording when each node finishes.`, pt: `${name(node.id)} não foi visitado: busca em profundidade a partir dele, anotando quando cada nó termina.` }, counters());
    finish(node.id);
  });

  const reversed: GraphData = { ...graph, edges: graph.edges.map((edge) => ({ ...edge, u: edge.v, v: edge.u })), adj: graph.nodes.map(() => []) };
  reversed.edges.forEach((edge) => reversed.adj[edge.u].push(edge.id));
  phase = "collect";
  seen.clear();
  nodeMarks.clear();
  edgeMarks.clear();
  push(5, { en: `Reverse every edge. A component is the same set of nodes in both directions, but now a search cannot leak out of it into the components it used to reach.`, pt: `Inverte toda aresta. Um componente é o mesmo conjunto de nós nas duas direções, mas agora uma busca não vaza dele para os componentes que ele alcançava.` }, counters(), { graph: reversed });
  const collect = (node: number, component: number[]) => {
    seen.add(node);
    component.push(node);
    nodeMarks.set(node, "cur");
    labels.set(node, `C${components.length + 1}`);
    push(7, { en: `Collect ${name(node)} into component C${components.length + 1}; follow reversed edges to unvisited nodes.`, pt: `Coleta ${name(node)} no componente C${components.length + 1}; segue arestas invertidas até nós não visitados.` }, counters(), { graph: reversed });
    nodeMarks.set(node, "done");
    for (const edgeId of reversed.adj[node]) {
      const next = reversed.edges[edgeId].v;
      if (seen.has(next)) continue;
      edgeMarks.set(edgeId, "used");
      collect(next, component);
    }
  };
  for (const node of [...order].reverse()) {
    if (seen.has(node)) continue;
    const component: number[] = [];
    push(8, { en: `${name(node)} finished latest among the unvisited: it must be in a source component of the reversed graph. Search from it.`, pt: `${name(node)} terminou por último entre os não visitados: precisa estar num componente fonte do grafo invertido. Busca a partir dele.` }, counters(), { graph: reversed });
    collect(node, component);
    components.push(component);
    push(11, { en: `Component C${components.length} = { ${component.map(name).join(", ")} }.`, pt: `Componente C${components.length} = { ${component.map(name).join(", ")} }.` }, counters(), { graph: reversed });
  }
  setAside("");
  push(13, { en: `Done. ${components.length} strongly connected component${components.length > 1 ? "s" : ""} after two passes: ${components.map((component, i) => `C${i + 1} = { ${component.map(name).join(", ")} }`).join("; ")}.`, pt: `Pronto. ${components.length} componente${components.length > 1 ? "s" : ""} fortemente conexo${components.length > 1 ? "s" : ""} depois de duas passadas: ${components.map((component, i) => `C${i + 1} = { ${component.map(name).join(", ")} }`).join("; ")}.` }, counters(), { graph: reversed });
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordUnionFind: Recorder = (n, seed) => {
  const { graph, nodeMarks, edgeMarks, labels, steps, push, setAside, name, meta, unionFind } = graphSession(n, seed, { weighted: false, directed: false });
  const rand = seeded(seed * 7 + 1);
  const edges = [...graph.edges];
  for (let i = edges.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [edges[i], edges[j]] = [edges[j], edges[i]];
  }
  const uf = unionFind(n);
  let components = n;
  let unions = 0;
  let finds = 0;
  let examined = 0;
  const sizeOf = () => {
    const counts = new Map<number, number>();
    graph.nodes.forEach((node) => counts.set(uf.find(node.id), (counts.get(uf.find(node.id)) ?? 0) + 1));
    return Math.max(...counts.values());
  };
  const counters = () => ({ components, unions, finds, examined, examinedUnit: `/ ${edges.length}`, largest: sizeOf() });
  const relabel = () => graph.nodes.forEach((node) => {
    labels.set(node.id, name(uf.find(node.id)));
    nodeMarks.set(node.id, uf.find(node.id) === node.id ? "frontier" : "seen");
  });

  relabel();
  push(2, { en: `Every node starts as its own set; the label is its representative. Edges arrive in a shuffled order, as if streamed.`, pt: `Todo nó começa como seu próprio conjunto; o rótulo é o representante. As arestas chegam embaralhadas, como num fluxo.` }, counters());
  edges.forEach((edge, i) => {
    examined++;
    finds += 2;
    const rootA = uf.find(edge.u);
    const rootB = uf.find(edge.v);
    edgeMarks.set(edge.id, "cur");
    setAside(`edge ${i + 1}/${edges.length}: ${name(edge.u)}–${name(edge.v)}`);
    push(5, { en: `Edge ${name(edge.u)}–${name(edge.v)}: find(${name(edge.u)}) = ${name(rootA)}, find(${name(edge.v)}) = ${name(rootB)}.`, pt: `Aresta ${name(edge.u)}–${name(edge.v)}: find(${name(edge.u)}) = ${name(rootA)}, find(${name(edge.v)}) = ${name(rootB)}.` }, counters());
    if (rootA === rootB) {
      edgeMarks.set(edge.id, "rejected");
      push(6, { en: `Same representative: ${name(edge.u)} and ${name(edge.v)} were already connected. Nothing to merge.`, pt: `Mesmo representante: ${name(edge.u)} e ${name(edge.v)} já estavam conectados. Nada a fundir.` }, counters());
      return;
    }
    uf.union(rootA, rootB);
    unions++;
    components--;
    edgeMarks.set(edge.id, "used");
    relabel();
    push(7, { en: `Different sets: point ${name(rootA)} at ${name(rootB)}. ${components} component${components > 1 ? "s" : ""} left.`, pt: `Conjuntos diferentes: aponta ${name(rootA)} para ${name(rootB)}. Resta${components > 1 ? "m" : ""} ${components} componente${components > 1 ? "s" : ""}.` }, counters());
  });
  setAside("");
  graph.nodes.forEach((node) => nodeMarks.set(node.id, "done"));
  push(9, { en: `Done. ${components} connected component${components > 1 ? "s" : ""} after ${unions} unions and ${finds} finds; each find was almost O(1) thanks to path compression.`, pt: `Pronto. ${components} componente${components > 1 ? "s" : ""} conexo${components > 1 ? "s" : ""} depois de ${unions} uniões e ${finds} finds; cada find foi quase O(1) graças à compressão de caminho.` }, counters());
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordEdmondsKarp: Recorder = (n, seed) => {
  const { graph, nodeMarks, edgeMarks, edgeLabels, labels, steps, push, setAside, name, meta } = graphSession(n, seed, { weighted: true, directed: true });
  const source = 0;
  const sink = n - 1;
  const flow = graph.edges.map(() => 0);
  let total = 0;
  let augmentations = 0;
  let bottleneck: number | string = "—";
  let pathLength: number | string = "—";
  const saturated = () => graph.edges.filter((edge) => flow[edge.id] === edge.w).length;
  const counters = () => ({ flow: total, augmentations, bottleneck, pathLength, saturated: saturated() });
  const relabel = () => graph.edges.forEach((edge) => edgeLabels.set(edge.id, `${flow[edge.id]}/${edge.w}`));
  const residual = (edge: { id: number; w: number }, forward: boolean) => (forward ? edge.w - flow[edge.id] : flow[edge.id]);

  relabel();
  labels.set(source, "source");
  labels.set(sink, "sink");
  nodeMarks.set(source, "frontier");
  nodeMarks.set(sink, "frontier");
  push(2, { en: `Source ${name(source)}, sink ${name(sink)}. Every edge shows flow / capacity, all flows 0.`, pt: `Fonte ${name(source)}, sorvedouro ${name(sink)}. Toda aresta mostra fluxo / capacidade, todos os fluxos 0.` }, counters());
  while (true) {
    // BFS over the residual graph: forward edges with spare capacity, backward edges with flow to cancel.
    const parent = new Map<number, { edge: number; forward: boolean }>();
    const queue = [source];
    const seen = new Set([source]);
    while (queue.length && !parent.has(sink)) {
      const node = queue.shift()!;
      for (const edge of graph.edges) {
        const forward = edge.u === node;
        const backward = edge.v === node;
        if (!forward && !backward) continue;
        const next = forward ? edge.v : edge.u;
        if (seen.has(next) || residual(edge, forward) <= 0) continue;
        seen.add(next);
        parent.set(next, { edge: edge.id, forward });
        queue.push(next);
      }
    }
    if (!parent.has(sink)) {
      edgeMarks.clear();
      graph.edges.forEach((edge) => {
        if (flow[edge.id] > 0) edgeMarks.set(edge.id, "used");
        if (seen.has(edge.u) && !seen.has(edge.v)) edgeMarks.set(edge.id, "cur");
      });
      graph.nodes.forEach((node) => nodeMarks.set(node.id, seen.has(node.id) ? "done" : "seen"));
      bottleneck = "—";
      pathLength = "—";
      push(5, { en: `No augmenting path is left: the nodes still reachable from ${name(source)} form the source side of a minimum cut, and the edges crossing it (white) are all saturated.`, pt: `Não resta caminho de aumento: os nós ainda alcançáveis de ${name(source)} formam o lado da fonte de um corte mínimo, e as arestas que o cruzam (brancas) estão todas saturadas.` }, counters());
      break;
    }
    const path: { edge: number; forward: boolean }[] = [];
    for (let node = sink; node !== source; ) {
      const step = parent.get(node)!;
      path.push(step);
      node = step.forward ? graph.edges[step.edge].u : graph.edges[step.edge].v;
    }
    path.reverse();
    edgeMarks.clear();
    graph.edges.forEach((edge) => {
      if (flow[edge.id] > 0) edgeMarks.set(edge.id, "used");
    });
    path.forEach((step) => edgeMarks.set(step.edge, "candidate"));
    pathLength = path.length;
    const nodesOnPath = [source, ...path.map((step) => (step.forward ? graph.edges[step.edge].v : graph.edges[step.edge].u))];
    setAside(`path: ${nodesOnPath.map(name).join(" → ")}`);
    push(4, { en: `BFS in the residual graph finds the shortest augmenting path: ${nodesOnPath.map(name).join(" → ")} (${path.length} edges${path.some((step) => !step.forward) ? ", one of them cancelling earlier flow" : ""}).`, pt: `O BFS no grafo residual acha o caminho de aumento mais curto: ${nodesOnPath.map(name).join(" → ")} (${path.length} arestas${path.some((step) => !step.forward) ? ", uma delas cancelando fluxo anterior" : ""}).` }, counters());
    bottleneck = Math.min(...path.map((step) => residual(graph.edges[step.edge], step.forward)));
    push(7, { en: `The bottleneck is the smallest residual capacity along it: ${bottleneck}.`, pt: `O gargalo é a menor capacidade residual ao longo dele: ${bottleneck}.` }, counters());
    path.forEach((step) => {
      flow[step.edge] += step.forward ? (bottleneck as number) : -(bottleneck as number);
      edgeMarks.set(step.edge, "used");
    });
    total += bottleneck;
    augmentations++;
    relabel();
    push(8, { en: `Push ${bottleneck} along the path: forward edges gain flow, a backward edge loses it.`, pt: `Empurra ${bottleneck} pelo caminho: arestas de ida ganham fluxo, uma de volta perde.` }, counters());
    push(9, { en: `Total flow is now ${total} after ${augmentations} augmentation${augmentations > 1 ? "s" : ""}.`, pt: `O fluxo total agora é ${total} depois de ${augmentations} aument${augmentations > 1 ? "os" : "o"}.` }, counters());
  }
  setAside("");
  push(11, { en: `Done. Maximum flow ${total} in ${augmentations} augmentations; ${saturated()} edges are saturated and the cut they form has capacity ${total} too.`, pt: `Pronto. Fluxo máximo ${total} em ${augmentations} aumentos; ${saturated()} arestas estão saturadas e o corte que formam tem capacidade ${total} também.` }, counters());
  return { steps, meta: withSteps(meta, steps.length) };
};
