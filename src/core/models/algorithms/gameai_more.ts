// Models
import type { Localized } from "../translations";
import type { VizKey } from "../viz";
import type { AlgorithmSpec, KpiSpec } from "./spec";

const SIZE = { sizeLabel: { en: "Depth", pt: "Profundidade" }, minN: 2, maxN: 4, stepN: 1, defaultN: 3, shuffleLabel: { en: "New tree", pt: "Nova árvore" }, stepMs: 320, family: "gameai", kind: "gametree" } as const;

const LEGEND: [VizKey, Localized][] = [["act", { en: "current", pt: "atual" }], ["green", { en: "evaluated", pt: "avaliado" }], ["violet", { en: "best line", pt: "melhor linha" }], ["def", { en: "unvisited", pt: "não visitado" }]];

const KPI_VISITED: KpiSpec = { key: "visited", unitKey: "visitedUnit", label: { en: "VISITED", pt: "VISITADOS" }, sub: { en: "nodes entered", pt: "nós visitados" } };
const KPI_LEAVES: KpiSpec = { key: "leaves", unitKey: "leavesUnit", label: { en: "LEAVES", pt: "FOLHAS" }, sub: { en: "positions scored", pt: "posições pontuadas" } };

export const GAMEAI_MORE = {
  iterativeDeepening: {
    ...SIZE,
    slug: "iterative-deepening",
    name: "Iterative deepening",
    subtitle: { en: "depth 1, then 2, then 3, until time runs out", pt: "profundidade 1, depois 2, depois 3, até o tempo acabar" },
    tagline: { en: "iterative deepening · always have an answer ready, then improve it", pt: "aprofundamento iterativo · sempre ter uma resposta pronta, depois melhorá-la" },
    legend: LEGEND,
    kpis: [{ key: "limit", unitKey: "limitUnit", label: { en: "DEPTH LIMIT", pt: "LIMITE" }, sub: { en: "plies of the current iteration", pt: "lances da iteração atual" } }, { key: "visitedNow", label: { en: "THIS PASS", pt: "ESTA PASSADA" }, sub: { en: "nodes visited in the iteration", pt: "nós visitados na iteração" } }, { key: "total", label: { en: "TOTAL", pt: "TOTAL" }, sub: { en: "nodes over all iterations", pt: "nós em todas as iterações" } }, { key: "rootValue", label: { en: "ROOT VALUE", pt: "VALOR DA RAIZ" }, sub: { en: "at the current depth", pt: "na profundidade atual" } }, { key: "bestMove", label: { en: "BEST MOVE", pt: "MELHOR JOGADA" }, sub: { en: "child chosen so far", pt: "filho escolhido até aqui" } }],
    idea: {
      en: [
        "A game engine never knows how deep it can afford to search before the clock runs out. Iterative deepening searches to depth 1, then again to depth 2, then 3, keeping the best move of the last completed iteration. Whenever time is up, an answer from a full search at some depth is ready.",
        "It looks wasteful, but the tree grows geometrically with depth, so all the shallow passes together cost less than the last one alone. And the shallow passes are not wasted: their best moves are used to order the children of the next pass, which is what makes alpha-beta prune well. Every serious chess engine works this way.",
      ],
      pt: [
        "Um motor de jogo nunca sabe quão fundo pode buscar antes de o relógio acabar. O aprofundamento iterativo busca até a profundidade 1, depois de novo até 2, depois 3, guardando a melhor jogada da última iteração completa. Quando o tempo acaba, uma resposta de uma busca completa em alguma profundidade está pronta.",
        "Parece desperdício, mas a árvore cresce geometricamente com a profundidade, então todas as passadas rasas juntas custam menos que a última sozinha. E as passadas rasas não são jogadas fora: suas melhores jogadas ordenam os filhos da passada seguinte, e é isso que faz o alfa-beta podar bem. Todo motor de xadrez sério funciona assim.",
      ],
    },
    stages: [
      ["primary", { en: "limit", pt: "limita" }, { en: "search only L plies deep", pt: "busca só L lances de profundidade" }],
      ["act", { en: "cut off", pt: "corta" }, { en: "at the limit, estimate with the static evaluation", pt: "no limite, estima com a avaliação estática" }],
      ["violet", { en: "keep", pt: "guarda" }, { en: "the best move of the completed pass", pt: "a melhor jogada da passada completa" }],
      ["green", { en: "deepen", pt: "aprofunda" }, { en: "L + 1, while there is time", pt: "L + 1, enquanto houver tempo" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(bᵈ)", "text", { en: "the last iteration dominates", pt: "a última iteração domina" }],
      [{ en: "average", pt: "médio" }, "O(bᵈ)", "text", { en: "shallow passes add a factor of b / (b − 1)", pt: "as passadas rasas somam um fator b / (b − 1)" }],
      [{ en: "worst", pt: "pior" }, "O(bᵈ)", "text", { en: "the same as one full-depth search", pt: "o mesmo que uma busca de profundidade total" }],
      [{ en: "space", pt: "espaço" }, "O(d)", "green", { en: "depth-first at every iteration", pt: "em profundidade em toda iteração" }],
    ],
    chartTitle: { en: "NODES VISITED · b = 3, d = 4", pt: "NÓS VISITADOS · b = 3, d = 4" },
    chart: [["minimax d = 4", 121], ["iterative deepening to 4", 160, true], ["alpha-beta d = 4", 61], ["alpha-beta, ordered by id", 33]],
    chartNote: { en: "the shallow passes cost a third extra and pay it back through move ordering", pt: "as passadas rasas custam um terço a mais e devolvem isso na ordenação de jogadas" },
    when: {
      en: ["Any search under a time limit: chess, go, planning, where 'best move so far' must always be available.", "Memory-limited search: iterative deepening depth-first search finds shortest solutions with BFS's optimality and DFS's memory."],
      pt: ["Qualquer busca com limite de tempo: xadrez, go, planejamento, onde 'a melhor jogada até aqui' precisa estar sempre disponível.", "Busca com memória limitada: o IDDFS acha soluções mais curtas com a otimalidade do BFS e a memória do DFS."],
    },
    pitfalls: {
      en: ["Without move ordering the repeated passes are pure overhead; the payoff comes from feeding each pass's results into the next.", "A static evaluation at a violent position (mid-capture) lies; engines extend the search there (quiescence).", "Interrupting mid-iteration must return the previous iteration's move, never a half-searched one."],
      pt: ["Sem ordenação de jogadas as passadas repetidas são só custo; o retorno vem de alimentar cada passada com os resultados da anterior.", "Uma avaliação estática numa posição violenta (no meio de uma captura) mente; motores estendem a busca ali (quiescência).", "Interromper no meio de uma iteração precisa devolver a jogada da iteração anterior, nunca uma meio buscada."],
    },
    history: {
      en: "David Slate and Larry Atkin used iterative deepening in Chess 4.5 in 1975 to manage clock time, and Richard Korf analysed the general technique in 1985, showing the overhead is a constant factor. Every engine since, from Deep Blue to Stockfish, deepens iteratively.",
      pt: "David Slate e Larry Atkin usaram o aprofundamento iterativo no Chess 4.5 em 1975 para administrar o relógio, e Richard Korf analisou a técnica geral em 1985, mostrando que o custo extra é um fator constante. Todo motor desde então, do Deep Blue ao Stockfish, aprofunda iterativamente.",
    },
    file: "iterative_deepening",
    code: {
      ts: ["function iterativeDeepening(root: Node, maxDepth: number, deadline: number) {", "  let bestMove = root.children[0];", "  for (let limit = 1; limit <= maxDepth && Date.now() < deadline; limit++) {", "    bestMove = depthLimitedMinimax(root, limit).move!;", "  }", "  return bestMove;", "}", "function depthLimitedMinimax(node: Node, limit: number, maximizing = true): { value: number; move?: Node } {", "  if (node.isLeaf) return { value: node.value };", "  if (limit === 0) return { value: heuristic(node) };", "  const scored = node.children.map((child) => ({ child, value: depthLimitedMinimax(child, limit - 1, !maximizing).value }));", "  const best = scored.reduce((a, b) => (maximizing ? (b.value > a.value ? b : a) : (b.value < a.value ? b : a)));", "  return { value: best.value, move: best.child };", "}"],
      py: ["def iterative_deepening(root, max_depth, deadline):", "    best_move = root.children[0]", "    for limit in range(1, max_depth + 1):", "        if time.time() >= deadline: break", "        best_move = depth_limited_minimax(root, limit)[1]", "    return best_move", "", "def depth_limited_minimax(node, limit, maximizing=True):", "    if node.is_leaf: return node.value, None", "    if limit == 0: return heuristic(node), None", "    scored = [(depth_limited_minimax(child, limit - 1, not maximizing)[0], child) for child in node.children]", "    best = max(scored, key=lambda pair: pair[0]) if maximizing else min(scored, key=lambda pair: pair[0])", "    return best[0], best[1]", ""],
      java: ["static Node iterativeDeepening(Node root, int maxDepth, long deadline) {", "  Node bestMove = root.children.get(0);", "  for (int limit = 1; limit <= maxDepth && System.currentTimeMillis() < deadline; limit++) {", "    bestMove = depthLimitedMinimax(root, limit, true).move;", "  }", "  return bestMove;", "}", "static Result depthLimitedMinimax(Node node, int limit, boolean maximizing) {", "  if (node.isLeaf()) return new Result(node.value, null);", "  if (limit == 0) return new Result(heuristic(node), null);", "  Result best = null; for (Node child : node.children) { int value = depthLimitedMinimax(child, limit - 1, !maximizing).value;", "    if (best == null || (maximizing ? value > best.value : value < best.value)) best = new Result(value, child); }", "  return best;", "}"],
      cpp: ["Node* iterativeDeepening(Node* root, int maxDepth, Clock::time_point deadline) {", "  Node* bestMove = root->children[0];", "  for (int limit = 1; limit <= maxDepth && Clock::now() < deadline; limit++) {", "    bestMove = depthLimitedMinimax(root, limit, true).move;", "  }", "  return bestMove;", "}", "Result depthLimitedMinimax(Node* node, int limit, bool maximizing) {", "  if (node->isLeaf()) return {node->value, nullptr};", "  if (limit == 0) return {heuristic(node), nullptr};", "  Result best{maximizing ? INT_MIN : INT_MAX, nullptr}; for (Node* child : node->children) { int value = depthLimitedMinimax(child, limit - 1, !maximizing).value;", "    if (maximizing ? value > best.value : value < best.value) best = {value, child}; }", "  return best;", "}"],
      c: ["Node *iterative_deepening(Node *root, int max_depth, long deadline) {", "  Node *best_move = root->children[0];", "  for (int limit = 1; limit <= max_depth && now_ms() < deadline; limit++) {", "    best_move = depth_limited_minimax(root, limit, true).move;", "  }", "  return best_move;", "}", "Result depth_limited_minimax(Node *node, int limit, bool maximizing) {", "  if (node->child_count == 0) return (Result){node->value, NULL};", "  if (limit == 0) return (Result){heuristic(node), NULL};", "  Result best = {maximizing ? INT_MIN : INT_MAX, NULL}; for (int i = 0; i < node->child_count; i++) { int value = depth_limited_minimax(&node->children[i], limit - 1, !maximizing).value;", "    if (maximizing ? value > best.value : value < best.value) best = (Result){value, &node->children[i]}; }", "  return best;", "}"],
      go: ["func iterativeDeepening(root *Node, maxDepth int, deadline time.Time) *Node {", "\tbestMove := root.Children[0]", "\tfor limit := 1; limit <= maxDepth && time.Now().Before(deadline); limit++ {", "\t\t_, bestMove = depthLimitedMinimax(root, limit, true)", "\t}", "\treturn bestMove", "}", "func depthLimitedMinimax(node *Node, limit int, maximizing bool) (int, *Node) {", "\tif len(node.Children) == 0 { return node.Value, nil }", "\tif limit == 0 { return heuristic(node), nil }", "\tbestValue, bestMove := 0, (*Node)(nil); for i, child := range node.Children { value, _ := depthLimitedMinimax(child, limit-1, !maximizing)", "\t\tif i == 0 || (maximizing && value > bestValue) || (!maximizing && value < bestValue) { bestValue, bestMove = value, child } }", "\treturn bestValue, bestMove", "}"],
      rs: ["fn iterative_deepening(root: &Node, max_depth: u32, deadline: Instant) -> &Node {", "    let mut best_move = &root.children[0];", "    for limit in 1..=max_depth { if Instant::now() >= deadline { break; }", "        best_move = depth_limited_minimax(root, limit, true).1.unwrap();", "    }", "    best_move", "}", "fn depth_limited_minimax(node: &Node, limit: u32, maximizing: bool) -> (i32, Option<&Node>) {", "    if node.children.is_empty() { return (node.value, None); }", "    if limit == 0 { return (heuristic(node), None); }", "    let scored = node.children.iter().map(|child| (depth_limited_minimax(child, limit - 1, !maximizing).0, child));", "    let best = if maximizing { scored.max_by_key(|pair| pair.0) } else { scored.min_by_key(|pair| pair.0) }.unwrap();", "    (best.0, Some(best.1))", "}"],
    },
    pseudo: {
      en: ["ITERATIVEDEEPENING(root, maxDepth, deadline)", "  for limit ← 1, 2, …, maxDepth while time remains", "    bestMove ← DEPTHLIMITEDMINIMAX(root, limit)", "  return bestMove", "DEPTHLIMITEDMINIMAX(node, limit): a leaf returns its score; at limit 0 return the static evaluation; else minimax over the children with limit − 1"],
      pt: ["APROFUNDAMENTOITERATIVO(raiz, profundidadeMáx, prazo)", "  para limite ← 1, 2, …, profundidadeMáx enquanto houver tempo", "    melhorJogada ← MINIMAXLIMITADO(raiz, limite)", "  retorna melhorJogada", "MINIMAXLIMITADO(nó, limite): uma folha devolve sua pontuação; no limite 0 devolve a avaliação estática; senão minimax sobre os filhos com limite − 1"],
    },
  },

  expectimax: {
    ...SIZE,
    slug: "expectimax",
    name: "Expectimax",
    subtitle: { en: "minimax with chance nodes", pt: "minimax com nós de chance" },
    tagline: { en: "expectimax · when the opponent is a die, average instead of fearing the worst", pt: "expectimax · quando o oponente é um dado, faz a média em vez de temer o pior" },
    legend: [["act", { en: "current", pt: "atual" }], ["green", { en: "evaluated", pt: "avaliado" }], ["violet", { en: "best expectation", pt: "melhor expectativa" }], ["def", { en: "unvisited", pt: "não visitado" }]],
    kpis: [KPI_VISITED, KPI_LEAVES, { key: "value", label: { en: "VALUE", pt: "VALOR" }, sub: { en: "at the current node", pt: "no nó atual" } }, { key: "chance", label: { en: "CHANCE NODES", pt: "NÓS DE CHANCE" }, sub: { en: "averaged so far", pt: "com média feita até aqui" } }, { key: "probability", label: { en: "PROBABILITY", pt: "PROBABILIDADE" }, sub: { en: "of each outcome", pt: "de cada resultado" } }],
    idea: {
      en: [
        "Minimax assumes the opponent always picks the move that hurts you most. When the 'opponent' is a die roll, a shuffled deck or a player known to move at random, that is too pessimistic: the right value of a chance node is the expected value, each outcome's value weighted by its probability.",
        "Expectimax keeps MAX nodes as they are and replaces MIN nodes by chance nodes that average. The best line can differ from minimax's: a move with a great average but one bad outcome is chosen by expectimax and refused by minimax. The price is that alpha-beta pruning no longer applies in full, since an average can always be pulled up by an unseen child.",
      ],
      pt: [
        "O minimax supõe que o oponente sempre escolhe a jogada que mais te prejudica. Quando o 'oponente' é um dado, um baralho embaralhado ou um jogador que sabidamente joga ao acaso, isso é pessimista demais: o valor certo de um nó de chance é o valor esperado, o valor de cada resultado ponderado pela probabilidade.",
        "O expectimax mantém os nós MAX como estão e troca os nós MIN por nós de chance que fazem a média. A melhor linha pode diferir da do minimax: uma jogada com ótima média mas um resultado ruim é escolhida pelo expectimax e recusada pelo minimax. O preço é que a poda alfa-beta deixa de valer por completo, já que uma média sempre pode ser puxada para cima por um filho não visto.",
      ],
    },
    stages: [
      ["primary", { en: "descend", pt: "desce" }, { en: "visit the first child until a leaf", pt: "visita o primeiro filho até uma folha" }],
      ["green", { en: "score", pt: "pontua" }, { en: "leaf returns its outcome", pt: "a folha devolve seu resultado" }],
      ["act", { en: "average", pt: "média" }, { en: "a chance node sums value × probability", pt: "um nó de chance soma valor × probabilidade" }],
      ["violet", { en: "maximise", pt: "maximiza" }, { en: "MAX keeps the highest expectation", pt: "MAX guarda a maior expectativa" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(bᵈ)", "neg", { en: "every leaf is needed for an exact average", pt: "toda folha é necessária para uma média exata" }],
      [{ en: "average", pt: "médio" }, "O(bᵈ)", "neg", { en: "the same", pt: "o mesmo" }],
      [{ en: "worst", pt: "pior" }, "O(bᵈ)", "neg", { en: "*-minimax prunes only with bounded values", pt: "*-minimax poda só com valores limitados" }],
      [{ en: "space", pt: "espaço" }, "O(d)", "green", { en: "depth-first", pt: "em profundidade" }],
    ],
    chartTitle: { en: "LEAVES SCORED · b = 3, d = 4", pt: "FOLHAS PONTUADAS · b = 3, d = 4" },
    chart: [["minimax", 81], ["expectimax", 81, true], ["alpha-beta", 44], ["*-minimax (bounded)", 60]],
    chartNote: { en: "same tree · expectimax cannot prune unless leaf values are bounded", pt: "mesma árvore · o expectimax não poda a menos que os valores das folhas sejam limitados" },
    when: {
      en: ["Games of chance: backgammon, 2048, card games, dice; and any planning problem with a stochastic environment.", "Modelling an imperfect opponent: a random or weighted policy instead of a perfect adversary."],
      pt: ["Jogos de sorte: gamão, 2048, jogos de cartas, dados; e qualquer problema de planejamento com ambiente estocástico.", "Modelar um oponente imperfeito: uma política aleatória ou ponderada em vez de um adversário perfeito."],
    },
    pitfalls: {
      en: ["The evaluation scale matters: averaging makes the magnitude of scores meaningful, where minimax only needed their order.", "Branching explodes: a chance node adds a factor per outcome, so depth is limited; sample outcomes when there are many.", "A rare catastrophic outcome is averaged away; if it must be avoided, minimax over the dangerous branch."],
      pt: ["A escala da avaliação importa: fazer média torna a magnitude das pontuações significativa, onde o minimax só precisava da ordem.", "A ramificação explode: um nó de chance soma um fator por resultado, então a profundidade é limitada; amostre os resultados quando forem muitos.", "Um resultado catastrófico raro some na média; se precisa ser evitado, use minimax no ramo perigoso."],
    },
    history: {
      en: "Donald Michie described expectimax in 1966 while studying game learning; Bruce Ballard's *-minimax of 1983 brought partial pruning back by bounding the evaluation. Gerald Tesauro's TD-Gammon paired a two-ply expectimax with a learned evaluation to reach world-class backgammon in 1992.",
      pt: "Donald Michie descreveu o expectimax em 1966 ao estudar aprendizado em jogos; o *-minimax de Bruce Ballard, de 1983, trouxe de volta uma poda parcial limitando a avaliação. O TD-Gammon de Gerald Tesauro juntou um expectimax de dois lances com uma avaliação aprendida para chegar ao nível mundial no gamão em 1992.",
    },
    file: "expectimax",
    code: {
      ts: ["function expectimax(node: Node, depth: number, chance: boolean): number {", "  if (depth === 0 || node.isLeaf) return node.value;", "  if (chance) {", "    let expected = 0;", "    for (const child of node.children) expected += child.probability * expectimax(child, depth - 1, false);", "    return expected;", "  }", "  let best = -Infinity;", "  for (const child of node.children) best = Math.max(best, expectimax(child, depth - 1, true));", "  return best;", "}"],
      py: ["def expectimax(node, depth, chance):", "    if depth == 0 or node.is_leaf: return node.value", "    if chance:", "        expected = 0", "        for child in node.children: expected += child.probability * expectimax(child, depth - 1, False)", "        return expected", "", "    best = -math.inf", "    for child in node.children: best = max(best, expectimax(child, depth - 1, True))", "    return best", ""],
      java: ["static double expectimax(Node node, int depth, boolean chance) {", "  if (depth == 0 || node.isLeaf()) return node.value;", "  if (chance) {", "    double expected = 0;", "    for (Node child : node.children) expected += child.probability * expectimax(child, depth - 1, false);", "    return expected;", "  }", "  double best = Double.NEGATIVE_INFINITY;", "  for (Node child : node.children) best = Math.max(best, expectimax(child, depth - 1, true));", "  return best;", "}"],
      cpp: ["double expectimax(const Node& node, int depth, bool chance) {", "  if (depth == 0 || node.isLeaf()) return node.value;", "  if (chance) {", "    double expected = 0;", "    for (const Node& child : node.children) expected += child.probability * expectimax(child, depth - 1, false);", "    return expected;", "  }", "  double best = -INFINITY;", "  for (const Node& child : node.children) best = std::max(best, expectimax(child, depth - 1, true));", "  return best;", "}"],
      c: ["double expectimax(const Node *node, int depth, bool chance) {", "  if (depth == 0 || node->child_count == 0) return node->value;", "  if (chance) {", "    double expected = 0;", "    for (int i = 0; i < node->child_count; i++) expected += node->children[i].probability * expectimax(&node->children[i], depth - 1, false);", "    return expected;", "  }", "  double best = -INFINITY;", "  for (int i = 0; i < node->child_count; i++) best = fmax(best, expectimax(&node->children[i], depth - 1, true));", "  return best;", "}"],
      go: ["func expectimax(node *Node, depth int, chance bool) float64 {", "\tif depth == 0 || len(node.Children) == 0 { return node.Value }", "\tif chance {", "\t\texpected := 0.0", "\t\tfor _, child := range node.Children { expected += child.Probability * expectimax(child, depth-1, false) }", "\t\treturn expected", "\t}", "\tbest := math.Inf(-1)", "\tfor _, child := range node.Children { best = math.Max(best, expectimax(child, depth-1, true)) }", "\treturn best", "}"],
      rs: ["fn expectimax(node: &Node, depth: u32, chance: bool) -> f64 {", "    if depth == 0 || node.children.is_empty() { return node.value; }", "    if chance {", "        let mut expected = 0.0;", "        for child in &node.children { expected += child.probability * expectimax(child, depth - 1, false); }", "        return expected;", "    }", "    let mut best = f64::NEG_INFINITY;", "    for child in &node.children { best = best.max(expectimax(child, depth - 1, true)); }", "    best", "}"],
    },
    pseudo: {
      en: ["EXPECTIMAX(node, depth, chance)", "  if depth = 0 or node is a leaf: return value(node)", "  if chance: return Σ probability(child) × EXPECTIMAX(child, depth − 1, false)", "  else: return max over children of EXPECTIMAX(child, depth − 1, true)"],
      pt: ["EXPECTIMAX(nó, profundidade, chance)", "  se profundidade = 0 ou nó é folha: retorna valor(nó)", "  se chance: retorna Σ probabilidade(filho) × EXPECTIMAX(filho, profundidade − 1, falso)", "  senão: retorna o máximo sobre os filhos de EXPECTIMAX(filho, profundidade − 1, verdadeiro)"],
    },
  },

  mcts: {
    ...SIZE,
    sizeLabel: { en: "Iterations", pt: "Iterações" },
    minN: 4,
    maxN: 24,
    stepN: 4,
    defaultN: 12,
    stepMs: 420,
    slug: "monte-carlo-tree-search",
    name: "Monte Carlo tree search",
    subtitle: { en: "select, expand, simulate, back up", pt: "seleciona, expande, simula, retropropaga" },
    tagline: { en: "MCTS · random playouts decide where the tree grows", pt: "MCTS · simulações aleatórias decidem onde a árvore cresce" },
    legend: [["violet", { en: "selected path", pt: "caminho selecionado" }], ["act", { en: "current", pt: "atual" }], ["green", { en: "rollout ended here", pt: "a simulação acabou aqui" }], ["def", { en: "never expanded", pt: "nunca expandido" }]],
    kpis: [{ key: "iteration", unitKey: "iterationUnit", label: { en: "ITERATION", pt: "ITERAÇÃO" }, sub: { en: "one playout each", pt: "uma simulação cada" } }, { key: "phase", label: { en: "PHASE", pt: "FASE" }, sub: { en: "of the four", pt: "das quatro" } }, { key: "reward", label: { en: "REWARD", pt: "RECOMPENSA" }, sub: { en: "of the last playout, 0–1", pt: "da última simulação, 0–1" } }, { key: "rootVisits", label: { en: "ROOT VISITS", pt: "VISITAS À RAIZ" }, sub: { en: "playouts so far", pt: "simulações até aqui" } }, { key: "bestMove", label: { en: "BEST MOVE", pt: "MELHOR JOGADA" }, sub: { en: "the most visited child", pt: "o filho mais visitado" } }],
    idea: {
      en: [
        "Monte Carlo tree search never looks at the whole tree and never needs an evaluation function. Each iteration selects a path from the root by a bandit rule, UCB1, that balances the children's average reward against how rarely they were tried; expands one new node at the end of the path; plays random moves from there to the end of the game; and backs the result up along the path, updating visit counts and mean rewards.",
        "Promising moves are visited more and so searched deeper, bad ones are abandoned after a few playouts, and the estimates sharpen with every iteration. The move to play is the most visited child of the root. With a learned policy to guide selection and a value network instead of random playouts, this is the search inside AlphaGo.",
      ],
      pt: [
        "A busca em árvore de Monte Carlo nunca olha a árvore inteira e nunca precisa de função de avaliação. Cada iteração seleciona um caminho da raiz por uma regra de bandido, o UCB1, que equilibra a recompensa média dos filhos contra o quão raramente foram tentados; expande um nó novo no fim do caminho; joga lances aleatórios dali até o fim do jogo; e retropropaga o resultado pelo caminho, atualizando contagens de visita e recompensas médias.",
        "Jogadas promissoras são visitadas mais e por isso buscadas mais fundo, as ruins são abandonadas depois de poucas simulações, e as estimativas afiam a cada iteração. A jogada a fazer é o filho mais visitado da raiz. Com uma política aprendida guiando a seleção e uma rede de valor no lugar das simulações aleatórias, esta é a busca dentro do AlphaGo.",
      ],
    },
    stages: [
      ["violet", { en: "select", pt: "seleciona" }, { en: "down the tree by UCB1", pt: "árvore abaixo pelo UCB1" }],
      ["primary", { en: "expand", pt: "expande" }, { en: "add one untried child", pt: "adiciona um filho não tentado" }],
      ["green", { en: "simulate", pt: "simula" }, { en: "random moves to the end of the game", pt: "lances aleatórios até o fim do jogo" }],
      ["act", { en: "back up", pt: "retropropaga" }, { en: "visits + 1, reward added, all the way to the root", pt: "visitas + 1, recompensa somada, até a raiz" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(k · d)", "green", { en: "k playouts of d moves each", pt: "k simulações de d lances cada" }],
      [{ en: "average", pt: "médio" }, "O(k · d)", "green", { en: "anytime: stop whenever, answer ready", pt: "a qualquer momento: pare quando quiser, resposta pronta" }],
      [{ en: "worst", pt: "pior" }, "O(k · d)", "green", { en: "converges to minimax as k → ∞", pt: "converge para o minimax quando k → ∞" }],
      [{ en: "space", pt: "espaço" }, "O(k)", "text", { en: "one node per expansion", pt: "um nó por expansão" }],
    ],
    chartTitle: { en: "NODES EVALUATED · b = 3, d = 3, 12 PLAYOUTS", pt: "NÓS AVALIADOS · b = 3, d = 3, 12 SIMULAÇÕES" },
    chart: [["mcts, 12 playouts", 12, true], ["minimax", 27], ["alpha-beta", 15], ["mcts, 100 playouts", 27]],
    chartNote: { en: "leaves reached · MCTS trades exactness for an answer at any budget", pt: "folhas alcançadas · o MCTS troca exatidão por uma resposta em qualquer orçamento" },
    when: {
      en: ["Games too wide or too hard to evaluate for minimax: go, Hex, general game playing, real-time strategy.", "Planning under uncertainty with a simulator but no model: robotics, scheduling, and combined with neural networks, AlphaZero-style engines."],
      pt: ["Jogos largos demais ou difíceis demais de avaliar para o minimax: go, Hex, jogos gerais, estratégia em tempo real.", "Planejamento sob incerteza com um simulador mas sem modelo: robótica, escalonamento, e combinado com redes neurais, motores no estilo AlphaZero."],
    },
    pitfalls: {
      en: ["The exploration constant matters: too low and the search tunnels, too high and it never commits.", "Random playouts are weak in tactical games; a trap one move away can be missed for hundreds of iterations.", "Pick the most visited child, not the highest mean: a high mean with few visits is noise."],
      pt: ["A constante de exploração importa: baixa demais e a busca faz túnel, alta demais e nunca se compromete.", "Simulações aleatórias são fracas em jogos táticos; uma armadilha a um lance pode passar despercebida por centenas de iterações.", "Escolha o filho mais visitado, não a maior média: uma média alta com poucas visitas é ruído."],
    },
    history: {
      en: "Rémi Coulom named Monte Carlo tree search in 2006 for his go program Crazy Stone, and Levente Kocsis and Csaba Szepesvári gave the UCT selection rule the same year. It lifted computer go from amateur to strong-amateur level within a decade, and with deep networks became AlphaGo in 2016.",
      pt: "Rémi Coulom batizou a busca em árvore de Monte Carlo em 2006 para seu programa de go Crazy Stone, e Levente Kocsis e Csaba Szepesvári deram a regra de seleção UCT no mesmo ano. Ela levou o go por computador do nível amador ao amador forte em uma década, e com redes profundas virou o AlphaGo em 2016.",
    },
    file: "mcts",
    code: {
      ts: ["function mcts(root: Node, iterations: number) {", "  for (let i = 0; i < iterations; i++) {", "    let node = root;", "    while (node.isExpanded && !node.isLeaf) node = selectChild(node); // UCB1: mean + c · sqrt(ln(parentVisits) / visits)", "    if (!node.isLeaf) {", "      node = node.expandOneChild();", "    }", "    const reward = rollout(node); // random moves to the end of the game", "    for (let current: Node | null = node; current; current = current.parent) {", "      current.visits++; current.total += reward;", "    }", "  }", "  return root.children.reduce((a, b) => (b.visits > a.visits ? b : a)); // the most visited move", "}"],
      py: ["def mcts(root, iterations):", "    for _ in range(iterations):", "        node = root", "        while node.is_expanded and not node.is_leaf: node = select_child(node)  # UCB1: mean + c * sqrt(ln(parent_visits) / visits)", "        if not node.is_leaf:", "            node = node.expand_one_child()", "", "        reward = rollout(node)  # random moves to the end of the game", "        current = node", "        while current: current.visits += 1; current.total += reward; current = current.parent", "", "", "    return max(root.children, key=lambda child: child.visits)  # the most visited move", ""],
      java: ["static Node mcts(Node root, int iterations) {", "  for (int i = 0; i < iterations; i++) {", "    Node node = root;", "    while (node.isExpanded() && !node.isLeaf()) node = selectChild(node); // UCB1: mean + c * sqrt(ln(parentVisits) / visits)", "    if (!node.isLeaf()) {", "      node = node.expandOneChild();", "    }", "    double reward = rollout(node); // random moves to the end of the game", "    for (Node current = node; current != null; current = current.parent) {", "      current.visits++; current.total += reward;", "    }", "  }", "  return Collections.max(root.children, Comparator.comparingInt(child -> child.visits)); // the most visited move", "}"],
      cpp: ["Node* mcts(Node* root, int iterations) {", "  for (int i = 0; i < iterations; i++) {", "    Node* node = root;", "    while (node->isExpanded() && !node->isLeaf()) node = selectChild(node); // UCB1: mean + c * sqrt(log(parentVisits) / visits)", "    if (!node->isLeaf()) {", "      node = node->expandOneChild();", "    }", "    double reward = rollout(node); // random moves to the end of the game", "    for (Node* current = node; current; current = current->parent) {", "      current->visits++; current->total += reward;", "    }", "  }", "  return *std::max_element(root->children.begin(), root->children.end(), [](Node* a, Node* b) { return a->visits < b->visits; }); // the most visited move", "}"],
      c: ["Node *mcts(Node *root, int iterations) {", "  for (int i = 0; i < iterations; i++) {", "    Node *node = root;", "    while (is_expanded(node) && node->child_count > 0) node = select_child(node); /* UCB1: mean + c * sqrt(log(parent_visits) / visits) */", "    if (node->child_count > 0) {", "      node = expand_one_child(node);", "    }", "    double reward = rollout(node); /* random moves to the end of the game */", "    for (Node *current = node; current; current = current->parent) {", "      current->visits++; current->total += reward;", "    }", "  }", "  return most_visited_child(root); /* the most visited move */", "}"],
      go: ["func mcts(root *Node, iterations int) *Node {", "\tfor i := 0; i < iterations; i++ {", "\t\tnode := root", "\t\tfor node.IsExpanded() && !node.IsLeaf() { node = selectChild(node) } // UCB1: mean + c * sqrt(ln(parentVisits) / visits)", "\t\tif !node.IsLeaf() {", "\t\t\tnode = node.ExpandOneChild()", "\t\t}", "\t\treward := rollout(node) // random moves to the end of the game", "\t\tfor current := node; current != nil; current = current.Parent {", "\t\t\tcurrent.Visits++; current.Total += reward", "\t\t}", "\t}", "\treturn mostVisitedChild(root) // the most visited move", "}"],
      rs: ["fn mcts(tree: &mut Tree, root: NodeId, iterations: usize) -> NodeId {", "    for _ in 0..iterations {", "        let mut node = root;", "        while tree.is_expanded(node) && !tree.is_leaf(node) { node = tree.select_child(node); } // UCB1: mean + c * sqrt(ln(parent_visits) / visits)", "        if !tree.is_leaf(node) {", "            node = tree.expand_one_child(node);", "        }", "        let reward = tree.rollout(node); // random moves to the end of the game", "        let mut current = Some(node); while let Some(id) = current {", "            tree.visits[id] += 1; tree.total[id] += reward; current = tree.parent[id];", "        }", "    }", "    tree.most_visited_child(root) // the most visited move", "}"],
    },
    pseudo: {
      en: ["MCTS(root, iterations)", "  repeat iterations times", "    select: from the root, follow the child with the best UCB1 until a node with an untried child or a leaf", "    expand: add one untried child of that node", "    simulate: play random moves from it to the end; reward ← the result", "    back up: for every node on the path, visits += 1, total += reward", "  return the most visited child of the root"],
      pt: ["MCTS(raiz, iterações)", "  repete iterações vezes", "    seleciona: da raiz, segue o filho de melhor UCB1 até um nó com filho não tentado ou uma folha", "    expande: adiciona um filho não tentado desse nó", "    simula: joga lances aleatórios dele até o fim; recompensa ← o resultado", "    retropropaga: para todo nó do caminho, visitas += 1, total += recompensa", "  retorna o filho mais visitado da raiz"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
