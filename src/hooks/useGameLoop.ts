import { useEffect, useRef } from "react";

/** Maximum single step (ms) — prevents tunneling after tab switches. */
const MAX_STEP_MS = 50;

/**
 * Generic requestAnimationFrame loop. Calls the callback with the
 * delta time (clamped) every frame while `running` is true.
 */
export function useGameLoop(
  callback: (dtMs: number, elapsedMs: number) => void,
  running: boolean,
): void {
  const callbackRef = useRef(callback);

  // Keep the latest callback without recreating the rAF loop on every render.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!running) return;
    let rafId = 0;
    let last = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = Math.min(now - last, MAX_STEP_MS);
      last = now;
      elapsed += dt;
      callbackRef.current(dt, elapsed);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [running]);
}