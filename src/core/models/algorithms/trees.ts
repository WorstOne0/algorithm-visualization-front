// Models
import type { Localized } from "../translations";
import type { VizKey } from "../viz";
import type { AlgorithmSpec, KpiSpec } from "./spec";

const SIZE = { sizeLabel: { en: "Keys", pt: "Chaves" }, minN: 6, maxN: 20, stepN: 2, defaultN: 12, shuffleLabel: { en: "New keys", pt: "Novas chaves" }, stepMs: 480 } as const;

const LEGEND_INSERT: [VizKey, Localized][] = [["act", { en: "comparing", pt: "comparando" }], ["primary", { en: "path", pt: "caminho" }], ["violet", { en: "new node", pt: "nó novo" }], ["amber", { en: "rotating", pt: "rotacionando" }]];

const KPI_NODES: KpiSpec = { key: "nodes", unitKey: "nodesUnit", label: { en: "NODES", pt: "NÓS" }, sub: { en: "in the tree", pt: "na árvore" } };
const KPI_HEIGHT: KpiSpec = { key: "height", label: { en: "HEIGHT", pt: "ALTURA" }, sub: { en: "levels, root included", pt: "níveis, raiz incluída" } };
const KPI_COMPARISONS: KpiSpec = { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "key against key", pt: "chave contra chave" } };
const KPI_ROTATIONS: KpiSpec = { key: "rotations", label: { en: "ROTATIONS", pt: "ROTAÇÕES" }, sub: { en: "so far", pt: "até aqui" } };

const CHART_HEIGHT: [string, number, boolean?][] = [["bst, random", 60], ["bst, sorted", 1000000], ["avl", 29], ["red-black", 40], ["b-tree, order 128", 3]];
const CHART_HEIGHT_TITLE = { en: "WORST HEIGHT · 1 000 000 KEYS", pt: "PIOR ALTURA · 1.000.000 DE CHAVES" };
const CHART_HEIGHT_NOTE = { en: "a lookup costs one comparison per level", pt: "uma busca custa uma comparação por nível" };

const selfIn = (chart: [string, number, boolean?][], label: string): [string, number, boolean?][] => chart.map(([name, value]) => (name === label ? [name, value, true] : [name, value]));

export const TREES = {
  bst: {
    ...SIZE,
    family: "trees",
    slug: "binary-search-tree",
    kind: "tree",
    name: "Binary search tree",
    subtitle: { en: "insert, search and delete", pt: "inserir, buscar e remover" },
    tagline: { en: "BST · smaller keys left, larger keys right, all the way down", pt: "BST · chaves menores à esquerda, maiores à direita, até o fim" },
    legend: [["act", { en: "comparing", pt: "comparando" }], ["primary", { en: "path", pt: "caminho" }], ["violet", { en: "new · successor", pt: "novo · sucessor" }], ["amber", { en: "being removed", pt: "sendo removido" }]],
    kpis: [KPI_NODES, KPI_COMPARISONS, KPI_HEIGHT, { key: "op", label: { en: "OPERATION", pt: "OPERAÇÃO" }, sub: { en: "running now", pt: "em execução" } }, { key: "key", label: { en: "KEY", pt: "CHAVE" }, sub: { en: "being handled", pt: "em questão" } }],
    idea: {
      en: [
        "A binary search tree keeps one rule at every node: everything in the left subtree is smaller, everything in the right subtree is larger. Insert and search both walk down from the root, turning left or right after one comparison per level, so the cost of every operation is the height of the tree.",
        "Delete has three cases. A leaf is simply unlinked; a node with one child is replaced by that child; a node with two children takes the key of its in-order successor, the smallest key in its right subtree, and that successor, which has at most one child, is removed instead.",
      ],
      pt: [
        "Uma árvore binária de busca mantém uma regra em todo nó: tudo na subárvore esquerda é menor, tudo na direita é maior. Inserir e buscar descem da raiz virando à esquerda ou à direita após uma comparação por nível, então o custo de toda operação é a altura da árvore.",
        "Remover tem três casos. Uma folha é simplesmente desligada; um nó com um filho é substituído por ele; um nó com dois filhos recebe a chave do seu sucessor em ordem, a menor chave da subárvore direita, e esse sucessor, que tem no máximo um filho, é removido no lugar.",
      ],
    },
    stages: [
      ["act", { en: "compare", pt: "compara" }, { en: "key against the current node", pt: "chave contra o nó atual" }],
      ["primary", { en: "descend", pt: "desce" }, { en: "left if smaller, right otherwise", pt: "esquerda se menor, direita senão" }],
      ["violet", { en: "attach", pt: "pendura" }, { en: "an empty spot takes the new key", pt: "uma vaga recebe a chave nova" }],
      ["amber", { en: "unlink", pt: "desliga" }, { en: "leaf, one child, or successor swap", pt: "folha, um filho, ou troca com o sucessor" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(log n)", "green", { en: "balanced by luck", pt: "balanceada por sorte" }],
      [{ en: "average", pt: "médio" }, "O(log n)", "green", { en: "random keys: about 2 log₂ n deep", pt: "chaves aleatórias: cerca de 2 log₂ n de profundidade" }],
      [{ en: "worst", pt: "pior" }, "O(n)", "neg", { en: "sorted input makes a linked list", pt: "entrada ordenada vira uma lista ligada" }],
      [{ en: "space", pt: "espaço" }, "O(n)", "text", { en: "one node per key", pt: "um nó por chave" }],
    ],
    chartTitle: CHART_HEIGHT_TITLE,
    chart: selfIn(CHART_HEIGHT, "bst, random"),
    chartNote: CHART_HEIGHT_NOTE,
    when: {
      en: ["Ordered data with random arrivals: in-order traversal gives the keys sorted, predecessor and successor are cheap.", "Teaching and prototypes; in production reach for a balanced variant or a hash map."],
      pt: ["Dados ordenados com chegadas aleatórias: o percurso em ordem dá as chaves ordenadas, antecessor e sucessor saem baratos.", "Ensino e protótipos; em produção use uma variante balanceada ou um mapa hash."],
    },
    pitfalls: {
      en: ["Sorted or nearly sorted input degrades it to O(n) per operation. AVL and red-black trees fix that.", "Deleting with the predecessor on one call and the successor on the next keeps the tree more even; always using one side skews it.", "Duplicates need a rule (go right, or count them) or search becomes ambiguous."],
      pt: ["Entrada ordenada ou quase ordenada degrada para O(n) por operação. AVL e rubro-negra resolvem isso.", "Remover com o antecessor numa chamada e o sucessor na seguinte mantém a árvore mais equilibrada; usar sempre um lado a entorta.", "Duplicatas precisam de uma regra (vai à direita, ou conta) ou a busca fica ambígua."],
    },
    history: {
      en: "Binary search trees appeared independently in several places around 1960; Windley, Booth and Colin, and Hibbard each published versions. Hibbard's 1962 paper gave the deletion algorithm shown here and the first analysis of random trees, showing the expected depth is logarithmic.",
      pt: "Árvores binárias de busca surgiram independentemente em vários lugares por volta de 1960; Windley, Booth e Colin, e Hibbard publicaram versões. O artigo de Hibbard de 1962 deu o algoritmo de remoção mostrado aqui e a primeira análise de árvores aleatórias, mostrando que a profundidade esperada é logarítmica.",
    },
    file: "binary_search_tree",
    code: {
      ts: ["function insert(root: Node | null, key: number): Node {", "  if (root === null) return { key, left: null, right: null };", "  if (key < root.key) root.left = insert(root.left, key);", "  else root.right = insert(root.right, key);", "  return root;", "}", "function search(root: Node | null, key: number): Node | null {", "  if (root === null || root.key === key) return root;", "  return key < root.key ? search(root.left, key) : search(root.right, key);", "}", "function remove(root: Node | null, key: number): Node | null {", "  if (root === null) return null;", "  if (key < root.key) root.left = remove(root.left, key);", "  else if (key > root.key) root.right = remove(root.right, key);", "  else if (root.left === null) return root.right;", "  else if (root.right === null) return root.left;", "  else {", "    const successor = minimum(root.right);", "    root.key = successor.key;", "    root.right = remove(root.right, successor.key);", "  }", "  return root;", "}"],
      py: ["def insert(root, key):", "    if root is None: return Node(key)", "    if key < root.key: root.left = insert(root.left, key)", "    else: root.right = insert(root.right, key)", "    return root", "", "def search(root, key):", "    if root is None or root.key == key: return root", "    return search(root.left, key) if key < root.key else search(root.right, key)", "", "def remove(root, key):", "    if root is None: return None", "    if key < root.key: root.left = remove(root.left, key)", "    elif key > root.key: root.right = remove(root.right, key)", "    elif root.left is None: return root.right", "    elif root.right is None: return root.left", "    else:", "        successor = minimum(root.right)", "        root.key = successor.key", "        root.right = remove(root.right, successor.key)", "", "    return root", ""],
      java: ["static Node insert(Node root, int key) {", "  if (root == null) return new Node(key);", "  if (key < root.key) root.left = insert(root.left, key);", "  else root.right = insert(root.right, key);", "  return root;", "}", "static Node search(Node root, int key) {", "  if (root == null || root.key == key) return root;", "  return key < root.key ? search(root.left, key) : search(root.right, key);", "}", "static Node remove(Node root, int key) {", "  if (root == null) return null;", "  if (key < root.key) root.left = remove(root.left, key);", "  else if (key > root.key) root.right = remove(root.right, key);", "  else if (root.left == null) return root.right;", "  else if (root.right == null) return root.left;", "  else {", "    Node successor = minimum(root.right);", "    root.key = successor.key;", "    root.right = remove(root.right, successor.key);", "  }", "  return root;", "}"],
      cpp: ["Node* insert(Node* root, int key) {", "  if (root == nullptr) return new Node(key);", "  if (key < root->key) root->left = insert(root->left, key);", "  else root->right = insert(root->right, key);", "  return root;", "}", "Node* search(Node* root, int key) {", "  if (root == nullptr || root->key == key) return root;", "  return key < root->key ? search(root->left, key) : search(root->right, key);", "}", "Node* remove(Node* root, int key) {", "  if (root == nullptr) return nullptr;", "  if (key < root->key) root->left = remove(root->left, key);", "  else if (key > root->key) root->right = remove(root->right, key);", "  else if (root->left == nullptr) return root->right;", "  else if (root->right == nullptr) return root->left;", "  else {", "    Node* successor = minimum(root->right);", "    root->key = successor->key;", "    root->right = remove(root->right, successor->key);", "  }", "  return root;", "}"],
      c: ["Node *insert(Node *root, int key) {", "  if (root == NULL) return new_node(key);", "  if (key < root->key) root->left = insert(root->left, key);", "  else root->right = insert(root->right, key);", "  return root;", "}", "Node *search(Node *root, int key) {", "  if (root == NULL || root->key == key) return root;", "  return key < root->key ? search(root->left, key) : search(root->right, key);", "}", "Node *remove(Node *root, int key) {", "  if (root == NULL) return NULL;", "  if (key < root->key) root->left = remove(root->left, key);", "  else if (key > root->key) root->right = remove(root->right, key);", "  else if (root->left == NULL) return root->right;", "  else if (root->right == NULL) return root->left;", "  else {", "    Node *successor = minimum(root->right);", "    root->key = successor->key;", "    root->right = remove(root->right, successor->key);", "  }", "  return root;", "}"],
      go: ["func insert(root *Node, key int) *Node {", "\tif root == nil { return &Node{Key: key} }", "\tif key < root.Key { root.Left = insert(root.Left, key)", "\t} else { root.Right = insert(root.Right, key) }", "\treturn root", "}", "func search(root *Node, key int) *Node {", "\tif root == nil || root.Key == key { return root }", "\tif key < root.Key { return search(root.Left, key) }; return search(root.Right, key)", "}", "func remove(root *Node, key int) *Node {", "\tif root == nil { return nil }", "\tif key < root.Key { root.Left = remove(root.Left, key)", "\t} else if key > root.Key { root.Right = remove(root.Right, key)", "\t} else if root.Left == nil { return root.Right", "\t} else if root.Right == nil { return root.Left", "\t} else {", "\t\tsuccessor := minimum(root.Right)", "\t\troot.Key = successor.Key", "\t\troot.Right = remove(root.Right, successor.Key)", "\t}", "\treturn root", "}"],
      rs: ["fn insert(root: Option<Box<Node>>, key: i32) -> Box<Node> {", "    let Some(mut root) = root else { return Box::new(Node::new(key)) };", "    if key < root.key { root.left = Some(insert(root.left.take(), key)); }", "    else { root.right = Some(insert(root.right.take(), key)); }", "    root", "}", "fn search(root: &Option<Box<Node>>, key: i32) -> Option<&Node> {", "    let node = root.as_deref()?; if node.key == key { return Some(node); }", "    if key < node.key { search(&node.left, key) } else { search(&node.right, key) }", "}", "fn remove(root: Option<Box<Node>>, key: i32) -> Option<Box<Node>> {", "    let Some(mut root) = root else { return None };", "    if key < root.key { root.left = remove(root.left.take(), key); }", "    else if key > root.key { root.right = remove(root.right.take(), key); }", "    else if root.left.is_none() { return root.right.take(); }", "    else if root.right.is_none() { return root.left.take(); }", "    else {", "        let successor = minimum(root.right.as_deref().unwrap()).key;", "        root.key = successor;", "        root.right = remove(root.right.take(), successor);", "    }", "    Some(root)", "}"],
    },
    pseudo: {
      en: ["INSERT(node, key)", "  if node is null: return a new leaf with key", "  if key < node.key: node.left ← INSERT(node.left, key) else node.right ← INSERT(node.right, key)", "REMOVE(node, key)", "  descend to the node holding key", "  no left child: replace it by its right child (also covers a leaf)", "  no right child: replace it by its left child", "  two children: copy the successor's key into it, then REMOVE the successor from the right subtree"],
      pt: ["INSERIR(nó, chave)", "  se nó é nulo: retorna uma folha nova com a chave", "  se chave < nó.chave: nó.esq ← INSERIR(nó.esq, chave) senão nó.dir ← INSERIR(nó.dir, chave)", "REMOVER(nó, chave)", "  desce até o nó que guarda a chave", "  sem filho esquerdo: substitui pelo filho direito (cobre também a folha)", "  sem filho direito: substitui pelo filho esquerdo", "  dois filhos: copia a chave do sucessor nele, depois REMOVE o sucessor da subárvore direita"],
    },
  },

  traversals: {
    ...SIZE,
    defaultN: 10,
    maxN: 16,
    family: "trees",
    slug: "traversals",
    kind: "tree",
    name: "Traversals",
    subtitle: { en: "in-order, pre-order, post-order, level-order", pt: "em ordem, pré-ordem, pós-ordem, por nível" },
    tagline: { en: "traversals · four ways to read the same tree", pt: "percursos · quatro jeitos de ler a mesma árvore" },
    legend: [["act", { en: "visiting", pt: "visitando" }], ["primary", { en: "entered, not yet visited", pt: "entrado, ainda não visitado" }], ["green", { en: "visited", pt: "visitado" }], ["def", { en: "untouched", pt: "intocado" }]],
    kpis: [
      { key: "visited", unitKey: "visitedUnit", label: { en: "VISITED", pt: "VISITADOS" }, sub: { en: "nodes in the output", pt: "nós na saída" } },
      { key: "traversal", label: { en: "TRAVERSAL", pt: "PERCURSO" }, sub: { en: "running now", pt: "em execução" } },
      { key: "depth", label: { en: "DEPTH", pt: "PROFUNDIDADE" }, sub: { en: "of the current node", pt: "do nó atual" } },
      { key: "phase", label: { en: "PHASE", pt: "FASE" }, sub: { en: "of the four traversals", pt: "dos quatro percursos" } },
      { key: "output", label: { en: "OUTPUT", pt: "SAÍDA" }, sub: { en: "so far", pt: "até aqui" } },
    ],
    idea: {
      en: [
        "A traversal visits every node once; the order in which a node is visited relative to its subtrees is what changes. In-order visits the left subtree, the node, then the right subtree, which on a binary search tree yields the keys sorted. Pre-order visits the node first, which is the order that lets you rebuild the tree. Post-order visits children before the parent, the order for freeing memory or evaluating an expression tree.",
        "The three recursive traversals differ only in where the visit line sits. Level-order is different in kind: it uses a queue instead of the call stack, and reads the tree one depth at a time, which is breadth-first search applied to a tree.",
      ],
      pt: [
        "Um percurso visita cada nó uma vez; o que muda é a ordem em que um nó é visitado em relação às suas subárvores. Em ordem visita a subárvore esquerda, o nó, depois a direita, o que numa árvore de busca dá as chaves ordenadas. Pré-ordem visita o nó primeiro, a ordem que permite reconstruir a árvore. Pós-ordem visita os filhos antes do pai, a ordem para liberar memória ou avaliar uma árvore de expressão.",
        "Os três percursos recursivos diferem só em onde fica a linha da visita. Por nível é de outra natureza: usa uma fila em vez da pilha de chamadas e lê a árvore uma profundidade por vez, que é a busca em largura aplicada a uma árvore.",
      ],
    },
    stages: [
      ["primary", { en: "enter", pt: "entra" }, { en: "a node, before its subtrees", pt: "um nó, antes das subárvores" }],
      ["act", { en: "visit", pt: "visita" }, { en: "append the key to the output", pt: "anexa a chave à saída" }],
      ["green", { en: "return", pt: "retorna" }, { en: "back to the parent when done", pt: "volta ao pai quando termina" }],
      ["violet", { en: "queue", pt: "fila" }, { en: "level-order only: children wait in line", pt: "só por nível: os filhos esperam na fila" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n)", "green", { en: "every node exactly once", pt: "cada nó exatamente uma vez" }],
      [{ en: "average", pt: "médio" }, "O(n)", "green", { en: "the shape of the tree does not matter", pt: "o formato da árvore não importa" }],
      [{ en: "worst", pt: "pior" }, "O(n)", "green", { en: "same: linear in the number of nodes", pt: "igual: linear no número de nós" }],
      [{ en: "space", pt: "espaço" }, "O(h) · O(w)", "text", { en: "stack depth h, or the widest level w for level-order", pt: "pilha de profundidade h, ou o nível mais largo w por nível" }],
    ],
    chartTitle: { en: "PEAK EXTRA MEMORY · 1 000 000 NODES, BALANCED", pt: "PICO DE MEMÓRIA EXTRA · 1.000.000 DE NÓS, BALANCEADA" },
    chart: [["in-order", 20, true], ["pre-order", 20], ["post-order", 20], ["level-order", 500000], ["morris in-order", 1]],
    chartNote: { en: "recursive traversals hold one frame per level; level-order holds half the tree in its queue", pt: "percursos recursivos guardam um quadro por nível; por nível guarda metade da árvore na fila" },
    when: {
      en: ["In-order for sorted output and range queries; pre-order to serialise or copy a tree; post-order to delete it or fold an expression.", "Level-order for anything by depth: printing the tree, finding the shallowest match, computing width."],
      pt: ["Em ordem para saída ordenada e consultas por faixa; pré-ordem para serializar ou copiar uma árvore; pós-ordem para apagá-la ou reduzir uma expressão.", "Por nível para qualquer coisa por profundidade: imprimir a árvore, achar o casamento mais raso, calcular a largura."],
    },
    pitfalls: {
      en: ["Recursion depth equals the height: a degenerate tree with a million nodes overflows the stack. Use an explicit stack.", "Level-order on a wide tree needs a queue as big as its widest level.", "Pre-order alone does not identify a tree; with in-order it does, or with null markers."],
      pt: ["A profundidade da recursão é a altura: uma árvore degenerada com um milhão de nós estoura a pilha. Use uma pilha explícita.", "Por nível numa árvore larga precisa de uma fila do tamanho do nível mais largo.", "Pré-ordem sozinha não identifica uma árvore; com em ordem identifica, ou com marcadores de nulo."],
    },
    history: {
      en: "The names pre-order, in-order and post-order were fixed by Knuth in the first volume of The Art of Computer Programming in 1968, where he also traced threaded trees back to Perlis and Thornton in 1960. Morris showed in 1979 that in-order can run in constant extra space by temporarily rewiring right pointers.",
      pt: "Os nomes pré-ordem, em ordem e pós-ordem foram fixados por Knuth no primeiro volume de The Art of Computer Programming em 1968, onde ele também remonta as árvores encadeadas a Perlis e Thornton em 1960. Morris mostrou em 1979 que em ordem pode rodar com espaço extra constante religando temporariamente os ponteiros direitos.",
    },
    file: "traversals",
    code: {
      ts: ["function inorder(node: Node | null, output: number[]) {", "  if (node === null) return;", "  inorder(node.left, output);", "  output.push(node.key);", "  inorder(node.right, output);", "}", "function preorder(node: Node | null, output: number[]) {", "  if (node === null) return;", "  output.push(node.key);", "  preorder(node.left, output);", "  preorder(node.right, output);", "}", "function postorder(node: Node | null, output: number[]) {", "  if (node === null) return;", "  postorder(node.left, output);", "  postorder(node.right, output);", "  output.push(node.key);", "}", "function levelorder(root: Node | null, output: number[]) {", "  const queue = root ? [root] : [];", "  while (queue.length > 0) {", "    const node = queue.shift()!;", "    output.push(node.key);", "    if (node.left) queue.push(node.left);", "    if (node.right) queue.push(node.right);", "  }", "}"],
      py: ["def inorder(node, output):", "    if node is None: return", "    inorder(node.left, output)", "    output.append(node.key)", "    inorder(node.right, output)", "", "def preorder(node, output):", "    if node is None: return", "    output.append(node.key)", "    preorder(node.left, output)", "    preorder(node.right, output)", "", "def postorder(node, output):", "    if node is None: return", "    postorder(node.left, output)", "    postorder(node.right, output)", "    output.append(node.key)", "", "def levelorder(root, output):", "    queue = deque([root]) if root else deque()", "    while queue:", "        node = queue.popleft()", "        output.append(node.key)", "        if node.left: queue.append(node.left)", "        if node.right: queue.append(node.right)", "", ""],
      java: ["static void inorder(Node node, List<Integer> output) {", "  if (node == null) return;", "  inorder(node.left, output);", "  output.add(node.key);", "  inorder(node.right, output);", "}", "static void preorder(Node node, List<Integer> output) {", "  if (node == null) return;", "  output.add(node.key);", "  preorder(node.left, output);", "  preorder(node.right, output);", "}", "static void postorder(Node node, List<Integer> output) {", "  if (node == null) return;", "  postorder(node.left, output);", "  postorder(node.right, output);", "  output.add(node.key);", "}", "static void levelorder(Node root, List<Integer> output) {", "  Deque<Node> queue = new ArrayDeque<>(); if (root != null) queue.add(root);", "  while (!queue.isEmpty()) {", "    Node node = queue.poll();", "    output.add(node.key);", "    if (node.left != null) queue.add(node.left);", "    if (node.right != null) queue.add(node.right);", "  }", "}"],
      cpp: ["void inorder(Node* node, std::vector<int>& output) {", "  if (node == nullptr) return;", "  inorder(node->left, output);", "  output.push_back(node->key);", "  inorder(node->right, output);", "}", "void preorder(Node* node, std::vector<int>& output) {", "  if (node == nullptr) return;", "  output.push_back(node->key);", "  preorder(node->left, output);", "  preorder(node->right, output);", "}", "void postorder(Node* node, std::vector<int>& output) {", "  if (node == nullptr) return;", "  postorder(node->left, output);", "  postorder(node->right, output);", "  output.push_back(node->key);", "}", "void levelorder(Node* root, std::vector<int>& output) {", "  std::queue<Node*> queue; if (root) queue.push(root);", "  while (!queue.empty()) {", "    Node* node = queue.front(); queue.pop();", "    output.push_back(node->key);", "    if (node->left) queue.push(node->left);", "    if (node->right) queue.push(node->right);", "  }", "}"],
      c: ["void inorder(Node *node, IntList *output) {", "  if (node == NULL) return;", "  inorder(node->left, output);", "  list_push(output, node->key);", "  inorder(node->right, output);", "}", "void preorder(Node *node, IntList *output) {", "  if (node == NULL) return;", "  list_push(output, node->key);", "  preorder(node->left, output);", "  preorder(node->right, output);", "}", "void postorder(Node *node, IntList *output) {", "  if (node == NULL) return;", "  postorder(node->left, output);", "  postorder(node->right, output);", "  list_push(output, node->key);", "}", "void levelorder(Node *root, IntList *output) {", "  Queue queue = queue_new(); if (root) queue_push(&queue, root);", "  while (queue.size > 0) {", "    Node *node = queue_pop(&queue);", "    list_push(output, node->key);", "    if (node->left) queue_push(&queue, node->left);", "    if (node->right) queue_push(&queue, node->right);", "  }", "}"],
      go: ["func inorder(node *Node, output *[]int) {", "\tif node == nil { return }", "\tinorder(node.Left, output)", "\t*output = append(*output, node.Key)", "\tinorder(node.Right, output)", "}", "func preorder(node *Node, output *[]int) {", "\tif node == nil { return }", "\t*output = append(*output, node.Key)", "\tpreorder(node.Left, output)", "\tpreorder(node.Right, output)", "}", "func postorder(node *Node, output *[]int) {", "\tif node == nil { return }", "\tpostorder(node.Left, output)", "\tpostorder(node.Right, output)", "\t*output = append(*output, node.Key)", "}", "func levelorder(root *Node, output *[]int) {", "\tqueue := []*Node{}; if root != nil { queue = append(queue, root) }", "\tfor len(queue) > 0 {", "\t\tnode := queue[0]; queue = queue[1:]", "\t\t*output = append(*output, node.Key)", "\t\tif node.Left != nil { queue = append(queue, node.Left) }", "\t\tif node.Right != nil { queue = append(queue, node.Right) }", "\t}", "}"],
      rs: ["fn inorder(node: &Option<Box<Node>>, output: &mut Vec<i32>) {", "    let Some(node) = node else { return };", "    inorder(&node.left, output);", "    output.push(node.key);", "    inorder(&node.right, output);", "}", "fn preorder(node: &Option<Box<Node>>, output: &mut Vec<i32>) {", "    let Some(node) = node else { return };", "    output.push(node.key);", "    preorder(&node.left, output);", "    preorder(&node.right, output);", "}", "fn postorder(node: &Option<Box<Node>>, output: &mut Vec<i32>) {", "    let Some(node) = node else { return };", "    postorder(&node.left, output);", "    postorder(&node.right, output);", "    output.push(node.key);", "}", "fn levelorder(root: &Option<Box<Node>>, output: &mut Vec<i32>) {", "    let mut queue: VecDeque<&Node> = root.as_deref().into_iter().collect();", "    while let Some(node) = queue.pop_front() {", "        // node is the oldest entry of the queue", "        output.push(node.key);", "        if let Some(left) = &node.left { queue.push_back(left); }", "        if let Some(right) = &node.right { queue.push_back(right); }", "    }", "}"],
    },
    pseudo: {
      en: ["INORDER(node): if node ≠ null: INORDER(left); visit(node); INORDER(right)", "PREORDER(node): if node ≠ null: visit(node); PREORDER(left); PREORDER(right)", "POSTORDER(node): if node ≠ null: POSTORDER(left); POSTORDER(right); visit(node)", "LEVELORDER(root)", "  queue ← [root]", "  while queue not empty", "    node ← dequeue; visit(node); enqueue its children"],
      pt: ["EMORDEM(nó): se nó ≠ nulo: EMORDEM(esq); visita(nó); EMORDEM(dir)", "PRÉORDEM(nó): se nó ≠ nulo: visita(nó); PRÉORDEM(esq); PRÉORDEM(dir)", "PÓSORDEM(nó): se nó ≠ nulo: PÓSORDEM(esq); PÓSORDEM(dir); visita(nó)", "PORNÍVEL(raiz)", "  fila ← [raiz]", "  enquanto fila não vazia", "    nó ← desenfileira; visita(nó); enfileira seus filhos"],
    },
  },

  avl: {
    ...SIZE,
    family: "trees",
    slug: "avl-tree",
    kind: "tree",
    name: "AVL tree",
    subtitle: { en: "self-balancing · the four rotations", pt: "autobalanceada · as quatro rotações" },
    tagline: { en: "AVL · heights may differ by one, never by two", pt: "AVL · alturas podem diferir em um, nunca em dois" },
    legend: LEGEND_INSERT,
    kpis: [KPI_NODES, KPI_ROTATIONS, KPI_HEIGHT, { key: "balance", label: { en: "BALANCE", pt: "BALANÇO" }, sub: { en: "left height − right height", pt: "altura esq − altura dir" } }, KPI_COMPARISONS],
    idea: {
      en: [
        "An AVL tree is a binary search tree that stores the height of every node and keeps the balance factor, left height minus right height, within −1, 0 or +1. Insertion walks down like a plain BST, then on the way back up recomputes heights; the first node whose balance reaches ±2 is rebalanced by a rotation.",
        "There are four cases. Left-left and right-right take a single rotation: the heavy child comes up and the node drops to the other side. Left-right and right-left first rotate the child to turn the case into a single one, then rotate the node. The label under each node is its balance factor.",
      ],
      pt: [
        "Uma árvore AVL é uma árvore binária de busca que guarda a altura de cada nó e mantém o fator de balanço, altura esquerda menos direita, em −1, 0 ou +1. A inserção desce como numa BST comum e, na volta, recalcula alturas; o primeiro nó cujo balanço chega a ±2 é rebalanceado por uma rotação.",
        "São quatro casos. Esquerda-esquerda e direita-direita levam uma rotação só: o filho pesado sobe e o nó desce para o outro lado. Esquerda-direita e direita-esquerda primeiro rotacionam o filho para virar um caso simples, depois rotacionam o nó. O rótulo sob cada nó é seu fator de balanço.",
      ],
    },
    stages: [
      ["act", { en: "descend", pt: "desce" }, { en: "like a plain BST insert", pt: "como uma inserção de BST comum" }],
      ["primary", { en: "update", pt: "atualiza" }, { en: "height and balance on the way back up", pt: "altura e balanço no caminho de volta" }],
      ["amber", { en: "rotate", pt: "rotaciona" }, { en: "balance ±2: single or double rotation", pt: "balanço ±2: rotação simples ou dupla" }],
      ["green", { en: "settle", pt: "assenta" }, { en: "at most one rebalance per insertion", pt: "no máximo um rebalanceamento por inserção" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(log n)", "green", { en: "height ≤ 1.44 log₂ n", pt: "altura ≤ 1,44 log₂ n" }],
      [{ en: "average", pt: "médio" }, "O(log n)", "green", { en: "search, insert and delete alike", pt: "busca, inserção e remoção igual" }],
      [{ en: "worst", pt: "pior" }, "O(log n)", "green", { en: "guaranteed, whatever the input order", pt: "garantido, seja qual for a ordem de entrada" }],
      [{ en: "space", pt: "espaço" }, "O(n)", "text", { en: "one height per node", pt: "uma altura por nó" }],
    ],
    chartTitle: CHART_HEIGHT_TITLE,
    chart: selfIn(CHART_HEIGHT, "avl"),
    chartNote: CHART_HEIGHT_NOTE,
    when: {
      en: ["Lookup-heavy ordered sets: the strict balance makes AVL the shallowest of the binary trees.", "In-memory indexes where the input order is adversarial, such as sorted batches."],
      pt: ["Conjuntos ordenados com muita busca: o balanço estrito faz da AVL a mais rasa das árvores binárias.", "Índices em memória em que a ordem de entrada é adversarial, como lotes ordenados."],
    },
    pitfalls: {
      en: ["Deletion can need a rotation at every level on the way up, unlike insertion.", "Storing heights as full integers wastes space; the balance factor fits in two bits.", "Rotations must fix parent pointers too if the nodes carry them; a missed link corrupts the tree silently."],
      pt: ["Remoção pode precisar de uma rotação em cada nível na subida, diferente da inserção.", "Guardar alturas como inteiros inteiros desperdiça espaço; o fator de balanço cabe em dois bits.", "Rotações precisam consertar ponteiros de pai também se os nós os tiverem; um elo esquecido corrompe a árvore em silêncio."],
    },
    history: {
      en: "Georgy Adelson-Velsky and Evgenii Landis published the tree in 1962; it was the first self-balancing search tree and takes its name from their initials. Knuth called it one of the most elegant data structures known, and it remains the reference against which red-black trees and B-trees are compared.",
      pt: "Georgy Adelson-Velsky e Evgenii Landis publicaram a árvore em 1962; foi a primeira árvore de busca autobalanceada e leva o nome das iniciais deles. Knuth a chamou de uma das estruturas de dados mais elegantes conhecidas, e ela continua a referência contra a qual rubro-negras e B-trees são comparadas.",
    },
    file: "avl_tree",
    code: {
      ts: ["function insert(node: Node | null, key: number): Node {", "  if (node === null) return { key, left: null, right: null, height: 1 };", "  if (key < node.key) node.left = insert(node.left, key);", "  else node.right = insert(node.right, key);", "  node.height = 1 + Math.max(height(node.left), height(node.right));", "  const balance = height(node.left) - height(node.right);", "  if (balance > 1 && key < node.left!.key) return rotateRight(node);", "  if (balance < -1 && key > node.right!.key) return rotateLeft(node);", "  if (balance > 1) { node.left = rotateLeft(node.left!); return rotateRight(node); }", "  if (balance < -1) { node.right = rotateRight(node.right!); return rotateLeft(node); }", "  return node;", "}", "function rotateRight(node: Node): Node {", "  const pivot = node.left!;", "  node.left = pivot.right;", "  pivot.right = node;", "  update(node); update(pivot);", "  return pivot;", "}"],
      py: ["def insert(node, key):", "    if node is None: return Node(key, height=1)", "    if key < node.key: node.left = insert(node.left, key)", "    else: node.right = insert(node.right, key)", "    node.height = 1 + max(height(node.left), height(node.right))", "    balance = height(node.left) - height(node.right)", "    if balance > 1 and key < node.left.key: return rotate_right(node)", "    if balance < -1 and key > node.right.key: return rotate_left(node)", "    if balance > 1: node.left = rotate_left(node.left); return rotate_right(node)", "    if balance < -1: node.right = rotate_right(node.right); return rotate_left(node)", "    return node", "", "def rotate_right(node):", "    pivot = node.left", "    node.left = pivot.right", "    pivot.right = node", "    update(node); update(pivot)", "    return pivot", ""],
      java: ["static Node insert(Node node, int key) {", "  if (node == null) return new Node(key);", "  if (key < node.key) node.left = insert(node.left, key);", "  else node.right = insert(node.right, key);", "  node.height = 1 + Math.max(height(node.left), height(node.right));", "  int balance = height(node.left) - height(node.right);", "  if (balance > 1 && key < node.left.key) return rotateRight(node);", "  if (balance < -1 && key > node.right.key) return rotateLeft(node);", "  if (balance > 1) { node.left = rotateLeft(node.left); return rotateRight(node); }", "  if (balance < -1) { node.right = rotateRight(node.right); return rotateLeft(node); }", "  return node;", "}", "static Node rotateRight(Node node) {", "  Node pivot = node.left;", "  node.left = pivot.right;", "  pivot.right = node;", "  update(node); update(pivot);", "  return pivot;", "}"],
      cpp: ["Node* insert(Node* node, int key) {", "  if (node == nullptr) return new Node(key);", "  if (key < node->key) node->left = insert(node->left, key);", "  else node->right = insert(node->right, key);", "  node->height = 1 + std::max(height(node->left), height(node->right));", "  int balance = height(node->left) - height(node->right);", "  if (balance > 1 && key < node->left->key) return rotateRight(node);", "  if (balance < -1 && key > node->right->key) return rotateLeft(node);", "  if (balance > 1) { node->left = rotateLeft(node->left); return rotateRight(node); }", "  if (balance < -1) { node->right = rotateRight(node->right); return rotateLeft(node); }", "  return node;", "}", "Node* rotateRight(Node* node) {", "  Node* pivot = node->left;", "  node->left = pivot->right;", "  pivot->right = node;", "  update(node); update(pivot);", "  return pivot;", "}"],
      c: ["Node *insert(Node *node, int key) {", "  if (node == NULL) return new_node(key);", "  if (key < node->key) node->left = insert(node->left, key);", "  else node->right = insert(node->right, key);", "  node->height = 1 + max(height(node->left), height(node->right));", "  int balance = height(node->left) - height(node->right);", "  if (balance > 1 && key < node->left->key) return rotate_right(node);", "  if (balance < -1 && key > node->right->key) return rotate_left(node);", "  if (balance > 1) { node->left = rotate_left(node->left); return rotate_right(node); }", "  if (balance < -1) { node->right = rotate_right(node->right); return rotate_left(node); }", "  return node;", "}", "Node *rotate_right(Node *node) {", "  Node *pivot = node->left;", "  node->left = pivot->right;", "  pivot->right = node;", "  update(node); update(pivot);", "  return pivot;", "}"],
      go: ["func insert(node *Node, key int) *Node {", "\tif node == nil { return &Node{Key: key, Height: 1} }", "\tif key < node.Key { node.Left = insert(node.Left, key)", "\t} else { node.Right = insert(node.Right, key) }", "\tnode.Height = 1 + max(height(node.Left), height(node.Right))", "\tbalance := height(node.Left) - height(node.Right)", "\tif balance > 1 && key < node.Left.Key { return rotateRight(node) }", "\tif balance < -1 && key > node.Right.Key { return rotateLeft(node) }", "\tif balance > 1 { node.Left = rotateLeft(node.Left); return rotateRight(node) }", "\tif balance < -1 { node.Right = rotateRight(node.Right); return rotateLeft(node) }", "\treturn node", "}", "func rotateRight(node *Node) *Node {", "\tpivot := node.Left", "\tnode.Left = pivot.Right", "\tpivot.Right = node", "\tupdate(node); update(pivot)", "\treturn pivot", "}"],
      rs: ["fn insert(node: Option<Box<Node>>, key: i32) -> Box<Node> {", "    let Some(mut node) = node else { return Box::new(Node::leaf(key)) };", "    if key < node.key { node.left = Some(insert(node.left.take(), key)); }", "    else { node.right = Some(insert(node.right.take(), key)); }", "    node.height = 1 + height(&node.left).max(height(&node.right));", "    let balance = height(&node.left) - height(&node.right);", "    if balance > 1 && key < node.left.as_ref().unwrap().key { return rotate_right(node); }", "    if balance < -1 && key > node.right.as_ref().unwrap().key { return rotate_left(node); }", "    if balance > 1 { node.left = Some(rotate_left(node.left.take().unwrap())); return rotate_right(node); }", "    if balance < -1 { node.right = Some(rotate_right(node.right.take().unwrap())); return rotate_left(node); }", "    node", "}", "fn rotate_right(mut node: Box<Node>) -> Box<Node> {", "    let mut pivot = node.left.take().unwrap();", "    node.left = pivot.right.take();", "    update(&mut node); pivot.right = Some(node);", "    update(&mut pivot);", "    pivot", "}"],
    },
    pseudo: {
      en: ["INSERT(node, key)", "  insert as in a BST, then on the way back up:", "  height(node) ← 1 + max(height(left), height(right)); balance ← height(left) − height(right)", "  if balance = +2 and the key went left-left: ROTATERIGHT(node)", "  if balance = −2 and the key went right-right: ROTATELEFT(node)", "  if balance = +2 (left-right): left ← ROTATELEFT(left); ROTATERIGHT(node)", "  if balance = −2 (right-left): right ← ROTATERIGHT(right); ROTATELEFT(node)"],
      pt: ["INSERIR(nó, chave)", "  insere como numa BST, depois no caminho de volta:", "  altura(nó) ← 1 + max(altura(esq), altura(dir)); balanço ← altura(esq) − altura(dir)", "  se balanço = +2 e a chave foi esquerda-esquerda: ROTACIONADIREITA(nó)", "  se balanço = −2 e a chave foi direita-direita: ROTACIONAESQUERDA(nó)", "  se balanço = +2 (esquerda-direita): esq ← ROTACIONAESQUERDA(esq); ROTACIONADIREITA(nó)", "  se balanço = −2 (direita-esquerda): dir ← ROTACIONADIREITA(dir); ROTACIONAESQUERDA(nó)"],
    },
  },

  redBlack: {
    ...SIZE,
    family: "trees",
    slug: "red-black-tree",
    kind: "tree",
    name: "Red-black tree",
    subtitle: { en: "self-balancing · recolour, then rotate", pt: "autobalanceada · recolore, depois rotaciona" },
    tagline: { en: "red-black · two colours, five rules, no path twice as long as another", pt: "rubro-negra · duas cores, cinco regras, nenhum caminho com o dobro de outro" },
    legend: [["neg", { en: "red node", pt: "nó vermelho" }], ["def", { en: "black node", pt: "nó preto" }], ["act", { en: "current", pt: "atual" }], ["amber", { en: "parent · uncle · grandparent", pt: "pai · tio · avô" }]],
    kpis: [KPI_NODES, { key: "recolors", label: { en: "RECOLOURS", pt: "RECOLORAÇÕES" }, sub: { en: "nodes repainted", pt: "nós repintados" } }, KPI_ROTATIONS, { key: "blackHeight", label: { en: "BLACK HEIGHT", pt: "ALTURA NEGRA" }, sub: { en: "black nodes root to leaf", pt: "nós pretos da raiz à folha" } }, KPI_HEIGHT],
    idea: {
      en: [
        "A red-black tree is a binary search tree where every node is red or black, the root is black, a red node never has a red child, and every path from the root to a leaf passes the same number of black nodes. Those rules force the longest path to be at most twice the shortest, so the height stays within 2 log₂ n.",
        "A new node is inserted as a red leaf, which keeps the black count intact but may put two reds in a row. The fix-up looks at the uncle: if it is red, recolour parent, uncle and grandparent and move the problem two levels up; if it is black, one or two rotations plus a recolour fix it for good. Insertion therefore costs at most two rotations.",
      ],
      pt: [
        "Uma árvore rubro-negra é uma árvore binária de busca em que todo nó é vermelho ou preto, a raiz é preta, um nó vermelho nunca tem filho vermelho, e todo caminho da raiz a uma folha passa pelo mesmo número de nós pretos. Essas regras forçam o caminho mais longo a ter no máximo o dobro do mais curto, então a altura fica dentro de 2 log₂ n.",
        "Um nó novo entra como folha vermelha, o que preserva a contagem de pretos mas pode pôr dois vermelhos seguidos. O conserto olha o tio: se é vermelho, recolore pai, tio e avô e sobe o problema dois níveis; se é preto, uma ou duas rotações mais uma recoloração resolvem de vez. A inserção custa portanto no máximo duas rotações.",
      ],
    },
    stages: [
      ["neg", { en: "insert red", pt: "insere vermelho" }, { en: "a red leaf keeps the black height", pt: "uma folha vermelha mantém a altura negra" }],
      ["amber", { en: "case 1", pt: "caso 1" }, { en: "red uncle: recolour, move up", pt: "tio vermelho: recolore, sobe" }],
      ["primary", { en: "case 2", pt: "caso 2" }, { en: "inner grandchild: rotate the parent", pt: "neto interno: rotaciona o pai" }],
      ["green", { en: "case 3", pt: "caso 3" }, { en: "recolour and rotate the grandparent", pt: "recolore e rotaciona o avô" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(log n)", "green", { en: "height ≤ 2 log₂(n + 1)", pt: "altura ≤ 2 log₂(n + 1)" }],
      [{ en: "average", pt: "médio" }, "O(log n)", "green", { en: "insert: O(1) rotations amortised", pt: "inserção: O(1) rotações amortizadas" }],
      [{ en: "worst", pt: "pior" }, "O(log n)", "green", { en: "guaranteed for every operation", pt: "garantido para toda operação" }],
      [{ en: "space", pt: "espaço" }, "O(n)", "text", { en: "one bit of colour per node", pt: "um bit de cor por nó" }],
    ],
    chartTitle: CHART_HEIGHT_TITLE,
    chart: selfIn(CHART_HEIGHT, "red-black"),
    chartNote: CHART_HEIGHT_NOTE,
    when: {
      en: ["General-purpose ordered maps and sets: C++ std::map, Java TreeMap, the Linux scheduler and memory maps all use it.", "Insert- and delete-heavy workloads, where its fewer rotations beat AVL's stricter balance."],
      pt: ["Mapas e conjuntos ordenados de uso geral: std::map do C++, TreeMap do Java, o escalonador e os mapas de memória do Linux usam.", "Cargas com muita inserção e remoção, em que suas rotações mais raras vencem o balanço mais estrito da AVL."],
    },
    pitfalls: {
      en: ["Deletion has more cases than insertion and is where most hand-written implementations break.", "Null leaves count as black; forgetting that breaks the uncle test at the edges.", "Left-leaning red-black trees are simpler to code but not the same structure; do not mix the two sets of rules."],
      pt: ["Remoção tem mais casos que inserção e é onde a maioria das implementações à mão quebra.", "Folhas nulas contam como pretas; esquecer isso quebra o teste do tio nas bordas.", "Rubro-negras inclinadas à esquerda são mais simples de codificar mas não são a mesma estrutura; não misture os dois conjuntos de regras."],
    },
    history: {
      en: "Rudolf Bayer invented the structure in 1972 as symmetric binary B-trees, a binary encoding of 2-3-4 trees. Leonidas Guibas and Robert Sedgewick gave it the red and black colours in 1978, chosen, Sedgewick says, because those were the pens that printed best on the laser printer at Xerox PARC.",
      pt: "Rudolf Bayer inventou a estrutura em 1972 como B-trees binárias simétricas, uma codificação binária das árvores 2-3-4. Leonidas Guibas e Robert Sedgewick deram as cores vermelha e preta em 1978, escolhidas, diz Sedgewick, porque eram as canetas que imprimiam melhor na impressora a laser do Xerox PARC.",
    },
    file: "red_black_tree",
    code: {
      ts: ["function insert(tree: Tree, key: number) {", "  const node = bstInsert(tree, key); // new nodes are red", "  fixUp(tree, node);", "}", "function fixUp(tree: Tree, node: Node) {", "  while (node.parent?.color === \"red\") {", "    const parent = node.parent, grandparent = parent.parent!;", "    const uncle = parent === grandparent.left ? grandparent.right : grandparent.left;", "    if (uncle?.color === \"red\") {", "      parent.color = uncle.color = \"black\";", "      grandparent.color = \"red\";", "      node = grandparent;", "      continue;", "    }", "    if (node === parent.right && parent === grandparent.left) { rotateLeft(tree, parent); node = parent; }", "    else if (node === parent.left && parent === grandparent.right) { rotateRight(tree, parent); node = parent; }", "    node.parent!.color = \"black\";", "    grandparent.color = \"red\";", "    if (node === node.parent!.left) rotateRight(tree, grandparent); else rotateLeft(tree, grandparent);", "  }", "  tree.root!.color = \"black\";", "}"],
      py: ["def insert(tree, key):", "    node = bst_insert(tree, key)  # new nodes are red", "    fix_up(tree, node)", "", "def fix_up(tree, node):", "    while node.parent is not None and node.parent.color == RED:", "        parent = node.parent; grandparent = parent.parent", "        uncle = grandparent.right if parent is grandparent.left else grandparent.left", "        if uncle is not None and uncle.color == RED:", "            parent.color = uncle.color = BLACK", "            grandparent.color = RED", "            node = grandparent", "            continue", "", "        if node is parent.right and parent is grandparent.left: rotate_left(tree, parent); node = parent", "        elif node is parent.left and parent is grandparent.right: rotate_right(tree, parent); node = parent", "        node.parent.color = BLACK", "        grandparent.color = RED", "        if node is node.parent.left: rotate_right(tree, grandparent)", "        else: rotate_left(tree, grandparent)", "    tree.root.color = BLACK", ""],
      java: ["static void insert(Tree tree, int key) {", "  Node node = bstInsert(tree, key); // new nodes are red", "  fixUp(tree, node);", "}", "static void fixUp(Tree tree, Node node) {", "  while (node.parent != null && node.parent.color == RED) {", "    Node parent = node.parent, grandparent = parent.parent;", "    Node uncle = parent == grandparent.left ? grandparent.right : grandparent.left;", "    if (uncle != null && uncle.color == RED) {", "      parent.color = uncle.color = BLACK;", "      grandparent.color = RED;", "      node = grandparent;", "      continue;", "    }", "    if (node == parent.right && parent == grandparent.left) { rotateLeft(tree, parent); node = parent; }", "    else if (node == parent.left && parent == grandparent.right) { rotateRight(tree, parent); node = parent; }", "    node.parent.color = BLACK;", "    grandparent.color = RED;", "    if (node == node.parent.left) rotateRight(tree, grandparent); else rotateLeft(tree, grandparent);", "  }", "  tree.root.color = BLACK;", "}"],
      cpp: ["void insert(Tree& tree, int key) {", "  Node* node = bstInsert(tree, key); // new nodes are red", "  fixUp(tree, node);", "}", "void fixUp(Tree& tree, Node* node) {", "  while (node->parent != nullptr && node->parent->color == RED) {", "    Node* parent = node->parent; Node* grandparent = parent->parent;", "    Node* uncle = parent == grandparent->left ? grandparent->right : grandparent->left;", "    if (uncle != nullptr && uncle->color == RED) {", "      parent->color = uncle->color = BLACK;", "      grandparent->color = RED;", "      node = grandparent;", "      continue;", "    }", "    if (node == parent->right && parent == grandparent->left) { rotateLeft(tree, parent); node = parent; }", "    else if (node == parent->left && parent == grandparent->right) { rotateRight(tree, parent); node = parent; }", "    node->parent->color = BLACK;", "    grandparent->color = RED;", "    if (node == node->parent->left) rotateRight(tree, grandparent); else rotateLeft(tree, grandparent);", "  }", "  tree.root->color = BLACK;", "}"],
      c: ["void insert(Tree *tree, int key) {", "  Node *node = bst_insert(tree, key); /* new nodes are red */", "  fix_up(tree, node);", "}", "void fix_up(Tree *tree, Node *node) {", "  while (node->parent != NULL && node->parent->color == RED) {", "    Node *parent = node->parent; Node *grandparent = parent->parent;", "    Node *uncle = parent == grandparent->left ? grandparent->right : grandparent->left;", "    if (uncle != NULL && uncle->color == RED) {", "      parent->color = uncle->color = BLACK;", "      grandparent->color = RED;", "      node = grandparent;", "      continue;", "    }", "    if (node == parent->right && parent == grandparent->left) { rotate_left(tree, parent); node = parent; }", "    else if (node == parent->left && parent == grandparent->right) { rotate_right(tree, parent); node = parent; }", "    node->parent->color = BLACK;", "    grandparent->color = RED;", "    if (node == node->parent->left) rotate_right(tree, grandparent); else rotate_left(tree, grandparent);", "  }", "  tree->root->color = BLACK;", "}"],
      go: ["func insert(tree *Tree, key int) {", "\tnode := bstInsert(tree, key) // new nodes are red", "\tfixUp(tree, node)", "}", "func fixUp(tree *Tree, node *Node) {", "\tfor node.Parent != nil && node.Parent.Color == Red {", "\t\tparent := node.Parent; grandparent := parent.Parent", "\t\tuncle := grandparent.Left; if parent == grandparent.Left { uncle = grandparent.Right }", "\t\tif uncle != nil && uncle.Color == Red {", "\t\t\tparent.Color, uncle.Color = Black, Black", "\t\t\tgrandparent.Color = Red", "\t\t\tnode = grandparent", "\t\t\tcontinue", "\t\t}", "\t\tif node == parent.Right && parent == grandparent.Left { rotateLeft(tree, parent); node = parent", "\t\t} else if node == parent.Left && parent == grandparent.Right { rotateRight(tree, parent); node = parent }", "\t\tnode.Parent.Color = Black", "\t\tgrandparent.Color = Red", "\t\tif node == node.Parent.Left { rotateRight(tree, grandparent) } else { rotateLeft(tree, grandparent) }", "\t}", "\ttree.Root.Color = Black", "}"],
      rs: ["fn insert(tree: &mut Tree, key: i32) {", "    let node = tree.bst_insert(key); // new nodes are red", "    fix_up(tree, node);", "}", "fn fix_up(tree: &mut Tree, mut node: usize) {", "    while tree.parent(node).is_some_and(|parent| tree.is_red(parent)) {", "        let parent = tree.parent(node).unwrap(); let grandparent = tree.parent(parent).unwrap();", "        let uncle = if Some(parent) == tree.left(grandparent) { tree.right(grandparent) } else { tree.left(grandparent) };", "        if uncle.is_some_and(|uncle| tree.is_red(uncle)) {", "            tree.set_black(parent); tree.set_black(uncle.unwrap());", "            tree.set_red(grandparent);", "            node = grandparent;", "            continue;", "        }", "        if Some(node) == tree.right(parent) && Some(parent) == tree.left(grandparent) { tree.rotate_left(parent); node = parent; }", "        else if Some(node) == tree.left(parent) && Some(parent) == tree.right(grandparent) { tree.rotate_right(parent); node = parent; }", "        tree.set_black(tree.parent(node).unwrap());", "        tree.set_red(grandparent);", "        if Some(node) == tree.left(tree.parent(node).unwrap()) { tree.rotate_right(grandparent); } else { tree.rotate_left(grandparent); }", "    }", "    tree.set_black(tree.root);", "}"],
    },
    pseudo: {
      en: ["INSERT(tree, key)", "  node ← BST insert, coloured red", "  while parent(node) is red", "    if uncle(node) is red: paint parent and uncle black, grandparent red; node ← grandparent", "    else: if node is an inner grandchild, rotate parent outward; paint parent black, grandparent red; rotate grandparent", "  paint root black"],
      pt: ["INSERIR(árvore, chave)", "  nó ← inserção de BST, pintado de vermelho", "  enquanto pai(nó) é vermelho", "    se tio(nó) é vermelho: pinta pai e tio de preto, avô de vermelho; nó ← avô", "    senão: se nó é neto interno, rotaciona o pai para fora; pinta pai de preto, avô de vermelho; rotaciona o avô", "  pinta a raiz de preto"],
    },
  },

  btree: {
    ...SIZE,
    minN: 8,
    maxN: 24,
    defaultN: 14,
    family: "trees",
    slug: "b-tree",
    kind: "btree",
    name: "B-tree",
    subtitle: { en: "wide nodes · split on the way down", pt: "nós largos · divide na descida" },
    tagline: { en: "B-tree · one disk page per node, every leaf at the same depth", pt: "B-tree · uma página de disco por nó, toda folha na mesma profundidade" },
    legend: [["act", { en: "current node", pt: "nó atual" }], ["amber", { en: "split halves", pt: "metades divididas" }], ["violet", { en: "received a key", pt: "recebeu uma chave" }], ["primary", { en: "path", pt: "caminho" }]],
    kpis: [
      { key: "keys", unitKey: "keysUnit", label: { en: "KEYS", pt: "CHAVES" }, sub: { en: "stored so far", pt: "guardadas até aqui" } },
      { key: "nodes", label: { en: "NODES", pt: "NÓS" }, sub: { en: "pages in use", pt: "páginas em uso" } },
      { key: "splits", label: { en: "SPLITS", pt: "DIVISÕES" }, sub: { en: "full nodes halved", pt: "nós cheios partidos" } },
      KPI_HEIGHT,
      { key: "key", label: { en: "KEY", pt: "CHAVE" }, sub: { en: "being inserted", pt: "sendo inserida" } },
    ],
    idea: {
      en: [
        "A B-tree keeps many keys per node, sorted, with one child between each pair of neighbouring keys. Every node except the root holds between t − 1 and 2t − 1 keys, and all leaves sit at the same depth, so the tree is always balanced and very shallow: with t = 64 three levels index millions of keys.",
        "Insertion walks down to a leaf and drops the key in its sorted place. To make room ahead of time, any full node met on the way is split: its middle key moves up into the parent and the two halves become separate children. Splitting the root is the only way the tree gets taller, and it grows from the top.",
      ],
      pt: [
        "Uma B-tree guarda muitas chaves por nó, ordenadas, com um filho entre cada par de chaves vizinhas. Todo nó exceto a raiz guarda entre t − 1 e 2t − 1 chaves, e todas as folhas ficam na mesma profundidade, então a árvore está sempre balanceada e é muito rasa: com t = 64 três níveis indexam milhões de chaves.",
        "A inserção desce até uma folha e põe a chave no lugar ordenado. Para abrir espaço antes, qualquer nó cheio encontrado no caminho é dividido: sua chave do meio sobe para o pai e as duas metades viram filhos separados. Dividir a raiz é o único jeito de a árvore crescer, e ela cresce por cima.",
      ],
    },
    stages: [
      ["act", { en: "descend", pt: "desce" }, { en: "pick the child between the neighbouring keys", pt: "escolhe o filho entre as chaves vizinhas" }],
      ["amber", { en: "split", pt: "divide" }, { en: "a full child: middle key moves up", pt: "um filho cheio: a chave do meio sobe" }],
      ["violet", { en: "insert", pt: "insere" }, { en: "into the leaf, in sorted position", pt: "na folha, na posição ordenada" }],
      ["primary", { en: "grow", pt: "cresce" }, { en: "a full root splits into a new root", pt: "uma raiz cheia se divide numa raiz nova" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(log_t n)", "green", { en: "node visits per operation", pt: "visitas a nós por operação" }],
      [{ en: "average", pt: "médio" }, "O(t · log_t n)", "green", { en: "keys compared inside the nodes", pt: "chaves comparadas dentro dos nós" }],
      [{ en: "worst", pt: "pior" }, "O(t · log_t n)", "green", { en: "a split at every level", pt: "uma divisão em cada nível" }],
      [{ en: "space", pt: "espaço" }, "O(n)", "text", { en: "nodes at least half full", pt: "nós pelo menos meio cheios" }],
    ],
    chartTitle: { en: "PAGE READS PER LOOKUP · 100 000 000 KEYS", pt: "LEITURAS DE PÁGINA POR BUSCA · 100.000.000 DE CHAVES" },
    chart: [["b-tree, t = 512", 3, true], ["b-tree, t = 2", 14], ["avl", 27], ["red-black", 30], ["bst, random", 40]],
    chartNote: { en: "on disk one page read costs more than a thousand comparisons in memory", pt: "em disco uma leitura de página custa mais que mil comparações em memória" },
    when: {
      en: ["Anything on disk or SSD: database indexes, file systems (NTFS, HFS+, ext4 directories, Btrfs), key-value stores.", "In memory too, when cache lines matter: a node the size of a cache line beats a pointer-chasing binary tree."],
      pt: ["Qualquer coisa em disco ou SSD: índices de banco de dados, sistemas de arquivos (NTFS, HFS+, diretórios ext4, Btrfs), armazenamentos chave-valor.", "Em memória também, quando linhas de cache importam: um nó do tamanho de uma linha de cache vence uma árvore binária que persegue ponteiros."],
    },
    pitfalls: {
      en: ["Splitting on the way down keeps one pass but splits nodes that would not have overflowed; the lazy variant splits on the way up instead.", "Deletion must merge or borrow to keep nodes at least half full; it is the hard half of the structure.", "Picking t: match the node to the page size, not to the key count."],
      pt: ["Dividir na descida mantém uma passada só mas divide nós que não teriam transbordado; a variante preguiçosa divide na subida.", "Remoção precisa fundir ou emprestar para manter nós pelo menos meio cheios; é a metade difícil da estrutura.", "Escolher t: case o nó com o tamanho da página, não com a contagem de chaves."],
    },
    history: {
      en: "Rudolf Bayer and Edward McCreight designed the B-tree at Boeing in 1970 for indexes too large for memory; the B has never been officially explained, with Boeing, balanced and Bayer all offered. The B+ tree, which keeps data only in linked leaves, is the form most databases use today.",
      pt: "Rudolf Bayer e Edward McCreight projetaram a B-tree na Boeing em 1970 para índices grandes demais para a memória; o B nunca foi explicado oficialmente, com Boeing, balanced e Bayer todos sugeridos. A B+ tree, que guarda dados só em folhas encadeadas, é a forma que a maioria dos bancos de dados usa hoje.",
    },
    file: "b_tree",
    code: {
      ts: ["function insert(tree: BTree, key: number) {", "  if (tree.root.keys.length === MAX_KEYS) {", "    const oldRoot = tree.root;", "    tree.root = { keys: [], children: [oldRoot], leaf: false };", "    splitChild(tree.root, 0);", "  }", "  insertNonFull(tree.root, key);", "}", "function insertNonFull(node: BNode, key: number) {", "  let index = node.keys.length - 1;", "  if (node.leaf) {", "    while (index >= 0 && key < node.keys[index]) index--;", "    node.keys.splice(index + 1, 0, key);", "    return;", "  }", "  while (index >= 0 && key < node.keys[index]) index--;", "  index++;", "  if (node.children[index].keys.length === MAX_KEYS) {", "    splitChild(node, index);", "    if (key > node.keys[index]) index++;", "  }", "  insertNonFull(node.children[index], key);", "}"],
      py: ["def insert(tree, key):", "    if len(tree.root.keys) == MAX_KEYS:", "        old_root = tree.root", "        tree.root = BNode(keys=[], children=[old_root], leaf=False)", "        split_child(tree.root, 0)", "", "    insert_non_full(tree.root, key)", "", "def insert_non_full(node, key):", "    index = len(node.keys) - 1", "    if node.leaf:", "        while index >= 0 and key < node.keys[index]: index -= 1", "        node.keys.insert(index + 1, key)", "        return", "", "    while index >= 0 and key < node.keys[index]: index -= 1", "    index += 1", "    if len(node.children[index].keys) == MAX_KEYS:", "        split_child(node, index)", "        if key > node.keys[index]: index += 1", "", "    insert_non_full(node.children[index], key)", ""],
      java: ["static void insert(BTree tree, int key) {", "  if (tree.root.keys.size() == MAX_KEYS) {", "    BNode oldRoot = tree.root;", "    tree.root = new BNode(false); tree.root.children.add(oldRoot);", "    splitChild(tree.root, 0);", "  }", "  insertNonFull(tree.root, key);", "}", "static void insertNonFull(BNode node, int key) {", "  int index = node.keys.size() - 1;", "  if (node.leaf) {", "    while (index >= 0 && key < node.keys.get(index)) index--;", "    node.keys.add(index + 1, key);", "    return;", "  }", "  while (index >= 0 && key < node.keys.get(index)) index--;", "  index++;", "  if (node.children.get(index).keys.size() == MAX_KEYS) {", "    splitChild(node, index);", "    if (key > node.keys.get(index)) index++;", "  }", "  insertNonFull(node.children.get(index), key);", "}"],
      cpp: ["void insert(BTree& tree, int key) {", "  if (tree.root->keys.size() == MAX_KEYS) {", "    BNode* oldRoot = tree.root;", "    tree.root = new BNode{{}, {oldRoot}, false};", "    splitChild(tree.root, 0);", "  }", "  insertNonFull(tree.root, key);", "}", "void insertNonFull(BNode* node, int key) {", "  int index = node->keys.size() - 1;", "  if (node->leaf) {", "    while (index >= 0 && key < node->keys[index]) index--;", "    node->keys.insert(node->keys.begin() + index + 1, key);", "    return;", "  }", "  while (index >= 0 && key < node->keys[index]) index--;", "  index++;", "  if (node->children[index]->keys.size() == MAX_KEYS) {", "    splitChild(node, index);", "    if (key > node->keys[index]) index++;", "  }", "  insertNonFull(node->children[index], key);", "}"],
      c: ["void insert(BTree *tree, int key) {", "  if (tree->root->key_count == MAX_KEYS) {", "    BNode *old_root = tree->root;", "    tree->root = bnode_new(false); tree->root->children[0] = old_root; tree->root->child_count = 1;", "    split_child(tree->root, 0);", "  }", "  insert_non_full(tree->root, key);", "}", "void insert_non_full(BNode *node, int key) {", "  int index = node->key_count - 1;", "  if (node->leaf) {", "    while (index >= 0 && key < node->keys[index]) { node->keys[index + 1] = node->keys[index]; index--; }", "    node->keys[index + 1] = key; node->key_count++;", "    return;", "  }", "  while (index >= 0 && key < node->keys[index]) index--;", "  index++;", "  if (node->children[index]->key_count == MAX_KEYS) {", "    split_child(node, index);", "    if (key > node->keys[index]) index++;", "  }", "  insert_non_full(node->children[index], key);", "}"],
      go: ["func insert(tree *BTree, key int) {", "\tif len(tree.Root.Keys) == MaxKeys {", "\t\toldRoot := tree.Root", "\t\ttree.Root = &BNode{Children: []*BNode{oldRoot}}", "\t\tsplitChild(tree.Root, 0)", "\t}", "\tinsertNonFull(tree.Root, key)", "}", "func insertNonFull(node *BNode, key int) {", "\tindex := len(node.Keys) - 1", "\tif node.Leaf {", "\t\tfor index >= 0 && key < node.Keys[index] { index-- }", "\t\tnode.Keys = slices.Insert(node.Keys, index+1, key)", "\t\treturn", "\t}", "\tfor index >= 0 && key < node.Keys[index] { index-- }", "\tindex++", "\tif len(node.Children[index].Keys) == MaxKeys {", "\t\tsplitChild(node, index)", "\t\tif key > node.Keys[index] { index++ }", "\t}", "\tinsertNonFull(node.Children[index], key)", "}"],
      rs: ["fn insert(tree: &mut BTree, key: i32) {", "    if tree.root.keys.len() == MAX_KEYS {", "        let old_root = std::mem::take(&mut tree.root);", "        tree.root = Box::new(BNode { keys: vec![], children: vec![old_root], leaf: false });", "        split_child(&mut tree.root, 0);", "    }", "    insert_non_full(&mut tree.root, key);", "}", "fn insert_non_full(node: &mut BNode, key: i32) {", "    let mut index = node.keys.len() as isize - 1;", "    if node.leaf {", "        while index >= 0 && key < node.keys[index as usize] { index -= 1; }", "        node.keys.insert((index + 1) as usize, key);", "        return;", "    }", "    while index >= 0 && key < node.keys[index as usize] { index -= 1; }", "    index += 1;", "    if node.children[index as usize].keys.len() == MAX_KEYS {", "        split_child(node, index as usize);", "        if key > node.keys[index as usize] { index += 1; }", "    }", "    insert_non_full(&mut node.children[index as usize], key);", "}"],
    },
    pseudo: {
      en: ["INSERT(tree, key)", "  if the root is full: make a new root above it and SPLIT the old root", "  INSERTNONFULL(root, key)", "INSERTNONFULL(node, key)", "  if node is a leaf: put key in its sorted place", "  else: child ← the child between the keys around key", "    if child is full: SPLIT it, the middle key moves up; pick the correct half", "    INSERTNONFULL(child, key)"],
      pt: ["INSERIR(árvore, chave)", "  se a raiz está cheia: cria uma raiz nova acima e DIVIDE a raiz antiga", "  INSERIRNÃOCHEIO(raiz, chave)", "INSERIRNÃOCHEIO(nó, chave)", "  se nó é folha: põe a chave no lugar ordenado", "  senão: filho ← o filho entre as chaves ao redor da chave", "    se filho está cheio: DIVIDE, a chave do meio sobe; escolhe a metade certa", "    INSERIRNÃOCHEIO(filho, chave)"],
    },
  },

  binaryHeap: {
    ...SIZE,
    family: "trees",
    slug: "binary-heap",
    kind: "tree",
    name: "Binary heap",
    subtitle: { en: "push, pop · a complete tree inside an array", pt: "push, pop · uma árvore completa dentro de um vetor" },
    tagline: { en: "binary heap · the parent always beats its children", pt: "heap binário · o pai sempre vence os filhos" },
    legend: [["violet", { en: "just pushed", pt: "recém inserido" }], ["act", { en: "sifting", pt: "movendo" }], ["primary", { en: "compared with", pt: "comparado com" }], ["amber", { en: "last leaf, moving to the root", pt: "última folha, indo para a raiz" }]],
    kpis: [
      { key: "size", unitKey: "sizeUnit", label: { en: "SIZE", pt: "TAMANHO" }, sub: { en: "keys in the heap", pt: "chaves no heap" } },
      { key: "swaps", label: { en: "SWAPS", pt: "TROCAS" }, sub: { en: "parent with child", pt: "pai com filho" } },
      KPI_COMPARISONS,
      KPI_HEIGHT,
      { key: "popped", label: { en: "POPPED", pt: "RETIRADOS" }, sub: { en: "in order, largest first", pt: "em ordem, o maior primeiro" } },
    ],
    idea: {
      en: [
        "A binary heap is a complete binary tree, every level full except the last, which fills left to right, stored in an array with no pointers at all: the children of index i sit at 2i + 1 and 2i + 2, and its parent at ⌊(i − 1) / 2⌋. The one rule is that every parent is at least as large as its children, so the maximum is always at index 0.",
        "Push appends the key at the end and sifts it up, swapping with its parent while it is larger. Pop takes the root, moves the last leaf into its place and sifts it down, swapping with the larger child while one of them is larger. Both walk one root-to-leaf path, so both cost the height, log₂ n.",
      ],
      pt: [
        "Um heap binário é uma árvore binária completa, todo nível cheio exceto o último, que enche da esquerda para a direita, guardada num vetor sem nenhum ponteiro: os filhos do índice i ficam em 2i + 1 e 2i + 2, e seu pai em ⌊(i − 1) / 2⌋. A única regra é que todo pai é pelo menos tão grande quanto os filhos, então o máximo está sempre no índice 0.",
        "Push anexa a chave no fim e sobe com ela, trocando com o pai enquanto for maior. Pop tira a raiz, move a última folha para o lugar dela e desce com ela, trocando com o filho maior enquanto um deles for maior. Os dois percorrem um caminho da raiz a uma folha, então os dois custam a altura, log₂ n.",
      ],
    },
    stages: [
      ["violet", { en: "append", pt: "anexa" }, { en: "the key takes the next free slot", pt: "a chave ocupa a próxima vaga" }],
      ["act", { en: "sift up", pt: "sobe" }, { en: "swap with the parent while larger", pt: "troca com o pai enquanto for maior" }],
      ["amber", { en: "pop", pt: "retira" }, { en: "root out, last leaf into its place", pt: "raiz sai, última folha no lugar dela" }],
      ["primary", { en: "sift down", pt: "desce" }, { en: "swap with the larger child while smaller", pt: "troca com o filho maior enquanto for menor" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(1)", "green", { en: "push of a small key, peek of the maximum", pt: "push de uma chave pequena, espiar o máximo" }],
      [{ en: "average", pt: "médio" }, "O(log n)", "green", { en: "push climbs about 1.6 levels on random keys", pt: "push sobe cerca de 1,6 níveis com chaves aleatórias" }],
      [{ en: "worst", pt: "pior" }, "O(log n)", "green", { en: "push and pop walk the full height", pt: "push e pop percorrem a altura toda" }],
      [{ en: "space", pt: "espaço" }, "O(n)", "text", { en: "the array, nothing else", pt: "o vetor, nada mais" }],
    ],
    chartTitle: { en: "COMPARISONS · 1 000 000 PUSHES THEN 1 000 000 POPS", pt: "COMPARAÇÕES · 1.000.000 DE PUSHES E DEPOIS 1.000.000 DE POPS" },
    chart: [["binary heap", 42000000, true], ["balanced bst", 60000000], ["sorted array", 500000000000], ["unsorted array", 500000000000], ["fibonacci heap", 22000000]],
    chartNote: { en: "the array versions pay O(n) on one of the two operations", pt: "as versões com vetor pagam O(n) numa das duas operações" },
    when: {
      en: ["Priority queues everywhere: Dijkstra and A*, event simulation, schedulers, top-k of a stream, Huffman coding.", "Heap sort, and heapify in O(n) when the whole array arrives at once."],
      pt: ["Filas de prioridade em todo lugar: Dijkstra e A*, simulação de eventos, escalonadores, top-k de um fluxo, codificação de Huffman.", "Heap sort, e heapify em O(n) quando o vetor inteiro chega de uma vez."],
    },
    pitfalls: {
      en: ["A heap is not sorted: only the root is known; in-order traversal means nothing here.", "Changing a key in place breaks the property; use decrease-key with a position map, or push a duplicate and skip stale entries.", "Building by n pushes costs O(n log n); Floyd's bottom-up heapify does it in O(n)."],
      pt: ["Um heap não está ordenado: só a raiz é conhecida; percurso em ordem não significa nada aqui.", "Mudar uma chave no lugar quebra a propriedade; use decrease-key com um mapa de posições, ou insira uma duplicata e pule entradas velhas.", "Construir com n pushes custa O(n log n); o heapify de baixo para cima de Floyd faz em O(n)."],
    },
    history: {
      en: "J. W. J. Williams introduced the binary heap in 1964 as the engine of heapsort, and Robert Floyd improved the construction to linear time the same year. The array layout without pointers is what made it practical; Fibonacci and pairing heaps later improved the asymptotics of decrease-key but rarely beat it in practice.",
      pt: "J. W. J. Williams introduziu o heap binário em 1964 como o motor do heapsort, e Robert Floyd melhorou a construção para tempo linear no mesmo ano. O layout em vetor sem ponteiros foi o que o tornou prático; heaps de Fibonacci e de pareamento melhoraram depois a assintótica do decrease-key mas raramente o vencem na prática.",
    },
    file: "binary_heap",
    code: {
      ts: ["function push(heap: number[], key: number) {", "  heap.push(key);", "  let index = heap.length - 1;", "  while (index > 0 && heap[index] > heap[parent(index)]) {", "    swap(heap, index, parent(index));", "    index = parent(index);", "  }", "}", "function pop(heap: number[]): number {", "  const top = heap[0];", "  heap[0] = heap[heap.length - 1];", "  heap.pop();", "  siftDown(heap, 0);", "  return top;", "}", "function siftDown(heap: number[], index: number) {", "  while (true) {", "    const left = 2 * index + 1, right = left + 1;", "    let largest = index;", "    if (left < heap.length && heap[left] > heap[largest]) largest = left;", "    if (right < heap.length && heap[right] > heap[largest]) largest = right;", "    if (largest === index) return;", "    swap(heap, index, largest);", "    index = largest;", "  }", "}"],
      py: ["def push(heap, key):", "    heap.append(key)", "    index = len(heap) - 1", "    while index > 0 and heap[index] > heap[parent(index)]:", "        swap(heap, index, parent(index))", "        index = parent(index)", "", "", "def pop(heap):", "    top = heap[0]", "    heap[0] = heap[-1]", "    heap.pop()", "    sift_down(heap, 0)", "    return top", "", "def sift_down(heap, index):", "    while True:", "        left, right = 2 * index + 1, 2 * index + 2", "        largest = index", "        if left < len(heap) and heap[left] > heap[largest]: largest = left", "        if right < len(heap) and heap[right] > heap[largest]: largest = right", "        if largest == index: return", "        swap(heap, index, largest)", "        index = largest", "", ""],
      java: ["static void push(List<Integer> heap, int key) {", "  heap.add(key);", "  int index = heap.size() - 1;", "  while (index > 0 && heap.get(index) > heap.get(parent(index))) {", "    Collections.swap(heap, index, parent(index));", "    index = parent(index);", "  }", "}", "static int pop(List<Integer> heap) {", "  int top = heap.get(0);", "  heap.set(0, heap.get(heap.size() - 1));", "  heap.remove(heap.size() - 1);", "  siftDown(heap, 0);", "  return top;", "}", "static void siftDown(List<Integer> heap, int index) {", "  while (true) {", "    int left = 2 * index + 1, right = left + 1;", "    int largest = index;", "    if (left < heap.size() && heap.get(left) > heap.get(largest)) largest = left;", "    if (right < heap.size() && heap.get(right) > heap.get(largest)) largest = right;", "    if (largest == index) return;", "    Collections.swap(heap, index, largest);", "    index = largest;", "  }", "}"],
      cpp: ["void push(std::vector<int>& heap, int key) {", "  heap.push_back(key);", "  int index = heap.size() - 1;", "  while (index > 0 && heap[index] > heap[parent(index)]) {", "    std::swap(heap[index], heap[parent(index)]);", "    index = parent(index);", "  }", "}", "int pop(std::vector<int>& heap) {", "  int top = heap[0];", "  heap[0] = heap.back();", "  heap.pop_back();", "  siftDown(heap, 0);", "  return top;", "}", "void siftDown(std::vector<int>& heap, int index) {", "  while (true) {", "    int left = 2 * index + 1, right = left + 1;", "    int largest = index;", "    if (left < (int)heap.size() && heap[left] > heap[largest]) largest = left;", "    if (right < (int)heap.size() && heap[right] > heap[largest]) largest = right;", "    if (largest == index) return;", "    std::swap(heap[index], heap[largest]);", "    index = largest;", "  }", "}"],
      c: ["void push(Heap *heap, int key) {", "  heap->data[heap->size++] = key;", "  int index = heap->size - 1;", "  while (index > 0 && heap->data[index] > heap->data[parent(index)]) {", "    swap(heap, index, parent(index));", "    index = parent(index);", "  }", "}", "int pop(Heap *heap) {", "  int top = heap->data[0];", "  heap->data[0] = heap->data[heap->size - 1];", "  heap->size--;", "  sift_down(heap, 0);", "  return top;", "}", "void sift_down(Heap *heap, int index) {", "  while (1) {", "    int left = 2 * index + 1, right = left + 1;", "    int largest = index;", "    if (left < heap->size && heap->data[left] > heap->data[largest]) largest = left;", "    if (right < heap->size && heap->data[right] > heap->data[largest]) largest = right;", "    if (largest == index) return;", "    swap(heap, index, largest);", "    index = largest;", "  }", "}"],
      go: ["func (heap *Heap) push(key int) {", "\theap.data = append(heap.data, key)", "\tindex := len(heap.data) - 1", "\tfor index > 0 && heap.data[index] > heap.data[parent(index)] {", "\t\theap.data[index], heap.data[parent(index)] = heap.data[parent(index)], heap.data[index]", "\t\tindex = parent(index)", "\t}", "}", "func (heap *Heap) pop() int {", "\ttop := heap.data[0]", "\theap.data[0] = heap.data[len(heap.data)-1]", "\theap.data = heap.data[:len(heap.data)-1]", "\theap.siftDown(0)", "\treturn top", "}", "func (heap *Heap) siftDown(index int) {", "\tfor {", "\t\tleft, right := 2*index+1, 2*index+2", "\t\tlargest := index", "\t\tif left < len(heap.data) && heap.data[left] > heap.data[largest] { largest = left }", "\t\tif right < len(heap.data) && heap.data[right] > heap.data[largest] { largest = right }", "\t\tif largest == index { return }", "\t\theap.data[index], heap.data[largest] = heap.data[largest], heap.data[index]", "\t\tindex = largest", "\t}", "}"],
      rs: ["fn push(heap: &mut Vec<i32>, key: i32) {", "    heap.push(key);", "    let mut index = heap.len() - 1;", "    while index > 0 && heap[index] > heap[parent(index)] {", "        heap.swap(index, parent(index));", "        index = parent(index);", "    }", "}", "fn pop(heap: &mut Vec<i32>) -> i32 {", "    let top = heap[0];", "    heap[0] = heap[heap.len() - 1];", "    heap.pop();", "    sift_down(heap, 0);", "    top", "}", "fn sift_down(heap: &mut Vec<i32>, mut index: usize) {", "    loop {", "        let (left, right) = (2 * index + 1, 2 * index + 2);", "        let mut largest = index;", "        if left < heap.len() && heap[left] > heap[largest] { largest = left; }", "        if right < heap.len() && heap[right] > heap[largest] { largest = right; }", "        if largest == index { return; }", "        heap.swap(index, largest);", "        index = largest;", "    }", "}"],
    },
    pseudo: {
      en: ["PUSH(heap, key)", "  append key; index ← last", "  while index > 0 and heap[index] > heap[parent]: swap them; index ← parent", "POP(heap)", "  top ← heap[0]; move the last key to index 0; shrink", "  index ← 0; while a child is larger: swap with the larger child; descend", "  return top"],
      pt: ["PUSH(heap, chave)", "  anexa chave; índice ← último", "  enquanto índice > 0 e heap[índice] > heap[pai]: troca; índice ← pai", "POP(heap)", "  topo ← heap[0]; move a última chave para o índice 0; encolhe", "  índice ← 0; enquanto um filho for maior: troca com o filho maior; desce", "  retorna topo"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
