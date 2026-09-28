// Models
import type { AlgorithmSpec, KpiSpec } from "./spec";

const SIZE = { sizeLabel: { en: "Size", pt: "Tamanho" }, minN: 8, maxN: 64, stepN: 4, defaultN: 24, shuffleLabel: { en: "Shuffle", pt: "Embaralhar" }, stepMs: 240 } as const;

const IN_PLACE_KPI: KpiSpec = { key: "inPlace", unitKey: "inPlaceUnit", label: { en: "IN PLACE", pt: "NO LUGAR" }, sub: { en: "final positions so far", pt: "posições finais até aqui" } };

export const SORTING = {
  bubble: {
    ...SIZE,
    family: "sorting",
    slug: "bubble-sort",
    kind: "bars",
    name: "Bubble sort",
    subtitle: { en: "exchange sort · adjacent swaps", pt: "ordenação por troca · trocas adjacentes" },
    tagline: { en: "bubble sort · the first one everyone learns · and why nobody ships it", pt: "bubble sort · o primeiro que todo mundo aprende · e por que ninguém usa em produção" },
    legend: [["primary", { en: "comparing", pt: "comparando" }], ["swap", { en: "swapped", pt: "trocado" }], ["green", { en: "in place", pt: "no lugar" }]],
    kpis: [
      { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "n(n−1)/2 at worst", pt: "n(n−1)/2 no pior caso" } },
      { key: "swaps", label: { en: "SWAPS", pt: "TROCAS" }, sub: { en: "one per inversion", pt: "uma por inversão" } },
      { key: "pass", unitKey: "passUnit", label: { en: "PASS", pt: "PASSADA" }, sub: { en: "largest value bubbles to the end", pt: "o maior valor sobe até o fim" } },
      IN_PLACE_KPI,
      { key: "remaining", label: { en: "UNSORTED", pt: "DESORDENADOS" }, sub: { en: "still to settle", pt: "ainda por assentar" } },
    ],
    idea: {
      en: [
        "Bubble sort walks the array comparing each pair of neighbours and swapping them when they are out of order. After one full pass the largest value has bubbled to the end, so the next pass can stop one position earlier. The sorted suffix grows by one on every pass.",
        "The early exit is the one optimisation worth having: if a pass makes no swap, the array is already sorted and the loop ends. On nearly sorted input that turns n² work into a single pass; on random input it changes nothing.",
      ],
      pt: [
        "O bubble sort percorre o vetor comparando cada par de vizinhos e trocando-os quando estão fora de ordem. Depois de uma passada completa o maior valor subiu até o fim, então a próxima passada pode parar uma posição antes. O sufixo ordenado cresce em um a cada passada.",
        "A saída antecipada é a única otimização que vale a pena: se uma passada não faz troca nenhuma, o vetor já está ordenado e o laço termina. Em entrada quase ordenada isso transforma n² de trabalho numa única passada; em entrada aleatória não muda nada.",
      ],
    },
    stages: [
      ["primary", { en: "compare", pt: "compara" }, { en: "array[j] against array[j + 1]", pt: "array[j] com array[j + 1]" }],
      ["swap", { en: "swap", pt: "troca" }, { en: "when the left one is larger", pt: "quando o da esquerda é maior" }],
      ["green", { en: "settle", pt: "assenta" }, { en: "the pass ends, array[end] is final", pt: "a passada termina, array[end] é definitivo" }],
      ["violet", { en: "exit", pt: "sai" }, { en: "no swap in a pass: done", pt: "passada sem troca: pronto" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n)", "green", { en: "already sorted, one pass with the early exit", pt: "já ordenado, uma passada com a saída antecipada" }],
      [{ en: "average", pt: "médio" }, "O(n²)", "neg", { en: "≈ n²/2 comparisons, n²/4 swaps", pt: "≈ n²/2 comparações, n²/4 trocas" }],
      [{ en: "worst", pt: "pior" }, "O(n²)", "neg", { en: "reversed input, every pair swaps", pt: "entrada invertida, todo par troca" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "text", { en: "in place, one temporary", pt: "no lugar, um temporário" }],
    ],
    chartTitle: { en: "COMPARISONS AT N = 1 000", pt: "COMPARAÇÕES EM N = 1.000" },
    chart: [["bubble", 499500, true], ["cocktail", 470000], ["insertion", 250000], ["quick", 13900], ["merge", 8700]],
    chartNote: { en: "random input · bubble sort with early exit still does n²/2 here", pt: "entrada aleatória · mesmo com saída antecipada o bubble faz n²/2 aqui" },
    when: {
      en: ["Teaching: it is the clearest picture of what a comparison sort does, and the animation everyone remembers.", "Tiny or nearly sorted arrays where the early exit finishes in one pass and the code fits in five lines."],
      pt: ["Ensino: é a imagem mais clara do que uma ordenação por comparação faz, e a animação de que todo mundo lembra.", "Vetores minúsculos ou quase ordenados, em que a saída antecipada termina numa passada e o código cabe em cinco linhas."],
    },
    pitfalls: {
      en: ["It is the slowest of the quadratic sorts in practice: insertion sort does the same comparisons with far fewer writes.", "Without the swapped flag it always does n − 1 passes, even on sorted input.", "Small values move only one position per pass (the turtles); cocktail shaker and comb sort exist to fix that."],
      pt: ["É o mais lento dos quadráticos na prática: o insertion sort faz as mesmas comparações com muito menos escritas.", "Sem a flag swapped ele sempre faz n − 1 passadas, mesmo em entrada ordenada.", "Valores pequenos andam só uma posição por passada (as tartarugas); cocktail shaker e comb sort existem para corrigir isso."],
    },
    history: {
      en: "Exchange sorts were described as early as 1956 by Edward Friend, and the name bubble sort was popularised by Kenneth Iverson in 1962. Donald Knuth wrote in 1973 that it \"seems to have nothing to recommend it, except a catchy name\", and it has been the first sort taught in most courses ever since.",
      pt: "Ordenações por troca já eram descritas em 1956 por Edward Friend, e o nome bubble sort foi popularizado por Kenneth Iverson em 1962. Donald Knuth escreveu em 1973 que ele \"não parece ter nada a seu favor, exceto o nome cativante\", e desde então é o primeiro algoritmo de ordenação ensinado na maioria dos cursos.",
    },
    file: "bubble_sort",
    code: {
      ts: ["function bubbleSort(array: number[]) {", "  for (let end = array.length - 1; end > 0; end--) {", "    let swapped = false;", "    for (let j = 0; j < end; j++) {", "      if (array[j] > array[j + 1]) {", "        [array[j], array[j + 1]] = [array[j + 1], array[j]];", "        swapped = true;", "      }", "    }", "    if (!swapped) break;", "  }", "}"],
      py: ["def bubble_sort(array):", "    for end in range(len(array) - 1, 0, -1):", "        swapped = False", "        for j in range(end):", "            if array[j] > array[j + 1]:", "                array[j], array[j + 1] = array[j + 1], array[j]", "                swapped = True", "", "", "        if not swapped: break", "", ""],
      java: ["static void bubbleSort(int[] array) {", "  for (int end = array.length - 1; end > 0; end--) {", "    boolean swapped = false;", "    for (int j = 0; j < end; j++) {", "      if (array[j] > array[j + 1]) {", "        int temp = array[j]; array[j] = array[j + 1]; array[j + 1] = temp;", "        swapped = true;", "      }", "    }", "    if (!swapped) break;", "  }", "}"],
      cpp: ["void bubbleSort(std::vector<int>& array) {", "  for (int end = array.size() - 1; end > 0; end--) {", "    bool swapped = false;", "    for (int j = 0; j < end; j++) {", "      if (array[j] > array[j + 1]) {", "        std::swap(array[j], array[j + 1]);", "        swapped = true;", "      }", "    }", "    if (!swapped) break;", "  }", "}"],
      c: ["void bubble_sort(int *array, int length) {", "  for (int end = length - 1; end > 0; end--) {", "    int swapped = 0;", "    for (int j = 0; j < end; j++) {", "      if (array[j] > array[j + 1]) {", "        int temp = array[j]; array[j] = array[j + 1]; array[j + 1] = temp;", "        swapped = 1;", "      }", "    }", "    if (!swapped) break;", "  }", "}"],
      go: ["func bubbleSort(array []int) {", "\tfor end := len(array) - 1; end > 0; end-- {", "\t\tswapped := false", "\t\tfor j := 0; j < end; j++ {", "\t\t\tif array[j] > array[j+1] {", "\t\t\t\tarray[j], array[j+1] = array[j+1], array[j]", "\t\t\t\tswapped = true", "\t\t\t}", "\t\t}", "\t\tif !swapped { break }", "\t}", "}"],
      rs: ["fn bubble_sort(array: &mut [i32]) {", "    for end in (1..array.len()).rev() {", "        let mut swapped = false;", "        for j in 0..end {", "            if array[j] > array[j + 1] {", "                array.swap(j, j + 1);", "                swapped = true;", "            }", "        }", "        if !swapped { break; }", "    }", "}"],
    },
    pseudo: {
      en: ["BUBBLESORT(array)", "  for end ← n − 1 down to 1", "    swapped ← false", "    for j ← 0 to end − 1", "      if array[j] > array[j + 1]: swap array[j], array[j + 1]; swapped ← true", "    if not swapped: return"],
      pt: ["BUBBLESORT(vetor)", "  para end ← n − 1 até 1", "    trocou ← falso", "    para j ← 0 até end − 1", "      se vetor[j] > vetor[j + 1]: troca vetor[j], vetor[j + 1]; trocou ← verdadeiro", "    se não trocou: retorna"],
    },
  },

  selection: {
    ...SIZE,
    family: "sorting",
    slug: "selection-sort",
    kind: "bars",
    name: "Selection sort",
    subtitle: { en: "selection · minimum to the front", pt: "seleção · mínimo para a frente" },
    tagline: { en: "selection sort · n − 1 swaps, no matter what", pt: "selection sort · n − 1 trocas, aconteça o que acontecer" },
    legend: [["violet", { en: "slot", pt: "vaga" }], ["primary", { en: "comparing", pt: "comparando" }], ["swap", { en: "swapped", pt: "trocado" }], ["green", { en: "in place", pt: "no lugar" }]],
    kpis: [
      { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "n(n−1)/2 always", pt: "n(n−1)/2 sempre" } },
      { key: "swaps", label: { en: "SWAPS", pt: "TROCAS" }, sub: { en: "at most n − 1", pt: "no máximo n − 1" } },
      { key: "pass", unitKey: "passUnit", label: { en: "PASS", pt: "PASSADA" }, sub: { en: "slot being filled", pt: "vaga sendo preenchida" } },
      { key: "minimum", label: { en: "MINIMUM", pt: "MÍNIMO" }, sub: { en: "candidate so far", pt: "candidato até aqui" } },
      { ...IN_PLACE_KPI, sub: { en: "the sorted prefix", pt: "o prefixo ordenado" } },
    ],
    idea: {
      en: [
        "Selection sort splits the array into a sorted prefix and the rest. On each pass it scans the rest for the minimum and swaps it into the first unsorted position. After pass i the prefix of length i + 1 is final, and nothing in it ever moves again.",
        "The scan is what costs: finding the minimum of k elements takes k − 1 comparisons, and the passes add up to n²/2 comparisons regardless of the input. The swap count is the flip side: at most one per pass, n − 1 in total.",
      ],
      pt: [
        "O selection sort divide o vetor num prefixo ordenado e no resto. A cada passada ele varre o resto procurando o mínimo e o troca para a primeira posição desordenada. Depois da passada i o prefixo de tamanho i + 1 é definitivo, e nada nele volta a se mover.",
        "O custo está na varredura: achar o mínimo de k elementos leva k − 1 comparações, e as passadas somam n²/2 comparações independentemente da entrada. As trocas são o outro lado: no máximo uma por passada, n − 1 no total.",
      ],
    },
    stages: [
      ["violet", { en: "slot", pt: "vaga" }, { en: "position i receives the next minimum", pt: "a posição i recebe o próximo mínimo" }],
      ["primary", { en: "scan", pt: "varre" }, { en: "compare every array[j] with the candidate", pt: "compara cada array[j] com o candidato" }],
      ["swap", { en: "swap", pt: "troca" }, { en: "minimum into array[i]", pt: "o mínimo vai para array[i]" }],
      ["green", { en: "settle", pt: "assenta" }, { en: "array[i] is final, i moves right", pt: "array[i] é definitivo, i avança" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n²)", "neg", { en: "the scan never shortens, sorted or not", pt: "a varredura nunca encurta, ordenado ou não" }],
      [{ en: "average", pt: "médio" }, "O(n²)", "neg", { en: "n²/2 comparisons, n − 1 swaps", pt: "n²/2 comparações, n − 1 trocas" }],
      [{ en: "worst", pt: "pior" }, "O(n²)", "neg", { en: "same as the best: input does not matter", pt: "igual ao melhor: a entrada não importa" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "text", { en: "in place", pt: "no lugar" }],
    ],
    chartTitle: { en: "SWAPS AT N = 1 000", pt: "TROCAS EM N = 1.000" },
    chart: [["bubble", 249750], ["insertion", 249750], ["heap", 9500], ["quick", 6900], ["selection", 999, true]],
    chartNote: { en: "random input · insertion counts shifts, quick uses Lomuto", pt: "entrada aleatória · insertion conta deslocamentos, quick usa Lomuto" },
    when: {
      en: ["When writes are expensive and reads are cheap: flash memory, EEPROM, or a list where moving an element is costly.", "Small arrays where n − 1 swaps and a trivially simple loop matter more than the comparison count."],
      pt: ["Quando escrever custa caro e ler é barato: memória flash, EEPROM, ou uma lista em que mover um elemento é caro.", "Vetores pequenos em que n − 1 trocas e um laço trivial importam mais que o número de comparações."],
    },
    pitfalls: {
      en: ["Not adaptive: a sorted array costs exactly as much as a reversed one.", "Not stable: the swap can jump an equal element over its twin.", "Insertion sort does the same comparisons on average and far fewer on nearly sorted input; prefer it unless swaps are the bottleneck."],
      pt: ["Não é adaptativo: um vetor ordenado custa exatamente o mesmo que um invertido.", "Não é estável: a troca pode pular um elemento igual por cima do seu gêmeo.", "O insertion sort faz as mesmas comparações na média e muito menos em entrada quase ordenada; prefira-o a menos que as trocas sejam o gargalo."],
    },
    history: {
      en: "Selection sort is old enough to have no single inventor; it appears in the earliest sorting surveys of the 1950s as the obvious way to sort by hand. Its lasting niche is hardware with a limited number of writes, and it is the sort behind heap sort once the scan is replaced by a heap.",
      pt: "O selection sort é antigo o bastante para não ter um inventor único; aparece nos primeiros levantamentos sobre ordenação, nos anos 1950, como o jeito óbvio de ordenar à mão. Seu nicho duradouro é hardware com número limitado de escritas, e ele é a base do heap sort quando a varredura é trocada por um heap.",
    },
    file: "selection_sort",
    code: {
      ts: ["function selectionSort(array: number[]) {", "  for (let i = 0; i < array.length - 1; i++) {", "    let minIndex = i;", "    for (let j = i + 1; j < array.length; j++) {", "      if (array[j] < array[minIndex]) minIndex = j;", "    }", "    if (minIndex !== i) [array[i], array[minIndex]] = [array[minIndex], array[i]];", "  }", "}"],
      py: ["def selection_sort(array):", "    for i in range(len(array) - 1):", "        min_index = i", "        for j in range(i + 1, len(array)):", "            if array[j] < array[min_index]: min_index = j", "", "        if min_index != i: array[i], array[min_index] = array[min_index], array[i]", "", ""],
      java: ["static void selectionSort(int[] array) {", "  for (int i = 0; i < array.length - 1; i++) {", "    int minIndex = i;", "    for (int j = i + 1; j < array.length; j++) {", "      if (array[j] < array[minIndex]) minIndex = j;", "    }", "    if (minIndex != i) { int temp = array[i]; array[i] = array[minIndex]; array[minIndex] = temp; }", "  }", "}"],
      cpp: ["void selectionSort(std::vector<int>& array) {", "  for (size_t i = 0; i + 1 < array.size(); i++) {", "    size_t minIndex = i;", "    for (size_t j = i + 1; j < array.size(); j++) {", "      if (array[j] < array[minIndex]) minIndex = j;", "    }", "    if (minIndex != i) std::swap(array[i], array[minIndex]);", "  }", "}"],
      c: ["void selection_sort(int *array, int length) {", "  for (int i = 0; i < length - 1; i++) {", "    int minIndex = i;", "    for (int j = i + 1; j < length; j++) {", "      if (array[j] < array[minIndex]) minIndex = j;", "    }", "    if (minIndex != i) { int temp = array[i]; array[i] = array[minIndex]; array[minIndex] = temp; }", "  }", "}"],
      go: ["func selectionSort(array []int) {", "\tfor i := 0; i < len(array)-1; i++ {", "\t\tminIndex := i", "\t\tfor j := i + 1; j < len(array); j++ {", "\t\t\tif array[j] < array[minIndex] { minIndex = j }", "\t\t}", "\t\tif minIndex != i { array[i], array[minIndex] = array[minIndex], array[i] }", "\t}", "}"],
      rs: ["fn selection_sort(array: &mut [i32]) {", "    for i in 0..array.len() - 1 {", "        let mut minIndex = i;", "        for j in i + 1..array.len() {", "            if array[j] < array[minIndex] { minIndex = j; }", "        }", "        if minIndex != i { array.swap(i, minIndex); }", "    }", "}"],
    },
    pseudo: {
      en: ["SELECTIONSORT(array)", "  for i ← 0 to n − 2", "    minIndex ← i", "    for j ← i + 1 to n − 1", "      if array[j] < array[minIndex]: minIndex ← j", "    swap array[i], array[minIndex]"],
      pt: ["SELECTIONSORT(vetor)", "  para i ← 0 até n − 2", "    índiceMín ← i", "    para j ← i + 1 até n − 1", "      se vetor[j] < vetor[índiceMín]: índiceMín ← j", "    troca vetor[i], vetor[índiceMín]"],
    },
  },

  insertion: {
    ...SIZE,
    family: "sorting",
    slug: "insertion-sort",
    kind: "bars",
    name: "Insertion sort",
    subtitle: { en: "insertion · slide into the sorted prefix", pt: "inserção · desliza para o prefixo ordenado" },
    tagline: { en: "insertion sort · the one the fast sorts fall back to", pt: "insertion sort · aquele a que os rápidos recorrem" },
    legend: [["violet", { en: "key", pt: "chave" }], ["primary", { en: "comparing", pt: "comparando" }], ["swap", { en: "shifted", pt: "deslocado" }], ["green", { en: "sorted prefix", pt: "prefixo ordenado" }]],
    kpis: [
      { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "one per shift, plus one to stop", pt: "uma por deslocamento, mais uma para parar" } },
      { key: "shifts", label: { en: "SHIFTS", pt: "DESLOCAMENTOS" }, sub: { en: "equals the inversions fixed", pt: "igual às inversões corrigidas" } },
      { key: "key", label: { en: "KEY", pt: "CHAVE" }, sub: { en: "value being inserted", pt: "valor sendo inserido" } },
      { key: "prefix", unitKey: "prefixUnit", label: { en: "PREFIX", pt: "PREFIXO" }, sub: { en: "sorted so far", pt: "ordenado até aqui" } },
      { key: "gap", label: { en: "GAP", pt: "BURACO" }, sub: { en: "where the key will land", pt: "onde a chave vai cair" } },
    ],
    idea: {
      en: [
        "Insertion sort keeps a sorted prefix and grows it one element at a time. It lifts the next value out, shifts every larger element of the prefix one slot to the right, and drops the value into the gap. It is how most people sort a hand of cards.",
        "The cost is the number of shifts, which equals the number of inversions in the input. Sorted input needs n − 1 comparisons and no shifts; reversed input needs n²/2 of each. That adaptivity is why quick sort and Tim sort hand small or nearly sorted runs to it.",
      ],
      pt: [
        "O insertion sort mantém um prefixo ordenado e o faz crescer um elemento por vez. Ele tira o próximo valor, desloca cada elemento maior do prefixo uma vaga para a direita e solta o valor no buraco. É como a maioria das pessoas ordena cartas na mão.",
        "O custo é o número de deslocamentos, que é igual ao número de inversões da entrada. Entrada ordenada precisa de n − 1 comparações e nenhum deslocamento; invertida precisa de n²/2 de cada. Essa adaptatividade é o motivo de quick sort e Tim sort entregarem a ele os trechos pequenos ou quase ordenados.",
      ],
    },
    stages: [
      ["violet", { en: "lift", pt: "levanta" }, { en: "key ← array[i]", pt: "chave ← array[i]" }],
      ["primary", { en: "compare", pt: "compara" }, { en: "array[j] against the key, right to left", pt: "array[j] com a chave, da direita para a esquerda" }],
      ["swap", { en: "shift", pt: "desloca" }, { en: "larger values move one slot right", pt: "valores maiores andam uma vaga à direita" }],
      ["green", { en: "drop", pt: "solta" }, { en: "key lands in the gap, prefix grows", pt: "a chave cai no buraco, o prefixo cresce" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n)", "green", { en: "sorted input: one comparison per element", pt: "entrada ordenada: uma comparação por elemento" }],
      [{ en: "average", pt: "médio" }, "O(n²)", "neg", { en: "n²/4 comparisons and shifts", pt: "n²/4 comparações e deslocamentos" }],
      [{ en: "worst", pt: "pior" }, "O(n²)", "neg", { en: "reversed input", pt: "entrada invertida" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "text", { en: "in place, one key held aside", pt: "no lugar, uma chave de lado" }],
    ],
    chartTitle: { en: "COMPARISONS AT N = 1 000 · NEARLY SORTED", pt: "COMPARAÇÕES EM N = 1.000 · QUASE ORDENADO" },
    chart: [["selection", 499500], ["quick", 13900], ["merge", 8700], ["bubble", 2000], ["insertion", 1100, true]],
    chartNote: { en: "input with 5% of the pairs out of order · adaptive sorts win here", pt: "entrada com 5% dos pares fora de ordem · os adaptativos ganham aqui" },
    when: {
      en: ["Small arrays, roughly under 32 elements: it is what std::sort, Tim sort and pdqsort switch to at the bottom of their recursion.", "Data that arrives nearly sorted, or an online setting where elements come one at a time and the list must stay sorted."],
      pt: ["Vetores pequenos, abaixo de uns 32 elementos: é para ele que std::sort, Tim sort e pdqsort trocam no fundo da recursão.", "Dados que chegam quase ordenados, ou um cenário online em que os elementos vêm um por vez e a lista precisa continuar ordenada."],
    },
    pitfalls: {
      en: ["Quadratic on random input: past a few dozen elements any O(n log n) sort wins.", "Shifting one slot at a time is the cost; binary insertion cuts the comparisons but not the shifts.", "On a linked list the shifts vanish, but so does the binary search."],
      pt: ["Quadrático em entrada aleatória: passando de algumas dezenas de elementos qualquer O(n log n) ganha.", "Deslocar uma vaga por vez é o custo; a inserção binária corta as comparações, mas não os deslocamentos.", "Numa lista ligada os deslocamentos somem, mas a busca binária também."],
    },
    history: {
      en: "John Mauchly described insertion sort, with a binary search for the slot, in a 1946 lecture at the Moore School, one of the first published sorting methods for a computer. Its adaptivity made it the finishing step of every practical hybrid sort since, from Sedgewick's quick sort variants to Tim Peters' Tim sort in 2002.",
      pt: "John Mauchly descreveu o insertion sort, com busca binária pela vaga, numa palestra de 1946 na Moore School, um dos primeiros métodos de ordenação publicados para um computador. A adaptatividade fez dele a etapa final de todo híbrido prático desde então, das variantes de quick sort de Sedgewick ao Tim sort de Tim Peters em 2002.",
    },
    file: "insertion_sort",
    code: {
      ts: ["function insertionSort(array: number[]) {", "  for (let i = 1; i < array.length; i++) {", "    const key = array[i];", "    let j = i - 1;", "    while (j >= 0 && array[j] > key) {", "      array[j + 1] = array[j];", "      j--;", "    }", "    array[j + 1] = key;", "  }", "}"],
      py: ["def insertion_sort(array):", "    for i in range(1, len(array)):", "        key = array[i]", "        j = i - 1", "        while j >= 0 and array[j] > key:", "            array[j + 1] = array[j]", "            j -= 1", "", "        array[j + 1] = key", "", ""],
      java: ["static void insertionSort(int[] array) {", "  for (int i = 1; i < array.length; i++) {", "    int key = array[i];", "    int j = i - 1;", "    while (j >= 0 && array[j] > key) {", "      array[j + 1] = array[j];", "      j--;", "    }", "    array[j + 1] = key;", "  }", "}"],
      cpp: ["void insertionSort(std::vector<int>& array) {", "  for (size_t i = 1; i < array.size(); i++) {", "    int key = array[i];", "    int j = i - 1;", "    while (j >= 0 && array[j] > key) {", "      array[j + 1] = array[j];", "      j--;", "    }", "    array[j + 1] = key;", "  }", "}"],
      c: ["void insertion_sort(int *array, int length) {", "  for (int i = 1; i < length; i++) {", "    int key = array[i];", "    int j = i - 1;", "    while (j >= 0 && array[j] > key) {", "      array[j + 1] = array[j];", "      j--;", "    }", "    array[j + 1] = key;", "  }", "}"],
      go: ["func insertionSort(array []int) {", "\tfor i := 1; i < len(array); i++ {", "\t\tkey := array[i]", "\t\tj := i - 1", "\t\tfor j >= 0 && array[j] > key {", "\t\t\tarray[j+1] = array[j]", "\t\t\tj--", "\t\t}", "\t\tarray[j+1] = key", "\t}", "}"],
      rs: ["fn insertion_sort(array: &mut [i32]) {", "    for i in 1..array.len() {", "        let key = array[i];", "        let mut j = i as isize - 1;", "        while j >= 0 && array[j as usize] > key {", "            array[j as usize + 1] = array[j as usize];", "            j -= 1;", "        }", "        array[(j + 1) as usize] = key;", "    }", "}"],
    },
    pseudo: {
      en: ["INSERTIONSORT(array)", "  for i ← 1 to n − 1", "    key ← array[i]; j ← i − 1", "    while j ≥ 0 and array[j] > key", "      array[j + 1] ← array[j]; j ← j − 1", "    array[j + 1] ← key"],
      pt: ["INSERTIONSORT(vetor)", "  para i ← 1 até n − 1", "    chave ← vetor[i]; j ← i − 1", "    enquanto j ≥ 0 e vetor[j] > chave", "      vetor[j + 1] ← vetor[j]; j ← j − 1", "    vetor[j + 1] ← chave"],
    },
  },

  merge: {
    ...SIZE,
    family: "sorting",
    slug: "merge-sort",
    kind: "bars",
    name: "Merge sort",
    subtitle: { en: "divide and conquer · stable", pt: "divisão e conquista · estável" },
    tagline: { en: "merge sort · the sort that never has a bad day", pt: "merge sort · a ordenação que nunca tem um dia ruim" },
    legend: [["violet", { en: "split point", pt: "ponto de divisão" }], ["primary", { en: "comparing", pt: "comparando" }], ["swap", { en: "written back", pt: "escrito de volta" }], ["green", { en: "done", pt: "concluído" }]],
    kpis: [
      { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "≈ n log₂ n − n expected", pt: "≈ n log₂ n − n esperadas" } },
      { key: "writes", label: { en: "WRITES", pt: "ESCRITAS" }, sub: { en: "from the buffer back into a", pt: "do buffer de volta para a" } },
      { key: "depth", unitKey: "depthUnit", label: { en: "DEPTH", pt: "PROFUNDIDADE" }, sub: { en: "recursion now / max", pt: "recursão agora / máx" } },
      { key: "range", label: { en: "RANGE", pt: "INTERVALO" }, sub: { en: "current call", pt: "chamada atual" } },
      { key: "merges", label: { en: "MERGES", pt: "FUSÕES" }, sub: { en: "completed so far", pt: "concluídas até aqui" } },
    ],
    idea: {
      en: [
        "Merge sort splits the range in half, sorts each half recursively, and merges the two sorted halves by repeatedly taking the smaller front element. Ranges of one element are sorted by definition, so the recursion bottoms out immediately and all the work happens in the merges.",
        "Every level of the recursion merges n elements in total, and there are log₂ n levels, so the cost is n log n whatever the input. The price is the buffer: merging in place is possible but awkward, so the textbook version copies into a temporary array and back.",
      ],
      pt: [
        "O merge sort divide o intervalo ao meio, ordena cada metade recursivamente e funde as duas metades ordenadas pegando repetidamente o menor elemento da frente. Intervalos de um elemento estão ordenados por definição, então a recursão termina na hora e todo o trabalho acontece nas fusões.",
        "Cada nível da recursão funde n elementos no total, e há log₂ n níveis, então o custo é n log n seja qual for a entrada. O preço é o buffer: fundir no lugar é possível mas desajeitado, por isso a versão de livro copia para um vetor temporário e de volta.",
      ],
    },
    stages: [
      ["violet", { en: "split", pt: "divide" }, { en: "middle ← (low + high) / 2", pt: "middle ← (low + high) / 2" }],
      ["primary", { en: "compare", pt: "compara" }, { en: "front of the left half vs the right", pt: "frente da metade esquerda vs a direita" }],
      ["swap", { en: "merge", pt: "funde" }, { en: "smaller one goes to the buffer", pt: "o menor vai para o buffer" }],
      ["green", { en: "copy back", pt: "copia de volta" }, { en: "buffer overwrites [low, high]", pt: "o buffer sobrescreve [low, high]" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n log n)", "green", { en: "even sorted input is split and merged", pt: "até entrada ordenada é dividida e fundida" }],
      [{ en: "average", pt: "médio" }, "O(n log n)", "green", { en: "≈ n log₂ n − n comparisons", pt: "≈ n log₂ n − n comparações" }],
      [{ en: "worst", pt: "pior" }, "O(n log n)", "green", { en: "no bad input exists", pt: "não existe entrada ruim" }],
      [{ en: "space", pt: "espaço" }, "O(n)", "neg", { en: "the merge buffer", pt: "o buffer da fusão" }],
    ],
    chartTitle: { en: "COMPARISONS AT N = 1 000", pt: "COMPARAÇÕES EM N = 1.000" },
    chart: [["bubble", 499500], ["insertion", 250000], ["heap", 17000], ["quick", 13900], ["merge", 8700, true]],
    chartNote: { en: "random input · quick sort is faster in practice through cache and fewer moves", pt: "entrada aleatória · na prática o quick sort é mais rápido por cache e menos movimentos" },
    when: {
      en: ["Whenever stability matters: sorting records by one field without scrambling the order of equal ones. It is the sort behind Java's object sort and Python's sorted.", "Linked lists and external sorting: merging needs only sequential access, so it works on tapes, files and lists."],
      pt: ["Sempre que a estabilidade importa: ordenar registros por um campo sem embaralhar a ordem dos iguais. É a base do sort de objetos do Java e do sorted do Python.", "Listas ligadas e ordenação externa: fundir só precisa de acesso sequencial, então funciona em fitas, arquivos e listas."],
    },
    pitfalls: {
      en: ["The O(n) buffer: on huge arrays or tight memory, quick sort or heap sort sort in place.", "Allocating the buffer inside every merge is the classic performance bug; allocate once.", "The naive version keeps merging already sorted runs; Tim sort detects them and skips the work."],
      pt: ["O buffer O(n): em vetores enormes ou memória apertada, quick sort ou heap sort ordenam no lugar.", "Alocar o buffer dentro de cada fusão é o bug de desempenho clássico; aloque uma vez.", "A versão ingênua continua fundindo trechos já ordenados; o Tim sort detecta esses trechos e pula o trabalho."],
    },
    history: {
      en: "John von Neumann wrote merge sort in 1945 as one of the first programs for the EDVAC, and described it formally with Herman Goldstine in 1948. It is the ancestor of Tim sort, which Tim Peters built for Python in 2002 and which Java and Android adopted later.",
      pt: "John von Neumann escreveu o merge sort em 1945 como um dos primeiros programas para o EDVAC, e o descreveu formalmente com Herman Goldstine em 1948. É o ancestral do Tim sort, que Tim Peters criou para o Python em 2002 e que Java e Android adotaram depois.",
    },
    file: "merge_sort",
    code: {
      ts: ["function mergeSort(array: number[], low: number, high: number) {", "  if (high - low < 1) return;", "  const middle = (low + high) >> 1;", "  mergeSort(array, low, middle);", "  mergeSort(array, middle + 1, high);", "  const merged: number[] = [];", "  let i = low, j = middle + 1;", "  while (i <= middle && j <= high) {", "    if (array[i] <= array[j]) merged.push(array[i++]);", "    else merged.push(array[j++]);", "  }", "  while (i <= middle) merged.push(array[i++]);", "  while (j <= high) merged.push(array[j++]);", "  for (let k = 0; k < merged.length; k++) array[low + k] = merged[k];", "}"],
      py: ["def merge_sort(array, low, high):", "    if high - low < 1: return", "    middle = (low + high) // 2", "    merge_sort(array, low, middle)", "    merge_sort(array, middle + 1, high)", "    merged = []", "    i, j = low, middle + 1", "    while i <= middle and j <= high:", "        if array[i] <= array[j]: merged.append(array[i]); i += 1", "        else: merged.append(array[j]); j += 1", "", "    while i <= middle: merged.append(array[i]); i += 1", "    while j <= high: merged.append(array[j]); j += 1", "    array[low:high + 1] = merged", ""],
      java: ["static void mergeSort(int[] array, int low, int high) {", "  if (high - low < 1) return;", "  int middle = (low + high) >>> 1;", "  mergeSort(array, low, middle);", "  mergeSort(array, middle + 1, high);", "  int[] merged = new int[high - low + 1]; int k = 0;", "  int i = low, j = middle + 1;", "  while (i <= middle && j <= high) {", "    if (array[i] <= array[j]) merged[k++] = array[i++];", "    else merged[k++] = array[j++];", "  }", "  while (i <= middle) merged[k++] = array[i++];", "  while (j <= high) merged[k++] = array[j++];", "  for (k = 0; k < merged.length; k++) array[low + k] = merged[k];", "}"],
      cpp: ["void mergeSort(std::vector<int>& array, int low, int high) {", "  if (high - low < 1) return;", "  int middle = (low + high) / 2;", "  mergeSort(array, low, middle);", "  mergeSort(array, middle + 1, high);", "  std::vector<int> merged;", "  int i = low, j = middle + 1;", "  while (i <= middle && j <= high) {", "    if (array[i] <= array[j]) merged.push_back(array[i++]);", "    else merged.push_back(array[j++]);", "  }", "  while (i <= middle) merged.push_back(array[i++]);", "  while (j <= high) merged.push_back(array[j++]);", "  for (size_t k = 0; k < merged.size(); k++) array[low + k] = merged[k];", "}"],
      c: ["void merge_sort(int *array, int low, int high) {", "  if (high - low < 1) return;", "  int middle = (low + high) / 2;", "  merge_sort(array, low, middle);", "  merge_sort(array, middle + 1, high);", "  int merged[high - low + 1]; int k = 0;", "  int i = low, j = middle + 1;", "  while (i <= middle && j <= high) {", "    if (array[i] <= array[j]) merged[k++] = array[i++];", "    else merged[k++] = array[j++];", "  }", "  while (i <= middle) merged[k++] = array[i++];", "  while (j <= high) merged[k++] = array[j++];", "  for (k = 0; k <= high - low; k++) array[low + k] = merged[k];", "}"],
      go: ["func mergeSort(array []int, low, high int) {", "\tif high-low < 1 { return }", "\tmiddle := (low + high) / 2", "\tmergeSort(array, low, middle)", "\tmergeSort(array, middle+1, high)", "\tmerged := []int{}", "\ti, j := low, middle+1", "\tfor i <= middle && j <= high {", "\t\tif array[i] <= array[j] { merged = append(merged, array[i]); i++ } else {", "\t\t\tmerged = append(merged, array[j]); j++ }", "\t}", "\tfor i <= middle { merged = append(merged, array[i]); i++ }", "\tfor j <= high { merged = append(merged, array[j]); j++ }", "\tcopy(array[low:high+1], merged)", "}"],
      rs: ["fn merge_sort(array: &mut [i32], low: usize, high: usize) {", "    if high <= low { return; }", "    let middle = (low + high) / 2;", "    merge_sort(array, low, middle);", "    merge_sort(array, middle + 1, high);", "    let mut merged = Vec::new();", "    let (mut i, mut j) = (low, middle + 1);", "    while i <= middle && j <= high {", "        if array[i] <= array[j] { merged.push(array[i]); i += 1; }", "        else { merged.push(array[j]); j += 1; }", "    }", "    while i <= middle { merged.push(array[i]); i += 1; }", "    while j <= high { merged.push(array[j]); j += 1; }", "    array[low..=high].copy_from_slice(&merged);", "}"],
    },
    pseudo: {
      en: ["MERGESORT(array, low, high)", "  if high − low < 1: return", "  middle ← ⌊(low + high) / 2⌋", "  MERGESORT(array, low, middle); MERGESORT(array, middle + 1, high)", "  merge the sorted halves into merged, smaller front first", "  copy merged back into array[low..high]"],
      pt: ["MERGESORT(vetor, baixo, alto)", "  se alto − baixo < 1: retorna", "  meio ← ⌊(baixo + alto) / 2⌋", "  MERGESORT(vetor, baixo, meio); MERGESORT(vetor, meio + 1, alto)", "  funde as metades ordenadas em fundido, a menor frente primeiro", "  copia fundido de volta em vetor[baixo..alto]"],
    },
  },

  quick: {
    ...SIZE,
    family: "sorting",
    slug: "quick-sort",
    kind: "bars",
    name: "Quick sort",
    subtitle: { en: "divide and conquer · Lomuto partition", pt: "divisão e conquista · partição de Lomuto" },
    tagline: { en: "quick sort · Lomuto partition · what the animation does not tell you", pt: "quick sort · partição de Lomuto · o que a animação não conta" },
    legend: [["primary", { en: "comparing", pt: "comparando" }], ["swap", { en: "swapped", pt: "trocado" }], ["violet", { en: "pivot", pt: "pivô" }], ["green", { en: "in place", pt: "no lugar" }]],
    kpis: [
      { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "≈ 1.39 n log₂ n expected", pt: "≈ 1,39 n log₂ n esperadas" } },
      { key: "swaps", label: { en: "SWAPS", pt: "TROCAS" }, sub: { en: "incl. pivot placements", pt: "incl. fixar pivôs" } },
      { key: "depth", unitKey: "depthUnit", label: { en: "DEPTH", pt: "PROFUNDIDADE" }, sub: { en: "recursion stack now / max", pt: "pilha de recursão agora / máx" } },
      { key: "range", label: { en: "RANGE", pt: "INTERVALO" }, sub: { en: "current partition", pt: "partição atual" } },
      IN_PLACE_KPI,
    ],
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
      ["violet", { en: "pivot", pt: "pivô" }, { en: "choose array[high]", pt: "escolhe array[high]" }],
      ["primary", { en: "partition", pt: "particiona" }, { en: "smaller values go left of i", pt: "menores vão para a esquerda de i" }],
      ["swap", { en: "place", pt: "fixa" }, { en: "swap pivot to array[i], it is final", pt: "pivô troca com array[i], está no lugar" }],
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
    file: "quick_sort",
    code: {
      ts: ["function quickSort(array: number[], low: number, high: number) {", "  if (low >= high) return;", "  const pivot = array[high];", "  let i = low;", "  for (let j = low; j < high; j++) {", "    if (array[j] < pivot) {", "      [array[i], array[j]] = [array[j], array[i]];", "      i++;", "    }", "  }", "  [array[i], array[high]] = [array[high], array[i]];", "  quickSort(array, low, i - 1);", "  quickSort(array, i + 1, high);", "}"],
      py: ["def quick_sort(array, low, high):", "    if low >= high: return", "    pivot = array[high]", "    i = low", "    for j in range(low, high):", "        if array[j] < pivot:", "            array[i], array[j] = array[j], array[i]", "            i += 1", "", "", "    array[i], array[high] = array[high], array[i]", "    quick_sort(array, low, i - 1)", "    quick_sort(array, i + 1, high)", ""],
      java: ["static void quickSort(int[] array, int low, int high) {", "  if (low >= high) return;", "  int pivot = array[high];", "  int i = low;", "  for (int j = low; j < high; j++) {", "    if (array[j] < pivot) {", "      int temp = array[i]; array[i] = array[j]; array[j] = temp;", "      i++;", "    }", "  }", "  int temp = array[i]; array[i] = array[high]; array[high] = temp;", "  quickSort(array, low, i - 1);", "  quickSort(array, i + 1, high);", "}"],
      cpp: ["void quickSort(std::vector<int>& array, int low, int high) {", "  if (low >= high) return;", "  int pivot = array[high];", "  int i = low;", "  for (int j = low; j < high; ++j) {", "    if (array[j] < pivot) {", "      std::swap(array[i], array[j]);", "      ++i;", "    }", "  }", "  std::swap(array[i], array[high]);", "  quickSort(array, low, i - 1);", "  quickSort(array, i + 1, high);", "}"],
      c: ["void quick_sort(int *array, int low, int high) {", "  if (low >= high) return;", "  int pivot = array[high];", "  int i = low;", "  for (int j = low; j < high; j++) {", "    if (array[j] < pivot) {", "      int temp = array[i]; array[i] = array[j]; array[j] = temp;", "      i++;", "    }", "  }", "  int temp = array[i]; array[i] = array[high]; array[high] = temp;", "  quick_sort(array, low, i - 1);", "  quick_sort(array, i + 1, high);", "}"],
      go: ["func quickSort(array []int, low, high int) {", "\tif low >= high { return }", "\tpivot := array[high]", "\ti := low", "\tfor j := low; j < high; j++ {", "\t\tif array[j] < pivot {", "\t\t\tarray[i], array[j] = array[j], array[i]", "\t\t\ti++", "\t\t}", "\t}", "\tarray[i], array[high] = array[high], array[i]", "\tquickSort(array, low, i-1)", "\tquickSort(array, i+1, high)", "}"],
      rs: ["fn quick_sort(array: &mut [i32], low: isize, high: isize) {", "    if low >= high { return; }", "    let pivot = array[high as usize];", "    let mut i = low;", "    for j in low..high {", "        if array[j as usize] < pivot {", "            array.swap(i as usize, j as usize);", "            i += 1;", "        }", "    }", "    array.swap(i as usize, high as usize);", "    quick_sort(array, low, i - 1);", "    quick_sort(array, i + 1, high);", "}"],
    },
    pseudo: {
      en: ["QUICKSORT(array, low, high)", "  if low ≥ high: return", "  pivot ← array[high]; i ← low", "  for j ← low to high − 1", "    if array[j] < pivot: swap array[i], array[j]; i ← i + 1", "  swap array[i], array[high]", "  QUICKSORT(array, low, i − 1)", "  QUICKSORT(array, i + 1, high)"],
      pt: ["QUICKSORT(vetor, baixo, alto)", "  se baixo ≥ alto: retorna", "  pivô ← vetor[alto]; i ← baixo", "  para j ← baixo até alto − 1", "    se vetor[j] < pivô: troca vetor[i], vetor[j]; i ← i + 1", "  troca vetor[i], vetor[alto]", "  QUICKSORT(vetor, baixo, i − 1)", "  QUICKSORT(vetor, i + 1, alto)"],
    },
  },

  heap: {
    ...SIZE,
    family: "sorting",
    slug: "heap-sort",
    kind: "bars",
    name: "Heap sort",
    subtitle: { en: "selection with a heap · in place", pt: "seleção com heap · no lugar" },
    tagline: { en: "heap sort · n log n with no extra memory", pt: "heap sort · n log n sem memória extra" },
    legend: [["violet", { en: "sifting node", pt: "nó descendo" }], ["primary", { en: "comparing", pt: "comparando" }], ["swap", { en: "swapped", pt: "trocado" }], ["green", { en: "in place", pt: "no lugar" }]],
    kpis: [
      { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "≈ 2 n log₂ n expected", pt: "≈ 2 n log₂ n esperadas" } },
      { key: "swaps", label: { en: "SWAPS", pt: "TROCAS" }, sub: { en: "sifts plus pops", pt: "descidas mais retiradas" } },
      { key: "heapSize", unitKey: "heapUnit", label: { en: "HEAP", pt: "HEAP" }, sub: { en: "elements still in the heap", pt: "elementos ainda no heap" } },
      { key: "phase", label: { en: "PHASE", pt: "FASE" }, sub: { en: "build, then pop n − 1 times", pt: "monta, depois retira n − 1 vezes" } },
      IN_PLACE_KPI,
    ],
    idea: {
      en: [
        "Heap sort treats the array as a binary tree stored level by level: the children of index i sit at 2i + 1 and 2i + 2. It first rearranges the array into a max-heap, where every parent is at least as large as its children, so the maximum is at index 0.",
        "Then it repeats n − 1 times: swap the root with the last element of the heap, shrink the heap by one, and sift the new root down until the heap property holds again. Each pop places one value in its final position, from the end backwards.",
      ],
      pt: [
        "O heap sort trata o vetor como uma árvore binária guardada nível a nível: os filhos do índice i ficam em 2i + 1 e 2i + 2. Primeiro ele reorganiza o vetor num max-heap, em que todo pai é pelo menos tão grande quanto seus filhos, então o máximo fica no índice 0.",
        "Depois repete n − 1 vezes: troca a raiz com o último elemento do heap, encolhe o heap em um e desce a nova raiz até a propriedade de heap valer de novo. Cada retirada põe um valor na posição final, do fim para o começo.",
      ],
    },
    stages: [
      ["violet", { en: "build", pt: "monta" }, { en: "sift down from the last parent to the root", pt: "desce do último pai até a raiz" }],
      ["swap", { en: "pop", pt: "retira" }, { en: "root ↔ last element, heap shrinks", pt: "raiz ↔ último elemento, o heap encolhe" }],
      ["primary", { en: "sift", pt: "desce" }, { en: "parent vs its larger child", pt: "pai vs o filho maior" }],
      ["green", { en: "settle", pt: "assenta" }, { en: "the popped value is final", pt: "o valor retirado é definitivo" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n log n)", "green", { en: "sorted input still builds and pops", pt: "entrada ordenada ainda monta e retira" }],
      [{ en: "average", pt: "médio" }, "O(n log n)", "green", { en: "≈ 2 n log₂ n comparisons", pt: "≈ 2 n log₂ n comparações" }],
      [{ en: "worst", pt: "pior" }, "O(n log n)", "green", { en: "guaranteed, unlike quick sort", pt: "garantido, ao contrário do quick sort" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "text", { en: "in place; the heap lives in the array", pt: "no lugar; o heap mora no vetor" }],
    ],
    chartTitle: { en: "COMPARISONS AT N = 1 000", pt: "COMPARAÇÕES EM N = 1.000" },
    chart: [["bubble", 499500], ["insertion", 250000], ["heap", 17000, true], ["quick", 13900], ["merge", 8700]],
    chartNote: { en: "random input · the extra comparisons are the price of O(1) space", pt: "entrada aleatória · as comparações a mais são o preço do espaço O(1)" },
    when: {
      en: ["When you need a guaranteed n log n bound with no extra memory: embedded systems, kernels, and the fallback inside introsort when quick sort degrades.", "Partial sorting: the first k pops give the k largest elements in O(n + k log n)."],
      pt: ["Quando você precisa de n log n garantido sem memória extra: sistemas embarcados, kernels, e o fallback do introsort quando o quick sort degrada.", "Ordenação parcial: as primeiras k retiradas dão os k maiores elementos em O(n + k log n)."],
    },
    pitfalls: {
      en: ["Poor cache behaviour: sift-down jumps across the array, so quick sort beats it by 2 to 3× in practice.", "Not stable, and not adaptive: sorted input is no faster.", "Building the heap by n inserts is O(n log n); Floyd's bottom-up build is O(n)."],
      pt: ["Mau comportamento de cache: o sift-down salta pelo vetor, então na prática o quick sort ganha por 2 a 3×.", "Não é estável nem adaptativo: entrada ordenada não é mais rápida.", "Montar o heap com n inserções é O(n log n); a construção de baixo para cima de Floyd é O(n)."],
    },
    history: {
      en: "J. W. J. Williams published heap sort in 1964, introducing the binary heap along with it. Robert Floyd improved it the same year with the O(n) bottom-up heap construction shown here, and the algorithm became the safety net of introsort, the sort behind most C++ standard libraries.",
      pt: "J. W. J. Williams publicou o heap sort em 1964, apresentando junto o heap binário. Robert Floyd o melhorou no mesmo ano com a construção de heap de baixo para cima em O(n) mostrada aqui, e o algoritmo virou a rede de segurança do introsort, a ordenação por trás da maioria das bibliotecas padrão de C++.",
    },
    file: "heap_sort",
    code: {
      ts: ["function heapSort(array: number[]) {", "  const length = array.length;", "  for (let i = (length >> 1) - 1; i >= 0; i--) siftDown(array, i, length);", "  for (let end = length - 1; end > 0; end--) {", "    [array[0], array[end]] = [array[end], array[0]];", "    siftDown(array, 0, end);", "  }", "}", "function siftDown(array: number[], i: number, size: number) {", "  while (true) {", "    const left = 2 * i + 1, right = left + 1;", "    let largest = i;", "    if (left < size && array[left] > array[largest]) largest = left;", "    if (right < size && array[right] > array[largest]) largest = right;", "    if (largest === i) return;", "    [array[i], array[largest]] = [array[largest], array[i]];", "    i = largest;", "  }", "}"],
      py: ["def heap_sort(array):", "    length = len(array)", "    for i in range(length // 2 - 1, -1, -1): sift_down(array, i, length)", "    for end in range(length - 1, 0, -1):", "        array[0], array[end] = array[end], array[0]", "        sift_down(array, 0, end)", "", "", "def sift_down(array, i, size):", "    while True:", "        left, right = 2 * i + 1, 2 * i + 2", "        largest = i", "        if left < size and array[left] > array[largest]: largest = left", "        if right < size and array[right] > array[largest]: largest = right", "        if largest == i: return", "        array[i], array[largest] = array[largest], array[i]", "        i = largest", "", ""],
      java: ["static void heapSort(int[] array) {", "  int length = array.length;", "  for (int i = length / 2 - 1; i >= 0; i--) siftDown(array, i, length);", "  for (int end = length - 1; end > 0; end--) {", "    int temp = array[0]; array[0] = array[end]; array[end] = temp;", "    siftDown(array, 0, end);", "  }", "}", "static void siftDown(int[] array, int i, int size) {", "  while (true) {", "    int left = 2 * i + 1, right = left + 1;", "    int largest = i;", "    if (left < size && array[left] > array[largest]) largest = left;", "    if (right < size && array[right] > array[largest]) largest = right;", "    if (largest == i) return;", "    int temp = array[i]; array[i] = array[largest]; array[largest] = temp;", "    i = largest;", "  }", "}"],
      cpp: ["void heapSort(std::vector<int>& array) {", "  int length = array.size();", "  for (int i = length / 2 - 1; i >= 0; i--) siftDown(array, i, length);", "  for (int end = length - 1; end > 0; end--) {", "    std::swap(array[0], array[end]);", "    siftDown(array, 0, end);", "  }", "}", "void siftDown(std::vector<int>& array, int i, int size) {", "  while (true) {", "    int left = 2 * i + 1, right = left + 1;", "    int largest = i;", "    if (left < size && array[left] > array[largest]) largest = left;", "    if (right < size && array[right] > array[largest]) largest = right;", "    if (largest == i) return;", "    std::swap(array[i], array[largest]);", "    i = largest;", "  }", "}"],
      c: ["void heap_sort(int *array, int length) {", "  ", "  for (int i = length / 2 - 1; i >= 0; i--) sift_down(array, i, length);", "  for (int end = length - 1; end > 0; end--) {", "    int temp = array[0]; array[0] = array[end]; array[end] = temp;", "    sift_down(array, 0, end);", "  }", "}", "void sift_down(int *array, int i, int size) {", "  while (1) {", "    int left = 2 * i + 1, right = left + 1;", "    int largest = i;", "    if (left < size && array[left] > array[largest]) largest = left;", "    if (right < size && array[right] > array[largest]) largest = right;", "    if (largest == i) return;", "    int temp = array[i]; array[i] = array[largest]; array[largest] = temp;", "    i = largest;", "  }", "}"],
      go: ["func heapSort(array []int) {", "\tlength := len(array)", "\tfor i := length/2 - 1; i >= 0; i-- { siftDown(array, i, length) }", "\tfor end := length - 1; end > 0; end-- {", "\t\tarray[0], array[end] = array[end], array[0]", "\t\tsiftDown(array, 0, end)", "\t}", "}", "func siftDown(array []int, i, size int) {", "\tfor {", "\t\tleft, right := 2*i+1, 2*i+2", "\t\tlargest := i", "\t\tif left < size && array[left] > array[largest] { largest = left }", "\t\tif right < size && array[right] > array[largest] { largest = right }", "\t\tif largest == i { return }", "\t\tarray[i], array[largest] = array[largest], array[i]", "\t\ti = largest", "\t}", "}"],
      rs: ["fn heap_sort(array: &mut [i32]) {", "    let length = array.len();", "    for i in (0..length / 2).rev() { sift_down(array, i, length); }", "    for end in (1..length).rev() {", "        array.swap(0, end);", "        sift_down(array, 0, end);", "    }", "}", "fn sift_down(array: &mut [i32], mut i: usize, size: usize) {", "    loop {", "        let (left, right) = (2 * i + 1, 2 * i + 2);", "        let mut largest = i;", "        if left < size && array[left] > array[largest] { largest = left; }", "        if right < size && array[right] > array[largest] { largest = right; }", "        if largest == i { return; }", "        array.swap(i, largest);", "        i = largest;", "    }", "}"],
    },
    pseudo: {
      en: ["HEAPSORT(array)", "  for i ← ⌊n/2⌋ − 1 down to 0: SIFTDOWN(array, i, n)", "  for end ← n − 1 down to 1", "    swap array[0], array[end]; SIFTDOWN(array, 0, end)", "SIFTDOWN(array, i, size)", "  while a child of i is larger: swap with the larger child, descend"],
      pt: ["HEAPSORT(vetor)", "  para i ← ⌊n/2⌋ − 1 até 0: SIFTDOWN(vetor, i, n)", "  para end ← n − 1 até 1", "    troca vetor[0], vetor[end]; SIFTDOWN(vetor, 0, end)", "SIFTDOWN(vetor, i, tamanho)", "  enquanto um filho de i for maior: troca com o filho maior, desce"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
