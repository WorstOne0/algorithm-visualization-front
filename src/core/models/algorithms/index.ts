// Models
import { GAMEAI } from "./gameai";
import { GAMEAI_MORE } from "./gameai_more";
import { GRAPHS } from "./graphs";
import { GRAPHS_MORE } from "./graphs_more";
import { PATHFINDING } from "./pathfinding";
import { PATHFINDING_MORE } from "./pathfinding_more";
import { ROADS } from "./roads";
import { SEARCHING } from "./searching";
import { SEARCHING_MORE } from "./searching_more";
import { SORTING } from "./sorting";
import { SORTING_FUN } from "./sorting_fun";
import { SORTING_MORE } from "./sorting_more";
import type { AlgorithmSpec } from "./spec";
import { TREES } from "./trees";
import { TREES_MORE } from "./trees_more";

export type { AlgorithmKind, AlgorithmSpec, KpiSpec } from "./spec";

const SPECS = { ...SORTING, ...SORTING_MORE, ...SORTING_FUN, ...SEARCHING, ...SEARCHING_MORE, ...PATHFINDING, ...PATHFINDING_MORE, ...ROADS, ...GRAPHS, ...GRAPHS_MORE, ...TREES, ...TREES_MORE, ...GAMEAI, ...GAMEAI_MORE };

export type AlgorithmId = keyof typeof SPECS;

export type Algorithm = AlgorithmSpec & { id: AlgorithmId };

export const ALGORITHMS = Object.fromEntries(Object.entries(SPECS).map(([id, spec]) => [id, { ...spec, id }])) as unknown as Record<AlgorithmId, Algorithm>;

export const ALGORITHM_LIST = Object.values(ALGORITHMS);

export const findAlgorithm = (family: string, slug: string) => ALGORITHM_LIST.find((algorithm) => algorithm.family === family && algorithm.slug === slug);

export const algorithmPath = (algorithm: Algorithm) => `/${algorithm.family}/${algorithm.slug}`;
