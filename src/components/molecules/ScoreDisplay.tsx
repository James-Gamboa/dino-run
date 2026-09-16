import { Score } from "@/components/atoms/Score";

/**
 * Score + best-score strip, Chrome-Dino style ("HI 00123  00045").
 */
export interface ScoreDisplayProps {
  score: number;
  bestScore: number;
  className?: string;
}

export function ScoreDisplay({ score, bestScore, className = "" }: ScoreDisplayProps) {
  return (
    <div
      className={`flex items-baseline gap-3 font-pixel text-dino-ink ${className}`}
      aria-hidden="true"
    >
      <span className="text-xs tracking-widest text-dino-accent">HI</span>
      <Score
        value={bestScore}
        data-testid="high-score"
        className="text-sm text-dino-accent"
      />
      <span className="text-xs tracking-widest">SCORE</span>
      <Score value={score} data-testid="score" className="text-sm" />
    </div>
  );
}