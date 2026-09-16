import type {
  CactusKind,
  CloudState,
  DinoState,
  DinoPose,
  GamePhase,
  GameSnapshot,
  ObstacleState,
  PterodactylAltitude,
  ThrottleDirection,
} from "@/types/game";
import {
  BASE_SPEED,
  CLOUD_COUNT,
  CLOUD_PARALLAX,
  DINO_DUCK_H,
  DINO_DUCK_HITBOX_INSET,
  DINO_DUCK_W,
  DINO_H,
  DINO_HITBOX_INSET,
  DINO_W,
  DINO_X,
  FAST_FALL_GRAVITY_SCALE,
  GROUND_TOP,
  JUMP_VELOCITY,
  NIGHT_SCORE_INTERVAL,
  OBSTACLE_SIZES,
  PTERODACTYL_ALTITUDE_OFFSETS,
  PTERODACTYL_SIZE,
  PTERODACTYL_SPAWN_CHANCE,
  PTERODACTYL_SPEED_BONUS,
  PTERODACTYL_UNLOCK_SCORE,
  SCORE_PER_PX,
  SPAWN_GAP_MAX,
  SPAWN_GAP_MIN,
  THROTTLE_FACTOR,
  THROTTLE_LERP_PER_SEC,
} from "./constants";
import { shrinkRect } from "./collisions";
import { speedForElapsedMs } from "./difficulty";
import { updateDinoPhysics } from "./physics";

let nextId = 0;
function createId(prefix: string): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

/** World dimensions handed to the engine (measured from the DOM container). */
export interface WorldSize {
  width: number;
  height: number;
}

export interface EngineOptions {
  /** Random source, injectable for tests (defaults to Math.random). */
  random?: () => number;
  /** Fired exactly once when a run ends in a crash. */
  onGameOver?: (snapshot: GameSnapshot) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Pure game engine: owns all state, physics, spawning, collisions and
 * scoring. Produces an immutable snapshot per frame for the UI to render.
 *
 * It has no knowledge of React, the DOM, or input devices — the hook layer
 * forwards input and displays snapshots.
 */
export class DinoGameEngine {
  private phaseValue: GamePhase = "idle";

  /** Current phase — for input routing, avoids relying on loop timing. */
  get phase(): GamePhase {
    return this.phaseValue;
  }
  /** Always-ticking clock used for idle/flap animations. */
  private clockMs = 0;
  /** Run clock: advances only while playing. */
  private runTimeMs = 0;
  private distancePx = 0;
  private speed: number = BASE_SPEED;

  /** Duck input (down arrow held). */
  private duckInput = false;
  /** Throttle input (left/right arrows held): -1 | 0 | 1. */
  private throttleDirection: ThrottleDirection = 0;
  /** Smoothed multiplier applied to the difficulty curve speed. */
  private speedFactor = 1;

  private dino: DinoState;
  private obstacles: ObstacleState[] = [];
  private clouds: CloudState[] = [];

  /** Distance still to travel before the next obstacle spawns. */
  private nextSpawnDistance = 40;
  /** Debug: suppress natural spawning (tests isolate obstacles). */
  private spawningEnabled = true;
  /** Debug: ignore collisions (tests observe natural spawning). */
  private invincible = false;

  private groundOffset = 0;
  private bestScore: number;
  private width: number;
  private readonly groundY: number;
  private readonly random: () => number;
  private readonly onGameOver?: (snapshot: GameSnapshot) => void;

  constructor(size: WorldSize, bestScore: number, options: EngineOptions = {}) {
    this.width = size.width;
    this.groundY = GROUND_TOP - DINO_H;
    this.bestScore = bestScore;
    this.random = options.random ?? Math.random;
    this.onGameOver = options.onGameOver;

    this.dino = this.createDino();
    this.clouds = this.createClouds();
  }

  // --- Public API -----------------------------------------------------

  getSnapshot(): GameSnapshot {
    return {
      phase: this.phaseValue,
      timeMs: this.runTimeMs,
      clockMs: this.clockMs,
      distance: this.distancePx,
      score: this.score,
      bestScore: this.bestScore,
      speed: this.speed,
      speedFactor: this.speedFactor,
      throttle: this.throttleDirection,
      isNight: this.isNight,
      dino: { ...this.dino, hitbox: { ...this.dino.hitbox } },
      obstacles: this.obstacles.map((o) => ({ ...o, hitbox: { ...o.hitbox } })),
      clouds: this.clouds.map((c) => ({ ...c })),
      groundOffset: this.groundOffset,
    };
  }

  /** Starts a fresh run from idle (or from any other phase). */
  start(): void {
    this.phaseValue = "playing";
    this.runTimeMs = 0;
    this.distancePx = 0;
    this.speed = BASE_SPEED;
    this.speedFactor = 1;
    this.throttleDirection = 0;
    this.duckInput = false;
    this.obstacles = [];
    this.nextSpawnDistance = 40;
    this.groundOffset = 0;
    this.dino = this.createDino();
  }

  /** Restarts after a game over (same as a fresh start). */
  restart(): void {
    this.start();
  }

  /** Updates world dimensions after a container resize. */
  resize(size: WorldSize): void {
    this.width = size.width;
  }

  /** Input: make the dino jump (only while playing and grounded). */
  jump(): void {
    if (this.phaseValue !== "playing" || !this.dino.onGround) return;
    // Jumping from a duck stands the dino up before the impulse.
    const standingY = GROUND_TOP - DINO_H;
    this.dino = {
      ...this.dino,
      y: standingY,
      vy: JUMP_VELOCITY,
      onGround: false,
    };
  }

  /** Input: hold/release the duck (down arrow or touch button). */
  setDucking(ducking: boolean): void {
    this.duckInput = ducking;
  }

  /** Input: brake / neutral / accelerate (left/right arrows). */
  setThrottle(direction: ThrottleDirection): void {
    this.throttleDirection = direction;
  }

  /**
   * Dev-only deterministic helpers, bridged to the UI test hooks. They
   * exist so the e2e suite can verify rare states without waiting minutes.
   */
  debugForcePterodactyl(altitude: PterodactylAltitude): void {
    if (this.phaseValue !== "playing") return;
    this.spawnPterodactyl(altitude);
  }

  debugSetScore(score: number): void {
    this.distancePx = score / SCORE_PER_PX;
  }

  debugClearObstacles(): void {
    this.obstacles = [];
  }

  debugSetSpawning(enabled: boolean): void {
    this.spawningEnabled = enabled;
  }

  debugSetInvincible(invincible: boolean): void {
    this.invincible = invincible;
  }

  /**
   * Advances the simulation by dtMs. The loop should call this every
   * frame with a clamped delta so tunneling cannot happen.
   */
  update(dtMs: number): void {
    this.clockMs += dtMs;
    if (this.phaseValue !== "playing") return;

    const dt = dtMs / 1000;
    this.runTimeMs += dtMs;

    const targetFactor = THROTTLE_FACTOR[this.throttleDirection];
    const maxDelta = THROTTLE_LERP_PER_SEC * dt;
    this.speedFactor += clamp(
      targetFactor - this.speedFactor,
      -maxDelta,
      maxDelta,
    );

    this.speed = speedForElapsedMs(this.runTimeMs) * this.speedFactor;
    const worldDx = this.speed * dt;

    this.distancePx += worldDx;
    this.groundOffset += worldDx;

    this.updateDino(dtMs);
    this.updateClouds(dt);
    this.moveObstacles(worldDx, dt);

    if (this.hasCollision()) {
      this.bestScore = Math.max(this.bestScore, this.score);
      this.phaseValue = "gameover";
      this.dino = { ...this.dino, pose: "dead" };
      this.onGameOver?.(this.getSnapshot());
      return;
    }

    // Spawning is distance-driven so gaps stay consistent at any speed.
    this.nextSpawnDistance -= worldDx;
    if (this.spawningEnabled && this.nextSpawnDistance <= 0) {
      this.spawnObstacle();
      const minGap =
        this.speed > BASE_SPEED * 1.35 ? SPAWN_GAP_MIN * 0.8 : SPAWN_GAP_MIN;
      this.nextSpawnDistance =
        minGap + this.random() * (SPAWN_GAP_MAX - minGap);
    }
  }

  // --- Internals ------------------------------------------------------

  private get score(): number {
    return Math.floor(this.distancePx * SCORE_PER_PX);
  }

  private get isNight(): boolean {
    return Math.floor(this.score / NIGHT_SCORE_INTERVAL) % 2 === 1;
  }

  private createDino(): DinoState {
    const rect = { x: DINO_X, y: this.groundY, w: DINO_W, h: DINO_H };
    return {
      x: DINO_X,
      y: this.groundY,
      vy: 0,
      onGround: true,
      ducking: false,
      pose: "run-1",
      hitbox: shrinkRect(rect, DINO_HITBOX_INSET),
    };
  }

  private createClouds(): CloudState[] {
    const clouds: CloudState[] = [];
    for (let i = 0; i < CLOUD_COUNT; i += 1) {
      clouds.push({
        id: createId("cloud"),
        x: this.random() * this.width,
        y: 12 + this.random() * 58,
        scale: 0.6 + this.random() * 0.6,
        speed: 0,
      });
    }
    return clouds;
  }

  private updateDino(dtMs: number): void {
    const onGround = this.dino.onGround;
    const willDuck = this.duckInput && onGround;
    const height = willDuck ? DINO_DUCK_H : DINO_H;
    const gravityScale =
      !onGround && this.duckInput ? FAST_FALL_GRAVITY_SCALE : 1;

    const next = updateDinoPhysics(this.dino, dtMs, { height, gravityScale });

    const runIndex = Math.floor(this.clockMs / 150) % 2 === 0;
    let pose: DinoPose;
    if (!next.onGround) pose = "jump";
    else if (willDuck) pose = "duck";
    else pose = runIndex ? "run-1" : "run-2";

    const ducking = pose === "duck";
    const w = ducking ? DINO_DUCK_W : DINO_W;
    const h = ducking ? DINO_DUCK_H : DINO_H;
    const inset = ducking ? DINO_DUCK_HITBOX_INSET : DINO_HITBOX_INSET;

    this.dino = {
      ...next,
      ducking,
      pose,
      hitbox: shrinkRect(
        { x: next.x, y: next.y, w, h },
        inset,
      ),
    };
  }

  private updateClouds(dt: number): void {
    const dx = CLOUD_PARALLAX * this.speed * dt;
    for (const cloud of this.clouds) {
      cloud.x -= dx;
      if (cloud.x < -70) {
        cloud.x = this.width + 50;
        cloud.y = 12 + this.random() * 58;
        cloud.scale = 0.6 + this.random() * 0.6;
      }
    }
  }

  private moveObstacles(worldDx: number, dt: number): void {
    for (const obstacle of this.obstacles) {
      const extra =
        obstacle.kind === "pterodactyl" ? PTERODACTYL_SPEED_BONUS * dt : 0;
      const dx = worldDx + extra;
      obstacle.x -= dx;
      obstacle.hitbox.x -= dx;
      if (!obstacle.passed && obstacle.x + obstacle.w < DINO_X) {
        obstacle.passed = true;
      }
    }
    // Drop obstacles that fully exited the left edge.
    this.obstacles = this.obstacles.filter((o) => o.x + o.w >= -80);
  }

  private spawnObstacle(): void {
    const canSpawnPterodactyl = this.score >= PTERODACTYL_UNLOCK_SCORE;
    if (canSpawnPterodactyl && this.random() < PTERODACTYL_SPAWN_CHANCE) {
      this.spawnPterodactyl(this.randomAltitude());
      return;
    }

    const kinds: CactusKind[] = ["small", "small", "tall", "group"];
    const kind = kinds[Math.floor(this.random() * kinds.length)];
    const size = OBSTACLE_SIZES[kind];

    const rect = {
      x: this.width,
      y: GROUND_TOP - size.h,
      w: size.w,
      h: size.h,
    };

    this.obstacles.push({
      id: createId("cactus"),
      kind,
      altitude: null,
      x: rect.x,
      y: rect.y,
      w: size.w,
      h: size.h,
      hitbox: shrinkRect(rect, { x: size.w * 0.11, y: size.h * 0.04 }),
      passed: false,
    });
  }

  private randomAltitude(): PterodactylAltitude {
    const r = this.random();
    if (r < 0.4) return "low";
    if (r < 0.75) return "mid";
    return "high";
  }

  private spawnPterodactyl(altitude: PterodactylAltitude): void {
    const { w, h } = PTERODACTYL_SIZE;
    const y = GROUND_TOP - h - PTERODACTYL_ALTITUDE_OFFSETS[altitude];
    const rect = { x: this.width, y, w, h };
    this.obstacles.push({
      id: createId("ptero"),
      kind: "pterodactyl",
      altitude,
      x: rect.x,
      y: rect.y,
      w,
      h,
      hitbox: shrinkRect(rect, { x: w * 0.2, y: h * 0.32 }),
      passed: false,
    });
  }

  private hasCollision(): boolean {
    if (this.invincible) return false;
    const dino = this.dino.hitbox;
    for (const obstacle of this.obstacles) {
      if (obstacle.passed) continue;
      if (obstacle.x > dino.x + dino.w) continue; // still far right, cheap reject
      const b = obstacle.hitbox;
      if (
        dino.x < b.x + b.w &&
        dino.x + dino.w > b.x &&
        dino.y < b.y + b.h &&
        dino.y + dino.h > b.y
      ) {
        return true;
      }
    }
    return false;
  }
}