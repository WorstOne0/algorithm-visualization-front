// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Recorder } from "../recording";
import type { SearchStep } from "./record_search";

// Line numbers in every recorder mirror the listings in core/models/algorithms/searching_more.ts.

function session(n: number, seed: number) {
  const rand = seeded(seed);
  const pool = new Set<number>();
  while (pool.size < n) pool.add(3 + Math.floor(rand() * 96));
  const a = [...pool].sort((x, y) => x - y);
  const target = Math.floor(rand() * n);
  const steps: SearchStep[] = [];
  const finish = (line: number, note: Localized) => steps.push({ ...steps[steps.length - 1], line, note });
  const meta = (extra: Localized): Localized => ({ en: `n = ${n} · target ${a[target]} · seed ${seed} · ${extra.en} · ${steps.length} steps`, pt: `n = ${n} · alvo ${a[target]} · seed ${seed} · ${extra.pt} · ${steps.length} passos` });
  return { a, target, value: a[target], steps, finish, meta };
}

export const recordJump: Recorder = (n, seed) => {
  const { a, target, value, steps, finish, meta } = session(n, seed);
  const block = Math.max(1, Math.floor(Math.sqrt(n)));
  let comparisons = 0;
  let jumps = 0;
  let result: number | string = "—";
  let previous = 0;
  let next = block;
  const push = (line: number, note: Localized, mid: number, found: boolean) => steps.push({ a, lo: previous, hi: Math.min(next, n) - 1, mid, target, found, line, note, counters: { comparisons, block, jumps, index: mid < 0 ? "—" : mid, target: value, result } });

  push(2, { en: `Look for ${value}. Block size is ⌊√${n}⌋ = ${block}: jump that far, check the last element of the block.`, pt: `Procura ${value}. O bloco tem ⌊√${n}⌋ = ${block}: salta isso, confere o último elemento do bloco.` }, -1, false);
  while (true) {
    const probe = Math.min(next, n) - 1;
    comparisons++;
    const beyond = a[probe] < value;
    push(4, { en: `Block end array[${probe}] = ${a[probe]} ${beyond ? "<" : "≥"} ${value}: ${beyond ? "the target is further right, jump." : "the target is in this block."}`, pt: `Fim do bloco array[${probe}] = ${a[probe]} ${beyond ? "<" : "≥"} ${value}: ${beyond ? "o alvo está mais à direita, salta." : "o alvo está neste bloco."}` }, probe, false);
    if (!beyond) break;
    previous = next;
    next += block;
    jumps++;
    if (previous >= n) break;
    push(6, { en: `Jump: the next block is [${previous}, ${Math.min(next, n) - 1}].`, pt: `Salto: o próximo bloco é [${previous}, ${Math.min(next, n) - 1}].` }, -1, false);
  }
  for (let index = previous; index < Math.min(next, n); index++) {
    comparisons++;
    if (a[index] === value) {
      result = index;
      push(10, { en: `Scan the block: array[${index}] = ${value} is the target. Return ${index}.`, pt: `Varre o bloco: array[${index}] = ${value} é o alvo. Retorna ${index}.` }, index, true);
      break;
    }
    push(10, { en: `Scan the block: array[${index}] = ${a[index]} is not ${value}.`, pt: `Varre o bloco: array[${index}] = ${a[index]} não é ${value}.` }, index, false);
  }
  finish(12, { en: `Done. ${jumps} jumps and ${comparisons} comparisons: about 2√n = ${Math.round(2 * Math.sqrt(n))} at worst.`, pt: `Pronto. ${jumps} saltos e ${comparisons} comparações: cerca de 2√n = ${Math.round(2 * Math.sqrt(n))} no pior caso.` });
  return { steps, meta: meta({ en: `block ${block}`, pt: `bloco ${block}` }) };
};

export const recordInterpolation: Recorder = (n, seed) => {
  const { a, target, value, steps, finish, meta } = session(n, seed);
  let comparisons = 0;
  let result: number | string = "—";
  let low = 0;
  let high = n - 1;
  const push = (line: number, note: Localized, mid: number, found: boolean) => steps.push({ a, lo: low, hi: high, mid, target, found, line, note, counters: { comparisons, range: Math.max(0, high - low + 1), rangeUnit: `/ ${n}`, guess: mid < 0 ? "—" : mid, target: value, result } });

  push(2, { en: `Look for ${value} in [0, ${n - 1}]. The values run from ${a[0]} to ${a[n - 1]}, so the position can be estimated by proportion.`, pt: `Procura ${value} em [0, ${n - 1}]. Os valores vão de ${a[0]} a ${a[n - 1]}, então a posição pode ser estimada por proporção.` }, -1, false);
  while (low <= high && value >= a[low] && value <= a[high]) {
    const position = a[high] === a[low] ? low : low + Math.floor(((value - a[low]) * (high - low)) / (a[high] - a[low]));
    push(4, { en: `Estimate: ${low} + (${value} − ${a[low]}) × (${high} − ${low}) / (${a[high]} − ${a[low]}) = ${position}. Probe array[${position}] = ${a[position]}.`, pt: `Estimativa: ${low} + (${value} − ${a[low]}) × (${high} − ${low}) / (${a[high]} − ${a[low]}) = ${position}. Sonda array[${position}] = ${a[position]}.` }, position, false);
    comparisons++;
    if (a[position] === value) {
      result = position;
      push(5, { en: `array[${position}] = ${value} is the target. Return ${position} after ${comparisons} probes.`, pt: `array[${position}] = ${value} é o alvo. Retorna ${position} depois de ${comparisons} sondagens.` }, position, true);
      break;
    }
    if (a[position] < value) {
      low = position + 1;
      push(6, { en: `${a[position]} < ${value}: keep [${low}, ${high}].`, pt: `${a[position]} < ${value}: mantém [${low}, ${high}].` }, position, false);
      continue;
    }
    high = position - 1;
    push(7, { en: `${a[position]} > ${value}: keep [${low}, ${high}].`, pt: `${a[position]} > ${value}: mantém [${low}, ${high}].` }, position, false);
  }
  finish(9, { en: `Done. ${comparisons} probes; binary search would have needed up to ${Math.ceil(Math.log2(n)) + 1}.`, pt: `Pronto. ${comparisons} sondagens; a busca binária precisaria de até ${Math.ceil(Math.log2(n)) + 1}.` });
  return { steps, meta: meta({ en: "uniform values", pt: "valores uniformes" }) };
};

export const recordExponential: Recorder = (n, seed) => {
  const { a, target, value, steps, finish, meta } = session(n, seed);
  let comparisons = 0;
  let result: number | string = "—";
  let bound = 1;
  let low = 0;
  let high = 0;
  let phase: "grow" | "halve" = "grow";
  const push = (line: number, note: Localized, mid: number, found: boolean) => steps.push({ a, lo: phase === "grow" ? 0 : low, hi: phase === "grow" ? Math.min(bound, n - 1) : high, mid, target, found, line, note, counters: { comparisons, bound: Math.min(bound, n - 1), range: phase === "grow" ? Math.min(bound, n - 1) + 1 : Math.max(0, high - low + 1), rangeUnit: `/ ${n}`, middle: mid < 0 ? "—" : mid, target: value, result } });

  comparisons++;
  push(2, { en: `Look for ${value}. First check array[0] = ${a[0]}${a[0] === value ? ": found at once." : ", not it."}`, pt: `Procura ${value}. Primeiro confere array[0] = ${a[0]}${a[0] === value ? ": achou de cara." : ", não é."}` }, 0, a[0] === value);
  if (a[0] === value) result = 0;
  else {
    while (bound < n && a[bound] < value) {
      comparisons++;
      push(4, { en: `array[${bound}] = ${a[bound]} < ${value}: double the bound to ${Math.min(bound * 2, n - 1)}.`, pt: `array[${bound}] = ${a[bound]} < ${value}: dobra o limite para ${Math.min(bound * 2, n - 1)}.` }, bound, false);
      bound *= 2;
    }
    if (bound < n) {
      comparisons++;
      push(4, { en: `array[${bound}] = ${a[bound]} ≥ ${value}: the target lies in [${Math.floor(bound / 2)}, ${bound}].`, pt: `array[${bound}] = ${a[bound]} ≥ ${value}: o alvo está em [${Math.floor(bound / 2)}, ${bound}].` }, bound, false);
    }
    low = Math.floor(bound / 2);
    high = Math.min(bound, n - 1);
    phase = "halve";
    push(5, { en: `Binary search inside [${low}, ${high}], a range of ${high - low + 1} elements.`, pt: `Busca binária dentro de [${low}, ${high}], uma faixa de ${high - low + 1} elementos.` }, -1, false);
    while (low <= high) {
      const middle = (low + high) >> 1;
      comparisons++;
      push(7, { en: `Probe the middle of [${low}, ${high}]: array[${middle}] = ${a[middle]}.`, pt: `Sonda o meio de [${low}, ${high}]: array[${middle}] = ${a[middle]}.` }, middle, false);
      if (a[middle] === value) {
        result = middle;
        push(8, { en: `array[${middle}] = ${value} is the target. Return ${middle}.`, pt: `array[${middle}] = ${value} é o alvo. Retorna ${middle}.` }, middle, true);
        break;
      }
      if (a[middle] < value) {
        low = middle + 1;
        push(9, { en: `${a[middle]} < ${value}: keep [${low}, ${high}].`, pt: `${a[middle]} < ${value}: mantém [${low}, ${high}].` }, middle, false);
      } else {
        high = middle - 1;
        push(10, { en: `${a[middle]} > ${value}: keep [${low}, ${high}].`, pt: `${a[middle]} > ${value}: mantém [${low}, ${high}].` }, middle, false);
      }
    }
  }
  finish(12, { en: `Done. ${comparisons} probes: the doubling cost about log₂(${target || 1}) and the halving about the same again.`, pt: `Pronto. ${comparisons} sondagens: o dobrar custou cerca de log₂(${target || 1}) e o dividir mais ou menos o mesmo.` });
  return { steps, meta: meta({ en: "unbounded", pt: "sem limite" }) };
};

export const recordTernary: Recorder = (n, seed) => {
  const { a, target, value, steps, finish, meta } = session(n, seed);
  let comparisons = 0;
  let result: number | string = "—";
  let low = 0;
  let high = n - 1;
  const push = (line: number, note: Localized, mid: number, mid2: number, found: boolean) => steps.push({ a, lo: low, hi: high, mid, mid2, target, found, line, note, counters: { comparisons, range: Math.max(0, high - low + 1), rangeUnit: `/ ${n}`, probes: mid < 0 ? "—" : `${mid} · ${mid2}`, target: value, result } });

  push(2, { en: `Look for ${value}. Two probes per round split the range into three thirds.`, pt: `Procura ${value}. Duas sondagens por rodada dividem a faixa em três terços.` }, -1, -1, false);
  while (low <= high) {
    const third = Math.floor((high - low) / 3);
    const first = low + third;
    const second = high - third;
    push(5, { en: `Probe array[${first}] = ${a[first]} and array[${second}] = ${a[second]}, the two cut points of [${low}, ${high}].`, pt: `Sonda array[${first}] = ${a[first]} e array[${second}] = ${a[second]}, os dois cortes de [${low}, ${high}].` }, first, second, false);
    comparisons++;
    if (a[first] === value) {
      result = first;
      push(6, { en: `array[${first}] = ${value} is the target. Return ${first}.`, pt: `array[${first}] = ${value} é o alvo. Retorna ${first}.` }, first, second, true);
      break;
    }
    comparisons++;
    if (a[second] === value) {
      result = second;
      push(7, { en: `array[${second}] = ${value} is the target. Return ${second}.`, pt: `array[${second}] = ${value} é o alvo. Retorna ${second}.` }, second, first, true);
      break;
    }
    if (value < a[first]) {
      high = first - 1;
      push(8, { en: `${value} < ${a[first]}: the left third, [${low}, ${high}].`, pt: `${value} < ${a[first]}: o terço da esquerda, [${low}, ${high}].` }, first, second, false);
    } else if (value > a[second]) {
      low = second + 1;
      push(9, { en: `${value} > ${a[second]}: the right third, [${low}, ${high}].`, pt: `${value} > ${a[second]}: o terço da direita, [${low}, ${high}].` }, first, second, false);
    } else {
      low = first + 1;
      high = second - 1;
      push(10, { en: `Between them: the middle third, [${low}, ${high}].`, pt: `Entre os dois: o terço do meio, [${low}, ${high}].` }, first, second, false);
    }
  }
  finish(12, { en: `Done. ${comparisons} comparisons: fewer rounds than binary search, but two comparisons each, so more work in total.`, pt: `Pronto. ${comparisons} comparações: menos rodadas que a busca binária, mas duas comparações por rodada, então mais trabalho no total.` });
  return { steps, meta: meta({ en: "two probes per round", pt: "duas sondagens por rodada" }) };
};
