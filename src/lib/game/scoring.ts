import { BEST_SCORE_KEY, SCORE_PER_PX } from "./constants";

/**
 * Converts a run's traveled distance into the displayed score.
 * Integer points accrue continuously while the world moves.
 */
export function scoreForDistance(distancePx: number): number {
  return Math.floor(distancePx * SCORE_PER_PX);
}

/** Reads the persisted best score; safely returns 0 when storage is unavailable. */
export function loadBestScore(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    const value = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

/** Persists the best score (best-effort, never throws). */
export function saveBestScore(score: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // storage may be unavailable (private mode); ignoring keeps the game playable
  }
}