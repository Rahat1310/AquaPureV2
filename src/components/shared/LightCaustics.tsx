"use client";

import { motion, useReducedMotion } from "framer-motion";

export function LightCaustics() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    // Return static blur background when prefers-reduced-motion is active
    return (
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-200/40 to-blue-200/25 blur-3xl opacity-40 z-0 pointer-events-none select-none"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Outer rotating caustics layer */}
      <motion.div
        className="absolute inset-[-20%] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(27, 79, 209, 0.07) 40%, rgba(56, 189, 248, 0.02) 70%, transparent 100%)",
          willChange: "transform, opacity",
        }}
        animate={{
          scale: [1, 1.15, 0.95, 1.1, 1],
          rotate: [0, 90, 180, 270, 360],
          opacity: [0.35, 0.55, 0.4, 0.6, 0.35],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Inner counter-rotating caustics layer */}
      <motion.div
        className="absolute inset-[-10%] rounded-full blur-2xl"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(27, 79, 209, 0.05) 50%, transparent 100%)",
          willChange: "transform, opacity",
        }}
        animate={{
          scale: [1, 0.9, 1.12, 0.93, 1],
          rotate: [360, 270, 180, 90, 0],
          opacity: [0.25, 0.45, 0.3, 0.4, 0.25],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
