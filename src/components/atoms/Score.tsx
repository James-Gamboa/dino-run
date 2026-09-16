/**
 * A single numeric score, zero-padded to Chrome-Dino-like width.
 * Purely decorative (aria-hidden) — the HUD provides a live region.
 */
export interface ScoreProps {
  value: number;
  /** How many digits to pad to. */
  minDigits?: number;
  className?: string;
  "data-testid"?: string;
}

export function Score({ value, minDigits = 5, className = "", ...rest }: ScoreProps) {
  const padded = String(value).padStart(minDigits, "0");
  return (
    <span
      className={`font-pixel tabular-nums ${className}`}
      aria-hidden="true"
      {...rest}
    >
      {padded}
    </span>
  );
}