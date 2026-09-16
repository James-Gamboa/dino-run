/**
 * Core game domain types.
 *
 * The game logic is kept free of React/DOM concerns so it can be
 * reasoned about and tested in isolation. These types are the contract
 * between the pure engine (`lib/game/engine.ts`) and the UI layer.
 */

/** Lifecycle phase of a game session. */
export type GamePhase = "idle" | "playing" | "gameover";

/** Animation pose of the dino sprite. */
export type DinoPose = "run-1" | "run-2" | "jump" | "dead";

/** Axis-aligned bounding box, in world pixels. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Obstacle variant. */
export type ObstacleKind = "small" | "tall" | "group";

/** State of the player dino. */
export interface DinoState {
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
  pose: DinoPose;
  hitbox: Rect;
}

/** State of a single obstacle (cactus). */
export interface ObstacleState {
  id: string;
  kind: ObstacleKind;
  x: number;
  y: number;
  w: number;
  h: number;
  hitbox: Rect;
  /** True once the obstacle has traveled past the dino (score "passed" distance). */
  passed: boolean;
}

/** State of a decorative cloud, drifting with parallax. */
export interface CloudState {
  id: string;
  x: number;
  y: number;
  scale: number;
  /** Own horizontal speed in px/s (fraction of ground speed). */
  speed: number;
}

/** Immutable per-frame view of the whole game. */
export interface GameSnapshot {
  phase: GamePhase;
  /** Elapsed run time in ms (0 in idle). */
  timeMs: number;
  /** Total distance traveled in this run, px. */
  distance: number;
  score: number;
  bestScore: number;
  /** Current world speed in px/s. */
  speed: number;
  dino: DinoState;
  obstacles: ObstacleState[];
  clouds: CloudState[];
  /** Scrolling offset of the ground texture, px. */
  groundOffset: number;
}