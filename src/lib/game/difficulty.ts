import { ACCELERATION, BASE_SPEED, MAX_SPEED } from "./constants";

/**
 * Progressive difficulty: world speed grows linearly with the run's
 * elapsed time until it hits the cap. Spawn gaps shrink implicitly
 * because the same pixel gap is covered faster over time.
 */
export function speedForElapsedMs(elapsedMs: number): number {
  const seconds = elapsedMs / 1000;
  const speed = BASE_SPEED + ACCELERATION * seconds;
  return Math.min(speed, MAX_SPEED);
}