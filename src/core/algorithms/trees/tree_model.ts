// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Counter, StepBase } from "../recording";

export type TreeNode = { id: number; key: number; left: TreeNode | null; right: TreeNode | null; parent: TreeNode | null; red?: boolean; height?: number };
export type NodeMark = "cur" | "path" | "fresh" | "pivot" | "done";
// A laid-out node: x is the in-order column, depth the level; parent ids draw the edges.
export type LaidNode = { id: number; key: number; x: number; depth: number; parent: number | null; red?: boolean; label?: string; mark?: NodeMark };
export type TreeStep = StepBase & { nodes: LaidNode[]; columns: number; depth: number; tape: number[]; aside: string };

export function distinctKeys(n: number, rand: () => number, max = 99) {
  const keys: number[] = [];
  while (keys.length < n) {
    const key = 1 + Math.floor(rand() * max);
    if (!keys.includes(key)) keys.push(key);
  }
  return keys;
}

export const treeHeight = (node: TreeNode | null): number => (node ? 1 + Math.max(treeHeight(node.left), treeHeight(node.right)) : 0);

// A plain BST from the keys in order, no balancing.
export function buildBst(keys: number[], makeNode: (key: number) => TreeNode): TreeNode | null {
  let root: TreeNode | null = null;
  keys.forEach((key) => {
    const node = makeNode(key);
    if (!root) {
      root = node;
      return;
    }
    let cursor: TreeNode = root;
    while (true) {
      const side = key < cursor.key ? "left" : "right";
      const next: TreeNode | null = cursor[side];
      if (!next) {
        cursor[side] = node;
        node.parent = cursor;
        return;
      }
      cursor = next;
    }
  });
  return root;
}

export function layout(root: TreeNode | null, marks: Map<number, NodeMark>, labels: Map<number, string>) {
  const nodes: LaidNode[] = [];
  let column = 0;
  let depth = 0;
  const walk = (node: TreeNode | null, level: number) => {
    if (!node) return;
    walk(node.left, level + 1);
    nodes.push({ id: node.id, key: node.key, x: column++, depth: level, parent: node.parent?.id ?? null, red: node.red, label: labels.get(node.id), mark: marks.get(node.id) });
    depth = Math.max(depth, level);
    walk(node.right, level + 1);
  };
  walk(root, 0);
  return { nodes, columns: Math.max(column, 1), depth };
}

export const withSteps = (meta: Localized, count: number): Localized => ({ en: `${meta.en} · ${count} steps`, pt: `${meta.pt} · ${count} passos` });

// The mutable marks every binary-tree recorder writes into, laid out and snapshotted on each push.
export function treeSession(n: number, seed: number) {
  const rand = seeded(seed);
  const keys = distinctKeys(n, rand);
  const marks = new Map<number, NodeMark>();
  const labels = new Map<number, string>();
  const steps: TreeStep[] = [];
  let tape: number[] = [];
  let aside = "";
  let nextId = 0;
  const makeNode = (key: number, red = false): TreeNode => ({ id: nextId++, key, left: null, right: null, parent: null, red });
  const push = (line: number, note: Localized, counters: Record<string, Counter>, root: TreeNode | null) => steps.push({ ...layout(root, marks, labels), tape: [...tape], aside, line, note, counters });
  const setTape = (values: number[]) => {
    tape = values;
  };
  const setAside = (text: string) => {
    aside = text;
  };
  const meta: Localized = { en: `${n} keys · seed ${seed}`, pt: `${n} chaves · seed ${seed}` };
  return { rand, keys, marks, labels, steps, push, makeNode, setTape, setAside, meta };
}
