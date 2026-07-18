import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Soft blue background with top/bottom borders — for alternating homepage bands. */
  muted?: boolean;
  /** When false, children render directly without the max-width shell. */
  shell?: boolean;
  shellClassName?: string;
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
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "py-16 md:py-24",
        muted && "border-y border-blue-100 bg-[#f7faff]",
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
