import type {
  CloudState,
  DinoState,
  GamePhase,
  GameSnapshot,
  ObstacleKind,
  ObstacleState,
} from "@/types/game";
import {
  BASE_SPEED,
  CLOUD_COUNT,
  CLOUD_PARALLAX,
  DINO_H,
  DINO_W,
  GROUND_TOP,
  JUMP_VELOCITY,
  OBSTACLE_SIZES,
  SPAWN_GAP_MAX,
  SPAWN_GAP_MIN,
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
  /** Always-ticking clock used for idle animations (dino run cycle). */
  private clockMs = 0;
  /** Run clock: advances only while playing. */
  private runTimeMs = 0;
  private distancePx = 0;
  private speed: number = BASE_SPEED;

  private dino: DinoState;
  private obstacles: ObstacleState[] = [];
  private clouds: CloudState[] = [];

  /** Distance still to travel before the next obstacle spawns. */
  private nextSpawnDistance = 40;

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
      distance: this.distancePx,
      score: this.score,
      bestScore: this.bestScore,
      speed: this.speed,
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
    this.dino = {
      ...this.dino,
      vy: JUMP_VELOCITY,
      onGround: false,
    };
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
    this.speed = speedForElapsedMs(this.runTimeMs);
    const worldDx = this.speed * dt;

    this.distancePx += worldDx;
    this.groundOffset += worldDx;

    this.updateDino(dtMs);
    this.updateClouds(dt);
    this.moveObstacles(worldDx);

    if (this.hasCollision()) {
      this.bestScore = Math.max(this.bestScore, this.score);
      this.phaseValue = "gameover";
      this.dino = { ...this.dino, pose: "dead" };
      this.onGameOver?.(this.getSnapshot());
      return;
    }

    // Spawning is distance-driven so gaps stay consistent at any speed.
    this.nextSpawnDistance -= worldDx;
    if (this.nextSpawnDistance <= 0) {
      this.spawnObstacle();
      const minGap =
        this.speed > BASE_SPEED * 1.35 ? SPAWN_GAP_MIN * 0.8 : SPAWN_GAP_MIN;
      this.nextSpawnDistance =
        minGap + this.random() * (SPAWN_GAP_MAX - minGap);
    }
  }

  // --- Internals ------------------------------------------------------

  private get score(): number {
    return Math.floor(this.distancePx / 15);
  }

  private createDino(): DinoState {
    const rect = { x: 46, y: this.groundY, w: DINO_W, h: DINO_H };
    return {
      x: 46,
      y: this.groundY,
      vy: 0,
      onGround: true,
      pose: "run-1",
      hitbox: shrinkRect(rect, { x: DINO_W * 0.15, y: DINO_H * 0.1 }),
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
    const next = updateDinoPhysics(this.dino, dtMs);
    const runIndex = Math.floor(this.clockMs / 150) % 2 === 0;

    this.dino = {
      ...next,
      pose: next.onGround ? (runIndex ? "run-1" : "run-2") : "jump",
      hitbox: shrinkRect(
        { x: next.x, y: next.y, w: DINO_W, h: DINO_H },
        { x: DINO_W * 0.15, y: DINO_H * 0.1 },
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

  private moveObstacles(worldDx: number): void {
    for (const obstacle of this.obstacles) {
      obstacle.x -= worldDx;
      obstacle.hitbox.x -= worldDx;
      if (!obstacle.passed && obstacle.x + obstacle.w < 46) {
        obstacle.passed = true;
      }
    }
    // Drop obstacles that fully exited the left edge.
    this.obstacles = this.obstacles.filter((o) => o.x + o.w >= -80);
  }

  private spawnObstacle(): void {
    const kinds: ObstacleKind[] = ["small", "small", "tall", "group"];
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
      x: rect.x,
      y: rect.y,
      w: size.w,
      h: size.h,
      hitbox: shrinkRect(rect, {
        x: size.w * 0.11,
        y: size.h * 0.04,
      }),
      passed: false,
    });
  }

  private hasCollision(): boolean {
    const dino = this.dino.hitbox;
    for (const obstacle of this.obstacles) {
      if (obstacle.passed) continue;
      if (obstacle.x > 46 + DINO_W) continue; // still far right, cheap reject
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