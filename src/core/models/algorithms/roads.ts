// Models
import type { Localized } from "../translations";
import type { VizKey } from "../viz";
import type { AlgorithmSpec, KpiSpec } from "./spec";

const SIZE = { sizeLabel: { en: "Route (×100 m)", pt: "Rota (×100 m)" }, minN: 5, maxN: 40, stepN: 5, defaultN: 20, shuffleLabel: { en: "New route", pt: "Nova rota" }, stepMs: 90, kind: "map", family: "pathfinding", variants: ["real-map-a-star", "real-map-dijkstra", "real-map-bfs"] } as const;

const LEGEND: [VizKey, Localized][] = [["primary", { en: "explored streets · open", pt: "ruas exploradas · aberto" }], ["act", { en: "current", pt: "atual" }], ["violet", { en: "route", pt: "rota" }], ["green", { en: "start / goal", pt: "início / destino" }]];

const KPI_EXPANDED: KpiSpec = { key: "expanded", unitKey: "expandedUnit", label: { en: "EXPANDED", pt: "EXPANDIDOS" }, sub: { en: "intersections closed", pt: "cruzamentos fechados" } };
const KPI_OPEN: KpiSpec = { key: "open", label: { en: "OPEN", pt: "ABERTO" }, sub: { en: "intersections waiting", pt: "cruzamentos esperando" } };
const KPI_DISTANCE: KpiSpec = { key: "distance", label: { en: "DISTANCE", pt: "DISTÂNCIA" }, sub: { en: "start to the current one", pt: "do início até o atual" } };
const KPI_PATH: KpiSpec = { key: "path", label: { en: "ROUTE", pt: "ROTA" }, sub: { en: "length once found", pt: "comprimento ao achar" } };
const KPI_STRAIGHT: KpiSpec = { key: "straight", label: { en: "STRAIGHT LINE", pt: "LINHA RETA" }, sub: { en: "start to goal", pt: "do início ao destino" } };

const CHART_EXPANDED: [string, number, boolean?][] = [["a*", 537], ["dijkstra", 2045], ["bfs", 2303]];
const CHART_EXPANDED_TITLE = { en: "INTERSECTIONS EXPANDED · CASCAVEL, 3.2 km ROUTE", pt: "CRUZAMENTOS EXPANDIDOS · CASCAVEL, ROTA DE 3,2 km" };
const CHART_EXPANDED_NOTE = { en: "same start and goal (seed 7, route 30) · 3 949 intersections in the map", pt: "mesmo início e destino (seed 7, rota 30) · 3.949 cruzamentos no mapa" };

const selfIn = (chart: [string, number, boolean?][], label: string): [string, number, boolean?][] => chart.map(([name, value]) => (name === label ? [name, value, true] : [name, value]));

const STAGE_START: [VizKey, Localized, Localized] = ["green", { en: "place", pt: "coloca" }, { en: "two intersections about n × 100 m apart", pt: "dois cruzamentos a cerca de n × 100 m" }];
const STAGE_PATH: [VizKey, Localized, Localized] = ["violet", { en: "route", pt: "rota" }, { en: "follow parents back along the streets", pt: "segue os pais de volta pelas ruas" }];

const WHEN_MAP: Localized<string[]> = {
  en: ["Any road, rail or pipe network with lengths on the segments: GPS routing, logistics, network packets.", "Rerun on a longer route (the slider) to watch the gap between the three searches open up."],
  pt: ["Qualquer rede viária, ferroviária ou de dutos com comprimentos nos trechos: roteamento GPS, logística, pacotes de rede.", "Rode de novo numa rota mais longa (o controle) para ver a diferença entre as três buscas crescer."],
};

const HISTORY_MAP: Localized = {
  en: "The map is the centre of Cascavel, Paraná: 4 180 intersections and 5 438 street segments from OpenStreetMap, one-way streets respected, about 10 by 7 km. Every real routing engine runs this same loop on a graph a million times larger, with contraction hierarchies or landmarks precomputed so that a query touches only a sliver of it.",
  pt: "O mapa é o centro de Cascavel, Paraná: 4.180 cruzamentos e 5.438 trechos de rua do OpenStreetMap, mãos únicas respeitadas, cerca de 10 por 7 km. Todo motor de rotas real roda este mesmo laço num grafo um milhão de vezes maior, com hierarquias de contração ou marcos pré-calculados para que uma consulta toque só uma fatia dele.",
};

export const ROADS = {
  roadAstar: {
    ...SIZE,
    slug: "real-map-a-star",
    name: "A* on the real map",
    short: "A*",
    subtitle: { en: "Cascavel streets · straight-line heuristic", pt: "ruas de Cascavel · heurística em linha reta" },
    tagline: { en: "A* · distance so far plus the crow's flight to the goal", pt: "A* · distância até aqui mais o voo do corvo até o destino" },
    legend: LEGEND,
    kpis: [KPI_EXPANDED, KPI_OPEN, KPI_DISTANCE, KPI_PATH, KPI_STRAIGHT],
    idea: {
      en: [
        "A* ranks every open intersection by the distance driven to reach it plus the straight-line distance still to go. Because no street can be shorter than the straight line, that estimate never overshoots, and the first time the goal comes out of the open set its route is the shortest there is.",
        "On a real street map the effect is visible at once: the search grows as a lobe pointed at the goal instead of a disc, and it closes a few hundred intersections where Dijkstra closes thousands. The route it returns is the same one Dijkstra finds.",
      ],
      pt: [
        "O A* ordena cada cruzamento aberto pela distância percorrida até ele mais a distância em linha reta que ainda falta. Como nenhuma rua pode ser mais curta que a linha reta, essa estimativa nunca passa do real, e na primeira vez que o destino sai do conjunto aberto sua rota é a mais curta que existe.",
        "Num mapa de ruas real o efeito aparece na hora: a busca cresce como um lóbulo apontado para o destino em vez de um disco, e fecha algumas centenas de cruzamentos onde o Dijkstra fecha milhares. A rota devolvida é a mesma que o Dijkstra encontra.",
      ],
    },
    stages: [STAGE_START, ["act", { en: "pop", pt: "retira" }, { en: "lowest distance + straight line", pt: "menor distância + linha reta" }], ["primary", { en: "relax", pt: "relaxa" }, { en: "shorter way to a neighbour: new distance, new parent", pt: "caminho mais curto a um vizinho: nova distância, novo pai" }], STAGE_PATH],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(d)", "green", { en: "a straight road to the goal", pt: "uma rua reta até o destino" }],
      [{ en: "average", pt: "médio" }, "O(E log V)", "green", { en: "a lobe of the map, not a disc", pt: "um lóbulo do mapa, não um disco" }],
      [{ en: "worst", pt: "pior" }, "O(E log V)", "text", { en: "a river or a wall: it degrades to Dijkstra", pt: "um rio ou um muro: degrada para Dijkstra" }],
      [{ en: "space", pt: "espaço" }, "O(V)", "text", { en: "distances, parents and the open set", pt: "distâncias, pais e o conjunto aberto" }],
    ],
    chartTitle: CHART_EXPANDED_TITLE,
    chart: selfIn(CHART_EXPANDED, "a*"),
    chartNote: CHART_EXPANDED_NOTE,
    when: WHEN_MAP,
    pitfalls: {
      en: ["The heuristic must never overestimate: with a speed-based cost, divide the straight line by the fastest road, not the average.", "Ties along a grid make the frontier wide; a tiny tie-breaker toward the goal keeps it narrow.", "Distances in a Map are fine for a city; a country needs typed arrays and a real heap."],
      pt: ["A heurística nunca pode superestimar: com custo por velocidade, divida a linha reta pela via mais rápida, não pela média.", "Empates numa malha quadriculada alargam a fronteira; um desempate minúsculo rumo ao destino a mantém estreita.", "Distâncias num Map servem para uma cidade; um país precisa de typed arrays e um heap de verdade."],
    },
    history: HISTORY_MAP,
    file: "route_a_star",
    code: {
      ts: ["function route(map: RoadMap, start: Node, goal: Node) {", "  const open = new MinHeap([start]), distance = new Map([[start, 0]]), parent = new Map();", "  while (open.size > 0) {", "    // lowest distance so far + straight line to the goal", "    const current = open.pop();", "    if (current === goal) return rebuild(parent, goal);", "    for (const street of map.streetsFrom(current)) {", "      const next = street.otherEnd(current);", "      const candidate = distance.get(current)! + street.metres;", "      if (candidate >= (distance.get(next) ?? Infinity)) continue;", "      distance.set(next, candidate); parent.set(next, current);", "      open.push(next, candidate + straightLine(next, goal));", "    }", "  }", "}"],
      py: ["def route(road_map, start, goal):", "    open_set = [(straight_line(start, goal), start)]; distance = {start: 0}; parent = {}", "    while open_set:", "        # lowest distance so far + straight line to the goal", "        _, current = heapq.heappop(open_set)", "        if current == goal: return rebuild(parent, goal)", "        for street in road_map.streets_from(current):", "            next_node = street.other_end(current)", "            candidate = distance[current] + street.metres", "            if candidate >= distance.get(next_node, math.inf): continue", "            distance[next_node] = candidate; parent[next_node] = current", "            heapq.heappush(open_set, (candidate + straight_line(next_node, goal), next_node))", "", "", ""],
      java: ["List<Node> route(RoadMap map, Node start, Node goal) {", "  PriorityQueue<Entry> open = new PriorityQueue<>(); open.add(new Entry(start, 0)); Map<Node,Double> distance = new HashMap<>(Map.of(start, 0.0)); Map<Node,Node> parent = new HashMap<>();", "  while (!open.isEmpty()) {", "    // lowest distance so far + straight line to the goal", "    Node current = open.poll().node;", "    if (current.equals(goal)) return rebuild(parent, goal);", "    for (Street street : map.streetsFrom(current)) {", "      Node next = street.otherEnd(current);", "      double candidate = distance.get(current) + street.metres;", "      if (candidate >= distance.getOrDefault(next, Double.MAX_VALUE)) continue;", "      distance.put(next, candidate); parent.put(next, current);", "      open.add(new Entry(next, candidate + straightLine(next, goal)));", "    }", "  }", "}"],
      cpp: ["std::vector<Node> route(const RoadMap& map, Node start, Node goal) {", "  std::priority_queue<Entry, std::vector<Entry>, ByScore> open; open.push({start, 0}); std::unordered_map<Node,double> distance{{start, 0}}; std::unordered_map<Node,Node> parent;", "  while (!open.empty()) {", "    // lowest distance so far + straight line to the goal", "    Node current = open.top().node; open.pop();", "    if (current == goal) return rebuild(parent, goal);", "    for (const Street& street : map.streetsFrom(current)) {", "      Node next = street.otherEnd(current);", "      double candidate = distance[current] + street.metres;", "      if (distance.count(next) && candidate >= distance[next]) continue;", "      distance[next] = candidate; parent[next] = current;", "      open.push({next, candidate + straightLine(next, goal)});", "    }", "  }", "}"],
      c: ["Path route(const RoadMap *map, int start, int goal) {", "  Heap open = heap_new(); heap_push(&open, start, 0); double distance[MAX_NODES]; fill(distance, INFINITY); distance[start] = 0; int parent[MAX_NODES];", "  while (open.size > 0) {", "    /* lowest distance so far + straight line to the goal */", "    int current = heap_pop(&open);", "    if (current == goal) return rebuild(parent, goal);", "    for (int k = 0; k < map->degree[current]; k++) { const Street *street = &map->streets[map->adj[current][k]];", "      int next = street->a == current ? street->b : street->a;", "      double candidate = distance[current] + street->metres;", "      if (candidate >= distance[next]) continue;", "      distance[next] = candidate; parent[next] = current;", "      heap_push(&open, next, candidate + straight_line(map, next, goal));", "    }", "  }", "}"],
      go: ["func route(roadMap RoadMap, start, goal Node) []Node {", "\topen := NewMinHeap(); open.Push(start, 0); distance := map[Node]float64{start: 0}; parent := map[Node]Node{}", "\tfor open.Len() > 0 {", "\t\t// lowest distance so far + straight line to the goal", "\t\tcurrent := open.Pop()", "\t\tif current == goal { return rebuild(parent, goal) }", "\t\tfor _, street := range roadMap.StreetsFrom(current) {", "\t\t\tnext := street.OtherEnd(current)", "\t\t\tcandidate := distance[current] + street.Metres", "\t\t\tif old, ok := distance[next]; ok && candidate >= old { continue }", "\t\t\tdistance[next] = candidate; parent[next] = current", "\t\t\topen.Push(next, candidate+straightLine(next, goal))", "\t\t}", "\t}", "\treturn nil }"],
      rs: ["fn route(map: &RoadMap, start: Node, goal: Node) -> Option<Vec<Node>> {", "    let mut open = BinaryHeap::from([Reverse((0.0, start))]); let mut distance = HashMap::from([(start, 0.0)]); let mut parent = HashMap::new();", "    while let Some(Reverse((_, current))) = open.pop() {", "        // popped the lowest distance so far + straight line to the goal", "        let current = current;", "        if current == goal { return Some(rebuild(&parent, goal)); }", "        for street in map.streets_from(current) {", "            let next = street.other_end(current);", "            let candidate = distance[&current] + street.metres;", "            if candidate >= *distance.get(&next).unwrap_or(&f64::INFINITY) { continue; }", "            distance.insert(next, candidate); parent.insert(next, current);", "            open.push(Reverse((candidate + straight_line(next, goal), next)));", "        }", "    }", "    None }"],
    },
    pseudo: {
      en: ["ROUTE(map, start, goal)", "  open ← {start}; distance[start] ← 0", "  while open not empty", "    current ← the open intersection with the lowest distance + straightLine(current, goal)", "    if current = goal: return the route via parent", "    for each street leaving current, to neighbour", "      if distance[current] + street.metres < distance[neighbour]: update it, parent[neighbour] ← current, add neighbour to open"],
      pt: ["ROTA(mapa, início, destino)", "  aberto ← {início}; distância[início] ← 0", "  enquanto aberto não vazio", "    atual ← o cruzamento aberto de menor distância + linhaReta(atual, destino)", "    se atual = destino: retorna a rota pelos pais", "    para cada rua saindo de atual, até vizinho", "      se distância[atual] + rua.metros < distância[vizinho]: atualiza, pai[vizinho] ← atual, adiciona vizinho ao aberto"],
    },
  },

  roadDijkstra: {
    ...SIZE,
    slug: "real-map-dijkstra",
    name: "Dijkstra on the real map",
    short: "Dijkstra",
    subtitle: { en: "Cascavel streets · no heuristic", pt: "ruas de Cascavel · sem heurística" },
    tagline: { en: "Dijkstra · the disc of closest intersections grows until it touches the goal", pt: "Dijkstra · o disco dos cruzamentos mais próximos cresce até tocar o destino" },
    legend: LEGEND,
    kpis: [KPI_EXPANDED, KPI_OPEN, KPI_DISTANCE, KPI_PATH, KPI_STRAIGHT],
    idea: {
      en: [
        "Dijkstra always closes the open intersection with the shortest driven distance from the start, whatever direction it lies in. Each closed intersection has its final distance; its streets are relaxed so that neighbours reached more cheaply get a new distance and a new parent.",
        "With no idea where the goal is, the search fills a disc of the map that grows until the goal falls inside it. On a city grid that means closing several times more intersections than A*, yet the route is identical: both are exact, only the effort differs.",
      ],
      pt: [
        "O Dijkstra sempre fecha o cruzamento aberto de menor distância percorrida desde o início, seja qual for a direção. Cada cruzamento fechado tem sua distância definitiva; suas ruas são relaxadas para que vizinhos alcançados mais barato ganhem nova distância e novo pai.",
        "Sem ideia de onde está o destino, a busca preenche um disco do mapa que cresce até o destino cair dentro dele. Numa malha urbana isso significa fechar várias vezes mais cruzamentos que o A*, mas a rota é idêntica: os dois são exatos, só o esforço difere.",
      ],
    },
    stages: [STAGE_START, ["act", { en: "pop", pt: "retira" }, { en: "the lowest distance so far", pt: "a menor distância até aqui" }], ["primary", { en: "relax", pt: "relaxa" }, { en: "shorter way to a neighbour: new distance, new parent", pt: "caminho mais curto a um vizinho: nova distância, novo pai" }], STAGE_PATH],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(d)", "green", { en: "the goal next door", pt: "o destino ao lado" }],
      [{ en: "average", pt: "médio" }, "O(E log V)", "text", { en: "a disc of radius the route length", pt: "um disco de raio igual à rota" }],
      [{ en: "worst", pt: "pior" }, "O(E log V)", "text", { en: "the whole map before a far goal", pt: "o mapa inteiro antes de um destino longe" }],
      [{ en: "space", pt: "espaço" }, "O(V)", "text", { en: "distances, parents and the open set", pt: "distâncias, pais e o conjunto aberto" }],
    ],
    chartTitle: CHART_EXPANDED_TITLE,
    chart: selfIn(CHART_EXPANDED, "dijkstra"),
    chartNote: CHART_EXPANDED_NOTE,
    when: WHEN_MAP,
    pitfalls: {
      en: ["One source, every destination: if you need the whole distance table, Dijkstra is the right tool and A* is not.", "Negative lengths do not exist on roads, but they do on graphs with credits; then use Bellman–Ford.", "Popping a stale entry must be skipped, or an intersection is expanded twice with a wrong distance."],
      pt: ["Uma origem, todos os destinos: se você precisa da tabela inteira de distâncias, o Dijkstra é a ferramenta certa e o A* não.", "Comprimentos negativos não existem em ruas, mas existem em grafos com créditos; aí use Bellman–Ford.", "Retirar uma entrada velha precisa ser pulado, ou um cruzamento é expandido duas vezes com distância errada."],
    },
    history: HISTORY_MAP,
    file: "route_dijkstra",
    code: {
      ts: ["function route(map: RoadMap, start: Node, goal: Node) {", "  const open = new MinHeap([start]), distance = new Map([[start, 0]]), parent = new Map();", "  while (open.size > 0) {", "    // lowest distance so far", "    const current = open.pop();", "    if (current === goal) return rebuild(parent, goal);", "    for (const street of map.streetsFrom(current)) {", "      const next = street.otherEnd(current);", "      const candidate = distance.get(current)! + street.metres;", "      if (candidate >= (distance.get(next) ?? Infinity)) continue;", "      distance.set(next, candidate); parent.set(next, current);", "      open.push(next, candidate);", "    }", "  }", "}"],
      py: ["def route(road_map, start, goal):", "    open_set = [(0, start)]; distance = {start: 0}; parent = {}", "    while open_set:", "        # lowest distance so far", "        _, current = heapq.heappop(open_set)", "        if current == goal: return rebuild(parent, goal)", "        for street in road_map.streets_from(current):", "            next_node = street.other_end(current)", "            candidate = distance[current] + street.metres", "            if candidate >= distance.get(next_node, math.inf): continue", "            distance[next_node] = candidate; parent[next_node] = current", "            heapq.heappush(open_set, (candidate, next_node))", "", "", ""],
      java: ["List<Node> route(RoadMap map, Node start, Node goal) {", "  PriorityQueue<Entry> open = new PriorityQueue<>(); open.add(new Entry(start, 0)); Map<Node,Double> distance = new HashMap<>(Map.of(start, 0.0)); Map<Node,Node> parent = new HashMap<>();", "  while (!open.isEmpty()) {", "    // lowest distance so far", "    Node current = open.poll().node;", "    if (current.equals(goal)) return rebuild(parent, goal);", "    for (Street street : map.streetsFrom(current)) {", "      Node next = street.otherEnd(current);", "      double candidate = distance.get(current) + street.metres;", "      if (candidate >= distance.getOrDefault(next, Double.MAX_VALUE)) continue;", "      distance.put(next, candidate); parent.put(next, current);", "      open.add(new Entry(next, candidate));", "    }", "  }", "}"],
      cpp: ["std::vector<Node> route(const RoadMap& map, Node start, Node goal) {", "  std::priority_queue<Entry, std::vector<Entry>, ByDistance> open; open.push({start, 0}); std::unordered_map<Node,double> distance{{start, 0}}; std::unordered_map<Node,Node> parent;", "  while (!open.empty()) {", "    // lowest distance so far", "    Node current = open.top().node; open.pop();", "    if (current == goal) return rebuild(parent, goal);", "    for (const Street& street : map.streetsFrom(current)) {", "      Node next = street.otherEnd(current);", "      double candidate = distance[current] + street.metres;", "      if (distance.count(next) && candidate >= distance[next]) continue;", "      distance[next] = candidate; parent[next] = current;", "      open.push({next, candidate});", "    }", "  }", "}"],
      c: ["Path route(const RoadMap *map, int start, int goal) {", "  Heap open = heap_new(); heap_push(&open, start, 0); double distance[MAX_NODES]; fill(distance, INFINITY); distance[start] = 0; int parent[MAX_NODES];", "  while (open.size > 0) {", "    /* lowest distance so far */", "    int current = heap_pop(&open);", "    if (current == goal) return rebuild(parent, goal);", "    for (int k = 0; k < map->degree[current]; k++) { const Street *street = &map->streets[map->adj[current][k]];", "      int next = street->a == current ? street->b : street->a;", "      double candidate = distance[current] + street->metres;", "      if (candidate >= distance[next]) continue;", "      distance[next] = candidate; parent[next] = current;", "      heap_push(&open, next, candidate);", "    }", "  }", "}"],
      go: ["func route(roadMap RoadMap, start, goal Node) []Node {", "\topen := NewMinHeap(); open.Push(start, 0); distance := map[Node]float64{start: 0}; parent := map[Node]Node{}", "\tfor open.Len() > 0 {", "\t\t// lowest distance so far", "\t\tcurrent := open.Pop()", "\t\tif current == goal { return rebuild(parent, goal) }", "\t\tfor _, street := range roadMap.StreetsFrom(current) {", "\t\t\tnext := street.OtherEnd(current)", "\t\t\tcandidate := distance[current] + street.Metres", "\t\t\tif old, ok := distance[next]; ok && candidate >= old { continue }", "\t\t\tdistance[next] = candidate; parent[next] = current", "\t\t\topen.Push(next, candidate)", "\t\t}", "\t}", "\treturn nil }"],
      rs: ["fn route(map: &RoadMap, start: Node, goal: Node) -> Option<Vec<Node>> {", "    let mut open = BinaryHeap::from([Reverse((0.0, start))]); let mut distance = HashMap::from([(start, 0.0)]); let mut parent = HashMap::new();", "    while let Some(Reverse((_, current))) = open.pop() {", "        // popped the lowest distance so far", "        let current = current;", "        if current == goal { return Some(rebuild(&parent, goal)); }", "        for street in map.streets_from(current) {", "            let next = street.other_end(current);", "            let candidate = distance[&current] + street.metres;", "            if candidate >= *distance.get(&next).unwrap_or(&f64::INFINITY) { continue; }", "            distance.insert(next, candidate); parent.insert(next, current);", "            open.push(Reverse((candidate, next)));", "        }", "    }", "    None }"],
    },
    pseudo: {
      en: ["ROUTE(map, start, goal)", "  open ← {start}; distance[start] ← 0", "  while open not empty", "    current ← the open intersection with the lowest distance", "    if current = goal: return the route via parent", "    for each street leaving current, to neighbour", "      if distance[current] + street.metres < distance[neighbour]: update it, parent[neighbour] ← current, add neighbour to open"],
      pt: ["ROTA(mapa, início, destino)", "  aberto ← {início}; distância[início] ← 0", "  enquanto aberto não vazio", "    atual ← o cruzamento aberto de menor distância", "    se atual = destino: retorna a rota pelos pais", "    para cada rua saindo de atual, até vizinho", "      se distância[atual] + rua.metros < distância[vizinho]: atualiza, pai[vizinho] ← atual, adiciona vizinho ao aberto"],
    },
  },

  roadBfs: {
    ...SIZE,
    slug: "real-map-bfs",
    name: "BFS on the real map",
    short: "BFS",
    subtitle: { en: "Cascavel streets · fewest intersections, not metres", pt: "ruas de Cascavel · menos cruzamentos, não metros" },
    tagline: { en: "BFS · counts intersections, so long blocks fool it", pt: "BFS · conta cruzamentos, então quadras longas o enganam" },
    legend: LEGEND,
    kpis: [KPI_EXPANDED, { key: "open", label: { en: "QUEUE", pt: "FILA" }, sub: { en: "intersections waiting", pt: "cruzamentos esperando" } }, { key: "distance", label: { en: "HOPS", pt: "SALTOS" }, sub: { en: "intersections from the start", pt: "cruzamentos desde o início" } }, KPI_PATH, KPI_STRAIGHT],
    idea: {
      en: [
        "Breadth-first search treats every street segment as one hop, whatever its length. It expands the intersections in rings: all the ones one hop away, then two, then three, and stops when the goal is dequeued. The route it returns crosses the fewest intersections.",
        "That is not the shortest route in metres. A few long blocks along an avenue count the same as many short ones downtown, so BFS happily takes the long way round. Compare its route length with Dijkstra's on the same start and goal: the difference is the price of ignoring the weights.",
      ],
      pt: [
        "A busca em largura trata cada trecho de rua como um salto, seja qual for o comprimento. Ela expande os cruzamentos em anéis: todos a um salto, depois a dois, depois a três, e para quando o destino é desenfileirado. A rota devolvida cruza o menor número de cruzamentos.",
        "Isso não é a rota mais curta em metros. Algumas quadras longas numa avenida contam o mesmo que muitas curtas no centro, então o BFS pega a volta longa sem hesitar. Compare o comprimento da rota com o do Dijkstra no mesmo início e destino: a diferença é o preço de ignorar os pesos.",
      ],
    },
    stages: [STAGE_START, ["act", { en: "dequeue", pt: "desenfileira" }, { en: "the oldest open intersection", pt: "o cruzamento aberto mais antigo" }], ["primary", { en: "enqueue", pt: "enfileira" }, { en: "unseen neighbours, one hop further", pt: "vizinhos não vistos, um salto adiante" }], STAGE_PATH],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(d)", "green", { en: "the goal next door", pt: "o destino ao lado" }],
      [{ en: "average", pt: "médio" }, "O(V + E)", "text", { en: "rings of intersections until the goal", pt: "anéis de cruzamentos até o destino" }],
      [{ en: "worst", pt: "pior" }, "O(V + E)", "text", { en: "the whole map", pt: "o mapa inteiro" }],
      [{ en: "space", pt: "espaço" }, "O(V)", "text", { en: "queue and parents", pt: "fila e pais" }],
    ],
    chartTitle: { en: "ROUTE LENGTH · CASCAVEL, 3.2 km STRAIGHT", pt: "COMPRIMENTO DA ROTA · CASCAVEL, 3,2 km EM LINHA RETA" },
    chart: [["bfs", 4550, true], ["dijkstra", 4280], ["a*", 4280]],
    chartNote: { en: "same start and goal (seed 7, route 30) · BFS's route has fewer intersections and 270 m more asphalt", pt: "mesmo início e destino (seed 7, rota 30) · a rota do BFS tem menos cruzamentos e 270 m a mais de asfalto" },
    when: WHEN_MAP,
    pitfalls: {
      en: ["It answers 'fewest turns', not 'shortest': fine for a subway map, wrong for driving.", "Marking an intersection when it is enqueued, not when dequeued, is what keeps the queue small.", "One-way streets make the graph directed; the return trip can be a different route."],
      pt: ["Ele responde 'menos cruzamentos', não 'mais curto': ótimo para um mapa de metrô, errado para dirigir.", "Marcar um cruzamento ao enfileirar, não ao desenfileirar, é o que mantém a fila pequena.", "Mãos únicas tornam o grafo direcionado; a volta pode ser uma rota diferente."],
    },
    history: HISTORY_MAP,
    file: "route_bfs",
    code: {
      ts: ["function route(map: RoadMap, start: Node, goal: Node) {", "  const queue = [start], hops = new Map([[start, 0]]), parent = new Map();", "  while (queue.length > 0) {", "    // the oldest intersection in the queue", "    const current = queue.shift()!;", "    if (current === goal) return rebuild(parent, goal);", "    for (const street of map.streetsFrom(current)) {", "      const next = street.otherEnd(current);", "      const candidate = hops.get(current)! + 1;", "      if (hops.has(next)) continue;", "      hops.set(next, candidate); parent.set(next, current);", "      queue.push(next);", "    }", "  }", "}"],
      py: ["def route(road_map, start, goal):", "    queue = deque([start]); hops = {start: 0}; parent = {}", "    while queue:", "        # the oldest intersection in the queue", "        current = queue.popleft()", "        if current == goal: return rebuild(parent, goal)", "        for street in road_map.streets_from(current):", "            next_node = street.other_end(current)", "            candidate = hops[current] + 1", "            if next_node in hops: continue", "            hops[next_node] = candidate; parent[next_node] = current", "            queue.append(next_node)", "", "", ""],
      java: ["List<Node> route(RoadMap map, Node start, Node goal) {", "  Deque<Node> queue = new ArrayDeque<>(List.of(start)); Map<Node,Integer> hops = new HashMap<>(Map.of(start, 0)); Map<Node,Node> parent = new HashMap<>();", "  while (!queue.isEmpty()) {", "    // the oldest intersection in the queue", "    Node current = queue.poll();", "    if (current.equals(goal)) return rebuild(parent, goal);", "    for (Street street : map.streetsFrom(current)) {", "      Node next = street.otherEnd(current);", "      int candidate = hops.get(current) + 1;", "      if (hops.containsKey(next)) continue;", "      hops.put(next, candidate); parent.put(next, current);", "      queue.add(next);", "    }", "  }", "}"],
      cpp: ["std::vector<Node> route(const RoadMap& map, Node start, Node goal) {", "  std::queue<Node> queue; queue.push(start); std::unordered_map<Node,int> hops{{start, 0}}; std::unordered_map<Node,Node> parent;", "  while (!queue.empty()) {", "    // the oldest intersection in the queue", "    Node current = queue.front(); queue.pop();", "    if (current == goal) return rebuild(parent, goal);", "    for (const Street& street : map.streetsFrom(current)) {", "      Node next = street.otherEnd(current);", "      int candidate = hops[current] + 1;", "      if (hops.count(next)) continue;", "      hops[next] = candidate; parent[next] = current;", "      queue.push(next);", "    }", "  }", "}"],
      c: ["Path route(const RoadMap *map, int start, int goal) {", "  Queue queue = queue_new(); queue_push(&queue, start); int hops[MAX_NODES]; fill(hops, -1); hops[start] = 0; int parent[MAX_NODES];", "  while (queue.size > 0) {", "    /* the oldest intersection in the queue */", "    int current = queue_pop(&queue);", "    if (current == goal) return rebuild(parent, goal);", "    for (int k = 0; k < map->degree[current]; k++) { const Street *street = &map->streets[map->adj[current][k]];", "      int next = street->a == current ? street->b : street->a;", "      int candidate = hops[current] + 1;", "      if (hops[next] >= 0) continue;", "      hops[next] = candidate; parent[next] = current;", "      queue_push(&queue, next);", "    }", "  }", "}"],
      go: ["func route(roadMap RoadMap, start, goal Node) []Node {", "\tqueue := []Node{start}; hops := map[Node]int{start: 0}; parent := map[Node]Node{}", "\tfor len(queue) > 0 {", "\t\t// the oldest intersection in the queue", "\t\tcurrent := queue[0]; queue = queue[1:]", "\t\tif current == goal { return rebuild(parent, goal) }", "\t\tfor _, street := range roadMap.StreetsFrom(current) {", "\t\t\tnext := street.OtherEnd(current)", "\t\t\tcandidate := hops[current] + 1", "\t\t\tif _, seen := hops[next]; seen { continue }", "\t\t\thops[next] = candidate; parent[next] = current", "\t\t\tqueue = append(queue, next)", "\t\t}", "\t}", "\treturn nil }"],
      rs: ["fn route(map: &RoadMap, start: Node, goal: Node) -> Option<Vec<Node>> {", "    let mut queue = VecDeque::from([start]); let mut hops = HashMap::from([(start, 0)]); let mut parent = HashMap::new();", "    while let Some(current) = queue.pop_front() {", "        // took the oldest intersection in the queue", "        let current = current;", "        if current == goal { return Some(rebuild(&parent, goal)); }", "        for street in map.streets_from(current) {", "            let next = street.other_end(current);", "            let candidate = hops[&current] + 1;", "            if hops.contains_key(&next) { continue; }", "            hops.insert(next, candidate); parent.insert(next, current);", "            queue.push_back(next);", "        }", "    }", "    None }"],
    },
    pseudo: {
      en: ["ROUTE(map, start, goal)", "  queue ← [start]; hops[start] ← 0", "  while queue not empty", "    current ← dequeue the oldest", "    if current = goal: return the route via parent", "    for each street leaving current, to an unseen neighbour", "      hops[neighbour] ← hops[current] + 1; parent[neighbour] ← current; enqueue neighbour"],
      pt: ["ROTA(mapa, início, destino)", "  fila ← [início]; saltos[início] ← 0", "  enquanto fila não vazia", "    atual ← desenfileira o mais antigo", "    se atual = destino: retorna a rota pelos pais", "    para cada rua saindo de atual, até um vizinho não visto", "      saltos[vizinho] ← saltos[atual] + 1; pai[vizinho] ← atual; enfileira vizinho"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
