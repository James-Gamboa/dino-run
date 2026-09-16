import type { Rect } from "@/types/game";

/**
 * AABB overlap test.
 *
 * Chrome Dino uses slightly shrunken hitboxes so the player does not die
 * on corner-grazing contact; we do the same here via `shrink` margins.
 */
export function aabbOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * Returns a shrunken copy of the rect, removing an inset margin in px.
 * Used to build fair hitboxes from sprite boxes.
 */
export function shrinkRect(rect: Rect, inset: { x: number; y: number }): Rect {
  return {
    x: rect.x + inset.x,
    y: rect.y + inset.y,
    w: Math.max(0, rect.w - inset.x * 2),
    h: Math.max(0, rect.h - inset.y * 2),
  };
}