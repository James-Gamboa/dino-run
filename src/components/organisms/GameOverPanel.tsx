"use client";

import { Button } from "@/components/atoms/Button";
import { PixelText } from "@/components/atoms/PixelText";

/**
 * Overlay shown when a run ends. Rendered only in the "gameover" phase.
 */
export interface GameOverPanelProps {
  score: number;
  bestScore: number;
  onRestart: () => void;
}

function pad(value: number): string {
  return String(value).padStart(5, "0");
}

export function GameOverPanel({ score, bestScore, onRestart }: GameOverPanelProps) {
  return (
    <div
      data-testid="game-over-panel"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-dino-paper/85 p-4 text-center backdrop-blur-[1px]"
    >
      <PixelText as="h2" className="text-2xl text-dino-accent sm:text-3xl">
        GAME OVER
      </PixelText>
      <p className="font-pixel text-xs tracking-wider text-dino-ink/75">
        SCORE {pad(score)} · HI {pad(bestScore)}
      </p>
      <Button
        data-testid="restart-panel-button"
        aria-label="Restart game after game over"
        onClick={onRestart}
        className="mt-1"
      >
        RESTART
      </Button>
    </div>
  );
}