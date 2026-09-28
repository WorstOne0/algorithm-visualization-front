export const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export const ri = (a: number, b: number) => Math.floor(rnd(a, b));

// Deterministic LCG, so the seed in the URL reproduces the same input.
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
