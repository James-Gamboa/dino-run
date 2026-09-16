import type { DinoState } from "@/types/game";
import { GRAVITY, GROUND_TOP } from "./constants";

export interface DinoPhysicsOptions {
  /** Current sprite height: standing (48) or ducking (30). */
  height: number;
  /** Gravity multiplier for this frame (fast fall while ducking in the air). */
  gravityScale?: number;
}

/**
 * Advances the dino's vertical dynamics for one frame.
 *
 * The dino's x is fixed; only y (and vertical velocity) are integrated.
 * While airborne we apply gravity; when landing we clamp to the ground.
 * The sprite height is a parameter because a ducking dino has a different
 * floor offset.
 */
export function updateDinoPhysics(
  dino: DinoState,
  dtMs: number,
  { height, gravityScale = 1 }: DinoPhysicsOptions,
): DinoState {
  const dt = dtMs / 1000;
  const groundY = GROUND_TOP - height;

  if (!dino.onGround) {
    const vy = dino.vy + GRAVITY * gravityScale * dt;
    const y = dino.y + vy * dt;
    if (y >= groundY) {
      return { ...dino, y: groundY, vy: 0, onGround: true };
    }
    return { ...dino, y, vy };
  }

  // Grounded: keep y glued to the floor (height may have just changed
  // because the dino ducked or stood up).
  return dino.y === groundY ? dino : { ...dino, y: groundY, vy: 0 };
}
