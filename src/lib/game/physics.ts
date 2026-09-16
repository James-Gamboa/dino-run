import type { DinoState } from "@/types/game";
import { GRAVITY, GROUND_TOP, DINO_H } from "./constants";

/**
 * Advances the dino's vertical dynamics for one frame.
 *
 * The dino's x is fixed; only y (and vertical velocity) are integrated.
 * While airborne we apply gravity; when landing we clamp to the ground.
 */
export function updateDinoPhysics(dino: DinoState, dtMs: number): DinoState {
  const dt = dtMs / 1000;
  const groundY = GROUND_TOP - DINO_H;

  if (!dino.onGround) {
    const vy = dino.vy + GRAVITY * dt;
    const y = dino.y + vy * dt;
    if (y >= groundY) {
      return { ...dino, y: groundY, vy: 0, onGround: true };
    }
    return { ...dino, y, vy };
  }
  return dino;
}