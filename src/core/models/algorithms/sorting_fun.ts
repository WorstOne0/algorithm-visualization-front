// Models
import type { Localized } from "../translations";
import type { VizKey } from "../viz";
import type { AlgorithmSpec } from "./spec";

const BASE = { sizeLabel: { en: "Size", pt: "Tamanho" }, shuffleLabel: { en: "Shuffle", pt: "Embaralhar" }, family: "sorting", kind: "bars" } as const;

const LEGEND_BOGO: [VizKey, Localized][] = [["primary", { en: "first pair out of order", pt: "primeiro par fora de ordem" }], ["swap", { en: "just shuffled", pt: "recém embaralhado" }], ["green", { en: "sorted", pt: "ordenado" }]];
const LEGEND_SLEEP: [VizKey, Localized][] = [["primary", { en: "timer scheduled · just fired", pt: "timer agendado · recém disparado" }], ["green", { en: "output so far", pt: "saída até aqui" }], ["def", { en: "still sleeping", pt: "ainda dormindo" }]];

export const SORTING_FUN = {
  bogo: {
    ...BASE,
    minN: 3,
    maxN: 6,
    stepN: 1,
    defaultN: 4,
    stepMs: 160,
    slug: "bogo-sort",
    name: "Bogo sort",
    subtitle: { en: "shuffle until it happens to be sorted", pt: "embaralha até por acaso estar ordenado" },
    tagline: { en: "bogo sort · the joke at the end of every sorting video", pt: "bogo sort · a piada no fim de todo vídeo de ordenação" },
    legend: LEGEND_BOGO,
    kpis: [{ key: "shuffles", label: { en: "SHUFFLES", pt: "EMBARALHAMENTOS" }, sub: { en: "random permutations tried", pt: "permutações aleatórias tentadas" } }, { key: "expected", label: { en: "EXPECTED", pt: "ESPERADOS" }, sub: { en: "n! shuffles on average", pt: "n! embaralhamentos em média" } }, { key: "comparisons", label: { en: "COMPARISONS", pt: "COMPARAÇÕES" }, sub: { en: "in the sortedness checks", pt: "nas verificações de ordem" } }, { key: "checks", label: { en: "CHECKS", pt: "VERIFICAÇÕES" }, sub: { en: "one before each shuffle", pt: "uma antes de cada embaralhamento" } }, { key: "prefix", label: { en: "SORTED PREFIX", pt: "PREFIXO ORDENADO" }, sub: { en: "values in order before the first fault", pt: "valores em ordem antes da primeira falha" } }],
    idea: {
      en: [
        "Bogo sort checks whether the array is sorted and, if not, shuffles it at random and checks again. Every shuffle is one of the n! permutations, exactly one of which is sorted, so on average it takes n! shuffles: 24 for four values, 3.6 million for ten, more than the age of the universe for twenty.",
        "It is a real algorithm in the sense that it terminates with probability 1, and a useless one in every other sense. Its value is as a baseline: any idea that beats it is progress, and its analysis is a clean exercise in expected running time. The deterministic cousin, which tries every permutation in order, is called permutation sort.",
      ],
      pt: [
        "O bogo sort verifica se o array está ordenado e, se não, embaralha ao acaso e verifica de novo. Cada embaralhamento é uma das n! permutações, e exatamente uma delas é a ordenada, então em média leva n! embaralhamentos: 24 para quatro valores, 3,6 milhões para dez, mais que a idade do universo para vinte.",
        "É um algoritmo real no sentido de que termina com probabilidade 1, e inútil em todos os outros sentidos. Seu valor é como base de comparação: qualquer ideia que o vença é progresso, e sua análise é um exercício limpo de tempo esperado de execução. O primo determinístico, que tenta cada permutação em ordem, se chama permutation sort.",
      ],
    },
    stages: [
      ["primary", { en: "check", pt: "verifica" }, { en: "walk the pairs until one is out of order", pt: "percorre os pares até um fora de ordem" }],
      ["swap", { en: "shuffle", pt: "embaralha" }, { en: "Fisher–Yates, n − 1 random swaps", pt: "Fisher–Yates, n − 1 trocas aleatórias" }],
      ["primary", { en: "repeat", pt: "repete" }, { en: "until a check passes", pt: "até uma verificação passar" }],
      ["green", { en: "done", pt: "pronto" }, { en: "by luck, eventually", pt: "por sorte, um dia" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n)", "green", { en: "already sorted: one check", pt: "já ordenado: uma verificação" }],
      [{ en: "average", pt: "médio" }, "O(n · n!)", "neg", { en: "n! shuffles of n swaps each", pt: "n! embaralhamentos de n trocas cada" }],
      [{ en: "worst", pt: "pior" }, "O(∞)", "neg", { en: "unbounded: it may never finish", pt: "sem limite: pode nunca terminar" }],
      [{ en: "space", pt: "espaço" }, "O(1)", "green", { en: "in place", pt: "no lugar" }],
    ],
    chartTitle: { en: "EXPECTED SHUFFLES · n!", pt: "EMBARALHAMENTOS ESPERADOS · n!" },
    chart: [["n = 4", 24, true], ["n = 6", 720], ["n = 8", 40320], ["n = 10", 3628800], ["bubble n = 10 (comparisons)", 45]],
    chartNote: { en: "each shuffle costs n swaps and each check up to n − 1 comparisons", pt: "cada embaralhamento custa n trocas e cada verificação até n − 1 comparações" },
    when: {
      en: ["Never, for sorting.", "As the baseline in a lecture on expected running time, or as the punchline of one."],
      pt: ["Nunca, para ordenar.", "Como base numa aula sobre tempo esperado de execução, ou como piada final de uma."],
    },
    pitfalls: {
      en: ["A biased shuffle (swapping with a random index from the whole array) makes some permutations likelier than others; Fisher–Yates is the correct one.", "The page gives up after 400 shuffles: at n = 6 the expected count is 720, so it usually does.", "Quantum bogo sort, which destroys every universe where the shuffle failed, is O(n) and not available."],
      pt: ["Um embaralhamento enviesado (trocar com um índice aleatório do array inteiro) torna algumas permutações mais prováveis que outras; o Fisher–Yates é o correto.", "A página desiste depois de 400 embaralhamentos: em n = 6 a contagem esperada é 720, então em geral desiste.", "O quantum bogo sort, que destrói todo universo em que o embaralhamento falhou, é O(n) e não está disponível."],
    },
    history: {
      en: "The name is a play on bogus; the Jargon File lists it under bogo-sort as a synonym for any hopelessly bad algorithm. Hermann Gruber, Markus Holzer and Oliver Ruepp analysed it seriously in 2007 in 'Sorting the slow way', proving the expected n · n! running time and studying even worse variants.",
      pt: "O nome é um trocadilho com bogus; o Jargon File o lista sob bogo-sort como sinônimo de qualquer algoritmo irremediavelmente ruim. Hermann Gruber, Markus Holzer e Oliver Ruepp o analisaram a sério em 2007 em 'Sorting the slow way', provando o tempo esperado n · n! e estudando variantes ainda piores.",
    },
    file: "bogo_sort",
    code: {
      ts: ["function bogoSort(array: number[]) {", "  while (!isSorted(array)) {", "    shuffle(array);", "  }", "}", "function isSorted(array: number[]) {", "  for (let i = 1; i < array.length; i++) if (array[i - 1] > array[i]) return false;", "  return true;", "}", "function shuffle(array: number[]) {", "  for (let i = array.length - 1; i > 0; i--) swap(array, i, Math.floor(Math.random() * (i + 1)));", "}"],
      py: ["def bogo_sort(array):", "    while not is_sorted(array):", "        shuffle(array)", "", "", "def is_sorted(array):", "    if any(array[i - 1] > array[i] for i in range(1, len(array))): return False", "    return True", "", "def shuffle(array):", "    for i in range(len(array) - 1, 0, -1): swap(array, i, random.randint(0, i))", ""],
      java: ["static void bogoSort(int[] array) {", "  while (!isSorted(array)) {", "    shuffle(array);", "  }", "}", "static boolean isSorted(int[] array) {", "  for (int i = 1; i < array.length; i++) if (array[i - 1] > array[i]) return false;", "  return true;", "}", "static void shuffle(int[] array) {", "  for (int i = array.length - 1; i > 0; i--) swap(array, i, random.nextInt(i + 1));", "}"],
      cpp: ["void bogoSort(std::vector<int>& array) {", "  while (!isSorted(array)) {", "    shuffle(array);", "  }", "}", "bool isSorted(const std::vector<int>& array) {", "  for (size_t i = 1; i < array.size(); i++) if (array[i - 1] > array[i]) return false;", "  return true;", "}", "void shuffle(std::vector<int>& array) {", "  for (int i = array.size() - 1; i > 0; i--) std::swap(array[i], array[randomBetween(0, i)]);", "}"],
      c: ["void bogo_sort(int *array, int length) {", "  while (!is_sorted(array, length)) {", "    shuffle(array, length);", "  }", "}", "bool is_sorted(const int *array, int length) {", "  for (int i = 1; i < length; i++) if (array[i - 1] > array[i]) return false;", "  return true;", "}", "void shuffle(int *array, int length) {", "  for (int i = length - 1; i > 0; i--) swap(array, i, rand() % (i + 1));", "}"],
      go: ["func bogoSort(array []int) {", "\tfor !isSorted(array) {", "\t\tshuffle(array)", "\t}", "}", "func isSorted(array []int) bool {", "\tfor i := 1; i < len(array); i++ { if array[i-1] > array[i] { return false } }", "\treturn true", "}", "func shuffle(array []int) {", "\tfor i := len(array) - 1; i > 0; i-- { j := rand.Intn(i + 1); array[i], array[j] = array[j], array[i] }", "}"],
      rs: ["fn bogo_sort(array: &mut [i32]) {", "    while !is_sorted(array) {", "        shuffle(array);", "    }", "}", "fn is_sorted(array: &[i32]) -> bool {", "    for i in 1..array.len() { if array[i - 1] > array[i] { return false; } }", "    true", "}", "fn shuffle(array: &mut [i32]) {", "    for i in (1..array.len()).rev() { array.swap(i, rand::thread_rng().gen_range(0..=i)); }", "}"],
    },
    pseudo: {
      en: ["BOGOSORT(array)", "  while not ISSORTED(array)", "    SHUFFLE(array)", "ISSORTED(array): every array[i − 1] ≤ array[i]", "SHUFFLE(array): for i from n − 1 down to 1, swap array[i] with array[random in 0..i]"],
      pt: ["BOGOSORT(array)", "  enquanto não ESTÁORDENADO(array)", "    EMBARALHA(array)", "ESTÁORDENADO(array): todo array[i − 1] ≤ array[i]", "EMBARALHA(array): para i de n − 1 até 1, troca array[i] com array[aleatório em 0..i]"],
    },
  },

  sleep: {
    ...BASE,
    minN: 6,
    maxN: 24,
    stepN: 2,
    defaultN: 12,
    stepMs: 300,
    slug: "sleep-sort",
    name: "Sleep sort",
    subtitle: { en: "one timer per value; whoever wakes first is printed first", pt: "um timer por valor; quem acorda primeiro é impresso primeiro" },
    tagline: { en: "sleep sort · zero comparisons, and the scheduler does the work", pt: "sleep sort · zero comparações, e o escalonador faz o trabalho" },
    legend: LEGEND_SLEEP,
    kpis: [{ key: "timers", label: { en: "TIMERS", pt: "TIMERS" }, sub: { en: "one per value", pt: "um por valor" } }, { key: "fired", unitKey: "firedUnit", label: { en: "FIRED", pt: "DISPARADOS" }, sub: { en: "values in the output", pt: "valores na saída" } }, { key: "elapsed", label: { en: "ELAPSED", pt: "DECORRIDO" }, sub: { en: "the clock of the last timer", pt: "o relógio do último timer" } }, { key: "wall", label: { en: "WALL TIME", pt: "TEMPO TOTAL" }, sub: { en: "the largest value, in ms", pt: "o maior valor, em ms" } }, { key: "ties", label: { en: "TIES", pt: "EMPATES" }, sub: { en: "equal values, kept in schedule order", pt: "valores iguais, na ordem de agendamento" } }],
    idea: {
      en: [
        "Sleep sort starts one thread, or one timer, per value, and each one sleeps for as many milliseconds as its value before printing it. The smallest value wakes first, the largest last, and the printed sequence is sorted. Not a single comparison appears in the code.",
        "The trick is that the comparisons did not disappear: the operating system keeps sleeping timers in a priority queue ordered by wake-up time, so it is the scheduler that sorts, in O(n log n), while the program waits for as long as the largest value. It is a joke with a lesson about where work hides.",
      ],
      pt: [
        "O sleep sort inicia uma thread, ou um timer, por valor, e cada um dorme tantos milissegundos quanto o seu valor antes de imprimi-lo. O menor valor acorda primeiro, o maior por último, e a sequência impressa sai ordenada. Nenhuma comparação aparece no código.",
        "O truque é que as comparações não desapareceram: o sistema operacional guarda os timers dormindo numa fila de prioridade ordenada pela hora de acordar, então é o escalonador que ordena, em O(n log n), enquanto o programa espera pelo tempo do maior valor. É uma piada com uma lição sobre onde o trabalho se esconde.",
      ],
    },
    stages: [
      ["primary", { en: "schedule", pt: "agenda" }, { en: "a timer of value ms for each value", pt: "um timer de valor ms para cada valor" }],
      ["def", { en: "wait", pt: "espera" }, { en: "the clock runs; nothing compares", pt: "o relógio corre; nada compara" }],
      ["green", { en: "fire", pt: "dispara" }, { en: "in value order, ties in schedule order", pt: "em ordem de valor, empates na ordem de agendamento" }],
      ["green", { en: "done", pt: "pronto" }, { en: "when the largest value's timer fires", pt: "quando o timer do maior valor dispara" }],
    ],
    complexity: [
      [{ en: "best", pt: "melhor" }, "O(n)", "green", { en: "work done by the program itself", pt: "trabalho feito pelo próprio programa" }],
      [{ en: "average", pt: "médio" }, "O(max)", "neg", { en: "wall time is the largest value in ms", pt: "o tempo de parede é o maior valor em ms" }],
      [{ en: "worst", pt: "pior" }, "O(max)", "neg", { en: "one value of a billion: eleven days", pt: "um valor de um bilhão: onze dias" }],
      [{ en: "space", pt: "espaço" }, "O(n)", "text", { en: "one timer or thread per value", pt: "um timer ou thread por valor" }],
    ],
    chartTitle: { en: "WALL TIME · 1 000 VALUES · MS", pt: "TEMPO DE PAREDE · 1.000 VALORES · MS" },
    chart: [["sleep · values ≤ 100", 100, true], ["sleep · values ≤ 10 000", 10000], ["sleep · values ≤ 1 000 000", 1000000], ["quick sort", 1], ["merge sort", 1]],
    chartNote: { en: "the comparison sorts finish in well under a millisecond; sleep sort waits for the largest value", pt: "as ordenações por comparação terminam em bem menos de um milissegundo; o sleep sort espera pelo maior valor" },
    when: {
      en: ["Never in production.", "To show that timers, threads and event loops keep a priority queue under the hood."],
      pt: ["Nunca em produção.", "Para mostrar que timers, threads e event loops guardam uma fila de prioridade por baixo."],
    },
    pitfalls: {
      en: ["Negative values never fire; values close together can wake in the wrong order when the scheduler is busy.", "Thousands of threads or timers cost far more than the sort they replace.", "The output order depends on the clock, so the same input can sort differently twice."],
      pt: ["Valores negativos nunca disparam; valores próximos podem acordar na ordem errada quando o escalonador está ocupado.", "Milhares de threads ou timers custam muito mais que a ordenação que substituem.", "A ordem de saída depende do relógio, então a mesma entrada pode ordenar diferente duas vezes."],
    },
    history: {
      en: "Sleep sort was posted anonymously on 4chan's programming board in January 2011 as a shell one-liner that spawned a background sleep per argument. It spread as a joke, then as an interview question about where the hidden O(n log n) lives.",
      pt: "O sleep sort foi postado anonimamente no fórum de programação do 4chan em janeiro de 2011 como um one-liner de shell que disparava um sleep em segundo plano por argumento. Espalhou-se como piada, depois como pergunta de entrevista sobre onde vive o O(n log n) escondido.",
    },
    file: "sleep_sort",
    code: {
      ts: ["function sleepSort(array: number[]): Promise<number[]> {", "  const output: number[] = [];", "  for (const value of array) {", "    setTimeout(() => {", "      output.push(value);", "    }, value);", "  }", "  return new Promise((resolve) => setTimeout(() => resolve(output), Math.max(...array) + 1));", "}"],
      py: ["def sleep_sort(array):", "    output = []", "    for value in array:", "        def wake(value=value):", "            time.sleep(value / 1000); output.append(value)", "        threading.Thread(target=wake).start()", "", "    time.sleep(max(array) / 1000 + 0.001); return output", ""],
      java: ["static List<Integer> sleepSort(int[] array) throws InterruptedException {", "  List<Integer> output = Collections.synchronizedList(new ArrayList<>());", "  for (int value : array) {", "    new Thread(() -> {", "      sleep(value); output.add(value);", "    }).start();", "  }", "  Thread.sleep(max(array) + 1); return output;", "}"],
      cpp: ["std::vector<int> sleepSort(const std::vector<int>& array) {", "  std::vector<int> output; std::mutex lock;", "  for (int value : array) {", "    std::thread([&, value] {", "      std::this_thread::sleep_for(std::chrono::milliseconds(value)); std::lock_guard<std::mutex> guard(lock); output.push_back(value);", "    }).detach();", "  }", "  std::this_thread::sleep_for(std::chrono::milliseconds(*std::max_element(array.begin(), array.end()) + 1)); return output;", "}"],
      c: ["void sleep_sort(int *array, int length, int *output) {", "  int count = 0; pthread_t threads[length];", "  for (int i = 0; i < length; i++) {", "    struct Job *job = make_job(array[i], output, &count); pthread_create(&threads[i], NULL, wake, job);", "    /* wake(job): usleep(job->value * 1000); output[count++] = job->value; */", "  }", "  for (int i = 0; i < length; i++) pthread_join(threads[i], NULL);", "  /* output now holds the values in the order the threads woke up */", "}"],
      go: ["func sleepSort(array []int) []int {", "\toutput := make(chan int, len(array))", "\tfor _, value := range array {", "\t\tgo func(value int) {", "\t\t\ttime.Sleep(time.Duration(value) * time.Millisecond); output <- value", "\t\t}(value)", "\t}", "\tsorted := make([]int, 0, len(array)); for range array { sorted = append(sorted, <-output) }; return sorted", "}"],
      rs: ["fn sleep_sort(array: &[i32]) -> Vec<i32> {", "    let (sender, receiver) = std::sync::mpsc::channel();", "    for &value in array {", "        let sender = sender.clone(); std::thread::spawn(move || {", "            std::thread::sleep(std::time::Duration::from_millis(value as u64)); sender.send(value).unwrap();", "        });", "    }", "    drop(sender); receiver.iter().collect()", "}"],
    },
    pseudo: {
      en: ["SLEEPSORT(array)", "  for each value in array", "    start a timer that, after value milliseconds, appends value to the output", "  wait until the last timer fires; return the output"],
      pt: ["SLEEPSORT(array)", "  para cada valor em array", "    inicia um timer que, depois de valor milissegundos, anexa valor à saída", "  espera o último timer disparar; retorna a saída"],
    },
  },
} satisfies Record<string, AlgorithmSpec>;
