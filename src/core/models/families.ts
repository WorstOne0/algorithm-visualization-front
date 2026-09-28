// Models
import type { AlgorithmId } from "./algorithms";
import type { Localized } from "./translations";
import type { VizKey, VizSpec } from "./viz";

export type FamilyId = "sorting" | "searching" | "pathfinding" | "graphs" | "trees" | "gameai";

export type Family = {
  id: FamilyId;
  count: number;
  range: string;
  algo: string;
  kind: Localized;
  name: Localized;
  desc: Localized;
  long: Localized;
  intro1: Localized;
  intro2: Localized;
  flagship: AlgorithmId | null;
  flagshipViz: VizSpec;
  flagshipMeta: string;
  legend: [VizKey, Localized][];
  // The large canvas on the home page while this family is hovered.
  preview: VizSpec;
  // The small canvas inside the family card.
  card: VizSpec;
};

export const FAMILIES: Family[] = [
  {
    id: "sorting",
    count: 12,
    range: "O(n log n) – O(n²)",
    algo: "quick sort · n=32",
    kind: { en: "bar visualizer", pt: "visualizador de barras" },
    name: { en: "Sorting", pt: "Ordenação" },
    desc: { en: "Bars by value. Compare, swap, settle. From bubble sort to quick sort and the races between them.", pt: "Barras por valor. Compara, troca, assenta. Do bubble sort ao quick sort e as corridas entre eles." },
    long: { en: "Each comparison lights two bars, each swap flashes them, and settled bars turn green. Run bubble, insertion, merge, quick and heap sort on the same input.", pt: "Cada comparação acende duas barras, cada troca as pisca, e barras assentadas ficam verdes. Rode bubble, insertion, merge, quick e heap sort na mesma entrada." },
    intro1: { en: "Sorting puts n values in order, and it is the most studied problem in computing because almost everything depends on it: searching, grouping, deduplicating, drawing.", pt: "Ordenar é colocar n valores em ordem, e é o problema mais estudado da computação porque quase tudo depende dele: buscar, agrupar, deduplicar, desenhar." },
    intro2: { en: "The 12 algorithms here go from bubble sort, which everyone learns first, to quick sort and heap sort, which standard libraries build on. Each one spends comparisons and swaps differently; the bars make that visible.", pt: "Os 12 algoritmos daqui vão do bubble sort, que todo mundo aprende primeiro, ao quick sort e heap sort, base das bibliotecas padrão. Cada um gasta comparações e trocas de um jeito; as barras deixam isso visível." },
    flagship: "quick",
    flagshipViz: { starter: "sort", n: 48, algo: "quick", ms: 70, gap: 3, radius: 2 },
    flagshipMeta: "quick sort · n=48 · Lomuto",
    legend: [["primary", { en: "comparing", pt: "comparando" }], ["swap", { en: "swapped", pt: "trocado" }], ["violet", { en: "pivot", pt: "pivô" }], ["green", { en: "done", pt: "concluído" }]],
    preview: { starter: "sort", n: 32, algo: "quick", ms: 80, gap: 3, radius: 2 },
    card: { starter: "sort" },
  },
  {
    id: "searching",
    count: 6,
    range: "O(1) – O(n)",
    algo: "binary search · n=32",
    kind: { en: "sorted array", pt: "vetor ordenado" },
    name: { en: "Searching", pt: "Busca" },
    desc: { en: "Linear, binary, jump and interpolation search over a sorted array, with low, mid and high pointers.", pt: "Busca linear, binária, jump e por interpolação em um vetor ordenado, com ponteiros low, mid e high." },
    long: { en: "A sorted array with low, mid and high pointers. The search range halves on every step, which is why binary search needs sorted input.", pt: "Um vetor ordenado com ponteiros low, mid e high. A faixa de busca cai pela metade a cada passo, por isso a busca binária exige entrada ordenada." },
    intro1: { en: "Searching finds one value in a collection. On unsorted data you have to look at everything; on sorted data you can throw half away at each step.", pt: "Buscar é encontrar um valor numa coleção. Em dados desordenados é preciso olhar tudo; em dados ordenados dá para jogar metade fora a cada passo." },
    intro2: { en: "These six algorithms trade preconditions for speed: linear search asks nothing, binary search needs order, interpolation search needs uniform values.", pt: "Estes seis algoritmos trocam pré-condições por velocidade: a busca linear não pede nada, a binária exige ordem, a por interpolação exige valores uniformes." },
    flagship: null,
    flagshipViz: { starter: "search", n: 40, ms: 520 },
    flagshipMeta: "binary search · n=40",
    legend: [["primary", { en: "mid", pt: "meio" }], ["violet", { en: "target", pt: "alvo" }], ["green", { en: "found", pt: "achou" }]],
    preview: { starter: "search", n: 32, ms: 500 },
    card: { starter: "search" },
  },
  {
    id: "pathfinding",
    count: 8,
    range: "O(V + E) – O(E log V)",
    algo: "BFS · 36×18 grid",
    kind: { en: "grid visualizer", pt: "visualizador em grade" },
    name: { en: "Pathfinding", pt: "Caminhos" },
    desc: { en: "BFS, Dijkstra and A* across grids and mazes you draw. Frontier spreading, path drawn back.", pt: "BFS, Dijkstra e A* em grades e labirintos que você desenha. A fronteira se espalha, o caminho é traçado de volta." },
    long: { en: "Draw walls, place a start and a goal. The frontier spreads, visited cells dim, and the path is drawn back once the goal is reached.", pt: "Desenhe paredes, marque início e destino. A fronteira se espalha, células visitadas escurecem e o caminho é traçado ao chegar." },
    intro1: { en: "Pathfinding finds a route from a start to a goal through obstacles. It is BFS with a map: every GPS, every game unit and every robot runs a variant of it.", pt: "Encontrar caminhos é achar uma rota de um início a um destino entre obstáculos. É BFS com um mapa: todo GPS, toda unidade de jogo e todo robô roda uma variante disso." },
    intro2: { en: "The eight algorithms differ in what they know: BFS knows nothing and floods evenly, Dijkstra knows the cost so far, A* also guesses the cost to go, so it heads straight for the goal.", pt: "Os oito algoritmos diferem no que sabem: BFS não sabe nada e inunda por igual, Dijkstra sabe o custo até aqui, A* também estima o custo que falta, por isso vai direto ao destino." },
    flagship: "astar",
    flagshipViz: { starter: "path", cols: 44, rows: 20, ms: 45, algo: "astar" },
    flagshipMeta: "A* · 44×20 · manhattan",
    legend: [["vis", { en: "closed", pt: "fechado" }], ["primary", { en: "open", pt: "aberto" }], ["violet", { en: "path", pt: "caminho" }], ["green", { en: "start / goal", pt: "início / destino" }]],
    preview: { starter: "path", cols: 40, rows: 18, ms: 55, algo: "astar" },
    card: { starter: "path" },
  },
  {
    id: "graphs",
    count: 12,
    range: "O(V + E) – O(V³)",
    algo: "BFS traversal · 22 nodes",
    kind: { en: "node visualizer", pt: "visualizador de nós" },
    name: { en: "Graphs", pt: "Grafos" },
    desc: { en: "Traversals, shortest paths, spanning trees and topological order on draggable nodes.", pt: "Percursos, caminhos mínimos, árvores geradoras e ordem topológica em nós arrastáveis." },
    long: { en: "Draggable nodes and weighted edges. Traversals light edges as they go; shortest-path and spanning-tree algorithms keep a live table next to the graph.", pt: "Nós arrastáveis e arestas com peso. Percursos acendem arestas conforme avançam; caminhos mínimos e árvores geradoras mantêm uma tabela ao vivo ao lado do grafo." },
    intro1: { en: "Graphs are nodes and edges: cities and roads, people and friendships, tasks and dependencies. Most real data is a graph once you look at it.", pt: "Grafos são nós e arestas: cidades e estradas, pessoas e amizades, tarefas e dependências. Quase todo dado real é um grafo quando se olha direito." },
    intro2: { en: "Twelve algorithms cover the classic questions: what can I reach, what is the cheapest way, what is the cheapest way to connect everything, and in what order must things happen.", pt: "Doze algoritmos cobrem as perguntas clássicas: o que eu alcanço, qual o caminho mais barato, qual o jeito mais barato de ligar tudo, e em que ordem as coisas devem acontecer." },
    flagship: null,
    flagshipViz: { starter: "graph", n: 26, r: 6, ms: 520 },
    flagshipMeta: "BFS · 26 nodes",
    legend: [["primary", { en: "edge used", pt: "aresta usada" }], ["violet", { en: "frontier", pt: "fronteira" }], ["green", { en: "visited", pt: "visitado" }]],
    preview: { starter: "graph", n: 22, r: 5 },
    card: { starter: "graph" },
  },
  {
    id: "trees",
    count: 9,
    range: "O(log n) – O(n)",
    algo: "BST insert · 16 keys",
    kind: { en: "tree visualizer", pt: "visualizador de árvore" },
    name: { en: "Trees", pt: "Árvores" },
    desc: { en: "BST, AVL, red-black and heaps. Insertions walk the tree, rotations animate.", pt: "BST, AVL, rubro-negra e heaps. Inserções percorrem a árvore, rotações são animadas." },
    long: { en: "Each insertion walks down from the root, comparing as it goes. Balanced trees then rotate into place, and heaps sift up and down.", pt: "Cada inserção desce da raiz comparando pelo caminho. Árvores balanceadas então rotacionam, e heaps fazem sift up e sift down." },
    intro1: { en: "Trees keep data ordered while it changes. A binary search tree makes insert, lookup and delete logarithmic, as long as it stays balanced.", pt: "Árvores mantêm dados ordenados enquanto eles mudam. Uma árvore binária de busca deixa inserir, buscar e remover logarítmicos, desde que continue balanceada." },
    intro2: { en: "Nine structures show the trade-offs: plain BST, self-balancing AVL and red-black trees, B-trees for disks, heaps and tries for special shapes of data.", pt: "Nove estruturas mostram as trocas: BST simples, AVL e rubro-negra que se balanceiam, B-trees para disco, heaps e tries para formatos especiais de dado." },
    flagship: null,
    flagshipViz: { starter: "tree", n: 20, r: 7, ms: 380 },
    flagshipMeta: "BST insert · 20 keys",
    legend: [["primary", { en: "compared", pt: "comparado" }], ["violet", { en: "inserted", pt: "inserido" }], ["green", { en: "in tree", pt: "na árvore" }]],
    preview: { starter: "tree", n: 16, r: 6 },
    card: { starter: "tree" },
  },
  {
    id: "gameai",
    count: 5,
    range: "O(b^d) – O(b^(d/2))",
    algo: "alpha-beta · b=3 d=3",
    kind: { en: "game tree", pt: "árvore de jogo" },
    name: { en: "Game AI", pt: "IA de jogos" },
    desc: { en: "Minimax and alpha-beta pruning on a game tree next to the board. Pruned branches fade out.", pt: "Minimax e poda alfa-beta numa árvore de jogo ao lado do tabuleiro. Ramos podados desaparecem." },
    long: { en: "The board on one side, the search tree on the other. Minimax visits every node; alpha-beta prunes whole branches, which fade out as they are skipped.", pt: "O tabuleiro de um lado, a árvore de busca do outro. Minimax visita todo nó; alfa-beta poda ramos inteiros, que somem conforme são pulados." },
    intro1: { en: "Game AI picks the best move by imagining the opponent’s best reply, and their reply to that. The game tree grows fast; the art is in not exploring all of it.", pt: "IA de jogos escolhe a melhor jogada imaginando a melhor resposta do oponente, e a resposta a ela. A árvore cresce rápido; a arte está em não explorar tudo." },
    intro2: { en: "Five algorithms go from plain minimax to alpha-beta pruning, iterative deepening, expectimax for dice, and Monte Carlo tree search.", pt: "Cinco algoritmos vão do minimax puro à poda alfa-beta, aprofundamento iterativo, expectimax para dados e busca em árvore Monte Carlo." },
    flagship: null,
    flagshipViz: { starter: "minimax", branch: 3, depth: 4, r: 4, ms: 200 },
    flagshipMeta: "alpha-beta · b=3 d=4",
    legend: [["primary", { en: "explored", pt: "explorado" }], ["def", { en: "pruned", pt: "podado" }], ["violet", { en: "chosen", pt: "escolhido" }]],
    preview: { starter: "minimax", branch: 3, depth: 3, r: 5 },
    card: { starter: "minimax" },
  },
];

export const FAMILY_IDS = FAMILIES.map((family) => family.id);

export const findFamily = (id: string) => FAMILIES.find((family) => family.id === id);

// One row of a family's "All algorithms" grid. `viz` picks the card animation; `page` links to a built algorithm page.
export type AlgorithmRow = {
  viz: string;
  name: string;
  avg: string;
  worst: string;
  space: string;
  desc: Localized;
  page?: AlgorithmId;
};

export const ALGORITHMS_BY_FAMILY: Record<FamilyId, AlgorithmRow[]> = {
  sorting: [
    { viz: "bubble", name: "Bubble sort", avg: "O(n²)", worst: "O(n²)", space: "O(1)", desc: { en: "Adjacent swaps push the largest value to the end each pass.", pt: "Trocas adjacentes levam o maior valor ao fim a cada passada." }, page: "bubble" },
    { viz: "insertion", name: "Insertion sort", avg: "O(n²)", worst: "O(n²)", space: "O(1)", desc: { en: "Takes each value and slides it left into the sorted prefix.", pt: "Pega cada valor e desliza para a esquerda no prefixo ordenado." }, page: "insertion" },
    { viz: "selection", name: "Selection sort", avg: "O(n²)", worst: "O(n²)", space: "O(1)", desc: { en: "Finds the minimum of the rest and swaps it to the front.", pt: "Acha o mínimo do resto e troca para a frente." }, page: "selection" },
    { viz: "cocktail", name: "Cocktail shaker", avg: "O(n²)", worst: "O(n²)", space: "O(1)", desc: { en: "Bubble sort in both directions, so small values also move fast.", pt: "Bubble sort nos dois sentidos, assim valores pequenos também andam rápido." } },
    { viz: "gnome", name: "Gnome sort", avg: "O(n²)", worst: "O(n²)", space: "O(1)", desc: { en: "One pointer walks forward and steps back on every inversion.", pt: "Um ponteiro anda para frente e volta a cada inversão." } },
    { viz: "comb", name: "Comb sort", avg: "O(n log n)", worst: "O(n²)", space: "O(1)", desc: { en: "Bubble sort with a shrinking gap, which kills turtles early.", pt: "Bubble sort com um gap que encolhe, matando as tartarugas cedo." } },
    { viz: "shell", name: "Shell sort", avg: "O(n^1.3)", worst: "O(n²)", space: "O(1)", desc: { en: "Insertion sort over gapped subsequences, then a final gap of 1.", pt: "Insertion sort em subsequências com gap, depois gap final 1." } },
    { viz: "merge", name: "Merge sort", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)", desc: { en: "Merges sorted runs of doubling width. Stable, needs a buffer.", pt: "Funde runs ordenados de largura dobrando. Estável, precisa de buffer." }, page: "merge" },
    { viz: "quick", name: "Quick sort", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)", desc: { en: "Partitions around a pivot, then recurses on both sides.", pt: "Particiona em torno de um pivô, depois recursão nos dois lados." }, page: "quick" },
    { viz: "heap", name: "Heap sort", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)", desc: { en: "Builds a max-heap, then pops the maximum to the end n times.", pt: "Monta um max-heap, depois retira o máximo para o fim n vezes." }, page: "heap" },
    { viz: "oddeven", name: "Odd-even sort", avg: "O(n²)", worst: "O(n²)", space: "O(1)", desc: { en: "Alternates odd and even pairs; every pair in a phase is independent.", pt: "Alterna pares ímpares e pares; cada par de uma fase é independente." } },
    { viz: "radix", name: "Radix sort (LSD)", avg: "O(n · k)", worst: "O(n · k)", space: "O(n + k)", desc: { en: "Buckets by digit, least significant first. No comparisons at all.", pt: "Baldes por dígito, do menos significativo. Nenhuma comparação." } },
  ],
  pathfinding: [
    { viz: "bfs", name: "Breadth-first search", avg: "O(V + E)", worst: "O(V + E)", space: "O(V)", desc: { en: "Expands in rings from the start. Shortest path on unweighted grids.", pt: "Expande em anéis a partir do início. Caminho mínimo em grades sem peso." }, page: "bfs" },
    { viz: "dfs", name: "Depth-first search", avg: "O(V + E)", worst: "O(V + E)", space: "O(V)", desc: { en: "Dives down one corridor before backing up. Finds a path, not the shortest.", pt: "Desce por um corredor antes de voltar. Acha um caminho, não o mais curto." }, page: "dfs" },
    { viz: "dijkstra", name: "Dijkstra", avg: "O(E log V)", worst: "O(E log V)", space: "O(V)", desc: { en: "Always expands the cheapest known cell. Shortest path with weights.", pt: "Sempre expande a célula mais barata conhecida. Caminho mínimo com pesos." }, page: "dijkstra" },
    { viz: "astar", name: "A*", avg: "O(E log V)", worst: "O(E log V)", space: "O(V)", desc: { en: "Dijkstra plus a heuristic estimate to the goal. Optimal and focused.", pt: "Dijkstra mais uma estimativa até o destino. Ótimo e focado." }, page: "astar" },
    { viz: "greedy", name: "Greedy best-first", avg: "O(E log V)", worst: "O(E log V)", space: "O(V)", desc: { en: "Follows the heuristic only. Fast, but the path can be far from shortest.", pt: "Segue só a heurística. Rápido, mas o caminho pode ficar longe do mínimo." } },
    { viz: "bfs", name: "Bidirectional BFS", avg: "O(b^(d/2))", worst: "O(b^(d/2))", space: "O(V)", desc: { en: "Two frontiers, from start and goal, meet in the middle.", pt: "Duas fronteiras, do início e do destino, se encontram no meio." } },
    { viz: "astar", name: "Jump point search", avg: "O(E log V)", worst: "O(E log V)", space: "O(V)", desc: { en: "A* that skips straight runs of open cells on uniform grids.", pt: "A* que pula trechos retos de células livres em grades uniformes." } },
    { viz: "astar", name: "Theta*", avg: "O(E log V)", worst: "O(E log V)", space: "O(V)", desc: { en: "Any-angle A*: parents can be any visible cell, so paths are not grid-bound.", pt: "A* de qualquer ângulo: pais podem ser qualquer célula visível, caminhos fora da grade." } },
  ],
  searching: [
    { viz: "s", name: "Linear search", avg: "O(n)", worst: "O(n)", space: "O(1)", desc: { en: "Look at every element until it matches.", pt: "Olha cada elemento até bater." }, page: "linear" },
    { viz: "s", name: "Binary search", avg: "O(log n)", worst: "O(log n)", space: "O(1)", desc: { en: "Halve the sorted range around the middle element.", pt: "Divide a faixa ordenada ao meio em torno do elemento do meio." }, page: "binary" },
    { viz: "s", name: "Jump search", avg: "O(√n)", worst: "O(√n)", space: "O(1)", desc: { en: "Jump ahead in blocks, then scan back linearly.", pt: "Salta em blocos, depois varre para trás linearmente." } },
    { viz: "s", name: "Interpolation search", avg: "O(log log n)", worst: "O(n)", space: "O(1)", desc: { en: "Guess the position from the value, like a phone book.", pt: "Chuta a posição pelo valor, como numa lista telefônica." } },
    { viz: "s", name: "Exponential search", avg: "O(log n)", worst: "O(log n)", space: "O(1)", desc: { en: "Double the bound until you pass the target, then binary search.", pt: "Dobra o limite até passar do alvo, depois busca binária." } },
    { viz: "s", name: "Ternary search", avg: "O(log n)", worst: "O(log n)", space: "O(1)", desc: { en: "Split into thirds instead of halves.", pt: "Divide em terços em vez de metades." } },
  ],
  graphs: [
    { viz: "g", name: "BFS", avg: "O(V + E)", worst: "O(V + E)", space: "O(V)", desc: { en: "Level by level from a source.", pt: "Nível por nível a partir de uma origem." } },
    { viz: "g", name: "DFS", avg: "O(V + E)", worst: "O(V + E)", space: "O(V)", desc: { en: "Deep first, backtrack on dead ends.", pt: "Fundo primeiro, volta nos becos." } },
    { viz: "g", name: "Dijkstra", avg: "O(E log V)", worst: "O(E log V)", space: "O(V)", desc: { en: "Shortest paths with non-negative weights.", pt: "Caminhos mínimos com pesos não negativos." } },
    { viz: "g", name: "Bellman-Ford", avg: "O(V · E)", worst: "O(V · E)", space: "O(V)", desc: { en: "Relax every edge V−1 times; handles negative weights.", pt: "Relaxa toda aresta V−1 vezes; aceita pesos negativos." } },
    { viz: "g", name: "Floyd-Warshall", avg: "O(V³)", worst: "O(V³)", space: "O(V²)", desc: { en: "All pairs shortest paths by dynamic programming.", pt: "Caminhos mínimos entre todos os pares por programação dinâmica." } },
    { viz: "g", name: "Prim", avg: "O(E log V)", worst: "O(E log V)", space: "O(V)", desc: { en: "Grow a minimum spanning tree from one node.", pt: "Cresce uma árvore geradora mínima a partir de um nó." } },
    { viz: "g", name: "Kruskal", avg: "O(E log E)", worst: "O(E log E)", space: "O(V)", desc: { en: "Add cheapest edges that do not form a cycle.", pt: "Adiciona as arestas mais baratas que não fecham ciclo." } },
    { viz: "g", name: "Topological sort", avg: "O(V + E)", worst: "O(V + E)", space: "O(V)", desc: { en: "Order tasks so every dependency comes first.", pt: "Ordena tarefas para que toda dependência venha antes." } },
    { viz: "g", name: "Tarjan SCC", avg: "O(V + E)", worst: "O(V + E)", space: "O(V)", desc: { en: "Strongly connected components in one DFS.", pt: "Componentes fortemente conexos em um DFS." } },
    { viz: "g", name: "Kosaraju", avg: "O(V + E)", worst: "O(V + E)", space: "O(V)", desc: { en: "Two DFS passes on the graph and its reverse.", pt: "Dois DFS, no grafo e no seu reverso." } },
    { viz: "g", name: "Union-Find", avg: "O(α(n))", worst: "O(α(n))", space: "O(V)", desc: { en: "Track connected components under unions.", pt: "Acompanha componentes conexos sob uniões." } },
    { viz: "g", name: "Edmonds-Karp", avg: "O(V · E²)", worst: "O(V · E²)", space: "O(V²)", desc: { en: "Max flow via shortest augmenting paths.", pt: "Fluxo máximo por caminhos aumentantes mais curtos." } },
  ],
  trees: [
    { viz: "t", name: "Binary search tree", avg: "O(log n)", worst: "O(n)", space: "O(n)", desc: { en: "Left smaller, right larger. Degrades when unbalanced.", pt: "Menores à esquerda, maiores à direita. Degrada se desbalanceia." } },
    { viz: "t", name: "AVL tree", avg: "O(log n)", worst: "O(log n)", space: "O(n)", desc: { en: "Rotates whenever heights differ by more than one.", pt: "Rotaciona quando alturas diferem em mais de um." } },
    { viz: "t", name: "Red-black tree", avg: "O(log n)", worst: "O(log n)", space: "O(n)", desc: { en: "Colour rules keep the tree roughly balanced with fewer rotations.", pt: "Regras de cor mantêm a árvore quase balanceada com menos rotações." } },
    { viz: "t", name: "B-tree", avg: "O(log n)", worst: "O(log n)", space: "O(n)", desc: { en: "Wide nodes for disk pages. Databases live here.", pt: "Nós largos para páginas de disco. Bancos de dados moram aqui." } },
    { viz: "t", name: "Binary heap", avg: "O(log n)", worst: "O(log n)", space: "O(n)", desc: { en: "Complete tree in an array; parent beats children.", pt: "Árvore completa num vetor; o pai vence os filhos." } },
    { viz: "t", name: "Trie", avg: "O(m)", worst: "O(m)", space: "O(n · m)", desc: { en: "One node per character; prefixes are shared.", pt: "Um nó por caractere; prefixos são compartilhados." } },
    { viz: "t", name: "Segment tree", avg: "O(log n)", worst: "O(log n)", space: "O(n)", desc: { en: "Range queries and updates over an array.", pt: "Consultas e atualizações por intervalo num vetor." } },
    { viz: "t", name: "Fenwick tree", avg: "O(log n)", worst: "O(log n)", space: "O(n)", desc: { en: "Prefix sums with bit tricks.", pt: "Somas de prefixo com truques de bits." } },
    { viz: "t", name: "Treap", avg: "O(log n)", worst: "O(n)", space: "O(n)", desc: { en: "BST by key, heap by random priority.", pt: "BST pela chave, heap por prioridade aleatória." } },
  ],
  gameai: [
    { viz: "m", name: "Minimax", avg: "O(b^d)", worst: "O(b^d)", space: "O(d)", desc: { en: "Assume the opponent plays perfectly; pick the move with the best worst case.", pt: "Assume que o oponente joga perfeito; escolhe a jogada com o melhor pior caso." }, page: "minimax" },
    { viz: "m", name: "Alpha-beta pruning", avg: "O(b^(d/2))", worst: "O(b^d)", space: "O(d)", desc: { en: "Minimax that skips branches which cannot change the answer.", pt: "Minimax que pula ramos que não podem mudar a resposta." }, page: "alphabeta" },
    { viz: "m", name: "Iterative deepening", avg: "O(b^d)", worst: "O(b^d)", space: "O(d)", desc: { en: "Search depth 1, 2, 3… until time runs out.", pt: "Busca profundidade 1, 2, 3… até acabar o tempo." } },
    { viz: "m", name: "Expectimax", avg: "O(b^d)", worst: "O(b^d)", space: "O(d)", desc: { en: "Minimax with chance nodes for dice and cards.", pt: "Minimax com nós de sorte para dados e cartas." } },
    { viz: "m", name: "Monte Carlo tree search", avg: "—", worst: "—", space: "O(n)", desc: { en: "Random playouts guide which branches to grow.", pt: "Partidas aleatórias guiam quais ramos crescer." } },
  ],
};
