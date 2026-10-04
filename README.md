# Algorithm Visualizer

> Interactive algorithm visualization at [algorithm-visualization.kuuhaku.dev](https://algorithm-visualization.kuuhaku.dev):
> 56 college algorithms played step by step next to the real code, in seven languages, with the current
> line lit and live counters.

---

## What is inside

- **Six families, 56 pages.** Sorting (bubble to radix, plus bogo and sleep sort), searching, pathfinding
  on a grid and on the real streets of Cascavel (OpenStreetMap), graphs (BFS to Edmonds–Karp), trees (BST
  to B-tree, trie, segment and Fenwick trees) and game AI (minimax to Monte Carlo tree search).
- **A step player on every page.** Play, scrub, step, change the input size and the seed, share the URL.
  The code panel shows the real implementation in TypeScript, Python, Java, C++, C, Go and Rust with the
  line that produced the current step highlighted; KPI tiles count comparisons, swaps and reads; a
  sentence explains each step; the explanation below covers the idea, complexity, when to use it,
  pitfalls, a benchmark against its siblings and the history.
- **Signatures: the algorithms on real things.** A* and Dijkstra on 4,180 real intersections, with
  click-to-place start and goal and a live-traffic variant; a B-tree as a MongoDB index with
  `find` and `explain`; npm's install order by topological sort with cycle detection; git's
  "did you mean" with Levenshtein distance and git's own weights; Kruskal over 25 Paraná cities in
  kilometres; trie autocomplete over a dictionary; tic-tac-toe against alpha-beta with the search tree.
- **Portuguese and English**, dark and light themes, sound toggle, keyboard shortcuts.

---

## Tech stack

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS 4 · Zustand · Canvas 2D

---

## Getting started

Requires Node 20.9+ and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:5002
pnpm build      # static export into out/
```

---

## Project structure

```
src/
  app/                       routes: (home), [family], [family]/[algorithm], signatures/[slug]
  core/algorithms/           one recorder per algorithm: runs it and records every step
  core/models/               the registry (specs, listings, copy), families, signatures, translations
  components/                KPI tiles, player canvas, icons
  utils/viz/                 the canvas renderers: bars, grid, graph, tree, B-tree, game tree, road map
scripts/build_map.mjs        fetches the Cascavel street graph from OpenStreetMap into public/data/
```

The design it follows is `../docs/design/Algorithm Visualizer.dc.html`; the plan and progress are in
`../docs/plan.md`; the project rules are in `../CLAUDE.md`.

---

## Deploy

Docker: the static export served by nginx on port 5002.

```bash
docker compose up -d --build
```

The container joins the external `nginx-proxy` network as `algorithm_visualization`; Nginx Proxy
Manager forwards `algorithm-visualization.kuuhaku.dev` to it.
