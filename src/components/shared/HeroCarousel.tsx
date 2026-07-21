"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { SafeImage } from "@/components/shared/SafeImage";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  image: string;
  alt: string;
  title?: string;
  eyebrow?: string;
  description?: string;
  href?: string;
};

const AUTOPLAY_MS = 5000;

/** Cinematic split banner: editorial copy left, fading product visual right. */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (paused || reducedMotion || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, reducedMotion, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[index];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[390px] overflow-hidden rounded-[28px] bg-[#061428] shadow-[0_40px_90px_rgba(6,20,40,0.35)] sm:min-h-[440px] sm:rounded-[36px] lg:min-h-[480px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(55,145,255,0.25),transparent_52%),linear-gradient(135deg,#102b55_0%,#071a34_52%,#041022_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.55), transparent)," +
              "radial-gradient(1px 1px at 28% 42%, rgba(255,255,255,0.35), transparent)," +
              "radial-gradient(1.5px 1.5px at 62% 22%, rgba(255,255,255,0.45), transparent)," +
              "radial-gradient(1px 1px at 78% 58%, rgba(255,255,255,0.3), transparent)," +
              "radial-gradient(1px 1px at 88% 14%, rgba(255,255,255,0.4), transparent)," +
              "radial-gradient(1px 1px at 45% 12%, rgba(255,255,255,0.25), transparent)",
          }}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={index}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -18 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* Product visual occupies the right side and dissolves into the copy. */}
            <div
              className="absolute inset-y-0 right-0 w-[82%] sm:w-[72%]"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 28%, black 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 28%, black 100%)",
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_52%,rgba(105,185,255,0.32),transparent_58%)]" />
              <SafeImage
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                className="object-contain object-right p-7 drop-shadow-[0_28px_42px_rgba(0,0,0,0.48)] sm:p-10"
              />
            </div>

            {/* Extra overlay keeps text readable while preserving image fade. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,20,40,1)_0%,rgba(6,20,40,0.96)_34%,rgba(6,20,40,0.35)_66%,rgba(6,20,40,0.05)_100%)]"
            />

            <div className="relative z-[2] flex min-h-[390px] max-w-[72%] flex-col justify-center px-7 pb-16 pt-10 sm:min-h-[440px] sm:max-w-[52%] sm:px-10 lg:min-h-[480px] lg:px-12">
              <span className="mb-5 block h-0.5 w-12 bg-sky-300" aria-hidden />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300 sm:text-xs">
                {slide.eyebrow ?? "Padma Mineral Water"}
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight tracking-[-0.035em] text-white sm:text-3xl lg:text-[38px]">
                {slide.title ?? slide.alt}
              </h2>
              <p className="mt-3 max-w-sm text-xs leading-6 text-sky-100/75 sm:text-sm">
                {slide.description ??
                  "Reliable purification, genuine support, and safer water for everyday life."}
              </p>
              {slide.href && (
                <Link
                  href={slide.href}
                  className="mt-5 inline-flex w-fit items-center gap-2 border-b border-sky-300/70 pb-1 text-xs font-bold text-white transition hover:border-white"
                >
                  Explore product <span aria-hidden>→</span>
                </Link>
              )}
            </div>
          </motion.article>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous product"
              className="absolute bottom-5 right-16 z-10 grid size-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next product"
              className="absolute bottom-5 right-5 z-10 grid size-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-7 left-7 z-10 flex items-center gap-2 sm:left-10">
          {slides.map((s, i) => (
            <button
              key={`${s.image}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index
                  ? "w-7 bg-sky-300"
                  : "w-2 bg-white/35 hover:bg-white/60",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
