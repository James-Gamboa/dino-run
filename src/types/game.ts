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
export type DinoPose = "run-1" | "run-2" | "jump" | "duck" | "dead";

/** Axis-aligned bounding box, in world pixels. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Obstacle variant. */
export type ObstacleKind = "small" | "tall" | "group" | "pterodactyl";

/** Grounded (cactus) obstacle variants — everything but the flying one. */
export type CactusKind = Exclude<ObstacleKind, "pterodactyl">;

/** Flight altitude of a pterodactyl obstacle. */
export type PterodactylAltitude = "low" | "mid" | "high";

/** Horizontal throttle input: -1 = brake, 0 = neutral, 1 = accelerate. */
export type ThrottleDirection = -1 | 0 | 1;

/** State of the player dino. */
export interface DinoState {
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
  /** True while the duck key is held and the dino is on the ground. */
  ducking: boolean;
  pose: DinoPose;
  hitbox: Rect;
}

/** State of a single obstacle (cactus or pterodactyl). */
export interface ObstacleState {
  id: string;
  kind: ObstacleKind;
  /** Flight altitude for pterodactyls; null for grounded cacti. */
  altitude: PterodactylAltitude | null;
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
  /** Always-ticking clock (ms), used for idle/flap animations. */
  clockMs: number;
  /** Total distance traveled in this run, px. */
  distance: number;
  score: number;
  bestScore: number;
  /** Current world speed in px/s (difficulty curve × throttle factor). */
  speed: number;
  /** Multiplier applied by the throttle input (1 = neutral). */
  speedFactor: number;
  /** Current throttle direction. */
  throttle: ThrottleDirection;
  /** True while the day/night cycle is on its night half. */
  isNight: boolean;
  dino: DinoState;
  obstacles: ObstacleState[];
  clouds: CloudState[];
  /** Scrolling offset of the ground texture, px. */
  groundOffset: number;
}
