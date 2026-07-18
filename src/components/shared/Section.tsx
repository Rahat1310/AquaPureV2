import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Soft blue background with top/bottom borders — for alternating homepage bands. */
  muted?: boolean;
  /** When false, children render directly without the max-width shell. */
  shell?: boolean;
  shellClassName?: string;
  /** Disable the top border, useful when placing a custom WaveDivider above it. */
  noTopBorder?: boolean;
}

/**
 * Shared homepage section wrapper.
 * Default vertical rhythm: py-16 (mobile) / md:py-24 (desktop).
 */
export function Section({
  children,
  className,
  muted = false,
  shell = true,
  shellClassName,
  noTopBorder = false,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "py-16 md:py-24 relative",
        muted && "bg-[#f7faff]",
        muted && !noTopBorder && "border-t border-blue-100",
        muted && "border-b border-blue-100",
        className,
      )}
      {...props}
    >
      {shell ? (
        <div className={cn("section-shell", shellClassName)}>{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
