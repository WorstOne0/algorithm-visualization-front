// Models
import type { Localized } from "../translations";
import type { VizKey } from "../viz";
import type { AlgorithmSpec, KpiSpec } from "./spec";

const SIZE = { sizeLabel: { en: "Size", pt: "Tamanho" }, minN: 8, maxN: 64, stepN: 4, defaultN: 32, shuffleLabel: { en: "New target", pt: "Novo alvo" }, stepMs: 380, family: "searching", kind: "search" } as const;

const LEGEND: [VizKey, Localized][] = [["vis", { en: "discarded", pt: "descartado" }], ["primary", { en: "probe", pt: "sondagem" }], ["violet", { en: "target", pt: "alvo" }], ["green", { en: "found", pt: "achou" }]];

const KPI_COMPARISONS: KpiSpec = { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "probes so far", pt: "sondagens até aqui" } };
const KPI_TARGET: KpiSpec = { key: "target", label: { en: "TARGET", pt: "ALVO" }, sub: { en: "value we look for", pt: "valor procurado" } };
const KPI_RESULT: KpiSpec = { key: "result", label: { en: "RESULT", pt: "RESULTADO" }, sub: { en: "index once found", pt: "índice ao achar" } };
const KPI_RANGE: KpiSpec = { key: "range", unitKey: "rangeUnit", label: { en: "RANGE", pt: "FAIXA" }, sub: { en: "elements still possible", pt: "elementos ainda possíveis" } };

const CHART_TITLE = { en: "COMPARISONS AT N = 1 000 · TARGET PRESENT", pt: "COMPARAÇÕES EM N = 1.000 · ALVO PRESENTE" };
const CHART: [string, number, boolean?][] = [["linear", 500], ["jump", 63], ["binary", 10], ["ternary", 13], ["interpolation", 4]];
const CHART_NOTE = { en: "average over random targets · sorted, uniform values", pt: "média sobre alvos aleatórios · valores ordenados e uniformes" };

const selfIn = (chart: [string, number, boolean?][], label: string): [string, number, boolean?][] => chart.map(([name, value]) => (name === label ? [name, value, true] : [name, value]));

export const SEARCHING_MORE = {
  jump: {
    ...SIZE,
    slug: "jump-search",
    name: "Jump search",
    subtitle: { en: "blocks of √n, then a linear scan", pt: "blocos de √n, depois uma varredura linear" },
    tagline: { en: "jump search · skip ahead by √n, step back inside one block", pt: "jump search · pula √n de cada vez, volta dentro de um bloco" },
    legend: [["vis", { en: "skipped", pt: "pulado" }], ["primary", { en: "probe", pt: "sondagem" }], ["def", { en: "current block", pt: "bloco atual" }], ["violet", { en: "target", pt: "alvo" }], ["green", { en: "found", pt: "achou" }]],
    kpis: [KPI_COMPARISONS, { key: "block", label: { en: "BLOCK", pt: "BLOCO" }, sub: { en: "⌊√n⌋ elements per jump", pt: "⌊√n⌋ elementos por salto" } }, { key: "jumps", label: { en: "JUMPS", pt: "SALTOS" }, sub: { en: "blocks skipped", pt: "blocos pulados" } }, KPI_TARGET, KPI_RESULT],
    idea: {
      en: [
        "Jump search reads only the last element of each block of √n elements. While that element is smaller than the target the whole block can be skipped; the first block whose last element is not smaller must contain the target, if it is anywhere, and a linear scan of that block finds it.",
        "Both phases cost at most √n comparisons, so the total is about 2√n. That is far worse than binary search's log n, but every comparison after a jump moves forward through memory, which matters on tape, on linked storage or when jumping back is expensive.",
      ],
      pt: [
        "O jump search lê só o último elemento de cada bloco de √n elementos. Enquanto esse elemento é menor que o alvo o bloco inteiro pode ser pulado; o primeiro bloco cujo último elemento não é menor precisa conter o alvo, se ele existir, e uma varredura linear desse bloco o encontra.",
        "As duas fases custam no máximo √n comparações, então o total é cerca de 2√n. É bem pior que o log n da busca binária, mas toda comparação depois de um salto anda para a frente na memória, o que importa em fita, em armazenamento encadeado ou quando voltar é caro.",
      ],
    },
    stages: [
      ["violet", { en: "block", pt: "bloco" }, { en: "size ⌊√n⌋", pt: "tamanho ⌊√n⌋" }],
      ["primary", { en: "probe", pt: "sonda" }, { en: "the last element of the block", pt: "o último elemento do bloco" }],
      ["vis", { en: "jump", pt: "salta" }, { en: "smaller than the target: skip the block", pt: "menor que o alvo: pula o bloco" }],
      ["green", { en: "scan", pt: "varre" }, { en: "the block that stopped the jumps, linearly", pt: "o bloco que parou os saltos, linearmente" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(1)", "green", { en: "the target ends the first block", pt: "o alvo fecha o primeiro bloco" }],
      [{ en: "average", pt: "médio" }, "O(√n)", "text", { en: "half the jumps, half a block", pt: "metade dos saltos, meio bloco" }],
      [{ en: "worst", pt: "pior" }, "O(√n)", "text", { en: "2√n comparisons", pt: "2√n comparações" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "green", { en: "two indices", pt: "dois índices" }],
    ],
    chartTitle: CHART_TITLE,
    chart: selfIn(CHART, "jump"),
    chartNote: CHART_NOTE,
    when: {
      en: ["Storage where moving backwards is costly: tapes, forward-only iterators, singly linked sorted lists.", "When the comparison is much more expensive than a memory access and √n probes are acceptable."],
      pt: ["Armazenamento em que voltar é caro: fitas, iteradores só para a frente, listas encadeadas ordenadas.", "Quando a comparação é bem mais cara que um acesso à memória e √n sondagens são aceitáveis."],
    },
    pitfalls: {
      en: ["Block size must be √n for the 2√n bound; a fixed block size is linear again.", "The last block may be shorter; clamp the probe index to n − 1.", "On an array in RAM binary search is simply better; jump search is for constrained media."],
      pt: ["O bloco precisa ter √n para o limite 2√n; um bloco de tamanho fixo é linear de novo.", "O último bloco pode ser mais curto; limite o índice da sondagem a n − 1.", "Num vetor em RAM a busca binária é simplesmente melhor; o jump search é para meios com restrição."],
    },
    history: {
      en: "Jump search is folklore from the era of sequential storage; Ben Shneiderman analysed it in 1978 in a paper on searching sorted sequential files, where he showed the √n block is optimal for one level of jumping and √n^(2/3)-style blocks for two.",
      pt: "O jump search é folclore da era do armazenamento sequencial; Ben Shneiderman o analisou em 1978 num artigo sobre busca em arquivos sequenciais ordenados, onde mostrou que o bloco √n é ótimo para um nível de saltos e blocos do tipo n^(2/3) para dois.",
    },
    file: "jump_search",
    code: {
      ts: ["function jumpSearch(array: number[], target: number) {", "  const block = Math.floor(Math.sqrt(array.length));", "  let previous = 0, next = block;", "  while (array[Math.min(next, array.length) - 1] < target) {", "    previous = next;", "    next += block;", "    if (previous >= array.length) return -1;", "  }", "  for (let index = previous; index < Math.min(next, array.length); index++) {", "    if (array[index] === target) return index;", "  }", "  return -1;", "}"],
      py: ["def jump_search(array, target):", "    block = int(math.sqrt(len(array)))", "    previous, next_block = 0, block", "    while array[min(next_block, len(array)) - 1] < target:", "        previous = next_block", "        next_block += block", "        if previous >= len(array): return -1", "", "    for index in range(previous, min(next_block, len(array))):", "        if array[index] == target: return index", "", "    return -1", ""],
      java: ["static int jumpSearch(int[] array, int target) {", "  int block = (int) Math.sqrt(array.length);", "  int previous = 0, next = block;", "  while (array[Math.min(next, array.length) - 1] < target) {", "    previous = next;", "    next += block;", "    if (previous >= array.length) return -1;", "  }", "  for (int index = previous; index < Math.min(next, array.length); index++) {", "    if (array[index] == target) return index;", "  }", "  return -1;", "}"],
      cpp: ["int jumpSearch(const std::vector<int>& array, int target) {", "  int block = std::sqrt(array.size());", "  int previous = 0, next = block;", "  while (array[std::min<int>(next, array.size()) - 1] < target) {", "    previous = next;", "    next += block;", "    if (previous >= (int) array.size()) return -1;", "  }", "  for (int index = previous; index < std::min<int>(next, array.size()); index++) {", "    if (array[index] == target) return index;", "  }", "  return -1;", "}"],
      c: ["int jump_search(const int *array, int length, int target) {", "  int block = (int) sqrt(length);", "  int previous = 0, next = block;", "  while (array[(next < length ? next : length) - 1] < target) {", "    previous = next;", "    next += block;", "    if (previous >= length) return -1;", "  }", "  for (int index = previous; index < (next < length ? next : length); index++) {", "    if (array[index] == target) return index;", "  }", "  return -1;", "}"],
      go: ["func jumpSearch(array []int, target int) int {", "\tblock := int(math.Sqrt(float64(len(array))))", "\tprevious, next := 0, block", "\tfor array[min(next, len(array))-1] < target {", "\t\tprevious = next", "\t\tnext += block", "\t\tif previous >= len(array) { return -1 }", "\t}", "\tfor index := previous; index < min(next, len(array)); index++ {", "\t\tif array[index] == target { return index }", "\t}", "\treturn -1", "}"],
      rs: ["fn jump_search(array: &[i32], target: i32) -> Option<usize> {", "    let block = (array.len() as f64).sqrt() as usize;", "    let (mut previous, mut next) = (0, block);", "    while array[next.min(array.len()) - 1] < target {", "        previous = next;", "        next += block;", "        if previous >= array.len() { return None; }", "    }", "    for index in previous..next.min(array.len()) {", "        if array[index] == target { return Some(index); }", "    }", "    None", "}"],
    },
    pseudo: {
      en: ["JUMPSEARCH(array, target)", "  block ← ⌊√n⌋; previous ← 0; next ← block", "  while array[min(next, n) − 1] < target: previous ← next; next ← next + block", "  for index ← previous to min(next, n) − 1: if array[index] = target: return index", "  return −1"],
      pt: ["JUMPSEARCH(vetor, alvo)", "  bloco ← ⌊√n⌋; anterior ← 0; próximo ← bloco", "  enquanto vetor[min(próximo, n) − 1] < alvo: anterior ← próximo; próximo ← próximo + bloco", "  para índice ← anterior até min(próximo, n) − 1: se vetor[índice] = alvo: retorna índice", "  retorna −1"],
    },
  },

  interpolation: {
    ...SIZE,
    slug: "interpolation-search",
    name: "Interpolation search",
    subtitle: { en: "guess the position from the value", pt: "estima a posição pelo valor" },
    tagline: { en: "interpolation search · how you open a phone book at the S, not in the middle", pt: "interpolation search · como você abre a lista telefônica no S, não no meio" },
    legend: LEGEND,
    kpis: [KPI_COMPARISONS, KPI_RANGE, { key: "guess", label: { en: "ESTIMATE", pt: "ESTIMATIVA" }, sub: { en: "position by proportion", pt: "posição por proporção" } }, KPI_TARGET, KPI_RESULT],
    idea: {
      en: [
        "Binary search always probes the middle. Interpolation search probes where the target would be if the values were spread evenly: a target near the low end of the value range gets a probe near the low end of the index range. The estimate is a straight-line interpolation between the two ends.",
        "When the values really are uniform the range shrinks from n to about √n per probe, which gives log log n probes: four for a million elements. When they are not, a skewed distribution can push every probe one step at a time and the search degrades to linear.",
      ],
      pt: [
        "A busca binária sempre sonda o meio. A busca por interpolação sonda onde o alvo estaria se os valores fossem espalhados uniformemente: um alvo perto do fim baixo da faixa de valores ganha uma sondagem perto do fim baixo da faixa de índices. A estimativa é uma interpolação em linha reta entre as duas pontas.",
        "Quando os valores são de fato uniformes a faixa encolhe de n para cerca de √n por sondagem, o que dá log log n sondagens: quatro para um milhão de elementos. Quando não são, uma distribuição enviesada pode empurrar cada sondagem um passo por vez e a busca degrada para linear.",
      ],
    },
    stages: [
      ["violet", { en: "estimate", pt: "estima" }, { en: "low + (target − array[low]) × (high − low) / (array[high] − array[low])", pt: "baixo + (alvo − vetor[baixo]) × (alto − baixo) / (vetor[alto] − vetor[baixo])" }],
      ["primary", { en: "probe", pt: "sonda" }, { en: "the estimated position", pt: "a posição estimada" }],
      ["vis", { en: "narrow", pt: "estreita" }, { en: "keep the side that can hold the target", pt: "mantém o lado que pode ter o alvo" }],
      ["green", { en: "found", pt: "achou" }, { en: "or the target falls outside the range", pt: "ou o alvo cai fora da faixa" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(1)", "green", { en: "the estimate is exact", pt: "a estimativa é exata" }],
      [{ en: "average", pt: "médio" }, "O(log log n)", "green", { en: "uniformly distributed values", pt: "valores uniformemente distribuídos" }],
      [{ en: "worst", pt: "pior" }, "O(n)", "neg", { en: "exponentially spread values", pt: "valores espalhados exponencialmente" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "green", { en: "two indices", pt: "dois índices" }],
    ],
    chartTitle: CHART_TITLE,
    chart: selfIn(CHART, "interpolation"),
    chartNote: CHART_NOTE,
    when: {
      en: ["Large sorted arrays of roughly uniform numeric keys: timestamps, sequential ids, sensor readings.", "When each probe is expensive (a disk seek, a network round trip) and the distribution is known to be smooth."],
      pt: ["Vetores ordenados grandes de chaves numéricas mais ou menos uniformes: timestamps, ids sequenciais, leituras de sensor.", "Quando cada sondagem é cara (um seek de disco, uma ida à rede) e a distribuição é sabidamente suave."],
    },
    pitfalls: {
      en: ["A few outliers at the ends wreck the estimate; clamp it or fall back to binary search after a bad probe.", "Integer overflow in (target − low) × (high − low) on large keys; use 64-bit or floating point.", "Division by zero when array[high] equals array[low]; check it first."],
      pt: ["Alguns outliers nas pontas arruínam a estimativa; limite-a ou caia para a busca binária depois de uma sondagem ruim.", "Overflow de inteiro em (alvo − baixo) × (alto − baixo) com chaves grandes; use 64 bits ou ponto flutuante.", "Divisão por zero quando vetor[alto] é igual a vetor[baixo]; verifique antes."],
    },
    history: {
      en: "W. W. Peterson proposed it in 1957 for searching sorted files on disk. Yehoshua Perl, Alon Itai and Haim Avni proved the log log n average in 1978, and Gonnet showed how badly it can do on non-uniform data, which is why binary search stayed the default.",
      pt: "W. W. Peterson a propôs em 1957 para buscar em arquivos ordenados em disco. Yehoshua Perl, Alon Itai e Haim Avni provaram a média log log n em 1978, e Gonnet mostrou o quão mal ela pode ir em dados não uniformes, e é por isso que a busca binária continuou sendo o padrão.",
    },
    file: "interpolation_search",
    code: {
      ts: ["function interpolationSearch(array: number[], target: number) {", "  let low = 0, high = array.length - 1;", "  while (low <= high && target >= array[low] && target <= array[high]) {", "    const position = low + Math.floor(((target - array[low]) * (high - low)) / (array[high] - array[low]));", "    if (array[position] === target) return position;", "    if (array[position] < target) low = position + 1;", "    else high = position - 1;", "  }", "  return -1;", "}"],
      py: ["def interpolation_search(array, target):", "    low, high = 0, len(array) - 1", "    while low <= high and array[low] <= target <= array[high]:", "        position = low + (target - array[low]) * (high - low) // (array[high] - array[low])", "        if array[position] == target: return position", "        if array[position] < target: low = position + 1", "        else: high = position - 1", "", "    return -1", ""],
      java: ["static int interpolationSearch(int[] array, int target) {", "  int low = 0, high = array.length - 1;", "  while (low <= high && target >= array[low] && target <= array[high]) {", "    int position = low + (int) ((long) (target - array[low]) * (high - low) / (array[high] - array[low]));", "    if (array[position] == target) return position;", "    if (array[position] < target) low = position + 1;", "    else high = position - 1;", "  }", "  return -1;", "}"],
      cpp: ["int interpolationSearch(const std::vector<int>& array, int target) {", "  int low = 0, high = array.size() - 1;", "  while (low <= high && target >= array[low] && target <= array[high]) {", "    int position = low + (long long) (target - array[low]) * (high - low) / (array[high] - array[low]);", "    if (array[position] == target) return position;", "    if (array[position] < target) low = position + 1;", "    else high = position - 1;", "  }", "  return -1;", "}"],
      c: ["int interpolation_search(const int *array, int length, int target) {", "  int low = 0, high = length - 1;", "  while (low <= high && target >= array[low] && target <= array[high]) {", "    int position = low + (long long) (target - array[low]) * (high - low) / (array[high] - array[low]);", "    if (array[position] == target) return position;", "    if (array[position] < target) low = position + 1;", "    else high = position - 1;", "  }", "  return -1;", "}"],
      go: ["func interpolationSearch(array []int, target int) int {", "\tlow, high := 0, len(array)-1", "\tfor low <= high && target >= array[low] && target <= array[high] {", "\t\tposition := low + (target-array[low])*(high-low)/(array[high]-array[low])", "\t\tif array[position] == target { return position }", "\t\tif array[position] < target { low = position + 1 } else {", "\t\t\thigh = position - 1 }", "\t}", "\treturn -1", "}"],
      rs: ["fn interpolation_search(array: &[i64], target: i64) -> Option<usize> {", "    let (mut low, mut high) = (0i64, array.len() as i64 - 1);", "    while low <= high && target >= array[low as usize] && target <= array[high as usize] {", "        let position = low + (target - array[low as usize]) * (high - low) / (array[high as usize] - array[low as usize]);", "        if array[position as usize] == target { return Some(position as usize); }", "        if array[position as usize] < target { low = position + 1; }", "        else { high = position - 1; }", "    }", "    None", "}"],
    },
    pseudo: {
      en: ["INTERPOLATIONSEARCH(array, target)", "  low ← 0; high ← n − 1", "  while low ≤ high and array[low] ≤ target ≤ array[high]", "    position ← low + ⌊(target − array[low]) × (high − low) / (array[high] − array[low])⌋", "    if array[position] = target: return position", "    if array[position] < target: low ← position + 1 else high ← position − 1", "  return −1"],
      pt: ["INTERPOLATIONSEARCH(vetor, alvo)", "  baixo ← 0; alto ← n − 1", "  enquanto baixo ≤ alto e vetor[baixo] ≤ alvo ≤ vetor[alto]", "    posição ← baixo + ⌊(alvo − vetor[baixo]) × (alto − baixo) / (vetor[alto] − vetor[baixo])⌋", "    se vetor[posição] = alvo: retorna posição", "    se vetor[posição] < alvo: baixo ← posição + 1 senão alto ← posição − 1", "  retorna −1"],
    },
  },

  exponential: {
    ...SIZE,
    slug: "exponential-search",
    name: "Exponential search",
    subtitle: { en: "double the bound, then binary search", pt: "dobra o limite, depois busca binária" },
    tagline: { en: "exponential search · find the neighbourhood by doubling, then halve inside it", pt: "exponential search · acha a vizinhança dobrando, depois divide dentro dela" },
    legend: LEGEND,
    kpis: [KPI_COMPARISONS, { key: "bound", label: { en: "BOUND", pt: "LIMITE" }, sub: { en: "1, 2, 4, 8, … until past the target", pt: "1, 2, 4, 8, … até passar do alvo" } }, KPI_RANGE, { key: "middle", label: { en: "MIDDLE", pt: "MEIO" }, sub: { en: "probe of the binary phase", pt: "sondagem da fase binária" } }, KPI_RESULT],
    idea: {
      en: [
        "Exponential search first finds a range that must contain the target by probing indices 1, 2, 4, 8, … until the value there is at least the target. The target then lies between the last two bounds, a range of at most half the bound, and a binary search finishes the job.",
        "The cost is 2 log i for a target at index i, not log n: a target near the front is found quickly whatever the array size, and the array does not even need a known size. That makes it the standard way to search unbounded or infinite sorted streams.",
      ],
      pt: [
        "A busca exponencial primeiro acha uma faixa que precisa conter o alvo sondando os índices 1, 2, 4, 8, … até o valor ali ser pelo menos o alvo. O alvo então está entre os dois últimos limites, uma faixa de no máximo metade do limite, e uma busca binária termina o serviço.",
        "O custo é 2 log i para um alvo no índice i, não log n: um alvo perto do começo é achado rápido seja qual for o tamanho do vetor, e o vetor nem precisa ter tamanho conhecido. Isso faz dela o jeito padrão de buscar em fluxos ordenados sem limite ou infinitos.",
      ],
    },
    stages: [
      ["violet", { en: "double", pt: "dobra" }, { en: "bound ← 2 × bound while array[bound] < target", pt: "limite ← 2 × limite enquanto vetor[limite] < alvo" }],
      ["primary", { en: "bracket", pt: "delimita" }, { en: "the target is in [bound / 2, bound]", pt: "o alvo está em [limite / 2, limite]" }],
      ["vis", { en: "halve", pt: "divide" }, { en: "binary search inside the bracket", pt: "busca binária dentro da faixa" }],
      ["green", { en: "found", pt: "achou" }, { en: "or the bracket empties", pt: "ou a faixa esvazia" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(1)", "green", { en: "the target is the first element", pt: "o alvo é o primeiro elemento" }],
      [{ en: "average", pt: "médio" }, "O(log i)", "green", { en: "i the target's index, not n", pt: "i o índice do alvo, não n" }],
      [{ en: "worst", pt: "pior" }, "O(log n)", "green", { en: "target at the end: 2 log n probes", pt: "alvo no fim: 2 log n sondagens" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "green", { en: "a bound and two indices", pt: "um limite e dois índices" }],
    ],
    chartTitle: { en: "PROBES AT N = 1 000 000 · TARGET AT INDEX 100", pt: "SONDAGENS EM N = 1.000.000 · ALVO NO ÍNDICE 100" },
    chart: [["exponential", 14, true], ["binary", 20], ["interpolation", 5], ["jump", 1100], ["linear", 101]],
    chartNote: { en: "exponential and linear depend on where the target is, the others on n", pt: "exponencial e linear dependem de onde está o alvo, as outras de n" },
    when: {
      en: ["Unbounded or lazily produced sorted sequences: infinite streams, files read from the front, results of a generator.", "Searches where the target is usually near the beginning, such as merging a small sorted list into a huge one."],
      pt: ["Sequências ordenadas sem limite ou produzidas sob demanda: fluxos infinitos, arquivos lidos do início, resultados de um gerador.", "Buscas em que o alvo costuma estar perto do começo, como fundir uma lista ordenada pequena numa enorme."],
    },
    pitfalls: {
      en: ["Clamp the bound to n − 1 when the array is finite, or the probe runs off the end.", "The binary phase must start at bound / 2, not at 0, or the doubling was wasted.", "For targets near the end it costs twice binary search; use it when the position is unknown or the array unbounded."],
      pt: ["Limite o bound a n − 1 quando o vetor é finito, ou a sondagem sai pelo fim.", "A fase binária precisa começar em limite / 2, não em 0, ou o dobrar foi desperdiçado.", "Para alvos perto do fim custa o dobro da busca binária; use quando a posição é desconhecida ou o vetor sem limite."],
    },
    history: {
      en: "Jon Bentley and Andrew Yao described it in 1976 as a search for unbounded sorted lists, also called galloping or doubling search. Peter McIlroy's 1993 merge and Tim Peters's Timsort use galloping to merge runs of very different lengths in near-linear time.",
      pt: "Jon Bentley e Andrew Yao a descreveram em 1976 como busca em listas ordenadas sem limite, também chamada de galloping ou doubling search. A fusão de Peter McIlroy em 1993 e o Timsort de Tim Peters usam galloping para fundir runs de tamanhos muito diferentes em tempo quase linear.",
    },
    file: "exponential_search",
    code: {
      ts: ["function exponentialSearch(array: number[], target: number) {", "  if (array[0] === target) return 0;", "  let bound = 1;", "  while (bound < array.length && array[bound] < target) bound *= 2;", "  let low = Math.floor(bound / 2), high = Math.min(bound, array.length - 1);", "  while (low <= high) {", "    const middle = (low + high) >> 1;", "    if (array[middle] === target) return middle;", "    if (array[middle] < target) low = middle + 1;", "    else high = middle - 1;", "  }", "  return -1;", "}"],
      py: ["def exponential_search(array, target):", "    if array[0] == target: return 0", "    bound = 1", "    while bound < len(array) and array[bound] < target: bound *= 2", "    low, high = bound // 2, min(bound, len(array) - 1)", "    while low <= high:", "        middle = (low + high) // 2", "        if array[middle] == target: return middle", "        if array[middle] < target: low = middle + 1", "        else: high = middle - 1", "", "    return -1", ""],
      java: ["static int exponentialSearch(int[] array, int target) {", "  if (array[0] == target) return 0;", "  int bound = 1;", "  while (bound < array.length && array[bound] < target) bound *= 2;", "  int low = bound / 2, high = Math.min(bound, array.length - 1);", "  while (low <= high) {", "    int middle = (low + high) >>> 1;", "    if (array[middle] == target) return middle;", "    if (array[middle] < target) low = middle + 1;", "    else high = middle - 1;", "  }", "  return -1;", "}"],
      cpp: ["int exponentialSearch(const std::vector<int>& array, int target) {", "  if (array[0] == target) return 0;", "  int bound = 1;", "  while (bound < (int) array.size() && array[bound] < target) bound *= 2;", "  int low = bound / 2, high = std::min<int>(bound, array.size() - 1);", "  while (low <= high) {", "    int middle = low + (high - low) / 2;", "    if (array[middle] == target) return middle;", "    if (array[middle] < target) low = middle + 1;", "    else high = middle - 1;", "  }", "  return -1;", "}"],
      c: ["int exponential_search(const int *array, int length, int target) {", "  if (array[0] == target) return 0;", "  int bound = 1;", "  while (bound < length && array[bound] < target) bound *= 2;", "  int low = bound / 2, high = bound < length ? bound : length - 1;", "  while (low <= high) {", "    int middle = low + (high - low) / 2;", "    if (array[middle] == target) return middle;", "    if (array[middle] < target) low = middle + 1;", "    else high = middle - 1;", "  }", "  return -1;", "}"],
      go: ["func exponentialSearch(array []int, target int) int {", "\tif array[0] == target { return 0 }", "\tbound := 1", "\tfor bound < len(array) && array[bound] < target { bound *= 2 }", "\tlow, high := bound/2, min(bound, len(array)-1)", "\tfor low <= high {", "\t\tmiddle := low + (high-low)/2", "\t\tif array[middle] == target { return middle }", "\t\tif array[middle] < target { low = middle + 1 } else {", "\t\t\thigh = middle - 1 }", "\t}", "\treturn -1", "}"],
      rs: ["fn exponential_search(array: &[i32], target: i32) -> Option<usize> {", "    if array[0] == target { return Some(0); }", "    let mut bound = 1;", "    while bound < array.len() && array[bound] < target { bound *= 2; }", "    let (mut low, mut high) = ((bound / 2) as isize, bound.min(array.len() - 1) as isize);", "    while low <= high {", "        let middle = low + (high - low) / 2;", "        if array[middle as usize] == target { return Some(middle as usize); }", "        if array[middle as usize] < target { low = middle + 1; }", "        else { high = middle - 1; }", "    }", "    None", "}"],
    },
    pseudo: {
      en: ["EXPONENTIALSEARCH(array, target)", "  if array[0] = target: return 0", "  bound ← 1; while bound < n and array[bound] < target: bound ← 2 × bound", "  low ← bound / 2; high ← min(bound, n − 1)", "  binary search for target inside [low, high]"],
      pt: ["EXPONENTIALSEARCH(vetor, alvo)", "  se vetor[0] = alvo: retorna 0", "  limite ← 1; enquanto limite < n e vetor[limite] < alvo: limite ← 2 × limite", "  baixo ← limite / 2; alto ← min(limite, n − 1)", "  busca binária do alvo dentro de [baixo, alto]"],
    },
  },

  ternary: {
    ...SIZE,
    slug: "ternary-search",
    name: "Ternary search",
    subtitle: { en: "two probes, three thirds", pt: "duas sondagens, três terços" },
    tagline: { en: "ternary search · fewer rounds than binary, more comparisons in total", pt: "ternary search · menos rodadas que a binária, mais comparações no total" },
    legend: LEGEND,
    kpis: [KPI_COMPARISONS, KPI_RANGE, { key: "probes", label: { en: "PROBES", pt: "SONDAGENS" }, sub: { en: "the two cut points", pt: "os dois pontos de corte" } }, KPI_TARGET, KPI_RESULT],
    idea: {
      en: [
        "Ternary search cuts the range at two points, a third and two thirds of the way in, and compares the target with both. That tells which of the three thirds holds the target, so the range shrinks by a factor of three per round instead of two: log₃ n rounds instead of log₂ n.",
        "Each round costs two comparisons, though, and 2 log₃ n is larger than log₂ n. On a sorted array ternary search does more work than binary search. Its real use is different: finding the maximum of a unimodal function, where two probes are needed to know which side is climbing.",
      ],
      pt: [
        "A busca ternária corta a faixa em dois pontos, a um terço e a dois terços, e compara o alvo com os dois. Isso diz qual dos três terços tem o alvo, então a faixa encolhe por um fator de três por rodada em vez de dois: log₃ n rodadas em vez de log₂ n.",
        "Cada rodada custa duas comparações, porém, e 2 log₃ n é maior que log₂ n. Num vetor ordenado a busca ternária faz mais trabalho que a binária. Seu uso real é outro: achar o máximo de uma função unimodal, onde duas sondagens são necessárias para saber que lado está subindo.",
      ],
    },
    stages: [
      ["primary", { en: "probe twice", pt: "sonda duas vezes" }, { en: "at low + third and high − third", pt: "em baixo + terço e alto − terço" }],
      ["green", { en: "hit", pt: "acerta" }, { en: "either probe is the target", pt: "uma das sondagens é o alvo" }],
      ["vis", { en: "pick a third", pt: "escolhe um terço" }, { en: "left, middle or right", pt: "esquerdo, do meio ou direito" }],
      ["violet", { en: "repeat", pt: "repete" }, { en: "until the range empties", pt: "até a faixa esvaziar" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(1)", "green", { en: "a probe hits at once", pt: "uma sondagem acerta de cara" }],
      [{ en: "average", pt: "médio" }, "O(log₃ n)", "text", { en: "rounds; comparisons are 2 log₃ n ≈ 1.26 log₂ n", pt: "rodadas; comparações são 2 log₃ n ≈ 1,26 log₂ n" }],
      [{ en: "worst", pt: "pior" }, "O(log n)", "green", { en: "the target is in the last third every time", pt: "o alvo está no último terço toda vez" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "green", { en: "two indices", pt: "dois índices" }],
    ],
    chartTitle: CHART_TITLE,
    chart: selfIn(CHART, "ternary"),
    chartNote: CHART_NOTE,
    when: {
      en: ["Maximising a unimodal function over a range: the peak of a curve, the best price, the optimal parameter.", "Never for plain lookup in a sorted array; binary search wins."],
      pt: ["Maximizar uma função unimodal num intervalo: o pico de uma curva, o melhor preço, o parâmetro ótimo.", "Nunca para busca simples num vetor ordenado; a binária vence."],
    },
    pitfalls: {
      en: ["More comparisons than binary search, always; the fewer rounds do not pay for the second probe.", "On a unimodal function with plateaus the two probes can be equal and the search loses its direction.", "Off-by-one on the two cut points is easy; the middle third must exclude both probes."],
      pt: ["Mais comparações que a busca binária, sempre; as rodadas a menos não pagam a segunda sondagem.", "Numa função unimodal com platôs as duas sondagens podem ser iguais e a busca perde a direção.", "Erro de um nos dois pontos de corte é fácil; o terço do meio precisa excluir as duas sondagens."],
    },
    history: {
      en: "Ternary search on functions is a classic of numerical optimisation, a cousin of golden-section search, which reuses one of the two probes per round and needs only 1.44 log n evaluations. As an array search it survives mostly as an interview question about why it is not better than binary search.",
      pt: "A busca ternária em funções é um clássico da otimização numérica, prima da busca pela razão áurea, que reaproveita uma das duas sondagens por rodada e precisa de só 1,44 log n avaliações. Como busca em vetor sobrevive principalmente como pergunta de entrevista sobre por que não é melhor que a binária.",
    },
    file: "ternary_search",
    code: {
      ts: ["function ternarySearch(array: number[], target: number) {", "  let low = 0, high = array.length - 1;", "  while (low <= high) {", "    const third = Math.floor((high - low) / 3);", "    const first = low + third, second = high - third;", "    if (array[first] === target) return first;", "    if (array[second] === target) return second;", "    if (target < array[first]) high = first - 1;", "    else if (target > array[second]) low = second + 1;", "    else { low = first + 1; high = second - 1; }", "  }", "  return -1;", "}"],
      py: ["def ternary_search(array, target):", "    low, high = 0, len(array) - 1", "    while low <= high:", "        third = (high - low) // 3", "        first, second = low + third, high - third", "        if array[first] == target: return first", "        if array[second] == target: return second", "        if target < array[first]: high = first - 1", "        elif target > array[second]: low = second + 1", "        else: low, high = first + 1, second - 1", "", "    return -1", ""],
      java: ["static int ternarySearch(int[] array, int target) {", "  int low = 0, high = array.length - 1;", "  while (low <= high) {", "    int third = (high - low) / 3;", "    int first = low + third, second = high - third;", "    if (array[first] == target) return first;", "    if (array[second] == target) return second;", "    if (target < array[first]) high = first - 1;", "    else if (target > array[second]) low = second + 1;", "    else { low = first + 1; high = second - 1; }", "  }", "  return -1;", "}"],
      cpp: ["int ternarySearch(const std::vector<int>& array, int target) {", "  int low = 0, high = array.size() - 1;", "  while (low <= high) {", "    int third = (high - low) / 3;", "    int first = low + third, second = high - third;", "    if (array[first] == target) return first;", "    if (array[second] == target) return second;", "    if (target < array[first]) high = first - 1;", "    else if (target > array[second]) low = second + 1;", "    else { low = first + 1; high = second - 1; }", "  }", "  return -1;", "}"],
      c: ["int ternary_search(const int *array, int length, int target) {", "  int low = 0, high = length - 1;", "  while (low <= high) {", "    int third = (high - low) / 3;", "    int first = low + third, second = high - third;", "    if (array[first] == target) return first;", "    if (array[second] == target) return second;", "    if (target < array[first]) high = first - 1;", "    else if (target > array[second]) low = second + 1;", "    else { low = first + 1; high = second - 1; }", "  }", "  return -1;", "}"],
      go: ["func ternarySearch(array []int, target int) int {", "\tlow, high := 0, len(array)-1", "\tfor low <= high {", "\t\tthird := (high - low) / 3", "\t\tfirst, second := low+third, high-third", "\t\tif array[first] == target { return first }", "\t\tif array[second] == target { return second }", "\t\tif target < array[first] { high = first - 1", "\t\t} else if target > array[second] { low = second + 1", "\t\t} else { low, high = first+1, second-1 }", "\t}", "\treturn -1", "}"],
      rs: ["fn ternary_search(array: &[i32], target: i32) -> Option<usize> {", "    let (mut low, mut high) = (0isize, array.len() as isize - 1);", "    while low <= high {", "        let third = (high - low) / 3;", "        let (first, second) = (low + third, high - third);", "        if array[first as usize] == target { return Some(first as usize); }", "        if array[second as usize] == target { return Some(second as usize); }", "        if target < array[first as usize] { high = first - 1; }", "        else if target > array[second as usize] { low = second + 1; }", "        else { low = first + 1; high = second - 1; }", "    }", "    None", "}"],
    },
    pseudo: {
      en: ["TERNARYSEARCH(array, target)", "  low ← 0; high ← n − 1", "  while low ≤ high", "    first ← low + ⌊(high − low) / 3⌋; second ← high − ⌊(high − low) / 3⌋", "    if array[first] = target or array[second] = target: return it", "    if target < array[first]: high ← first − 1; else if target > array[second]: low ← second + 1; else: low ← first + 1, high ← second − 1", "  return −1"],
      pt: ["TERNARYSEARCH(vetor, alvo)", "  baixo ← 0; alto ← n − 1", "  enquanto baixo ≤ alto", "    primeiro ← baixo + ⌊(alto − baixo) / 3⌋; segundo ← alto − ⌊(alto − baixo) / 3⌋", "    se vetor[primeiro] = alvo ou vetor[segundo] = alvo: retorna", "    se alvo < vetor[primeiro]: alto ← primeiro − 1; senão se alvo > vetor[segundo]: baixo ← segundo + 1; senão: baixo ← primeiro + 1, alto ← segundo − 1", "  retorna −1"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
