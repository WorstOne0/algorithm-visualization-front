// Models
import type { Localized } from "../translations";
import type { VizKey } from "../viz";
import type { AlgorithmSpec, KpiSpec } from "./spec";

const SIZE = { sizeLabel: { en: "Nodes", pt: "Nós" }, minN: 6, maxN: 16, stepN: 2, defaultN: 10, shuffleLabel: { en: "New graph", pt: "Novo grafo" }, stepMs: 420, family: "graphs", kind: "graph" } as const;

const LEGEND_SCC: [VizKey, Localized][] = [["act", { en: "current", pt: "atual" }], ["primary", { en: "on the stack · tree edge", pt: "na pilha · aresta de árvore" }], ["violet", { en: "back edge", pt: "aresta de retorno" }], ["green", { en: "in a component", pt: "num componente" }]];

const KPI_COMPONENTS: KpiSpec = { key: "components", label: { en: "COMPONENTS", pt: "COMPONENTES" }, sub: { en: "found so far", pt: "encontrados até aqui" } };
const KPI_LARGEST: KpiSpec = { key: "largest", label: { en: "LARGEST", pt: "MAIOR" }, sub: { en: "nodes in the biggest component", pt: "nós no maior componente" } };

const CHART_SP: [string, number, boolean?][] = [["dijkstra", 6000], ["bellman-ford", 3000000], ["floyd-warshall", 1000000000], ["johnson", 9000000]];
const CHART_SP_TITLE = { en: "EDGE RELAXATIONS · 1 000 NODES, 3 000 EDGES", pt: "RELAXAMENTOS DE ARESTA · 1.000 NÓS, 3.000 ARESTAS" };
const CHART_SCC: [string, number, boolean?][] = [["tarjan", 4000], ["kosaraju", 8000], ["naive (bfs per node)", 4000000]];
const CHART_SCC_TITLE = { en: "EDGE VISITS · 1 000 NODES, 3 000 EDGES", pt: "VISITAS A ARESTAS · 1.000 NÓS, 3.000 ARESTAS" };

const selfIn = (chart: [string, number, boolean?][], label: string): [string, number, boolean?][] => chart.map(([name, value]) => (name === label ? [name, value, true] : [name, value]));

export const GRAPHS_MORE = {
  bellmanFord: {
    ...SIZE,
    slug: "bellman-ford",
    name: "Bellman-Ford",
    subtitle: { en: "shortest paths · negative edges allowed", pt: "caminhos mínimos · arestas negativas permitidas" },
    tagline: { en: "Bellman-Ford · relax every edge, V − 1 times, and negative weights stop being a problem", pt: "Bellman-Ford · relaxa toda aresta, V − 1 vezes, e pesos negativos deixam de ser problema" },
    legend: [["act", { en: "edge examined", pt: "aresta examinada" }], ["primary", { en: "parent edge · improved", pt: "aresta de pai · melhorado" }], ["def", { en: "skipped (dashed)", pt: "pulada (tracejada)" }], ["green", { en: "final", pt: "definitivo" }]],
    kpis: [{ key: "round", unitKey: "roundUnit", label: { en: "ROUND", pt: "RODADA" }, sub: { en: "passes over the edge list", pt: "passadas pela lista de arestas" } }, { key: "relaxations", label: { en: "RELAXED", pt: "RELAXADAS" }, sub: { en: "distances improved", pt: "distâncias melhoradas" } }, { key: "examined", label: { en: "CHECKS", pt: "CHECAGENS" }, sub: { en: "edges looked at", pt: "arestas examinadas" } }, { key: "negative", label: { en: "NEGATIVE", pt: "NEGATIVAS" }, sub: { en: "edges with weight below zero", pt: "arestas com peso abaixo de zero" } }, { key: "reached", label: { en: "REACHED", pt: "ALCANÇADOS" }, sub: { en: "nodes with a finite distance", pt: "nós com distância finita" } }],
    idea: {
      en: [
        "Bellman-Ford makes no assumption about the order in which nodes are settled. It simply relaxes every edge, in any order, and repeats: after one full pass every shortest path of one edge is correct, after two passes every path of two edges, and so on. V − 1 passes cover every simple path, so the distances are final.",
        "Because it never commits to a node early, negative edge weights are fine. One extra pass tells whether anything still improves; if it does, a negative cycle is reachable and no shortest path exists. The price is V · E work instead of Dijkstra's E log V.",
      ],
      pt: [
        "O Bellman-Ford não supõe nada sobre a ordem em que os nós são fixados. Ele simplesmente relaxa toda aresta, em qualquer ordem, e repete: depois de uma passada inteira todo caminho mínimo de uma aresta está correto, depois de duas todo caminho de duas arestas, e assim por diante. V − 1 passadas cobrem todo caminho simples, então as distâncias ficam definitivas.",
        "Como nunca se compromete cedo com um nó, pesos negativos não incomodam. Uma passada extra diz se ainda algo melhora; se sim, um ciclo negativo é alcançável e não existe caminho mínimo. O preço é V · E de trabalho em vez do E log V do Dijkstra.",
      ],
    },
    stages: [
      ["primary", { en: "init", pt: "inicia" }, { en: "source 0, everything else ∞", pt: "origem 0, todo o resto ∞" }],
      ["act", { en: "relax", pt: "relaxa" }, { en: "every edge, in list order", pt: "toda aresta, na ordem da lista" }],
      ["violet", { en: "repeat", pt: "repete" }, { en: "V − 1 rounds, or until a round changes nothing", pt: "V − 1 rodadas, ou até uma rodada não mudar nada" }],
      ["green", { en: "check", pt: "checa" }, { en: "one more round: any change means a negative cycle", pt: "mais uma rodada: qualquer mudança significa ciclo negativo" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(E)", "green", { en: "edges in a lucky order: one round settles everything", pt: "arestas numa ordem sortuda: uma rodada fixa tudo" }],
      [{ en: "average", pt: "médio" }, "O(V · E)", "text", { en: "early exit helps on most graphs", pt: "a saída antecipada ajuda na maioria dos grafos" }],
      [{ en: "worst", pt: "pior" }, "O(V · E)", "neg", { en: "a chain relaxed back to front", pt: "uma cadeia relaxada de trás para a frente" }],
      [{ en: "space", pt: "espaço" }, "O(V)", "text", { en: "distances and parents", pt: "distâncias e pais" }],
    ],
    chartTitle: CHART_SP_TITLE,
    chart: selfIn(CHART_SP, "bellman-ford"),
    chartNote: { en: "only Bellman-Ford and Floyd-Warshall accept negative edges", pt: "só Bellman-Ford e Floyd-Warshall aceitam arestas negativas" },
    when: {
      en: ["Graphs with negative edges: currency arbitrage, difference constraints, potentials for Johnson's algorithm.", "Distributed routing, where each node only relaxes its own edges: RIP is Bellman-Ford over the network."],
      pt: ["Grafos com arestas negativas: arbitragem de moedas, restrições de diferença, potenciais para o algoritmo de Johnson.", "Roteamento distribuído, em que cada nó relaxa só suas arestas: o RIP é o Bellman-Ford sobre a rede."],
    },
    pitfalls: {
      en: ["V · E on a big graph is slow; with non-negative weights use Dijkstra.", "Skipping the final check silently returns garbage on a negative cycle.", "Edge order matters for the early exit: forward-sorted edges settle a DAG in one round."],
      pt: ["V · E num grafo grande é lento; com pesos não negativos use Dijkstra.", "Pular a checagem final devolve lixo em silêncio num ciclo negativo.", "A ordem das arestas importa para a saída antecipada: arestas em ordem topológica fixam um DAG numa rodada."],
    },
    history: {
      en: "Alfonso Shimbel described the relaxation scheme in 1955; Lester Ford Jr. published it in 1956 and Richard Bellman in 1958, and Edward Moore independently in 1957, which is why it is sometimes Bellman-Ford-Moore. Its distributed form ran the ARPANET's routing in the 1970s.",
      pt: "Alfonso Shimbel descreveu o esquema de relaxamento em 1955; Lester Ford Jr. o publicou em 1956 e Richard Bellman em 1958, e Edward Moore de forma independente em 1957, por isso às vezes é Bellman-Ford-Moore. Sua forma distribuída rodou o roteamento da ARPANET nos anos 1970.",
    },
    file: "bellman_ford",
    code: {
      ts: ["function bellmanFord(graph: Graph, source: Node) {", "  const distance = new Map(graph.nodes.map((node) => [node, Infinity])); distance.set(source, 0);", "  for (let round = 1; round < graph.nodes.length; round++) {", "    let changed = false;", "    for (const edge of graph.edges) {", "      const candidate = distance.get(edge.from)! + edge.weight;", "      if (candidate >= distance.get(edge.to)!) continue;", "      distance.set(edge.to, candidate); changed = true;", "    }", "    if (!changed) break;", "  }", "  for (const edge of graph.edges) if (distance.get(edge.from)! + edge.weight < distance.get(edge.to)!) throw new Error(\"negative cycle\");", "  return distance;", "}"],
      py: ["def bellman_ford(graph, source):", "    distance = {node: math.inf for node in graph.nodes}; distance[source] = 0", "    for _ in range(len(graph.nodes) - 1):", "        changed = False", "        for edge in graph.edges:", "            candidate = distance[edge.source] + edge.weight", "            if candidate >= distance[edge.target]: continue", "            distance[edge.target] = candidate; changed = True", "", "        if not changed: break", "", "    if any(distance[edge.source] + edge.weight < distance[edge.target] for edge in graph.edges): raise ValueError(\"negative cycle\")", "    return distance", ""],
      java: ["Map<Node,Integer> bellmanFord(Graph graph, Node source) {", "  Map<Node,Integer> distance = new HashMap<>(); graph.nodes.forEach(node -> distance.put(node, Integer.MAX_VALUE / 2)); distance.put(source, 0);", "  for (int round = 1; round < graph.nodes.size(); round++) {", "    boolean changed = false;", "    for (Edge edge : graph.edges) {", "      int candidate = distance.get(edge.from) + edge.weight;", "      if (candidate >= distance.get(edge.to)) continue;", "      distance.put(edge.to, candidate); changed = true;", "    }", "    if (!changed) break;", "  }", "  for (Edge edge : graph.edges) if (distance.get(edge.from) + edge.weight < distance.get(edge.to)) throw new IllegalStateException(\"negative cycle\");", "  return distance;", "}"],
      cpp: ["std::unordered_map<Node,int> bellmanFord(const Graph& graph, Node source) {", "  std::unordered_map<Node,int> distance; for (Node node : graph.nodes) distance[node] = INF; distance[source] = 0;", "  for (size_t round = 1; round < graph.nodes.size(); round++) {", "    bool changed = false;", "    for (const Edge& edge : graph.edges) {", "      int candidate = distance[edge.from] + edge.weight;", "      if (distance[edge.from] == INF || candidate >= distance[edge.to]) continue;", "      distance[edge.to] = candidate; changed = true;", "    }", "    if (!changed) break;", "  }", "  for (const Edge& edge : graph.edges) if (distance[edge.from] != INF && distance[edge.from] + edge.weight < distance[edge.to]) throw std::runtime_error(\"negative cycle\");", "  return distance;", "}"],
      c: ["int bellman_ford(const Graph *graph, int source, int *distance) {", "  fill(distance, graph->node_count, INF); distance[source] = 0;", "  for (int round = 1; round < graph->node_count; round++) {", "    int changed = 0;", "    for (int i = 0; i < graph->edge_count; i++) { const Edge *edge = &graph->edges[i];", "      int candidate = distance[edge->from] + edge->weight;", "      if (distance[edge->from] == INF || candidate >= distance[edge->to]) continue;", "      distance[edge->to] = candidate; changed = 1;", "    }", "    if (!changed) break;", "  }", "  for (int i = 0; i < graph->edge_count; i++) if (distance[graph->edges[i].from] != INF && distance[graph->edges[i].from] + graph->edges[i].weight < distance[graph->edges[i].to]) return -1; /* negative cycle */", "  return 0;", "}"],
      go: ["func bellmanFord(graph Graph, source Node) (map[Node]int, error) {", "\tdistance := map[Node]int{}; for _, node := range graph.Nodes { distance[node] = math.MaxInt / 2 }; distance[source] = 0", "\tfor round := 1; round < len(graph.Nodes); round++ {", "\t\tchanged := false", "\t\tfor _, edge := range graph.Edges {", "\t\t\tcandidate := distance[edge.From] + edge.Weight", "\t\t\tif candidate >= distance[edge.To] { continue }", "\t\t\tdistance[edge.To] = candidate; changed = true", "\t\t}", "\t\tif !changed { break }", "\t}", "\tfor _, edge := range graph.Edges { if distance[edge.From]+edge.Weight < distance[edge.To] { return nil, errors.New(\"negative cycle\") } }", "\treturn distance, nil", "}"],
      rs: ["fn bellman_ford(graph: &Graph, source: Node) -> Result<HashMap<Node, i64>, &'static str> {", "    let mut distance: HashMap<Node, i64> = graph.nodes.iter().map(|&node| (node, i64::MAX / 2)).collect(); distance.insert(source, 0);", "    for _round in 1..graph.nodes.len() {", "        let mut changed = false;", "        for edge in &graph.edges {", "            let candidate = distance[&edge.from] + edge.weight;", "            if candidate >= distance[&edge.to] { continue; }", "            distance.insert(edge.to, candidate); changed = true;", "        }", "        if !changed { break; }", "    }", "    if graph.edges.iter().any(|edge| distance[&edge.from] + edge.weight < distance[&edge.to]) { return Err(\"negative cycle\"); }", "    Ok(distance)", "}"],
    },
    pseudo: {
      en: ["BELLMANFORD(graph, source)", "  dist[source] ← 0; every other dist ← ∞", "  repeat V − 1 times, or until a round changes nothing", "    for each edge from → to with weight: if dist[from] + weight < dist[to]: dist[to] ← dist[from] + weight", "  one more round: if anything still improves, a negative cycle exists"],
      pt: ["BELLMANFORD(grafo, origem)", "  dist[origem] ← 0; toda outra dist ← ∞", "  repete V − 1 vezes, ou até uma rodada não mudar nada", "    para cada aresta origem → destino com peso: se dist[origem] + peso < dist[destino]: dist[destino] ← dist[origem] + peso", "  mais uma rodada: se algo ainda melhora, existe ciclo negativo"],
    },
  },

  floydWarshall: {
    ...SIZE,
    minN: 5,
    maxN: 9,
    stepN: 1,
    defaultN: 7,
    slug: "floyd-warshall",
    name: "Floyd-Warshall",
    subtitle: { en: "all pairs · the distance matrix", pt: "todos os pares · a matriz de distâncias" },
    tagline: { en: "Floyd-Warshall · three nested loops and every pair is done", pt: "Floyd-Warshall · três laços aninhados e todo par está pronto" },
    legend: [["act", { en: "pivot node", pt: "nó pivô" }], ["primary", { en: "row being updated · cell improved", pt: "linha em atualização · célula melhorada" }], ["vis", { en: "pivot row and column", pt: "linha e coluna do pivô" }], ["violet", { en: "pivot label", pt: "rótulo do pivô" }]],
    kpis: [{ key: "pivot", unitKey: "pivotUnit", label: { en: "PIVOT", pt: "PIVÔ" }, sub: { en: "node paths may pass through", pt: "nó pelo qual os caminhos podem passar" } }, { key: "improvements", label: { en: "IMPROVED", pt: "MELHORADAS" }, sub: { en: "cells that got shorter", pt: "células que encurtaram" } }, { key: "checks", label: { en: "CHECKS", pt: "CHECAGENS" }, sub: { en: "of n³ in total", pt: "de n³ no total" } }, { key: "pairs", label: { en: "REACHABLE", pt: "ALCANÇÁVEIS" }, sub: { en: "pairs with a finite distance", pt: "pares com distância finita" } }, { key: "reachable", label: { en: "FINITE", pt: "FINITAS" }, sub: { en: "cells of the matrix", pt: "células da matriz" } }],
    idea: {
      en: [
        "Floyd-Warshall computes the shortest distance between every pair of nodes at once, in a matrix. It adds the nodes one at a time as allowed intermediates: after pivot k, the cell [i][j] holds the shortest path from i to j that only passes through the first k nodes. The update is one line: if going through k is shorter, take it.",
        "That is dynamic programming over the set of allowed intermediates, and the matrix can be updated in place. n³ steps is a lot, but for a few hundred nodes it is simpler and often faster than running Dijkstra from every node, and it takes negative edges in its stride.",
      ],
      pt: [
        "O Floyd-Warshall calcula a distância mínima entre todo par de nós de uma vez, numa matriz. Ele adiciona os nós um por vez como intermediários permitidos: depois do pivô k, a célula [i][j] guarda o caminho mínimo de i a j que só passa pelos primeiros k nós. A atualização é uma linha: se passar por k é mais curto, pega.",
        "Isso é programação dinâmica sobre o conjunto de intermediários permitidos, e a matriz pode ser atualizada no lugar. n³ passos é muito, mas para algumas centenas de nós é mais simples e muitas vezes mais rápido que rodar Dijkstra de cada nó, e engole arestas negativas sem reclamar.",
      ],
    },
    stages: [
      ["primary", { en: "init", pt: "inicia" }, { en: "the adjacency matrix, ∞ where there is no edge", pt: "a matriz de adjacência, ∞ onde não há aresta" }],
      ["act", { en: "pivot", pt: "pivô" }, { en: "allow paths through node k", pt: "permite caminhos por k" }],
      ["violet", { en: "update", pt: "atualiza" }, { en: "dist[i][j] ← min(dist[i][j], dist[i][k] + dist[k][j])", pt: "dist[i][j] ← min(dist[i][j], dist[i][k] + dist[k][j])" }],
      ["green", { en: "done", pt: "pronto" }, { en: "after the last pivot every cell is final", pt: "depois do último pivô toda célula é definitiva" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(V³)", "neg", { en: "no early exit exists", pt: "não existe saída antecipada" }],
      [{ en: "average", pt: "médio" }, "O(V³)", "neg", { en: "the same, whatever the graph", pt: "o mesmo, seja qual for o grafo" }],
      [{ en: "worst", pt: "pior" }, "O(V³)", "neg", { en: "the same", pt: "o mesmo" }],
      [{ en: "space", pt: "espaço" }, "O(V²)", "text", { en: "the matrix, updated in place", pt: "a matriz, atualizada no lugar" }],
    ],
    chartTitle: CHART_SP_TITLE,
    chart: selfIn(CHART_SP, "floyd-warshall"),
    chartNote: { en: "for all pairs on a sparse graph, Johnson (Bellman-Ford once, then Dijkstra per node) wins", pt: "para todos os pares num grafo esparso, Johnson (Bellman-Ford uma vez, depois Dijkstra por nó) vence" },
    when: {
      en: ["Dense graphs of a few hundred nodes where every pair matters: distance tables, transitive closure, graph diameter.", "Any semiring, not only min-plus: with OR and AND it computes reachability, with min-max the widest paths."],
      pt: ["Grafos densos de algumas centenas de nós em que todo par importa: tabelas de distância, fecho transitivo, diâmetro do grafo.", "Qualquer semianel, não só mín-mais: com OU e E calcula alcançabilidade, com mín-máx os caminhos mais largos."],
    },
    pitfalls: {
      en: ["The pivot loop must be the outermost; swapping the loops gives wrong answers on some graphs.", "V² memory: a million nodes is a terabyte matrix.", "A negative value on the diagonal after the run means a negative cycle through that node."],
      pt: ["O laço do pivô precisa ser o mais externo; trocar os laços dá respostas erradas em alguns grafos.", "Memória V²: um milhão de nós é uma matriz de um terabyte.", "Um valor negativo na diagonal depois da execução significa um ciclo negativo por aquele nó."],
    },
    history: {
      en: "Bernard Roy published it in 1959 for transitive closure, Stephen Warshall in 1962 for Boolean matrices, and Robert Floyd the same year for shortest paths; the three-nested-loop form is Peter Ingerman's. It is the standard example of dynamic programming on graphs in every algorithms course.",
      pt: "Bernard Roy o publicou em 1959 para fecho transitivo, Stephen Warshall em 1962 para matrizes booleanas, e Robert Floyd no mesmo ano para caminhos mínimos; a forma de três laços aninhados é de Peter Ingerman. É o exemplo padrão de programação dinâmica em grafos em todo curso de algoritmos.",
    },
    file: "floyd_warshall",
    code: {
      ts: ["function floydWarshall(graph: Graph) {", "  const n = graph.nodes.length;", "  const distance = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));", "  for (const edge of graph.edges) distance[edge.from][edge.to] = edge.weight;", "  for (let pivot = 0; pivot < n; pivot++) {", "    for (let i = 0; i < n; i++) {", "      for (let j = 0; j < n; j++) {", "        if (distance[i][pivot] + distance[pivot][j] < distance[i][j]) distance[i][j] = distance[i][pivot] + distance[pivot][j];", "      }", "    }", "  }", "  return distance;", "}"],
      py: ["def floyd_warshall(graph):", "    n = len(graph.nodes)", "    distance = [[0 if i == j else math.inf for j in range(n)] for i in range(n)]", "    for edge in graph.edges: distance[edge.source][edge.target] = edge.weight", "    for pivot in range(n):", "        for i in range(n):", "            for j in range(n):", "                if distance[i][pivot] + distance[pivot][j] < distance[i][j]: distance[i][j] = distance[i][pivot] + distance[pivot][j]", "", "", "", "    return distance", ""],
      java: ["int[][] floydWarshall(Graph graph) {", "  int n = graph.nodes.size();", "  int[][] distance = new int[n][n]; for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) distance[i][j] = i == j ? 0 : INF;", "  for (Edge edge : graph.edges) distance[edge.from][edge.to] = edge.weight;", "  for (int pivot = 0; pivot < n; pivot++) {", "    for (int i = 0; i < n; i++) {", "      for (int j = 0; j < n; j++) {", "        if (distance[i][pivot] + distance[pivot][j] < distance[i][j]) distance[i][j] = distance[i][pivot] + distance[pivot][j];", "      }", "    }", "  }", "  return distance;", "}"],
      cpp: ["std::vector<std::vector<int>> floydWarshall(const Graph& graph) {", "  int n = graph.nodes.size();", "  std::vector<std::vector<int>> distance(n, std::vector<int>(n, INF)); for (int i = 0; i < n; i++) distance[i][i] = 0;", "  for (const Edge& edge : graph.edges) distance[edge.from][edge.to] = edge.weight;", "  for (int pivot = 0; pivot < n; pivot++) {", "    for (int i = 0; i < n; i++) {", "      for (int j = 0; j < n; j++) {", "        if (distance[i][pivot] + distance[pivot][j] < distance[i][j]) distance[i][j] = distance[i][pivot] + distance[pivot][j];", "      }", "    }", "  }", "  return distance;", "}"],
      c: ["void floyd_warshall(const Graph *graph, int distance[MAX_N][MAX_N]) {", "  int n = graph->node_count;", "  for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) distance[i][j] = i == j ? 0 : INF;", "  for (int e = 0; e < graph->edge_count; e++) distance[graph->edges[e].from][graph->edges[e].to] = graph->edges[e].weight;", "  for (int pivot = 0; pivot < n; pivot++) {", "    for (int i = 0; i < n; i++) {", "      for (int j = 0; j < n; j++) {", "        if (distance[i][pivot] + distance[pivot][j] < distance[i][j]) distance[i][j] = distance[i][pivot] + distance[pivot][j];", "      }", "    }", "  }", "  ", "}"],
      go: ["func floydWarshall(graph Graph) [][]int {", "\tn := len(graph.Nodes)", "\tdistance := make([][]int, n); for i := range distance { distance[i] = make([]int, n); for j := range distance[i] { if i != j { distance[i][j] = inf } } }", "\tfor _, edge := range graph.Edges { distance[edge.From][edge.To] = edge.Weight }", "\tfor pivot := 0; pivot < n; pivot++ {", "\t\tfor i := 0; i < n; i++ {", "\t\t\tfor j := 0; j < n; j++ {", "\t\t\t\tif distance[i][pivot]+distance[pivot][j] < distance[i][j] { distance[i][j] = distance[i][pivot] + distance[pivot][j] }", "\t\t\t}", "\t\t}", "\t}", "\treturn distance", "}"],
      rs: ["fn floyd_warshall(graph: &Graph) -> Vec<Vec<i64>> {", "    let n = graph.nodes.len();", "    let mut distance = vec![vec![INF; n]; n]; for i in 0..n { distance[i][i] = 0; }", "    for edge in &graph.edges { distance[edge.from][edge.to] = edge.weight; }", "    for pivot in 0..n {", "        for i in 0..n {", "            for j in 0..n {", "                if distance[i][pivot] + distance[pivot][j] < distance[i][j] { distance[i][j] = distance[i][pivot] + distance[pivot][j]; }", "            }", "        }", "    }", "    distance", "}"],
    },
    pseudo: {
      en: ["FLOYDWARSHALL(graph)", "  dist[i][j] ← weight of edge i → j, 0 on the diagonal, ∞ elsewhere", "  for each pivot k", "    for each i, for each j", "      dist[i][j] ← min(dist[i][j], dist[i][k] + dist[k][j])", "  return dist"],
      pt: ["FLOYDWARSHALL(grafo)", "  dist[i][j] ← peso da aresta i → j, 0 na diagonal, ∞ no resto", "  para cada pivô k", "    para cada i, para cada j", "      dist[i][j] ← min(dist[i][j], dist[i][k] + dist[k][j])", "  retorna dist"],
    },
  },

  tarjan: {
    ...SIZE,
    slug: "tarjan-scc",
    name: "Tarjan SCC",
    subtitle: { en: "strongly connected components · one DFS", pt: "componentes fortemente conexos · um DFS" },
    tagline: { en: "Tarjan · index and low link: a node whose low link is itself closes a component", pt: "Tarjan · índice e low link: um nó cujo low link é ele mesmo fecha um componente" },
    legend: LEGEND_SCC,
    kpis: [KPI_COMPONENTS, { key: "visited", unitKey: "visitedUnit", label: { en: "VISITED", pt: "VISITADOS" }, sub: { en: "nodes given an index", pt: "nós com índice" } }, { key: "onStack", label: { en: "ON STACK", pt: "NA PILHA" }, sub: { en: "waiting for their root", pt: "esperando pela raiz" } }, { key: "index", label: { en: "INDEX", pt: "ÍNDICE" }, sub: { en: "next DFS number", pt: "próximo número de DFS" } }, KPI_LARGEST],
    idea: {
      en: [
        "A strongly connected component is a set of nodes that can all reach each other. Tarjan finds them in a single depth-first search by giving every node an index in visit order and a low link: the smallest index reachable from it through its DFS subtree plus at most one back edge. Visited nodes stay on a stack until their component is complete.",
        "When the search returns to a node whose low link still equals its own index, nothing below it reaches back above it, so it is the root of a component: everything on the stack down to it is popped as one component. The label under each node shows index / low link.",
      ],
      pt: [
        "Um componente fortemente conexo é um conjunto de nós em que todos alcançam todos. O Tarjan os encontra numa única busca em profundidade dando a cada nó um índice na ordem de visita e um low link: o menor índice alcançável a partir dele pela sua subárvore de DFS mais no máximo uma aresta de retorno. Nós visitados ficam numa pilha até o componente ficar completo.",
        "Quando a busca volta a um nó cujo low link ainda é igual ao próprio índice, nada abaixo dele alcança acima dele, então ele é a raiz de um componente: tudo na pilha até ele é desempilhado como um componente. O rótulo sob cada nó mostra índice / low link.",
      ],
    },
    stages: [
      ["act", { en: "visit", pt: "visita" }, { en: "index ← low ← counter; push on the stack", pt: "índice ← low ← contador; empilha" }],
      ["primary", { en: "descend", pt: "desce" }, { en: "tree edge: recurse, then low ← min(low, low of child)", pt: "aresta de árvore: recursão, depois low ← min(low, low do filho)" }],
      ["violet", { en: "back edge", pt: "aresta de retorno" }, { en: "to a node on the stack: low ← min(low, its index)", pt: "para um nó na pilha: low ← min(low, seu índice)" }],
      ["green", { en: "close", pt: "fecha" }, { en: "low = index: pop the stack down to here", pt: "low = índice: desempilha até aqui" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(V + E)", "green", { en: "every node and edge once", pt: "cada nó e aresta uma vez" }],
      [{ en: "average", pt: "médio" }, "O(V + E)", "green", { en: "a single DFS", pt: "um único DFS" }],
      [{ en: "worst", pt: "pior" }, "O(V + E)", "green", { en: "the same", pt: "o mesmo" }],
      [{ en: "space", pt: "espaço" }, "O(V)", "text", { en: "index, low link and the stack", pt: "índice, low link e a pilha" }],
    ],
    chartTitle: CHART_SCC_TITLE,
    chart: selfIn(CHART_SCC, "tarjan"),
    chartNote: { en: "Kosaraju visits every edge twice, once per direction", pt: "o Kosaraju visita toda aresta duas vezes, uma por direção" },
    when: {
      en: ["Condensing a directed graph into a DAG of components: dependency cycles in a build, 2-SAT, deadlock detection.", "Any time a single pass over a directed graph is required; Tarjan's low link trick also gives bridges and articulation points."],
      pt: ["Condensar um grafo direcionado num DAG de componentes: ciclos de dependência num build, 2-SAT, detecção de deadlock.", "Sempre que uma passada só sobre um grafo direcionado é necessária; o truque do low link do Tarjan também dá pontes e pontos de articulação."],
    },
    pitfalls: {
      en: ["Cross edges to finished components must be ignored; updating low link from them breaks the invariant.", "The recursion depth is the longest DFS path; big graphs need an explicit stack.", "Components come out in reverse topological order of the condensation, which is often exactly what the next step needs."],
      pt: ["Arestas cruzadas para componentes prontos precisam ser ignoradas; atualizar o low link com elas quebra a invariante.", "A profundidade da recursão é o caminho de DFS mais longo; grafos grandes precisam de pilha explícita.", "Os componentes saem em ordem topológica inversa da condensação, que muitas vezes é exatamente o que o passo seguinte precisa."],
    },
    history: {
      en: "Robert Tarjan published the algorithm in 1972 in the same paper that made depth-first search a first-class tool, alongside linear-time biconnectivity. It remains the reference SCC algorithm; Gabow's path-based variant from 2000 replaces low links with a second stack.",
      pt: "Robert Tarjan publicou o algoritmo em 1972 no mesmo artigo que fez da busca em profundidade uma ferramenta de primeira classe, junto com biconectividade em tempo linear. Continua o algoritmo de referência para SCC; a variante baseada em caminhos de Gabow, de 2000, troca os low links por uma segunda pilha.",
    },
    file: "tarjan_scc",
    code: {
      ts: ["function tarjan(graph: Graph) {", "  let index = 0; const stack: Node[] = []; const onStack = new Set<Node>();", "  const indexOf = new Map<Node, number>(), lowLink = new Map<Node, number>(); const components: Node[][] = [];", "  const visit = (node: Node) => {", "    indexOf.set(node, index); lowLink.set(node, index); index++;", "    stack.push(node); onStack.add(node);", "    for (const next of graph.successors(node)) {", "      if (!indexOf.has(next)) { visit(next); lowLink.set(node, Math.min(lowLink.get(node)!, lowLink.get(next)!)); }", "      else if (onStack.has(next)) lowLink.set(node, Math.min(lowLink.get(node)!, indexOf.get(next)!));", "    }", "    if (lowLink.get(node) === indexOf.get(node)) {", "      const component: Node[] = [];", "      let top: Node; do { top = stack.pop()!; onStack.delete(top); component.push(top); } while (top !== node);", "      components.push(component);", "    }", "  };", "  for (const node of graph.nodes) if (!indexOf.has(node)) visit(node);", "  return components;", "}"],
      py: ["def tarjan(graph):", "    index = 0; stack = []; on_stack = set()", "    index_of, low_link, components = {}, {}, []", "    def visit(node):", "        nonlocal index; index_of[node] = low_link[node] = index; index += 1", "        stack.append(node); on_stack.add(node)", "        for successor in graph.successors(node):", "            if successor not in index_of: visit(successor); low_link[node] = min(low_link[node], low_link[successor])", "            elif successor in on_stack: low_link[node] = min(low_link[node], index_of[successor])", "", "        if low_link[node] == index_of[node]:", "            component = []", "            while True: top = stack.pop(); on_stack.discard(top); component.append(top); if top == node: break", "            components.append(component)", "", "", "    for node in graph.nodes: visit(node) if node not in index_of else None", "    return components", ""],
      java: ["List<List<Node>> tarjan(Graph graph) {", "  int[] index = {0}; Deque<Node> stack = new ArrayDeque<>(); Set<Node> onStack = new HashSet<>();", "  Map<Node,Integer> indexOf = new HashMap<>(), lowLink = new HashMap<>(); List<List<Node>> components = new ArrayList<>();", "  Consumer<Node> visit = new Consumer<>() { public void accept(Node node) {", "    indexOf.put(node, index[0]); lowLink.put(node, index[0]); index[0]++;", "    stack.push(node); onStack.add(node);", "    for (Node next : graph.successors(node)) {", "      if (!indexOf.containsKey(next)) { accept(next); lowLink.put(node, Math.min(lowLink.get(node), lowLink.get(next))); }", "      else if (onStack.contains(next)) lowLink.put(node, Math.min(lowLink.get(node), indexOf.get(next)));", "    }", "    if (lowLink.get(node).equals(indexOf.get(node))) {", "      List<Node> component = new ArrayList<>();", "      Node top; do { top = stack.pop(); onStack.remove(top); component.add(top); } while (top != node);", "      components.add(component);", "    }", "  } };", "  for (Node node : graph.nodes) if (!indexOf.containsKey(node)) visit.accept(node);", "  return components;", "}"],
      cpp: ["std::vector<std::vector<Node>> tarjan(const Graph& graph) {", "  int index = 0; std::vector<Node> stack; std::unordered_set<Node> onStack;", "  std::unordered_map<Node,int> indexOf, lowLink; std::vector<std::vector<Node>> components;", "  std::function<void(Node)> visit = [&](Node node) {", "    indexOf[node] = lowLink[node] = index++;", "    stack.push_back(node); onStack.insert(node);", "    for (Node next : graph.successors(node)) {", "      if (!indexOf.count(next)) { visit(next); lowLink[node] = std::min(lowLink[node], lowLink[next]); }", "      else if (onStack.count(next)) lowLink[node] = std::min(lowLink[node], indexOf[next]);", "    }", "    if (lowLink[node] == indexOf[node]) {", "      std::vector<Node> component;", "      Node top; do { top = stack.back(); stack.pop_back(); onStack.erase(top); component.push_back(top); } while (top != node);", "      components.push_back(component);", "    }", "  };", "  for (Node node : graph.nodes) if (!indexOf.count(node)) visit(node);", "  return components;", "}"],
      c: ["int tarjan(const Graph *graph, int *component_of) {", "  int index = 0; int stack[MAX_N]; int stack_size = 0; bool on_stack[MAX_N] = {0};", "  int index_of[MAX_N]; int low_link[MAX_N]; fill(index_of, graph->node_count, -1); int components = 0;", "  void visit(int node) {", "    index_of[node] = low_link[node] = index++;", "    stack[stack_size++] = node; on_stack[node] = true;", "    for (int k = 0; k < graph->out_degree[node]; k++) { int next = graph->succ[node][k];", "      if (index_of[next] < 0) { visit(next); low_link[node] = min(low_link[node], low_link[next]); }", "      else if (on_stack[next]) low_link[node] = min(low_link[node], index_of[next]);", "    }", "    if (low_link[node] == index_of[node]) {", "      int top;", "      do { top = stack[--stack_size]; on_stack[top] = false; component_of[top] = components; } while (top != node);", "      components++;", "    }", "  }", "  for (int node = 0; node < graph->node_count; node++) if (index_of[node] < 0) visit(node);", "  return components;", "}"],
      go: ["func tarjan(graph Graph) [][]Node {", "\tindex := 0; stack := []Node{}; onStack := map[Node]bool{}", "\tindexOf, lowLink := map[Node]int{}, map[Node]int{}; components := [][]Node{}", "\tvar visit func(node Node); visit = func(node Node) {", "\t\tindexOf[node], lowLink[node] = index, index; index++", "\t\tstack = append(stack, node); onStack[node] = true", "\t\tfor _, next := range graph.Successors(node) {", "\t\t\tif _, seen := indexOf[next]; !seen { visit(next); lowLink[node] = min(lowLink[node], lowLink[next])", "\t\t\t} else if onStack[next] { lowLink[node] = min(lowLink[node], indexOf[next]) }", "\t\t}", "\t\tif lowLink[node] == indexOf[node] {", "\t\t\tcomponent := []Node{}", "\t\t\tfor { top := stack[len(stack)-1]; stack = stack[:len(stack)-1]; onStack[top] = false; component = append(component, top); if top == node { break } }", "\t\t\tcomponents = append(components, component)", "\t\t}", "\t}", "\tfor _, node := range graph.Nodes { if _, seen := indexOf[node]; !seen { visit(node) } }", "\treturn components", "}"],
      rs: ["fn tarjan(graph: &Graph) -> Vec<Vec<Node>> {", "    let mut state = Tarjan { index: 0, stack: vec![], on_stack: HashSet::new(), index_of: HashMap::new(), low_link: HashMap::new(), components: vec![] };", "    // index_of and low_link live in the state so the recursive visit can borrow them mutably", "    fn visit(graph: &Graph, state: &mut Tarjan, node: Node) {", "        state.index_of.insert(node, state.index); state.low_link.insert(node, state.index); state.index += 1;", "        state.stack.push(node); state.on_stack.insert(node);", "        for next in graph.successors(node) {", "            if !state.index_of.contains_key(&next) { visit(graph, state, next); let low = state.low_link[&node].min(state.low_link[&next]); state.low_link.insert(node, low); }", "            else if state.on_stack.contains(&next) { let low = state.low_link[&node].min(state.index_of[&next]); state.low_link.insert(node, low); }", "        }", "        if state.low_link[&node] == state.index_of[&node] {", "            let mut component = vec![];", "            loop { let top = state.stack.pop().unwrap(); state.on_stack.remove(&top); component.push(top); if top == node { break; } }", "            state.components.push(component);", "        }", "    }", "    for &node in &graph.nodes { if !state.index_of.contains_key(&node) { visit(graph, &mut state, node); } }", "    state.components", "}"],
    },
    pseudo: {
      en: ["TARJAN(graph)", "  VISIT(node): index[node] ← low[node] ← counter++; push node", "    for each successor: unvisited → VISIT it, low[node] ← min(low[node], low[successor]); on the stack → low[node] ← min(low[node], index[successor])", "    if low[node] = index[node]: pop the stack down to node, that is one component", "  VISIT every unvisited node"],
      pt: ["TARJAN(grafo)", "  VISITA(nó): índice[nó] ← low[nó] ← contador++; empilha nó", "    para cada sucessor: não visitado → VISITA, low[nó] ← min(low[nó], low[sucessor]); na pilha → low[nó] ← min(low[nó], índice[sucessor])", "    se low[nó] = índice[nó]: desempilha até nó, isso é um componente", "  VISITA todo nó não visitado"],
    },
  },

  kosaraju: {
    ...SIZE,
    slug: "kosaraju",
    name: "Kosaraju",
    subtitle: { en: "strongly connected components · two passes", pt: "componentes fortemente conexos · duas passadas" },
    tagline: { en: "Kosaraju · finish order forwards, then collect backwards", pt: "Kosaraju · ordem de término na ida, coleta na volta" },
    legend: [["act", { en: "current", pt: "atual" }], ["primary", { en: "DFS edge", pt: "aresta do DFS" }], ["green", { en: "finished · collected", pt: "terminado · coletado" }], ["def", { en: "unvisited", pt: "não visitado" }]],
    kpis: [{ key: "phase", label: { en: "PHASE", pt: "FASE" }, sub: { en: "of the two passes", pt: "das duas passadas" } }, { key: "finished", unitKey: "finishedUnit", label: { en: "FINISHED", pt: "TERMINADOS" }, sub: { en: "first pass: nodes finished", pt: "primeira passada: nós terminados" } }, KPI_COMPONENTS, { key: "collected", label: { en: "COLLECTED", pt: "COLETADOS" }, sub: { en: "second pass: nodes placed", pt: "segunda passada: nós colocados" } }, KPI_LARGEST],
    idea: {
      en: [
        "Kosaraju's algorithm needs two depth-first searches. The first runs on the graph and records the order in which nodes finish. The second runs on the reversed graph, starting from the nodes that finished last, and every tree it grows is exactly one strongly connected component.",
        "It works because the last node to finish lies in a source component of the condensation, and in the reversed graph a source becomes a sink: the search from it cannot escape its own component. Then the next unvisited latest finisher, and so on. Twice the work of Tarjan, but each pass is a plain DFS.",
      ],
      pt: [
        "O algoritmo de Kosaraju precisa de duas buscas em profundidade. A primeira roda no grafo e anota a ordem em que os nós terminam. A segunda roda no grafo invertido, começando pelos nós que terminaram por último, e cada árvore que ela cresce é exatamente um componente fortemente conexo.",
        "Funciona porque o último nó a terminar está num componente fonte da condensação, e no grafo invertido uma fonte vira sorvedouro: a busca a partir dele não consegue escapar do próprio componente. Depois o próximo não visitado que terminou por último, e assim por diante. O dobro do trabalho do Tarjan, mas cada passada é um DFS comum.",
      ],
    },
    stages: [
      ["primary", { en: "first pass", pt: "primeira passada" }, { en: "DFS, record the finish order", pt: "DFS, anota a ordem de término" }],
      ["violet", { en: "reverse", pt: "inverte" }, { en: "flip every edge", pt: "vira toda aresta" }],
      ["act", { en: "second pass", pt: "segunda passada" }, { en: "DFS from the latest finisher still unvisited", pt: "DFS a partir do último a terminar ainda não visitado" }],
      ["green", { en: "collect", pt: "coleta" }, { en: "each tree is one component", pt: "cada árvore é um componente" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(V + E)", "green", { en: "two linear passes", pt: "duas passadas lineares" }],
      [{ en: "average", pt: "médio" }, "O(V + E)", "green", { en: "plus building the reversed graph", pt: "mais montar o grafo invertido" }],
      [{ en: "worst", pt: "pior" }, "O(V + E)", "green", { en: "the same", pt: "o mesmo" }],
      [{ en: "space", pt: "espaço" }, "O(V + E)", "text", { en: "the reversed adjacency lists", pt: "as listas de adjacência invertidas" }],
    ],
    chartTitle: CHART_SCC_TITLE,
    chart: selfIn(CHART_SCC, "kosaraju"),
    chartNote: { en: "Kosaraju visits every edge twice, once per direction", pt: "o Kosaraju visita toda aresta duas vezes, uma por direção" },
    when: {
      en: ["When the reversed graph is already available or cheap: adjacency matrices, databases with both link directions indexed.", "Teaching: the correctness argument is short and the two passes are ordinary DFS."],
      pt: ["Quando o grafo invertido já está disponível ou é barato: matrizes de adjacência, bancos com as duas direções de link indexadas.", "Ensino: o argumento de correção é curto e as duas passadas são DFS comuns."],
    },
    pitfalls: {
      en: ["The second pass must go in decreasing finish time; increasing order merges components.", "Reversing a big edge list costs memory; Tarjan avoids it.", "Components are produced in topological order of the condensation, the reverse of Tarjan's."],
      pt: ["A segunda passada precisa ir em ordem decrescente de término; ordem crescente funde componentes.", "Inverter uma lista de arestas grande custa memória; o Tarjan evita isso.", "Os componentes saem em ordem topológica da condensação, o inverso do Tarjan."],
    },
    history: {
      en: "S. Rao Kosaraju described the two-pass method in unpublished lecture notes in 1978; Micha Sharir published it independently in 1981. It is the algorithm most textbooks teach first because its proof fits on a page, even though Tarjan's single pass from 1972 is faster.",
      pt: "S. Rao Kosaraju descreveu o método de duas passadas em notas de aula não publicadas em 1978; Micha Sharir o publicou de forma independente em 1981. É o algoritmo que a maioria dos livros ensina primeiro porque a prova cabe numa página, embora a passada única de Tarjan, de 1972, seja mais rápida.",
    },
    file: "kosaraju",
    code: {
      ts: ["function kosaraju(graph: Graph) {", "  const order: Node[] = []; const seen = new Set<Node>();", "  const finish = (node: Node) => { seen.add(node); for (const next of graph.successors(node)) if (!seen.has(next)) finish(next); order.push(node); };", "  for (const node of graph.nodes) if (!seen.has(node)) finish(node);", "  const reversed = graph.reverse();", "  const components: Node[][] = []; seen.clear();", "  const collect = (node: Node, component: Node[]) => { seen.add(node); component.push(node); for (const next of reversed.successors(node)) if (!seen.has(next)) collect(next, component); };", "  for (const node of order.reverse()) {", "    if (seen.has(node)) continue;", "    const component: Node[] = []; collect(node, component);", "    components.push(component);", "  }", "  return components;", "}"],
      py: ["def kosaraju(graph):", "    order = []; seen = set()", "    def finish(node): seen.add(node); [finish(next) for next in graph.successors(node) if next not in seen]; order.append(node)", "    for node in graph.nodes: finish(node) if node not in seen else None", "    reversed_graph = graph.reverse()", "    components = []; seen.clear()", "    def collect(node, component): seen.add(node); component.append(node); [collect(next, component) for next in reversed_graph.successors(node) if next not in seen]", "    for node in reversed(order):", "        if node in seen: continue", "        component = []; collect(node, component)", "        components.append(component)", "", "    return components", ""],
      java: ["List<List<Node>> kosaraju(Graph graph) {", "  Deque<Node> order = new ArrayDeque<>(); Set<Node> seen = new HashSet<>();", "  finishAll(graph, seen, order); // DFS; a node is pushed on `order` when it finishes", "  ", "  Graph reversed = graph.reverse();", "  List<List<Node>> components = new ArrayList<>(); seen.clear();", "  // collect(node, component): DFS on `reversed`, adding every node reached to `component`", "  for (Node node : order) { // order is a stack: latest finisher first", "    if (seen.contains(node)) continue;", "    List<Node> component = new ArrayList<>(); collect(reversed, seen, node, component);", "    components.add(component);", "  }", "  return components;", "}"],
      cpp: ["std::vector<std::vector<Node>> kosaraju(const Graph& graph) {", "  std::vector<Node> order; std::unordered_set<Node> seen;", "  std::function<void(Node)> finish = [&](Node node) { seen.insert(node); for (Node next : graph.successors(node)) if (!seen.count(next)) finish(next); order.push_back(node); };", "  for (Node node : graph.nodes) if (!seen.count(node)) finish(node);", "  Graph reversed = graph.reverse();", "  std::vector<std::vector<Node>> components; seen.clear();", "  std::function<void(Node, std::vector<Node>&)> collect = [&](Node node, std::vector<Node>& component) { seen.insert(node); component.push_back(node); for (Node next : reversed.successors(node)) if (!seen.count(next)) collect(next, component); };", "  for (auto it = order.rbegin(); it != order.rend(); ++it) {", "    if (seen.count(*it)) continue;", "    std::vector<Node> component; collect(*it, component);", "    components.push_back(component);", "  }", "  return components;", "}"],
      c: ["int kosaraju(const Graph *graph, int *component_of) {", "  int order[MAX_N]; int count = 0; bool seen[MAX_N] = {0};", "  for (int node = 0; node < graph->node_count; node++) if (!seen[node]) finish(graph, node, seen, order, &count); /* DFS, appends nodes as they finish */", "  ", "  Graph reversed = reverse(graph);", "  int components = 0; memset(seen, 0, sizeof seen);", "  /* collect(): DFS on the reversed graph, labelling every node reached with the component number */", "  for (int i = count - 1; i >= 0; i--) { int node = order[i];", "    if (seen[node]) continue;", "    collect(&reversed, node, seen, component_of, components);", "    components++;", "  }", "  return components;", "}"],
      go: ["func kosaraju(graph Graph) [][]Node {", "\torder := []Node{}; seen := map[Node]bool{}", "\tvar finish func(Node); finish = func(node Node) { seen[node] = true; for _, next := range graph.Successors(node) { if !seen[next] { finish(next) } }; order = append(order, node) }", "\tfor _, node := range graph.Nodes { if !seen[node] { finish(node) } }", "\treversed := graph.Reverse()", "\tcomponents := [][]Node{}; clear(seen)", "\tvar collect func(Node, *[]Node); collect = func(node Node, component *[]Node) { seen[node] = true; *component = append(*component, node); for _, next := range reversed.Successors(node) { if !seen[next] { collect(next, component) } } }", "\tfor i := len(order) - 1; i >= 0; i-- { node := order[i]", "\t\tif seen[node] { continue }", "\t\tcomponent := []Node{}; collect(node, &component)", "\t\tcomponents = append(components, component)", "\t}", "\treturn components", "}"],
      rs: ["fn kosaraju(graph: &Graph) -> Vec<Vec<Node>> {", "    let mut order = vec![]; let mut seen = HashSet::new();", "    fn finish(graph: &Graph, node: Node, seen: &mut HashSet<Node>, order: &mut Vec<Node>) { seen.insert(node); for next in graph.successors(node) { if !seen.contains(&next) { finish(graph, next, seen, order); } } order.push(node); }", "    for &node in &graph.nodes { if !seen.contains(&node) { finish(graph, node, &mut seen, &mut order); } }", "    let reversed = graph.reverse();", "    let mut components = vec![]; seen.clear();", "    fn collect(graph: &Graph, node: Node, seen: &mut HashSet<Node>, component: &mut Vec<Node>) { seen.insert(node); component.push(node); for next in graph.successors(node) { if !seen.contains(&next) { collect(graph, next, seen, component); } } }", "    for &node in order.iter().rev() {", "        if seen.contains(&node) { continue; }", "        let mut component = vec![]; collect(&reversed, node, &mut seen, &mut component);", "        components.push(component);", "    }", "    components", "}"],
    },
    pseudo: {
      en: ["KOSARAJU(graph)", "  first pass: DFS the graph; append each node to `order` when it finishes", "  reverse every edge", "  second pass: for each node in decreasing finish order, if unvisited", "    DFS on the reversed graph from it; every node reached is one component"],
      pt: ["KOSARAJU(grafo)", "  primeira passada: DFS no grafo; anexa cada nó a `ordem` quando termina", "  inverte toda aresta", "  segunda passada: para cada nó em ordem decrescente de término, se não visitado", "    DFS no grafo invertido a partir dele; todo nó alcançado é um componente"],
    },
  },

  unionFind: {
    ...SIZE,
    slug: "union-find",
    name: "Union-Find",
    subtitle: { en: "disjoint sets · components as edges arrive", pt: "conjuntos disjuntos · componentes conforme as arestas chegam" },
    tagline: { en: "union-find · two pointers chase and a whole component merges", pt: "union-find · dois ponteiros perseguem e um componente inteiro se funde" },
    legend: [["primary", { en: "representative", pt: "representante" }], ["vis", { en: "points at another", pt: "aponta para outro" }], ["act", { en: "edge examined", pt: "aresta examinada" }], ["def", { en: "already connected (dashed)", pt: "já conectados (tracejada)" }]],
    kpis: [KPI_COMPONENTS, { key: "unions", label: { en: "UNIONS", pt: "UNIÕES" }, sub: { en: "sets merged", pt: "conjuntos fundidos" } }, { key: "finds", label: { en: "FINDS", pt: "FINDS" }, sub: { en: "representative lookups", pt: "buscas de representante" } }, { key: "examined", unitKey: "examinedUnit", label: { en: "EDGES", pt: "ARESTAS" }, sub: { en: "arrived so far", pt: "chegaram até aqui" } }, KPI_LARGEST],
    idea: {
      en: [
        "Union-find keeps a forest: every node points at a parent, and the root of its tree is the representative of its set. Find follows the pointers to the root; union makes one root point at the other. Two nodes are connected exactly when their finds return the same root.",
        "Two tricks make it almost free. Path compression makes every node visited by a find point straight at the root afterwards, and union by rank keeps trees shallow. With both, a sequence of m operations costs O(m · α(n)), where α is the inverse Ackermann function, below 5 for any input that fits in the universe.",
      ],
      pt: [
        "O union-find mantém uma floresta: todo nó aponta para um pai, e a raiz da árvore dele é o representante do seu conjunto. Find segue os ponteiros até a raiz; union faz uma raiz apontar para a outra. Dois nós estão conectados exatamente quando seus finds devolvem a mesma raiz.",
        "Dois truques o deixam quase de graça. A compressão de caminho faz todo nó visitado por um find apontar direto para a raiz depois, e a união por ranking mantém as árvores rasas. Com os dois, uma sequência de m operações custa O(m · α(n)), onde α é a inversa de Ackermann, abaixo de 5 para qualquer entrada que caiba no universo.",
      ],
    },
    stages: [
      ["primary", { en: "init", pt: "inicia" }, { en: "every node is its own set", pt: "todo nó é seu próprio conjunto" }],
      ["act", { en: "find", pt: "find" }, { en: "follow parents to the root, compressing", pt: "segue os pais até a raiz, comprimindo" }],
      ["violet", { en: "compare", pt: "compara" }, { en: "same root: already connected", pt: "mesma raiz: já conectados" }],
      ["green", { en: "union", pt: "union" }, { en: "different roots: point one at the other", pt: "raízes diferentes: aponta uma para a outra" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(1)", "green", { en: "find on a root", pt: "find numa raiz" }],
      [{ en: "average", pt: "médio" }, "O(α(n))", "green", { en: "amortised, with compression and rank", pt: "amortizado, com compressão e ranking" }],
      [{ en: "worst", pt: "pior" }, "O(log n)", "text", { en: "one find, union by rank only", pt: "um find, só união por ranking" }],
      [{ en: "space", pt: "espaço" }, "O(n)", "text", { en: "one parent per node", pt: "um pai por nó" }],
    ],
    chartTitle: { en: "COST OF 1 000 000 UNION-FIND OPERATIONS", pt: "CUSTO DE 1.000.000 DE OPERAÇÕES UNION-FIND" },
    chart: [["compression + rank", 4000000, true], ["compression only", 6000000], ["rank only", 20000000], ["naive linking", 500000000000]],
    chartNote: { en: "pointer steps · naive linking degenerates to a long chain", pt: "passos de ponteiro · ligação ingênua degenera numa cadeia longa" },
    when: {
      en: ["Connectivity that only grows: Kruskal's MST, network percolation, image segmentation, friend circles.", "Equivalence classes in compilers and type inference, where unification is a union."],
      pt: ["Conectividade que só cresce: MST de Kruskal, percolação em redes, segmentação de imagens, círculos de amigos.", "Classes de equivalência em compiladores e inferência de tipos, onde a unificação é uma união."],
    },
    pitfalls: {
      en: ["It cannot delete an edge; for dynamic connectivity with removals use a different structure.", "Without compression or rank a chain of n unions makes find O(n).", "Recursive find with compression can overflow on a degenerate chain; iterate with a second pass instead."],
      pt: ["Não consegue remover uma aresta; para conectividade dinâmica com remoções use outra estrutura.", "Sem compressão nem ranking uma cadeia de n uniões torna o find O(n).", "Find recursivo com compressão pode estourar numa cadeia degenerada; itere com uma segunda passada."],
    },
    history: {
      en: "Bernard Galler and Michael Fischer described the forest representation in 1964. Robert Tarjan proved the inverse-Ackermann bound in 1975 and, with Jan van Leeuwen in 1984, showed that no pointer-based structure can do better, one of the few tight amortised results in the field.",
      pt: "Bernard Galler e Michael Fischer descreveram a representação em floresta em 1964. Robert Tarjan provou o limite pela inversa de Ackermann em 1975 e, com Jan van Leeuwen em 1984, mostrou que nenhuma estrutura baseada em ponteiros faz melhor, um dos poucos resultados amortizados justos da área.",
    },
    file: "union_find",
    code: {
      ts: ["function connectedComponents(graph: Graph) {", "  const parent = new Map(graph.nodes.map((node) => [node, node]));", "  const find = (node: Node): Node => (parent.get(node) === node ? node : (parent.set(node, find(parent.get(node)!)), parent.get(node)!));", "  for (const edge of graph.edges) {", "    const rootA = find(edge.from), rootB = find(edge.to);", "    if (rootA === rootB) continue;", "    parent.set(rootA, rootB);", "  }", "  return new Set(graph.nodes.map(find)).size;", "}"],
      py: ["def connected_components(graph):", "    parent = {node: node for node in graph.nodes}", "    def find(node): parent[node] = node if parent[node] == node else find(parent[node]); return parent[node]", "    for edge in graph.edges:", "        root_a, root_b = find(edge.source), find(edge.target)", "        if root_a == root_b: continue", "        parent[root_a] = root_b", "", "    return len({find(node) for node in graph.nodes})", ""],
      java: ["int connectedComponents(Graph graph) {", "  Map<Node,Node> parent = new HashMap<>(); graph.nodes.forEach(node -> parent.put(node, node));", "  Function<Node,Node> find = new Function<>() { public Node apply(Node node) { if (parent.get(node) != node) parent.put(node, apply(parent.get(node))); return parent.get(node); } };", "  for (Edge edge : graph.edges) {", "    Node rootA = find.apply(edge.from), rootB = find.apply(edge.to);", "    if (rootA == rootB) continue;", "    parent.put(rootA, rootB);", "  }", "  return (int) graph.nodes.stream().map(find).distinct().count();", "}"],
      cpp: ["int connectedComponents(const Graph& graph) {", "  std::unordered_map<Node,Node> parent; for (Node node : graph.nodes) parent[node] = node;", "  std::function<Node(Node)> find = [&](Node node) { return parent[node] == node ? node : parent[node] = find(parent[node]); };", "  for (const Edge& edge : graph.edges) {", "    Node rootA = find(edge.from), rootB = find(edge.to);", "    if (rootA == rootB) continue;", "    parent[rootA] = rootB;", "  }", "  std::unordered_set<Node> roots; for (Node node : graph.nodes) roots.insert(find(node)); return roots.size();", "}"],
      c: ["int connected_components(const Graph *graph) {", "  int parent[MAX_N]; for (int node = 0; node < graph->node_count; node++) parent[node] = node;", "  int find(int node) { return parent[node] == node ? node : (parent[node] = find(parent[node])); }", "  for (int i = 0; i < graph->edge_count; i++) {", "    int root_a = find(graph->edges[i].from), root_b = find(graph->edges[i].to);", "    if (root_a == root_b) continue;", "    parent[root_a] = root_b;", "  }", "  int count = 0; for (int node = 0; node < graph->node_count; node++) if (find(node) == node) count++; return count;", "}"],
      go: ["func connectedComponents(graph Graph) int {", "\tparent := map[Node]Node{}; for _, node := range graph.Nodes { parent[node] = node }", "\tvar find func(Node) Node; find = func(node Node) Node { if parent[node] != node { parent[node] = find(parent[node]) }; return parent[node] }", "\tfor _, edge := range graph.Edges {", "\t\trootA, rootB := find(edge.From), find(edge.To)", "\t\tif rootA == rootB { continue }", "\t\tparent[rootA] = rootB", "\t}", "\troots := map[Node]bool{}; for _, node := range graph.Nodes { roots[find(node)] = true }; return len(roots)", "}"],
      rs: ["fn connected_components(graph: &Graph) -> usize {", "    let mut parent: Vec<usize> = (0..graph.nodes.len()).collect();", "    fn find(parent: &mut Vec<usize>, node: usize) -> usize { if parent[node] != node { let root = find(parent, parent[node]); parent[node] = root; } parent[node] }", "    for edge in &graph.edges {", "        let (root_a, root_b) = (find(&mut parent, edge.from), find(&mut parent, edge.to));", "        if root_a == root_b { continue; }", "        parent[root_a] = root_b;", "    }", "    (0..graph.nodes.len()).map(|node| find(&mut parent, node)).collect::<HashSet<_>>().len()", "}"],
    },
    pseudo: {
      en: ["UNIONFIND(graph)", "  parent[node] ← node for every node", "  FIND(node): follow parent pointers to the root, then point every node on the way straight at it", "  for each edge from–to: if FIND(from) ≠ FIND(to): parent[FIND(from)] ← FIND(to)", "  the components are the distinct roots"],
      pt: ["UNIONFIND(grafo)", "  pai[nó] ← nó para todo nó", "  FIND(nó): segue os ponteiros de pai até a raiz, depois aponta todo nó do caminho direto para ela", "  para cada aresta origem–destino: se FIND(origem) ≠ FIND(destino): pai[FIND(origem)] ← FIND(destino)", "  os componentes são as raízes distintas"],
    },
  },

  edmondsKarp: {
    ...SIZE,
    slug: "edmonds-karp",
    name: "Edmonds-Karp",
    subtitle: { en: "maximum flow · shortest augmenting paths", pt: "fluxo máximo · caminhos de aumento mais curtos" },
    tagline: { en: "Edmonds-Karp · push flow along the shortest path until none is left", pt: "Edmonds-Karp · empurra fluxo pelo caminho mais curto até não sobrar nenhum" },
    legend: [["violet", { en: "augmenting path", pt: "caminho de aumento" }], ["primary", { en: "carrying flow", pt: "carregando fluxo" }], ["act", { en: "cut edge", pt: "aresta do corte" }], ["green", { en: "source side of the cut", pt: "lado da fonte no corte" }]],
    kpis: [{ key: "flow", label: { en: "FLOW", pt: "FLUXO" }, sub: { en: "source to sink so far", pt: "da fonte ao sorvedouro até aqui" } }, { key: "augmentations", label: { en: "PATHS", pt: "CAMINHOS" }, sub: { en: "augmenting paths used", pt: "caminhos de aumento usados" } }, { key: "bottleneck", label: { en: "BOTTLENECK", pt: "GARGALO" }, sub: { en: "of the current path", pt: "do caminho atual" } }, { key: "pathLength", label: { en: "LENGTH", pt: "COMPRIMENTO" }, sub: { en: "edges in the current path", pt: "arestas no caminho atual" } }, { key: "saturated", label: { en: "SATURATED", pt: "SATURADAS" }, sub: { en: "edges at full capacity", pt: "arestas na capacidade máxima" } }],
    idea: {
      en: [
        "A flow sends units from a source to a sink through edges with capacities. Ford and Fulkerson's method finds any path with spare capacity, pushes as much as its tightest edge allows, and repeats; when no such path is left the flow is maximum. Pushing flow also creates reverse residual capacity, so a later path can undo an earlier bad choice.",
        "Edmonds-Karp fixes the one thing Ford-Fulkerson left open: which path to take. Choosing the shortest augmenting path, by BFS, bounds the number of augmentations by V · E regardless of the capacities. When the search from the source finally stalls, the reachable nodes form a minimum cut whose capacity equals the flow.",
      ],
      pt: [
        "Um fluxo manda unidades de uma fonte a um sorvedouro por arestas com capacidades. O método de Ford e Fulkerson acha qualquer caminho com capacidade sobrando, empurra tanto quanto a aresta mais apertada permite, e repete; quando não sobra caminho o fluxo é máximo. Empurrar fluxo também cria capacidade residual reversa, então um caminho posterior pode desfazer uma escolha ruim anterior.",
        "O Edmonds-Karp resolve o que o Ford-Fulkerson deixou em aberto: qual caminho pegar. Escolher o caminho de aumento mais curto, por BFS, limita o número de aumentos a V · E independentemente das capacidades. Quando a busca a partir da fonte finalmente trava, os nós alcançáveis formam um corte mínimo cuja capacidade é igual ao fluxo.",
      ],
    },
    stages: [
      ["primary", { en: "residual", pt: "residual" }, { en: "spare capacity forward, flow backward", pt: "capacidade sobrando na ida, fluxo na volta" }],
      ["violet", { en: "BFS", pt: "BFS" }, { en: "the shortest source-to-sink path with spare capacity", pt: "o caminho fonte-sorvedouro mais curto com capacidade sobrando" }],
      ["act", { en: "bottleneck", pt: "gargalo" }, { en: "the smallest residual capacity on it", pt: "a menor capacidade residual nele" }],
      ["green", { en: "augment", pt: "aumenta" }, { en: "push that much along the path", pt: "empurra isso pelo caminho" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(E)", "green", { en: "one path saturates the sink", pt: "um caminho satura o sorvedouro" }],
      [{ en: "average", pt: "médio" }, "O(V · E²)", "text", { en: "at most V · E augmentations of O(E) each", pt: "no máximo V · E aumentos de O(E) cada" }],
      [{ en: "worst", pt: "pior" }, "O(V · E²)", "neg", { en: "independent of the capacities", pt: "independente das capacidades" }],
      [{ en: "space", pt: "espaço" }, "O(V + E)", "text", { en: "flows and the BFS parents", pt: "fluxos e os pais do BFS" }],
    ],
    chartTitle: { en: "AUGMENTATIONS · 1 000 NODES, 5 000 EDGES", pt: "AUMENTOS · 1.000 NÓS, 5.000 ARESTAS" },
    chart: [["edmonds-karp", 2500, true], ["dinic", 300], ["push-relabel", 900], ["ford-fulkerson (dfs)", 100000]],
    chartNote: { en: "Ford-Fulkerson with DFS can take as many augmentations as the flow value", pt: "Ford-Fulkerson com DFS pode levar tantos aumentos quanto o valor do fluxo" },
    when: {
      en: ["Bipartite matching, project selection, image segmentation, scheduling with capacities: all reduce to max flow.", "Minimum cuts: which edges to remove to disconnect two nodes, straight from the last residual search."],
      pt: ["Emparelhamento bipartido, seleção de projetos, segmentação de imagens, escalonamento com capacidades: tudo se reduz a fluxo máximo.", "Cortes mínimos: quais arestas remover para desconectar dois nós, direto da última busca residual."],
    },
    pitfalls: {
      en: ["Forgetting the reverse residual edges makes the algorithm wrong, not just slow.", "Irrational capacities can make plain Ford-Fulkerson loop forever; BFS order avoids that.", "For big graphs Dinic's level graphs or push-relabel are several times faster."],
      pt: ["Esquecer as arestas residuais reversas deixa o algoritmo errado, não só lento.", "Capacidades irracionais podem fazer o Ford-Fulkerson puro rodar para sempre; a ordem do BFS evita isso.", "Para grafos grandes os grafos de nível de Dinic ou o push-relabel são várias vezes mais rápidos."],
    },
    history: {
      en: "Ford and Fulkerson published the augmenting path method in 1956, for a RAND study of rail capacity between the Soviet Union and Eastern Europe. Yefim Dinitz in 1970 and Jack Edmonds with Richard Karp in 1972 showed that shortest augmenting paths make it polynomial; the max-flow min-cut theorem is from the same 1956 paper.",
      pt: "Ford e Fulkerson publicaram o método de caminhos de aumento em 1956, para um estudo da RAND sobre a capacidade ferroviária entre a União Soviética e o Leste Europeu. Yefim Dinitz em 1970 e Jack Edmonds com Richard Karp em 1972 mostraram que caminhos de aumento mais curtos o tornam polinomial; o teorema do fluxo máximo e corte mínimo é do mesmo artigo de 1956.",
    },
    file: "edmonds_karp",
    code: {
      ts: ["function edmondsKarp(graph: Graph, source: Node, sink: Node) {", "  const flow = new Map<Edge, number>(); let total = 0;", "  while (true) {", "    const parent = bfs(graph, flow, source, sink); // shortest augmenting path in the residual graph", "    if (!parent.has(sink)) break;", "    let bottleneck = Infinity;", "    for (let node = sink; node !== source; node = parent.get(node)!.from) bottleneck = Math.min(bottleneck, residual(parent.get(node)!, flow));", "    for (let node = sink; node !== source; node = parent.get(node)!.from) push(parent.get(node)!, bottleneck, flow);", "    total += bottleneck;", "  }", "  return total;", "}"],
      py: ["def edmonds_karp(graph, source, sink):", "    flow = defaultdict(int); total = 0", "    while True:", "        parent = bfs(graph, flow, source, sink)  # shortest augmenting path in the residual graph", "        if sink not in parent: break", "        bottleneck = math.inf", "        node = sink; while node != source: bottleneck = min(bottleneck, residual(parent[node], flow)); node = parent[node].source", "        node = sink; while node != source: push(parent[node], bottleneck, flow); node = parent[node].source", "        total += bottleneck", "", "    return total", ""],
      java: ["int edmondsKarp(Graph graph, Node source, Node sink) {", "  Map<Edge,Integer> flow = new HashMap<>(); int total = 0;", "  while (true) {", "    Map<Node,Edge> parent = bfs(graph, flow, source, sink); // shortest augmenting path in the residual graph", "    if (!parent.containsKey(sink)) break;", "    int bottleneck = Integer.MAX_VALUE;", "    for (Node node = sink; node != source; node = parent.get(node).from) bottleneck = Math.min(bottleneck, residual(parent.get(node), flow));", "    for (Node node = sink; node != source; node = parent.get(node).from) push(parent.get(node), bottleneck, flow);", "    total += bottleneck;", "  }", "  return total;", "}"],
      cpp: ["int edmondsKarp(const Graph& graph, Node source, Node sink) {", "  std::unordered_map<const Edge*,int> flow; int total = 0;", "  while (true) {", "    auto parent = bfs(graph, flow, source, sink); // shortest augmenting path in the residual graph", "    if (!parent.count(sink)) break;", "    int bottleneck = INT_MAX;", "    for (Node node = sink; node != source; node = parent[node]->from) bottleneck = std::min(bottleneck, residual(parent[node], flow));", "    for (Node node = sink; node != source; node = parent[node]->from) push(parent[node], bottleneck, flow);", "    total += bottleneck;", "  }", "  return total;", "}"],
      c: ["int edmonds_karp(Graph *graph, int source, int sink) {", "  int flow[MAX_M] = {0}; int total = 0;", "  while (1) {", "    int parent[MAX_N]; if (!bfs(graph, flow, source, sink, parent)) break; /* shortest augmenting path in the residual graph */", "    ", "    int bottleneck = INF;", "    for (int node = sink; node != source; node = graph->edges[parent[node]].from) bottleneck = min(bottleneck, residual(graph, parent[node], flow));", "    for (int node = sink; node != source; node = graph->edges[parent[node]].from) push(graph, parent[node], bottleneck, flow);", "    total += bottleneck;", "  }", "  return total;", "}"],
      go: ["func edmondsKarp(graph Graph, source, sink Node) int {", "\tflow := map[*Edge]int{}; total := 0", "\tfor {", "\t\tparent := bfs(graph, flow, source, sink) // shortest augmenting path in the residual graph", "\t\tif _, reached := parent[sink]; !reached { break }", "\t\tbottleneck := math.MaxInt", "\t\tfor node := sink; node != source; node = parent[node].From { bottleneck = min(bottleneck, residual(parent[node], flow)) }", "\t\tfor node := sink; node != source; node = parent[node].From { push(parent[node], bottleneck, flow) }", "\t\ttotal += bottleneck", "\t}", "\treturn total", "}"],
      rs: ["fn edmonds_karp(graph: &Graph, source: Node, sink: Node) -> i32 {", "    let mut flow: HashMap<EdgeId, i32> = HashMap::new(); let mut total = 0;", "    loop {", "        let parent = bfs(graph, &flow, source, sink); // shortest augmenting path in the residual graph", "        if !parent.contains_key(&sink) { break; }", "        let mut bottleneck = i32::MAX;", "        let mut node = sink; while node != source { bottleneck = bottleneck.min(residual(graph, parent[&node], &flow)); node = graph.edge(parent[&node]).from; }", "        let mut node = sink; while node != source { push(graph, parent[&node], bottleneck, &mut flow); node = graph.edge(parent[&node]).from; }", "        total += bottleneck;", "    }", "    total", "}"],
    },
    pseudo: {
      en: ["EDMONDSKARP(graph, source, sink)", "  flow ← 0 on every edge", "  repeat", "    BFS from source over edges with residual capacity (capacity − flow forward, flow backward)", "    if the sink was not reached: stop, the flow is maximum", "    bottleneck ← the smallest residual capacity on the path; add it along the path (subtract on backward edges)"],
      pt: ["EDMONDSKARP(grafo, fonte, sorvedouro)", "  fluxo ← 0 em toda aresta", "  repete", "    BFS da fonte por arestas com capacidade residual (capacidade − fluxo na ida, fluxo na volta)", "    se o sorvedouro não foi alcançado: para, o fluxo é máximo", "    gargalo ← a menor capacidade residual do caminho; soma ao longo do caminho (subtrai nas arestas de volta)"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
