import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Reusable button with pixel styling and a visible focus ring.
 * React 19: ref is a plain prop (no forwardRef).
 */
export function Button({
  variant = "primary",
  className = "",
  ref,
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md border-2 px-4 py-2 " +
    "font-pixel text-xs uppercase tracking-wider transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dino-accent " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-dino-paper " +
    "disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary:
      "border-dino-ink bg-dino-ink text-dino-paper hover:bg-dino-ink/90 " +
      "active:translate-y-px",
    ghost:
      "border-dino-ink/40 bg-transparent text-dino-ink hover:bg-dino-ink/5",
  };

  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}