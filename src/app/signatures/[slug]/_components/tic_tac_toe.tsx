"use client";

// Next
import { useCallback, useEffect, useMemo, useState } from "react";
// Controllers
import { useLanguageController, useThemeController } from "@/core/controllers";
import { useSignaturePlayerController } from "../_controllers/signature_player_controller";
// Models
import { EMPTY_BOARD, isFull, recordEngineMove, winnerOf, winningLine, type Board, type Cell, type TttRecording, type TttStep } from "@/core/algorithms/signatures/tic_tac_toe";
import { localize, type Localized, type Signature, type VizKey } from "@/core/models";
// Components
import { KpiTiles } from "@/components";
import NoteCard from "./note_card";
import SignatureShell from "./signature_shell";
import StepPlayer from "./step_player";
// Utils
import { counterText } from "@/utils/format";
import { drawTicTacTree, setVizTheme, type Ctx } from "@/utils/viz";

const LEGEND: [VizKey, Localized][] = [["act", { en: "being scored", pt: "sendo pontuada" }], ["violet", { en: "chosen · best reply", pt: "escolhida · melhor resposta" }], ["primary", { en: "X", pt: "X" }], ["def", { en: "candidate", pt: "candidata" }]];

const T = {
  en: { nodes: "NODES SEARCHED", nodesSub: "for the engine's last move", cutoffs: "CUTOFFS", cutoffsSub: "branches alpha-beta skipped", moves: "CANDIDATES", movesSub: "moves scored", plies: "PLIES LEFT", pliesSub: "empty cells", forecast: "FORECAST", forecastSub: "with best play from here", yourTurn: "Your turn", thinking: "Engine thinking…", youWin: "You win", draw: "Draw", engineWins: "Engine wins", newGame: "New game", engineStarts: "Engine starts", moveList: "MOVES", youAre: "you are" },
  pt: { nodes: "NÓS BUSCADOS", nodesSub: "na última jogada do motor", cutoffs: "CORTES", cutoffsSub: "ramos que o alfa-beta pulou", moves: "CANDIDATAS", movesSub: "jogadas pontuadas", plies: "LANCES RESTANTES", pliesSub: "casas vazias", forecast: "PREVISÃO", forecastSub: "com o melhor jogo daqui", yourTurn: "Sua vez", thinking: "Motor pensando…", youWin: "Você venceu", draw: "Empate", engineWins: "O motor venceu", newGame: "Novo jogo", engineStarts: "Motor começa", moveList: "JOGADAS", youAre: "você é" },
};

type Game = { board: Board; human: Cell; moves: number[]; last: TttRecording | null };

const other = (player: Cell): Cell => (player === "X" ? "O" : "X");

const idleStep = (board: Board, player: Cell): TttStep => ({ root: board, player, candidates: [], shown: 0, chosen: null, replies: [], showReplies: false, line: 0, note: { en: "", pt: "" }, counters: {} });

export default function TicTacToePage({ signature }: { signature: Signature }) {
  const lang = useLanguageController((state) => state.lang);
  const theme = useThemeController((state) => state.theme);
  const idx = useSignaturePlayerController((state) => state.idx);
  const restart = useSignaturePlayerController((state) => state.restart);
  const [game, setGame] = useState<Game>({ board: EMPTY_BOARD, human: "X", moves: [], last: null });

  const t = T[lang];
  const { board, human, moves } = game;
  const engine = other(human);
  const turn: Cell = moves.length % 2 === 0 ? "X" : "O";
  const winner = winnerOf(board);
  const over = winner !== null || isFull(board);
  const engineTurn = !over && turn === engine;
  const analysis = useMemo(() => (engineTurn ? recordEngineMove(board, engine) : null), [board, engine, engineTurn]);
  const recording = analysis ?? game.last;
  const steps = recording ? recording.steps : [idleStep(board, engine)];
  const last = steps.length - 1;
  const step = steps[Math.min(idx, last)];
  const line = winningLine(board);

  // The engine's move lands on the board once its analysis has played to the end (or was skipped to it).
  useEffect(() => {
    if (!analysis) return;
    restart(true, 0);
    let applied = false;
    const apply = () => {
      if (applied) return;
      applied = true;
      setGame((current) => {
        const next = [...current.board];
        next[analysis.move] = other(current.human);
        return { ...current, board: next, moves: [...current.moves, analysis.move], last: analysis };
      });
    };
    return useSignaturePlayerController.subscribe((state) => {
      if (state.idx >= analysis.steps.length - 1) apply();
    });
  }, [analysis, restart]);

  const draw = useCallback(
    (ctx: Ctx, w: number, h: number) => {
      setVizTheme(theme);
      drawTicTacTree(ctx, w, h, step);
    },
    [step, theme]
  );

  const play = (cell: number) => {
    if (over || engineTurn || board[cell]) return;
    setGame((current) => {
      const next = [...current.board];
      next[cell] = current.human;
      return { ...current, board: next, moves: [...current.moves, cell] };
    });
  };
  const newGame = (humanPlays: Cell) => setGame({ board: EMPTY_BOARD, human: humanPlays, moves: [], last: null });

  const status = winner ? (winner === human ? t.youWin : t.engineWins) : over ? t.draw : engineTurn ? t.thinking : `${t.yourTurn} (${human})`;
  const kpis = [
    { label: t.nodes, value: counterText(step.counters.nodes, lang) || "—", sub: t.nodesSub, isOn: true },
    { label: t.cutoffs, value: counterText(step.counters.cutoffs, lang) || "—", sub: t.cutoffsSub },
    { label: t.moves, value: counterText(step.counters.moves, lang) || "—", unit: counterText(step.counters.movesUnit, lang), sub: t.movesSub },
    { label: t.plies, value: board.filter((cell) => !cell).length, sub: t.pliesSub },
    { label: t.forecast, value: counterText(step.counters.forecast, lang) || "—", sub: t.forecastSub },
  ];

  return (
    <SignatureShell signature={signature}>
      <KpiTiles kpis={kpis} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-[1.2rem]">
        <StepPlayer legend={LEGEND} meta={recording ? localize(recording.meta, lang) : "—"} last={last} stepMs={420} draw={draw}>
          <button type="button" onClick={() => newGame("X")} className="btn-outline h-[3rem] px-[1rem] text-[1.2rem]">
            {t.newGame}
          </button>
          <button type="button" onClick={() => newGame("O")} className="btn-outline h-[3rem] px-[1rem] text-[1.2rem]">
            {t.engineStarts}
          </button>
        </StepPlayer>
        <div className="flex min-h-0 flex-col gap-[1.2rem]">
          <div className="card flex flex-col items-center gap-[1.2rem] px-[1.6rem] py-[1.6rem]">
            <div className="flex w-full items-center gap-[1rem]">
              <span className={`text-[1.4rem] font-semibold ${over ? "text-violet" : engineTurn ? "text-muted" : "text-primary"}`}>{status}</span>
              <div className="flex-1" />
              <span className="font-mono text-[1.05rem] text-faint">
                {t.youAre} {human}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-[0.6rem]">
              {board.map((cell, index) => {
                const isWinning = line?.includes(index) ?? false;
                return (
                  <button
                    key={index}
                    type="button"
                    disabled={over || engineTurn || cell !== null}
                    onClick={() => play(index)}
                    className={`flex h-[8.4rem] w-[8.4rem] items-center justify-center rounded-[0.8rem] border font-mono text-[3.6rem] font-semibold transition-colors ${isWinning ? "border-violet bg-violet-tint" : "border-line-2 bg-well"} ${cell === "X" ? "text-primary" : cell === "O" ? "text-violet" : "text-faint"} ${!cell && !over && !engineTurn ? "hover:border-primary" : ""} disabled:cursor-default`}
                  >
                    {cell ?? <span className="text-[1.1rem] opacity-50">{index + 1}</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex w-full items-center gap-[1rem]">
              <span className="label">{t.moveList}</span>
              <span className="font-mono text-[1.15rem] text-text-2">{moves.map((cell, index) => `${index % 2 === 0 ? "X" : "O"}${cell + 1}`).join("  ") || "—"}</span>
            </div>
          </div>
          <NoteCard note={recording ? localize(step.note, lang) : status} tag={recording ? `${step.player} · ${step.shown} / ${step.candidates.length}` : undefined} />
        </div>
      </div>
    </SignatureShell>
  );
}
