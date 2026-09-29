// One snapshot of the array: the two indices being looked at, whether they were just swapped, and the settled ones.
export type SortState = { a: number[]; i: number; j: number; done: Set<number>; swap: boolean; pivot?: number };

export type SortGenerator = Generator<SortState, void, void>;

const snap = (a: number[], i: number, j: number, done: Set<number>, swap = false, pivot?: number): SortState => ({ a: a.slice(), i, j, done: new Set(done), swap, pivot });

const allDone = (a: number[]): SortState => ({ a: a.slice(), i: -1, j: -1, done: new Set(a.map((_, k) => k)), swap: false });

const swapAt = (a: number[], i: number, j: number) => {
  const t = a[i];
  a[i] = a[j];
  a[j] = t;
};

function* bubble(input: number[]): SortGenerator {
  const a = input.slice();
  const d = new Set<number>();
  yield snap(a, -1, -1, d);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      yield snap(a, j, j + 1, d);
      if (a[j] > a[j + 1]) {
        swapAt(a, j, j + 1);
        yield snap(a, j, j + 1, d, true);
      }
    }
    d.add(a.length - i - 1);
  }
  yield allDone(a);
}

function* insertion(input: number[]): SortGenerator {
  const a = input.slice();
  const d = new Set<number>([0]);
  yield snap(a, -1, -1, d);
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0 && a[j - 1] > a[j]) {
      yield snap(a, j - 1, j, d);
      swapAt(a, j - 1, j);
      j--;
      yield snap(a, j, j + 1, d, true);
    }
    if (j > 0) yield snap(a, j - 1, j, d);
    d.add(i);
  }
  yield allDone(a);
}

function* selection(input: number[]): SortGenerator {
  const a = input.slice();
  const d = new Set<number>();
  yield snap(a, -1, -1, d);
  for (let i = 0; i < a.length; i++) {
    let m = i;
    for (let j = i + 1; j < a.length; j++) {
      yield snap(a, j, m, d, false, i);
      if (a[j] < a[m]) m = j;
    }
    swapAt(a, i, m);
    yield snap(a, i, m, d, true);
    d.add(i);
  }
  yield allDone(a);
}

function* cocktail(input: number[]): SortGenerator {
  const a = input.slice();
  const d = new Set<number>();
  let lo = 0;
  let hi = a.length - 1;
  let swapped = true;
  yield snap(a, -1, -1, d);
  while (swapped && lo < hi) {
    swapped = false;
    for (let j = lo; j < hi; j++) {
      yield snap(a, j, j + 1, d);
      if (a[j] > a[j + 1]) {
        swapAt(a, j, j + 1);
        swapped = true;
        yield snap(a, j, j + 1, d, true);
      }
    }
    d.add(hi);
    hi--;
    if (!swapped) break;
    swapped = false;
    for (let j = hi; j > lo; j--) {
      yield snap(a, j - 1, j, d);
      if (a[j - 1] > a[j]) {
        swapAt(a, j - 1, j);
        swapped = true;
        yield snap(a, j - 1, j, d, true);
      }
    }
    d.add(lo);
    lo++;
  }
  yield allDone(a);
}

function* gnome(input: number[]): SortGenerator {
  const a = input.slice();
  const d = new Set<number>();
  let p = 0;
  yield snap(a, -1, -1, d);
  while (p < a.length) {
    if (p === 0 || a[p] >= a[p - 1]) {
      if (p > 0) yield snap(a, p - 1, p, d);
      p++;
      continue;
    }
    yield snap(a, p - 1, p, d);
    swapAt(a, p - 1, p);
    yield snap(a, p - 1, p, d, true);
    p--;
  }
  yield allDone(a);
}

function* comb(input: number[]): SortGenerator {
  const a = input.slice();
  const d = new Set<number>();
  let gap = a.length;
  let swapped = true;
  yield snap(a, -1, -1, d);
  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / 1.3));
    swapped = false;
    for (let i = 0; i + gap < a.length; i++) {
      yield snap(a, i, i + gap, d);
      if (a[i] > a[i + gap]) {
        swapAt(a, i, i + gap);
        swapped = true;
        yield snap(a, i, i + gap, d, true);
      }
    }
  }
  yield allDone(a);
}

function* shell(input: number[]): SortGenerator {
  const a = input.slice();
  const d = new Set<number>();
  yield snap(a, -1, -1, d);
  for (let gap = a.length >> 1; gap > 0; gap >>= 1) {
    for (let i = gap; i < a.length; i++) {
      let j = i;
      while (j >= gap && a[j - gap] > a[j]) {
        yield snap(a, j - gap, j, d);
        swapAt(a, j - gap, j);
        yield snap(a, j - gap, j, d, true);
        j -= gap;
      }
    }
  }
  yield allDone(a);
}

function* merge(input: number[]): SortGenerator {
  const a = input.slice();
  const n = a.length;
  const d = new Set<number>();
  yield snap(a, -1, -1, d);
  for (let w = 1; w < n; w *= 2) {
    for (let lo = 0; lo < n - w; lo += 2 * w) {
      const mid = lo + w;
      const hi = Math.min(lo + 2 * w, n);
      const tmp: number[] = [];
      let i = lo;
      let j = mid;
      while (i < mid && j < hi) {
        yield snap(a, i, j, d);
        if (a[i] <= a[j]) tmp.push(a[i++]);
        else tmp.push(a[j++]);
      }
      while (i < mid) tmp.push(a[i++]);
      while (j < hi) tmp.push(a[j++]);
      for (let k = 0; k < tmp.length; k++) {
        a[lo + k] = tmp[k];
        yield snap(a, lo + k, -1, d, true);
      }
    }
  }
  yield allDone(a);
}

function* quick(input: number[]): SortGenerator {
  const a = input.slice();
  const d = new Set<number>();
  const stack: [number, number][] = [[0, a.length - 1]];
  yield snap(a, -1, -1, d);
  while (stack.length) {
    const [lo, hi] = stack.pop()!;
    if (lo >= hi) {
      if (lo === hi) d.add(lo);
      continue;
    }
    const pivot = a[hi];
    let k = lo;
    for (let j = lo; j < hi; j++) {
      yield snap(a, j, hi, d, false, hi);
      if (a[j] < pivot) {
        swapAt(a, k, j);
        yield snap(a, k, j, d, true, hi);
        k++;
      }
    }
    swapAt(a, k, hi);
    d.add(k);
    yield snap(a, k, hi, d, true, k);
    stack.push([lo, k - 1], [k + 1, hi]);
  }
  yield allDone(a);
}

function* heap(input: number[]): SortGenerator {
  const a = input.slice();
  const n = a.length;
  const d = new Set<number>();
  yield snap(a, -1, -1, d);
  function* sift(start: number, end: number): SortGenerator {
    let i = start;
    while (true) {
      const l = 2 * i + 1;
      const r = l + 1;
      let m = i;
      if (l < end) {
        yield snap(a, l, m, d);
        if (a[l] > a[m]) m = l;
      }
      if (r < end) {
        yield snap(a, r, m, d);
        if (a[r] > a[m]) m = r;
      }
      if (m === i) return;
      swapAt(a, i, m);
      yield snap(a, i, m, d, true);
      i = m;
    }
  }
  for (let i = (n >> 1) - 1; i >= 0; i--) yield* sift(i, n);
  for (let end = n - 1; end > 0; end--) {
    swapAt(a, 0, end);
    d.add(end);
    yield snap(a, 0, end, d, true);
    yield* sift(0, end);
  }
  yield allDone(a);
}

function* oddeven(input: number[]): SortGenerator {
  const a = input.slice();
  const d = new Set<number>();
  let sorted = false;
  yield snap(a, -1, -1, d);
  while (!sorted) {
    sorted = true;
    for (const start of [1, 0]) {
      for (let i = start; i + 1 < a.length; i += 2) {
        yield snap(a, i, i + 1, d);
        if (a[i] > a[i + 1]) {
          swapAt(a, i, i + 1);
          sorted = false;
          yield snap(a, i, i + 1, d, true);
        }
      }
    }
  }
  yield allDone(a);
}

function* radix(input: number[]): SortGenerator {
  const a = input.slice();
  const d = new Set<number>();
  yield snap(a, -1, -1, d);
  for (let exp = 1; exp <= 100; exp *= 10) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    for (let i = 0; i < a.length; i++) {
      yield snap(a, i, -1, d);
      buckets[Math.floor(a[i] / exp) % 10].push(a[i]);
    }
    let k = 0;
    for (const bucket of buckets) {
      for (const value of bucket) {
        a[k] = value;
        yield snap(a, k, -1, d, true);
        k++;
      }
    }
  }
  yield allDone(a);
}

// The card animations of the two jokes: bogo shuffles until sorted (it gives up after a while), sleep fires values in order.
function* bogo(input: number[]): SortGenerator {
  const a = input.slice();
  const d = new Set<number>();
  yield snap(a, -1, -1, d);
  for (let attempt = 0; attempt < 300; attempt++) {
    let fail = -1;
    for (let k = 1; k < a.length && fail < 0; k++) if (a[k - 1] > a[k]) fail = k;
    if (fail < 0) break;
    yield snap(a, fail - 1, fail, d);
    for (let k = a.length - 1; k > 0; k--) swapAt(a, k, Math.floor(Math.random() * (k + 1)));
    yield snap(a, -1, -1, d, true);
  }
  yield allDone(a);
}

function* sleep(input: number[]): SortGenerator {
  const a = input.slice();
  const d = new Set<number>();
  yield snap(a, -1, -1, d);
  const output: number[] = [];
  const pending = a.slice();
  for (const value of input.slice().sort((p, q) => p - q)) {
    pending.splice(pending.indexOf(value), 1);
    output.push(value);
    a.splice(0, a.length, ...output, ...pending);
    d.add(output.length - 1);
    yield snap(a, output.length - 1, -1, d);
  }
  yield allDone(a);
}

export const SORTS = { bubble, insertion, selection, cocktail, gnome, comb, shell, merge, quick, heap, oddeven, radix, bogo, sleep };

export type SortId = keyof typeof SORTS;
