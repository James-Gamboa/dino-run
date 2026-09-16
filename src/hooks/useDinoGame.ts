"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  GameSnapshot,
  PterodactylAltitude,
  ThrottleDirection,
} from "@/types/game";
import { DinoGameEngine, type WorldSize } from "@/lib/game/engine";
import { loadBestScore, saveBestScore } from "@/lib/game/scoring";
import { useGameLoop } from "./useGameLoop";

declare global {
  interface Window {
    /**
     * Dev-only bridge for deterministic playwright tests. Present only
     * when NODE_ENV !== "production". Never used by the game itself.
     */
    __dinoTest?: {
      forcePterodactyl: (altitude: PterodactylAltitude) => void;
      setScore: (score: number) => void;
      clearObstacles: () => void;
      setSpawning: (enabled: boolean) => void;
      setInvincible: (invincible: boolean) => void;
      getSnapshot: () => GameSnapshot | null;
      duck: (down: boolean) => void;
      throttle: (dir: ThrottleDirection) => void;
    };
  }
}

function getWorldSize(el: HTMLDivElement): WorldSize {
  return { width: el.clientWidth, height: el.clientHeight };
}

/**
 * Orchestrates one game session: owns the engine instance, feeds it
 * input (keyboard + pointer), and mirrors its snapshot into React state.
 */
export function useDinoGame() {
  const worldRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<DinoGameEngine | null>(null);
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [bestScore, setBestScore] = useState(0);

  const leftHeld = useRef(false);
  const rightHeld = useRef(false);

  // Keep the throttle direction in sync with whichever arrow is held.
  const applyThrottle = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const dir: ThrottleDirection = rightHeld.current
      ? 1
      : leftHeld.current
        ? -1
        : 0;
    engine.setThrottle(dir);
  }, []);

  // Create the engine once the container is measurable; keep it in sync
  // with container resizes (rotation / window changes).
  useEffect(() => {
    const el = worldRef.current;
    if (!el) return;

    const stored = loadBestScore();
    setBestScore(stored);

    const engine = new DinoGameEngine(getWorldSize(el), stored, {
      onGameOver: (finalSnapshot) => {
        setBestScore(finalSnapshot.bestScore);
        saveBestScore(finalSnapshot.bestScore);
      },
    });
    engineRef.current = engine;
    setSnapshot(engine.getSnapshot());

    if (process.env.NODE_ENV !== "production") {
      window.__dinoTest = {
        forcePterodactyl: (altitude) =>
          engineRef.current?.debugForcePterodactyl(altitude),
        setScore: (score) => engineRef.current?.debugSetScore(score),
        clearObstacles: () => engineRef.current?.debugClearObstacles(),
        setSpawning: (enabled) => engineRef.current?.debugSetSpawning(enabled),
        setInvincible: (invincible) =>
          engineRef.current?.debugSetInvincible(invincible),
        getSnapshot: () => engineRef.current?.getSnapshot() ?? null,
        duck: (down) => engineRef.current?.setDucking(down),
        throttle: (dir) => engineRef.current?.setThrottle(dir),
      };
    }

    const observer = new ResizeObserver(() => {
      engine.resize(getWorldSize(el));
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      engineRef.current = null;
      delete window.__dinoTest;
    };
  }, []);

  // Game loop: always running so idle animations (run cycle) stay alive.
  useGameLoop((dtMs) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.update(dtMs);
    setSnapshot(engine.getSnapshot());
  }, true);

  /** Space/↑/Enter/tap: context-aware primary action, phase read live. */
  const primaryAction = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    switch (engine.phase) {
      case "idle":
        engine.start();
        break;
      case "playing":
        engine.jump();
        break;
      case "gameover":
        engine.restart();
        break;
    }
  }, []);

  // Keyboard input (window-level, ignores auto-repeat). Arrow keys are
  // held state: ↓ ducks / fast-falls, ←/→ brake / accelerate.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      switch (event.code) {
        case "Space":
        case "ArrowUp":
        case "Enter":
          event.preventDefault();
          primaryAction();
          break;
        case "ArrowDown":
          event.preventDefault();
          engineRef.current?.setDucking(true);
          break;
        case "ArrowLeft":
          event.preventDefault();
          leftHeld.current = true;
          applyThrottle();
          break;
        case "ArrowRight":
          event.preventDefault();
          rightHeld.current = true;
          applyThrottle();
          break;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowDown":
          event.preventDefault();
          engineRef.current?.setDucking(false);
          break;
        case "ArrowLeft":
          leftHeld.current = false;
          applyThrottle();
          break;
        case "ArrowRight":
          rightHeld.current = false;
          applyThrottle();
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [primaryAction, applyThrottle]);

  // Pointer input on the world itself (tap to start / jump / restart).
  const onWorldPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Left button / touch only; ignore right-click.
      if (event.button !== 0) return;
      primaryAction();
    },
    [primaryAction],
  );

  const duck = useCallback((down: boolean) => {
    engineRef.current?.setDucking(down);
  }, []);

  const throttle = useCallback((dir: ThrottleDirection) => {
    engineRef.current?.setThrottle(dir);
  }, []);

  const jump = useCallback(() => {
    engineRef.current?.jump();
  }, []);

  const restart = useCallback(() => {
    engineRef.current?.restart();
  }, []);

  return {
    worldRef,
    snapshot,
    bestScore,
    onWorldPointerDown,
    actions: { jump, restart, duck, throttle },
  };
}