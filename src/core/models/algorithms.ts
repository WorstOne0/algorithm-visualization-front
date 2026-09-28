// Models
import type { FamilyId } from "./families";
import type { Localized } from "./translations";
import type { VizKey } from "./viz";

export type AlgorithmId = "quick" | "astar";

export type Algorithm = {
  id: AlgorithmId;
  family: FamilyId;
  slug: string;
  kind: "bars" | "grid";
  name: string;
  subtitle: Localized;
  sizeLabel: Localized;
  minN: number;
  maxN: number;
  stepN: number;
  defaultN: number;
  shuffleLabel: Localized;
  tagline: Localized;
  // Milliseconds per step at 1×.
  stepMs: number;
  legend: [VizKey, Localized][];
  idea: Localized<string[]>;
  stages: [VizKey, Localized, Localized][];
  complexity: [Localized, string, VizKey, Localized][];
  chartTitle: Localized;
  chart: [string, number, boolean?][];
  chartNote: Localized;
  when: Localized<string[]>;
  pitfalls: Localized<string[]>;
  history: Localized;
};

export const ALGORITHMS: Record<AlgorithmId, Algorithm> = {
  quick: {
    id: "quick",
    family: "sorting",
    slug: "quick-sort",
    kind: "bars",
    name: "Quick sort",
    subtitle: { en: "divide and conquer · Lomuto partition", pt: "divisão e conquista · partição de Lomuto" },
    sizeLabel: { en: "Size", pt: "Tamanho" },
    minN: 8,
    maxN: 64,
    stepN: 4,
    defaultN: 24,
    shuffleLabel: { en: "Shuffle", pt: "Embaralhar" },
    tagline: { en: "quick sort · Lomuto partition · what the animation does not tell you", pt: "quick sort · partição de Lomuto · o que a animação não conta" },
    stepMs: 240,
    legend: [["primary", { en: "comparing", pt: "comparando" }], ["swap", { en: "swapped", pt: "trocado" }], ["violet", { en: "pivot", pt: "pivô" }], ["green", { en: "in place", pt: "no lugar" }]],
    idea: {
      en: [
        "Quick sort picks one element as the pivot and rearranges the range so everything smaller sits on its left and everything larger on its right. After that partition the pivot is in its final position, and the algorithm calls itself on the two sides until every range has one element.",
        "The Lomuto partition shown here uses the last element as the pivot and walks the range once, swapping smaller elements to the frontier i. Hoare’s version uses two indices closing in from both ends and does about three times fewer swaps.",
      ],
      pt: [
        "O quick sort escolhe um elemento como pivô e reorganiza o intervalo de modo que tudo menor fique à esquerda e tudo maior à direita. Depois dessa partição o pivô está na posição final, e o algoritmo se chama para os dois lados até que cada intervalo tenha um elemento.",
        "A partição de Lomuto, mostrada aqui, usa o último elemento como pivô e percorre o intervalo uma vez, trocando elementos menores para a fronteira i. A de Hoare usa dois índices que se aproximam pelas pontas e faz cerca de três vezes menos trocas.",
      ],
    },
    stages: [
      ["violet", { en: "pivot", pt: "pivô" }, { en: "choose a[hi]", pt: "escolhe a[hi]" }],
      ["primary", { en: "partition", pt: "particiona" }, { en: "smaller values go left of i", pt: "menores vão para a esquerda de i" }],
      ["swap", { en: "place", pt: "fixa" }, { en: "swap pivot to a[i], it is final", pt: "pivô troca com a[i], está no lugar" }],
      ["green", { en: "recurse", pt: "recursão" }, { en: "both sides, until 1 element", pt: "os dois lados, até 1 elemento" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n log n)", "green", { en: "pivots always in the middle", pt: "pivôs sempre no meio" }],
      [{ en: "average", pt: "médio" }, "O(n log n)", "green", { en: "≈ 1.39 n log₂ n comparisons", pt: "≈ 1,39 n log₂ n comparações" }],
      [{ en: "worst", pt: "pior" }, "O(n²)", "neg", { en: "already sorted input with a fixed pivot", pt: "entrada já ordenada com pivô fixo" }],
      [{ en: "space", pt: "espaço" }, "O(log n)", "text", { en: "only the recursion stack", pt: "só a pilha de recursão" }],
    ],
    chartTitle: { en: "COMPARISONS AT N = 1 000", pt: "COMPARAÇÕES EM N = 1.000" },
    chart: [["bubble", 499500], ["insertion", 250000], ["heap", 17000], ["quick", 13900, true], ["merge", 8700]],
    chartNote: { en: "log scale · random input · average of 100 runs", pt: "escala logarítmica · entrada aleatória · média de 100 execuções" },
    when: {
      en: ["In-memory arrays when stability does not matter: it is C’s qsort and the base of C++’s introsort.", "When the extra memory of merge sort does not fit: quick sort sorts in place."],
      pt: ["Vetores em memória quando a estabilidade não importa: é o qsort do C e a base do introsort do C++.", "Quando a memória extra do merge sort não cabe: o quick sort ordena no lugar."],
    },
    pitfalls: {
      en: [
        "Fixed pivot on sorted input hits the worst case. Random pivot or median-of-three fixes it.",
        "Many equal values degrade Lomuto’s partition. Three-way partitioning, as in Dijkstra’s version, handles it.",
        "Recursing into the larger side first can overflow the stack. Recurse on the smaller side and loop on the larger.",
        "Not stable: equal values can swap order. Use merge sort or Tim sort when that matters.",
      ],
      pt: [
        "Pivô fixo em entrada ordenada cai no pior caso. Pivô aleatório ou mediana de três resolve.",
        "Muitos valores iguais degradam a partição de Lomuto. A partição de três vias, de Dijkstra, trata isso.",
        "Recursão primeiro no lado maior pode estourar a pilha. Recorra no menor e itere no maior.",
        "Não é estável: valores iguais podem trocar de ordem. Use merge sort ou Tim sort quando isso importa.",
      ],
    },
    history: {
      en: "Tony Hoare designed quick sort in 1959, at 25, while at Moscow State University working on machine translation and needing to sort dictionary words. He published it in 1961. In 2009 Vladimir Yaroslavskiy proposed the dual-pivot version that Java has used since version 7.",
      pt: "Tony Hoare criou o quick sort em 1959, aos 25 anos, na Universidade Estadual de Moscou, para ordenar palavras de um dicionário num projeto de tradução automática. Publicou em 1961. Em 2009, Vladimir Yaroslavskiy propôs a versão com dois pivôs que o Java usa desde a versão 7.",
    },
  },
  astar: {
    id: "astar",
    family: "pathfinding",
    slug: "a-star",
    kind: "grid",
    name: "A*",
    subtitle: { en: "best-first search · Manhattan heuristic", pt: "busca best-first · heurística de Manhattan" },
    sizeLabel: { en: "Walls", pt: "Paredes" },
    minN: 10,
    maxN: 40,
    stepN: 5,
    defaultN: 28,
    shuffleLabel: { en: "New maze", pt: "Novo labirinto" },
    tagline: { en: "A* · f = g + h · why it beats Dijkstra on a map", pt: "A* · f = g + h · por que vence Dijkstra num mapa" },
    stepMs: 110,
    legend: [["vis", { en: "closed", pt: "fechado" }], ["primary", { en: "open", pt: "aberto" }], ["act", { en: "current", pt: "atual" }], ["violet", { en: "path", pt: "caminho" }], ["green", { en: "start / goal", pt: "início / destino" }]],
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
    stages: [
      ["primary", { en: "pop", pt: "retira" }, { en: "open cell with lowest g + h", pt: "célula aberta de menor g + h" }],
      ["act", { en: "check", pt: "checa" }, { en: "is it the goal? then rebuild", pt: "é o destino? então reconstrói" }],
      ["swap", { en: "relax", pt: "relaxa" }, { en: "cheaper neighbours get new g", pt: "vizinhos mais baratos ganham novo g" }],
      ["violet", { en: "path", pt: "caminho" }, { en: "follow parents back to start", pt: "segue os pais até o início" }],
    ],
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
  },
};

export const ALGORITHM_LIST = Object.values(ALGORITHMS);

export const findAlgorithm = (family: string, slug: string) => ALGORITHM_LIST.find((algorithm) => algorithm.family === family && algorithm.slug === slug);

export const algorithmPath = (algorithm: Algorithm) => `/${algorithm.family}/${algorithm.slug}`;
