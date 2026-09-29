// Models
import type { Localized } from "@/core/models/translations";
// Utils
import type { Counter, Recording } from "../recording";
import { layoutForest, type NodeMark, type TreeStep } from "../trees/tree_model";

type TrieNode = { id: number; char: string; parent: number | null; children: Map<string, number>; end: boolean; below: number };
export type Trie = { nodes: TrieNode[]; words: number };
export type AutocompleteStep = TreeStep & { completions: string[]; prefixFound: boolean };

// The stage shows at most this many nodes: the prefix path plus the widest slice of the subtree under it.
const NODE_BUDGET = 48;

export function buildTrie(words: string[]): Trie {
  const nodes: TrieNode[] = [{ id: 0, char: "", parent: null, children: new Map(), end: false, below: 0 }];
  words.forEach((word) => {
    let node = nodes[0];
    for (const char of word) {
      let next = node.children.get(char);
      if (next === undefined) {
        next = nodes.length;
        nodes.push({ id: next, char, parent: node.id, children: new Map(), end: false, below: 0 });
        node.children.set(char, next);
      }
      node = nodes[next];
    }
    node.end = true;
  });
  const count = (node: TrieNode): number => {
    node.below = (node.end ? 1 : 0) + [...node.children.values()].reduce((sum, id) => sum + count(nodes[id]), 0);
    return node.below;
  };
  count(nodes[0]);
  return { nodes, words: words.length };
}

const wordOf = (trie: Trie, id: number) => {
  let text = "";
  for (let node = trie.nodes[id]; node.parent !== null; node = trie.nodes[node.parent]) text = node.char + text;
  return text;
};

export function recordAutocomplete(trie: Trie, prefix: string, limit = 12): Recording<AutocompleteStep> {
  const steps: AutocompleteStep[] = [];
  const marks = new Map<number, NodeMark>();
  const path: number[] = [0];
  let completions: string[] = [];
  let visited = 0;
  let prefixFound = true;
  const counters = (): Record<string, Counter> => ({ words: trie.words, nodes: trie.nodes.length, visited, scan: trie.words, completions: completions.length, typed: prefix.length });

  // The visible slice: the path from the root, then whole levels under the focus while they fit; cut nodes carry the hidden word count.
  const visible = (focus: number) => {
    const include = [...path];
    const cut = new Map<number, number>();
    let frontier = [focus];
    while (frontier.length) {
      const next = frontier.flatMap((id) => [...trie.nodes[id].children.values()]);
      if (!next.length) break;
      if (include.length + next.length > NODE_BUDGET) {
        frontier.forEach((id) => {
          if (trie.nodes[id].children.size) cut.set(id, trie.nodes[id].below - (trie.nodes[id].end ? 1 : 0));
        });
        break;
      }
      include.push(...next);
      frontier = next;
    }
    return { include, cut };
  };
  let view = visible(0);
  const push = (line: number, note: Localized, aside = "") => {
    const items = view.include.map((id) => {
      const node = trie.nodes[id];
      const hidden = view.cut.get(id);
      return { id, key: id, parent: node.parent, text: node.char || "•", label: hidden ? `+${hidden}` : node.end ? "■" : undefined, mark: marks.get(id) };
    });
    steps.push({ ...layoutForest(items), tape: [], aside, line, note, counters: counters(), completions: [...completions], prefixFound });
  };

  marks.set(0, "cur");
  push(1, { en: `${trie.words} words in a trie of ${trie.nodes.length} nodes. The root fans out into ${trie.nodes[0].children.size} first letters; type to walk down.`, pt: `${trie.words} palavras numa trie de ${trie.nodes.length} nós. A raiz se abre em ${trie.nodes[0].children.size} primeiras letras; digite para descer.` });
  let focus = 0;
  for (const char of prefix) {
    const next = trie.nodes[focus].children.get(char);
    visited++;
    if (next === undefined) {
      prefixFound = false;
      push(3, { en: `No child '${char}' under "${wordOf(trie, focus)}": nothing in the dictionary starts with "${prefix}". One failed lookup, ${visited} nodes visited; a scan would still test all ${trie.words} words.`, pt: `Nenhum filho '${char}' sob "${wordOf(trie, focus)}": nada no dicionário começa com "${prefix}". Uma busca falhou, ${visited} nós visitados; uma varredura ainda testaria todas as ${trie.words} palavras.` }, `prefix: ${prefix}`);
      break;
    }
    marks.set(focus, "path");
    focus = next;
    path.push(focus);
    marks.set(focus, "cur");
    view = visible(focus);
    push(2, { en: `'${char}': follow the edge. ${trie.nodes[focus].below} word${trie.nodes[focus].below === 1 ? "" : "s"} hang below "${wordOf(trie, focus)}".`, pt: `'${char}': segue a aresta. ${trie.nodes[focus].below} palavra${trie.nodes[focus].below === 1 ? "" : "s"} pende${trie.nodes[focus].below === 1 ? "" : "m"} abaixo de "${wordOf(trie, focus)}".` }, `prefix: ${wordOf(trie, focus)}`);
  }
  if (prefixFound) {
    // Depth-first in alphabetical order, so the completions come out sorted; stops after `limit` words.
    const stack = [focus];
    while (stack.length && completions.length < limit) {
      const id = stack.pop()!;
      const node = trie.nodes[id];
      if (id !== focus) visited++;
      if (node.end) {
        completions = [...completions, wordOf(trie, id)];
        if (id !== focus) marks.set(id, "done");
        push(5, { en: `End-of-word mark at "${wordOf(trie, id)}": completion ${completions.length}.`, pt: `Marca de fim de palavra em "${wordOf(trie, id)}": sugestão ${completions.length}.` }, `prefix: ${prefix || "∅"}`);
      }
      [...node.children.entries()].sort(([a], [b]) => (a < b ? 1 : -1)).forEach(([, child]) => stack.push(child));
    }
    const total = trie.nodes[focus].below;
    push(7, { en: `${completions.length}${total > completions.length ? ` of ${total}` : ""} completions for "${prefix || "∅"}" after visiting ${visited} nodes. A linear scan would compare the prefix with all ${trie.words} words.`, pt: `${completions.length}${total > completions.length ? ` de ${total}` : ""} sugestões para "${prefix || "∅"}" depois de visitar ${visited} nós. Uma varredura linear compararia o prefixo com todas as ${trie.words} palavras.` }, `prefix: ${prefix || "∅"}`);
  }
  const meta: Localized = { en: `${trie.words} words · ${trie.nodes.length} nodes · ${steps.length} steps`, pt: `${trie.words} palavras · ${trie.nodes.length} nós · ${steps.length} passos` };
  return { steps, meta };
}
