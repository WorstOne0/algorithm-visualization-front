// Models
import type { AlgorithmSpec, KpiSpec } from "./spec";

const SIZE = { sizeLabel: { en: "Values", pt: "Valores" }, minN: 6, maxN: 16, stepN: 2, defaultN: 8, shuffleLabel: { en: "New values", pt: "Novos valores" }, stepMs: 480, family: "trees", kind: "tree" } as const;

const KPI_OP: KpiSpec = { key: "op", label: { en: "OPERATION", pt: "OPERAÇÃO" }, sub: { en: "running now", pt: "em execução" } };
const KPI_ANSWER: KpiSpec = { key: "answer", label: { en: "ANSWER", pt: "RESPOSTA" }, sub: { en: "of the current query", pt: "da consulta atual" } };
const KPI_HEIGHT: KpiSpec = { key: "height", label: { en: "HEIGHT", pt: "ALTURA" }, sub: { en: "levels, root included", pt: "níveis, raiz incluída" } };

const CHART_RANGE: [string, number, boolean?][] = [["segment tree", 20], ["fenwick", 20], ["sqrt decomposition", 2000], ["prefix sums (query)", 1], ["plain array (update)", 1]];
const CHART_RANGE_TITLE = { en: "OPERATIONS PER QUERY + UPDATE · 1 000 000 VALUES", pt: "OPERAÇÕES POR CONSULTA + ATUALIZAÇÃO · 1.000.000 DE VALORES" };
const CHART_RANGE_NOTE = { en: "prefix sums answer in 1 but rebuild in n on every update; a plain array is the opposite", pt: "somas de prefixo respondem em 1 mas reconstroem em n a cada atualização; um vetor simples é o oposto" };

const selfIn = (chart: [string, number, boolean?][], label: string): [string, number, boolean?][] => chart.map(([name, value]) => (name === label ? [name, value, true] : [name, value]));

export const TREES_MORE = {
  trie: {
    ...SIZE,
    sizeLabel: { en: "Words", pt: "Palavras" },
    minN: 4,
    maxN: 14,
    defaultN: 8,
    shuffleLabel: { en: "New words", pt: "Novas palavras" },
    slug: "trie",
    name: "Trie",
    subtitle: { en: "one node per character, prefixes shared", pt: "um nó por caractere, prefixos compartilhados" },
    tagline: { en: "trie · the autocomplete data structure", pt: "trie · a estrutura de dados do autocompletar" },
    legend: [["act", { en: "current", pt: "atual" }], ["primary", { en: "path followed", pt: "caminho seguido" }], ["violet", { en: "created", pt: "criado" }], ["green", { en: "end of a word", pt: "fim de palavra" }]],
    kpis: [{ key: "nodes", label: { en: "NODES", pt: "NÓS" }, sub: { en: "characters stored once", pt: "caracteres guardados uma vez" } }, { key: "words", unitKey: "wordsUnit", label: { en: "WORDS", pt: "PALAVRAS" }, sub: { en: "inserted", pt: "inseridas" } }, { key: "created", label: { en: "CREATED", pt: "CRIADOS" }, sub: { en: "nodes added so far", pt: "nós adicionados até aqui" } }, KPI_OP, { key: "matches", label: { en: "MATCHES", pt: "RESULTADOS" }, sub: { en: "words under the prefix", pt: "palavras sob o prefixo" } }],
    idea: {
      en: [
        "A trie stores strings as paths. Every node holds one character and the words that share a prefix share the path of that prefix; a flag on a node says a word ends there. Inserting or looking up a word walks one node per character, so the cost is the length of the word, whatever the number of words stored.",
        "Because a prefix is a node, everything under that node is the list of completions: startsWith walks the prefix and then collects the ends below it. That is why search boxes, spell checkers and IP routers keep their keys in tries, and why memory is the price: a node per character, with a map of children each.",
      ],
      pt: [
        "Uma trie guarda strings como caminhos. Cada nó tem um caractere e as palavras que compartilham um prefixo compartilham o caminho desse prefixo; uma marca num nó diz que uma palavra termina ali. Inserir ou procurar uma palavra anda um nó por caractere, então o custo é o comprimento da palavra, seja qual for o número de palavras guardadas.",
        "Como um prefixo é um nó, tudo abaixo desse nó é a lista de completações: startsWith anda pelo prefixo e depois coleta os fins abaixo dele. É por isso que caixas de busca, corretores ortográficos e roteadores IP guardam suas chaves em tries, e por isso a memória é o preço: um nó por caractere, cada um com um mapa de filhos.",
      ],
    },
    stages: [
      ["primary", { en: "follow", pt: "segue" }, { en: "the child for the next character, if it exists", pt: "o filho do próximo caractere, se existir" }],
      ["violet", { en: "create", pt: "cria" }, { en: "a child when it does not", pt: "um filho quando não existe" }],
      ["green", { en: "mark", pt: "marca" }, { en: "the last node as the end of a word", pt: "o último nó como fim de palavra" }],
      ["act", { en: "collect", pt: "coleta" }, { en: "every end below a prefix", pt: "todo fim abaixo de um prefixo" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(m)", "green", { en: "m the length of the word", pt: "m o comprimento da palavra" }],
      [{ en: "average", pt: "médio" }, "O(m)", "green", { en: "independent of the number of words", pt: "independente do número de palavras" }],
      [{ en: "worst", pt: "pior" }, "O(m + k)", "green", { en: "prefix query returning k words", pt: "consulta de prefixo devolvendo k palavras" }],
      [{ en: "space", pt: "espaço" }, "O(n · m)", "neg", { en: "a node per character in the worst case", pt: "um nó por caractere no pior caso" }],
    ],
    chartTitle: { en: "LOOKUP COST · 1 000 000 WORDS OF LENGTH 8", pt: "CUSTO DE BUSCA · 1.000.000 DE PALAVRAS DE TAMANHO 8" },
    chart: [["trie", 8, true], ["hash table", 9], ["sorted array (binary search)", 160], ["balanced bst", 160]],
    chartNote: { en: "character comparisons · the tree searches compare whole strings at each of log n levels", pt: "comparações de caractere · as buscas em árvore comparam strings inteiras em cada um dos log n níveis" },
    when: {
      en: ["Autocomplete, spell checking, T9 keyboards: anything that asks for all keys with a prefix.", "Longest-prefix matching, the core of IP routing tables, and string sets with many shared prefixes."],
      pt: ["Autocompletar, correção ortográfica, teclados T9: qualquer coisa que peça todas as chaves com um prefixo.", "Casamento do prefixo mais longo, o núcleo das tabelas de roteamento IP, e conjuntos de strings com muitos prefixos compartilhados."],
    },
    pitfalls: {
      en: ["Memory: a node per character with a child map is heavy; radix trees merge single-child chains, and arrays of 26 waste space on sparse nodes.", "Deletion must unmark the end and prune nodes that no longer lead anywhere.", "For exact lookups only, a hash table is simpler and usually faster."],
      pt: ["Memória: um nó por caractere com um mapa de filhos é pesado; árvores radix fundem cadeias de filho único, e vetores de 26 desperdiçam espaço em nós esparsos.", "Remover precisa desmarcar o fim e podar nós que não levam mais a nada.", "Para buscas exatas apenas, uma tabela hash é mais simples e em geral mais rápida."],
    },
    history: {
      en: "René de la Briandais described the structure in 1959 and Edward Fredkin named it in 1960, from retrieval, pronouncing it 'tree' to the confusion of everyone since. Radix trees and Patricia tries (Morrison, 1968) compress it, and it underlies most predictive text and routing tables today.",
      pt: "René de la Briandais descreveu a estrutura em 1959 e Edward Fredkin a batizou em 1960, a partir de retrieval, pronunciando 'tree' para confusão de todos desde então. Árvores radix e tries Patricia (Morrison, 1968) a comprimem, e ela está por baixo da maior parte do texto preditivo e das tabelas de roteamento de hoje.",
    },
    file: "trie",
    code: {
      ts: ["class Trie {", "  root = new TrieNode();", "  insert(word: string) {", "    let node = this.root;", "    for (const char of word) {", "      if (!node.children.has(char)) node.children.set(char, new TrieNode());", "      node = node.children.get(char)!;", "    }", "    node.end = true;", "  }", "  search(word: string) {", "    let node: TrieNode | undefined = this.root;", "    for (const char of word) node = node?.children.get(char);", "    return node !== undefined && node.end;", "  }", "  startsWith(prefix: string) {", "    let node: TrieNode | undefined = this.root;", "    for (const char of prefix) node = node?.children.get(char);", "    return node ? node.collect(prefix) : []; // every end below, depth first", "  }", "}"],
      py: ["class Trie:", "    def __init__(self): self.root = TrieNode()", "    def insert(self, word):", "        node = self.root", "        for char in word:", "            if char not in node.children: node.children[char] = TrieNode()", "            node = node.children[char]", "", "        node.end = True", "", "    def search(self, word):", "        node = self.root", "        for char in word: node = node.children.get(char) if node else None", "        return node is not None and node.end", "", "    def starts_with(self, prefix):", "        node = self.root", "        for char in prefix: node = node.children.get(char) if node else None", "        return node.collect(prefix) if node else []  # every end below, depth first", "", ""],
      java: ["class Trie {", "  TrieNode root = new TrieNode();", "  void insert(String word) {", "    TrieNode node = root;", "    for (char c : word.toCharArray()) {", "      if (!node.children.containsKey(c)) node.children.put(c, new TrieNode());", "      node = node.children.get(c);", "    }", "    node.end = true;", "  }", "  boolean search(String word) {", "    TrieNode node = root;", "    for (char c : word.toCharArray()) node = node == null ? null : node.children.get(c);", "    return node != null && node.end;", "  }", "  List<String> startsWith(String prefix) {", "    TrieNode node = root;", "    for (char c : prefix.toCharArray()) node = node == null ? null : node.children.get(c);", "    return node == null ? List.of() : node.collect(prefix); // every end below, depth first", "  }", "}"],
      cpp: ["class Trie {", "  TrieNode* root = new TrieNode();", "  void insert(const std::string& word) {", "    TrieNode* node = root;", "    for (char c : word) {", "      if (!node->children.count(c)) node->children[c] = new TrieNode();", "      node = node->children[c];", "    }", "    node->end = true;", "  }", "  bool search(const std::string& word) {", "    TrieNode* node = root;", "    for (char c : word) node = node && node->children.count(c) ? node->children[c] : nullptr;", "    return node != nullptr && node->end;", "  }", "  std::vector<std::string> startsWith(const std::string& prefix) {", "    TrieNode* node = root;", "    for (char c : prefix) node = node && node->children.count(c) ? node->children[c] : nullptr;", "    return node ? node->collect(prefix) : std::vector<std::string>{}; // every end below, depth first", "  }", "};"],
      c: ["typedef struct TrieNode { struct TrieNode *children[26]; bool end; } TrieNode;", "TrieNode *root;", "void insert(const char *word) {", "  TrieNode *node = root;", "  for (; *word; word++) {", "    if (!node->children[*word - 'a']) node->children[*word - 'a'] = new_node();", "    node = node->children[*word - 'a'];", "  }", "  node->end = true;", "}", "bool search(const char *word) {", "  TrieNode *node = root;", "  for (; *word && node; word++) node = node->children[*word - 'a'];", "  return node != NULL && node->end;", "}", "int starts_with(const char *prefix, char **out) {", "  TrieNode *node = root;", "  for (; *prefix && node; prefix++) node = node->children[*prefix - 'a'];", "  return node ? collect(node, prefix, out) : 0; /* every end below, depth first */", "}", ""],
      go: ["type Trie struct{ root *TrieNode }", "func NewTrie() *Trie { return &Trie{root: &TrieNode{children: map[rune]*TrieNode{}}} }", "func (t *Trie) Insert(word string) {", "\tnode := t.root", "\tfor _, char := range word {", "\t\tif _, ok := node.children[char]; !ok { node.children[char] = &TrieNode{children: map[rune]*TrieNode{}} }", "\t\tnode = node.children[char]", "\t}", "\tnode.end = true", "}", "func (t *Trie) Search(word string) bool {", "\tnode := t.root", "\tfor _, char := range word { if node == nil { break }; node = node.children[char] }", "\treturn node != nil && node.end", "}", "func (t *Trie) StartsWith(prefix string) []string {", "\tnode := t.root", "\tfor _, char := range prefix { if node == nil { break }; node = node.children[char] }", "\tif node == nil { return nil }; return node.collect(prefix) // every end below, depth first", "}", ""],
      rs: ["struct Trie { root: TrieNode }", "impl Trie { fn new() -> Self { Trie { root: TrieNode::default() } }", "    fn insert(&mut self, word: &str) {", "        let mut node = &mut self.root;", "        for char in word.chars() {", "            node = node.children.entry(char).or_default();", "            // entry() follows the child or creates it in one step", "        }", "        node.end = true;", "    }", "    fn search(&self, word: &str) -> bool {", "        let mut node = Some(&self.root);", "        for char in word.chars() { node = node.and_then(|current| current.children.get(&char)); }", "        node.map_or(false, |current| current.end)", "    }", "    fn starts_with(&self, prefix: &str) -> Vec<String> {", "        let mut node = Some(&self.root);", "        for char in prefix.chars() { node = node.and_then(|current| current.children.get(&char)); }", "        node.map_or(vec![], |current| current.collect(prefix)) // every end below, depth first", "    }", "}"],
    },
    pseudo: {
      en: ["INSERT(word): node ← root; for each character: node ← its child for the character, created if missing; mark node as an end", "SEARCH(word): node ← root; for each character: node ← its child, or fail; return whether node is an end", "STARTSWITH(prefix): walk the prefix the same way, then collect every end below that node"],
      pt: ["INSERIR(palavra): nó ← raiz; para cada caractere: nó ← seu filho do caractere, criado se faltar; marca nó como fim", "BUSCAR(palavra): nó ← raiz; para cada caractere: nó ← seu filho, ou falha; retorna se nó é um fim", "COMEÇACOM(prefixo): anda pelo prefixo do mesmo jeito, depois coleta todo fim abaixo desse nó"],
    },
  },

  segmentTree: {
    ...SIZE,
    slug: "segment-tree",
    name: "Segment tree",
    subtitle: { en: "range sums with point updates", pt: "somas de intervalo com atualizações pontuais" },
    tagline: { en: "segment tree · every node owns a range, every query touches only the ranges that straddle its ends", pt: "árvore de segmentos · cada nó é dono de um intervalo, cada consulta toca só os intervalos que cruzam suas pontas" },
    legend: [["act", { en: "current", pt: "atual" }], ["primary", { en: "partly inside: recurse", pt: "parte dentro: recursão" }], ["green", { en: "fully inside: taken whole", pt: "todo dentro: pego inteiro" }], ["violet", { en: "recomputed", pt: "recalculado" }]],
    kpis: [{ key: "nodes", label: { en: "NODES", pt: "NÓS" }, sub: { en: "about 2n", pt: "cerca de 2n" } }, { key: "visits", label: { en: "VISITS", pt: "VISITAS" }, sub: { en: "nodes touched by this operation", pt: "nós tocados por esta operação" } }, KPI_OP, KPI_ANSWER, { key: "leaves", label: { en: "LEAVES", pt: "FOLHAS" }, sub: { en: "one per array value", pt: "uma por valor do vetor" } }],
    idea: {
      en: [
        "A segment tree puts the array at the leaves and gives every internal node the sum of its two children, so the root holds the total and each node owns a contiguous range. A range query starts at the root: a node fully inside the range contributes its sum in one step, a node fully outside contributes nothing, and only the nodes that straddle an end of the range recurse into their children.",
        "At most two nodes per level straddle, so a query visits O(log n) nodes. A point update changes one leaf and recomputes the log n ancestors above it. Any associative operation works in place of the sum: minimum, maximum, gcd, or a matrix product.",
      ],
      pt: [
        "Uma árvore de segmentos põe o vetor nas folhas e dá a cada nó interno a soma dos dois filhos, então a raiz guarda o total e cada nó é dono de um intervalo contíguo. Uma consulta de intervalo começa na raiz: um nó totalmente dentro do intervalo contribui sua soma num passo, um nó totalmente fora contribui nada, e só os nós que cruzam uma ponta do intervalo descem aos filhos.",
        "No máximo dois nós por nível cruzam, então uma consulta visita O(log n) nós. Uma atualização pontual muda uma folha e recalcula os log n ancestrais acima dela. Qualquer operação associativa funciona no lugar da soma: mínimo, máximo, mdc, ou um produto de matrizes.",
      ],
    },
    stages: [
      ["violet", { en: "build", pt: "constrói" }, { en: "leaves are the values, parents the sums", pt: "folhas são os valores, pais as somas" }],
      ["green", { en: "inside", pt: "dentro" }, { en: "a node fully inside the query is taken whole", pt: "um nó todo dentro da consulta é pego inteiro" }],
      ["primary", { en: "straddle", pt: "cruza" }, { en: "a node that crosses an end recurses", pt: "um nó que cruza uma ponta desce" }],
      ["act", { en: "update", pt: "atualiza" }, { en: "one leaf, then its ancestors", pt: "uma folha, depois seus ancestrais" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(1)", "green", { en: "the query is the whole array: the root answers", pt: "a consulta é o vetor inteiro: a raiz responde" }],
      [{ en: "average", pt: "médio" }, "O(log n)", "green", { en: "per query and per update", pt: "por consulta e por atualização" }],
      [{ en: "worst", pt: "pior" }, "O(log n)", "green", { en: "at most 4 log n nodes visited", pt: "no máximo 4 log n nós visitados" }],
      [{ en: "space", pt: "espaço" }, "O(n)", "text", { en: "about 2n nodes, 4n in the array layout", pt: "cerca de 2n nós, 4n no layout em vetor" }],
    ],
    chartTitle: CHART_RANGE_TITLE,
    chart: selfIn(CHART_RANGE, "segment tree"),
    chartNote: CHART_RANGE_NOTE,
    when: {
      en: ["Range queries mixed with updates: leaderboards, time-series windows, computational geometry sweeps, competitive programming's favourite tool.", "Any associative combine, and with lazy propagation, range updates too."],
      pt: ["Consultas de intervalo misturadas com atualizações: rankings, janelas de séries temporais, varreduras em geometria computacional, a ferramenta favorita da programação competitiva.", "Qualquer combinação associativa, e com propagação preguiçosa, atualizações de intervalo também."],
    },
    pitfalls: {
      en: ["The array layout needs 4n slots when n is not a power of two, or an index runs off the end.", "Range updates need lazy propagation; updating every leaf in the range is O(n).", "Fenwick does prefix sums in less memory and less code; use it when the operation is invertible."],
      pt: ["O layout em vetor precisa de 4n posições quando n não é potência de dois, ou um índice sai pelo fim.", "Atualizações de intervalo precisam de propagação preguiçosa; atualizar toda folha do intervalo é O(n).", "Fenwick faz somas de prefixo com menos memória e menos código; use quando a operação é invertível."],
    },
    history: {
      en: "Jon Bentley introduced segment trees in 1977 for computational geometry, to count intersections of rectangles in a sweep line. The competitive-programming form with an implicit array, lazy propagation and arbitrary monoids grew out of the 2000s contest scene and is now the standard teaching example of a divide-and-conquer data structure.",
      pt: "Jon Bentley introduziu as árvores de segmentos em 1977 para geometria computacional, para contar interseções de retângulos numa linha de varredura. A forma da programação competitiva, com vetor implícito, propagação preguiçosa e monoides arbitrários, cresceu na cena de competições dos anos 2000 e é hoje o exemplo padrão de estrutura de dados por divisão e conquista.",
    },
    file: "segment_tree",
    code: {
      ts: ["function build(values: number[], node: number, left: number, right: number) {", "  if (left === right) {", "    sums[node] = values[left]; return;", "  }", "  const middle = (left + right) >> 1;", "  build(values, 2 * node, left, middle); build(values, 2 * node + 1, middle + 1, right); sums[node] = sums[2 * node] + sums[2 * node + 1];", "}", "function query(node: number, left: number, right: number, from: number, to: number): number {", "  // the sum of values[from..to], visiting only the nodes that straddle the ends", "  if (to < left || right < from) return 0;", "  if (from <= left && right <= to) return sums[node];", "  const middle = (left + right) >> 1;", "  return query(2 * node, left, middle, from, to) + query(2 * node + 1, middle + 1, right, from, to);", "}", "function update(node: number, left: number, right: number, index: number, value: number) {", "  if (left === right) { sums[node] = value; return; }", "  const middle = (left + right) >> 1; if (index <= middle) update(2 * node, left, middle, index, value); else update(2 * node + 1, middle + 1, right, index, value);", "  sums[node] = sums[2 * node] + sums[2 * node + 1];", "}"],
      py: ["def build(values, node, left, right):", "    if left == right:", "        sums[node] = values[left]; return", "", "    middle = (left + right) // 2", "    build(values, 2 * node, left, middle); build(values, 2 * node + 1, middle + 1, right); sums[node] = sums[2 * node] + sums[2 * node + 1]", "", "def query(node, left, right, start, end):", "    # the sum of values[start..end], visiting only the nodes that straddle the ends", "    if end < left or right < start: return 0", "    if start <= left and right <= end: return sums[node]", "    middle = (left + right) // 2", "    return query(2 * node, left, middle, start, end) + query(2 * node + 1, middle + 1, right, start, end)", "", "def update(node, left, right, index, value):", "    if left == right: sums[node] = value; return", "    middle = (left + right) // 2; update(2 * node, left, middle, index, value) if index <= middle else update(2 * node + 1, middle + 1, right, index, value)", "    sums[node] = sums[2 * node] + sums[2 * node + 1]", ""],
      java: ["void build(int[] values, int node, int left, int right) {", "  if (left == right) {", "    sums[node] = values[left]; return;", "  }", "  int middle = (left + right) >>> 1;", "  build(values, 2 * node, left, middle); build(values, 2 * node + 1, middle + 1, right); sums[node] = sums[2 * node] + sums[2 * node + 1];", "}", "int query(int node, int left, int right, int from, int to) {", "  // the sum of values[from..to], visiting only the nodes that straddle the ends", "  if (to < left || right < from) return 0;", "  if (from <= left && right <= to) return sums[node];", "  int middle = (left + right) >>> 1;", "  return query(2 * node, left, middle, from, to) + query(2 * node + 1, middle + 1, right, from, to);", "}", "void update(int node, int left, int right, int index, int value) {", "  if (left == right) { sums[node] = value; return; }", "  int middle = (left + right) >>> 1; if (index <= middle) update(2 * node, left, middle, index, value); else update(2 * node + 1, middle + 1, right, index, value);", "  sums[node] = sums[2 * node] + sums[2 * node + 1];", "}"],
      cpp: ["void build(const std::vector<int>& values, int node, int left, int right) {", "  if (left == right) {", "    sums[node] = values[left]; return;", "  }", "  int middle = (left + right) / 2;", "  build(values, 2 * node, left, middle); build(values, 2 * node + 1, middle + 1, right); sums[node] = sums[2 * node] + sums[2 * node + 1];", "}", "int query(int node, int left, int right, int from, int to) {", "  // the sum of values[from..to], visiting only the nodes that straddle the ends", "  if (to < left || right < from) return 0;", "  if (from <= left && right <= to) return sums[node];", "  int middle = (left + right) / 2;", "  return query(2 * node, left, middle, from, to) + query(2 * node + 1, middle + 1, right, from, to);", "}", "void update(int node, int left, int right, int index, int value) {", "  if (left == right) { sums[node] = value; return; }", "  int middle = (left + right) / 2; if (index <= middle) update(2 * node, left, middle, index, value); else update(2 * node + 1, middle + 1, right, index, value);", "  sums[node] = sums[2 * node] + sums[2 * node + 1];", "}"],
      c: ["void build(const int *values, int node, int left, int right) {", "  if (left == right) {", "    sums[node] = values[left]; return;", "  }", "  int middle = (left + right) / 2;", "  build(values, 2 * node, left, middle); build(values, 2 * node + 1, middle + 1, right); sums[node] = sums[2 * node] + sums[2 * node + 1];", "}", "int query(int node, int left, int right, int from, int to) {", "  /* the sum of values[from..to], visiting only the nodes that straddle the ends */", "  if (to < left || right < from) return 0;", "  if (from <= left && right <= to) return sums[node];", "  int middle = (left + right) / 2;", "  return query(2 * node, left, middle, from, to) + query(2 * node + 1, middle + 1, right, from, to);", "}", "void update(int node, int left, int right, int index, int value) {", "  if (left == right) { sums[node] = value; return; }", "  int middle = (left + right) / 2; if (index <= middle) update(2 * node, left, middle, index, value); else update(2 * node + 1, middle + 1, right, index, value);", "  sums[node] = sums[2 * node] + sums[2 * node + 1];", "}"],
      go: ["func build(values []int, node, left, right int) {", "\tif left == right {", "\t\tsums[node] = values[left]; return", "\t}", "\tmiddle := (left + right) / 2", "\tbuild(values, 2*node, left, middle); build(values, 2*node+1, middle+1, right); sums[node] = sums[2*node] + sums[2*node+1]", "}", "func query(node, left, right, from, to int) int {", "\t// the sum of values[from..to], visiting only the nodes that straddle the ends", "\tif to < left || right < from { return 0 }", "\tif from <= left && right <= to { return sums[node] }", "\tmiddle := (left + right) / 2", "\treturn query(2*node, left, middle, from, to) + query(2*node+1, middle+1, right, from, to)", "}", "func update(node, left, right, index, value int) {", "\tif left == right { sums[node] = value; return }", "\tmiddle := (left + right) / 2; if index <= middle { update(2*node, left, middle, index, value) } else { update(2*node+1, middle+1, right, index, value) }", "\tsums[node] = sums[2*node] + sums[2*node+1]", "}"],
      rs: ["fn build(sums: &mut Vec<i64>, values: &[i64], node: usize, left: usize, right: usize) {", "    if left == right {", "        sums[node] = values[left]; return;", "    }", "    let middle = (left + right) / 2;", "    build(sums, values, 2 * node, left, middle); build(sums, values, 2 * node + 1, middle + 1, right); sums[node] = sums[2 * node] + sums[2 * node + 1];", "}", "fn query(sums: &[i64], node: usize, left: usize, right: usize, from: usize, to: usize) -> i64 {", "    // the sum of values[from..=to], visiting only the nodes that straddle the ends", "    if to < left || right < from { return 0; }", "    if from <= left && right <= to { return sums[node]; }", "    let middle = (left + right) / 2;", "    query(sums, 2 * node, left, middle, from, to) + query(sums, 2 * node + 1, middle + 1, right, from, to)", "}", "fn update(sums: &mut Vec<i64>, node: usize, left: usize, right: usize, index: usize, value: i64) {", "    if left == right { sums[node] = value; return; }", "    let middle = (left + right) / 2; if index <= middle { update(sums, 2 * node, left, middle, index, value); } else { update(sums, 2 * node + 1, middle + 1, right, index, value); }", "    sums[node] = sums[2 * node] + sums[2 * node + 1];", "}"],
    },
    pseudo: {
      en: ["BUILD(node, left, right): a leaf holds its value; otherwise build both halves and store their sum", "QUERY(node, left, right, from, to)", "  outside the query: 0 · fully inside: the node's sum · straddling: QUERY(left child) + QUERY(right child)", "UPDATE(node, left, right, index, value): descend to the leaf, set it, recompute the sums on the way back up"],
      pt: ["CONSTRÓI(nó, esq, dir): uma folha guarda seu valor; senão constrói as duas metades e guarda a soma", "CONSULTA(nó, esq, dir, de, até)", "  fora da consulta: 0 · todo dentro: a soma do nó · cruzando: CONSULTA(filho esq) + CONSULTA(filho dir)", "ATUALIZA(nó, esq, dir, índice, valor): desce até a folha, define, recalcula as somas na volta"],
    },
  },

  fenwick: {
    ...SIZE,
    slug: "fenwick-tree",
    name: "Fenwick tree",
    subtitle: { en: "prefix sums by clearing the lowest bit", pt: "somas de prefixo limpando o bit mais baixo" },
    tagline: { en: "Fenwick · an array that hides a tree in its indices", pt: "Fenwick · um vetor que esconde uma árvore nos índices" },
    legend: [["act", { en: "current", pt: "atual" }], ["primary", { en: "update chain", pt: "cadeia de atualização" }], ["green", { en: "summed in the query", pt: "somado na consulta" }], ["violet", { en: "updated", pt: "atualizado" }]],
    kpis: [{ key: "touched", label: { en: "TOUCHED", pt: "TOCADOS" }, sub: { en: "nodes in this operation", pt: "nós nesta operação" } }, KPI_OP, KPI_ANSWER, { key: "size", label: { en: "SIZE", pt: "TAMANHO" }, sub: { en: "values in the array", pt: "valores no vetor" } }, KPI_HEIGHT],
    idea: {
      en: [
        "A Fenwick tree, or binary indexed tree, is a plain array of n + 1 numbers where slot i holds the sum of a range that ends at i and whose length is the lowest set bit of i: slot 6 (110₂) covers two values, slot 8 (1000₂) covers eight. Those ranges nest into a tree, and the tree is never stored: the parent of i on a prefix query is i minus its lowest bit, and on an update i plus it.",
        "A prefix sum walks down from i clearing the lowest bit each time, so it adds at most log n slots. A point update walks up adding the lowest bit, touching the log n slots whose range covers the index. Twenty lines and no pointers, which is why it is the usual answer when the operation can be undone, as sums can.",
      ],
      pt: [
        "Uma árvore de Fenwick, ou binary indexed tree, é um vetor comum de n + 1 números em que a posição i guarda a soma de um intervalo que termina em i e cujo comprimento é o bit 1 mais baixo de i: a posição 6 (110₂) cobre dois valores, a 8 (1000₂) cobre oito. Esses intervalos se aninham numa árvore, e a árvore nunca é guardada: o pai de i numa consulta de prefixo é i menos o bit mais baixo, e numa atualização i mais ele.",
        "Uma soma de prefixo desce de i limpando o bit mais baixo a cada vez, então soma no máximo log n posições. Uma atualização pontual sobe somando o bit mais baixo, tocando as log n posições cujo intervalo cobre o índice. Vinte linhas e nenhum ponteiro, por isso é a resposta usual quando a operação pode ser desfeita, como as somas podem.",
      ],
    },
    stages: [
      ["primary", { en: "lowbit", pt: "lowbit" }, { en: "i & −i: the lowest set bit of i", pt: "i & −i: o bit 1 mais baixo de i" }],
      ["violet", { en: "add", pt: "soma" }, { en: "climb i += lowbit(i), adding the delta", pt: "sobe i += lowbit(i), somando o delta" }],
      ["green", { en: "prefix", pt: "prefixo" }, { en: "descend i −= lowbit(i), summing the slots", pt: "desce i −= lowbit(i), somando as posições" }],
      ["act", { en: "range", pt: "intervalo" }, { en: "sum(a..b) = prefix(b + 1) − prefix(a)", pt: "soma(a..b) = prefixo(b + 1) − prefixo(a)" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(1)", "green", { en: "prefix of a power of two: one slot", pt: "prefixo de uma potência de dois: uma posição" }],
      [{ en: "average", pt: "médio" }, "O(log n)", "green", { en: "half the bits set on average", pt: "metade dos bits ligados em média" }],
      [{ en: "worst", pt: "pior" }, "O(log n)", "green", { en: "all bits set: log n slots", pt: "todos os bits ligados: log n posições" }],
      [{ en: "space", pt: "espaço" }, "O(n)", "green", { en: "n + 1 integers, nothing else", pt: "n + 1 inteiros, nada mais" }],
    ],
    chartTitle: CHART_RANGE_TITLE,
    chart: selfIn(CHART_RANGE, "fenwick"),
    chartNote: CHART_RANGE_NOTE,
    when: {
      en: ["Prefix sums and counts that change: inversion counting, order statistics, frequency tables, cumulative scores.", "Anywhere a segment tree would do but memory and code size matter and the operation is invertible."],
      pt: ["Somas e contagens de prefixo que mudam: contagem de inversões, estatísticas de ordem, tabelas de frequência, pontuações acumuladas.", "Onde uma árvore de segmentos serviria mas memória e tamanho de código importam e a operação é invertível."],
    },
    pitfalls: {
      en: ["Indices are 1-based inside the tree; forgetting the +1 breaks lowbit at index 0.", "Minimum and maximum cannot be undone, so range min needs a segment tree, not this.", "Building by n adds is O(n log n); the linear build pushes each slot into its parent once."],
      pt: ["Os índices começam em 1 dentro da árvore; esquecer o +1 quebra o lowbit no índice 0.", "Mínimo e máximo não podem ser desfeitos, então mínimo de intervalo precisa de árvore de segmentos, não disto.", "Construir com n somas é O(n log n); a construção linear empurra cada posição para o pai uma vez."],
    },
    history: {
      en: "Boris Ryabko proposed the structure in 1989 and Peter Fenwick described it independently in 1994 for cumulative frequency tables in arithmetic coding, where every symbol updates a count and every decode needs a prefix sum. It is now a fixture of competitive programming under the name binary indexed tree.",
      pt: "Boris Ryabko propôs a estrutura em 1989 e Peter Fenwick a descreveu de forma independente em 1994 para tabelas de frequência acumulada em codificação aritmética, onde todo símbolo atualiza uma contagem e toda decodificação precisa de uma soma de prefixo. Hoje é presença fixa da programação competitiva sob o nome binary indexed tree.",
    },
    file: "fenwick_tree",
    code: {
      ts: ["class Fenwick {", "  tree: number[]; constructor(size: number) { this.tree = new Array(size + 1).fill(0); }", "  add(index: number, delta: number) {", "    for (let i = index + 1; i < this.tree.length; i += i & -i) {", "      this.tree[i] += delta;", "    }", "  }", "  prefix(count: number) {", "    let sum = 0;", "    for (let i = count; i > 0; i -= i & -i) {", "      sum += this.tree[i];", "    }", "    return sum;", "  }", "  rangeSum(from: number, to: number) { return this.prefix(to + 1) - this.prefix(from); }", "  static build(values: number[]) {", "    const fenwick = new Fenwick(values.length); values.forEach((value, index) => fenwick.add(index, value));", "    return fenwick;", "  }", "}"],
      py: ["class Fenwick:", "    def __init__(self, size): self.tree = [0] * (size + 1)", "    def add(self, index, delta):", "        i = index + 1", "        while i < len(self.tree): self.tree[i] += delta; i += i & -i", "", "", "    def prefix(self, count):", "        total = 0; i = count", "        while i > 0:", "            total += self.tree[i]; i -= i & -i", "", "        return total", "", "    def range_sum(self, start, end): return self.prefix(end + 1) - self.prefix(start)", "    @staticmethod", "    def build(values): fenwick = Fenwick(len(values)); [fenwick.add(index, value) for index, value in enumerate(values)]", "        ; return fenwick", "", ""],
      java: ["class Fenwick {", "  int[] tree; Fenwick(int size) { tree = new int[size + 1]; }", "  void add(int index, int delta) {", "    for (int i = index + 1; i < tree.length; i += i & -i) {", "      tree[i] += delta;", "    }", "  }", "  int prefix(int count) {", "    int sum = 0;", "    for (int i = count; i > 0; i -= i & -i) {", "      sum += tree[i];", "    }", "    return sum;", "  }", "  int rangeSum(int from, int to) { return prefix(to + 1) - prefix(from); }", "  static Fenwick build(int[] values) {", "    Fenwick fenwick = new Fenwick(values.length); for (int index = 0; index < values.length; index++) fenwick.add(index, values[index]);", "    return fenwick;", "  }", "}"],
      cpp: ["class Fenwick {", "  std::vector<long long> tree; public: Fenwick(int size) : tree(size + 1, 0) {}", "  void add(int index, long long delta) {", "    for (int i = index + 1; i < (int) tree.size(); i += i & -i) {", "      tree[i] += delta;", "    }", "  }", "  long long prefix(int count) {", "    long long sum = 0;", "    for (int i = count; i > 0; i -= i & -i) {", "      sum += tree[i];", "    }", "    return sum;", "  }", "  long long rangeSum(int from, int to) { return prefix(to + 1) - prefix(from); }", "  static Fenwick build(const std::vector<long long>& values) {", "    Fenwick fenwick(values.size()); for (size_t index = 0; index < values.size(); index++) fenwick.add(index, values[index]);", "    return fenwick;", "  }", "};"],
      c: ["typedef struct { long long tree[MAX_N + 1]; int size; } Fenwick;", "void fenwick_init(Fenwick *f, int size) { f->size = size; memset(f->tree, 0, sizeof f->tree); }", "void fenwick_add(Fenwick *f, int index, long long delta) {", "  for (int i = index + 1; i <= f->size; i += i & -i) {", "    f->tree[i] += delta;", "  }", "}", "long long fenwick_prefix(const Fenwick *f, int count) {", "  long long sum = 0;", "  for (int i = count; i > 0; i -= i & -i) {", "    sum += f->tree[i];", "  }", "  return sum;", "}", "long long fenwick_range(const Fenwick *f, int from, int to) { return fenwick_prefix(f, to + 1) - fenwick_prefix(f, from); }", "void fenwick_build(Fenwick *f, const long long *values, int size) {", "  fenwick_init(f, size); for (int index = 0; index < size; index++) fenwick_add(f, index, values[index]);", "  ", "}", ""],
      go: ["type Fenwick struct{ tree []int }", "func NewFenwick(size int) *Fenwick { return &Fenwick{tree: make([]int, size+1)} }", "func (f *Fenwick) Add(index, delta int) {", "\tfor i := index + 1; i < len(f.tree); i += i & -i {", "\t\tf.tree[i] += delta", "\t}", "}", "func (f *Fenwick) Prefix(count int) int {", "\tsum := 0", "\tfor i := count; i > 0; i -= i & -i {", "\t\tsum += f.tree[i]", "\t}", "\treturn sum", "}", "func (f *Fenwick) RangeSum(from, to int) int { return f.Prefix(to+1) - f.Prefix(from) }", "func Build(values []int) *Fenwick {", "\tfenwick := NewFenwick(len(values)); for index, value := range values { fenwick.Add(index, value) }", "\treturn fenwick", "}", ""],
      rs: ["struct Fenwick { tree: Vec<i64> }", "impl Fenwick { fn new(size: usize) -> Self { Fenwick { tree: vec![0; size + 1] } }", "    fn add(&mut self, index: usize, delta: i64) {", "        let mut i = index + 1; while i < self.tree.len() {", "            self.tree[i] += delta;", "            i += i & i.wrapping_neg(); }", "    }", "    fn prefix(&self, count: usize) -> i64 {", "        let mut sum = 0;", "        let mut i = count; while i > 0 {", "            sum += self.tree[i];", "            i -= i & i.wrapping_neg(); }", "        sum", "    }", "    fn range_sum(&self, from: usize, to: usize) -> i64 { self.prefix(to + 1) - self.prefix(from) }", "    fn build(values: &[i64]) -> Self {", "        let mut fenwick = Fenwick::new(values.len()); for (index, &value) in values.iter().enumerate() { fenwick.add(index, value); }", "        fenwick", "    }", "}"],
    },
    pseudo: {
      en: ["ADD(index, delta): i ← index + 1; while i ≤ n: tree[i] += delta; i ← i + lowbit(i)", "PREFIX(count): sum ← 0; i ← count; while i > 0: sum += tree[i]; i ← i − lowbit(i); return sum", "RANGE(a, b) = PREFIX(b + 1) − PREFIX(a)", "lowbit(i) = i & −i, the value of the lowest set bit"],
      pt: ["SOMA(índice, delta): i ← índice + 1; enquanto i ≤ n: árvore[i] += delta; i ← i + lowbit(i)", "PREFIXO(quantos): soma ← 0; i ← quantos; enquanto i > 0: soma += árvore[i]; i ← i − lowbit(i); retorna soma", "INTERVALO(a, b) = PREFIXO(b + 1) − PREFIXO(a)", "lowbit(i) = i & −i, o valor do bit 1 mais baixo"],
    },
  },

  treap: {
    ...SIZE,
    sizeLabel: { en: "Keys", pt: "Chaves" },
    minN: 6,
    maxN: 20,
    defaultN: 12,
    shuffleLabel: { en: "New keys", pt: "Novas chaves" },
    slug: "treap",
    name: "Treap",
    subtitle: { en: "BST by key, heap by random priority", pt: "BST pela chave, heap por prioridade aleatória" },
    tagline: { en: "treap · a coin flip per node keeps the tree balanced", pt: "treap · um sorteio por nó mantém a árvore balanceada" },
    legend: [["act", { en: "comparing", pt: "comparando" }], ["primary", { en: "path", pt: "caminho" }], ["violet", { en: "new node", pt: "nó novo" }], ["amber", { en: "rotating", pt: "rotacionando" }]],
    kpis: [{ key: "nodes", unitKey: "nodesUnit", label: { en: "NODES", pt: "NÓS" }, sub: { en: "in the tree", pt: "na árvore" } }, { key: "rotations", label: { en: "ROTATIONS", pt: "ROTAÇÕES" }, sub: { en: "so far", pt: "até aqui" } }, KPI_HEIGHT, { key: "expected", label: { en: "EXPECTED", pt: "ESPERADA" }, sub: { en: "≈ 1.4 log₂ n for a random treap", pt: "≈ 1,4 log₂ n para um treap aleatório" } }, { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "key against key", pt: "chave contra chave" } }],
    idea: {
      en: [
        "A treap gives every node a key and a random priority and keeps two rules at once: the keys form a binary search tree and the priorities form a max-heap. Together they pin the shape down completely: the treap is exactly the BST you would get by inserting the keys in decreasing priority order.",
        "Since the priorities are random, that insertion order is random, and a random-order BST has expected height O(log n) whatever order the keys really arrived in. Insertion is a BST insert followed by rotations up while the new node's priority beats its parent's, with no heights or colours to maintain.",
      ],
      pt: [
        "Um treap dá a cada nó uma chave e uma prioridade aleatória e mantém duas regras ao mesmo tempo: as chaves formam uma árvore binária de busca e as prioridades formam um max-heap. Juntas elas fixam o formato por completo: o treap é exatamente a BST que se obteria inserindo as chaves em ordem decrescente de prioridade.",
        "Como as prioridades são aleatórias, essa ordem de inserção é aleatória, e uma BST de ordem aleatória tem altura esperada O(log n) seja qual for a ordem real de chegada das chaves. Inserir é um insert de BST seguido de rotações para cima enquanto a prioridade do nó novo vence a do pai, sem alturas nem cores a manter.",
      ],
    },
    stages: [
      ["act", { en: "descend", pt: "desce" }, { en: "by key, like a plain BST", pt: "pela chave, como uma BST comum" }],
      ["violet", { en: "attach", pt: "pendura" }, { en: "as a leaf with a random priority", pt: "como folha com prioridade aleatória" }],
      ["amber", { en: "rotate up", pt: "rotaciona para cima" }, { en: "while the priority beats the parent's", pt: "enquanto a prioridade vence a do pai" }],
      ["green", { en: "settle", pt: "assenta" }, { en: "keys still ordered, priorities a heap", pt: "chaves ainda ordenadas, prioridades um heap" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(log n)", "green", { en: "expected height 1.4 log₂ n", pt: "altura esperada 1,4 log₂ n" }],
      [{ en: "average", pt: "médio" }, "O(log n)", "green", { en: "expected, over the random priorities", pt: "esperado, sobre as prioridades aleatórias" }],
      [{ en: "worst", pt: "pior" }, "O(n)", "neg", { en: "an unlucky priority draw; vanishingly rare", pt: "um sorteio azarado de prioridades; raríssimo" }],
      [{ en: "space", pt: "espaço" }, "O(n)", "text", { en: "a priority per node", pt: "uma prioridade por nó" }],
    ],
    chartTitle: { en: "HEIGHT · 1 000 000 KEYS INSERTED IN SORTED ORDER", pt: "ALTURA · 1.000.000 DE CHAVES INSERIDAS EM ORDEM" },
    chart: [["treap", 40, true], ["avl", 29], ["red-black", 40], ["skip list", 40], ["plain bst", 1000000]],
    chartNote: { en: "the treap and the skip list are random; their heights are typical, not guaranteed", pt: "o treap e a skip list são aleatórios; suas alturas são típicas, não garantidas" },
    when: {
      en: ["Ordered sets with split and merge: text editor buffers, interval sets, persistent versions, because a treap splits by key in O(log n).", "When AVL or red-black code is too much: a treap is the shortest balanced tree to write."],
      pt: ["Conjuntos ordenados com split e merge: buffers de editor de texto, conjuntos de intervalos, versões persistentes, porque um treap divide por chave em O(log n).", "Quando o código de AVL ou rubro-negra é demais: um treap é a árvore balanceada mais curta de escrever."],
    },
    pitfalls: {
      en: ["Priorities must come from a good random source; a predictable one lets an adversary build a chain.", "Equal priorities break the heap invariant; use a wide range or break ties by key.", "The expected bound is over the randomness, not the input; there is no worst-case guarantee like AVL's."],
      pt: ["As prioridades precisam vir de uma boa fonte aleatória; uma previsível deixa um adversário montar uma cadeia.", "Prioridades iguais quebram a invariante do heap; use uma faixa larga ou desempate por chave.", "O limite esperado é sobre o sorteio, não sobre a entrada; não há garantia de pior caso como a da AVL."],
    },
    history: {
      en: "Cecilia Aragon and Raimund Seidel introduced treaps in 1989 as randomized search trees, with the observation that a random priority is all the balance information a tree needs. Jean Vuillemin's Cartesian trees from 1980 are the same structure with priorities given by position rather than chance.",
      pt: "Cecilia Aragon e Raimund Seidel introduziram os treaps em 1989 como árvores de busca aleatorizadas, com a observação de que uma prioridade aleatória é toda a informação de balanço de que uma árvore precisa. As árvores cartesianas de Jean Vuillemin, de 1980, são a mesma estrutura com prioridades dadas pela posição em vez do acaso.",
    },
    file: "treap",
    code: {
      ts: ["function insert(node: Node | null, key: number): Node {", "  if (node === null) return { key, priority: Math.random(), left: null, right: null };", "  if (key < node.key) {", "    node.left = insert(node.left, key);", "    if (node.left.priority > node.priority) return rotateRight(node);", "  } else {", "    node.right = insert(node.right, key);", "    if (node.right.priority > node.priority) return rotateLeft(node);", "  }", "  return node;", "}"],
      py: ["def insert(node, key):", "    if node is None: return Node(key, priority=random.random())", "    if key < node.key:", "        node.left = insert(node.left, key)", "        if node.left.priority > node.priority: return rotate_right(node)", "    else:", "        node.right = insert(node.right, key)", "        if node.right.priority > node.priority: return rotate_left(node)", "", "    return node", ""],
      java: ["static Node insert(Node node, int key) {", "  if (node == null) return new Node(key, random.nextDouble());", "  if (key < node.key) {", "    node.left = insert(node.left, key);", "    if (node.left.priority > node.priority) return rotateRight(node);", "  } else {", "    node.right = insert(node.right, key);", "    if (node.right.priority > node.priority) return rotateLeft(node);", "  }", "  return node;", "}"],
      cpp: ["Node* insert(Node* node, int key) {", "  if (node == nullptr) return new Node(key, randomPriority());", "  if (key < node->key) {", "    node->left = insert(node->left, key);", "    if (node->left->priority > node->priority) return rotateRight(node);", "  } else {", "    node->right = insert(node->right, key);", "    if (node->right->priority > node->priority) return rotateLeft(node);", "  }", "  return node;", "}"],
      c: ["Node *insert(Node *node, int key) {", "  if (node == NULL) return new_node(key, rand());", "  if (key < node->key) {", "    node->left = insert(node->left, key);", "    if (node->left->priority > node->priority) return rotate_right(node);", "  } else {", "    node->right = insert(node->right, key);", "    if (node->right->priority > node->priority) return rotate_left(node);", "  }", "  return node;", "}"],
      go: ["func insert(node *Node, key int) *Node {", "\tif node == nil { return &Node{Key: key, Priority: rand.Float64()} }", "\tif key < node.Key {", "\t\tnode.Left = insert(node.Left, key)", "\t\tif node.Left.Priority > node.Priority { return rotateRight(node) }", "\t} else {", "\t\tnode.Right = insert(node.Right, key)", "\t\tif node.Right.Priority > node.Priority { return rotateLeft(node) }", "\t}", "\treturn node", "}"],
      rs: ["fn insert(node: Option<Box<Node>>, key: i32) -> Box<Node> {", "    let Some(mut node) = node else { return Box::new(Node::new(key, rand::random())) };", "    if key < node.key {", "        node.left = Some(insert(node.left.take(), key));", "        if node.left.as_ref().unwrap().priority > node.priority { return rotate_right(node); }", "    } else {", "        node.right = Some(insert(node.right.take(), key));", "        if node.right.as_ref().unwrap().priority > node.priority { return rotate_left(node); }", "    }", "    node", "}"],
    },
    pseudo: {
      en: ["INSERT(node, key)", "  if node is null: return a new node with key and a random priority", "  insert into the left or right subtree by key, as in a BST", "  if that child's priority is now larger than node's: rotate it up (right rotation for the left child, left for the right)", "  return the root of this subtree"],
      pt: ["INSERIR(nó, chave)", "  se nó é nulo: retorna um nó novo com a chave e uma prioridade aleatória", "  insere na subárvore esquerda ou direita pela chave, como numa BST", "  se a prioridade desse filho agora é maior que a do nó: rotaciona para cima (rotação à direita para o filho esquerdo, à esquerda para o direito)", "  retorna a raiz desta subárvore"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
