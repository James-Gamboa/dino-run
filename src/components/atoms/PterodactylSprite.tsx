/**
 * Original pixel-art pterodactyl sprite, drawn from scratch (no Chrome
 * assets). It faces left — toward the dino it is flying at. The two poses
 * are the wing flap animation frames.
 */

export type PterodactylPose = "flap-up" | "flap-down";

const RECTS: Record<PterodactylPose, Array<[number, number, number, number]>> = {
  "flap-up": [
    // head + beak (left)
    [2, 8, 12, 10],
    // body
    [14, 10, 18, 12],
    // tail (right)
    [30, 12, 16, 4],
    // eye
    [5, 10, 3, 3],
    // wings raised
    [8, 0, 6, 8],
    [22, 0, 6, 10],
    // dangling foot
    [18, 22, 4, 6],
  ],
  "flap-down": [
    [2, 8, 12, 10],
    [14, 10, 18, 12],
    [30, 12, 16, 4],
    [5, 10, 3, 3],
    // wings lowered
    [8, 16, 6, 12],
    [22, 16, 6, 12],
    [18, 22, 4, 6],
  ],
};

export interface PterodactylSpriteProps {
  pose: PterodactylPose;
  className?: string;
}

export function PterodactylSprite({ pose, className }: PterodactylSpriteProps) {
  return (
    <svg
      viewBox="0 0 46 28"
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