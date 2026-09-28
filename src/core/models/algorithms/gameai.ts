// Models
import type { Localized } from "../translations";
import type { VizKey } from "../viz";
import type { AlgorithmSpec, KpiSpec } from "./spec";

const SIZE = { sizeLabel: { en: "Depth", pt: "Profundidade" }, minN: 2, maxN: 4, stepN: 1, defaultN: 3, shuffleLabel: { en: "New tree", pt: "Nova árvore" }, stepMs: 320 } as const;

const LEGEND: [VizKey, Localized][] = [["act", { en: "current", pt: "atual" }], ["green", { en: "evaluated", pt: "avaliado" }], ["violet", { en: "best line", pt: "melhor linha" }], ["def", { en: "unvisited", pt: "não visitado" }]];

const KPI_VISITED: KpiSpec = { key: "visited", unitKey: "visitedUnit", label: { en: "VISITED", pt: "VISITADOS" }, sub: { en: "nodes entered", pt: "nós visitados" } };
const KPI_LEAVES: KpiSpec = { key: "leaves", unitKey: "leavesUnit", label: { en: "LEAVES", pt: "FOLHAS" }, sub: { en: "positions scored", pt: "posições pontuadas" } };

const CHART: [string, number, boolean?][] = [["minimax", 81], ["negamax", 81], ["expectimax", 81], ["alpha-beta", 44], ["alpha-beta, ordered", 17]];
const CHART_TITLE = { en: "LEAVES SCORED · b = 3, d = 4", pt: "FOLHAS PONTUADAS · b = 3, d = 4" };
const CHART_NOTE = { en: "same tree · ordered means the best move is tried first", pt: "mesma árvore · ordenado significa a melhor jogada tentada primeiro" };

const STAGE_DESCEND: [VizKey, Localized, Localized] = ["primary", { en: "descend", pt: "desce" }, { en: "visit the first child until a leaf", pt: "visita o primeiro filho até uma folha" }];
const STAGE_SCORE: [VizKey, Localized, Localized] = ["green", { en: "score", pt: "pontua" }, { en: "leaf returns its evaluation", pt: "a folha devolve sua avaliação" }];

export const GAMEAI = {
  minimax: {
    ...SIZE,
    family: "gameai",
    slug: "minimax",
    kind: "gametree",
    name: "Minimax",
    subtitle: { en: "game tree search · perfect opponent", pt: "busca em árvore de jogo · oponente perfeito" },
    tagline: { en: "minimax · assume the worst, pick the best", pt: "minimax · assuma o pior, escolha o melhor" },
    legend: LEGEND,
    kpis: [
      KPI_VISITED,
      KPI_LEAVES,
      { key: "best", label: { en: "BEST", pt: "MELHOR" }, sub: { en: "value at the current node", pt: "valor no nó atual" } },
      { key: "depth", unitKey: "depthUnit", label: { en: "DEPTH", pt: "PROFUNDIDADE" }, sub: { en: "plies below the root", pt: "lances abaixo da raiz" } },
      { key: "turn", label: { en: "TURN", pt: "VEZ" }, sub: { en: "who moves at this node", pt: "quem joga neste nó" } },
    ],
    idea: {
      en: [
        "Minimax scores a position by looking ahead. At the leaves a static evaluation says how good the position is for the maximising player. One level up, the player to move picks the child that is best for them: MAX takes the largest value, MIN takes the smallest. The root's value is the outcome of perfect play from both sides.",
        "The tree here has three moves per position and random leaf scores from −9 to 9. Every node is visited, every leaf is scored: with branching b and depth d that is b^d leaves, which is why chess engines never search this way without pruning.",
      ],
      pt: [
        "O minimax pontua uma posição olhando à frente. Nas folhas, uma avaliação estática diz quão boa é a posição para o jogador que maximiza. Um nível acima, quem joga escolhe o filho melhor para si: MAX pega o maior valor, MIN pega o menor. O valor da raiz é o resultado de um jogo perfeito dos dois lados.",
        "A árvore aqui tem três jogadas por posição e pontuações aleatórias de −9 a 9 nas folhas. Todo nó é visitado, toda folha é pontuada: com ramificação b e profundidade d são b^d folhas, e por isso motores de xadrez nunca buscam assim sem poda.",
      ],
    },
    stages: [STAGE_DESCEND, STAGE_SCORE, ["act", { en: "back up", pt: "sobe" }, { en: "MAX keeps the largest, MIN the smallest", pt: "MAX guarda o maior, MIN o menor" }], ["violet", { en: "choose", pt: "escolhe" }, { en: "the root's best child is the move", pt: "o melhor filho da raiz é a jogada" }]],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(b^d)", "neg", { en: "no pruning: every leaf is scored", pt: "sem poda: toda folha é pontuada" }],
      [{ en: "average", pt: "médio" }, "O(b^d)", "neg", { en: "3⁴ = 81 leaves at depth 4", pt: "3⁴ = 81 folhas na profundidade 4" }],
      [{ en: "worst", pt: "pior" }, "O(b^d)", "neg", { en: "same, the tree is always complete", pt: "igual, a árvore é sempre completa" }],
      [{ en: "space", pt: "espaço" }, "O(d)", "text", { en: "one path of the recursion", pt: "um caminho da recursão" }],
    ],
    chartTitle: CHART_TITLE,
    chart: CHART.map(([label, value]) => (label === "minimax" ? [label, value, true] : [label, value])),
    chartNote: CHART_NOTE,
    when: {
      en: ["Two-player, turn-based, perfect-information games with a small enough tree: tic-tac-toe, Connect 4 with a depth limit, endgames.", "As the base every real engine builds on: alpha-beta, iterative deepening and transposition tables are all minimax with less work."],
      pt: ["Jogos de dois jogadores, por turnos, com informação perfeita e uma árvore pequena o bastante: jogo da velha, Connect 4 com limite de profundidade, finais.", "Como a base de todo motor real: poda alfa-beta, aprofundamento iterativo e tabelas de transposição são minimax com menos trabalho."],
    },
    pitfalls: {
      en: ["Exponential: each extra ply multiplies the work by the branching factor. Depth-limit it and evaluate the frontier.", "The evaluation function is everything; minimax only propagates it. A bad heuristic gives confident bad moves.", "The horizon effect: a disaster one ply beyond the depth limit is invisible. Quiescence search extends captures."],
      pt: ["Exponencial: cada lance a mais multiplica o trabalho pelo fator de ramificação. Limite a profundidade e avalie a fronteira.", "A função de avaliação é tudo; o minimax só a propaga. Uma heurística ruim dá jogadas ruins com confiança.", "O efeito horizonte: um desastre um lance além do limite é invisível. A busca de quiescência estende as capturas."],
    },
    history: {
      en: "John von Neumann proved the minimax theorem in 1928, the founding result of game theory. Claude Shannon described a minimax chess program in 1950, and Alan Turing hand-simulated one in 1951 before any machine could run it. Deep Blue's 1997 win over Kasparov was minimax with alpha-beta at 200 million positions a second.",
      pt: "John von Neumann provou o teorema minimax em 1928, o resultado fundador da teoria dos jogos. Claude Shannon descreveu um programa de xadrez minimax em 1950, e Alan Turing simulou um à mão em 1951, antes de qualquer máquina poder rodá-lo. A vitória do Deep Blue sobre Kasparov em 1997 foi minimax com alfa-beta a 200 milhões de posições por segundo.",
    },
    file: "minimax",
    code: {
      ts: ["function minimax(node: Node, depth: number, maximizing: boolean): number {", "  if (depth === 0 || node.isLeaf) return node.value;", "  let best = maximizing ? -Infinity : Infinity;", "  for (const child of node.children) {", "    const value = minimax(child, depth - 1, !maximizing);", "    best = maximizing ? Math.max(best, value) : Math.min(best, value);", "  }", "  return best;", "}"],
      py: ["def minimax(node, depth, maximizing):", "    if depth == 0 or node.is_leaf: return node.value", "    best = -math.inf if maximizing else math.inf", "    for child in node.children:", "        value = minimax(child, depth - 1, not maximizing)", "        best = max(best, value) if maximizing else min(best, value)", "", "    return best", ""],
      java: ["static int minimax(Node node, int depth, boolean maximizing) {", "  if (depth == 0 || node.isLeaf()) return node.value;", "  int best = maximizing ? Integer.MIN_VALUE : Integer.MAX_VALUE;", "  for (Node child : node.children) {", "    int value = minimax(child, depth - 1, !maximizing);", "    best = maximizing ? Math.max(best, value) : Math.min(best, value);", "  }", "  return best;", "}"],
      cpp: ["int minimax(const Node& node, int depth, bool maximizing) {", "  if (depth == 0 || node.isLeaf()) return node.value;", "  int best = maximizing ? INT_MIN : INT_MAX;", "  for (const Node& child : node.children) {", "    int value = minimax(child, depth - 1, !maximizing);", "    best = maximizing ? std::max(best, value) : std::min(best, value);", "  }", "  return best;", "}"],
      c: ["int minimax(const Node *node, int depth, bool maximizing) {", "  if (depth == 0 || node->child_count == 0) return node->value;", "  int best = maximizing ? INT_MIN : INT_MAX;", "  for (int i = 0; i < node->child_count; i++) {", "    int value = minimax(&node->children[i], depth - 1, !maximizing);", "    best = maximizing ? (value > best ? value : best) : (value < best ? value : best);", "  }", "  return best;", "}"],
      go: ["func minimax(node *Node, depth int, maximizing bool) int {", "\tif depth == 0 || len(node.Children) == 0 { return node.Value }", "\tbest := math.MinInt; if !maximizing { best = math.MaxInt }", "\tfor _, child := range node.Children {", "\t\tvalue := minimax(child, depth-1, !maximizing)", "\t\tif maximizing { best = max(best, value) } else { best = min(best, value) }", "\t}", "\treturn best", "}"],
      rs: ["fn minimax(node: &Node, depth: u32, maximizing: bool) -> i32 {", "    if depth == 0 || node.children.is_empty() { return node.value; }", "    let mut best = if maximizing { i32::MIN } else { i32::MAX };", "    for child in &node.children {", "        let value = minimax(child, depth - 1, !maximizing);", "        best = if maximizing { best.max(value) } else { best.min(value) };", "    }", "    best", "}"],
    },
    pseudo: {
      en: ["MINIMAX(node, depth, maximizing)", "  if depth = 0 or node is a leaf: return value(node)", "  best ← −∞ if maximizing else +∞", "  for each child of node", "    value ← MINIMAX(child, depth − 1, not maximizing)", "    best ← max(best, value) if maximizing else min(best, value)", "  return best"],
      pt: ["MINIMAX(nó, profundidade, maximizando)", "  se profundidade = 0 ou nó é folha: retorna valor(nó)", "  melhor ← −∞ se maximizando senão +∞", "  para cada filho de nó", "    valor ← MINIMAX(filho, profundidade − 1, não maximizando)", "    melhor ← max(melhor, valor) se maximizando senão min(melhor, valor)", "  retorna melhor"],
    },
  },

  alphabeta: {
    ...SIZE,
    family: "gameai",
    slug: "alpha-beta-pruning",
    kind: "gametree",
    name: "Alpha-beta pruning",
    subtitle: { en: "minimax with cutoffs · same answer, fewer leaves", pt: "minimax com cortes · mesma resposta, menos folhas" },
    tagline: { en: "alpha-beta · the branches you never needed to look at", pt: "alfa-beta · os ramos que você nunca precisou olhar" },
    legend: [...LEGEND.slice(0, 3), ["def", { en: "pruned", pt: "podado" }]],
    kpis: [
      KPI_VISITED,
      KPI_LEAVES,
      { key: "pruned", label: { en: "PRUNED", pt: "PODADOS" }, sub: { en: "nodes never visited", pt: "nós nunca visitados" } },
      { key: "alpha", label: { en: "ALPHA", pt: "ALFA" }, sub: { en: "best MAX can force so far", pt: "melhor que MAX garante até aqui" } },
      { key: "beta", label: { en: "BETA", pt: "BETA" }, sub: { en: "best MIN can force so far", pt: "melhor que MIN garante até aqui" } },
    ],
    idea: {
      en: [
        "Alpha-beta is minimax that remembers two bounds while it searches: α, the best value MAX is already guaranteed somewhere above, and β, the best MIN is guaranteed. When a node finds a child that makes its own value worse than what the opponent can already force elsewhere, the remaining children cannot change the result and are skipped.",
        "The answer is exactly the minimax value; only the work changes. With children in random order it roughly halves the leaves; with the best move tried first it visits about b^(d/2) leaves, which doubles the depth an engine can reach in the same time.",
      ],
      pt: [
        "A poda alfa-beta é o minimax que lembra dois limites enquanto busca: α, o melhor valor que MAX já tem garantido em algum lugar acima, e β, o melhor que MIN tem garantido. Quando um nó encontra um filho que torna seu próprio valor pior do que o oponente já consegue forçar em outro lugar, os filhos restantes não podem mudar o resultado e são pulados.",
        "A resposta é exatamente o valor do minimax; só o trabalho muda. Com filhos em ordem aleatória ela corta as folhas mais ou menos pela metade; com a melhor jogada tentada primeiro visita cerca de b^(d/2) folhas, o que dobra a profundidade que um motor alcança no mesmo tempo.",
      ],
    },
    stages: [["primary", { en: "descend", pt: "desce" }, { en: "carry α and β down", pt: "leva α e β para baixo" }], STAGE_SCORE, ["act", { en: "tighten", pt: "aperta" }, { en: "MAX raises α, MIN lowers β", pt: "MAX sobe α, MIN desce β" }], ["violet", { en: "cut", pt: "corta" }, { en: "β ≤ α: skip the remaining children", pt: "β ≤ α: pula os filhos restantes" }]],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(b^(d/2))", "green", { en: "best move always tried first", pt: "melhor jogada sempre tentada primeiro" }],
      [{ en: "average", pt: "médio" }, "O(b^(3d/4))", "text", { en: "random move order", pt: "ordem aleatória de jogadas" }],
      [{ en: "worst", pt: "pior" }, "O(b^d)", "neg", { en: "worst move first: no cut ever fires", pt: "pior jogada primeiro: nenhum corte acontece" }],
      [{ en: "space", pt: "espaço" }, "O(d)", "text", { en: "one path plus two numbers", pt: "um caminho mais dois números" }],
    ],
    chartTitle: CHART_TITLE,
    chart: CHART.map(([label, value]) => (label === "alpha-beta" ? [label, value, true] : [label, value])),
    chartNote: CHART_NOTE,
    when: {
      en: ["Every minimax search in practice: chess, checkers, Othello, Connect 4. There is no reason to run minimax without it.", "Whenever move ordering is possible: try captures, killer moves or the previous best first and the cuts multiply."],
      pt: ["Toda busca minimax na prática: xadrez, damas, Othello, Connect 4. Não há razão para rodar minimax sem ela.", "Sempre que a ordenação de jogadas for possível: tente capturas, killer moves ou a melhor anterior primeiro e os cortes se multiplicam."],
    },
    pitfalls: {
      en: ["Move ordering decides everything: with bad ordering it is plain minimax with extra bookkeeping.", "Cuts make the search order-dependent, so caching node values in a transposition table needs the bound type (exact, lower, upper) too.", "Mixing up when to update α versus β, or the strict versus non-strict cutoff, silently returns wrong values."],
      pt: ["A ordenação das jogadas decide tudo: com ordenação ruim ela é minimax puro com contabilidade extra.", "Os cortes tornam a busca dependente da ordem, então guardar valores de nós numa tabela de transposição exige também o tipo de limite (exato, inferior, superior).", "Confundir quando atualizar α e β, ou o corte estrito com o não estrito, devolve valores errados sem aviso."],
    },
    history: {
      en: "Alpha-beta was discovered several times: John McCarthy sketched it in 1956, Arthur Samuel used it in his checkers program, and Alexander Brudno published the first analysis in 1963. Donald Knuth and Ronald Moore proved its b^(d/2) bound in 1975, and every chess engine since has been built on it.",
      pt: "A poda alfa-beta foi descoberta várias vezes: John McCarthy a esboçou em 1956, Arthur Samuel a usou no seu programa de damas, e Alexander Brudno publicou a primeira análise em 1963. Donald Knuth e Ronald Moore provaram o limite b^(d/2) em 1975, e todo motor de xadrez desde então é construído sobre ela.",
    },
    file: "alpha_beta",
    code: {
      ts: ["function alphaBeta(node: Node, depth: number, alpha: number, beta: number, maximizing: boolean): number {", "  if (depth === 0 || node.isLeaf) return node.value;", "  let best = maximizing ? -Infinity : Infinity;", "  for (const child of node.children) {", "    const value = alphaBeta(child, depth - 1, alpha, beta, !maximizing);", "    best = maximizing ? Math.max(best, value) : Math.min(best, value);", "    if (maximizing) alpha = Math.max(alpha, best); else beta = Math.min(beta, best);", "    if (beta <= alpha) break;", "  }", "  return best;", "}"],
      py: ["def alpha_beta(node, depth, alpha, beta, maximizing):", "    if depth == 0 or node.is_leaf: return node.value", "    best = -math.inf if maximizing else math.inf", "    for child in node.children:", "        value = alpha_beta(child, depth - 1, alpha, beta, not maximizing)", "        best = max(best, value) if maximizing else min(best, value)", "        alpha, beta = (max(alpha, best), beta) if maximizing else (alpha, min(beta, best))", "        if beta <= alpha: break", "", "    return best", ""],
      java: ["static int alphaBeta(Node node, int depth, int alpha, int beta, boolean maximizing) {", "  if (depth == 0 || node.isLeaf()) return node.value;", "  int best = maximizing ? Integer.MIN_VALUE : Integer.MAX_VALUE;", "  for (Node child : node.children) {", "    int value = alphaBeta(child, depth - 1, alpha, beta, !maximizing);", "    best = maximizing ? Math.max(best, value) : Math.min(best, value);", "    if (maximizing) alpha = Math.max(alpha, best); else beta = Math.min(beta, best);", "    if (beta <= alpha) break;", "  }", "  return best;", "}"],
      cpp: ["int alphaBeta(const Node& node, int depth, int alpha, int beta, bool maximizing) {", "  if (depth == 0 || node.isLeaf()) return node.value;", "  int best = maximizing ? INT_MIN : INT_MAX;", "  for (const Node& child : node.children) {", "    int value = alphaBeta(child, depth - 1, alpha, beta, !maximizing);", "    best = maximizing ? std::max(best, value) : std::min(best, value);", "    if (maximizing) alpha = std::max(alpha, best); else beta = std::min(beta, best);", "    if (beta <= alpha) break;", "  }", "  return best;", "}"],
      c: ["int alpha_beta(const Node *node, int depth, int alpha, int beta, bool maximizing) {", "  if (depth == 0 || node->child_count == 0) return node->value;", "  int best = maximizing ? INT_MIN : INT_MAX;", "  for (int i = 0; i < node->child_count; i++) {", "    int value = alpha_beta(&node->children[i], depth - 1, alpha, beta, !maximizing);", "    best = maximizing ? (value > best ? value : best) : (value < best ? value : best);", "    if (maximizing) { if (best > alpha) alpha = best; } else { if (best < beta) beta = best; }", "    if (beta <= alpha) break;", "  }", "  return best;", "}"],
      go: ["func alphaBeta(node *Node, depth, alpha, beta int, maximizing bool) int {", "\tif depth == 0 || len(node.Children) == 0 { return node.Value }", "\tbest := math.MinInt; if !maximizing { best = math.MaxInt }", "\tfor _, child := range node.Children {", "\t\tvalue := alphaBeta(child, depth-1, alpha, beta, !maximizing)", "\t\tif maximizing { best = max(best, value) } else { best = min(best, value) }", "\t\tif maximizing { alpha = max(alpha, best) } else { beta = min(beta, best) }", "\t\tif beta <= alpha { break }", "\t}", "\treturn best", "}"],
      rs: ["fn alpha_beta(node: &Node, depth: u32, mut alpha: i32, mut beta: i32, maximizing: bool) -> i32 {", "    if depth == 0 || node.children.is_empty() { return node.value; }", "    let mut best = if maximizing { i32::MIN } else { i32::MAX };", "    for child in &node.children {", "        let value = alpha_beta(child, depth - 1, alpha, beta, !maximizing);", "        best = if maximizing { best.max(value) } else { best.min(value) };", "        if maximizing { alpha = alpha.max(best); } else { beta = beta.min(best); }", "        if beta <= alpha { break; }", "    }", "    best", "}"],
    },
    pseudo: {
      en: ["ALPHABETA(node, depth, α, β, maximizing)", "  if depth = 0 or node is a leaf: return value(node)", "  best ← −∞ if maximizing else +∞", "  for each child of node", "    value ← ALPHABETA(child, depth − 1, α, β, not maximizing)", "    best ← max/min(best, value); α ← max(α, best) if maximizing else β ← min(β, best)", "    if β ≤ α: break", "  return best"],
      pt: ["ALPHABETA(nó, profundidade, α, β, maximizando)", "  se profundidade = 0 ou nó é folha: retorna valor(nó)", "  melhor ← −∞ se maximizando senão +∞", "  para cada filho de nó", "    valor ← ALPHABETA(filho, profundidade − 1, α, β, não maximizando)", "    melhor ← max/min(melhor, valor); α ← max(α, melhor) se maximizando senão β ← min(β, melhor)", "    se β ≤ α: para", "  retorna melhor"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
