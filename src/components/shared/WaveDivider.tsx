"use client";

import { useReducedMotion } from "framer-motion";

export function WaveDivider() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div 
      className="relative w-full overflow-hidden select-none pointer-events-none bg-white" 
      style={{ height: "48px" }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes wave-forward {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes wave-backward {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .wave-animate-front {
          animation: wave-forward 25s linear infinite;
        }
        .wave-animate-back {
          animation: wave-backward 35s linear infinite;
        }
      `}</style>
      
      {/* Wrapper of 200% width to allow seamless -50% translateX loops */}
      <div 
        className="absolute inset-0 flex" 
        style={{ 
          width: "200%",
          willChange: "transform",
        }}
      >
        {/* Back Wave: light blue tint transitioning */}
        <svg
          viewBox="0 0 2400 120"
          preserveAspectRatio="none"
          className={`absolute inset-y-0 left-0 w-full h-full fill-current text-blue-50/70 z-0 ${
            shouldReduceMotion ? "" : "wave-animate-back"
          }`}
        >
          <path d="M0,70 Q300,110 600,70 T1200,70 Q1500,110 1800,70 T2400,70 L2400,120 L0,120 Z" />
        </svg>

        {/* Front Wave: matches the #f7faff bg of the section below */}
        <svg
          viewBox="0 0 2400 120"
          preserveAspectRatio="none"
          className={`absolute inset-y-0 left-0 w-full h-full fill-current text-[#f7faff] z-10 ${
            shouldReduceMotion ? "" : "wave-animate-front"
          }`}
        >
          <path d="M0,60 Q300,100 600,60 T1200,60 Q1500,100 1800,60 T2400,60 L2400,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  );
}
