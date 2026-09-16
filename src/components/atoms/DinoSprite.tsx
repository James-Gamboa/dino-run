import type { DinoPose } from "@/types/game";

/**
 * Original pixel-art dinosaur sprite, drawn from scratch (no Chrome assets).
 * The dino faces right — the direction the world scrolls from.
 * Rects are positioned on a 2px grid. The ducking pose uses a wider,
 * lower logical box (60x30); all other poses use 46x48.
 */

const VIEW_BOXES: Record<DinoPose, string> = {
  "run-1": "0 0 46 48",
  "run-2": "0 0 46 48",
  jump: "0 0 46 48",
  duck: "0 0 60 30",
  dead: "0 0 46 48",
};

const RECTS: Record<DinoPose, Array<[number, number, number, number]>> = {
  "run-1": [
    // tail
    [2, 12, 4, 4],
    [4, 10, 6, 6],
    // body
    [10, 8, 18, 16],
    // head + jaw
    [24, 0, 14, 10],
    [24, 10, 12, 4],
    // eye
    [31, 2, 3, 3],
    // arm
    [20, 14, 4, 6],
    // legs (standing together)
    [14, 24, 6, 18],
    [24, 24, 6, 18],
  ],
  "run-2": [
    [2, 12, 4, 4],
    [4, 10, 6, 6],
    [10, 8, 18, 16],
    [24, 0, 14, 10],
    [24, 10, 12, 4],
    [31, 2, 3, 3],
    [20, 14, 4, 6],
    // legs (mid-stride)
    [10, 26, 6, 12],
    [26, 20, 6, 14],
  ],
  jump: [
    [2, 8, 4, 4],
    [4, 6, 6, 6],
    [10, 8, 18, 16],
    [24, 0, 14, 10],
    [24, 10, 12, 4],
    [31, 2, 3, 3],
    [20, 12, 4, 8],
    // legs tucked back
    [10, 26, 8, 6],
    [24, 24, 8, 6],
  ],
  duck: [
    // tail
    [2, 14, 4, 6],
    // body (stretched low)
    [6, 12, 34, 12],
    // head + jaw (forward, lowered)
    [36, 2, 16, 10],
    [36, 10, 14, 4],
    // eye
    [46, 3, 3, 3],
    // arm
    [10, 20, 4, 6],
    // legs folded under
    [8, 24, 8, 6],
    [20, 24, 8, 6],
  ],
  dead: [
    [2, 12, 4, 4],
    [4, 10, 6, 6],
    [10, 8, 18, 16],
    [24, 0, 14, 10],
    [24, 10, 12, 4],
    // X eye
    [30, 1, 5, 1],
    [30, 5, 5, 1],
    [32, 2, 1, 3],
    [20, 14, 4, 6],
    // legs splayed
    [10, 26, 4, 16],
    [26, 26, 4, 16],
  ],
};

export interface DinoSpriteProps {
  pose: DinoPose;
  className?: string;
}

export function DinoSprite({ pose, className }: DinoSpriteProps) {
  return (
    <svg
      viewBox={VIEW_BOXES[pose]}
      className={className}
      aria-hidden="true"
      shapeRendering="crispEdges"
      role="presentation"
    >
      {RECTS[pose].map(([x, y, w, h], i) => (
        <rect
          key={`${pose}-${i}`}
          x={x}
          y={y}
          width={w}
          height={h}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}