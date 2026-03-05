"use client";

import { useEffect, useRef, useState } from "react";

type CellValue = "X" | "O" | null;
type GameResult = "WIN" | "LOSE" | "DRAW";

type MatchSummary = {
  result: GameResult;
  score: number;
  winStreak: number;
  scoreDelta: number;
};

type ResultTone = "NEUTRAL" | "DRAW" | "LOSE" | "WIN" | "BONUS";

type ResultPopup = {
  title: string;
  message: string;
  result: GameResult;
  tone: ResultTone;
};

const WIN_LINES: Array<[number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const TONE_CLASS_MAP: Record<ResultTone, { statusText: string; popupTitle: string }> = {
  NEUTRAL: {
    statusText: "text-[#516277]",
    popupTitle: "text-[#121b2a]",
  },
  DRAW: {
    statusText: "text-[#6b7280]",
    popupTitle: "text-[#6b7280]",
  },
  LOSE: {
    statusText: "text-[#dc2626]",
    popupTitle: "text-[#dc2626]",
  },
  WIN: {
    statusText: "text-[#22c55e]",
    popupTitle: "text-[#22c55e]",
  },
  BONUS: {
    statusText: "text-[#166534]",
    popupTitle: "text-[#166534]",
  },
};

function getWinner(board: CellValue[]): "X" | "O" | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }

  return null;
}

function isBoardFull(board: CellValue[]): boolean {
  return board.every((cell) => cell !== null);
}

function getAvailableMoves(board: CellValue[]): number[] {
  return board.reduce<number[]>((moves, value, index) => {
    if (value === null) {
      moves.push(index);
    }

    return moves;
  }, []);
}

function pickRandom(items: number[]): number | null {
  if (items.length === 0) {
    return null;
  }

  return items[Math.floor(Math.random() * items.length)];
}

function chooseBotMove(board: CellValue[]): number | null {
  const availableMoves = getAvailableMoves(board);
  const reserveTopRowForPlayer =
    board[0] === "X" && board[2] === null && (board[1] === null || board[1] === "X");
  const candidateMoves =
    reserveTopRowForPlayer && availableMoves.length > 1
      ? availableMoves.filter((move) => move !== 1 && move !== 2)
      : availableMoves;

  for (const move of candidateMoves) {
    const simulated = [...board];
    simulated[move] = "O";
    if (getWinner(simulated) === "O") {
      return move;
    }
  }

  for (const move of candidateMoves) {
    const simulated = [...board];
    simulated[move] = "X";
    if (getWinner(simulated) === "X") {
      return move;
    }
  }

  if (board[4] === null) {
    return 4;
  }

  const cornerMove = pickRandom([0, 2, 6, 8].filter((index) => board[index] === null && candidateMoves.includes(index)));
  if (cornerMove !== null) {
    return cornerMove;
  }

  return pickRandom(candidateMoves.length > 0 ? candidateMoves : availableMoves);
}

function getInitialStatusMessage() {
  return "Your turn (X)";
}

function getRoundEndMessage(result: GameResult, summary: MatchSummary | null): string {
  if (!summary) {
    if (result === "WIN") {
      return "You win! (failed to update score)";
    }

    if (result === "LOSE") {
      return "You lose. (failed to update score)";
    }

    return "Draw. (failed to update score)";
  }

  if (result === "WIN") {
    if (summary.scoreDelta === 2) {
      return "You win! +2 points (3-win streak bonus)";
    }

    return "You win! +1 point";
  }

  if (result === "LOSE") {
    return "You lose. -1 point";
  }

  return "Draw. Score unchanged";
}

function getPopupTitle(result: GameResult): string {
  if (result === "WIN") {
    return "You Win!";
  }

  if (result === "LOSE") {
    return "You Lose";
  }

  return "Draw";
}

function getResultTone(result: GameResult, summary: MatchSummary | null): ResultTone {
  if (result === "DRAW") {
    return "DRAW";
  }

  if (result === "LOSE") {
    return "LOSE";
  }

  if (summary?.scoreDelta === 2) {
    return "BONUS";
  }

  return "WIN";
}

async function submitMatchResult(result: GameResult): Promise<MatchSummary> {
  const response = await fetch("/api/game/result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ result }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to save result");
  }

  return (await response.json()) as MatchSummary;
}

type XOGameProps = {
  initialScore: number;
  initialWinStreak: number;
};

export function XOGame({ initialScore, initialWinStreak }: XOGameProps) {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [statusMessage, setStatusMessage] = useState(getInitialStatusMessage());
  const [statusTone, setStatusTone] = useState<ResultTone>("NEUTRAL");
  const [score, setScore] = useState(initialScore);
  const [winStreak, setWinStreak] = useState(initialWinStreak);
  const [resultPopup, setResultPopup] = useState<ResultPopup | null>(null);

  const botMoveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (botMoveTimerRef.current !== null) {
        window.clearTimeout(botMoveTimerRef.current);
      }
    };
  }, []);

  function resetRound() {
    if (botMoveTimerRef.current !== null) {
      window.clearTimeout(botMoveTimerRef.current);
      botMoveTimerRef.current = null;
    }

    setBoard(Array(9).fill(null));
    setIsRoundOver(false);
    setIsBotThinking(false);
    setStatusMessage(getInitialStatusMessage());
    setStatusTone("NEUTRAL");
    setResultPopup(null);
  }

  async function finishRound(result: GameResult, finalBoard: CellValue[]) {
    if (botMoveTimerRef.current !== null) {
      window.clearTimeout(botMoveTimerRef.current);
      botMoveTimerRef.current = null;
    }

    setBoard(finalBoard);
    setIsRoundOver(true);
    setIsBotThinking(false);
    setStatusMessage("Saving result...");
    setStatusTone("NEUTRAL");

    let summary: MatchSummary | null = null;
    try {
      summary = await submitMatchResult(result);
      setScore(summary.score);
      setWinStreak(summary.winStreak);
    } catch (error) {
      console.error("Failed to submit match result", error);
    }

    const message = getRoundEndMessage(result, summary);
    const tone = getResultTone(result, summary);
    setStatusMessage(message);
    setStatusTone(tone);
    setResultPopup({
      title: getPopupTitle(result),
      message,
      result,
      tone,
    });
  }

  function onCellClick(index: number) {
    if (isRoundOver || isBotThinking || board[index] !== null) {
      return;
    }

    const afterPlayerMove = [...board];
    afterPlayerMove[index] = "X";
    setBoard(afterPlayerMove);

    if (getWinner(afterPlayerMove) === "X") {
      void finishRound("WIN", afterPlayerMove);
      return;
    }

    if (isBoardFull(afterPlayerMove)) {
      void finishRound("DRAW", afterPlayerMove);
      return;
    }

    setIsBotThinking(true);
    setStatusMessage("Bot is thinking...");
    setStatusTone("NEUTRAL");

    botMoveTimerRef.current = window.setTimeout(() => {
      const botMove = chooseBotMove(afterPlayerMove);
      if (botMove === null) {
        void finishRound("DRAW", afterPlayerMove);
        return;
      }

      const afterBotMove = [...afterPlayerMove];
      afterBotMove[botMove] = "O";
      setBoard(afterBotMove);

      if (getWinner(afterBotMove) === "O") {
        void finishRound("LOSE", afterBotMove);
        return;
      }

      if (isBoardFull(afterBotMove)) {
        void finishRound("DRAW", afterBotMove);
        return;
      }

      setIsBotThinking(false);
      setStatusMessage(getInitialStatusMessage());
      setStatusTone("NEUTRAL");
    }, 450);
  }

  return (
    <>
      <section className="mt-8 rounded-2xl border border-[#d7d3cb] bg-white/65 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#121b2a]">XO Game</h2>
            <p className="text-sm text-[#516277]">Player (X) vs Bot (O)</p>
          </div>

          <button
            type="button"
            onClick={resetRound}
            className="rounded-xl border border-[#bdc8d8] px-3 py-2 text-sm font-medium text-[#121b2a] hover:bg-white"
          >
            New Round
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-[#d7d3cb] bg-white p-3">
            <p className="text-[#516277]">Score</p>
            <p className="text-xl font-semibold text-[#121b2a]">{score}</p>
          </div>
          <div className="rounded-xl border border-[#d7d3cb] bg-white p-3">
            <p className="text-[#516277]">Win Streak</p>
            <p className="text-xl font-semibold text-[#121b2a]">{winStreak}/3</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {board.map((cell, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onCellClick(index)}
              disabled={cell !== null || isBotThinking || isRoundOver}
              className="grid aspect-square place-items-center rounded-xl border border-[#bdc8d8] bg-white text-3xl font-bold text-[#16243a] disabled:cursor-not-allowed disabled:opacity-75"
            >
              {cell}
            </button>
          ))}
        </div>

        <p className={`mt-4 text-sm ${TONE_CLASS_MAP[statusTone].statusText}`}>{statusMessage}</p>
        <p className="mt-2 text-xs text-[#7a8796]">
          Win = +1 score, Lose = -1 score, every 3 consecutive wins = bonus +1 and streak resets.
        </p>
      </section>

      {resultPopup ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#101828]/45 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#d7d3cb] bg-[#f7f6f3] p-6 shadow-[0_24px_70px_-40px_rgba(16,24,40,0.7)]">
            <h3 className={`text-2xl font-semibold ${TONE_CLASS_MAP[resultPopup.tone].popupTitle}`}>
              {resultPopup.title}
            </h3>
            <p className="mt-2 text-sm text-[#516277]">{resultPopup.message}</p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border border-[#d7d3cb] bg-white p-3">
                <p className="text-[#516277]">Score</p>
                <p className="font-semibold text-[#121b2a]">{score}</p>
              </div>
              <div className="rounded-xl border border-[#d7d3cb] bg-white p-3">
                <p className="text-[#516277]">Win Streak</p>
                <p className="font-semibold text-[#121b2a]">{winStreak}/3</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setResultPopup(null)}
                className="flex-1 rounded-xl border border-[#bdc8d8] px-4 py-2 text-sm font-medium text-[#121b2a] hover:bg-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={resetRound}
                className="flex-1 rounded-xl border border-[#bdc8d8] bg-[#121b2a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b2a40]"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
