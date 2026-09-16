import type { ReactNode } from "react";

export interface PixelTextProps {
  children: ReactNode;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  /** @default {true} renders uppercase + pixel letter-spacing */
  pixel?: boolean;
  title?: string;
}

/**
 * Text styled with the pixel (arcade) typeface.
 * Decorative by default; mark aria-label on the parent for screen readers.
 */
export function PixelText({
  children,
  className = "",
  as: Tag = "span",
  pixel = true,
  title,
}: PixelTextProps) {
  return (
    <Tag
      className={`${pixel ? "font-pixel uppercase tracking-wider" : ""} ${className}`}
      title={title}
    >
      {children}
    </Tag>
  );
}