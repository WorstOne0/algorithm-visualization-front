// Models
import type { AlgorithmId } from "./algorithms";
import type { Lang } from "./translations";

export const LANGS = [
  { id: "ts", label: "TypeScript", ext: "ts" },
  { id: "py", label: "Python", ext: "py" },
  { id: "java", label: "Java", ext: "java" },
  { id: "cpp", label: "C++", ext: "cpp" },
  { id: "c", label: "C", ext: "c" },
  { id: "go", label: "Go", ext: "go" },
  { id: "rs", label: "Rust", ext: "rs" },
] as const;

export type CodeLang = (typeof LANGS)[number]["id"];

export const FILE_NAMES: Record<AlgorithmId, string> = { quick: "quick_sort", astar: "a_star" };

// Every listing of one algorithm has the same line count and the same line ↔ step mapping.
export const CODE: Record<AlgorithmId, Record<CodeLang, string[]>> = {
  quick: {
    ts: ["function quickSort(a: number[], lo: number, hi: number) {", "  if (lo >= hi) return;", "  const pivot = a[hi];", "  let i = lo;", "  for (let j = lo; j < hi; j++) {", "    if (a[j] < pivot) {", "      [a[i], a[j]] = [a[j], a[i]];", "      i++;", "    }", "  }", "  [a[i], a[hi]] = [a[hi], a[i]];", "  quickSort(a, lo, i - 1);", "  quickSort(a, i + 1, hi);", "}"],
    py: ["def quick_sort(a, lo, hi):", "    if lo >= hi: return", "    pivot = a[hi]", "    i = lo", "    for j in range(lo, hi):", "        if a[j] < pivot:", "            a[i], a[j] = a[j], a[i]", "            i += 1", "", "", "    a[i], a[hi] = a[hi], a[i]", "    quick_sort(a, lo, i - 1)", "    quick_sort(a, i + 1, hi)", ""],
    java: ["static void quickSort(int[] a, int lo, int hi) {", "  if (lo >= hi) return;", "  int pivot = a[hi];", "  int i = lo;", "  for (int j = lo; j < hi; j++) {", "    if (a[j] < pivot) {", "      int t = a[i]; a[i] = a[j]; a[j] = t;", "      i++;", "    }", "  }", "  int t = a[i]; a[i] = a[hi]; a[hi] = t;", "  quickSort(a, lo, i - 1);", "  quickSort(a, i + 1, hi);", "}"],
    cpp: ["void quickSort(std::vector<int>& a, int lo, int hi) {", "  if (lo >= hi) return;", "  int pivot = a[hi];", "  int i = lo;", "  for (int j = lo; j < hi; ++j) {", "    if (a[j] < pivot) {", "      std::swap(a[i], a[j]);", "      ++i;", "    }", "  }", "  std::swap(a[i], a[hi]);", "  quickSort(a, lo, i - 1);", "  quickSort(a, i + 1, hi);", "}"],
    c: ["void quick_sort(int *a, int lo, int hi) {", "  if (lo >= hi) return;", "  int pivot = a[hi];", "  int i = lo;", "  for (int j = lo; j < hi; j++) {", "    if (a[j] < pivot) {", "      int t = a[i]; a[i] = a[j]; a[j] = t;", "      i++;", "    }", "  }", "  int t = a[i]; a[i] = a[hi]; a[hi] = t;", "  quick_sort(a, lo, i - 1);", "  quick_sort(a, i + 1, hi);", "}"],
    go: ["func quickSort(a []int, lo, hi int) {", "\tif lo >= hi { return }", "\tpivot := a[hi]", "\ti := lo", "\tfor j := lo; j < hi; j++ {", "\t\tif a[j] < pivot {", "\t\t\ta[i], a[j] = a[j], a[i]", "\t\t\ti++", "\t\t}", "\t}", "\ta[i], a[hi] = a[hi], a[i]", "\tquickSort(a, lo, i-1)", "\tquickSort(a, i+1, hi)", "}"],
    rs: ["fn quick_sort(a: &mut [i32], lo: isize, hi: isize) {", "    if lo >= hi { return; }", "    let pivot = a[hi as usize];", "    let mut i = lo;", "    for j in lo..hi {", "        if a[j as usize] < pivot {", "            a.swap(i as usize, j as usize);", "            i += 1;", "        }", "    }", "    a.swap(i as usize, hi as usize);", "    quick_sort(a, lo, i - 1);", "    quick_sort(a, i + 1, hi);", "}"],
  },
  astar: {
    ts: ["function aStar(grid: Grid, start: Cell, goal: Cell) {", "  const open = new MinHeap<Cell>([start]);", "  const g = new Map([[start, 0]]), parent = new Map();", "  while (open.size > 0) {", "    const cur = open.pop(); // lowest f = g + h", "    if (cur === goal) return rebuild(parent, cur);", "    for (const nb of neighbors(grid, cur)) {", "      const ng = g.get(cur)! + 1;", "      if (ng < (g.get(nb) ?? Infinity)) {", "        g.set(nb, ng); parent.set(nb, cur);", "        open.push(nb, ng + h(nb, goal));", "      }", "    }", "  }", "}"],
    py: ["def a_star(grid, start, goal):", "    open_set = [(h(start, goal), start)]", "    g, parent = {start: 0}, {}", "    while open_set:", "        _, cur = heapq.heappop(open_set)  # lowest f", "        if cur == goal: return rebuild(parent, cur)", "        for nb in neighbors(grid, cur):", "            ng = g[cur] + 1", "            if ng < g.get(nb, math.inf):", "                g[nb], parent[nb] = ng, cur", "                heapq.heappush(open_set, (ng + h(nb, goal), nb))", "", "", "", ""],
    java: ["List<Cell> aStar(Grid grid, Cell start, Cell goal) {", "  PriorityQueue<Cell> open = new PriorityQueue<>(byF); open.add(start);", "  Map<Cell,Integer> g = new HashMap<>(Map.of(start, 0)); Map<Cell,Cell> parent = new HashMap<>();", "  while (!open.isEmpty()) {", "    Cell cur = open.poll(); // lowest f = g + h", "    if (cur.equals(goal)) return rebuild(parent, cur);", "    for (Cell nb : neighbors(grid, cur)) {", "      int ng = g.get(cur) + 1;", "      if (ng < g.getOrDefault(nb, Integer.MAX_VALUE)) {", "        g.put(nb, ng); parent.put(nb, cur);", "        nb.f = ng + h(nb, goal); open.add(nb);", "      }", "    }", "  }", "}"],
    cpp: ["std::vector<Cell> aStar(const Grid& grid, Cell start, Cell goal) {", "  std::priority_queue<Node, std::vector<Node>, ByF> open; open.push({start, h(start, goal)});", "  std::unordered_map<Cell,int> g{{start, 0}}; std::unordered_map<Cell,Cell> parent;", "  while (!open.empty()) {", "    Cell cur = open.top().cell; open.pop(); // lowest f", "    if (cur == goal) return rebuild(parent, cur);", "    for (Cell nb : neighbors(grid, cur)) {", "      int ng = g[cur] + 1;", "      if (!g.count(nb) || ng < g[nb]) {", "        g[nb] = ng; parent[nb] = cur;", "        open.push({nb, ng + h(nb, goal)});", "      }", "    }", "  }", "}"],
    c: ["Path a_star(Grid *grid, Cell start, Cell goal) {", "  Heap open = heap_new(); heap_push(&open, start, h(start, goal));", "  int g[ROWS][COLS]; fill(g, INF); g[start.r][start.c] = 0; Cell parent[ROWS][COLS];", "  while (open.size > 0) {", "    Cell cur = heap_pop(&open); /* lowest f = g + h */", "    if (cell_eq(cur, goal)) return rebuild(parent, cur);", "    for (int k = 0; k < 4; k++) { Cell nb = neighbor(grid, cur, k); if (!nb.ok) continue;", "      int ng = g[cur.r][cur.c] + 1;", "      if (ng < g[nb.r][nb.c]) {", "        g[nb.r][nb.c] = ng; parent[nb.r][nb.c] = cur;", "        heap_push(&open, nb, ng + h(nb, goal));", "      }", "    }", "  }", "}"],
    go: ["func aStar(grid Grid, start, goal Cell) []Cell {", "\topen := NewMinHeap(); open.Push(start, h(start, goal))", "\tg := map[Cell]int{start: 0}; parent := map[Cell]Cell{}", "\tfor open.Len() > 0 {", "\t\tcur := open.Pop() // lowest f = g + h", "\t\tif cur == goal { return rebuild(parent, cur) }", "\t\tfor _, nb := range neighbors(grid, cur) {", "\t\t\tng := g[cur] + 1", "\t\t\tif old, ok := g[nb]; !ok || ng < old {", "\t\t\t\tg[nb] = ng; parent[nb] = cur", "\t\t\t\topen.Push(nb, ng+h(nb, goal))", "\t\t\t}", "\t\t}", "\t}", "}"],
    rs: ["fn a_star(grid: &Grid, start: Cell, goal: Cell) -> Option<Vec<Cell>> {", "    let mut open = BinaryHeap::new(); open.push(Reverse((h(start, goal), start)));", "    let mut g = HashMap::from([(start, 0)]); let mut parent = HashMap::new();", "    while let Some(Reverse((_, cur))) = open.pop() {", "        // popped the cell with the lowest f = g + h", "        if cur == goal { return Some(rebuild(&parent, cur)); }", "        for nb in grid.neighbors(cur) {", "            let ng = g[&cur] + 1;", "            if ng < *g.get(&nb).unwrap_or(&i32::MAX) {", "                g.insert(nb, ng); parent.insert(nb, cur);", "                open.push(Reverse((ng + h(nb, goal), nb)));", "            }", "        }", "    }", "    None }"],
  },
};

export const PSEUDO: Record<AlgorithmId, Record<Lang, string[]>> = {
  quick: {
    en: ["QUICKSORT(A, lo, hi)", "  if lo ≥ hi: return", "  pivot ← A[hi]; i ← lo", "  for j ← lo to hi − 1", "    if A[j] < pivot: swap A[i], A[j]; i ← i + 1", "  swap A[i], A[hi]", "  QUICKSORT(A, lo, i − 1)", "  QUICKSORT(A, i + 1, hi)"],
    pt: ["QUICKSORT(A, lo, hi)", "  se lo ≥ hi: retorna", "  pivô ← A[hi]; i ← lo", "  para j ← lo até hi − 1", "    se A[j] < pivô: troca A[i], A[j]; i ← i + 1", "  troca A[i], A[hi]", "  QUICKSORT(A, lo, i − 1)", "  QUICKSORT(A, i + 1, hi)"],
  },
  astar: {
    en: ["A*(start, goal)", "  open ← {start}; g[start] ← 0", "  while open not empty", "    cur ← node in open with lowest g + h", "    if cur = goal: return path via parent", "    for each neighbour nb of cur", "      if g[cur] + 1 < g[nb]", "        g[nb] ← g[cur] + 1; parent[nb] ← cur; add nb to open"],
    pt: ["A*(início, destino)", "  aberto ← {início}; g[início] ← 0", "  enquanto aberto não vazio", "    cur ← nó do aberto com menor g + h", "    se cur = destino: retorna caminho pelos pais", "    para cada vizinho nb de cur", "      se g[cur] + 1 < g[nb]", "        g[nb] ← g[cur] + 1; pai[nb] ← cur; adiciona nb ao aberto"],
  },
};
