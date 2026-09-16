import { GROUND_TILE } from "@/lib/game/constants";

/**
 * Scrolling ground: a repeating dash pattern shifted by the engine's
 * ground offset. Motion comes from the snapshot (no CSS animation), so
 * the pattern always stays in sync with the physics speed.
 */
export interface GroundProps {
  offset: number;
  className?: string;
}

export function Ground({ offset, className = "" }: GroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-[24px] ${className}`}
      aria-hidden="true"
    >
      {/* solid line at the horizon of the world */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-current text-dino-ink/70" />
      {/* moving dash pattern (synced to GROUND_TILE) */}
      <div
        className="absolute inset-0 text-dino-ink/40"
        style={{
          transform: `translate3d(${-(offset % GROUND_TILE)}px, 0, 0)`,
          backgroundImage:
            "repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 26px)",
        }}
      />
    </div>
  );
}