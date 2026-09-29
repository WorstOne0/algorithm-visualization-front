// Models
import type { AlgorithmId } from "./algorithms";
import type { FamilyId } from "./families";
import type { Localized } from "./translations";
import type { VizSpec } from "./viz";

export type SignatureId = "mongoIndex" | "autocomplete" | "npmOrder" | "didYouMean" | "paranaRoads" | "ticTacToe" | "traffic";

// A signature runs one of the algorithm pages on something real; `algorithm` is the page it leads back to.
export type Signature = {
  id: SignatureId;
  slug: string;
  family: FamilyId;
  algorithm: AlgorithmId;
  kicker: string;
  name: Localized;
  subtitle: Localized;
  desc: Localized;
  idea: Localized<string[]>;
  notice: Localized<string[]>;
  card: VizSpec;
};

export const SIGNATURES: Signature[] = [
  {
    id: "mongoIndex",
    slug: "mongodb-index",
    family: "trees",
    algorithm: "btree",
    kicker: "b-tree",
    name: { en: "How a MongoDB index works", pt: "Como funciona um índice do MongoDB" },
    subtitle: { en: "createIndex builds a B-tree; find walks it page by page", pt: "createIndex monta uma B-tree; find a percorre página por página" },
    desc: { en: "Insert documents, build the index on age, then run find and watch the pages it reads instead of the whole collection.", pt: "Insira documentos, monte o índice por idade e rode um find vendo as páginas lidas em vez da coleção inteira." },
    idea: {
      en: [
        "A MongoDB index is a B-tree stored by the WiredTiger engine: each page holds sorted keys and pointers to the pages below, and every leaf sits at the same depth. createIndex inserts one key per document; find({ age: 31 }) starts at the root, compares the key with the few keys of the page, descends into one child, and reaches the leaf in as many page reads as the tree is tall.",
        "Without the index the only plan is a COLLSCAN: read every document and test the predicate. explain('executionStats') shows the difference as totalKeysExamined and totalDocsExamined; the numbers on this page are exactly those. A range query descends once and then walks the leaves in order.",
      ],
      pt: [
        "Um índice do MongoDB é uma B-tree guardada pelo motor WiredTiger: cada página tem chaves ordenadas e ponteiros para as páginas abaixo, e toda folha fica na mesma profundidade. createIndex insere uma chave por documento; find({ age: 31 }) começa na raiz, compara a chave com as poucas chaves da página, desce num filho e chega à folha em tantas leituras de página quanto a altura da árvore.",
        "Sem o índice o único plano é um COLLSCAN: ler todo documento e testar o predicado. explain('executionStats') mostra a diferença como totalKeysExamined e totalDocsExamined; os números desta página são exatamente esses. Uma consulta por faixa desce uma vez e depois percorre as folhas em ordem.",
      ],
    },
    notice: {
      en: ["The height barely moves as documents come in: a real index over millions of rows is only 3 or 4 pages tall.", "A page split is the only expensive moment of an insert; MongoDB does it in the background too.", "docs examined by the index equals the matches; a COLLSCAN examines all of them, always."],
      pt: ["A altura quase não muda conforme os documentos entram: um índice real sobre milhões de linhas tem só 3 ou 4 páginas de altura.", "A divisão de página é o único momento caro de uma inserção; o MongoDB também faz isso em segundo plano.", "docs examinados pelo índice é igual aos acertos; um COLLSCAN examina todos, sempre."],
    },
    card: { starter: "tree", n: 14, r: 3 },
  },
  {
    id: "autocomplete",
    slug: "autocomplete",
    family: "trees",
    algorithm: "trie",
    kicker: "trie",
    name: { en: "Autocomplete over a dictionary", pt: "Autocompletar sobre um dicionário" },
    subtitle: { en: "type a prefix, the trie narrows to the words below it", pt: "digite um prefixo, a trie se estreita nas palavras abaixo dele" },
    desc: { en: "A dictionary of real words in a trie. Every character you type walks one edge; the completions are the subtree that is left.", pt: "Um dicionário de palavras reais numa trie. Cada caractere digitado percorre uma aresta; as sugestões são a subárvore que sobra." },
    idea: {
      en: [
        "A trie stores words character by character, so all the words sharing a prefix share a path. Autocomplete is then two moves: follow the typed prefix down the trie, which costs one step per character whatever the dictionary size, and enumerate the subtree under the node where the prefix ended.",
        "This is what a search box, an IDE and a phone keyboard do: the walk is O(length of the prefix), the enumeration stops after the first k results, and no word outside the prefix is ever touched. A linear scan would compare the prefix against every entry.",
      ],
      pt: [
        "Uma trie guarda palavras caractere por caractere, então todas as palavras com o mesmo prefixo compartilham um caminho. Autocompletar são dois movimentos: seguir o prefixo digitado trie abaixo, que custa um passo por caractere seja qual for o tamanho do dicionário, e enumerar a subárvore sob o nó onde o prefixo terminou.",
        "É o que uma caixa de busca, uma IDE e o teclado do celular fazem: a descida é O(tamanho do prefixo), a enumeração para depois dos primeiros k resultados, e nenhuma palavra fora do prefixo é tocada. Uma varredura linear compararia o prefixo com toda entrada.",
      ],
    },
    notice: {
      en: ["The nodes visited counter stays small however many words exist: only the prefix path and the subtree count.", "A prefix with no child ends the search at once; a scan would still test every word.", "The labels +n on cut branches are the words hidden below: the trie knows the count without visiting them."],
      pt: ["O contador de nós visitados fica pequeno seja qual for o número de palavras: só o caminho do prefixo e a subárvore contam.", "Um prefixo sem filho encerra a busca na hora; uma varredura ainda testaria toda palavra.", "Os rótulos +n nos ramos cortados são as palavras escondidas abaixo: a trie sabe a contagem sem visitá-las."],
    },
    card: { starter: "tree", n: 16, r: 3 },
  },
  {
    id: "npmOrder",
    slug: "npm-install-order",
    family: "graphs",
    algorithm: "topological",
    kicker: "topological sort",
    name: { en: "In what order does npm install?", pt: "Em que ordem o npm instala?" },
    subtitle: { en: "a dependency graph sorted topologically, cycles caught", pt: "um grafo de dependências ordenado topologicamente, ciclos detectados" },
    desc: { en: "Paste a dependency list, run Kahn's algorithm and get the install order a package manager would use. Add a cycle and watch it refuse.", pt: "Cole uma lista de dependências, rode o algoritmo de Kahn e obtenha a ordem de instalação que um gerenciador usaria. Adicione um ciclo e veja a recusa." },
    idea: {
      en: [
        "A package can only be installed after everything it depends on, so the dependency graph has to be walked in topological order. Kahn's algorithm counts the dependencies of each package, starts with the ones that have none, and every time a package is installed it lowers the count of the packages that were waiting for it; whoever reaches zero joins the queue.",
        "If the queue empties before every package is installed, the ones left form a cycle: each is waiting for another. Package managers, build systems (make, Gradle), task schedulers and spreadsheet recalculation all run this same algorithm; a cycle is the error they report.",
      ],
      pt: [
        "Um pacote só pode ser instalado depois de tudo de que depende, então o grafo de dependências precisa ser percorrido em ordem topológica. O algoritmo de Kahn conta as dependências de cada pacote, começa pelos que não têm nenhuma, e cada vez que um pacote é instalado baixa o contador dos que esperavam por ele; quem chega a zero entra na fila.",
        "Se a fila esvazia antes de todo pacote ser instalado, os que sobraram formam um ciclo: cada um espera por outro. Gerenciadores de pacote, sistemas de build (make, Gradle), escalonadores de tarefas e o recálculo de planilhas rodam esse mesmo algoritmo; um ciclo é o erro que eles reportam.",
      ],
    },
    notice: {
      en: ["Several valid orders exist: the queue order decides which; npm also parallelises everything in the queue at once.", "The in-degree label on each package is its unmet dependencies; it only goes down.", "A single cycle edge is enough to strand every package downstream of it."],
      pt: ["Existem várias ordens válidas: a ordem da fila decide qual; o npm também paraleliza tudo o que está na fila de uma vez.", "O rótulo de grau de entrada em cada pacote são suas dependências pendentes; ele só diminui.", "Uma única aresta de ciclo basta para encalhar todo pacote a jusante dela."],
    },
    card: { starter: "graph", n: 14, r: 3 },
  },
  {
    id: "didYouMean",
    slug: "did-you-mean",
    family: "searching",
    algorithm: "binary",
    kicker: "edit distance",
    name: { en: "git: did you mean 'commit'?", pt: "git: você quis dizer 'commit'?" },
    subtitle: { en: "Levenshtein distance against every git command, with git's own weights", pt: "distância de Levenshtein contra todo comando do git, com os pesos do próprio git" },
    desc: { en: "Type a misspelled git command. The DP table fills for every candidate and the closest one wins, exactly as git's help.c does it.", pt: "Digite um comando do git com erro. A tabela de PD é preenchida para cada candidato e o mais próximo vence, exatamente como o help.c do git faz." },
    idea: {
      en: [
        "Edit distance counts the fewest insertions, deletions and substitutions that turn one string into another. The dynamic-programming table has one row per character typed and one column per character of the candidate; each cell is the cheapest of three neighbours plus the cost of its own edit, and the bottom-right cell is the answer.",
        "When you mistype a subcommand, git computes this distance from what you typed to every command it knows and suggests the closest. Its weights are not all 1: a swap of two adjacent letters costs 0, an extra letter 1, a wrong letter 2 and a missing letter 3, because those are the mistakes people actually make. Toggle the weights and watch the ranking change.",
      ],
      pt: [
        "A distância de edição conta o menor número de inserções, remoções e substituições que transformam uma string em outra. A tabela de programação dinâmica tem uma linha por caractere digitado e uma coluna por caractere do candidato; cada célula é o mais barato de três vizinhos mais o custo da própria edição, e a célula do canto inferior direito é a resposta.",
        "Quando você erra um subcomando, o git calcula essa distância do que você digitou para todo comando que conhece e sugere o mais próximo. Os pesos dele não são todos 1: trocar duas letras vizinhas custa 0, uma letra a mais 1, uma letra errada 2 e uma letra faltando 3, porque esses são os erros que as pessoas realmente cometem. Alterne os pesos e veja o ranking mudar.",
      ],
    },
    notice: {
      en: ["Every candidate costs m × n cells: the table is small, but there are dozens of candidates, so the cells counter is what you pay.", "With git's weights 'chekout' is closer to 'checkout' than to anything else, but 'stauts' → 'status' costs 0: a swap is free.", "git only suggests when the distance is under its floor of 7; a garbage word gets no suggestion."],
      pt: ["Cada candidato custa m × n células: a tabela é pequena, mas há dezenas de candidatos, então o contador de células é o que você paga.", "Com os pesos do git 'chekout' fica mais perto de 'checkout' que de qualquer outro, mas 'stauts' → 'status' custa 0: uma troca é de graça.", "O git só sugere quando a distância fica abaixo do piso 7; uma palavra sem sentido não recebe sugestão."],
    },
    card: { starter: "search", n: 14 },
  },
  {
    id: "paranaRoads",
    slug: "parana-roads",
    family: "graphs",
    algorithm: "kruskal",
    kicker: "kruskal",
    name: { en: "The cheapest road network for Paraná", pt: "A malha viária mais barata para o Paraná" },
    subtitle: { en: "a minimum spanning tree over real cities and distances", pt: "uma árvore geradora mínima sobre cidades e distâncias reais" },
    desc: { en: "Twenty-five cities, candidate roads to their nearest neighbours in kilometres, and Kruskal picking the ones that connect everyone for the least asphalt.", pt: "Vinte e cinco cidades, estradas candidatas até as vizinhas mais próximas em quilômetros, e o Kruskal escolhendo as que conectam todo mundo com o mínimo de asfalto." },
    idea: {
      en: [
        "Connect every city with as little road as possible: that is a minimum spanning tree. Kruskal sorts all candidate roads by length and takes them shortest first, skipping any road whose two ends are already connected through roads taken earlier, because it would only add a loop.",
        "Union-find answers 'already connected?' in near-constant time, so the sort dominates. The same computation lays out power grids, fibre backbones, water mains and the clustering step of single-linkage; here the distances are great-circle kilometres between real coordinates.",
      ],
      pt: [
        "Conectar toda cidade com o mínimo de estrada possível: isso é uma árvore geradora mínima. O Kruskal ordena todas as estradas candidatas por comprimento e as pega da mais curta para a mais longa, pulando qualquer estrada cujas duas pontas já estejam conectadas por estradas pegas antes, porque só adicionaria uma volta.",
        "O union-find responde 'já conectados?' em tempo quase constante, então a ordenação domina. A mesma conta traça redes elétricas, backbones de fibra, adutoras e o passo de agrupamento do single-linkage; aqui as distâncias são quilômetros de círculo máximo entre coordenadas reais.",
      ],
    },
    notice: {
      en: ["Rejected roads are always the longer of two paths around a loop: the ledger shows why each one lost.", "The tree has exactly cities − 1 roads, whatever the candidates were.", "Curitiba's neighbours connect through short links; the west joins through the long Cascavel–Guarapuava stretch."],
      pt: ["As estradas rejeitadas são sempre a mais longa entre dois caminhos ao redor de uma volta: o registro mostra por que cada uma perdeu.", "A árvore tem exatamente cidades − 1 estradas, sejam quais forem as candidatas.", "As vizinhas de Curitiba se conectam por ligações curtas; o oeste se junta pelo longo trecho Cascavel–Guarapuava."],
    },
    card: { starter: "graph", n: 16, r: 3 },
  },
  {
    id: "ticTacToe",
    slug: "tic-tac-toe",
    family: "gameai",
    algorithm: "alphabeta",
    kicker: "alpha-beta",
    name: { en: "Play tic-tac-toe against minimax", pt: "Jogue o jogo da velha contra o minimax" },
    subtitle: { en: "the engine's search tree drawn while it thinks", pt: "a árvore de busca do motor desenhada enquanto ele pensa" },
    desc: { en: "You play X, the engine plays O with alpha-beta. Each of its moves shows the candidates it scored, the nodes it searched and the replies it expects.", pt: "Você joga com X, o motor com O usando alfa-beta. Cada jogada dele mostra os candidatos pontuados, os nós buscados e as respostas que ele espera." },
    idea: {
      en: [
        "Tic-tac-toe is small enough to search to the end: from the empty board there are 255,168 possible games. Minimax assumes you will answer every move with your best reply and picks the move whose worst case is best; alpha-beta reaches the same answer while skipping branches that cannot change it.",
        "The tree on the stage is the top of that search: the engine's candidate moves with their exact values (a win in fewer moves scores higher), then, under the move it picked, your possible replies and what each one leads to. The engine cannot lose; the best you can do is draw.",
      ],
      pt: [
        "O jogo da velha é pequeno o bastante para ser buscado até o fim: do tabuleiro vazio existem 255.168 partidas possíveis. O minimax supõe que você responderá cada jogada com a melhor resposta e escolhe a jogada cujo pior caso é o melhor; o alfa-beta chega à mesma resposta pulando ramos que não podem mudá-la.",
        "A árvore no palco é o topo dessa busca: as jogadas candidatas do motor com seus valores exatos (uma vitória em menos jogadas vale mais), e então, sob a jogada escolhida, suas respostas possíveis e aonde cada uma leva. O motor não pode perder; o melhor que você consegue é empatar.",
      ],
    },
    notice: {
      en: ["The first move searches thousands of nodes; by the fourth it is a few dozen: the tree shrinks with every ply.", "Cutoffs count the branches alpha-beta never expanded; without pruning the node count would be several times larger.", "When every candidate scores 0 the game is a forced draw: the engine just avoids losing."],
      pt: ["A primeira jogada busca milhares de nós; na quarta são algumas dezenas: a árvore encolhe a cada lance.", "Os cortes contam os ramos que o alfa-beta nunca expandiu; sem poda o número de nós seria várias vezes maior.", "Quando todo candidato pontua 0 o jogo é empate forçado: o motor só evita perder."],
    },
    card: { starter: "minimax", r: 3 },
  },
  {
    id: "traffic",
    slug: "traffic",
    family: "pathfinding",
    algorithm: "roadDijkstra",
    kicker: "dijkstra",
    name: { en: "Dijkstra with live traffic", pt: "Dijkstra com trânsito ao vivo" },
    subtitle: { en: "the same streets of Cascavel, weighted by minutes instead of metres", pt: "as mesmas ruas de Cascavel, pesadas em minutos em vez de metros" },
    desc: { en: "Jam a share of the streets and let Dijkstra minimise time. The fastest route detours around the amber streets; the shortest one is drawn beside it for comparison.", pt: "Congestione uma parte das ruas e deixe o Dijkstra minimizar tempo. A rota mais rápida desvia das ruas âmbar; a mais curta é desenhada ao lado para comparar." },
    idea: {
      en: [
        "A navigation app does not minimise distance, it minimises expected time: every street segment carries a live speed, and the edge weight is length divided by that speed. Dijkstra does not care what the weights mean, so the same search that found the shortest route finds the fastest one once the weights change.",
        "This page jams a share of the named streets with a slowdown factor between 1.6× and 3.5× and runs two searches from the same start: one on metres, one on minutes. The violet route is the shortest; the green one is the fastest; the difference is the minutes a driver saves by trusting the traffic layer.",
      ],
      pt: [
        "Um app de navegação não minimiza distância, minimiza tempo esperado: todo trecho de rua carrega uma velocidade ao vivo, e o peso da aresta é o comprimento dividido por essa velocidade. O Dijkstra não se importa com o que os pesos significam, então a mesma busca que achou a rota mais curta acha a mais rápida quando os pesos mudam.",
        "Esta página congestiona uma parte das ruas com nome com um fator de lentidão entre 1,6× e 3,5× e roda duas buscas a partir do mesmo início: uma em metros, outra em minutos. A rota violeta é a mais curta; a verde é a mais rápida; a diferença são os minutos que um motorista economiza confiando na camada de trânsito.",
      ],
    },
    notice: {
      en: ["With no jams the two routes coincide; slide the traffic up and they split where a jammed avenue used to be the obvious choice.", "The fastest route is usually longer in metres: the KPI row shows both.", "The search expands more intersections under traffic because the cheap frontier spreads along the free streets first."],
      pt: ["Sem congestionamento as duas rotas coincidem; suba o trânsito e elas se separam onde uma avenida travada era a escolha óbvia.", "A rota mais rápida costuma ser mais longa em metros: a linha de KPIs mostra as duas.", "A busca expande mais cruzamentos com trânsito porque a fronteira barata se espalha primeiro pelas ruas livres."],
    },
    card: { starter: "map", perFrame: 6 },
  },
];

export const findSignature = (slug: string) => SIGNATURES.find((signature) => signature.slug === slug);

export const signaturePath = (signature: Signature) => `/signatures/${signature.slug}`;
