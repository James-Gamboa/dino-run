import type { GamePhase } from "@/types/game";
import { Button } from "@/components/atoms/Button";

/**
 * On-screen touch controls for mobile. Hidden on md+ where the keyboard
 * (or pointer-tap on the world) is the primary input. Duck is a hold
 * button: press and keep it pressed to stay low while a pterodactyl
 * passes.
 */
export interface GameControlsProps {
  phase: GamePhase;
  onJump: () => void;
  onRestart: () => void;
  onDuck?: (down: boolean) => void;
  className?: string;
}

export function GameControls({
  phase,
  onJump,
  onRestart,
  onDuck,
  className = "",
}: GameControlsProps) {
  const duckDisabled = phase !== "playing";

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
        data-testid="duck-button"
        aria-label="Duck (hold)"
        disabled={duckDisabled}
        onPointerDown={(event) => {
          if (duckDisabled) return;
          event.preventDefault();
          onDuck?.(true);
        }}
        onPointerUp={() => onDuck?.(false)}
        onPointerLeave={() => onDuck?.(false)}
        onPointerCancel={() => onDuck?.(false)}
      >
        Duck
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