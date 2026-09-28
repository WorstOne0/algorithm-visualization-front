// Models
import type { Localized } from "../translations";
import type { VizKey } from "../viz";
import type { AlgorithmSpec, KpiSpec } from "./spec";

const SIZE = { sizeLabel: { en: "Walls", pt: "Paredes" }, minN: 10, maxN: 40, stepN: 5, defaultN: 28, shuffleLabel: { en: "New maze", pt: "Novo labirinto" }, stepMs: 110 } as const;

const LEGEND_BASE: [VizKey, Localized][] = [["vis", { en: "closed", pt: "fechado" }], ["primary", { en: "open", pt: "aberto" }], ["act", { en: "current", pt: "atual" }], ["violet", { en: "path", pt: "caminho" }], ["green", { en: "start / goal", pt: "início / destino" }]];

const STAGE_CHECK: [VizKey, Localized, Localized] = ["act", { en: "check", pt: "checa" }, { en: "is it the goal? then rebuild", pt: "é o destino? então reconstrói" }];
const STAGE_PATH: [VizKey, Localized, Localized] = ["violet", { en: "path", pt: "caminho" }, { en: "follow parents back to start", pt: "segue os pais até o início" }];

const KPI_EXPANDED: KpiSpec = { key: "expanded", label: { en: "EXPANDED", pt: "EXPANDIDAS" }, sub: { en: "closed cells", pt: "células fechadas" } };
const KPI_PATH: KpiSpec = { key: "path", unitKey: "pathUnit", label: { en: "PATH", pt: "CAMINHO" }, sub: { en: "length once the goal is reached", pt: "comprimento ao chegar" } };
const KPI_WALLS: KpiSpec = { key: "walls", label: { en: "WALLS", pt: "PAREDES" }, sub: { en: "of 880 cells blocked", pt: "de 880 células bloqueadas" } };

export const PATHFINDING = {
  bfs: {
    ...SIZE,
    family: "pathfinding",
    slug: "breadth-first-search",
    kind: "grid",
    name: "Breadth-first search",
    subtitle: { en: "breadth-first · rings from the start", pt: "largura primeiro · anéis a partir do início" },
    tagline: { en: "BFS · the flood fill that finds the shortest path", pt: "BFS · a inundação que acha o caminho mais curto" },
    legend: [...LEGEND_BASE],
    kpis: [
      KPI_EXPANDED,
      { key: "open", label: { en: "QUEUE", pt: "FILA" }, sub: { en: "waiting in the queue", pt: "esperando na fila" } },
      { key: "pushed", label: { en: "ENQUEUED", pt: "ENFILEIRADAS" }, sub: { en: "cells added to the queue", pt: "células adicionadas à fila" } },
      KPI_PATH,
      KPI_WALLS,
    ],
    idea: {
      en: [
        "Breadth-first search explores the grid in rings: every cell at distance 1 from the start, then every cell at distance 2, and so on. It keeps a queue of open cells, always takes the oldest one, and enqueues its unvisited neighbours behind everything already waiting.",
        "Because cells are reached in order of distance, the first time BFS pops the goal it has found a shortest path, as long as every step costs the same. That is its whole guarantee, and also its weakness: it floods evenly in every direction and never looks at where the goal is.",
      ],
      pt: [
        "A busca em largura explora a grade em anéis: toda célula à distância 1 do início, depois toda célula à distância 2, e assim por diante. Ela mantém uma fila de células abertas, sempre pega a mais antiga e enfileira os vizinhos não visitados atrás de tudo que já espera.",
        "Como as células são alcançadas em ordem de distância, na primeira vez que o BFS retira o destino ele encontrou um caminho mínimo, desde que todo passo custe o mesmo. Essa é toda a sua garantia, e também sua fraqueza: ele inunda por igual em todas as direções e nunca olha onde o destino está.",
      ],
    },
    stages: [["primary", { en: "dequeue", pt: "desenfileira" }, { en: "the oldest open cell", pt: "a célula aberta mais antiga" }], STAGE_CHECK, ["swap", { en: "enqueue", pt: "enfileira" }, { en: "unvisited neighbours join the back", pt: "vizinhos não visitados entram no fim" }], STAGE_PATH],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(d)", "green", { en: "goal next to the start", pt: "destino ao lado do início" }],
      [{ en: "average", pt: "médio" }, "O(V + E)", "text", { en: "every cell and edge once", pt: "cada célula e aresta uma vez" }],
      [{ en: "worst", pt: "pior" }, "O(V + E)", "text", { en: "goal unreachable: the whole grid floods", pt: "destino inalcançável: a grade inteira inunda" }],
      [{ en: "space", pt: "espaço" }, "O(V)", "text", { en: "queue plus the parent map", pt: "fila mais o mapa de pais" }],
    ],
    chartTitle: { en: "CELLS EXPANDED · 44×20 MAZE", pt: "CÉLULAS EXPANDIDAS · LABIRINTO 44×20" },
    chart: [["bfs", 612, true], ["dijkstra", 604], ["greedy", 96], ["a*", 188], ["jps", 41]],
    chartNote: { en: "same maze, same start and goal · BFS visits almost everything", pt: "mesmo labirinto, início e destino · o BFS visita quase tudo" },
    when: {
      en: ["Unweighted graphs where every step costs the same: grids, mazes, social hops, word ladders.", "When you need all shortest distances from one source, not just one path: BFS labels every cell with its distance."],
      pt: ["Grafos sem peso em que todo passo custa o mesmo: grades, labirintos, saltos sociais, escadas de palavras.", "Quando você precisa de todas as distâncias mínimas a partir de uma origem, não só um caminho: o BFS rotula cada célula com sua distância."],
    },
    pitfalls: {
      en: ["Weights break it: a cheap long detour beats an expensive short one, and BFS cannot tell. Use Dijkstra.", "It expands in every direction, so on a big map with a far goal it visits far more cells than A*.", "Marking cells visited when they are popped instead of when they are enqueued duplicates work; mark on enqueue."],
      pt: ["Pesos quebram o BFS: um desvio longo e barato vence um atalho caro, e ele não sabe disso. Use Dijkstra.", "Ele expande em todas as direções, então num mapa grande com destino longe visita muito mais células que o A*.", "Marcar células como visitadas ao retirar em vez de ao enfileirar duplica trabalho; marque ao enfileirar."],
    },
    history: {
      en: "Konrad Zuse described breadth-first search in his 1945 thesis on Plankalkül, which was not published until 1972. Edward Moore rediscovered it in 1959 to find the shortest route through a maze, and C. Y. Lee used it in 1961 for routing wires on circuit boards, the maze router still used in chip design.",
      pt: "Konrad Zuse descreveu a busca em largura na sua tese de 1945 sobre o Plankalkül, publicada só em 1972. Edward Moore a redescobriu em 1959 para achar a rota mais curta num labirinto, e C. Y. Lee a usou em 1961 para roteamento de fios em placas de circuito, o roteador de labirinto ainda usado no projeto de chips.",
    },
    file: "bfs",
    code: {
      ts: ["function bfs(grid: Grid, start: Cell, goal: Cell) {", "  const queue: Cell[] = [start];", "  const g = new Map([[start, 0]]), parent = new Map();", "  while (queue.length > 0) {", "    const cur = queue.shift()!; // oldest first", "    if (cur === goal) return rebuild(parent, cur);", "    for (const nb of neighbors(grid, cur)) {", "      if (g.has(nb)) continue;", "      g.set(nb, g.get(cur)! + 1);", "      parent.set(nb, cur);", "      queue.push(nb);", "    }", "  }", "  return null;", "}"],
      py: ["def bfs(grid, start, goal):", "    queue = deque([start])", "    g, parent = {start: 0}, {}", "    while queue:", "        cur = queue.popleft()  # oldest first", "        if cur == goal: return rebuild(parent, cur)", "        for nb in neighbors(grid, cur):", "            if nb in g: continue", "            g[nb] = g[cur] + 1", "            parent[nb] = cur", "            queue.append(nb)", "", "", "    return None", ""],
      java: ["List<Cell> bfs(Grid grid, Cell start, Cell goal) {", "  Deque<Cell> queue = new ArrayDeque<>(List.of(start));", "  Map<Cell,Integer> g = new HashMap<>(Map.of(start, 0)); Map<Cell,Cell> parent = new HashMap<>();", "  while (!queue.isEmpty()) {", "    Cell cur = queue.poll(); // oldest first", "    if (cur.equals(goal)) return rebuild(parent, cur);", "    for (Cell nb : neighbors(grid, cur)) {", "      if (g.containsKey(nb)) continue;", "      g.put(nb, g.get(cur) + 1);", "      parent.put(nb, cur);", "      queue.add(nb);", "    }", "  }", "  return null;", "}"],
      cpp: ["std::vector<Cell> bfs(const Grid& grid, Cell start, Cell goal) {", "  std::queue<Cell> queue; queue.push(start);", "  std::unordered_map<Cell,int> g{{start, 0}}; std::unordered_map<Cell,Cell> parent;", "  while (!queue.empty()) {", "    Cell cur = queue.front(); queue.pop(); // oldest first", "    if (cur == goal) return rebuild(parent, cur);", "    for (Cell nb : neighbors(grid, cur)) {", "      if (g.count(nb)) continue;", "      g[nb] = g[cur] + 1;", "      parent[nb] = cur;", "      queue.push(nb);", "    }", "  }", "  return {};", "}"],
      c: ["Path bfs(Grid *grid, Cell start, Cell goal) {", "  Queue queue = queue_new(); queue_push(&queue, start);", "  int g[ROWS][COLS]; fill(g, -1); g[start.r][start.c] = 0; Cell parent[ROWS][COLS];", "  while (queue.size > 0) {", "    Cell cur = queue_pop(&queue); /* oldest first */", "    if (cell_eq(cur, goal)) return rebuild(parent, cur);", "    for (int k = 0; k < 4; k++) { Cell nb = neighbor(grid, cur, k); if (!nb.ok) continue;", "      if (g[nb.r][nb.c] >= 0) continue;", "      g[nb.r][nb.c] = g[cur.r][cur.c] + 1;", "      parent[nb.r][nb.c] = cur;", "      queue_push(&queue, nb);", "    }", "  }", "  return no_path();", "}"],
      go: ["func bfs(grid Grid, start, goal Cell) []Cell {", "\tqueue := []Cell{start}", "\tg := map[Cell]int{start: 0}; parent := map[Cell]Cell{}", "\tfor len(queue) > 0 {", "\t\tcur := queue[0]; queue = queue[1:] // oldest first", "\t\tif cur == goal { return rebuild(parent, cur) }", "\t\tfor _, nb := range neighbors(grid, cur) {", "\t\t\tif _, seen := g[nb]; seen { continue }", "\t\t\tg[nb] = g[cur] + 1", "\t\t\tparent[nb] = cur", "\t\t\tqueue = append(queue, nb)", "\t\t}", "\t}", "\treturn nil", "}"],
      rs: ["fn bfs(grid: &Grid, start: Cell, goal: Cell) -> Option<Vec<Cell>> {", "    let mut queue = VecDeque::from([start]);", "    let mut g = HashMap::from([(start, 0)]); let mut parent = HashMap::new();", "    while let Some(cur) = queue.pop_front() {", "        // took the oldest cell in the queue", "        if cur == goal { return Some(rebuild(&parent, cur)); }", "        for nb in grid.neighbors(cur) {", "            if g.contains_key(&nb) { continue; }", "            g.insert(nb, g[&cur] + 1);", "            parent.insert(nb, cur);", "            queue.push_back(nb);", "        }", "    }", "    None", "}"],
    },
    pseudo: {
      en: ["BFS(start, goal)", "  queue ← [start]; dist[start] ← 0", "  while queue not empty", "    cur ← dequeue the oldest", "    if cur = goal: return path via parent", "    for each neighbour nb of cur not yet seen", "      dist[nb] ← dist[cur] + 1; parent[nb] ← cur; enqueue nb"],
      pt: ["BFS(início, destino)", "  fila ← [início]; dist[início] ← 0", "  enquanto fila não vazia", "    cur ← desenfileira o mais antigo", "    se cur = destino: retorna caminho pelos pais", "    para cada vizinho nb de cur ainda não visto", "      dist[nb] ← dist[cur] + 1; pai[nb] ← cur; enfileira nb"],
    },
  },

  dfs: {
    ...SIZE,
    family: "pathfinding",
    slug: "depth-first-search",
    kind: "grid",
    name: "Depth-first search",
    subtitle: { en: "depth-first · one corridor at a time", pt: "profundidade primeiro · um corredor por vez" },
    tagline: { en: "DFS · finds a path, rarely the shortest", pt: "DFS · acha um caminho, raramente o mais curto" },
    legend: [...LEGEND_BASE],
    kpis: [
      KPI_EXPANDED,
      { key: "open", label: { en: "STACK", pt: "PILHA" }, sub: { en: "waiting on the stack", pt: "esperando na pilha" } },
      { key: "pushed", label: { en: "PUSHED", pt: "EMPILHADAS" }, sub: { en: "cells pushed so far", pt: "células empilhadas até aqui" } },
      KPI_PATH,
      KPI_WALLS,
    ],
    idea: {
      en: [
        "Depth-first search takes the newest open cell instead of the oldest: a stack instead of a queue. It dives down one corridor as far as it can, and only when it is stuck does it back up to the last junction with an untried neighbour.",
        "That gives it a long, winding frontier and a path that follows the order neighbours were pushed, not the geometry of the maze. It finds a path if one exists, with tiny memory, but the path is usually far from the shortest.",
      ],
      pt: [
        "A busca em profundidade pega a célula aberta mais recente em vez da mais antiga: uma pilha no lugar de uma fila. Ela desce por um corredor até onde der, e só quando trava volta até a última bifurcação com um vizinho não tentado.",
        "Isso dá uma fronteira longa e sinuosa e um caminho que segue a ordem em que os vizinhos foram empilhados, não a geometria do labirinto. Ela acha um caminho se existir, com pouquíssima memória, mas o caminho costuma ficar longe do mais curto.",
      ],
    },
    stages: [["primary", { en: "pop", pt: "desempilha" }, { en: "the newest open cell", pt: "a célula aberta mais recente" }], STAGE_CHECK, ["swap", { en: "push", pt: "empilha" }, { en: "unvisited neighbours go on top", pt: "vizinhos não visitados vão para o topo" }], STAGE_PATH],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(d)", "green", { en: "the first corridor leads to the goal", pt: "o primeiro corredor leva ao destino" }],
      [{ en: "average", pt: "médio" }, "O(V + E)", "text", { en: "every cell and edge at most once", pt: "cada célula e aresta no máximo uma vez" }],
      [{ en: "worst", pt: "pior" }, "O(V + E)", "text", { en: "goal in the last corridor tried", pt: "destino no último corredor tentado" }],
      [{ en: "space", pt: "espaço" }, "O(V)", "text", { en: "the stack, usually far smaller than BFS's queue", pt: "a pilha, em geral bem menor que a fila do BFS" }],
    ],
    chartTitle: { en: "PATH LENGTH · 44×20 MAZE", pt: "COMPRIMENTO DO CAMINHO · LABIRINTO 44×20" },
    chart: [["dfs", 141, true], ["greedy", 66], ["bfs", 54], ["a*", 54], ["dijkstra", 54]],
    chartNote: { en: "same maze, same start and goal · only DFS and greedy give up on the shortest path", pt: "mesmo labirinto, início e destino · só DFS e greedy abrem mão do caminho mínimo" },
    when: {
      en: ["Any path will do: maze generation, connectivity checks, flood fills, cycle detection, topological sorts.", "Deep, narrow search spaces where memory matters: DFS keeps one path in memory, BFS keeps a whole frontier."],
      pt: ["Qualquer caminho serve: geração de labirintos, testes de conectividade, flood fill, detecção de ciclos, ordenação topológica.", "Espaços de busca fundos e estreitos em que memória importa: o DFS guarda um caminho, o BFS guarda uma fronteira inteira."],
    },
    pitfalls: {
      en: ["Not shortest: on an open grid the path snakes along the push order and can be several times longer than optimal.", "The recursive version overflows the call stack on big grids; use an explicit stack.", "Without a visited set it loops forever on any cycle."],
      pt: ["Não é mínimo: numa grade aberta o caminho serpenteia pela ordem de empilhamento e pode ser várias vezes mais longo que o ótimo.", "A versão recursiva estoura a pilha de chamadas em grades grandes; use uma pilha explícita.", "Sem um conjunto de visitados ela roda para sempre em qualquer ciclo."],
    },
    history: {
      en: "Depth-first search is the maze-walking method Charles Pierre Trémaux described in the 19th century: mark each passage as you enter it and back out of dead ends. John Hopcroft and Robert Tarjan turned it into a linear-time tool for graphs in 1973, and Tarjan's version won them the Turing Award in 1986.",
      pt: "A busca em profundidade é o método de percorrer labirintos que Charles Pierre Trémaux descreveu no século XIX: marque cada passagem ao entrar e volte dos becos sem saída. John Hopcroft e Robert Tarjan a transformaram numa ferramenta de tempo linear para grafos em 1973, e a versão de Tarjan lhes rendeu o Prêmio Turing em 1986.",
    },
    file: "dfs",
    code: {
      ts: ["function dfs(grid: Grid, start: Cell, goal: Cell) {", "  const stack: Cell[] = [start];", "  const seen = new Set([start]), parent = new Map();", "  while (stack.length > 0) {", "    const cur = stack.pop()!; // newest first", "    if (cur === goal) return rebuild(parent, cur);", "    for (const nb of neighbors(grid, cur)) {", "      if (seen.has(nb)) continue;", "      seen.add(nb);", "      parent.set(nb, cur);", "      stack.push(nb);", "    }", "  }", "  return null;", "}"],
      py: ["def dfs(grid, start, goal):", "    stack = [start]", "    seen, parent = {start}, {}", "    while stack:", "        cur = stack.pop()  # newest first", "        if cur == goal: return rebuild(parent, cur)", "        for nb in neighbors(grid, cur):", "            if nb in seen: continue", "            seen.add(nb)", "            parent[nb] = cur", "            stack.append(nb)", "", "", "    return None", ""],
      java: ["List<Cell> dfs(Grid grid, Cell start, Cell goal) {", "  Deque<Cell> stack = new ArrayDeque<>(List.of(start));", "  Set<Cell> seen = new HashSet<>(Set.of(start)); Map<Cell,Cell> parent = new HashMap<>();", "  while (!stack.isEmpty()) {", "    Cell cur = stack.pop(); // newest first", "    if (cur.equals(goal)) return rebuild(parent, cur);", "    for (Cell nb : neighbors(grid, cur)) {", "      if (seen.contains(nb)) continue;", "      seen.add(nb);", "      parent.put(nb, cur);", "      stack.push(nb);", "    }", "  }", "  return null;", "}"],
      cpp: ["std::vector<Cell> dfs(const Grid& grid, Cell start, Cell goal) {", "  std::vector<Cell> stack{start};", "  std::unordered_set<Cell> seen{start}; std::unordered_map<Cell,Cell> parent;", "  while (!stack.empty()) {", "    Cell cur = stack.back(); stack.pop_back(); // newest first", "    if (cur == goal) return rebuild(parent, cur);", "    for (Cell nb : neighbors(grid, cur)) {", "      if (seen.count(nb)) continue;", "      seen.insert(nb);", "      parent[nb] = cur;", "      stack.push_back(nb);", "    }", "  }", "  return {};", "}"],
      c: ["Path dfs(Grid *grid, Cell start, Cell goal) {", "  Stack stack = stack_new(); stack_push(&stack, start);", "  bool seen[ROWS][COLS] = {0}; seen[start.r][start.c] = true; Cell parent[ROWS][COLS];", "  while (stack.size > 0) {", "    Cell cur = stack_pop(&stack); /* newest first */", "    if (cell_eq(cur, goal)) return rebuild(parent, cur);", "    for (int k = 0; k < 4; k++) { Cell nb = neighbor(grid, cur, k); if (!nb.ok) continue;", "      if (seen[nb.r][nb.c]) continue;", "      seen[nb.r][nb.c] = true;", "      parent[nb.r][nb.c] = cur;", "      stack_push(&stack, nb);", "    }", "  }", "  return no_path();", "}"],
      go: ["func dfs(grid Grid, start, goal Cell) []Cell {", "\tstack := []Cell{start}", "\tseen := map[Cell]bool{start: true}; parent := map[Cell]Cell{}", "\tfor len(stack) > 0 {", "\t\tcur := stack[len(stack)-1]; stack = stack[:len(stack)-1] // newest first", "\t\tif cur == goal { return rebuild(parent, cur) }", "\t\tfor _, nb := range neighbors(grid, cur) {", "\t\t\tif seen[nb] { continue }", "\t\t\tseen[nb] = true", "\t\t\tparent[nb] = cur", "\t\t\tstack = append(stack, nb)", "\t\t}", "\t}", "\treturn nil", "}"],
      rs: ["fn dfs(grid: &Grid, start: Cell, goal: Cell) -> Option<Vec<Cell>> {", "    let mut stack = vec![start];", "    let mut seen = HashSet::from([start]); let mut parent = HashMap::new();", "    while let Some(cur) = stack.pop() {", "        // took the newest cell on the stack", "        if cur == goal { return Some(rebuild(&parent, cur)); }", "        for nb in grid.neighbors(cur) {", "            if seen.contains(&nb) { continue; }", "            seen.insert(nb);", "            parent.insert(nb, cur);", "            stack.push(nb);", "        }", "    }", "    None", "}"],
    },
    pseudo: {
      en: ["DFS(start, goal)", "  stack ← [start]; seen ← {start}", "  while stack not empty", "    cur ← pop the newest", "    if cur = goal: return path via parent", "    for each neighbour nb of cur not in seen", "      add nb to seen; parent[nb] ← cur; push nb"],
      pt: ["DFS(início, destino)", "  pilha ← [início]; visto ← {início}", "  enquanto pilha não vazia", "    cur ← desempilha o mais recente", "    se cur = destino: retorna caminho pelos pais", "    para cada vizinho nb de cur fora de visto", "      adiciona nb a visto; pai[nb] ← cur; empilha nb"],
    },
  },

  dijkstra: {
    ...SIZE,
    family: "pathfinding",
    slug: "dijkstra",
    kind: "grid",
    name: "Dijkstra",
    subtitle: { en: "uniform cost · cheapest first", pt: "custo uniforme · o mais barato primeiro" },
    tagline: { en: "Dijkstra · BFS that learned what things cost", pt: "Dijkstra · o BFS que aprendeu quanto as coisas custam" },
    legend: [...LEGEND_BASE, ["amber", { en: "mud ×4", pt: "lama ×4" }]],
    kpis: [
      KPI_EXPANDED,
      { key: "open", label: { en: "OPEN SET", pt: "ABERTO" }, sub: { en: "candidates in the heap", pt: "candidatas no heap" } },
      { key: "pushed", label: { en: "PUSHES", pt: "INSERÇÕES" }, sub: { en: "relaxations that improved g", pt: "relaxamentos que melhoraram g" } },
      { key: "cost", label: { en: "COST", pt: "CUSTO" }, sub: { en: "of the path once found", pt: "do caminho ao chegar" } },
      KPI_WALLS,
    ],
    idea: {
      en: [
        "Dijkstra's algorithm is breadth-first search with a price tag. Instead of a queue it keeps a priority queue ordered by g, the cheapest known cost to reach each cell, and always expands the cheapest open cell. When a neighbour can be reached more cheaply through the current cell, its cost and parent are updated.",
        "On this grid the amber cells are mud and cost 4 instead of 1. BFS would walk straight through them, counting steps; Dijkstra routes around them when the detour is cheaper, and the first time it pops the goal the path is the cheapest one, not merely the shortest.",
      ],
      pt: [
        "O algoritmo de Dijkstra é a busca em largura com etiqueta de preço. Em vez de uma fila ele mantém uma fila de prioridade ordenada por g, o menor custo conhecido para chegar a cada célula, e sempre expande a célula aberta mais barata. Quando um vizinho pode ser alcançado mais barato pela célula atual, seu custo e seu pai são atualizados.",
        "Nesta grade as células âmbar são lama e custam 4 em vez de 1. O BFS atravessaria direto, contando passos; o Dijkstra contorna quando o desvio é mais barato, e na primeira vez que retira o destino o caminho é o mais barato, não apenas o mais curto.",
      ],
    },
    stages: [["primary", { en: "pop", pt: "retira" }, { en: "the open cell with the lowest g", pt: "a célula aberta de menor g" }], STAGE_CHECK, ["swap", { en: "relax", pt: "relaxa" }, { en: "cheaper neighbours get a new g", pt: "vizinhos mais baratos ganham novo g" }], STAGE_PATH],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(d log V)", "green", { en: "goal next to the start", pt: "destino ao lado do início" }],
      [{ en: "average", pt: "médio" }, "O(E log V)", "text", { en: "with a binary heap", pt: "com um heap binário" }],
      [{ en: "worst", pt: "pior" }, "O(E log V)", "text", { en: "the whole grid, like BFS", pt: "a grade inteira, como o BFS" }],
      [{ en: "space", pt: "espaço" }, "O(V)", "text", { en: "heap, costs and parents", pt: "heap, custos e pais" }],
    ],
    chartTitle: { en: "PATH COST · 44×20 MAZE WITH MUD", pt: "CUSTO DO CAMINHO · LABIRINTO 44×20 COM LAMA" },
    chart: [["dfs", 190], ["greedy", 96], ["bfs", 78], ["a*", 62], ["dijkstra", 62, true]],
    chartNote: { en: "same maze · BFS's path is shorter in steps but walks through mud", pt: "mesmo labirinto · o caminho do BFS é mais curto em passos, mas atravessa a lama" },
    when: {
      en: ["Weighted graphs with non-negative costs: road networks, network routing, terrain with different movement costs.", "When you need the cheapest paths from one source to every node, not just to one goal: run it to exhaustion."],
      pt: ["Grafos com pesos não negativos: malhas viárias, roteamento de redes, terreno com custos de movimento diferentes.", "Quando você precisa dos caminhos mais baratos de uma origem para todo nó, não só para um destino: rode até esgotar."],
    },
    pitfalls: {
      en: ["Negative edges break it: a cell closed early might have been reachable more cheaply. Use Bellman–Ford.", "With uniform costs it degenerates into BFS with a heap: slower, no better. Add a heuristic and it becomes A*.", "Decreasing a key in the heap is awkward; pushing a duplicate and skipping stale pops is simpler and just as fast."],
      pt: ["Arestas negativas quebram o algoritmo: uma célula fechada cedo poderia ser alcançada mais barato. Use Bellman–Ford.", "Com custos uniformes ele vira um BFS com heap: mais lento, sem ser melhor. Some uma heurística e vira o A*.", "Diminuir uma chave dentro do heap é desajeitado; empurrar uma duplicata e pular as retiradas velhas é mais simples e igualmente rápido."],
    },
    history: {
      en: "Edsger Dijkstra designed the algorithm in 1956 in about twenty minutes, at a café in Amsterdam, as a demonstration for the ARMAC computer: the shortest route between two Dutch cities. He published it in 1959 in a three-page paper. With Fibonacci heaps, Fredman and Tarjan brought it to O(E + V log V) in 1984.",
      pt: "Edsger Dijkstra criou o algoritmo em 1956 em cerca de vinte minutos, num café em Amsterdã, como demonstração para o computador ARMAC: a rota mais curta entre duas cidades holandesas. Publicou-o em 1959 num artigo de três páginas. Com heaps de Fibonacci, Fredman e Tarjan o levaram a O(E + V log V) em 1984.",
    },
    file: "dijkstra",
    code: {
      ts: ["function dijkstra(grid: Grid, start: Cell, goal: Cell) {", "  const open = new MinHeap<Cell>([start]);", "  const g = new Map([[start, 0]]), parent = new Map();", "  while (open.size > 0) {", "    const cur = open.pop(); // lowest g", "    if (cur === goal) return rebuild(parent, cur);", "    for (const nb of neighbors(grid, cur)) {", "      const ng = g.get(cur)! + cost(grid, nb);", "      if (ng < (g.get(nb) ?? Infinity)) {", "        g.set(nb, ng); parent.set(nb, cur);", "        open.push(nb, ng);", "      }", "    }", "  }", "}"],
      py: ["def dijkstra(grid, start, goal):", "    open_set = [(0, start)]", "    g, parent = {start: 0}, {}", "    while open_set:", "        _, cur = heapq.heappop(open_set)  # lowest g", "        if cur == goal: return rebuild(parent, cur)", "        for nb in neighbors(grid, cur):", "            ng = g[cur] + cost(grid, nb)", "            if ng < g.get(nb, math.inf):", "                g[nb], parent[nb] = ng, cur", "                heapq.heappush(open_set, (ng, nb))", "", "", "", ""],
      java: ["List<Cell> dijkstra(Grid grid, Cell start, Cell goal) {", "  PriorityQueue<Cell> open = new PriorityQueue<>(byG); open.add(start);", "  Map<Cell,Integer> g = new HashMap<>(Map.of(start, 0)); Map<Cell,Cell> parent = new HashMap<>();", "  while (!open.isEmpty()) {", "    Cell cur = open.poll(); // lowest g", "    if (cur.equals(goal)) return rebuild(parent, cur);", "    for (Cell nb : neighbors(grid, cur)) {", "      int ng = g.get(cur) + cost(grid, nb);", "      if (ng < g.getOrDefault(nb, Integer.MAX_VALUE)) {", "        g.put(nb, ng); parent.put(nb, cur);", "        nb.g = ng; open.add(nb);", "      }", "    }", "  }", "}"],
      cpp: ["std::vector<Cell> dijkstra(const Grid& grid, Cell start, Cell goal) {", "  std::priority_queue<Node, std::vector<Node>, ByG> open; open.push({start, 0});", "  std::unordered_map<Cell,int> g{{start, 0}}; std::unordered_map<Cell,Cell> parent;", "  while (!open.empty()) {", "    Cell cur = open.top().cell; open.pop(); // lowest g", "    if (cur == goal) return rebuild(parent, cur);", "    for (Cell nb : neighbors(grid, cur)) {", "      int ng = g[cur] + cost(grid, nb);", "      if (!g.count(nb) || ng < g[nb]) {", "        g[nb] = ng; parent[nb] = cur;", "        open.push({nb, ng});", "      }", "    }", "  }", "}"],
      c: ["Path dijkstra(Grid *grid, Cell start, Cell goal) {", "  Heap open = heap_new(); heap_push(&open, start, 0);", "  int g[ROWS][COLS]; fill(g, INF); g[start.r][start.c] = 0; Cell parent[ROWS][COLS];", "  while (open.size > 0) {", "    Cell cur = heap_pop(&open); /* lowest g */", "    if (cell_eq(cur, goal)) return rebuild(parent, cur);", "    for (int k = 0; k < 4; k++) { Cell nb = neighbor(grid, cur, k); if (!nb.ok) continue;", "      int ng = g[cur.r][cur.c] + cost(grid, nb);", "      if (ng < g[nb.r][nb.c]) {", "        g[nb.r][nb.c] = ng; parent[nb.r][nb.c] = cur;", "        heap_push(&open, nb, ng);", "      }", "    }", "  }", "}"],
      go: ["func dijkstra(grid Grid, start, goal Cell) []Cell {", "\topen := NewMinHeap(); open.Push(start, 0)", "\tg := map[Cell]int{start: 0}; parent := map[Cell]Cell{}", "\tfor open.Len() > 0 {", "\t\tcur := open.Pop() // lowest g", "\t\tif cur == goal { return rebuild(parent, cur) }", "\t\tfor _, nb := range neighbors(grid, cur) {", "\t\t\tng := g[cur] + cost(grid, nb)", "\t\t\tif old, ok := g[nb]; !ok || ng < old {", "\t\t\t\tg[nb] = ng; parent[nb] = cur", "\t\t\t\topen.Push(nb, ng)", "\t\t\t}", "\t\t}", "\t}", "}"],
      rs: ["fn dijkstra(grid: &Grid, start: Cell, goal: Cell) -> Option<Vec<Cell>> {", "    let mut open = BinaryHeap::new(); open.push(Reverse((0, start)));", "    let mut g = HashMap::from([(start, 0)]); let mut parent = HashMap::new();", "    while let Some(Reverse((_, cur))) = open.pop() {", "        // popped the cell with the lowest g", "        if cur == goal { return Some(rebuild(&parent, cur)); }", "        for nb in grid.neighbors(cur) {", "            let ng = g[&cur] + grid.cost(nb);", "            if ng < *g.get(&nb).unwrap_or(&i32::MAX) {", "                g.insert(nb, ng); parent.insert(nb, cur);", "                open.push(Reverse((ng, nb)));", "            }", "        }", "    }", "    None }"],
    },
    pseudo: {
      en: ["DIJKSTRA(start, goal)", "  open ← {start}; g[start] ← 0", "  while open not empty", "    cur ← node in open with lowest g", "    if cur = goal: return path via parent", "    for each neighbour nb of cur", "      if g[cur] + cost(nb) < g[nb]", "        g[nb] ← g[cur] + cost(nb); parent[nb] ← cur; add nb to open"],
      pt: ["DIJKSTRA(início, destino)", "  aberto ← {início}; g[início] ← 0", "  enquanto aberto não vazio", "    cur ← nó do aberto com menor g", "    se cur = destino: retorna caminho pelos pais", "    para cada vizinho nb de cur", "      se g[cur] + custo(nb) < g[nb]", "        g[nb] ← g[cur] + custo(nb); pai[nb] ← cur; adiciona nb ao aberto"],
    },
  },

  astar: {
    ...SIZE,
    family: "pathfinding",
    slug: "a-star",
    kind: "grid",
    name: "A*",
    subtitle: { en: "best-first search · Manhattan heuristic", pt: "busca best-first · heurística de Manhattan" },
    tagline: { en: "A* · f = g + h · why it beats Dijkstra on a map", pt: "A* · f = g + h · por que vence Dijkstra num mapa" },
    legend: [...LEGEND_BASE],
    kpis: [
      KPI_EXPANDED,
      { key: "open", label: { en: "OPEN SET", pt: "ABERTO" }, sub: { en: "candidates in the heap", pt: "candidatas no heap" } },
      { key: "pushed", label: { en: "PUSHES", pt: "INSERÇÕES" }, sub: { en: "relaxations that improved g", pt: "relaxamentos que melhoraram g" } },
      KPI_PATH,
      KPI_WALLS,
    ],
    idea: {
      en: [
        "A* keeps an open set of cells to explore and always expands the one with the lowest f = g + h, where g is the cost from the start so far and h is an estimate of the cost still to go. With h = 0 it is Dijkstra; with a good h it heads straight for the goal and expands far fewer cells.",
        "On a grid with 4-way movement the Manhattan distance is the natural heuristic. It never overestimates, so A* is guaranteed to return a shortest path; the closed cells you see are the price of that guarantee.",
      ],
      pt: [
        "O A* mantém um conjunto aberto de células a explorar e sempre expande a de menor f = g + h, onde g é o custo desde o início e h é uma estimativa do custo que falta. Com h = 0 vira Dijkstra; com um bom h ele vai direto ao destino e expande muito menos células.",
        "Numa grade com 4 direções a distância de Manhattan é a heurística natural. Ela nunca superestima, então o A* garante um caminho mínimo; as células fechadas que você vê são o preço dessa garantia.",
      ],
    },
    stages: [["primary", { en: "pop", pt: "retira" }, { en: "open cell with lowest g + h", pt: "célula aberta de menor g + h" }], STAGE_CHECK, ["swap", { en: "relax", pt: "relaxa" }, { en: "cheaper neighbours get new g", pt: "vizinhos mais baratos ganham novo g" }], STAGE_PATH],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(d)", "green", { en: "heuristic is exact, straight line to goal", pt: "heurística exata, linha reta ao destino" }],
      [{ en: "average", pt: "médio" }, "O(E log V)", "text", { en: "depends on the heuristic quality", pt: "depende da qualidade da heurística" }],
      [{ en: "worst", pt: "pior" }, "O(E log V)", "neg", { en: "h = 0, same as Dijkstra", pt: "h = 0, igual ao Dijkstra" }],
      [{ en: "space", pt: "espaço" }, "O(V)", "text", { en: "open and closed sets, parents", pt: "conjuntos aberto e fechado, pais" }],
    ],
    chartTitle: { en: "CELLS EXPANDED · 44×20 MAZE", pt: "CÉLULAS EXPANDIDAS · LABIRINTO 44×20" },
    chart: [["bfs", 612], ["dijkstra", 604], ["greedy", 96], ["a*", 188, true], ["jps", 41]],
    chartNote: { en: "same maze, same start and goal · greedy path was 23% longer", pt: "mesmo labirinto, início e destino · caminho greedy 23% mais longo" },
    when: {
      en: ["Any map with a meaningful distance: game units, robots, GPS routing, puzzle solvers.", "When you need the optimal path and can afford to keep an open set in memory."],
      pt: ["Qualquer mapa com distância significativa: unidades de jogo, robôs, rotas de GPS, solucionadores de quebra-cabeça.", "Quando você precisa do caminho ótimo e pode manter um conjunto aberto em memória."],
    },
    pitfalls: {
      en: [
        "A heuristic that overestimates breaks optimality. Manhattan for 4-way, octile for 8-way, Euclidean is safe but weak.",
        "Ties in f make A* wander. Break ties toward larger g to stay focused.",
        "Open set as a plain array is O(n) per pop. Use a binary heap.",
        "Dynamic maps: re-running A* every change is wasteful. D* Lite reuses the search.",
      ],
      pt: [
        "Heurística que superestima quebra a otimalidade. Manhattan para 4 direções, octile para 8, euclidiana é segura mas fraca.",
        "Empates em f fazem o A* vagar. Desempate para g maior mantém o foco.",
        "Conjunto aberto como vetor simples é O(n) por retirada. Use um heap binário.",
        "Mapas dinâmicos: rodar A* a cada mudança é desperdício. D* Lite reaproveita a busca.",
      ],
    },
    history: {
      en: "Peter Hart, Nils Nilsson and Bertram Raphael published A* in 1968 at Stanford Research Institute, for Shakey, the first mobile robot that could reason about its actions. It generalised Dijkstra’s 1959 algorithm by adding the heuristic term.",
      pt: "Peter Hart, Nils Nilsson e Bertram Raphael publicaram o A* em 1968 no Stanford Research Institute, para o Shakey, o primeiro robô móvel capaz de raciocinar sobre suas ações. Generalizou o algoritmo de Dijkstra de 1959 adicionando o termo heurístico.",
    },
    file: "a_star",
    code: {
      ts: ["function aStar(grid: Grid, start: Cell, goal: Cell) {", "  const open = new MinHeap<Cell>([start]);", "  const g = new Map([[start, 0]]), parent = new Map();", "  while (open.size > 0) {", "    const cur = open.pop(); // lowest f = g + h", "    if (cur === goal) return rebuild(parent, cur);", "    for (const nb of neighbors(grid, cur)) {", "      const ng = g.get(cur)! + 1;", "      if (ng < (g.get(nb) ?? Infinity)) {", "        g.set(nb, ng); parent.set(nb, cur);", "        open.push(nb, ng + h(nb, goal));", "      }", "    }", "  }", "}"],
      py: ["def a_star(grid, start, goal):", "    open_set = [(h(start, goal), start)]", "    g, parent = {start: 0}, {}", "    while open_set:", "        _, cur = heapq.heappop(open_set)  # lowest f", "        if cur == goal: return rebuild(parent, cur)", "        for nb in neighbors(grid, cur):", "            ng = g[cur] + 1", "            if ng < g.get(nb, math.inf):", "                g[nb], parent[nb] = ng, cur", "                heapq.heappush(open_set, (ng + h(nb, goal), nb))", "", "", "", ""],
      java: ["List<Cell> aStar(Grid grid, Cell start, Cell goal) {", "  PriorityQueue<Cell> open = new PriorityQueue<>(byF); open.add(start);", "  Map<Cell,Integer> g = new HashMap<>(Map.of(start, 0)); Map<Cell,Cell> parent = new HashMap<>();", "  while (!open.isEmpty()) {", "    Cell cur = open.poll(); // lowest f = g + h", "    if (cur.equals(goal)) return rebuild(parent, cur);", "    for (Cell nb : neighbors(grid, cur)) {", "      int ng = g.get(cur) + 1;", "      if (ng < g.getOrDefault(nb, Integer.MAX_VALUE)) {", "        g.put(nb, ng); parent.put(nb, cur);", "        nb.f = ng + h(nb, goal); open.add(nb);", "      }", "    }", "  }", "}"],
      cpp: ["std::vector<Cell> aStar(const Grid& grid, Cell start, Cell goal) {", "  std::priority_queue<Node, std::vector<Node>, ByF> open; open.push({start, h(start, goal)});", "  std::unordered_map<Cell,int> g{{start, 0}}; std::unordered_map<Cell,Cell> parent;", "  while (!open.empty()) {", "    Cell cur = open.top().cell; open.pop(); // lowest f", "    if (cur == goal) return rebuild(parent, cur);", "    for (Cell nb : neighbors(grid, cur)) {", "      int ng = g[cur] + 1;", "      if (!g.count(nb) || ng < g[nb]) {", "        g[nb] = ng; parent[nb] = cur;", "        open.push({nb, ng + h(nb, goal)});", "      }", "    }", "  }", "}"],
      c: ["Path a_star(Grid *grid, Cell start, Cell goal) {", "  Heap open = heap_new(); heap_push(&open, start, h(start, goal));", "  int g[ROWS][COLS]; fill(g, INF); g[start.r][start.c] = 0; Cell parent[ROWS][COLS];", "  while (open.size > 0) {", "    Cell cur = heap_pop(&open); /* lowest f = g + h */", "    if (cell_eq(cur, goal)) return rebuild(parent, cur);", "    for (int k = 0; k < 4; k++) { Cell nb = neighbor(grid, cur, k); if (!nb.ok) continue;", "      int ng = g[cur.r][cur.c] + 1;", "      if (ng < g[nb.r][nb.c]) {", "        g[nb.r][nb.c] = ng; parent[nb.r][nb.c] = cur;", "        heap_push(&open, nb, ng + h(nb, goal));", "      }", "    }", "  }", "}"],
      go: ["func aStar(grid Grid, start, goal Cell) []Cell {", "\topen := NewMinHeap(); open.Push(start, h(start, goal))", "\tg := map[Cell]int{start: 0}; parent := map[Cell]Cell{}", "\tfor open.Len() > 0 {", "\t\tcur := open.Pop() // lowest f = g + h", "\t\tif cur == goal { return rebuild(parent, cur) }", "\t\tfor _, nb := range neighbors(grid, cur) {", "\t\t\tng := g[cur] + 1", "\t\t\tif old, ok := g[nb]; !ok || ng < old {", "\t\t\t\tg[nb] = ng; parent[nb] = cur", "\t\t\t\topen.Push(nb, ng+h(nb, goal))", "\t\t\t}", "\t\t}", "\t}", "}"],
      rs: ["fn a_star(grid: &Grid, start: Cell, goal: Cell) -> Option<Vec<Cell>> {", "    let mut open = BinaryHeap::new(); open.push(Reverse((h(start, goal), start)));", "    let mut g = HashMap::from([(start, 0)]); let mut parent = HashMap::new();", "    while let Some(Reverse((_, cur))) = open.pop() {", "        // popped the cell with the lowest f = g + h", "        if cur == goal { return Some(rebuild(&parent, cur)); }", "        for nb in grid.neighbors(cur) {", "            let ng = g[&cur] + 1;", "            if ng < *g.get(&nb).unwrap_or(&i32::MAX) {", "                g.insert(nb, ng); parent.insert(nb, cur);", "                open.push(Reverse((ng + h(nb, goal), nb)));", "            }", "        }", "    }", "    None }"],
    },
    pseudo: {
      en: ["A*(start, goal)", "  open ← {start}; g[start] ← 0", "  while open not empty", "    cur ← node in open with lowest g + h", "    if cur = goal: return path via parent", "    for each neighbour nb of cur", "      if g[cur] + 1 < g[nb]", "        g[nb] ← g[cur] + 1; parent[nb] ← cur; add nb to open"],
      pt: ["A*(início, destino)", "  aberto ← {início}; g[início] ← 0", "  enquanto aberto não vazio", "    cur ← nó do aberto com menor g + h", "    se cur = destino: retorna caminho pelos pais", "    para cada vizinho nb de cur", "      se g[cur] + 1 < g[nb]", "        g[nb] ← g[cur] + 1; pai[nb] ← cur; adiciona nb ao aberto"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
