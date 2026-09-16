"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameSnapshot } from "@/types/game";
import { DinoGameEngine, type WorldSize } from "@/lib/game/engine";
import { loadBestScore, saveBestScore } from "@/lib/game/scoring";
import { useGameLoop } from "./useGameLoop";

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

    const observer = new ResizeObserver(() => {
      engine.resize(getWorldSize(el));
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      engineRef.current = null;
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

  // Keyboard input (window-level, ignores auto-repeat).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (
        event.code === "Space" ||
        event.code === "ArrowUp" ||
        event.code === "Enter"
      ) {
        event.preventDefault();
        primaryAction();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [primaryAction]);

  // Pointer input on the world itself (tap to start / jump / restart).
  const onWorldPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Left button / touch only; ignore right-click.
      if (event.button !== 0) return;
      primaryAction();
    },
    [primaryAction],
  );

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
    actions: { jump, restart },
  };
}