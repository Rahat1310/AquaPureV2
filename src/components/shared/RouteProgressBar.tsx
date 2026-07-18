"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * RouteProgressBar — YouTube/GitHub-style top-of-page loading indicator.
 *
 * Strategy:
 *  • Listens for pathname changes via `usePathname`.
 *  • On change: shows bar, animates width to ~85% (faked progress).
 *  • After a short settle delay, completes to 100% then fades out.
 *  • Uses Framer Motion for smooth width + opacity transitions.
 *  • Fixed position, z-index 9999 — never participates in layout.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the very first render (initial page load).
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Clear any in-flight timers.
    if (timerRef.current) clearTimeout(timerRef.current);
    if (completeRef.current) clearTimeout(completeRef.current);

    // Start the bar.
    setProgress(0);
    setVisible(true);

    // Animate to ~85% quickly — simulates route fetching.
    timerRef.current = setTimeout(() => setProgress(85), 50);

    // After 600ms, jump to 100% and fade out.
    completeRef.current = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setVisible(false), 350);
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (completeRef.current) clearTimeout(completeRef.current);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="progress-bar"
          className="route-progress-bar"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: progress / 100, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        />
      )}
    </AnimatePresence>
  );
}
