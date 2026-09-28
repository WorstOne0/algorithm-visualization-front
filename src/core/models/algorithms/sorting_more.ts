// Models
import type { Localized } from "../translations";
import type { VizKey } from "../viz";
import type { AlgorithmSpec, KpiSpec } from "./spec";

const SIZE = { sizeLabel: { en: "Size", pt: "Tamanho" }, minN: 8, maxN: 64, stepN: 4, defaultN: 24, shuffleLabel: { en: "Shuffle", pt: "Embaralhar" }, stepMs: 240, family: "sorting", kind: "bars" } as const;

const LEGEND: [VizKey, Localized][] = [["primary", { en: "comparing", pt: "comparando" }], ["swap", { en: "swapped", pt: "trocado" }], ["green", { en: "in place", pt: "no lugar" }]];
const LEGEND_HELD: [VizKey, Localized][] = [["violet", { en: "lifted out", pt: "levantado" }], ["primary", { en: "comparing", pt: "comparando" }], ["swap", { en: "moved", pt: "movido" }], ["green", { en: "in place", pt: "no lugar" }]];

const KPI_COMPARISONS: KpiSpec = { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "so far", pt: "até aqui" } };
const KPI_SWAPS: KpiSpec = { key: "swaps", label: { en: "SWAPS", pt: "TROCAS" }, sub: { en: "one per inversion fixed", pt: "uma por inversão corrigida" } };
const KPI_IN_PLACE: KpiSpec = { key: "inPlace", unitKey: "inPlaceUnit", label: { en: "IN PLACE", pt: "NO LUGAR" }, sub: { en: "final positions so far", pt: "posições finais até aqui" } };

const CHART_TITLE = { en: "COMPARISONS AT N = 1 000 · RANDOM INPUT", pt: "COMPARAÇÕES EM N = 1.000 · ENTRADA ALEATÓRIA" };
const CHART_NOTE = { en: "same random input for every algorithm", pt: "a mesma entrada aleatória para todos" };

export const SORTING_MORE = {
  cocktail: {
    ...SIZE,
    slug: "cocktail-shaker-sort",
    name: "Cocktail shaker",
    subtitle: { en: "bubble sort in both directions", pt: "bubble sort nas duas direções" },
    tagline: { en: "cocktail shaker · the largest goes up, then the smallest comes down", pt: "cocktail shaker · o maior sobe, depois o menor desce" },
    legend: LEGEND,
    kpis: [KPI_COMPARISONS, KPI_SWAPS, { key: "pass", label: { en: "ROUND", pt: "RODADA" }, sub: { en: "one sweep each way", pt: "uma varredura para cada lado" } }, KPI_IN_PLACE, { key: "remaining", label: { en: "UNSORTED", pt: "DESORDENADOS" }, sub: { en: "still in the window", pt: "ainda na janela" } }],
    idea: {
      en: [
        "Cocktail shaker sort is bubble sort that changes direction after every pass: a sweep to the right carries the largest unsorted value to its final place, then a sweep to the left carries the smallest one to its place. The unsorted window shrinks from both ends.",
        "The point is the turtle: in plain bubble sort a small value near the end moves left only one position per pass, so it can cost as many passes as there are elements. Sweeping back picks it up in one go. The worst case stays quadratic, but on typical input it roughly halves the number of passes.",
      ],
      pt: [
        "O cocktail shaker é o bubble sort que muda de direção a cada passada: uma varredura para a direita leva o maior valor desordenado ao seu lugar final, depois uma varredura para a esquerda leva o menor ao lugar dele. A janela desordenada encolhe pelas duas pontas.",
        "A questão é a tartaruga: no bubble sort comum um valor pequeno perto do fim anda uma posição à esquerda por passada, então pode custar tantas passadas quanto elementos. A varredura de volta o pega de uma vez. O pior caso continua quadrático, mas em entradas típicas o número de passadas cai mais ou menos pela metade.",
      ],
    },
    stages: [
      ["primary", { en: "sweep right", pt: "varre à direita" }, { en: "swap neighbours out of order", pt: "troca vizinhos fora de ordem" }],
      ["green", { en: "settle the end", pt: "assenta o fim" }, { en: "the largest is final", pt: "o maior é definitivo" }],
      ["swap", { en: "sweep left", pt: "varre à esquerda" }, { en: "the same, backwards", pt: "o mesmo, de trás para a frente" }],
      ["green", { en: "settle the start", pt: "assenta o começo" }, { en: "the smallest is final", pt: "o menor é definitivo" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n)", "green", { en: "already sorted: one round, no swap", pt: "já ordenado: uma rodada, sem troca" }],
      [{ en: "average", pt: "médio" }, "O(n²)", "neg", { en: "about half the passes of bubble sort", pt: "cerca de metade das passadas do bubble sort" }],
      [{ en: "worst", pt: "pior" }, "O(n²)", "neg", { en: "reversed input", pt: "entrada invertida" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "green", { en: "in place", pt: "no lugar" }],
    ],
    chartTitle: CHART_TITLE,
    chart: [["bubble", 499500], ["cocktail", 470000, true], ["insertion", 250000], ["quick", 13900], ["merge", 8700]],
    chartNote: CHART_NOTE,
    when: {
      en: ["Teaching the turtle problem: the one input where it clearly beats bubble sort.", "Nearly sorted data with a few small values at the end."],
      pt: ["Ensinar o problema da tartaruga: a entrada em que ele claramente vence o bubble sort.", "Dados quase ordenados com alguns valores pequenos no fim."],
    },
    pitfalls: {
      en: ["Still O(n²) comparisons; it saves passes, not comparisons.", "Forgetting to shrink both ends repeats work already settled.", "Insertion sort beats it on every input for the same code size."],
      pt: ["Ainda O(n²) comparações; economiza passadas, não comparações.", "Esquecer de encolher as duas pontas repete trabalho já assentado.", "O insertion sort o vence em toda entrada com o mesmo tamanho de código."],
    },
    history: {
      en: "Also called bidirectional bubble sort, shaker sort or ripple sort, it appears in Knuth's 1973 volume on sorting as a cure for the turtle problem, with the remark that it still does not beat straight insertion. The cocktail name comes from the back-and-forth motion of shaking a drink.",
      pt: "Também chamado de bubble sort bidirecional, shaker sort ou ripple sort, aparece no volume de Knuth de 1973 sobre ordenação como remédio para o problema da tartaruga, com a observação de que ainda assim não vence o insertion sort. O nome cocktail vem do vai e vem de bater um drink.",
    },
    file: "cocktail_sort",
    code: {
      ts: ["function cocktailSort(array: number[]) {", "  let low = 0, high = array.length - 1;", "  while (low < high) {", "    for (let j = low; j < high; j++) {", "      if (array[j] > array[j + 1]) swap(array, j, j + 1);", "    }", "    high--;", "    for (let j = high; j > low; j--) {", "      if (array[j - 1] > array[j]) swap(array, j - 1, j);", "    }", "    low++;", "  }", "}"],
      py: ["def cocktail_sort(array):", "    low, high = 0, len(array) - 1", "    while low < high:", "        for j in range(low, high):", "            if array[j] > array[j + 1]: swap(array, j, j + 1)", "", "        high -= 1", "        for j in range(high, low, -1):", "            if array[j - 1] > array[j]: swap(array, j - 1, j)", "", "        low += 1", "", ""],
      java: ["static void cocktailSort(int[] array) {", "  int low = 0, high = array.length - 1;", "  while (low < high) {", "    for (int j = low; j < high; j++) {", "      if (array[j] > array[j + 1]) swap(array, j, j + 1);", "    }", "    high--;", "    for (int j = high; j > low; j--) {", "      if (array[j - 1] > array[j]) swap(array, j - 1, j);", "    }", "    low++;", "  }", "}"],
      cpp: ["void cocktailSort(std::vector<int>& array) {", "  int low = 0, high = array.size() - 1;", "  while (low < high) {", "    for (int j = low; j < high; j++) {", "      if (array[j] > array[j + 1]) std::swap(array[j], array[j + 1]);", "    }", "    high--;", "    for (int j = high; j > low; j--) {", "      if (array[j - 1] > array[j]) std::swap(array[j - 1], array[j]);", "    }", "    low++;", "  }", "}"],
      c: ["void cocktail_sort(int *array, int length) {", "  int low = 0, high = length - 1;", "  while (low < high) {", "    for (int j = low; j < high; j++) {", "      if (array[j] > array[j + 1]) swap(array, j, j + 1);", "    }", "    high--;", "    for (int j = high; j > low; j--) {", "      if (array[j - 1] > array[j]) swap(array, j - 1, j);", "    }", "    low++;", "  }", "}"],
      go: ["func cocktailSort(array []int) {", "\tlow, high := 0, len(array)-1", "\tfor low < high {", "\t\tfor j := low; j < high; j++ {", "\t\t\tif array[j] > array[j+1] { array[j], array[j+1] = array[j+1], array[j] }", "\t\t}", "\t\thigh--", "\t\tfor j := high; j > low; j-- {", "\t\t\tif array[j-1] > array[j] { array[j-1], array[j] = array[j], array[j-1] }", "\t\t}", "\t\tlow++", "\t}", "}"],
      rs: ["fn cocktail_sort(array: &mut [i32]) {", "    let (mut low, mut high) = (0, array.len() - 1);", "    while low < high {", "        for j in low..high {", "            if array[j] > array[j + 1] { array.swap(j, j + 1); }", "        }", "        high -= 1;", "        for j in (low + 1..=high).rev() {", "            if array[j - 1] > array[j] { array.swap(j - 1, j); }", "        }", "        low += 1;", "    }", "}"],
    },
    pseudo: {
      en: ["COCKTAILSORT(array)", "  low ← 0; high ← n − 1", "  while low < high", "    sweep j from low to high − 1: swap array[j], array[j + 1] if out of order; high ← high − 1", "    sweep j from high down to low + 1: swap array[j − 1], array[j] if out of order; low ← low + 1"],
      pt: ["COCKTAILSORT(vetor)", "  baixo ← 0; alto ← n − 1", "  enquanto baixo < alto", "    varre j de baixo a alto − 1: troca vetor[j], vetor[j + 1] se fora de ordem; alto ← alto − 1", "    varre j de alto até baixo + 1: troca vetor[j − 1], vetor[j] se fora de ordem; baixo ← baixo + 1"],
    },
  },

  gnome: {
    ...SIZE,
    slug: "gnome-sort",
    name: "Gnome sort",
    subtitle: { en: "one pointer, forward and back", pt: "um ponteiro, para a frente e para trás" },
    tagline: { en: "gnome sort · the garden gnome lining up flower pots", pt: "gnome sort · o gnomo de jardim alinhando vasos" },
    legend: LEGEND,
    kpis: [KPI_COMPARISONS, KPI_SWAPS, { key: "index", label: { en: "POINTER", pt: "PONTEIRO" }, sub: { en: "where the gnome stands", pt: "onde o gnomo está" } }, { key: "backSteps", label: { en: "STEPS BACK", pt: "PASSOS ATRÁS" }, sub: { en: "after a swap", pt: "depois de uma troca" } }, { key: "prefix", label: { en: "SORTED PREFIX", pt: "PREFIXO ORDENADO" }, sub: { en: "everything left of the pointer", pt: "tudo à esquerda do ponteiro" } }],
    idea: {
      en: [
        "Gnome sort has one pointer and one rule. If the element under the pointer is not smaller than the one before it, step forward; otherwise swap the two and step back. Everything to the left of the pointer is always sorted, so when the pointer walks off the end the array is done.",
        "It is insertion sort written without a nested loop: the stepping back is the inner loop, done with swaps instead of shifts. Same comparisons, more writes, and a listing short enough to remember.",
      ],
      pt: [
        "O gnome sort tem um ponteiro e uma regra. Se o elemento sob o ponteiro não é menor que o anterior, avança; senão troca os dois e recua. Tudo à esquerda do ponteiro está sempre ordenado, então quando o ponteiro sai pelo fim o vetor está pronto.",
        "É o insertion sort escrito sem laço aninhado: o recuo é o laço interno, feito com trocas em vez de deslocamentos. As mesmas comparações, mais escritas, e uma listagem curta o bastante para decorar.",
      ],
    },
    stages: [
      ["primary", { en: "compare", pt: "compara" }, { en: "the pointer with its left neighbour", pt: "o ponteiro com o vizinho da esquerda" }],
      ["green", { en: "step forward", pt: "avança" }, { en: "in order: the prefix grew", pt: "em ordem: o prefixo cresceu" }],
      ["swap", { en: "swap", pt: "troca" }, { en: "out of order: exchange them", pt: "fora de ordem: troca os dois" }],
      ["violet", { en: "step back", pt: "recua" }, { en: "check the pair before", pt: "confere o par anterior" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n)", "green", { en: "already sorted: n − 1 comparisons", pt: "já ordenado: n − 1 comparações" }],
      [{ en: "average", pt: "médio" }, "O(n²)", "neg", { en: "like insertion sort", pt: "como o insertion sort" }],
      [{ en: "worst", pt: "pior" }, "O(n²)", "neg", { en: "reversed input", pt: "entrada invertida" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "green", { en: "one pointer", pt: "um ponteiro" }],
    ],
    chartTitle: CHART_TITLE,
    chart: [["bubble", 499500], ["gnome", 250000, true], ["insertion", 250000], ["quick", 13900], ["merge", 8700]],
    chartNote: { en: "gnome does insertion's comparisons with three times the writes", pt: "o gnome faz as comparações do insertion com três vezes as escritas" },
    when: {
      en: ["When the code must be tiny: embedded scripts, interview whiteboards, a shell one-liner.", "Nearly sorted input, where it runs in almost linear time."],
      pt: ["Quando o código precisa ser minúsculo: scripts embarcados, quadro de entrevista, uma linha de shell.", "Entrada quase ordenada, em que roda em tempo quase linear."],
    },
    pitfalls: {
      en: ["Every step back is a swap of two writes; insertion sort's shift is one.", "The optimised version remembers where it was before stepping back, and jumps straight there.", "It is not stable if the comparison is strict in the wrong direction; keep the ≤."],
      pt: ["Cada passo atrás é uma troca de duas escritas; o deslocamento do insertion é uma.", "A versão otimizada lembra onde estava antes de recuar e volta direto para lá.", "Não é estável se a comparação for estrita na direção errada; mantenha o ≤."],
    },
    history: {
      en: "Hamid Sarbazi-Azad described it in 2000 as stupid sort; Dick Grune renamed it gnome sort after the Dutch garden gnome who sorts flower pots by looking at the pot next to him. It is the simplest correct sorting loop that can be written.",
      pt: "Hamid Sarbazi-Azad o descreveu em 2000 como stupid sort; Dick Grune o rebatizou de gnome sort por causa do gnomo de jardim holandês que ordena vasos olhando o vaso ao lado. É o laço de ordenação correto mais simples que se consegue escrever.",
    },
    file: "gnome_sort",
    code: {
      ts: ["function gnomeSort(array: number[]) {", "  let index = 0;", "  while (index < array.length) {", "    if (index === 0 || array[index - 1] <= array[index]) {", "      index++;", "    } else {", "      swap(array, index - 1, index);", "      index--;", "    }", "  }", "}"],
      py: ["def gnome_sort(array):", "    index = 0", "    while index < len(array):", "        if index == 0 or array[index - 1] <= array[index]:", "            index += 1", "        else:", "            swap(array, index - 1, index)", "            index -= 1", "", "", ""],
      java: ["static void gnomeSort(int[] array) {", "  int index = 0;", "  while (index < array.length) {", "    if (index == 0 || array[index - 1] <= array[index]) {", "      index++;", "    } else {", "      swap(array, index - 1, index);", "      index--;", "    }", "  }", "}"],
      cpp: ["void gnomeSort(std::vector<int>& array) {", "  size_t index = 0;", "  while (index < array.size()) {", "    if (index == 0 || array[index - 1] <= array[index]) {", "      index++;", "    } else {", "      std::swap(array[index - 1], array[index]);", "      index--;", "    }", "  }", "}"],
      c: ["void gnome_sort(int *array, int length) {", "  int index = 0;", "  while (index < length) {", "    if (index == 0 || array[index - 1] <= array[index]) {", "      index++;", "    } else {", "      swap(array, index - 1, index);", "      index--;", "    }", "  }", "}"],
      go: ["func gnomeSort(array []int) {", "\tindex := 0", "\tfor index < len(array) {", "\t\tif index == 0 || array[index-1] <= array[index] {", "\t\t\tindex++", "\t\t} else {", "\t\t\tarray[index-1], array[index] = array[index], array[index-1]", "\t\t\tindex--", "\t\t}", "\t}", "}"],
      rs: ["fn gnome_sort(array: &mut [i32]) {", "    let mut index = 0;", "    while index < array.len() {", "        if index == 0 || array[index - 1] <= array[index] {", "            index += 1;", "        } else {", "            array.swap(index - 1, index);", "            index -= 1;", "        }", "    }", "}"],
    },
    pseudo: {
      en: ["GNOMESORT(array)", "  index ← 0", "  while index < n", "    if index = 0 or array[index − 1] ≤ array[index]: index ← index + 1", "    else: swap array[index − 1], array[index]; index ← index − 1"],
      pt: ["GNOMESORT(vetor)", "  índice ← 0", "  enquanto índice < n", "    se índice = 0 ou vetor[índice − 1] ≤ vetor[índice]: índice ← índice + 1", "    senão: troca vetor[índice − 1], vetor[índice]; índice ← índice − 1"],
    },
  },

  comb: {
    ...SIZE,
    slug: "comb-sort",
    name: "Comb sort",
    subtitle: { en: "bubble sort with a shrinking gap", pt: "bubble sort com gap que encolhe" },
    tagline: { en: "comb sort · compare far apart first, the turtles never form", pt: "comb sort · compara de longe primeiro, as tartarugas nem se formam" },
    legend: LEGEND,
    kpis: [KPI_COMPARISONS, KPI_SWAPS, { key: "gap", label: { en: "GAP", pt: "GAP" }, sub: { en: "distance between compared elements", pt: "distância entre os comparados" } }, { key: "pass", label: { en: "PASS", pt: "PASSADA" }, sub: { en: "one per gap value", pt: "uma por valor de gap" } }, { key: "shrink", label: { en: "SHRINK", pt: "FATOR" }, sub: { en: "gap ÷ factor each pass", pt: "gap ÷ fator a cada passada" } }],
    idea: {
      en: [
        "Comb sort is bubble sort where the compared elements start far apart and the gap shrinks by a factor of 1.3 every pass until it reaches 1. Large gaps move small values from the far end to the front in a single swap, which is exactly what bubble sort cannot do.",
        "By the time the gap is 1 the array is nearly sorted and the final bubble passes barely swap anything. The factor 1.3 comes from experiment: smaller factors do too many passes, larger ones leave too much for the end.",
      ],
      pt: [
        "O comb sort é o bubble sort em que os elementos comparados começam longe e o gap encolhe por um fator de 1,3 a cada passada até chegar a 1. Gaps grandes movem valores pequenos do fim para o começo numa única troca, exatamente o que o bubble sort não consegue.",
        "Quando o gap chega a 1 o vetor está quase ordenado e as passadas finais de bubble mal trocam algo. O fator 1,3 vem de experimento: fatores menores fazem passadas demais, maiores deixam trabalho demais para o fim.",
      ],
    },
    stages: [
      ["violet", { en: "shrink", pt: "encolhe" }, { en: "gap ← ⌊gap / 1.3⌋, at least 1", pt: "gap ← ⌊gap / 1,3⌋, no mínimo 1" }],
      ["primary", { en: "compare", pt: "compara" }, { en: "array[i] with array[i + gap]", pt: "vetor[i] com vetor[i + gap]" }],
      ["swap", { en: "swap", pt: "troca" }, { en: "out of order: exchange across the gap", pt: "fora de ordem: troca através do gap" }],
      ["green", { en: "finish", pt: "termina" }, { en: "gap 1 and a pass without swaps", pt: "gap 1 e uma passada sem trocas" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n log n)", "green", { en: "gap passes only", pt: "só as passadas de gap" }],
      [{ en: "average", pt: "médio" }, "O(n² / 2ᵖ)", "text", { en: "p the number of gap passes; close to n log n in practice", pt: "p o número de passadas de gap; perto de n log n na prática" }],
      [{ en: "worst", pt: "pior" }, "O(n²)", "neg", { en: "pathological inputs exist", pt: "existem entradas patológicas" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "green", { en: "in place", pt: "no lugar" }],
    ],
    chartTitle: CHART_TITLE,
    chart: [["bubble", 499500], ["insertion", 250000], ["comb", 22000, true], ["quick", 13900], ["merge", 8700]],
    chartNote: CHART_NOTE,
    when: {
      en: ["A tiny in-place sort that is fast enough: microcontrollers, early game consoles, sorting a few thousand records.", "As a demonstration that the gap idea alone turns O(n²) into something close to O(n log n)."],
      pt: ["Uma ordenação minúscula no lugar e rápida o bastante: microcontroladores, consoles antigos, alguns milhares de registros.", "Como demonstração de que só a ideia do gap transforma O(n²) em algo perto de O(n log n)."],
    },
    pitfalls: {
      en: ["Not stable: equal values can cross each other over a gap.", "The loop must continue after gap reaches 1 until a pass makes no swap.", "The gap 9 and 10 are slow spots; the rule 11 variant skips them by turning 9 or 10 into 11."],
      pt: ["Não é estável: valores iguais podem se cruzar através de um gap.", "O laço precisa continuar depois do gap chegar a 1 até uma passada sem trocas.", "Os gaps 9 e 10 são pontos lentos; a variante rule 11 pula os dois transformando 9 ou 10 em 11."],
    },
    history: {
      en: "Włodzimierz Dobosiewicz published the idea in 1980; Stephen Lacey and Richard Box rediscovered it in 1991 and named it comb sort in a Byte magazine article, where they found the 1.3 shrink factor by simulation. It is Shell sort's idea applied to bubble sort instead of insertion sort.",
      pt: "Włodzimierz Dobosiewicz publicou a ideia em 1980; Stephen Lacey e Richard Box a redescobriram em 1991 e a chamaram de comb sort num artigo da revista Byte, onde acharam o fator 1,3 por simulação. É a ideia do Shell sort aplicada ao bubble sort em vez do insertion sort.",
    },
    file: "comb_sort",
    code: {
      ts: ["function combSort(array: number[]) {", "  let gap = array.length;", "  let swapped = true;", "  while (gap > 1 || swapped) {", "    gap = Math.max(1, Math.floor(gap / 1.3));", "    swapped = false;", "    for (let i = 0; i + gap < array.length; i++) {", "      if (array[i] > array[i + gap]) {", "        swap(array, i, i + gap);", "        swapped = true;", "      }", "    }", "  }", "}"],
      py: ["def comb_sort(array):", "    gap = len(array)", "    swapped = True", "    while gap > 1 or swapped:", "        gap = max(1, int(gap / 1.3))", "        swapped = False", "        for i in range(len(array) - gap):", "            if array[i] > array[i + gap]:", "                swap(array, i, i + gap)", "                swapped = True", "", "", "", ""],
      java: ["static void combSort(int[] array) {", "  int gap = array.length;", "  boolean swapped = true;", "  while (gap > 1 || swapped) {", "    gap = Math.max(1, (int) (gap / 1.3));", "    swapped = false;", "    for (int i = 0; i + gap < array.length; i++) {", "      if (array[i] > array[i + gap]) {", "        swap(array, i, i + gap);", "        swapped = true;", "      }", "    }", "  }", "}"],
      cpp: ["void combSort(std::vector<int>& array) {", "  size_t gap = array.size();", "  bool swapped = true;", "  while (gap > 1 || swapped) {", "    gap = std::max<size_t>(1, gap / 1.3);", "    swapped = false;", "    for (size_t i = 0; i + gap < array.size(); i++) {", "      if (array[i] > array[i + gap]) {", "        std::swap(array[i], array[i + gap]);", "        swapped = true;", "      }", "    }", "  }", "}"],
      c: ["void comb_sort(int *array, int length) {", "  int gap = length;", "  int swapped = 1;", "  while (gap > 1 || swapped) {", "    gap = gap / 1.3 < 1 ? 1 : (int) (gap / 1.3);", "    swapped = 0;", "    for (int i = 0; i + gap < length; i++) {", "      if (array[i] > array[i + gap]) {", "        swap(array, i, i + gap);", "        swapped = 1;", "      }", "    }", "  }", "}"],
      go: ["func combSort(array []int) {", "\tgap := len(array)", "\tswapped := true", "\tfor gap > 1 || swapped {", "\t\tgap = max(1, int(float64(gap)/1.3))", "\t\tswapped = false", "\t\tfor i := 0; i+gap < len(array); i++ {", "\t\t\tif array[i] > array[i+gap] {", "\t\t\t\tarray[i], array[i+gap] = array[i+gap], array[i]", "\t\t\t\tswapped = true", "\t\t\t}", "\t\t}", "\t}", "}"],
      rs: ["fn comb_sort(array: &mut [i32]) {", "    let mut gap = array.len();", "    let mut swapped = true;", "    while gap > 1 || swapped {", "        gap = ((gap as f64 / 1.3) as usize).max(1);", "        swapped = false;", "        for i in 0..array.len() - gap {", "            if array[i] > array[i + gap] {", "                array.swap(i, i + gap);", "                swapped = true;", "            }", "        }", "    }", "}"],
    },
    pseudo: {
      en: ["COMBSORT(array)", "  gap ← n; swapped ← true", "  while gap > 1 or swapped", "    gap ← max(1, ⌊gap / 1.3⌋); swapped ← false", "    for i ← 0 while i + gap < n: if array[i] > array[i + gap]: swap them; swapped ← true"],
      pt: ["COMBSORT(vetor)", "  gap ← n; trocou ← verdadeiro", "  enquanto gap > 1 ou trocou", "    gap ← max(1, ⌊gap / 1,3⌋); trocou ← falso", "    para i ← 0 enquanto i + gap < n: se vetor[i] > vetor[i + gap]: troca; trocou ← verdadeiro"],
    },
  },

  shell: {
    ...SIZE,
    slug: "shell-sort",
    name: "Shell sort",
    subtitle: { en: "insertion sort over gapped subsequences", pt: "insertion sort em subsequências com gap" },
    tagline: { en: "shell sort · coarse passes first, so the last pass has almost nothing to do", pt: "shell sort · passadas grossas primeiro, para a última quase não ter o que fazer" },
    legend: LEGEND_HELD,
    kpis: [KPI_COMPARISONS, { key: "shifts", label: { en: "SHIFTS", pt: "DESLOCAMENTOS" }, sub: { en: "elements moved right by a gap", pt: "elementos movidos um gap à direita" } }, { key: "gap", label: { en: "GAP", pt: "GAP" }, sub: { en: "distance inside a subsequence", pt: "distância dentro da subsequência" } }, { key: "passes", label: { en: "GAP PASSES", pt: "PASSADAS DE GAP" }, sub: { en: "n/2, n/4, …, 1", pt: "n/2, n/4, …, 1" } }, { key: "key", label: { en: "KEY", pt: "CHAVE" }, sub: { en: "the lifted value", pt: "o valor levantado" } }],
    idea: {
      en: [
        "Shell sort runs insertion sort on subsequences of elements a fixed gap apart, then shrinks the gap and repeats, ending with gap 1, which is plain insertion sort. Each coarse pass moves elements long distances cheaply, so by the final pass every element is close to its place and insertion sort runs near its linear best case.",
        "The gap sequence decides the running time. Halving, as here, gives O(n²) in the worst case but O(n^1.5) typically; sequences like Ciura's 1, 4, 10, 23, 57, 132, … do measurably better, and the true complexity of the best sequence is still an open problem.",
      ],
      pt: [
        "O shell sort roda insertion sort em subsequências de elementos a um gap fixo de distância, depois encolhe o gap e repete, terminando com gap 1, que é o insertion sort puro. Cada passada grossa move elementos por longas distâncias barato, então na passada final todo elemento está perto do lugar e o insertion sort roda perto do seu melhor caso linear.",
        "A sequência de gaps decide o tempo. Dividir por dois, como aqui, dá O(n²) no pior caso mas O(n^1,5) tipicamente; sequências como a de Ciura, 1, 4, 10, 23, 57, 132, …, vão mensuravelmente melhor, e a complexidade real da melhor sequência ainda é um problema aberto.",
      ],
    },
    stages: [
      ["violet", { en: "pick a gap", pt: "escolhe um gap" }, { en: "n/2, then halve it each pass", pt: "n/2, depois metade a cada passada" }],
      ["primary", { en: "lift", pt: "levanta" }, { en: "each element in turn, from index gap on", pt: "cada elemento por vez, a partir do índice gap" }],
      ["swap", { en: "shift", pt: "desloca" }, { en: "larger elements gap places right", pt: "elementos maiores um gap à direita" }],
      ["green", { en: "place", pt: "coloca" }, { en: "the key in its gapped slot", pt: "a chave na vaga da subsequência" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n log n)", "green", { en: "already sorted: every pass is linear", pt: "já ordenado: toda passada é linear" }],
      [{ en: "average", pt: "médio" }, "O(n^1.3)", "text", { en: "halving gaps; better sequences do better", pt: "gaps pela metade; sequências melhores fazem melhor" }],
      [{ en: "worst", pt: "pior" }, "O(n²)", "neg", { en: "halving gaps on a crafted input", pt: "gaps pela metade numa entrada armada" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "green", { en: "in place", pt: "no lugar" }],
    ],
    chartTitle: CHART_TITLE,
    chart: [["bubble", 499500], ["insertion", 250000], ["shell", 24000, true], ["quick", 13900], ["merge", 8700]],
    chartNote: CHART_NOTE,
    when: {
      en: ["Embedded and kernel code where recursion and extra memory are unwelcome: uClibc's qsort and parts of the Linux kernel use it.", "Medium arrays, a few thousand elements, where it is within a small factor of quick sort with far simpler code."],
      pt: ["Código embarcado e de kernel onde recursão e memória extra não são bem-vindas: o qsort da uClibc e partes do kernel Linux usam.", "Vetores médios, alguns milhares de elementos, em que fica a um fator pequeno do quick sort com código bem mais simples."],
    },
    pitfalls: {
      en: ["Not stable: elements jump over each other across gaps.", "Gap sequences with common factors (8, 4, 2, 1) waste passes; the elements never mix between subsequences until the end.", "Its running time is hard to predict; if you need a guarantee, use heap sort or merge sort."],
      pt: ["Não é estável: elementos pulam uns sobre os outros através dos gaps.", "Sequências de gap com fatores comuns (8, 4, 2, 1) desperdiçam passadas; os elementos não se misturam entre subsequências até o fim.", "Seu tempo é difícil de prever; se precisa de garantia, use heap sort ou merge sort."],
    },
    history: {
      en: "Donald Shell published it in 1959, the first sort to break the O(n²) barrier in practice. The analysis has occupied Knuth, Pratt, Sedgewick and others for sixty years; Pratt proved O(n log² n) for the 2ᵖ3ᵠ sequence in 1971, and the gap sequence question remains open.",
      pt: "Donald Shell o publicou em 1959, a primeira ordenação a quebrar a barreira do O(n²) na prática. A análise ocupa Knuth, Pratt, Sedgewick e outros há sessenta anos; Pratt provou O(n log² n) para a sequência 2ᵖ3ᵠ em 1971, e a questão da sequência de gaps continua aberta.",
    },
    file: "shell_sort",
    code: {
      ts: ["function shellSort(array: number[]) {", "  for (let gap = Math.floor(array.length / 2); gap > 0; gap = Math.floor(gap / 2)) {", "    for (let i = gap; i < array.length; i++) {", "      const key = array[i];", "      let j = i;", "      while (j >= gap && array[j - gap] > key) {", "        array[j] = array[j - gap];", "        j -= gap;", "      }", "      array[j] = key;", "    }", "  }", "}"],
      py: ["def shell_sort(array):", "    gap = len(array) // 2", "    while gap > 0:", "        for i in range(gap, len(array)):", "            key = array[i]; j = i", "            while j >= gap and array[j - gap] > key:", "                array[j] = array[j - gap]", "                j -= gap", "", "            array[j] = key", "", "        gap //= 2", ""],
      java: ["static void shellSort(int[] array) {", "  for (int gap = array.length / 2; gap > 0; gap /= 2) {", "    for (int i = gap; i < array.length; i++) {", "      int key = array[i];", "      int j = i;", "      while (j >= gap && array[j - gap] > key) {", "        array[j] = array[j - gap];", "        j -= gap;", "      }", "      array[j] = key;", "    }", "  }", "}"],
      cpp: ["void shellSort(std::vector<int>& array) {", "  for (size_t gap = array.size() / 2; gap > 0; gap /= 2) {", "    for (size_t i = gap; i < array.size(); i++) {", "      int key = array[i];", "      size_t j = i;", "      while (j >= gap && array[j - gap] > key) {", "        array[j] = array[j - gap];", "        j -= gap;", "      }", "      array[j] = key;", "    }", "  }", "}"],
      c: ["void shell_sort(int *array, int length) {", "  for (int gap = length / 2; gap > 0; gap /= 2) {", "    for (int i = gap; i < length; i++) {", "      int key = array[i];", "      int j = i;", "      while (j >= gap && array[j - gap] > key) {", "        array[j] = array[j - gap];", "        j -= gap;", "      }", "      array[j] = key;", "    }", "  }", "}"],
      go: ["func shellSort(array []int) {", "\tfor gap := len(array) / 2; gap > 0; gap /= 2 {", "\t\tfor i := gap; i < len(array); i++ {", "\t\t\tkey := array[i]", "\t\t\tj := i", "\t\t\tfor j >= gap && array[j-gap] > key {", "\t\t\t\tarray[j] = array[j-gap]", "\t\t\t\tj -= gap", "\t\t\t}", "\t\t\tarray[j] = key", "\t\t}", "\t}", "}"],
      rs: ["fn shell_sort(array: &mut [i32]) {", "    let mut gap = array.len() / 2; while gap > 0 {", "        for i in gap..array.len() {", "            let key = array[i];", "            let mut j = i;", "            while j >= gap && array[j - gap] > key {", "                array[j] = array[j - gap];", "                j -= gap;", "            }", "            array[j] = key;", "        }", "        gap /= 2;", "    } }"],
    },
    pseudo: {
      en: ["SHELLSORT(array)", "  for gap ← ⌊n/2⌋, ⌊n/4⌋, …, 1", "    for i ← gap to n − 1", "      key ← array[i]; j ← i", "      while j ≥ gap and array[j − gap] > key: array[j] ← array[j − gap]; j ← j − gap", "      array[j] ← key"],
      pt: ["SHELLSORT(vetor)", "  para gap ← ⌊n/2⌋, ⌊n/4⌋, …, 1", "    para i ← gap até n − 1", "      chave ← vetor[i]; j ← i", "      enquanto j ≥ gap e vetor[j − gap] > chave: vetor[j] ← vetor[j − gap]; j ← j − gap", "      vetor[j] ← chave"],
    },
  },

  oddeven: {
    ...SIZE,
    slug: "odd-even-sort",
    name: "Odd-even sort",
    subtitle: { en: "alternating independent pairs", pt: "pares independentes alternados" },
    tagline: { en: "odd-even sort · bubble sort rearranged so a whole phase can run at once", pt: "odd-even sort · o bubble sort rearranjado para uma fase inteira rodar de uma vez" },
    legend: LEGEND,
    kpis: [KPI_COMPARISONS, KPI_SWAPS, { key: "rounds", label: { en: "ROUNDS", pt: "RODADAS" }, sub: { en: "odd phase plus even phase", pt: "fase ímpar mais fase par" } }, { key: "phase", label: { en: "PHASE", pt: "FASE" }, sub: { en: "which pairs are compared", pt: "quais pares são comparados" } }, { key: "pairs", label: { en: "PAIRS", pt: "PARES" }, sub: { en: "compared per phase, all at once", pt: "comparados por fase, todos de uma vez" } }],
    idea: {
      en: [
        "Odd-even transposition sort compares the pairs (1, 2), (3, 4), (5, 6), … in one phase and the pairs (0, 1), (2, 3), (4, 5), … in the next, swapping each pair that is out of order. No two pairs in a phase share an element, so every comparison of a phase can happen at the same time.",
        "On one processor it is just bubble sort with a stranger order, and it does the same O(n²) work. On n/2 processors, one per pair, each phase costs one step and the whole sort finishes in n rounds: that is what it was designed for, and why it appears in sorting networks and GPU code.",
      ],
      pt: [
        "O odd-even transposition sort compara os pares (1, 2), (3, 4), (5, 6), … numa fase e os pares (0, 1), (2, 3), (4, 5), … na seguinte, trocando cada par fora de ordem. Dois pares de uma fase nunca compartilham um elemento, então toda comparação de uma fase pode acontecer ao mesmo tempo.",
        "Num processador só é o bubble sort numa ordem estranha, e faz o mesmo trabalho O(n²). Em n/2 processadores, um por par, cada fase custa um passo e a ordenação inteira termina em n rodadas: é para isso que foi feito, e por isso aparece em redes de ordenação e código de GPU.",
      ],
    },
    stages: [
      ["violet", { en: "odd phase", pt: "fase ímpar" }, { en: "pairs (1, 2), (3, 4), …", pt: "pares (1, 2), (3, 4), …" }],
      ["primary", { en: "compare", pt: "compara" }, { en: "each pair, independently", pt: "cada par, de forma independente" }],
      ["swap", { en: "swap", pt: "troca" }, { en: "the pairs out of order", pt: "os pares fora de ordem" }],
      ["green", { en: "even phase", pt: "fase par" }, { en: "pairs (0, 1), (2, 3), …; stop when a round swaps nothing", pt: "pares (0, 1), (2, 3), …; para quando uma rodada não troca nada" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n)", "green", { en: "already sorted: one round", pt: "já ordenado: uma rodada" }],
      [{ en: "average", pt: "médio" }, "O(n²)", "neg", { en: "sequential: the same as bubble sort", pt: "sequencial: o mesmo que o bubble sort" }],
      [{ en: "worst", pt: "pior" }, "O(n)", "green", { en: "parallel, with n/2 comparators: n rounds", pt: "paralelo, com n/2 comparadores: n rodadas" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "green", { en: "in place", pt: "no lugar" }],
    ],
    chartTitle: { en: "ROUNDS AT N = 1 000 · PARALLEL", pt: "RODADAS EM N = 1.000 · PARALELO" },
    chart: [["odd-even", 1000, true], ["bitonic", 55], ["batcher merge", 55], ["bubble (serial)", 999000]],
    chartNote: { en: "a round is one parallel step; bubble sort cannot parallelise its passes", pt: "uma rodada é um passo paralelo; o bubble sort não paraleliza suas passadas" },
    when: {
      en: ["Hardware and GPUs: a fixed sorting network with n/2 comparators per phase.", "Systolic arrays and mesh-connected processors, where each element only talks to its neighbours."],
      pt: ["Hardware e GPUs: uma rede de ordenação fixa com n/2 comparadores por fase.", "Arrays sistólicos e processadores em malha, onde cada elemento só fala com os vizinhos."],
    },
    pitfalls: {
      en: ["Sequentially it has no advantage at all; it exists for parallel hardware.", "Stopping early needs a global 'no swap' flag, which itself costs a reduction step in parallel.", "Bitonic and Batcher networks need O(log² n) rounds instead of n; use them when depth matters."],
      pt: ["Sequencialmente não tem vantagem nenhuma; existe para hardware paralelo.", "Parar cedo precisa de uma flag global de 'sem troca', que em paralelo custa um passo de redução.", "Redes bitônicas e de Batcher precisam de O(log² n) rodadas em vez de n; use-as quando a profundidade importa."],
    },
    history: {
      en: "Nico Habermann described the parallel neighbour sort in 1972 for arrays of processors. It is the simplest sorting network, and the proof that n rounds always suffice, by the 0-1 principle, is a classic exercise in parallel algorithms courses.",
      pt: "Nico Habermann descreveu a ordenação paralela de vizinhos em 1972 para arrays de processadores. É a rede de ordenação mais simples, e a prova de que n rodadas sempre bastam, pelo princípio 0-1, é um exercício clássico dos cursos de algoritmos paralelos.",
    },
    file: "odd_even_sort",
    code: {
      ts: ["function oddEvenSort(array: number[]) {", "  let sorted = false;", "  while (!sorted) {", "    sorted = true;", "    for (let i = 1; i + 1 < array.length; i += 2) {", "      if (array[i] > array[i + 1]) { swap(array, i, i + 1); sorted = false; }", "    }", "    for (let i = 0; i + 1 < array.length; i += 2) {", "      if (array[i] > array[i + 1]) { swap(array, i, i + 1); sorted = false; }", "    }", "  }", "}"],
      py: ["def odd_even_sort(array):", "    is_sorted = False", "    while not is_sorted:", "        is_sorted = True", "        for i in range(1, len(array) - 1, 2):", "            if array[i] > array[i + 1]: swap(array, i, i + 1); is_sorted = False", "", "        for i in range(0, len(array) - 1, 2):", "            if array[i] > array[i + 1]: swap(array, i, i + 1); is_sorted = False", "", "", ""],
      java: ["static void oddEvenSort(int[] array) {", "  boolean sorted = false;", "  while (!sorted) {", "    sorted = true;", "    for (int i = 1; i + 1 < array.length; i += 2) {", "      if (array[i] > array[i + 1]) { swap(array, i, i + 1); sorted = false; }", "    }", "    for (int i = 0; i + 1 < array.length; i += 2) {", "      if (array[i] > array[i + 1]) { swap(array, i, i + 1); sorted = false; }", "    }", "  }", "}"],
      cpp: ["void oddEvenSort(std::vector<int>& array) {", "  bool sorted = false;", "  while (!sorted) {", "    sorted = true;", "    for (size_t i = 1; i + 1 < array.size(); i += 2) {", "      if (array[i] > array[i + 1]) { std::swap(array[i], array[i + 1]); sorted = false; }", "    }", "    for (size_t i = 0; i + 1 < array.size(); i += 2) {", "      if (array[i] > array[i + 1]) { std::swap(array[i], array[i + 1]); sorted = false; }", "    }", "  }", "}"],
      c: ["void odd_even_sort(int *array, int length) {", "  int sorted = 0;", "  while (!sorted) {", "    sorted = 1;", "    for (int i = 1; i + 1 < length; i += 2) {", "      if (array[i] > array[i + 1]) { swap(array, i, i + 1); sorted = 0; }", "    }", "    for (int i = 0; i + 1 < length; i += 2) {", "      if (array[i] > array[i + 1]) { swap(array, i, i + 1); sorted = 0; }", "    }", "  }", "}"],
      go: ["func oddEvenSort(array []int) {", "\tsorted := false", "\tfor !sorted {", "\t\tsorted = true", "\t\tfor i := 1; i+1 < len(array); i += 2 {", "\t\t\tif array[i] > array[i+1] { array[i], array[i+1] = array[i+1], array[i]; sorted = false }", "\t\t}", "\t\tfor i := 0; i+1 < len(array); i += 2 {", "\t\t\tif array[i] > array[i+1] { array[i], array[i+1] = array[i+1], array[i]; sorted = false }", "\t\t}", "\t}", "}"],
      rs: ["fn odd_even_sort(array: &mut [i32]) {", "    let mut sorted = false;", "    while !sorted {", "        sorted = true;", "        for i in (1..array.len() - 1).step_by(2) {", "            if array[i] > array[i + 1] { array.swap(i, i + 1); sorted = false; }", "        }", "        for i in (0..array.len() - 1).step_by(2) {", "            if array[i] > array[i + 1] { array.swap(i, i + 1); sorted = false; }", "        }", "    }", "}"],
    },
    pseudo: {
      en: ["ODDEVENSORT(array)", "  repeat until a round swaps nothing", "    odd phase: for every pair (1, 2), (3, 4), … in parallel: swap if out of order", "    even phase: for every pair (0, 1), (2, 3), … in parallel: swap if out of order"],
      pt: ["ODDEVENSORT(vetor)", "  repete até uma rodada não trocar nada", "    fase ímpar: para todo par (1, 2), (3, 4), … em paralelo: troca se fora de ordem", "    fase par: para todo par (0, 1), (2, 3), … em paralelo: troca se fora de ordem"],
    },
  },

  radix: {
    ...SIZE,
    slug: "radix-sort",
    name: "Radix sort (LSD)",
    subtitle: { en: "buckets by digit, no comparisons", pt: "baldes por dígito, sem comparações" },
    tagline: { en: "radix sort · sort by the units, then by the tens, and the tens pass keeps the units order", pt: "radix sort · ordena pelas unidades, depois pelas dezenas, e a passada das dezenas preserva a ordem das unidades" },
    legend: [["violet", { en: "being bucketed", pt: "sendo distribuído" }], ["swap", { en: "written back", pt: "escrito de volta" }], ["green", { en: "done", pt: "pronto" }]],
    kpis: [{ key: "pass", unitKey: "passUnit", label: { en: "PASS", pt: "PASSADA" }, sub: { en: "one per digit, least significant first", pt: "uma por dígito, o menos significativo primeiro" } }, { key: "digit", label: { en: "DIGIT", pt: "DÍGITO" }, sub: { en: "bucket of the current value", pt: "balde do valor atual" } }, { key: "reads", label: { en: "READS", pt: "LEITURAS" }, sub: { en: "values bucketed", pt: "valores distribuídos" } }, { key: "writes", label: { en: "WRITES", pt: "ESCRITAS" }, sub: { en: "values copied back", pt: "valores copiados de volta" } }, { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "always zero", pt: "sempre zero" } }],
    idea: {
      en: [
        "Radix sort never compares two values. It distributes the values into ten buckets by their last digit, concatenates the buckets in order, then repeats with the tens digit, the hundreds, and so on. Because each pass is stable, values that tie on the current digit keep the order the previous pass gave them, so after the last pass the array is sorted by the whole number.",
        "The cost is one read and one write per value per digit: for d-digit keys that is O(d · n), linear in n. That beats every comparison sort's n log n bound, which does not apply because no comparison is made. The price is the buckets and the requirement that keys are integers or strings of bounded length.",
      ],
      pt: [
        "O radix sort nunca compara dois valores. Ele distribui os valores em dez baldes pelo último dígito, concatena os baldes em ordem, depois repete com o dígito das dezenas, das centenas, e assim por diante. Como cada passada é estável, valores empatados no dígito atual mantêm a ordem que a passada anterior deu, então depois da última passada o vetor está ordenado pelo número inteiro.",
        "O custo é uma leitura e uma escrita por valor por dígito: para chaves de d dígitos é O(d · n), linear em n. Isso vence o limite n log n de toda ordenação por comparação, que não se aplica porque nenhuma comparação é feita. O preço são os baldes e a exigência de chaves inteiras ou strings de tamanho limitado.",
      ],
    },
    stages: [
      ["violet", { en: "pick the digit", pt: "escolhe o dígito" }, { en: "units first, then tens", pt: "unidades primeiro, depois dezenas" }],
      ["primary", { en: "bucket", pt: "distribui" }, { en: "each value into bucket 0–9 by that digit", pt: "cada valor no balde 0–9 por esse dígito" }],
      ["swap", { en: "write back", pt: "escreve de volta" }, { en: "bucket 0, then 1, …, keeping order inside each", pt: "balde 0, depois 1, …, mantendo a ordem dentro de cada um" }],
      ["green", { en: "next digit", pt: "próximo dígito" }, { en: "until the largest value has no digits left", pt: "até o maior valor não ter mais dígitos" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(d · n)", "green", { en: "d digits: two passes here", pt: "d dígitos: duas passadas aqui" }],
      [{ en: "average", pt: "médio" }, "O(d · n)", "green", { en: "no dependence on the input order", pt: "nenhuma dependência da ordem da entrada" }],
      [{ en: "worst", pt: "pior" }, "O(d · n)", "green", { en: "the same", pt: "o mesmo" }],
      [{ en: "space", pt: "espaço" }, "O(n + b)", "text", { en: "the buckets, b = 10 here", pt: "os baldes, b = 10 aqui" }],
    ],
    chartTitle: { en: "OPERATIONS AT N = 1 000 · 3-DIGIT KEYS", pt: "OPERAÇÕES EM N = 1.000 · CHAVES DE 3 DÍGITOS" },
    chart: [["radix (lsd)", 6000, true], ["counting", 2000], ["merge", 8700], ["quick", 13900], ["insertion", 250000]],
    chartNote: { en: "reads plus writes for radix and counting, comparisons for the others", pt: "leituras mais escritas para radix e counting, comparações para os outros" },
    when: {
      en: ["Fixed-width integer keys in bulk: sorting 32-bit ids, IP addresses, dates as YYYYMMDD, suffix arrays.", "GPU sorting, where the counting histogram parallelises well; it is the default sort in CUDA's Thrust for integers."],
      pt: ["Chaves inteiras de largura fixa em massa: ordenar ids de 32 bits, endereços IP, datas como AAAAMMDD, suffix arrays.", "Ordenação em GPU, onde o histograma de contagem paraleliza bem; é a ordenação padrão do Thrust da CUDA para inteiros."],
    },
    pitfalls: {
      en: ["Keys of very different lengths or floating point need preprocessing; negative integers need the sign handled as a separate pass.", "A radix of 10 is for teaching; real code uses 256 or 65 536 so a 32-bit key takes 4 or 2 passes.", "Each pass must be stable, or the earlier digits' order is destroyed."],
      pt: ["Chaves de tamanhos muito diferentes ou ponto flutuante precisam de pré-processamento; inteiros negativos precisam do sinal tratado numa passada à parte.", "Base 10 é para ensinar; código real usa 256 ou 65.536 para uma chave de 32 bits levar 4 ou 2 passadas.", "Cada passada precisa ser estável, ou a ordem dos dígitos anteriores é destruída."],
    },
    history: {
      en: "Herman Hollerith's tabulating machines sorted punched cards this way in the 1890 US census, one digit column per pass, and radix sort predates the computer by half a century. Harold Seward wrote the first computer version with counting in 1954, the same paper that gave counting sort.",
      pt: "As máquinas tabuladoras de Herman Hollerith ordenavam cartões perfurados assim no censo americano de 1890, uma coluna de dígito por passada, e o radix sort antecede o computador em meio século. Harold Seward escreveu a primeira versão para computador com contagem em 1954, no mesmo artigo que deu o counting sort.",
    },
    file: "radix_sort",
    code: {
      ts: ["function radixSort(array: number[]) {", "  const max = Math.max(...array);", "  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {", "    const buckets: number[][] = Array.from({ length: 10 }, () => []);", "    for (const value of array) buckets[Math.floor(value / exp) % 10].push(value);", "    let index = 0;", "    for (const bucket of buckets) for (const value of bucket) array[index++] = value;", "  }", "}"],
      py: ["def radix_sort(array):", "    largest = max(array)", "    exp = 1", "    while largest // exp > 0:", "        buckets = [[] for _ in range(10)]; [buckets[(value // exp) % 10].append(value) for value in array]", "        index = 0", "        for bucket in buckets:", "            for value in bucket: array[index] = value; index += 1", "        exp *= 10"],
      java: ["static void radixSort(int[] array) {", "  int max = Arrays.stream(array).max().getAsInt();", "  for (int exp = 1; max / exp > 0; exp *= 10) {", "    List<List<Integer>> buckets = new ArrayList<>(); for (int b = 0; b < 10; b++) buckets.add(new ArrayList<>());", "    for (int value : array) buckets.get((value / exp) % 10).add(value);", "    int index = 0;", "    for (List<Integer> bucket : buckets) for (int value : bucket) array[index++] = value;", "  }", "}"],
      cpp: ["void radixSort(std::vector<int>& array) {", "  int max = *std::max_element(array.begin(), array.end());", "  for (int exp = 1; max / exp > 0; exp *= 10) {", "    std::vector<std::vector<int>> buckets(10);", "    for (int value : array) buckets[(value / exp) % 10].push_back(value);", "    size_t index = 0;", "    for (auto& bucket : buckets) for (int value : bucket) array[index++] = value;", "  }", "}"],
      c: ["void radix_sort(int *array, int length) {", "  int max = array_max(array, length);", "  for (int exp = 1; max / exp > 0; exp *= 10) {", "    int counts[10] = {0}; int output[length];", "    for (int i = 0; i < length; i++) counts[(array[i] / exp) % 10]++;", "    for (int b = 1; b < 10; b++) counts[b] += counts[b - 1];", "    for (int i = length - 1; i >= 0; i--) output[--counts[(array[i] / exp) % 10]] = array[i]; memcpy(array, output, length * sizeof(int));", "  }", "}"],
      go: ["func radixSort(array []int) {", "\tlargest := slices.Max(array)", "\tfor exp := 1; largest/exp > 0; exp *= 10 {", "\t\tbuckets := make([][]int, 10)", "\t\tfor _, value := range array { buckets[(value/exp)%10] = append(buckets[(value/exp)%10], value) }", "\t\tindex := 0", "\t\tfor _, bucket := range buckets { for _, value := range bucket { array[index] = value; index++ } }", "\t}", "}"],
      rs: ["fn radix_sort(array: &mut [u32]) {", "    let largest = *array.iter().max().unwrap();", "    let mut exp = 1; while largest / exp > 0 {", "        let mut buckets: Vec<Vec<u32>> = vec![Vec::new(); 10];", "        for &value in array.iter() { buckets[((value / exp) % 10) as usize].push(value); }", "        let mut index = 0;", "        for bucket in buckets { for value in bucket { array[index] = value; index += 1; } }", "        exp *= 10; }", "}"],
    },
    pseudo: {
      en: ["RADIXSORT(array)", "  for each digit position, least significant first", "    buckets[0..9] ← empty", "    for each value in array, in order: append it to buckets[digit of value]", "    array ← buckets[0] ++ buckets[1] ++ … ++ buckets[9]"],
      pt: ["RADIXSORT(vetor)", "  para cada posição de dígito, do menos significativo para o mais", "    baldes[0..9] ← vazios", "    para cada valor do vetor, em ordem: anexa ao baldes[dígito do valor]", "    vetor ← baldes[0] ++ baldes[1] ++ … ++ baldes[9]"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
