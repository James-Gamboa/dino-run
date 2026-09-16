/**
 * All tunable gameplay constants live here, in one place, so balance
 * tweaks never require touching engine or UI code.
 */

// --- World -------------------------------------------------------------
/** Fallback logical world width (px) when the container cannot be measured yet. */
export const WORLD_WIDTH_FALLBACK = 600;
/** Distance from the top of the world to the ground line (px). */
export const GROUND_TOP = 144;
/** World height used when the measured height is unavailable. */
export const WORLD_HEIGHT_FALLBACK = 172;

// --- Dino ---------------------------------------------------------------
export const DINO_X = 46;
export const DINO_W = 46;
export const DINO_H = 48;

// --- Physics ------------------------------------------------------------
export const GRAVITY = 2600; // px/s^2
export const JUMP_VELOCITY = -640; // px/s (upward)

// --- Speed / difficulty ---------------------------------------------------
export const BASE_SPEED = 320; // px/s at the start of a run
export const MAX_SPEED = 720; // px/s cap
export const ACCELERATION = 6; // px/s gained per second of running

// --- Ground texture -------------------------------------------------------
/** Pixel width of one ground tile (line + dashes pattern). */
export const GROUND_TILE = 26;

// --- Obstacles ------------------------------------------------------------
export const OBSTACLE_SIZES = {
  small: { w: 30, h: 44 },
  tall: { w: 40, h: 62 },
  group: { w: 68, h: 46 },
} as const;

/** Horizontal gap between spawned obstacles, px. */
export const SPAWN_GAP_MIN = 300;
export const SPAWN_GAP_MAX = 500;
/** Minimum time between spawns (extra safety margin at low speed). */
export const SPAWN_MIN_INTERVAL_MS = 350;

// --- Clouds ---------------------------------------------------------------
export const CLOUD_COUNT = 4;
/** Cloud horizontal speed as a fraction of the ground speed (parallax). */
export const CLOUD_PARALLAX = 0.16;

// --- Scoring --------------------------------------------------------------
/** Score points per pixel of distance traveled. */
export const SCORE_PER_PX = 1 / 15;
/** Storage key for the persistent best score. */
export const BEST_SCORE_KEY = "chrome-dino:best-score";