/**
 * All tunable gameplay constants live here, in one place, so balance
 * tweaks never require touching engine or UI code.
 */

import type { PterodactylAltitude, ThrottleDirection } from "@/types/game";

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
/** Ducking sprite is wider and much lower (it lies down to dodge). */
export const DINO_DUCK_W = 60;
export const DINO_DUCK_H = 30;
/** Forgiving hitbox insets, relative to the sprite box. */
export const DINO_HITBOX_INSET = { x: 0.15, y: 0.1 };
export const DINO_DUCK_HITBOX_INSET = { x: 0.2, y: 0.2 };

// --- Physics ------------------------------------------------------------
export const GRAVITY = 2600; // px/s^2
export const JUMP_VELOCITY = -640; // px/s (upward)
/** Extra gravity while holding duck mid-air (fast fall). */
export const FAST_FALL_GRAVITY_SCALE = 2.6;

// --- Speed / difficulty ---------------------------------------------------
export const BASE_SPEED = 320; // px/s at the start of a run
export const MAX_SPEED = 720; // px/s cap for the difficulty curve
export const ACCELERATION = 6; // px/s gained per second of running

// --- Throttle (arrow left / right) ----------------------------------------
export const THROTTLE_FACTOR: Record<ThrottleDirection, number> = {
  [-1]: 0.78,
  [0]: 1,
  [1]: 1.26,
};
/** How fast the throttle factor interpolates toward its target (per second). */
export const THROTTLE_LERP_PER_SEC = 2.5;

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

// --- Pterodactyls ---------------------------------------------------------
export const PTERODACTYL_SIZE = { w: 46, h: 28 };
/** Score at which flying obstacles start to appear. */
export const PTERODACTYL_UNLOCK_SCORE = 350;
/** Chance of spawning a pterodactyl instead of a cactus once unlocked. */
export const PTERODACTYL_SPAWN_CHANCE = 0.32;
/** Vertical offset of each altitude, measured up from the ground line. */
export const PTERODACTYL_ALTITUDE_OFFSETS: Record<PterodactylAltitude, number> = {
  low: 12, // must jump
  mid: 26, // between standing & ducking head heights: must duck
  high: 44, // harmless unless you jump
};
/** Extra horizontal speed on top of the world scroll, px/s. */
export const PTERODACTYL_SPEED_BONUS = 70;
/** Wing flap frame duration, ms. */
export const PTERODACTYL_FLAP_MS = 150;

// --- Day / night cycle ----------------------------------------------------
/** Score interval of the day/night cycle (alternates every interval). */
export const NIGHT_SCORE_INTERVAL = 700;

// --- Clouds ---------------------------------------------------------------
export const CLOUD_COUNT = 4;
/** Cloud horizontal speed as a fraction of the ground speed (parallax). */
export const CLOUD_PARALLAX = 0.16;

// --- Scoring --------------------------------------------------------------
/** Score points per pixel of distance traveled. */
export const SCORE_PER_PX = 1 / 15;
/** Storage key for the persistent best score. */
export const BEST_SCORE_KEY = "chrome-dino:best-score";
