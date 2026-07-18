"use client";

import Link from "next/link";
import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RippleCardProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

interface RippleInstance {
  id: number;
  x: number;
  y: number;
}

export function RippleCard({ href, className, children }: RippleCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [ripples, setRipples] = useState<RippleInstance[]>([]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Spawn ripple at coordinates
    setRipples((prev) => [...prev, { id: Date.now(), x, y }]);
  };

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  // If reduced motion is active, disable standard lift and shadow changes
  const finalClass = cn(
    className,
    shouldReduceMotion && "hover:translate-y-0 hover:shadow-[0_16px_50px_rgba(25,65,130,0.07)]"
  );

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      className={cn("relative block", finalClass)}
    >
      {/* Absolute overlay for ripple effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl select-none z-0">
        <AnimatePresence>
          {!shouldReduceMotion &&
            ripples.map((r) => (
              <motion.span
                key={r.id}
                style={{
                  position: "absolute",
                  left: r.x,
                  top: r.y,
                  x: "-50%",
                  y: "-50%",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(27, 79, 209, 0.16) 0%, rgba(27, 79, 209, 0.04) 50%, transparent 75%)",
                  willChange: "transform, opacity",
                }}
                initial={{ scale: 0, opacity: 0.85 }}
                animate={{ scale: 7.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                onAnimationComplete={() => removeRipple(r.id)}
              />
            ))}
        </AnimatePresence>
      </div>

      {/* Relative wrapper for the main card layout */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </Link>
  );
}
