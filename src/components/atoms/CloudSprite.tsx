/**
 * Simple decorative pixel cloud.
 */

export interface CloudSpriteProps {
  className?: string;
}

export function CloudSprite({ className }: CloudSpriteProps) {
  return (
    <svg
      viewBox="0 0 60 26"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <rect x="4" y="14" width="52" height="8" fill="currentColor" />
      <rect x="10" y="8" width="34" height="6" fill="currentColor" />
      <rect x="18" y="2" width="20" height="6" fill="currentColor" />
    </svg>
  );
}