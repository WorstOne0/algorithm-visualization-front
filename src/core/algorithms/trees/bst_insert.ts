// Utils
import { ri } from "../random";

// x and d are the in-order column and the depth, set by the layout pass after every insertion.
export type BstNode = { v: number; l: BstNode | null; r: BstNode | null; x?: number; d?: number };

export type TreeState = { nodes: BstNode[]; count: number; hot: Set<BstNode>; fresh: BstNode | null };

export function* bstInsert(n: number): Generator<TreeState, void, void> {
  const values: number[] = [];
  while (values.length < n) {
    const v = ri(1, 99);
    if (!values.includes(v)) values.push(v);
  }
  let root: BstNode | null = null;
  const nodes: BstNode[] = [];
  const layout = () => {
    let idx = 0;
    const walk = (t: BstNode | null, d: number) => {
      if (!t) return;
      walk(t.l, d + 1);
      t.x = idx++;
      t.d = d;
      walk(t.r, d + 1);
    };
    walk(root, 0);
    return idx;
  };
  for (const v of values) {
    const node: BstNode = { v, l: null, r: null };
    nodes.push(node);
    if (!root) {
      root = node;
      yield { nodes, count: layout(), hot: new Set([node]), fresh: node };
      continue;
    }
    let t = root;
    const hot = new Set<BstNode>();
    while (true) {
      hot.add(t);
      yield { nodes, count: layout(), hot: new Set(hot), fresh: null };
      if (v < t.v) {
        if (!t.l) {
          t.l = node;
          break;
        }
        t = t.l;
      } else {
        if (!t.r) {
          t.r = node;
          break;
        }
        t = t.r;
      }
    }
    yield { nodes, count: layout(), hot: new Set(hot), fresh: node };
  }
  yield { nodes, count: layout(), hot: new Set(), fresh: null };
}
