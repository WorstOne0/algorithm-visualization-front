// Models
import type { AlgorithmSpec, KpiSpec } from "./spec";

const SIZE = { sizeLabel: { en: "Size", pt: "Tamanho" }, minN: 8, maxN: 64, stepN: 4, defaultN: 32, shuffleLabel: { en: "New target", pt: "Novo alvo" }, stepMs: 380 } as const;

const KPI_COMPARISONS: KpiSpec = { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "probes so far", pt: "sondagens até aqui" } };
const KPI_TARGET: KpiSpec = { key: "target", label: { en: "TARGET", pt: "ALVO" }, sub: { en: "value we look for", pt: "valor procurado" } };
const KPI_RESULT: KpiSpec = { key: "result", label: { en: "RESULT", pt: "RESULTADO" }, sub: { en: "index once found", pt: "índice ao achar" } };

const CHART_NOTE = { en: "average over random targets · sorted input for all but linear", pt: "média sobre alvos aleatórios · entrada ordenada para todos, menos a linear" };

export const SEARCHING = {
  linear: {
    ...SIZE,
    family: "searching",
    slug: "linear-search",
    kind: "search",
    name: "Linear search",
    subtitle: { en: "sequential scan · no preconditions", pt: "varredura sequencial · sem pré-condições" },
    tagline: { en: "linear search · look at everything, one at a time", pt: "busca linear · olha tudo, um por vez" },
    legend: [["primary", { en: "probe", pt: "sonda" }], ["violet", { en: "target", pt: "alvo" }], ["green", { en: "found", pt: "achou" }]],
    kpis: [
      { ...KPI_COMPARISONS, sub: { en: "one per element checked", pt: "uma por elemento verificado" } },
      { key: "index", label: { en: "INDEX", pt: "ÍNDICE" }, sub: { en: "position being checked", pt: "posição verificada" } },
      KPI_TARGET,
      { key: "checked", unitKey: "checkedUnit", label: { en: "CHECKED", pt: "VERIFICADOS" }, sub: { en: "elements seen so far", pt: "elementos vistos até aqui" } },
      KPI_RESULT,
    ],
    idea: {
      en: [
        "Linear search checks the elements one by one, from the first, until it finds the target or runs out. It asks nothing of the data: not sorted, not indexed, not even in memory, a stream works.",
        "The cost is proportional to the position of the target: n/2 comparisons on average when it is present, n when it is not. That is fine for a few hundred elements or a single lookup, and hopeless for a million lookups in a million elements.",
      ],
      pt: [
        "A busca linear verifica os elementos um por um, a partir do primeiro, até achar o alvo ou acabar. Ela não exige nada dos dados: nem ordenados, nem indexados, nem sequer em memória, um fluxo serve.",
        "O custo é proporcional à posição do alvo: n/2 comparações na média quando ele existe, n quando não. Isso é bom para algumas centenas de elementos ou uma consulta só, e inviável para um milhão de consultas num milhão de elementos.",
      ],
    },
    stages: [
      ["primary", { en: "probe", pt: "sonda" }, { en: "look at array[index]", pt: "olha array[index]" }],
      ["act", { en: "compare", pt: "compara" }, { en: "is it the target?", pt: "é o alvo?" }],
      ["swap", { en: "advance", pt: "avança" }, { en: "i ← i + 1", pt: "i ← i + 1" }],
      ["green", { en: "found", pt: "achou" }, { en: "return i, or −1 at the end", pt: "retorna i, ou −1 no fim" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(1)", "green", { en: "target is the first element", pt: "o alvo é o primeiro elemento" }],
      [{ en: "average", pt: "médio" }, "O(n)", "text", { en: "n/2 comparisons when present", pt: "n/2 comparações quando existe" }],
      [{ en: "worst", pt: "pior" }, "O(n)", "neg", { en: "target last, or absent", pt: "alvo por último, ou ausente" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "text", { en: "one index", pt: "um índice" }],
    ],
    chartTitle: { en: "COMPARISONS AT N = 1 000 · TARGET PRESENT", pt: "COMPARAÇÕES EM N = 1.000 · ALVO PRESENTE" },
    chart: [["linear", 500, true], ["jump", 63], ["binary", 10], ["interpolation", 4], ["hash table", 1]],
    chartNote: CHART_NOTE,
    when: {
      en: ["Unsorted or tiny collections, a single lookup, or data you can only read once from front to back.", "As the inner loop of everything else: a block scan inside jump search, a bucket walk inside a hash table."],
      pt: ["Coleções desordenadas ou minúsculas, uma consulta única, ou dados que só dá para ler uma vez do início ao fim.", "Como laço interno de todo o resto: a varredura de bloco no jump search, o percurso de um balde numa tabela hash."],
    },
    pitfalls: {
      en: ["Repeated lookups in the same array: sort it once and use binary search, or build a hash table.", "Comparing objects field by field inside the loop hides an O(n · k) cost; compare a key.", "A sentinel at the end removes the bounds check but is easy to forget to remove."],
      pt: ["Consultas repetidas no mesmo vetor: ordene uma vez e use busca binária, ou monte uma tabela hash.", "Comparar objetos campo a campo dentro do laço esconde um custo O(n · k); compare uma chave.", "Um sentinela no fim tira a checagem de limite, mas é fácil esquecer de removê-lo."],
    },
    history: {
      en: "Linear search is as old as lists themselves; Knuth's 1973 volume on searching opens with it as the baseline every other method is measured against, and the sentinel trick that saves the bounds check is one of the first optimisations he presents.",
      pt: "A busca linear é tão antiga quanto as listas; o volume de Knuth sobre busca, de 1973, abre com ela como a linha de base contra a qual todos os outros métodos são medidos, e o truque do sentinela que economiza a checagem de limite é uma das primeiras otimizações que ele apresenta.",
    },
    file: "linear_search",
    code: {
      ts: ["function linearSearch(array: number[], target: number) {", "  for (let index = 0; index < array.length; index++) {", "    if (array[index] === target) return index;", "  }", "  return -1;", "}"],
      py: ["def linear_search(array, target):", "    for index in range(len(array)):", "        if array[index] == target: return index", "", "    return -1", ""],
      java: ["static int linearSearch(int[] array, int target) {", "  for (int index = 0; index < array.length; index++) {", "    if (array[index] == target) return index;", "  }", "  return -1;", "}"],
      cpp: ["int linearSearch(const std::vector<int>& array, int target) {", "  for (size_t index = 0; index < array.size(); index++) {", "    if (array[index] == target) return index;", "  }", "  return -1;", "}"],
      c: ["int linear_search(const int *array, int length, int target) {", "  for (int index = 0; index < length; index++) {", "    if (array[index] == target) return index;", "  }", "  return -1;", "}"],
      go: ["func linearSearch(array []int, target int) int {", "\tfor index := 0; index < len(array); index++ {", "\t\tif array[index] == target { return index }", "\t}", "\treturn -1", "}"],
      rs: ["fn linear_search(array: &[i32], target: i32) -> Option<usize> {", "    for index in 0..array.len() {", "        if array[index] == target { return Some(index); }", "    }", "    None", "}"],
    },
    pseudo: {
      en: ["LINEARSEARCH(array, target)", "  for index ← 0 to n − 1", "    if array[index] = target: return index", "  return −1"],
      pt: ["LINEARSEARCH(vetor, alvo)", "  para índice ← 0 até n − 1", "    se vetor[índice] = alvo: retorna índice", "  retorna −1"],
    },
  },

  binary: {
    ...SIZE,
    family: "searching",
    slug: "binary-search",
    kind: "search",
    name: "Binary search",
    subtitle: { en: "sorted array · halve the range", pt: "vetor ordenado · divide a faixa ao meio" },
    tagline: { en: "binary search · twenty questions on a sorted array", pt: "busca binária · vinte perguntas num vetor ordenado" },
    legend: [["vis", { en: "discarded", pt: "descartado" }], ["primary", { en: "middle", pt: "meio" }], ["violet", { en: "target", pt: "alvo" }], ["green", { en: "found", pt: "achou" }]],
    kpis: [
      { ...KPI_COMPARISONS, sub: { en: "at most ⌈log₂ n⌉ + 1", pt: "no máximo ⌈log₂ n⌉ + 1" } },
      { key: "range", unitKey: "rangeUnit", label: { en: "RANGE", pt: "FAIXA" }, sub: { en: "elements still possible", pt: "elementos ainda possíveis" } },
      { key: "mid", label: { en: "MIDDLE", pt: "MEIO" }, sub: { en: "index being probed", pt: "índice sondado" } },
      KPI_TARGET,
      KPI_RESULT,
    ],
    idea: {
      en: [
        "Binary search keeps a range [low, high] that must contain the target, looks at the middle element, and throws away the half that cannot contain it. Because the array is sorted, one comparison tells which half: smaller means look left, larger means look right.",
        "Each probe halves the range, so a million elements take at most twenty probes. The precondition is the whole trick: sorting once costs n log n, and after that every lookup is logarithmic.",
      ],
      pt: [
        "A busca binária mantém uma faixa [low, high] que deve conter o alvo, olha o elemento do meio e joga fora a metade que não pode contê-lo. Como o vetor está ordenado, uma comparação diz qual metade: menor significa olhar à esquerda, maior significa olhar à direita.",
        "Cada sondagem divide a faixa ao meio, então um milhão de elementos levam no máximo vinte sondagens. A pré-condição é o truque inteiro: ordenar uma vez custa n log n, e depois disso toda consulta é logarítmica.",
      ],
    },
    stages: [
      ["primary", { en: "probe", pt: "sonda" }, { en: "middle ← (low + high) / 2", pt: "middle ← (low + high) / 2" }],
      ["act", { en: "compare", pt: "compara" }, { en: "array[middle] against the target", pt: "array[middle] com o alvo" }],
      ["vis", { en: "halve", pt: "divide" }, { en: "keep the half that can hold it", pt: "mantém a metade que pode contê-lo" }],
      ["green", { en: "found", pt: "achou" }, { en: "array[middle] = target, or range empty", pt: "array[middle] = alvo, ou faixa vazia" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(1)", "green", { en: "target sits exactly in the middle", pt: "o alvo está exatamente no meio" }],
      [{ en: "average", pt: "médio" }, "O(log n)", "green", { en: "≈ log₂ n − 1 probes", pt: "≈ log₂ n − 1 sondagens" }],
      [{ en: "worst", pt: "pior" }, "O(log n)", "green", { en: "⌈log₂ n⌉ + 1 probes, present or not", pt: "⌈log₂ n⌉ + 1 sondagens, presente ou não" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "text", { en: "two indices", pt: "dois índices" }],
    ],
    chartTitle: { en: "COMPARISONS AT N = 1 000 · TARGET PRESENT", pt: "COMPARAÇÕES EM N = 1.000 · ALVO PRESENTE" },
    chart: [["linear", 500], ["jump", 63], ["binary", 10, true], ["interpolation", 4], ["hash table", 1]],
    chartNote: CHART_NOTE,
    when: {
      en: ["Any sorted array, or anything that behaves like one: a monotone function, a version history, a range of answers to a yes/no question.", "Lookups that repeat: pay the sort once, then answer each query in twenty steps."],
      pt: ["Qualquer vetor ordenado, ou qualquer coisa que se comporte como um: uma função monótona, um histórico de versões, uma faixa de respostas a uma pergunta sim/não.", "Consultas que se repetem: pague a ordenação uma vez, depois responda cada consulta em vinte passos."],
    },
    pitfalls: {
      en: ["(lo + hi) / 2 overflows in fixed-width integers; write lo + (hi − lo) / 2. Java's own binary search had this bug for nine years.", "Off-by-one errors in the bounds: an inclusive hi needs lo ≤ hi and hi = mid − 1; mixing conventions loops forever.", "On a linked list there is no O(1) access to the middle: the halving buys nothing."],
      pt: ["(lo + hi) / 2 estoura em inteiros de largura fixa; escreva lo + (hi − lo) / 2. A busca binária do próprio Java teve esse bug por nove anos.", "Erros de um nos limites: um hi inclusivo precisa de lo ≤ hi e hi = mid − 1; misturar convenções roda para sempre.", "Numa lista ligada não há acesso O(1) ao meio: dividir ao meio não compra nada."],
    },
    history: {
      en: "John Mauchly presented binary search in 1946, in the same Moore School lectures that described insertion sort. The first version that worked for every array size was not published until 1962, by Lehmer and then Bottenbruch, and Jon Bentley found in 1986 that 90% of professional programmers could not write it correctly.",
      pt: "John Mauchly apresentou a busca binária em 1946, nas mesmas palestras da Moore School que descreveram o insertion sort. A primeira versão que funcionava para qualquer tamanho de vetor só foi publicada em 1962, por Lehmer e depois Bottenbruch, e Jon Bentley descobriu em 1986 que 90% dos programadores profissionais não conseguiam escrevê-la corretamente.",
    },
    file: "binary_search",
    code: {
      ts: ["function binarySearch(array: number[], target: number) {", "  let low = 0, high = array.length - 1;", "  while (low <= high) {", "    const middle = (low + high) >> 1;", "    if (array[middle] === target) return middle;", "    if (array[middle] < target) low = middle + 1;", "    else high = middle - 1;", "  }", "  return -1;", "}"],
      py: ["def binary_search(array, target):", "    low, high = 0, len(array) - 1", "    while low <= high:", "        middle = (low + high) // 2", "        if array[middle] == target: return middle", "        if array[middle] < target: low = middle + 1", "        else: high = middle - 1", "", "    return -1", ""],
      java: ["static int binarySearch(int[] array, int target) {", "  int low = 0, high = array.length - 1;", "  while (low <= high) {", "    int middle = (low + high) >>> 1;", "    if (array[middle] == target) return middle;", "    if (array[middle] < target) low = middle + 1;", "    else high = middle - 1;", "  }", "  return -1;", "}"],
      cpp: ["int binarySearch(const std::vector<int>& array, int target) {", "  int low = 0, high = array.size() - 1;", "  while (low <= high) {", "    int middle = low + (high - low) / 2;", "    if (array[middle] == target) return middle;", "    if (array[middle] < target) low = middle + 1;", "    else high = middle - 1;", "  }", "  return -1;", "}"],
      c: ["int binary_search(const int *array, int length, int target) {", "  int low = 0, high = length - 1;", "  while (low <= high) {", "    int middle = low + (high - low) / 2;", "    if (array[middle] == target) return middle;", "    if (array[middle] < target) low = middle + 1;", "    else high = middle - 1;", "  }", "  return -1;", "}"],
      go: ["func binarySearch(array []int, target int) int {", "\tlow, high := 0, len(array)-1", "\tfor low <= high {", "\t\tmiddle := low + (high-low)/2", "\t\tif array[middle] == target { return middle }", "\t\tif array[middle] < target { low = middle + 1 } else {", "\t\t\thigh = middle - 1 }", "\t}", "\treturn -1", "}"],
      rs: ["fn binary_search(array: &[i32], target: i32) -> Option<usize> {", "    let (mut low, mut high) = (0isize, array.len() as isize - 1);", "    while low <= high {", "        let middle = low + (high - low) / 2;", "        if array[middle as usize] == target { return Some(middle as usize); }", "        if array[middle as usize] < target { low = middle + 1; }", "        else { high = middle - 1; }", "    }", "    None", "}"],
    },
    pseudo: {
      en: ["BINARYSEARCH(array, target)", "  low ← 0; high ← n − 1", "  while low ≤ high", "    middle ← ⌊(low + high) / 2⌋", "    if array[middle] = target: return middle", "    if array[middle] < target: low ← middle + 1 else high ← middle − 1", "  return −1"],
      pt: ["BINARYSEARCH(vetor, alvo)", "  baixo ← 0; alto ← n − 1", "  enquanto baixo ≤ alto", "    meio ← ⌊(baixo + alto) / 2⌋", "    se vetor[meio] = alvo: retorna meio", "    se vetor[meio] < alvo: baixo ← meio + 1 senão alto ← meio − 1", "  retorna −1"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
