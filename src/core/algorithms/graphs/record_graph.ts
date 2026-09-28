// Utils
import type { Recorder } from "../recording";
import { graphSession, type GraphEdge } from "./graph_model";

const withSteps = (meta: { en: string; pt: string }, count: number) => ({ en: `${meta.en} · ${count} steps`, pt: `${meta.pt} · ${count} passos` });

// Line numbers in every recorder mirror the listings in core/models/algorithms/graphs.ts.

export const recordGraphBfs: Recorder = (n, seed) => {
  const { graph, nodeMarks, edgeMarks, labels, steps, push, setAside, name, other, meta } = graphSession(n, seed, { weighted: false, directed: false });
  const dist = new Map<number, number>([[0, 0]]);
  const queue = [0];
  const order: string[] = [];
  let examined = 0;
  let level = 0;
  const counters = () => ({ visited: order.length, visitedUnit: `/ ${n}`, queue: queue.length, examined, level, order: order.join(" ") });
  const showQueue = () => setAside(`queue: ${queue.map(name).join(" ") || "∅"}`);

  nodeMarks.set(0, "frontier");
  labels.set(0, "0");
  showQueue();
  push(2, { en: `Start at ${name(0)}: distance 0, the queue holds only ${name(0)}.`, pt: `Começa em ${name(0)}: distância 0, a fila só tem ${name(0)}.` }, counters());
  while (queue.length) {
    const u = queue.shift()!;
    level = dist.get(u)!;
    order.push(name(u));
    nodeMarks.set(u, "cur");
    showQueue();
    push(5, { en: `Dequeue ${name(u)} (distance ${level}) and look at its neighbours.`, pt: `Desenfileira ${name(u)} (distância ${level}) e olha seus vizinhos.` }, counters());
    for (const edgeId of graph.adj[u]) {
      const edge = graph.edges[edgeId];
      const v = other(edge, u);
      examined++;
      if (dist.has(v)) {
        if (edgeMarks.get(edgeId) !== "used") edgeMarks.set(edgeId, "rejected");
        push(7, { en: `${name(v)} was already reached: the edge ${name(u)}–${name(v)} is not a tree edge.`, pt: `${name(v)} já foi alcançado: a aresta ${name(u)}–${name(v)} não é de árvore.` }, counters());
        continue;
      }
      dist.set(v, level + 1);
      labels.set(v, String(level + 1));
      nodeMarks.set(v, "frontier");
      edgeMarks.set(edgeId, "used");
      queue.push(v);
      showQueue();
      push(9, { en: `Reach ${name(v)} through ${name(u)}: distance ${level + 1}. Enqueue it.`, pt: `Alcança ${name(v)} por ${name(u)}: distância ${level + 1}. Enfileira.` }, counters());
    }
    nodeMarks.set(u, "done");
  }
  push(12, { en: `Done. Every node has its distance from ${name(0)}; the blue edges are the BFS tree.`, pt: `Pronto. Todo nó tem sua distância a partir de ${name(0)}; as arestas azuis são a árvore BFS.` }, counters());
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordGraphDfs: Recorder = (n, seed) => {
  const { graph, nodeMarks, edgeMarks, steps, push, setAside, name, other, meta } = graphSession(n, seed, { weighted: false, directed: false });
  const seen = new Set<number>();
  const order: string[] = [];
  const stack: number[] = [];
  let examined = 0;
  let backtracks = 0;
  const counters = () => ({ visited: seen.size, visitedUnit: `/ ${n}`, depth: stack.length - 1, examined, backtracks, order: order.join(" ") });
  const showStack = () => setAside(`stack: ${stack.map(name).join(" → ") || "∅"}`);

  const rec = (u: number) => {
    seen.add(u);
    order.push(name(u));
    stack.push(u);
    nodeMarks.set(u, "cur");
    showStack();
    push(3, { en: `Visit ${name(u)} at depth ${stack.length - 1}.`, pt: `Visita ${name(u)} na profundidade ${stack.length - 1}.` }, counters());
    for (const edgeId of graph.adj[u]) {
      const edge = graph.edges[edgeId];
      const v = other(edge, u);
      examined++;
      if (seen.has(v)) {
        if (edgeMarks.get(edgeId) !== "used") edgeMarks.set(edgeId, "rejected");
        push(5, { en: `${name(v)} is already visited: skip the edge ${name(u)}–${name(v)}.`, pt: `${name(v)} já foi visitado: pula a aresta ${name(u)}–${name(v)}.` }, counters());
        continue;
      }
      edgeMarks.set(edgeId, "used");
      nodeMarks.set(u, "seen");
      push(6, { en: `${name(v)} is new: go deeper through ${name(u)}–${name(v)}.`, pt: `${name(v)} é novo: desce por ${name(u)}–${name(v)}.` }, counters());
      rec(v);
      nodeMarks.set(u, "cur");
      showStack();
      push(4, { en: `Back in ${name(u)}: continue with its next neighbour.`, pt: `De volta em ${name(u)}: continua com o próximo vizinho.` }, counters());
    }
    nodeMarks.set(u, "done");
    stack.pop();
    backtracks++;
    showStack();
    push(8, { en: `${name(u)} has no unvisited neighbour left: return.`, pt: `${name(u)} não tem mais vizinho não visitado: retorna.` }, counters());
  };
  rec(0);
  push(8, { en: `Done. All ${n} nodes visited in the order ${order.join(" ")}.`, pt: `Pronto. Todos os ${n} nós visitados na ordem ${order.join(" ")}.` }, counters());
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordGraphDijkstra: Recorder = (n, seed) => {
  const { graph, nodeMarks, edgeMarks, labels, steps, push, setAside, name, other, meta } = graphSession(n, seed, { weighted: true, directed: false });
  const dist = new Map<number, number>([[0, 0]]);
  const parentEdge = new Map<number, number>();
  const settled = new Set<number>();
  let open: [number, number][] = [[0, 0]];
  let relaxations = 0;
  let examined = 0;
  let current: number | string = 0;
  const counters = () => ({ settled: settled.size, settledUnit: `/ ${n}`, open: open.length, relaxations, examined, dist: current });
  const showOpen = () => setAside(`open: ${[...open].sort((a, b) => a[0] - b[0]).map(([d, v]) => `${name(v)}:${d}`).join(" ") || "∅"}`);

  labels.set(0, "0");
  nodeMarks.set(0, "frontier");
  showOpen();
  push(2, { en: `Source ${name(0)} gets distance 0; every other node is at ∞.`, pt: `A origem ${name(0)} ganha distância 0; todo outro nó está em ∞.` }, counters());
  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [d, u] = open.shift()!;
    showOpen();
    if (settled.has(u)) {
      push(6, { en: `Stale entry for ${name(u)} (${d}): it was settled with a smaller distance. Skip.`, pt: `Entrada velha de ${name(u)} (${d}): já foi fixado com distância menor. Pula.` }, counters());
      continue;
    }
    settled.add(u);
    current = d;
    nodeMarks.set(u, "cur");
    push(5, { en: `Pop ${name(u)} with the smallest tentative distance, ${d}. It is settled: no shorter path can appear.`, pt: `Retira ${name(u)} com a menor distância provisória, ${d}. Está fixado: nenhum caminho mais curto pode aparecer.` }, counters());
    for (const edgeId of graph.adj[u]) {
      const edge = graph.edges[edgeId];
      const v = other(edge, u);
      if (settled.has(v)) continue;
      examined++;
      const nd = d + edge.w;
      const old = dist.get(v);
      edgeMarks.set(edgeId, "candidate");
      push(8, { en: `Edge ${name(u)}–${name(v)} weighs ${edge.w}: ${d} + ${edge.w} = ${nd} against ${old ?? "∞"}.`, pt: `A aresta ${name(u)}–${name(v)} pesa ${edge.w}: ${d} + ${edge.w} = ${nd} contra ${old ?? "∞"}.` }, counters());
      if (old !== undefined && nd >= old) {
        edgeMarks.delete(edgeId);
        push(9, { en: `No improvement: ${name(v)} keeps ${old}.`, pt: `Sem melhora: ${name(v)} mantém ${old}.` }, counters());
        continue;
      }
      const previous = parentEdge.get(v);
      if (previous !== undefined) edgeMarks.delete(previous);
      dist.set(v, nd);
      labels.set(v, String(nd));
      parentEdge.set(v, edgeId);
      edgeMarks.set(edgeId, "used");
      nodeMarks.set(v, "frontier");
      open.push([nd, v]);
      relaxations++;
      showOpen();
      push(10, { en: `Relax: dist(${name(v)}) = ${nd} via ${name(u)}. Push it to the heap.`, pt: `Relaxa: dist(${name(v)}) = ${nd} via ${name(u)}. Empurra para o heap.` }, counters());
    }
    nodeMarks.set(u, "done");
    open = open.filter(([, v]) => !settled.has(v));
  }
  push(14, { en: `Done. The labels are the shortest distances from ${name(0)} and the blue edges form the shortest-path tree.`, pt: `Pronto. Os rótulos são as distâncias mínimas a partir de ${name(0)} e as arestas azuis formam a árvore de caminhos mínimos.` }, counters());
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordPrim: Recorder = (n, seed) => {
  const { graph, nodeMarks, edgeMarks, steps, push, setAside, name, meta } = graphSession(n, seed, { weighted: true, directed: false });
  const inTree = new Set<number>([0]);
  let treeEdges = 0;
  let total = 0;
  let crossingCount = 0;
  let best: number | string = "—";
  const counters = () => ({ treeNodes: inTree.size, treeNodesUnit: `/ ${n}`, treeEdges, total, crossing: crossingCount, best });
  const edgeName = (e: GraphEdge) => `${name(e.u)}–${name(e.v)}`;

  nodeMarks.set(0, "done");
  push(2, { en: `Start: the tree is just ${name(0)}. Total weight 0.`, pt: `Início: a árvore é só ${name(0)}. Peso total 0.` }, counters());
  while (inTree.size < n) {
    const crossing = graph.edges.filter((e) => inTree.has(e.u) !== inTree.has(e.v));
    crossingCount = crossing.length;
    let lightest = crossing[0];
    crossing.forEach((e) => {
      edgeMarks.set(e.id, "candidate");
      if (e.w < lightest.w) lightest = e;
    });
    edgeMarks.set(lightest.id, "cur");
    best = lightest.w;
    setAside(`crossing: ${crossing.map((e) => `${edgeName(e)}:${e.w}`).join(" ")}`);
    push(6, { en: `${crossing.length} edges leave the tree. The lightest is ${edgeName(lightest)} with weight ${lightest.w}.`, pt: `${crossing.length} arestas saem da árvore. A mais leve é ${edgeName(lightest)}, com peso ${lightest.w}.` }, counters());
    crossing.forEach((e) => edgeMarks.delete(e.id));
    const joined = inTree.has(lightest.u) ? lightest.v : lightest.u;
    inTree.add(joined);
    treeEdges++;
    total += lightest.w;
    edgeMarks.set(lightest.id, "used");
    nodeMarks.set(joined, "done");
    push(10, { en: `Add ${edgeName(lightest)} to the tree: ${name(joined)} joins. Total weight ${total}.`, pt: `Adiciona ${edgeName(lightest)} à árvore: ${name(joined)} entra. Peso total ${total}.` }, counters());
  }
  crossingCount = 0;
  best = "—";
  setAside("");
  push(13, { en: `Done. ${treeEdges} edges, total weight ${total}: a minimum spanning tree.`, pt: `Pronto. ${treeEdges} arestas, peso total ${total}: uma árvore geradora mínima.` }, counters());
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordKruskal: Recorder = (n, seed) => {
  const { graph, nodeMarks, edgeMarks, labels, steps, push, setAside, name, meta, unionFind } = graphSession(n, seed, { weighted: true, directed: false });
  const sorted = [...graph.edges].sort((a, b) => a.w - b.w || a.id - b.id);
  const uf = unionFind(n);
  let treeEdges = 0;
  let rejected = 0;
  let total = 0;
  let components = n;
  let weight: number | string = "—";
  const counters = () => ({ treeEdges, treeEdgesUnit: `/ ${n - 1}`, rejected, total, components, weight });
  const edgeName = (e: GraphEdge) => `${name(e.u)}–${name(e.v)}`;
  const relabel = () => graph.nodes.forEach((node) => labels.set(node.id, name(uf.find(node.id))));

  relabel();
  setAside(`sorted: ${sorted.map((e) => e.w).join(" ")}`);
  push(2, { en: `Sort the ${sorted.length} edges by weight. Every node starts as its own component (the label is its representative).`, pt: `Ordena as ${sorted.length} arestas por peso. Todo nó começa como seu próprio componente (o rótulo é o representante).` }, counters());
  for (const e of sorted) {
    weight = e.w;
    edgeMarks.set(e.id, "cur");
    push(5, { en: `Consider ${edgeName(e)} (weight ${e.w}).`, pt: `Considera ${edgeName(e)} (peso ${e.w}).` }, counters());
    if (uf.find(e.u) === uf.find(e.v)) {
      rejected++;
      edgeMarks.set(e.id, "rejected");
      push(6, { en: `${name(e.u)} and ${name(e.v)} are already connected: this edge would close a cycle. Reject.`, pt: `${name(e.u)} e ${name(e.v)} já estão conectados: essa aresta fecharia um ciclo. Rejeita.` }, counters());
      continue;
    }
    uf.union(e.u, e.v);
    relabel();
    treeEdges++;
    total += e.w;
    components--;
    edgeMarks.set(e.id, "used");
    nodeMarks.set(e.u, "done");
    nodeMarks.set(e.v, "done");
    push(8, { en: `Accept ${edgeName(e)}: two components merge. ${components} left, total weight ${total}.`, pt: `Aceita ${edgeName(e)}: dois componentes se fundem. Restam ${components}, peso total ${total}.` }, counters());
  }
  weight = "—";
  push(10, { en: `Done. ${treeEdges} edges accepted, ${rejected} rejected, total weight ${total}.`, pt: `Pronto. ${treeEdges} arestas aceitas, ${rejected} rejeitadas, peso total ${total}.` }, counters());
  return { steps, meta: withSteps(meta, steps.length) };
};

export const recordTopological: Recorder = (n, seed) => {
  const { graph, nodeMarks, edgeMarks, labels, steps, push, setAside, name, meta } = graphSession(n, seed, { weighted: false, directed: true });
  const indeg = graph.nodes.map(() => 0);
  const order: string[] = [];
  let removed = 0;
  let current: string = "—";
  const queue: number[] = [];
  const counters = () => ({ ordered: order.length, orderedUnit: `/ ${n}`, queue: queue.length, removed, removedUnit: `/ ${graph.edges.length}`, order: order.join(" "), current });
  const showOrder = () => setAside(`order: ${order.join(" → ") || "∅"}`);

  graph.edges.forEach((e) => indeg[e.v]++);
  graph.nodes.forEach((node) => labels.set(node.id, String(indeg[node.id])));
  push(3, { en: `Count the incoming edges of every node: ${graph.nodes.map((node) => `${node.label}:${indeg[node.id]}`).join(" ")}.`, pt: `Conta as arestas de entrada de cada nó: ${graph.nodes.map((node) => `${node.label}:${indeg[node.id]}`).join(" ")}.` }, counters());
  graph.nodes.forEach((node) => {
    if (indeg[node.id] !== 0) return;
    queue.push(node.id);
    nodeMarks.set(node.id, "frontier");
  });
  showOrder();
  push(4, { en: `The sources, with in-degree 0, go into the queue: ${queue.map(name).join(", ")}.`, pt: `As fontes, com grau de entrada 0, vão para a fila: ${queue.map(name).join(", ")}.` }, counters());
  while (queue.length) {
    const u = queue.shift()!;
    order.push(name(u));
    current = name(u);
    nodeMarks.set(u, "cur");
    showOrder();
    push(8, { en: `Take ${name(u)} from the queue: position ${order.length} in the order.`, pt: `Tira ${name(u)} da fila: posição ${order.length} na ordem.` }, counters());
    for (const edgeId of graph.adj[u]) {
      const v = graph.edges[edgeId].v;
      indeg[v]--;
      removed++;
      labels.set(v, String(indeg[v]));
      edgeMarks.set(edgeId, "used");
      if (indeg[v] === 0) {
        queue.push(v);
        nodeMarks.set(v, "frontier");
        push(11, { en: `Remove ${name(u)} → ${name(v)}: the in-degree of ${name(v)} is now 0, so it joins the queue.`, pt: `Remove ${name(u)} → ${name(v)}: o grau de entrada de ${name(v)} agora é 0, então entra na fila.` }, counters());
        continue;
      }
      push(10, { en: `Remove ${name(u)} → ${name(v)}: the in-degree of ${name(v)} drops to ${indeg[v]}.`, pt: `Remove ${name(u)} → ${name(v)}: o grau de entrada de ${name(v)} cai para ${indeg[v]}.` }, counters());
    }
    nodeMarks.set(u, "done");
  }
  current = "—";
  push(14, { en: `Done. ${order.join(" → ")} respects every edge. If any node were left out, the graph would have a cycle.`, pt: `Pronto. ${order.join(" → ")} respeita toda aresta. Se algum nó tivesse ficado de fora, o grafo teria um ciclo.` }, counters());
  return { steps, meta: withSteps(meta, steps.length) };
};
