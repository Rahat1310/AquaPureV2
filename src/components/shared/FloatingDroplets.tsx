"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface Droplet {
  id: number;
  left: number; // percentage
  size: number; // pixels
  duration: number; // seconds
  delay: number; // seconds
  xDrift: number; // horizontal drift range
  opacity: number;
}

export function FloatingDroplets() {
  const shouldReduceMotion = useReducedMotion();
  const [droplets, setDroplets] = useState<Droplet[]>([]);

  useEffect(() => {
    // Generate static config on client to avoid server-client mismatch
    const config: Droplet[] = [
      { id: 1, left: 8, size: 14, duration: 22, delay: 0, xDrift: 15, opacity: 0.35 },
      { id: 2, left: 18, size: 24, duration: 28, delay: 4, xDrift: 25, opacity: 0.25 },
      { id: 3, left: 29, size: 18, duration: 20, delay: 2, xDrift: -20, opacity: 0.4 },
      { id: 4, left: 42, size: 12, duration: 25, delay: 7, xDrift: 10, opacity: 0.38 },
      { id: 5, left: 53, size: 28, duration: 30, delay: 1, xDrift: -30, opacity: 0.2 },
      { id: 6, left: 64, size: 16, duration: 18, delay: 5, xDrift: 15, opacity: 0.35 },
      { id: 7, left: 76, size: 20, duration: 26, delay: 3, xDrift: -25, opacity: 0.3 },
      { id: 8, left: 87, size: 15, duration: 24, delay: 9, xDrift: 20, opacity: 0.38 },
      { id: 9, left: 95, size: 22, duration: 29, delay: 6, xDrift: -18, opacity: 0.28 },
    ];
    setDroplets(config);
  }, []);

  if (droplets.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
      {droplets.map((d) => {
        if (shouldReduceMotion) {
          // If prefers-reduced-motion is enabled, render droplets as static items at a fixed position
          return (
            <div
              key={d.id}
              className="absolute text-sky-400"
              style={{
                left: `${d.left}%`,
                top: `${40 + (d.id * 8) % 50}%`,
                width: d.size,
                height: d.size,
                opacity: d.opacity,
              }}
            >
              <DropletIcon />
            </div>
          );
        }

        return (
          <motion.div
            key={d.id}
            className="absolute text-sky-400"
            style={{
              left: `${d.left}%`,
              top: 0,
              bottom: 0,
              width: d.size,
              height: "100%",
              opacity: d.opacity,
              willChange: "transform",
            }}
            initial={{ y: "105%", x: 0 }}
            animate={{
              y: "-15%",
              x: [0, d.xDrift, -d.xDrift, 0],
            }}
            transition={{
              y: {
                duration: d.duration,
                repeat: Infinity,
                ease: "linear",
                delay: d.delay,
              },
              x: {
                duration: d.duration * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: d.delay,
              },
            }}
          >
            {/* The actual droplet is placed at the top of this full-height container */}
            <div style={{ width: d.size, height: d.size }}>
              <DropletIcon />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function DropletIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-full w-full transform rotate-180"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}
