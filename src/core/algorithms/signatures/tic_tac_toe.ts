// Models
import type { Localized } from "@/core/models/translations";
// Utils
import type { Counter, StepBase } from "../recording";

export type Cell = "X" | "O" | null;
export type Board = Cell[];
export type Candidate = { cell: number; board: Board; value: number; nodes: number; cutoffs: number };
export type Reply = { cell: number; board: Board; value: number };
// `shown` is how many candidates the stage reveals so far; `replies` appear once the move is chosen.
export type TttStep = StepBase & { root: Board; player: Cell; candidates: Candidate[]; shown: number; chosen: number | null; replies: Reply[]; showReplies: boolean };
export type TttRecording = { steps: TttStep[]; meta: Localized; move: number };

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const EMPTY_BOARD: Board = Array(9).fill(null);

export const winnerOf = (board: Board): Cell => {
  for (const [a, b, c] of LINES) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  return null;
};

export const winningLine = (board: Board) => LINES.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]) ?? null;

export const isFull = (board: Board) => board.every((cell) => cell !== null);

const other = (player: Cell): Cell => (player === "X" ? "O" : "X");

// Negamax with alpha-beta from `player`'s point of view; a faster win scores higher than a slower one.
function search(board: Board, player: Cell, alpha: number, beta: number, depth: number, stats: { nodes: number; cutoffs: number }): number {
  stats.nodes++;
  if (winnerOf(board)) return depth - 10;
  if (isFull(board)) return 0;
  let best = -Infinity;
  for (let cell = 0; cell < 9; cell++) {
    if (board[cell]) continue;
    board[cell] = player;
    const value = -search(board, other(player), -beta, -alpha, depth + 1, stats);
    board[cell] = null;
    best = Math.max(best, value);
    alpha = Math.max(alpha, value);
    if (alpha >= beta) {
      stats.cutoffs++;
      break;
    }
  }
  return best;
}

const forecastOf = (value: number): Localized => (value > 0 ? { en: "win", pt: "vitória" } : value < 0 ? { en: "loss", pt: "derrota" } : { en: "draw", pt: "empate" });

export const scoreText = (value: number) => (value > 0 ? `+${value}` : String(value));

// The engine's move for this position, recorded as the candidates it scored and, under the chosen one, the replies it expects.
export function recordEngineMove(root: Board, player: Cell): TttRecording {
  const steps: TttStep[] = [];
  const empties = root.map((cell, index) => (cell ? -1 : index)).filter((index) => index >= 0);
  const candidates: Candidate[] = [];
  let nodes = 0;
  let cutoffs = 0;
  const counters = (shown: number): Record<string, Counter> => ({ nodes, cutoffs, moves: shown, movesUnit: `/ ${empties.length}`, plies: empties.length, forecast: shown ? forecastOf(Math.max(...candidates.slice(0, shown).map((candidate) => candidate.value))) : "—" });
  const push = (line: number, note: Localized, shown: number, chosen: number | null, replies: Reply[], showReplies: boolean) => steps.push({ root, player, candidates, shown, chosen, replies, showReplies, line, note, counters: counters(shown) });

  push(1, { en: `${player} to move with ${empties.length} empty cells. Search every candidate to the end of the game, assuming ${other(player)} always answers with its best reply.`, pt: `${player} joga com ${empties.length} casas vazias. Busca cada candidato até o fim do jogo, supondo que ${other(player)} sempre responde com a melhor jogada.` }, 0, null, [], false);
  empties.forEach((cell) => {
    const board = [...root];
    board[cell] = player;
    const stats = { nodes: 0, cutoffs: 0 };
    const value = winnerOf(board) ? 9 : isFull(board) ? 0 : -search(board, other(player), -Infinity, Infinity, 1, stats);
    nodes += stats.nodes;
    cutoffs += stats.cutoffs;
    candidates.push({ cell, board, value, nodes: stats.nodes, cutoffs: stats.cutoffs });
    const forecast = forecastOf(value);
    push(3, { en: `Cell ${cell + 1}: value ${scoreText(value)}, a ${forecast.en} with best play${value > 0 ? ` in ${10 - value} more plies` : ""}. ${stats.nodes} nodes searched, ${stats.cutoffs} cutoffs.`, pt: `Casa ${cell + 1}: valor ${scoreText(value)}, ${forecast.pt} com o melhor jogo${value > 0 ? ` em mais ${10 - value} lances` : ""}. ${stats.nodes} nós buscados, ${stats.cutoffs} cortes.` }, candidates.length, null, [], false);
  });
  const bestValue = Math.max(...candidates.map((candidate) => candidate.value));
  // Among equal values prefer the centre, then corners: the same score, a more natural game.
  const preference = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  const chosen = candidates.map((candidate, index) => index).filter((index) => candidates[index].value === bestValue).sort((p, q) => preference.indexOf(candidates[p].cell) - preference.indexOf(candidates[q].cell))[0];
  const move = candidates[chosen];
  const replies: Reply[] = [];
  if (!winnerOf(move.board) && !isFull(move.board)) {
    for (let cell = 0; cell < 9; cell++) {
      if (move.board[cell]) continue;
      const board = [...move.board];
      board[cell] = other(player);
      const stats = { nodes: 0, cutoffs: 0 };
      const value = winnerOf(board) ? -9 : isFull(board) ? 0 : search(board, player, -Infinity, Infinity, 2, stats);
      replies.push({ cell, board, value });
    }
  }
  const forecast = forecastOf(bestValue);
  push(6, { en: `Play cell ${move.cell + 1}: the best value is ${scoreText(bestValue)} (${forecast.en}). ${nodes} nodes and ${cutoffs} cutoffs for this move.${replies.length ? ` Under it, ${other(player)}'s ${replies.length} replies and what each leads to.` : ""}`, pt: `Joga na casa ${move.cell + 1}: o melhor valor é ${scoreText(bestValue)} (${forecast.pt}). ${nodes} nós e ${cutoffs} cortes para esta jogada.${replies.length ? ` Abaixo, as ${replies.length} respostas de ${other(player)} e aonde cada uma leva.` : ""}` }, candidates.length, chosen, replies, true);
  const meta: Localized = { en: `${player} to move · ${empties.length} candidates · ${nodes} nodes`, pt: `${player} joga · ${empties.length} candidatos · ${nodes} nós` };
  return { steps, meta, move: move.cell };
}
