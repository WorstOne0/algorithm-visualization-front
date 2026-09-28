// Models
import { GAMEAI } from "./gameai";
import { GRAPHS } from "./graphs";
import { PATHFINDING } from "./pathfinding";
import { SEARCHING } from "./searching";
import { SORTING } from "./sorting";
import type { AlgorithmSpec } from "./spec";
import { TREES } from "./trees";

export type { AlgorithmKind, AlgorithmSpec, KpiSpec } from "./spec";

const SPECS = { ...SORTING, ...SEARCHING, ...PATHFINDING, ...GRAPHS, ...TREES, ...GAMEAI };

export type AlgorithmId = keyof typeof SPECS;

export type Algorithm = AlgorithmSpec & { id: AlgorithmId };

export const ALGORITHMS = Object.fromEntries(Object.entries(SPECS).map(([id, spec]) => [id, { ...spec, id }])) as unknown as Record<AlgorithmId, Algorithm>;

export const ALGORITHM_LIST = Object.values(ALGORITHMS);

export const findAlgorithm = (family: string, slug: string) => ALGORITHM_LIST.find((algorithm) => algorithm.family === family && algorithm.slug === slug);

export const algorithmPath = (algorithm: Algorithm) => `/${algorithm.family}/${algorithm.slug}`;
