// Models
import type { Localized } from "@/core/models/translations";
// Utils
import type { Counter, Recording, StepBase } from "../recording";

export const GIT_COMMANDS = ["add", "am", "archive", "bisect", "blame", "branch", "bundle", "checkout", "cherry-pick", "clean", "clone", "commit", "config", "describe", "diff", "fetch", "format-patch", "gc", "grep", "init", "log", "merge", "mv", "notes", "pull", "push", "range-diff", "rebase", "reflog", "remote", "reset", "restore", "revert", "rm", "shortlog", "show", "stash", "status", "submodule", "switch", "tag", "worktree"];

// "git" is what help.c uses: swap 0, insertion 1, substitution 2, deletion 3, and no suggestion at 7 or more.
export type EditWeights = "plain" | "git";
const COSTS: Record<EditWeights, { swap: number | null; insert: number; substitute: number; delete: number; floor: number }> = {
  plain: { swap: null, insert: 1, substitute: 1, delete: 1, floor: 4 },
  git: { swap: 0, insert: 1, substitute: 2, delete: 3, floor: 7 },
};

export type Ranked = { word: string; distance: number };
// `rows` is how many rows of `table` are filled so far (the header row counts as 1).
export type EditStep = StepBase & { typed: string; candidate: string; table: number[][]; rows: number; ranking: Ranked[]; best: Ranked | null; suggested: boolean };

export function editTable(typed: string, candidate: string, weights: EditWeights) {
  const cost = COSTS[weights];
  const m = typed.length;
  const n = candidate.length;
  const table: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) table[i][0] = i * cost.delete;
  for (let j = 1; j <= n; j++) table[0][j] = j * cost.insert;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      let best = Math.min(table[i - 1][j] + cost.delete, table[i][j - 1] + cost.insert, table[i - 1][j - 1] + (typed[i - 1] === candidate[j - 1] ? 0 : cost.substitute));
      if (cost.swap !== null && i > 1 && j > 1 && typed[i - 1] === candidate[j - 2] && typed[i - 2] === candidate[j - 1]) best = Math.min(best, table[i - 2][j - 2] + cost.swap);
      table[i][j] = best;
    }
  }
  return table;
}

export function recordDidYouMean(typed: string, weights: EditWeights): Recording<EditStep> {
  const steps: EditStep[] = [];
  const cost = COSTS[weights];
  let ranking: Ranked[] = [];
  let cells = 0;
  const counters = (best: Ranked | null): Record<string, Counter> => ({ candidates: GIT_COMMANDS.length, compared: ranking.length, cells, best: best ? best.distance : "—", match: best ? best.word : "—" });
  const push = (line: number, note: Localized, candidate: string, table: number[][], rows: number, best: Ranked | null, suggested: boolean) => steps.push({ typed, candidate, table, rows, ranking: [...ranking], best, suggested, line, note, counters: counters(best) });

  push(1, { en: `"git ${typed}" is not a command. Compare "${typed}" with each of the ${GIT_COMMANDS.length} commands git knows, ${weights === "git" ? "with git's weights (swap 0, insert 1, substitute 2, delete 3)" : "with every edit costing 1"}.`, pt: `"git ${typed}" não é um comando. Compara "${typed}" com cada um dos ${GIT_COMMANDS.length} comandos que o git conhece, ${weights === "git" ? "com os pesos do git (troca 0, inserção 1, substituição 2, remoção 3)" : "com toda edição custando 1"}.` }, "", [], 0, null, false);
  GIT_COMMANDS.forEach((candidate) => {
    const table = editTable(typed, candidate, weights);
    cells += typed.length * candidate.length;
    const distance = table[typed.length][candidate.length];
    ranking = [...ranking, { word: candidate, distance }].sort((a, b) => a.distance - b.distance || (a.word < b.word ? -1 : 1));
    push(3, { en: `"${typed}" → "${candidate}": distance ${distance} after filling ${typed.length} × ${candidate.length} cells. Best so far: "${ranking[0].word}" at ${ranking[0].distance}.`, pt: `"${typed}" → "${candidate}": distância ${distance} depois de preencher ${typed.length} × ${candidate.length} células. Melhor até aqui: "${ranking[0].word}" com ${ranking[0].distance}.` }, candidate, table, typed.length + 1, ranking[0], false);
  });
  // The winner's table again, one row at a time, which is the part of the work worth watching.
  const best = ranking[0];
  const table = editTable(typed, best.word, weights);
  const suggested = best.distance < cost.floor;
  for (let row = 1; row <= typed.length; row++) {
    const char = typed[row - 1];
    push(5, { en: `Row '${char}': each cell is the cheapest of delete (above), insert (left) and substitute (diagonal, free when the letters match)${cost.swap !== null ? ", or a free swap when two adjacent letters are transposed" : ""}.`, pt: `Linha '${char}': cada célula é o mais barato entre remover (acima), inserir (esquerda) e substituir (diagonal, de graça quando as letras casam)${cost.swap !== null ? ", ou uma troca grátis quando duas letras vizinhas estão transpostas" : ""}.` }, best.word, table, row + 1, best, false);
  }
  push(8, suggested ? { en: `The bottom-right cell is the answer: "${typed}" is ${best.distance} from "${best.word}", the closest command. git prints: The most similar command is ${best.word}.`, pt: `A célula do canto inferior direito é a resposta: "${typed}" está a ${best.distance} de "${best.word}", o comando mais próximo. O git imprime: The most similar command is ${best.word}.` } : { en: `The closest command, "${best.word}", is still ${best.distance} away, at or past the floor of ${cost.floor}: git makes no suggestion.`, pt: `O comando mais próximo, "${best.word}", ainda está a ${best.distance}, no piso de ${cost.floor} ou além: o git não sugere nada.` }, best.word, table, typed.length + 1, best, suggested);
  const meta: Localized = { en: `"${typed}" · ${GIT_COMMANDS.length} commands · ${weights === "git" ? "git weights" : "plain Levenshtein"} · ${steps.length} steps`, pt: `"${typed}" · ${GIT_COMMANDS.length} comandos · ${weights === "git" ? "pesos do git" : "Levenshtein simples"} · ${steps.length} passos` };
  return { steps, meta };
}
