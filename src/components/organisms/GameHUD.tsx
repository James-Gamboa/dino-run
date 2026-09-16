"use client";

import type { GamePhase } from "@/types/game";
import { ScoreDisplay } from "@/components/molecules/ScoreDisplay";

/**
 * Top bar of the game card: score + best score, and a polite live
 * region that announces phase changes to screen readers.
 */
export interface GameHUDProps {
  phase: GamePhase;
  score: number;
  bestScore: number;
}

export function GameHUD({ phase, score, bestScore }: GameHUDProps) {
  const liveText =
    phase === "playing"
      ? "Game running"
      : phase === "gameover"
        ? "Game over"
        : "";

  return (
    <div
      data-testid="hud"
      className="flex items-center justify-end pb-3"
      aria-label="Score"
    >
      <ScoreDisplay score={score} bestScore={bestScore} />
      <span className="sr-only" role="status" aria-live="polite">
        {liveText}
      </span>
    </div>
  );
}