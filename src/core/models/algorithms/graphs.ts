// Models
import type { Localized } from "../translations";
import type { VizKey } from "../viz";
import type { AlgorithmSpec, KpiSpec } from "./spec";

const SIZE = { sizeLabel: { en: "Nodes", pt: "Nós" }, minN: 6, maxN: 16, stepN: 2, defaultN: 10, shuffleLabel: { en: "New graph", pt: "Novo grafo" }, stepMs: 420 } as const;

const LEGEND_TRAVERSAL: [VizKey, Localized][] = [["act", { en: "current", pt: "atual" }], ["primary", { en: "frontier · tree edge", pt: "fronteira · aresta de árvore" }], ["green", { en: "done", pt: "concluído" }], ["def", { en: "unvisited", pt: "não visitado" }]];
const LEGEND_MST: [VizKey, Localized][] = [["violet", { en: "candidate", pt: "candidata" }], ["act", { en: "chosen", pt: "escolhida" }], ["primary", { en: "in the tree", pt: "na árvore" }], ["green", { en: "tree node", pt: "nó da árvore" }]];

const KPI_EXAMINED: KpiSpec = { key: "examined", label: { en: "EDGES", pt: "ARESTAS" }, sub: { en: "looked at so far", pt: "examinadas até aqui" } };
const KPI_ORDER: KpiSpec = { key: "order", label: { en: "ORDER", pt: "ORDEM" }, sub: { en: "visit order", pt: "ordem de visita" } };
const KPI_TOTAL: KpiSpec = { key: "total", label: { en: "TOTAL", pt: "TOTAL" }, sub: { en: "weight of the tree", pt: "peso da árvore" } };

const CHART_TRAVERSAL: [string, number, boolean?][] = [["bfs", 6000], ["dfs", 6000], ["dijkstra", 6000], ["bellman-ford", 3000000], ["floyd-warshall", 1000000000]];
const CHART_TRAVERSAL_TITLE = { en: "EDGES EXAMINED · 1 000 NODES, 3 000 EDGES", pt: "ARESTAS EXAMINADAS · 1.000 NÓS, 3.000 ARESTAS" };
const CHART_MST: [string, number, boolean?][] = [["prim, scan", 3000000], ["prim, heap", 30000], ["kruskal", 33000], ["borůvka", 30000]];
const CHART_MST_TITLE = { en: "EDGE SCANS · 1 000 NODES, 3 000 EDGES", pt: "VARREDURAS DE ARESTA · 1.000 NÓS, 3.000 ARESTAS" };
const CHART_MST_NOTE = { en: "kruskal's cost is the sort · heap versions count log-factor operations", pt: "o custo do kruskal é a ordenação · versões com heap contam operações com fator log" };

const selfIn = (chart: [string, number, boolean?][], label: string): [string, number, boolean?][] => chart.map(([name, value]) => (name === label ? [name, value, true] : [name, value]));

export const GRAPHS = {
  graphBfs: {
    ...SIZE,
    family: "graphs",
    slug: "bfs",
    kind: "graph",
    name: "BFS",
    subtitle: { en: "level by level from a source", pt: "nível por nível a partir de uma origem" },
    tagline: { en: "BFS · every node at distance 1, then 2, then 3", pt: "BFS · todo nó à distância 1, depois 2, depois 3" },
    legend: LEGEND_TRAVERSAL,
    kpis: [
      { key: "visited", unitKey: "visitedUnit", label: { en: "VISITED", pt: "VISITADOS" }, sub: { en: "dequeued and expanded", pt: "desenfileirados e expandidos" } },
      { key: "queue", label: { en: "QUEUE", pt: "FILA" }, sub: { en: "waiting", pt: "esperando" } },
      KPI_EXAMINED,
      { key: "level", label: { en: "LEVEL", pt: "NÍVEL" }, sub: { en: "distance of the current node", pt: "distância do nó atual" } },
      KPI_ORDER,
    ],
    idea: {
      en: [
        "Breadth-first search on a graph is the same idea as on a grid: keep a queue, take the oldest node, and put its unseen neighbours at the back. Nodes come out in order of distance from the source, so the queue holds at most two consecutive levels at any time.",
        "The tree edges, the edge through which each node was first reached, form the BFS tree, and the distance labels are the shortest path lengths in hops. Everything else about the graph, weights included, is ignored.",
      ],
      pt: [
        "A busca em largura num grafo é a mesma ideia da grade: mantém uma fila, pega o nó mais antigo e põe os vizinhos ainda não vistos no fim. Os nós saem em ordem de distância da origem, então a fila guarda no máximo dois níveis consecutivos a cada momento.",
        "As arestas de árvore, a aresta pela qual cada nó foi alcançado pela primeira vez, formam a árvore BFS, e os rótulos de distância são os comprimentos dos caminhos mínimos em saltos. Todo o resto do grafo, pesos inclusive, é ignorado.",
      ],
    },
    stages: [
      ["primary", { en: "dequeue", pt: "desenfileira" }, { en: "the oldest node in the queue", pt: "o nó mais antigo da fila" }],
      ["act", { en: "expand", pt: "expande" }, { en: "look at every neighbour", pt: "olha cada vizinho" }],
      ["swap", { en: "enqueue", pt: "enfileira" }, { en: "unseen ones get distance + 1", pt: "os não vistos ganham distância + 1" }],
      ["green", { en: "done", pt: "conclui" }, { en: "the node leaves the frontier", pt: "o nó sai da fronteira" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(V + E)", "green", { en: "always: every node and edge once", pt: "sempre: cada nó e aresta uma vez" }],
      [{ en: "average", pt: "médio" }, "O(V + E)", "green", { en: "linear in the size of the graph", pt: "linear no tamanho do grafo" }],
      [{ en: "worst", pt: "pior" }, "O(V + E)", "green", { en: "dense graph: E ≈ V²", pt: "grafo denso: E ≈ V²" }],
      [{ en: "space", pt: "espaço" }, "O(V)", "text", { en: "queue and distances", pt: "fila e distâncias" }],
    ],
    chartTitle: CHART_TRAVERSAL_TITLE,
    chart: selfIn(CHART_TRAVERSAL, "bfs"),
    chartNote: { en: "undirected: each edge is seen from both ends", pt: "não direcionado: cada aresta é vista dos dois lados" },
    when: {
      en: ["Shortest paths in hops: social distance, fewest transfers, the web crawler's frontier.", "Anything level-based: bipartite checks, connected components, the layers of a flow network."],
      pt: ["Caminhos mínimos em saltos: distância social, menos baldeações, a fronteira de um rastreador web.", "Qualquer coisa por níveis: teste de bipartição, componentes conexos, as camadas de uma rede de fluxo."],
    },
    pitfalls: {
      en: ["Weights are ignored: three light edges lose to one heavy edge. Use Dijkstra.", "Marking a node when it is dequeued instead of when it is enqueued adds it to the queue several times.", "On an implicit graph (states of a puzzle) the frontier can explode; store visited states compactly."],
      pt: ["Pesos são ignorados: três arestas leves perdem para uma pesada. Use Dijkstra.", "Marcar um nó ao desenfileirar em vez de ao enfileirar o coloca na fila várias vezes.", "Num grafo implícito (estados de um quebra-cabeça) a fronteira pode explodir; guarde os estados visitados de forma compacta."],
    },
    history: {
      en: "Breadth-first search was written down by Konrad Zuse in 1945 and rediscovered by Edward Moore in 1959 for finding the way out of a maze. Its linear running time makes it the first tool reached for on any unweighted graph, and the layering it produces is the backbone of Hopcroft–Karp matching and Dinic's max-flow.",
      pt: "A busca em largura foi escrita por Konrad Zuse em 1945 e redescoberta por Edward Moore em 1959 para achar a saída de um labirinto. Seu tempo linear faz dela a primeira ferramenta para qualquer grafo sem peso, e as camadas que ela produz são a espinha dorsal do emparelhamento de Hopcroft–Karp e do fluxo máximo de Dinic.",
    },
    file: "bfs",
    code: {
      ts: ["function bfs(graph: Graph, start: Node) {", "  const queue = [start];", "  const dist = new Map([[start, 0]]);", "  while (queue.length > 0) {", "    const u = queue.shift()!;", "    for (const v of graph.neighbors(u)) {", "      if (dist.has(v)) continue;", "      dist.set(v, dist.get(u)! + 1);", "      queue.push(v);", "    }", "  }", "  return dist;", "}"],
      py: ["def bfs(graph, start):", "    queue = deque([start])", "    dist = {start: 0}", "    while queue:", "        u = queue.popleft()", "        for v in graph.neighbors(u):", "            if v in dist: continue", "            dist[v] = dist[u] + 1", "            queue.append(v)", "", "", "    return dist", ""],
      java: ["Map<Node,Integer> bfs(Graph graph, Node start) {", "  Deque<Node> queue = new ArrayDeque<>(List.of(start));", "  Map<Node,Integer> dist = new HashMap<>(Map.of(start, 0));", "  while (!queue.isEmpty()) {", "    Node u = queue.poll();", "    for (Node v : graph.neighbors(u)) {", "      if (dist.containsKey(v)) continue;", "      dist.put(v, dist.get(u) + 1);", "      queue.add(v);", "    }", "  }", "  return dist;", "}"],
      cpp: ["std::unordered_map<Node,int> bfs(const Graph& graph, Node start) {", "  std::queue<Node> queue; queue.push(start);", "  std::unordered_map<Node,int> dist{{start, 0}};", "  while (!queue.empty()) {", "    Node u = queue.front(); queue.pop();", "    for (Node v : graph.neighbors(u)) {", "      if (dist.count(v)) continue;", "      dist[v] = dist[u] + 1;", "      queue.push(v);", "    }", "  }", "  return dist;", "}"],
      c: ["void bfs(const Graph *graph, int start, int *dist) {", "  Queue queue = queue_new(); queue_push(&queue, start);", "  fill(dist, graph->n, -1); dist[start] = 0;", "  while (queue.size > 0) {", "    int u = queue_pop(&queue);", "    for (int k = 0; k < graph->degree[u]; k++) { int v = graph->adj[u][k];", "      if (dist[v] >= 0) continue;", "      dist[v] = dist[u] + 1;", "      queue_push(&queue, v);", "    }", "  }", "  ", "}"],
      go: ["func bfs(graph Graph, start Node) map[Node]int {", "\tqueue := []Node{start}", "\tdist := map[Node]int{start: 0}", "\tfor len(queue) > 0 {", "\t\tu := queue[0]; queue = queue[1:]", "\t\tfor _, v := range graph.Neighbors(u) {", "\t\t\tif _, seen := dist[v]; seen { continue }", "\t\t\tdist[v] = dist[u] + 1", "\t\t\tqueue = append(queue, v)", "\t\t}", "\t}", "\treturn dist", "}"],
      rs: ["fn bfs(graph: &Graph, start: Node) -> HashMap<Node, u32> {", "    let mut queue = VecDeque::from([start]);", "    let mut dist = HashMap::from([(start, 0)]);", "    while let Some(u) = queue.pop_front() {", "        // u is the oldest node in the queue", "        for v in graph.neighbors(u) {", "            if dist.contains_key(&v) { continue; }", "            dist.insert(v, dist[&u] + 1);", "            queue.push_back(v);", "        }", "    }", "    dist", "}"],
    },
    pseudo: {
      en: ["BFS(G, s)", "  queue ← [s]; dist[s] ← 0", "  while queue not empty", "    u ← dequeue", "    for each neighbour v of u with no dist yet", "      dist[v] ← dist[u] + 1; enqueue v"],
      pt: ["BFS(G, s)", "  fila ← [s]; dist[s] ← 0", "  enquanto fila não vazia", "    u ← desenfileira", "    para cada vizinho v de u ainda sem dist", "      dist[v] ← dist[u] + 1; enfileira v"],
    },
  },

  graphDfs: {
    ...SIZE,
    family: "graphs",
    slug: "dfs",
    kind: "graph",
    name: "DFS",
    subtitle: { en: "deep first, backtrack on dead ends", pt: "fundo primeiro, volta nos becos" },
    tagline: { en: "DFS · the recursion that maps a graph", pt: "DFS · a recursão que mapeia um grafo" },
    legend: [["act", { en: "current", pt: "atual" }], ["vis", { en: "on the stack", pt: "na pilha" }], ["primary", { en: "tree edge", pt: "aresta de árvore" }], ["green", { en: "finished", pt: "concluído" }]],
    kpis: [
      { key: "visited", unitKey: "visitedUnit", label: { en: "VISITED", pt: "VISITADOS" }, sub: { en: "entered so far", pt: "visitados até aqui" } },
      { key: "depth", label: { en: "DEPTH", pt: "PROFUNDIDADE" }, sub: { en: "recursion depth now", pt: "profundidade da recursão" } },
      KPI_EXAMINED,
      { key: "backtracks", label: { en: "BACKTRACKS", pt: "RETORNOS" }, sub: { en: "returns from a node", pt: "retornos de um nó" } },
      KPI_ORDER,
    ],
    idea: {
      en: [
        "Depth-first search goes as deep as it can before it goes wide: from the current node it picks the first unvisited neighbour, recurses into it, and only when a node has no unvisited neighbours does it return to whoever called it. The call stack is the path from the source to the current node.",
        "The order nodes are entered and left carries structure: entry and exit times classify every edge as tree, back, forward or cross, which is what cycle detection, topological sorting and Tarjan's strongly connected components are built on.",
      ],
      pt: [
        "A busca em profundidade vai o mais fundo que pode antes de ir para os lados: do nó atual ela pega o primeiro vizinho não visitado, entra nele, e só quando um nó não tem vizinhos não visitados ela volta para quem a chamou. A pilha de chamadas é o caminho da origem até o nó atual.",
        "A ordem em que os nós são entrados e deixados carrega estrutura: tempos de entrada e saída classificam toda aresta como de árvore, de retorno, de avanço ou cruzada, e é sobre isso que detecção de ciclos, ordenação topológica e os componentes fortemente conexos de Tarjan são construídos.",
      ],
    },
    stages: [
      ["act", { en: "visit", pt: "visita" }, { en: "mark u, record its entry", pt: "marca u, registra a entrada" }],
      ["primary", { en: "descend", pt: "desce" }, { en: "first unvisited neighbour", pt: "primeiro vizinho não visitado" }],
      ["swap", { en: "skip", pt: "pula" }, { en: "already visited: not a tree edge", pt: "já visitado: não é aresta de árvore" }],
      ["green", { en: "backtrack", pt: "retorna" }, { en: "no neighbours left: return", pt: "sem vizinhos restantes: retorna" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(V + E)", "green", { en: "every node and edge once", pt: "cada nó e aresta uma vez" }],
      [{ en: "average", pt: "médio" }, "O(V + E)", "green", { en: "linear in the size of the graph", pt: "linear no tamanho do grafo" }],
      [{ en: "worst", pt: "pior" }, "O(V + E)", "green", { en: "dense graph: E ≈ V²", pt: "grafo denso: E ≈ V²" }],
      [{ en: "space", pt: "espaço" }, "O(V)", "text", { en: "the recursion stack, up to the longest path", pt: "a pilha de recursão, até o caminho mais longo" }],
    ],
    chartTitle: CHART_TRAVERSAL_TITLE,
    chart: selfIn(CHART_TRAVERSAL, "dfs"),
    chartNote: { en: "undirected: each edge is seen from both ends", pt: "não direcionado: cada aresta é vista dos dois lados" },
    when: {
      en: ["Structure questions: is there a cycle, which nodes are reachable, what are the components, what order respects the dependencies.", "Mazes and puzzles where memory matters more than path length: the stack holds one path, not a frontier."],
      pt: ["Perguntas de estrutura: há ciclo, quais nós são alcançáveis, quais são os componentes, que ordem respeita as dependências.", "Labirintos e quebra-cabeças em que memória importa mais que o comprimento do caminho: a pilha guarda um caminho, não uma fronteira."],
    },
    pitfalls: {
      en: ["Recursion depth equals the longest path: a million-node chain overflows the stack. Use an explicit stack.", "The path DFS finds is rarely the shortest; for distances use BFS.", "On directed graphs, forgetting to restart from every unvisited node misses whole components."],
      pt: ["A profundidade da recursão é o caminho mais longo: uma cadeia de um milhão de nós estoura a pilha. Use uma pilha explícita.", "O caminho que o DFS acha raramente é o mais curto; para distâncias use BFS.", "Em grafos direcionados, esquecer de recomeçar de cada nó não visitado perde componentes inteiros."],
    },
    history: {
      en: "Trémaux's 19th-century rule for walking a maze is depth-first search in disguise. John Hopcroft and Robert Tarjan made it the workhorse of graph algorithms in 1973, showing linear-time planarity testing and biconnected components with nothing but DFS and a few timestamps.",
      pt: "A regra de Trémaux, do século XIX, para percorrer um labirinto é a busca em profundidade disfarçada. John Hopcroft e Robert Tarjan a transformaram no cavalo de batalha dos algoritmos em grafos em 1973, mostrando teste de planaridade e componentes biconexos em tempo linear só com DFS e alguns carimbos de tempo.",
    },
    file: "dfs",
    code: {
      ts: ["function dfs(graph: Graph, u: Node, seen = new Set<Node>()) {", "  seen.add(u);", "  visit(u);", "  for (const v of graph.neighbors(u)) {", "    if (seen.has(v)) continue;", "    dfs(graph, v, seen);", "  }", "  return seen;", "}"],
      py: ["def dfs(graph, u, seen=None):", "    seen = seen if seen is not None else set(); seen.add(u)", "    visit(u)", "    for v in graph.neighbors(u):", "        if v in seen: continue", "        dfs(graph, v, seen)", "", "    return seen", ""],
      java: ["static void dfs(Graph graph, Node u, Set<Node> seen) {", "  seen.add(u);", "  visit(u);", "  for (Node v : graph.neighbors(u)) {", "    if (seen.contains(v)) continue;", "    dfs(graph, v, seen);", "  }", "  ", "}"],
      cpp: ["void dfs(const Graph& graph, Node u, std::unordered_set<Node>& seen) {", "  seen.insert(u);", "  visit(u);", "  for (Node v : graph.neighbors(u)) {", "    if (seen.count(v)) continue;", "    dfs(graph, v, seen);", "  }", "  ", "}"],
      c: ["void dfs(const Graph *graph, int u, bool *seen) {", "  seen[u] = true;", "  visit(u);", "  for (int k = 0; k < graph->degree[u]; k++) { int v = graph->adj[u][k];", "    if (seen[v]) continue;", "    dfs(graph, v, seen);", "  }", "  ", "}"],
      go: ["func dfs(graph Graph, u Node, seen map[Node]bool) {", "\tseen[u] = true", "\tvisit(u)", "\tfor _, v := range graph.Neighbors(u) {", "\t\tif seen[v] { continue }", "\t\tdfs(graph, v, seen)", "\t}", "\t", "}"],
      rs: ["fn dfs(graph: &Graph, u: Node, seen: &mut HashSet<Node>) {", "    seen.insert(u);", "    visit(u);", "    for v in graph.neighbors(u) {", "        if seen.contains(&v) { continue; }", "        dfs(graph, v, seen);", "    }", "    ", "}"],
    },
    pseudo: {
      en: ["DFS(G, u)", "  mark u visited; visit(u)", "  for each neighbour v of u", "    if v not visited: DFS(G, v)"],
      pt: ["DFS(G, u)", "  marca u visitado; visita(u)", "  para cada vizinho v de u", "    se v não visitado: DFS(G, v)"],
    },
  },

  graphDijkstra: {
    ...SIZE,
    family: "graphs",
    slug: "dijkstra",
    kind: "graph",
    name: "Dijkstra",
    subtitle: { en: "shortest paths · non-negative weights", pt: "caminhos mínimos · pesos não negativos" },
    tagline: { en: "Dijkstra · settle the closest node, relax its edges, repeat", pt: "Dijkstra · fixa o nó mais próximo, relaxa suas arestas, repete" },
    legend: [["act", { en: "settling", pt: "fixando" }], ["violet", { en: "edge examined", pt: "aresta examinada" }], ["primary", { en: "tentative · parent edge", pt: "provisório · aresta de pai" }], ["green", { en: "settled", pt: "fixado" }]],
    kpis: [
      { key: "settled", unitKey: "settledUnit", label: { en: "SETTLED", pt: "FIXADOS" }, sub: { en: "nodes with final distance", pt: "nós com distância final" } },
      { key: "open", label: { en: "HEAP", pt: "HEAP" }, sub: { en: "entries waiting", pt: "entradas esperando" } },
      { key: "relaxations", label: { en: "RELAXED", pt: "RELAXADAS" }, sub: { en: "distances improved", pt: "distâncias melhoradas" } },
      KPI_EXAMINED,
      { key: "dist", label: { en: "DIST", pt: "DIST" }, sub: { en: "of the current node", pt: "do nó atual" } },
    ],
    idea: {
      en: [
        "Dijkstra grows a set of settled nodes whose shortest distance is final. Each round it takes the unsettled node with the smallest tentative distance, settles it, and relaxes its edges: if going through it makes a neighbour closer, the neighbour's tentative distance and parent are updated.",
        "It works because with non-negative weights no later path can beat the smallest tentative distance in the heap. The tree of parent edges is the shortest-path tree from the source to every node it reached.",
      ],
      pt: [
        "O Dijkstra faz crescer um conjunto de nós fixados cuja menor distância é definitiva. A cada rodada ele pega o nó não fixado de menor distância provisória, fixa-o e relaxa suas arestas: se passar por ele deixa um vizinho mais perto, a distância provisória e o pai do vizinho são atualizados.",
        "Funciona porque, com pesos não negativos, nenhum caminho posterior consegue vencer a menor distância provisória do heap. A árvore das arestas de pai é a árvore de caminhos mínimos da origem até cada nó alcançado.",
      ],
    },
    stages: [
      ["act", { en: "pop", pt: "retira" }, { en: "smallest tentative distance", pt: "menor distância provisória" }],
      ["green", { en: "settle", pt: "fixa" }, { en: "its distance is final", pt: "sua distância é definitiva" }],
      ["violet", { en: "examine", pt: "examina" }, { en: "each edge out of it", pt: "cada aresta que sai dele" }],
      ["primary", { en: "relax", pt: "relaxa" }, { en: "cheaper: new distance and parent", pt: "mais barato: nova distância e pai" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O((V + E) log V)", "green", { en: "with a binary heap", pt: "com um heap binário" }],
      [{ en: "average", pt: "médio" }, "O((V + E) log V)", "green", { en: "every edge relaxed at most once per settle", pt: "cada aresta relaxada no máximo uma vez por fixação" }],
      [{ en: "worst", pt: "pior" }, "O(E + V log V)", "text", { en: "with a Fibonacci heap", pt: "com um heap de Fibonacci" }],
      [{ en: "space", pt: "espaço" }, "O(V + E)", "text", { en: "heap, distances and parents", pt: "heap, distâncias e pais" }],
    ],
    chartTitle: CHART_TRAVERSAL_TITLE,
    chart: selfIn(CHART_TRAVERSAL, "dijkstra"),
    chartNote: { en: "weighted graph: only Dijkstra, Bellman–Ford and Floyd–Warshall give correct distances", pt: "grafo com pesos: só Dijkstra, Bellman–Ford e Floyd–Warshall dão distâncias corretas" },
    when: {
      en: ["Road networks, network routing (OSPF, IS-IS), any graph with non-negative costs.", "One source, all destinations: run it to exhaustion and read the whole tree."],
      pt: ["Malhas viárias, roteamento de redes (OSPF, IS-IS), qualquer grafo com custos não negativos.", "Uma origem, todos os destinos: rode até esgotar e leia a árvore inteira."],
    },
    pitfalls: {
      en: ["A negative edge breaks the settle-once guarantee. Bellman–Ford handles it, slower.", "Stale heap entries: after a relaxation the old entry is still in the heap; skip it when popped instead of decreasing keys.", "For one destination, stop when it is settled; running to exhaustion wastes the rest."],
      pt: ["Uma aresta negativa quebra a garantia de fixar uma vez. Bellman–Ford resolve, mais devagar.", "Entradas velhas no heap: depois de um relaxamento a entrada antiga ainda está lá; pule-a ao retirar em vez de diminuir chaves.", "Para um destino só, pare quando ele for fixado; rodar até esgotar desperdiça o resto."],
    },
    history: {
      en: "Edsger Dijkstra found the algorithm in 1956 while thinking about the shortest way between Rotterdam and Groningen, and published it in 1959. The heap-based version everyone uses came later; with Fibonacci heaps Fredman and Tarjan reached O(E + V log V) in 1984, still the best bound for sparse graphs.",
      pt: "Edsger Dijkstra descobriu o algoritmo em 1956 pensando no caminho mais curto entre Roterdã e Groningen, e o publicou em 1959. A versão com heap que todo mundo usa veio depois; com heaps de Fibonacci, Fredman e Tarjan chegaram a O(E + V log V) em 1984, ainda o melhor limite para grafos esparsos.",
    },
    file: "dijkstra",
    code: {
      ts: ["function dijkstra(graph: Graph, source: Node) {", "  const dist = new Map([[source, 0]]);", "  const open = new MinHeap([[0, source]]);", "  while (open.size > 0) {", "    const [d, u] = open.pop(); // smallest dist", "    if (d > dist.get(u)!) continue;", "    for (const [v, w] of graph.edges(u)) {", "      const nd = d + w;", "      if (nd >= (dist.get(v) ?? Infinity)) continue;", "      dist.set(v, nd);", "      open.push([nd, v]);", "    }", "  }", "  return dist;", "}"],
      py: ["def dijkstra(graph, source):", "    dist = {source: 0}", "    open_set = [(0, source)]", "    while open_set:", "        d, u = heapq.heappop(open_set)  # smallest dist", "        if d > dist[u]: continue", "        for v, w in graph.edges(u):", "            nd = d + w", "            if nd >= dist.get(v, math.inf): continue", "            dist[v] = nd", "            heapq.heappush(open_set, (nd, v))", "", "", "    return dist", ""],
      java: ["Map<Node,Integer> dijkstra(Graph graph, Node source) {", "  Map<Node,Integer> dist = new HashMap<>(Map.of(source, 0));", "  PriorityQueue<int[]> open = new PriorityQueue<>((a, b) -> a[0] - b[0]); open.add(new int[]{0, source.id});", "  while (!open.isEmpty()) {", "    int[] top = open.poll(); int d = top[0]; Node u = graph.node(top[1]); // smallest dist", "    if (d > dist.get(u)) continue;", "    for (Edge e : graph.edges(u)) {", "      int nd = d + e.w;", "      if (nd >= dist.getOrDefault(e.v, Integer.MAX_VALUE)) continue;", "      dist.put(e.v, nd);", "      open.add(new int[]{nd, e.v.id});", "    }", "  }", "  return dist;", "}"],
      cpp: ["std::unordered_map<Node,int> dijkstra(const Graph& graph, Node source) {", "  std::unordered_map<Node,int> dist{{source, 0}};", "  std::priority_queue<P, std::vector<P>, std::greater<P>> open; open.push({0, source});", "  while (!open.empty()) {", "    auto [d, u] = open.top(); open.pop(); // smallest dist", "    if (d > dist[u]) continue;", "    for (auto [v, w] : graph.edges(u)) {", "      int nd = d + w;", "      if (dist.count(v) && nd >= dist[v]) continue;", "      dist[v] = nd;", "      open.push({nd, v});", "    }", "  }", "  return dist;", "}"],
      c: ["void dijkstra(const Graph *graph, int source, int *dist) {", "  fill(dist, graph->n, INF); dist[source] = 0;", "  Heap open = heap_new(); heap_push(&open, source, 0);", "  while (open.size > 0) {", "    int d; int u = heap_pop(&open, &d); /* smallest dist */", "    if (d > dist[u]) continue;", "    for (int k = 0; k < graph->degree[u]; k++) { int v = graph->adj[u][k], w = graph->weight[u][k];", "      int nd = d + w;", "      if (nd >= dist[v]) continue;", "      dist[v] = nd;", "      heap_push(&open, v, nd);", "    }", "  }", "  ", "}"],
      go: ["func dijkstra(graph Graph, source Node) map[Node]int {", "\tdist := map[Node]int{source: 0}", "\topen := NewMinHeap(); open.Push(source, 0)", "\tfor open.Len() > 0 {", "\t\tu, d := open.Pop() // smallest dist", "\t\tif d > dist[u] { continue }", "\t\tfor _, e := range graph.Edges(u) {", "\t\t\tnd := d + e.W", "\t\t\tif old, ok := dist[e.V]; ok && nd >= old { continue }", "\t\t\tdist[e.V] = nd", "\t\t\topen.Push(e.V, nd)", "\t\t}", "\t}", "\treturn dist", "}"],
      rs: ["fn dijkstra(graph: &Graph, source: Node) -> HashMap<Node, i32> {", "    let mut dist = HashMap::from([(source, 0)]);", "    let mut open = BinaryHeap::from([Reverse((0, source))]);", "    while let Some(Reverse((d, u))) = open.pop() {", "        // popped the entry with the smallest distance", "        if d > dist[&u] { continue; }", "        for (v, w) in graph.edges(u) {", "            let nd = d + w;", "            if nd >= *dist.get(&v).unwrap_or(&i32::MAX) { continue; }", "            dist.insert(v, nd);", "            open.push(Reverse((nd, v)));", "        }", "    }", "    dist", "}"],
    },
    pseudo: {
      en: ["DIJKSTRA(G, s)", "  dist[s] ← 0; heap ← {(0, s)}", "  while heap not empty", "    (d, u) ← pop the smallest; skip if stale", "    for each edge u–v with weight w", "      if d + w < dist[v]: dist[v] ← d + w; parent[v] ← u; push (d + w, v)"],
      pt: ["DIJKSTRA(G, s)", "  dist[s] ← 0; heap ← {(0, s)}", "  enquanto heap não vazio", "    (d, u) ← retira o menor; pula se estiver velho", "    para cada aresta u–v com peso w", "      se d + w < dist[v]: dist[v] ← d + w; pai[v] ← u; empurra (d + w, v)"],
    },
  },

  prim: {
    ...SIZE,
    family: "graphs",
    slug: "prim",
    kind: "graph",
    name: "Prim",
    subtitle: { en: "minimum spanning tree · grow from one node", pt: "árvore geradora mínima · cresce de um nó" },
    tagline: { en: "Prim · always the lightest edge leaving the tree", pt: "Prim · sempre a aresta mais leve que sai da árvore" },
    legend: LEGEND_MST,
    kpis: [
      { key: "treeNodes", unitKey: "treeNodesUnit", label: { en: "IN TREE", pt: "NA ÁRVORE" }, sub: { en: "nodes joined so far", pt: "nós já incluídos" } },
      { key: "treeEdges", label: { en: "TREE EDGES", pt: "ARESTAS" }, sub: { en: "chosen so far", pt: "escolhidas até aqui" } },
      KPI_TOTAL,
      { key: "crossing", label: { en: "CROSSING", pt: "DE CORTE" }, sub: { en: "edges leaving the tree", pt: "arestas saindo da árvore" } },
      { key: "best", label: { en: "LIGHTEST", pt: "MAIS LEVE" }, sub: { en: "weight of the chosen edge", pt: "peso da aresta escolhida" } },
    ],
    idea: {
      en: [
        "Prim's algorithm builds a minimum spanning tree by growing it from one node. At each step it looks at every edge with exactly one endpoint in the tree, the crossing edges, and adds the lightest one together with its outside endpoint. After V − 1 additions every node is in the tree.",
        "It is correct because of the cut property: the lightest edge crossing any cut belongs to some minimum spanning tree. The version shown scans all edges each round; the real one keeps the crossing edges in a heap, exactly like Dijkstra with the edge weight in place of the path length.",
      ],
      pt: [
        "O algoritmo de Prim constrói uma árvore geradora mínima fazendo-a crescer a partir de um nó. A cada passo ele olha toda aresta com exatamente uma ponta na árvore, as arestas de corte, e adiciona a mais leve junto com sua ponta de fora. Depois de V − 1 adições todo nó está na árvore.",
        "Está correto pela propriedade do corte: a aresta mais leve que cruza qualquer corte pertence a alguma árvore geradora mínima. A versão mostrada varre todas as arestas a cada rodada; a real guarda as arestas de corte num heap, exatamente como o Dijkstra com o peso da aresta no lugar do comprimento do caminho.",
      ],
    },
    stages: [
      ["green", { en: "start", pt: "começa" }, { en: "one node is the tree", pt: "um nó é a árvore" }],
      ["violet", { en: "scan", pt: "varre" }, { en: "edges with one endpoint inside", pt: "arestas com uma ponta dentro" }],
      ["act", { en: "pick", pt: "escolhe" }, { en: "the lightest crossing edge", pt: "a aresta de corte mais leve" }],
      ["primary", { en: "grow", pt: "cresce" }, { en: "add it and its outside node", pt: "adiciona ela e o nó de fora" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(E log V)", "green", { en: "with a binary heap of crossing edges", pt: "com um heap de arestas de corte" }],
      [{ en: "average", pt: "médio" }, "O(E log V)", "green", { en: "the usual implementation", pt: "a implementação usual" }],
      [{ en: "worst", pt: "pior" }, "O(V · E)", "neg", { en: "this listing: scanning every edge per round", pt: "esta listagem: varrendo toda aresta por rodada" }],
      [{ en: "space", pt: "espaço" }, "O(V + E)", "text", { en: "the tree set and the edges", pt: "o conjunto da árvore e as arestas" }],
    ],
    chartTitle: CHART_MST_TITLE,
    chart: selfIn(CHART_MST, "prim, scan"),
    chartNote: CHART_MST_NOTE,
    when: {
      en: ["Dense graphs, where E is close to V² and the heap version beats sorting all edges.", "When the tree must be built from a given root, such as a network laid out from the central office."],
      pt: ["Grafos densos, em que E se aproxima de V² e a versão com heap vence ordenar todas as arestas.", "Quando a árvore precisa ser construída a partir de uma raiz dada, como uma rede traçada a partir da central."],
    },
    pitfalls: {
      en: ["Disconnected graph: Prim only spans the component of the start node. Kruskal gives a forest.", "Ties: equal weights can give different but equally minimal trees; do not compare trees, compare weights.", "Scanning all edges each round is O(V · E); use a heap keyed by the lightest crossing edge per node."],
      pt: ["Grafo desconexo: o Prim só cobre o componente do nó inicial. O Kruskal dá uma floresta.", "Empates: pesos iguais podem dar árvores diferentes e igualmente mínimas; não compare árvores, compare pesos.", "Varrer todas as arestas a cada rodada é O(V · E); use um heap com a aresta de corte mais leve por nó."],
    },
    history: {
      en: "Vojtěch Jarník published the algorithm in 1930 to lay out electricity lines in Moravia. Robert Prim rediscovered it at Bell Labs in 1957, and Edsger Dijkstra again in 1959 in the same paper as his shortest-path algorithm, which is why it is sometimes called the Prim–Jarník or DJP algorithm.",
      pt: "Vojtěch Jarník publicou o algoritmo em 1930 para traçar linhas de eletricidade na Morávia. Robert Prim o redescobriu nos Bell Labs em 1957, e Edsger Dijkstra de novo em 1959 no mesmo artigo do seu algoritmo de caminhos mínimos, por isso às vezes é chamado de algoritmo de Prim–Jarník ou DJP.",
    },
    file: "prim",
    code: {
      ts: ["function prim(graph: Graph, start: Node) {", "  const inTree = new Set([start]);", "  const tree: Edge[] = [];", "  while (inTree.size < graph.nodes.length) {", "    let best: Edge | null = null;", "    for (const e of graph.edges) {", "      if (inTree.has(e.u) === inTree.has(e.v)) continue;", "      if (!best || e.w < best.w) best = e;", "    }", "    tree.push(best!);", "    inTree.add(inTree.has(best!.u) ? best!.v : best!.u);", "  }", "  return tree;", "}"],
      py: ["def prim(graph, start):", "    in_tree = {start}", "    tree = []", "    while len(in_tree) < len(graph.nodes):", "        best = None", "        for e in graph.edges:", "            if (e.u in in_tree) == (e.v in in_tree): continue", "            if best is None or e.w < best.w: best = e", "", "        tree.append(best)", "        in_tree.add(best.v if best.u in in_tree else best.u)", "", "    return tree", ""],
      java: ["List<Edge> prim(Graph graph, Node start) {", "  Set<Node> inTree = new HashSet<>(Set.of(start));", "  List<Edge> tree = new ArrayList<>();", "  while (inTree.size() < graph.nodes.size()) {", "    Edge best = null;", "    for (Edge e : graph.edges) {", "      if (inTree.contains(e.u) == inTree.contains(e.v)) continue;", "      if (best == null || e.w < best.w) best = e;", "    }", "    tree.add(best);", "    inTree.add(inTree.contains(best.u) ? best.v : best.u);", "  }", "  return tree;", "}"],
      cpp: ["std::vector<Edge> prim(const Graph& graph, Node start) {", "  std::unordered_set<Node> inTree{start};", "  std::vector<Edge> tree;", "  while (inTree.size() < graph.nodes.size()) {", "    const Edge* best = nullptr;", "    for (const Edge& e : graph.edges) {", "      if (inTree.count(e.u) == inTree.count(e.v)) continue;", "      if (!best || e.w < best->w) best = &e;", "    }", "    tree.push_back(*best);", "    inTree.insert(inTree.count(best->u) ? best->v : best->u);", "  }", "  return tree;", "}"],
      c: ["int prim(const Graph *graph, int start, Edge *tree) {", "  bool in_tree[MAX_N] = {0}; in_tree[start] = true; int size = 1;", "  int count = 0;", "  while (size < graph->n) {", "    const Edge *best = NULL;", "    for (int i = 0; i < graph->m; i++) { const Edge *e = &graph->edges[i];", "      if (in_tree[e->u] == in_tree[e->v]) continue;", "      if (!best || e->w < best->w) best = e;", "    }", "    tree[count++] = *best;", "    in_tree[in_tree[best->u] ? best->v : best->u] = true; size++;", "  }", "  return count;", "}"],
      go: ["func prim(graph Graph, start Node) []Edge {", "\tinTree := map[Node]bool{start: true}", "\ttree := []Edge{}", "\tfor len(inTree) < len(graph.Nodes) {", "\t\tvar best *Edge", "\t\tfor i := range graph.Edges { e := &graph.Edges[i]", "\t\t\tif inTree[e.U] == inTree[e.V] { continue }", "\t\t\tif best == nil || e.W < best.W { best = e }", "\t\t}", "\t\ttree = append(tree, *best)", "\t\tif inTree[best.U] { inTree[best.V] = true } else { inTree[best.U] = true }", "\t}", "\treturn tree", "}"],
      rs: ["fn prim(graph: &Graph, start: Node) -> Vec<Edge> {", "    let mut in_tree = HashSet::from([start]);", "    let mut tree = Vec::new();", "    while in_tree.len() < graph.nodes.len() {", "        let mut best: Option<&Edge> = None;", "        for e in &graph.edges {", "            if in_tree.contains(&e.u) == in_tree.contains(&e.v) { continue; }", "            if best.map_or(true, |b| e.w < b.w) { best = Some(e); }", "        }", "        let e = best.unwrap(); tree.push(e.clone());", "        in_tree.insert(if in_tree.contains(&e.u) { e.v } else { e.u });", "    }", "    tree", "}"],
    },
    pseudo: {
      en: ["PRIM(G, s)", "  tree ← {s}", "  while tree does not span G", "    e ← the lightest edge with one endpoint in tree", "    add e and its other endpoint to tree"],
      pt: ["PRIM(G, s)", "  árvore ← {s}", "  enquanto árvore não cobre G", "    e ← a aresta mais leve com uma ponta na árvore", "    adiciona e e sua outra ponta à árvore"],
    },
  },

  kruskal: {
    ...SIZE,
    family: "graphs",
    slug: "kruskal",
    kind: "graph",
    name: "Kruskal",
    subtitle: { en: "minimum spanning tree · lightest edges first", pt: "árvore geradora mínima · arestas mais leves primeiro" },
    tagline: { en: "Kruskal · sort the edges, skip the ones that close a cycle", pt: "Kruskal · ordena as arestas, pula as que fecham ciclo" },
    legend: [["act", { en: "considered", pt: "considerada" }], ["primary", { en: "accepted", pt: "aceita" }], ["green", { en: "in a tree", pt: "numa árvore" }], ["def", { en: "rejected (dashed)", pt: "rejeitada (tracejada)" }]],
    kpis: [
      { key: "treeEdges", unitKey: "treeEdgesUnit", label: { en: "TREE EDGES", pt: "ARESTAS" }, sub: { en: "accepted so far", pt: "aceitas até aqui" } },
      { key: "rejected", label: { en: "REJECTED", pt: "REJEITADAS" }, sub: { en: "would close a cycle", pt: "fechariam ciclo" } },
      KPI_TOTAL,
      { key: "components", label: { en: "COMPONENTS", pt: "COMPONENTES" }, sub: { en: "forests still apart", pt: "florestas ainda separadas" } },
      { key: "weight", label: { en: "WEIGHT", pt: "PESO" }, sub: { en: "of the edge considered", pt: "da aresta considerada" } },
    ],
    idea: {
      en: [
        "Kruskal's algorithm sorts every edge by weight and walks the list, accepting an edge whenever its two endpoints are still in different pieces of the forest, and rejecting it when they are already connected, because then it would close a cycle. After V − 1 acceptances the forest is one tree.",
        "The 'already connected' question is answered by a union-find structure: each node points to a representative, find follows the pointers, union merges two sets. With path compression it is almost O(1), so sorting the edges is the whole cost.",
      ],
      pt: [
        "O algoritmo de Kruskal ordena toda aresta por peso e percorre a lista, aceitando uma aresta sempre que suas duas pontas ainda estão em pedaços diferentes da floresta, e rejeitando-a quando já estão conectadas, porque então ela fecharia um ciclo. Depois de V − 1 aceitações a floresta é uma árvore só.",
        "A pergunta 'já conectados?' é respondida por uma estrutura union-find: cada nó aponta para um representante, find segue os ponteiros, union funde dois conjuntos. Com compressão de caminho é quase O(1), então ordenar as arestas é o custo inteiro.",
      ],
    },
    stages: [
      ["violet", { en: "sort", pt: "ordena" }, { en: "all edges, lightest first", pt: "todas as arestas, mais leves primeiro" }],
      ["act", { en: "consider", pt: "considera" }, { en: "the next edge in the list", pt: "a próxima aresta da lista" }],
      ["swap", { en: "reject", pt: "rejeita" }, { en: "same component: it would close a cycle", pt: "mesmo componente: fecharia um ciclo" }],
      ["primary", { en: "accept", pt: "aceita" }, { en: "different components: union them", pt: "componentes diferentes: une os dois" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(E log E)", "green", { en: "the sort dominates", pt: "a ordenação domina" }],
      [{ en: "average", pt: "médio" }, "O(E log E)", "green", { en: "union-find is near constant per edge", pt: "o union-find é quase constante por aresta" }],
      [{ en: "worst", pt: "pior" }, "O(E log E)", "green", { en: "same: the input order does not matter", pt: "igual: a ordem da entrada não importa" }],
      [{ en: "space", pt: "espaço" }, "O(V + E)", "text", { en: "sorted edges and the union-find", pt: "arestas ordenadas e o union-find" }],
    ],
    chartTitle: CHART_MST_TITLE,
    chart: selfIn(CHART_MST, "kruskal"),
    chartNote: CHART_MST_NOTE,
    when: {
      en: ["Sparse graphs, where sorting E edges is cheap and Prim's heap has nothing to gain.", "Edges that arrive already sorted, or a forest instead of a tree: Kruskal handles disconnected graphs for free."],
      pt: ["Grafos esparsos, em que ordenar E arestas é barato e o heap do Prim não ganha nada.", "Arestas que já chegam ordenadas, ou uma floresta em vez de uma árvore: o Kruskal lida com grafos desconexos de graça."],
    },
    pitfalls: {
      en: ["Union-find without path compression or union by rank degrades to O(V) per find.", "Stopping after V − 1 accepted edges saves the tail of the list; the naive loop scans it all.", "On dense graphs sorting V² edges loses to Prim with a heap."],
      pt: ["Union-find sem compressão de caminho ou união por ranking degrada para O(V) por find.", "Parar depois de V − 1 arestas aceitas economiza o fim da lista; o laço ingênuo varre tudo.", "Em grafos densos ordenar V² arestas perde para o Prim com heap."],
    },
    history: {
      en: "Joseph Kruskal published the algorithm in 1956, one year before Prim, as a proof about the shortest spanning subtree of a graph. The union-find structure that makes it fast was analysed by Tarjan in 1975, who showed its near-constant inverse-Ackermann bound.",
      pt: "Joseph Kruskal publicou o algoritmo em 1956, um ano antes de Prim, como uma prova sobre a menor subárvore geradora de um grafo. A estrutura union-find que o torna rápido foi analisada por Tarjan em 1975, que mostrou seu limite quase constante pela inversa de Ackermann.",
    },
    file: "kruskal",
    code: {
      ts: ["function kruskal(graph: Graph) {", "  const edges = [...graph.edges].sort((a, b) => a.w - b.w);", "  const uf = new UnionFind(graph.nodes.length);", "  const tree: Edge[] = [];", "  for (const e of edges) {", "    if (uf.find(e.u) === uf.find(e.v)) continue;", "    uf.union(e.u, e.v);", "    tree.push(e);", "  }", "  return tree;", "}"],
      py: ["def kruskal(graph):", "    edges = sorted(graph.edges, key=lambda e: e.w)", "    uf = UnionFind(len(graph.nodes))", "    tree = []", "    for e in edges:", "        if uf.find(e.u) == uf.find(e.v): continue", "        uf.union(e.u, e.v)", "        tree.append(e)", "", "    return tree", ""],
      java: ["List<Edge> kruskal(Graph graph) {", "  List<Edge> edges = new ArrayList<>(graph.edges); edges.sort(Comparator.comparingInt(e -> e.w));", "  UnionFind uf = new UnionFind(graph.nodes.size());", "  List<Edge> tree = new ArrayList<>();", "  for (Edge e : edges) {", "    if (uf.find(e.u) == uf.find(e.v)) continue;", "    uf.union(e.u, e.v);", "    tree.add(e);", "  }", "  return tree;", "}"],
      cpp: ["std::vector<Edge> kruskal(const Graph& graph) {", "  std::vector<Edge> edges = graph.edges; std::sort(edges.begin(), edges.end(), byWeight);", "  UnionFind uf(graph.nodes.size());", "  std::vector<Edge> tree;", "  for (const Edge& e : edges) {", "    if (uf.find(e.u) == uf.find(e.v)) continue;", "    uf.unite(e.u, e.v);", "    tree.push_back(e);", "  }", "  return tree;", "}"],
      c: ["int kruskal(const Graph *graph, Edge *tree) {", "  Edge edges[MAX_M]; memcpy(edges, graph->edges, graph->m * sizeof(Edge)); qsort(edges, graph->m, sizeof(Edge), by_weight);", "  UnionFind uf = uf_new(graph->n);", "  int count = 0;", "  for (int i = 0; i < graph->m; i++) { Edge e = edges[i];", "    if (uf_find(&uf, e.u) == uf_find(&uf, e.v)) continue;", "    uf_union(&uf, e.u, e.v);", "    tree[count++] = e;", "  }", "  return count;", "}"],
      go: ["func kruskal(graph Graph) []Edge {", "\tedges := append([]Edge{}, graph.Edges...); sort.Slice(edges, func(i, j int) bool { return edges[i].W < edges[j].W })", "\tuf := NewUnionFind(len(graph.Nodes))", "\ttree := []Edge{}", "\tfor _, e := range edges {", "\t\tif uf.Find(e.U) == uf.Find(e.V) { continue }", "\t\tuf.Union(e.U, e.V)", "\t\ttree = append(tree, e)", "\t}", "\treturn tree", "}"],
      rs: ["fn kruskal(graph: &Graph) -> Vec<Edge> {", "    let mut edges = graph.edges.clone(); edges.sort_by_key(|e| e.w);", "    let mut uf = UnionFind::new(graph.nodes.len());", "    let mut tree = Vec::new();", "    for e in edges {", "        if uf.find(e.u) == uf.find(e.v) { continue; }", "        uf.union(e.u, e.v);", "        tree.push(e);", "    }", "    tree", "}"],
    },
    pseudo: {
      en: ["KRUSKAL(G)", "  sort edges by weight; every node its own set", "  for each edge u–v in that order", "    if find(u) ≠ find(v): union(u, v); add u–v to the tree"],
      pt: ["KRUSKAL(G)", "  ordena as arestas por peso; cada nó no próprio conjunto", "  para cada aresta u–v nessa ordem", "    se find(u) ≠ find(v): union(u, v); adiciona u–v à árvore"],
    },
  },

  topological: {
    ...SIZE,
    family: "graphs",
    slug: "topological-sort",
    kind: "graph",
    name: "Topological sort",
    subtitle: { en: "DAG · every dependency before its dependents", pt: "DAG · toda dependência antes dos dependentes" },
    tagline: { en: "topological sort · what order do the tasks go in", pt: "ordenação topológica · em que ordem as tarefas vão" },
    legend: [["act", { en: "being placed", pt: "sendo colocado" }], ["primary", { en: "in-degree 0 · edge removed", pt: "grau 0 · aresta removida" }], ["green", { en: "placed", pt: "colocado" }], ["def", { en: "waiting on edges", pt: "esperando arestas" }]],
    kpis: [
      { key: "ordered", unitKey: "orderedUnit", label: { en: "PLACED", pt: "COLOCADOS" }, sub: { en: "nodes in the order", pt: "nós na ordem" } },
      { key: "queue", label: { en: "QUEUE", pt: "FILA" }, sub: { en: "nodes with in-degree 0", pt: "nós com grau de entrada 0" } },
      { key: "removed", unitKey: "removedUnit", label: { en: "EDGES", pt: "ARESTAS" }, sub: { en: "processed", pt: "processadas" } },
      { key: "current", label: { en: "CURRENT", pt: "ATUAL" }, sub: { en: "node being placed", pt: "nó sendo colocado" } },
      { key: "order", label: { en: "ORDER", pt: "ORDEM" }, sub: { en: "the sequence so far", pt: "a sequência até aqui" } },
    ],
    idea: {
      en: [
        "Kahn's algorithm orders the nodes of a directed acyclic graph so that every edge points forward. It counts the incoming edges of each node, starts with the nodes that have none, and repeatedly takes one, appends it to the order, and removes its outgoing edges. Whenever a node's count drops to zero, it becomes available.",
        "If the graph has a cycle the queue empties before every node is placed: no order exists. That makes the same loop a cycle detector, which is how build systems, package managers and spreadsheets refuse circular dependencies.",
      ],
      pt: [
        "O algoritmo de Kahn ordena os nós de um grafo direcionado acíclico de modo que toda aresta aponte para a frente. Ele conta as arestas de entrada de cada nó, começa pelos nós que não têm nenhuma, e repetidamente pega um, anexa à ordem e remove suas arestas de saída. Sempre que a contagem de um nó cai a zero, ele fica disponível.",
        "Se o grafo tem um ciclo a fila esvazia antes de todo nó ser colocado: não existe ordem. Isso faz do mesmo laço um detector de ciclos, e é assim que sistemas de build, gerenciadores de pacotes e planilhas recusam dependências circulares.",
      ],
    },
    stages: [
      ["violet", { en: "count", pt: "conta" }, { en: "in-degree of every node", pt: "grau de entrada de cada nó" }],
      ["primary", { en: "sources", pt: "fontes" }, { en: "in-degree 0 go into the queue", pt: "grau de entrada 0 vão para a fila" }],
      ["act", { en: "place", pt: "coloca" }, { en: "dequeue one, append to the order", pt: "desenfileira um, anexa à ordem" }],
      ["green", { en: "release", pt: "libera" }, { en: "remove its edges; new zeros join the queue", pt: "remove suas arestas; novos zeros entram na fila" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(V + E)", "green", { en: "every node and edge once", pt: "cada nó e aresta uma vez" }],
      [{ en: "average", pt: "médio" }, "O(V + E)", "green", { en: "linear in the size of the graph", pt: "linear no tamanho do grafo" }],
      [{ en: "worst", pt: "pior" }, "O(V + E)", "green", { en: "a cycle stops it early, still linear", pt: "um ciclo para cedo, ainda linear" }],
      [{ en: "space", pt: "espaço" }, "O(V)", "text", { en: "queue and in-degrees", pt: "fila e graus de entrada" }],
    ],
    chartTitle: { en: "EDGES PROCESSED · 1 000 TASKS, 3 000 DEPENDENCIES", pt: "ARESTAS PROCESSADAS · 1.000 TAREFAS, 3.000 DEPENDÊNCIAS" },
    chart: [["kahn", 3000, true], ["dfs post-order", 3000], ["longest path (dp)", 3000], ["cycle check only", 3000], ["naive source scan", 3000000]],
    chartNote: { en: "both linear methods give a valid order; the naive one rescans every node per step", pt: "os dois métodos lineares dão uma ordem válida; o ingênuo revarre todo nó a cada passo" },
    when: {
      en: ["Dependency resolution: build steps, package installs, spreadsheet cells, course prerequisites.", "Scheduling with precedence constraints, and as the first pass of dynamic programming over a DAG."],
      pt: ["Resolução de dependências: etapas de build, instalação de pacotes, células de planilha, pré-requisitos de curso.", "Escalonamento com restrições de precedência, e como o primeiro passo de programação dinâmica sobre um DAG."],
    },
    pitfalls: {
      en: ["A cycle leaves nodes unplaced; check that the order has V nodes, or you silently drop tasks.", "Many valid orders exist; if determinism matters, use a priority queue instead of a plain queue.", "Modifying in-degrees of a shared graph makes the routine non-reentrant; copy the counts."],
      pt: ["Um ciclo deixa nós sem colocar; confira que a ordem tem V nós, ou tarefas somem em silêncio.", "Existem muitas ordens válidas; se determinismo importa, use fila de prioridade em vez de fila simples.", "Alterar os graus de entrada de um grafo compartilhado torna a rotina não reentrante; copie as contagens."],
    },
    history: {
      en: "Arthur Kahn published this algorithm in 1962 for scheduling large projects with PERT networks. Tarjan gave the depth-first alternative in 1976, and every build system since make in 1976 has been, at its heart, a topological sort of a dependency graph.",
      pt: "Arthur Kahn publicou este algoritmo em 1962 para escalonar grandes projetos com redes PERT. Tarjan deu a alternativa por busca em profundidade em 1976, e todo sistema de build desde o make, de 1976, é, no fundo, uma ordenação topológica de um grafo de dependências.",
    },
    file: "topological_sort",
    code: {
      ts: ["function topologicalSort(graph: DAG) {", "  const indeg = new Map(graph.nodes.map((n) => [n, 0]));", "  for (const [u, v] of graph.edges) indeg.set(v, indeg.get(v)! + 1);", "  const queue = graph.nodes.filter((n) => indeg.get(n) === 0);", "  const order: Node[] = [];", "  while (queue.length > 0) {", "    const u = queue.shift()!;", "    order.push(u);", "    for (const v of graph.successors(u)) {", "      indeg.set(v, indeg.get(v)! - 1);", "      if (indeg.get(v) === 0) queue.push(v);", "    }", "  }", "  return order;", "}"],
      py: ["def topological_sort(graph):", "    indeg = {n: 0 for n in graph.nodes}", "    for u, v in graph.edges: indeg[v] += 1", "    queue = deque(n for n in graph.nodes if indeg[n] == 0)", "    order = []", "    while queue:", "        u = queue.popleft()", "        order.append(u)", "        for v in graph.successors(u):", "            indeg[v] -= 1", "            if indeg[v] == 0: queue.append(v)", "", "", "    return order", ""],
      java: ["List<Node> topologicalSort(Dag graph) {", "  Map<Node,Integer> indeg = new HashMap<>(); graph.nodes.forEach(n -> indeg.put(n, 0));", "  for (Edge e : graph.edges) indeg.merge(e.v, 1, Integer::sum);", "  Deque<Node> queue = new ArrayDeque<>(); graph.nodes.stream().filter(n -> indeg.get(n) == 0).forEach(queue::add);", "  List<Node> order = new ArrayList<>();", "  while (!queue.isEmpty()) {", "    Node u = queue.poll();", "    order.add(u);", "    for (Node v : graph.successors(u)) {", "      indeg.merge(v, -1, Integer::sum);", "      if (indeg.get(v) == 0) queue.add(v);", "    }", "  }", "  return order;", "}"],
      cpp: ["std::vector<Node> topologicalSort(const Dag& graph) {", "  std::unordered_map<Node,int> indeg; for (Node n : graph.nodes) indeg[n] = 0;", "  for (auto [u, v] : graph.edges) indeg[v]++;", "  std::queue<Node> queue; for (Node n : graph.nodes) if (indeg[n] == 0) queue.push(n);", "  std::vector<Node> order;", "  while (!queue.empty()) {", "    Node u = queue.front(); queue.pop();", "    order.push_back(u);", "    for (Node v : graph.successors(u)) {", "      indeg[v]--;", "      if (indeg[v] == 0) queue.push(v);", "    }", "  }", "  return order;", "}"],
      c: ["int topological_sort(const Dag *graph, int *order) {", "  int indeg[MAX_N] = {0};", "  for (int i = 0; i < graph->m; i++) indeg[graph->edges[i].v]++;", "  Queue queue = queue_new(); for (int n = 0; n < graph->n; n++) if (indeg[n] == 0) queue_push(&queue, n);", "  int count = 0;", "  while (queue.size > 0) {", "    int u = queue_pop(&queue);", "    order[count++] = u;", "    for (int k = 0; k < graph->out_degree[u]; k++) { int v = graph->succ[u][k];", "      indeg[v]--;", "      if (indeg[v] == 0) queue_push(&queue, v);", "    }", "  }", "  return count;", "}"],
      go: ["func topologicalSort(graph Dag) []Node {", "\tindeg := map[Node]int{}; for _, n := range graph.Nodes { indeg[n] = 0 }", "\tfor _, e := range graph.Edges { indeg[e.V]++ }", "\tqueue := []Node{}; for _, n := range graph.Nodes { if indeg[n] == 0 { queue = append(queue, n) } }", "\torder := []Node{}", "\tfor len(queue) > 0 {", "\t\tu := queue[0]; queue = queue[1:]", "\t\torder = append(order, u)", "\t\tfor _, v := range graph.Successors(u) {", "\t\t\tindeg[v]--", "\t\t\tif indeg[v] == 0 { queue = append(queue, v) }", "\t\t}", "\t}", "\treturn order", "}"],
      rs: ["fn topological_sort(graph: &Dag) -> Vec<Node> {", "    let mut indeg: HashMap<Node, usize> = graph.nodes.iter().map(|&n| (n, 0)).collect();", "    for &(_, v) in &graph.edges { *indeg.get_mut(&v).unwrap() += 1; }", "    let mut queue: VecDeque<Node> = graph.nodes.iter().copied().filter(|n| indeg[n] == 0).collect();", "    let mut order = Vec::new();", "    while let Some(u) = queue.pop_front() {", "        // u has no remaining incoming edges", "        order.push(u);", "        for v in graph.successors(u) {", "            *indeg.get_mut(&v).unwrap() -= 1;", "            if indeg[&v] == 0 { queue.push_back(v); }", "        }", "    }", "    order", "}"],
    },
    pseudo: {
      en: ["KAHN(G)", "  indeg[v] ← number of edges into v", "  queue ← every v with indeg[v] = 0; order ← []", "  while queue not empty", "    u ← dequeue; append u to order", "    for each edge u → v: indeg[v] ← indeg[v] − 1; if 0: enqueue v", "  if |order| < |V|: the graph has a cycle"],
      pt: ["KAHN(G)", "  grau[v] ← número de arestas que entram em v", "  fila ← todo v com grau[v] = 0; ordem ← []", "  enquanto fila não vazia", "    u ← desenfileira; anexa u à ordem", "    para cada aresta u → v: grau[v] ← grau[v] − 1; se 0: enfileira v", "  se |ordem| < |V|: o grafo tem um ciclo"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
