// Utils
import { ri, rnd } from "../random";

// `mid2` is the second probe of a round, for searches that cut the range twice.
export type SearchState = { a: number[]; lo: number; hi: number; mid: number; mid2?: number; target: number; found: boolean };

export function* binarySearch(n: number): Generator<SearchState, void, void> {
  const a = Array.from({ length: n }, (_, k) => 10 + k * (85 / n) + rnd(0, 3)).sort((x, y) => x - y);
  const target = ri(0, n);
  const value = a[target];
  let lo = 0;
  let hi = n - 1;
  yield { a, lo, hi, mid: -1, target, found: false };
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    yield { a, lo, hi, mid, target, found: false };
    if (a[mid] === value) {
      yield { a, lo, hi, mid, target, found: true };
      return;
    }
    if (a[mid] < value) lo = mid + 1;
    else hi = mid - 1;
    yield { a, lo, hi, mid, target, found: false };
  }
}
