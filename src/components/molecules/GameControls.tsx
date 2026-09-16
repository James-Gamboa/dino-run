import type { GamePhase } from "@/types/game";
import { Button } from "@/components/atoms/Button";

/**
 * On-screen touch controls for mobile. Hidden on md+ where the keyboard
 * (or pointer-tap on the world) is the primary input.
 */
export interface GameControlsProps {
  phase: GamePhase;
  onJump: () => void;
  onRestart: () => void;
  className?: string;
}

export function GameControls({ phase, onJump, onRestart, className = "" }: GameControlsProps) {
  return (
    <div className={`flex items-center justify-center gap-3 md:hidden ${className}`}>
      <Button
        variant="primary"
        data-testid="jump-button"
        aria-label="Jump (tap)"
        disabled={phase !== "playing"}
        onClick={onJump}
      >
        Jump
      </Button>
      <Button
        variant="ghost"
        data-testid="restart-button"
        aria-label="Restart game (tap)"
        disabled={phase !== "gameover"}
        onClick={onRestart}
      >
        Restart
      </Button>
    </div>
  );
}