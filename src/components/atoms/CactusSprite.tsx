import type { CactusKind } from "@/types/game";

/**
 * Original pixel-art cactus sprites, drawn from scratch (no Chrome assets).
 * Each variant draws inside its own logical box (viewBox), which matches
 * the sizes declared in lib/game/constants.ts.
 */

const LAYOUTS: Record<
  CactusKind,
  { viewBox: [number, number]; rects: Array<[number, number, number, number]> }
> = {
  small: {
    viewBox: [30, 44],
    rects: [
      [10, 18, 12, 16], // trunk
      [8, 20, 16, 10], // top
      [4, 28, 8, 6], // left arm
      [18, 26, 8, 6], // right arm
    ],
  },
  tall: {
    viewBox: [40, 62],
    rects: [
      [12, 34, 16, 22], // trunk
      [10, 30, 20, 10], // top
      [4, 40, 8, 7], // left arm
      [28, 36, 8, 7], // right arm
    ],
  },
  group: {
    viewBox: [68, 46],
    rects: [
      [4, 26, 10, 14], // left cactus base
      [4, 20, 12, 10], // left cactus top
      [30, 18, 12, 22], // center (tallest)
      [28, 16, 16, 10], // center top
      [54, 28, 10, 12], // right cactus base
      [52, 22, 14, 10], // right cactus top
      [16, 32, 6, 6], // arm 1
      [18, 40, 6, 4], // arm 1 vertical
      [42, 30, 6, 6], // arm 2
      [34, 34, 6, 6], // arm 3
    ],
  },
};

export interface CactusSpriteProps {
  kind: CactusKind;
  className?: string;
}

export function CactusSprite({ kind, className }: CactusSpriteProps) {
  const { viewBox, rects } = LAYOUTS[kind];
  const [w, h] = viewBox;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      aria-hidden="true"
      shapeRendering="crispEdges"
      role="presentation"
    >
      {rects.map(([x, y, rw, rh], i) => (
        <rect
          key={`${kind}-${i}`}
          x={x}
          y={y}
          width={rw}
          height={rh}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}