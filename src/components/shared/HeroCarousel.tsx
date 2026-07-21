"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IBM_Plex_Mono, Outfit } from "next/font/google";
import { useCallback, useEffect, useRef, useState } from "react";

import { SafeImage } from "@/components/shared/SafeImage";
import { cn } from "@/lib/utils";

const display = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const label = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export type HeroSlide = {
  image: string;
  alt: string;
  title?: string;
  eyebrow?: string;
  description?: string;
  href?: string;
};

const AUTOPLAY_MS = 5000;

function splitTitle(title: string) {
  const match = title.match(/^(\d+\s*GPD)\s+(.+)$/i);
  if (match) return { capacity: match[1], name: match[2] };
  return { capacity: null as string | null, name: title };
}

/**
 * Light split banner. Pure white stage so product photos with white
 * backgrounds blend — editorial typography on the copy side.
 */
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
  const title = slide.title ?? slide.alt;
  const { capacity, name } = splitTitle(title);
  const slideNo = String(index + 1).padStart(2, "0");

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[390px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-[#ffffff] shadow-[0_24px_60px_rgba(25,65,130,0.08)] sm:min-h-[440px] sm:rounded-[36px] lg:min-h-[480px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[48%] bg-gradient-to-r from-sky-50/70 via-sky-50/20 to-transparent"
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={index}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <div className="absolute inset-y-0 right-0 w-[78%] bg-[#ffffff] sm:w-[70%]">
              <motion.div
                className="absolute inset-0"
                initial={reducedMotion ? false : { opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <SafeImage
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  className="object-contain object-right p-6 sm:p-9"
                />
              </motion.div>
            </div>

            <div
              className={cn(
                display.className,
                "relative z-[2] flex min-h-[390px] max-w-[60%] flex-col justify-center px-7 pb-16 pt-10 sm:min-h-[440px] sm:max-w-[50%] sm:px-10 lg:min-h-[480px] lg:max-w-[48%] lg:px-12",
              )}
            >
              {/* Giant ghost index */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-4 top-6 select-none text-[88px] font-bold leading-none tracking-[-0.06em] text-slate-950/[0.04] sm:left-6 sm:top-8 sm:text-[120px] lg:text-[140px]"
              >
                {slideNo}
              </span>

              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className={cn(label.className, "flex items-center gap-3")}>
                  <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-primary sm:text-[11px]">
                    <span className="inline-block h-px w-6 bg-primary/80" aria-hidden />
                    {slide.eyebrow ?? "Padma Mineral Water"}
                  </span>
                </div>

                {capacity && (
                  <p
                    className={cn(
                      label.className,
                      "mt-5 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 sm:text-xs",
                    )}
                  >
                    {capacity}
                    <span className="mx-2 text-primary/40">/</span>
                    <span className="tracking-[0.18em] text-slate-500">Series</span>
                  </p>
                )}

                <h2 className="mt-2 max-w-[16ch] text-[1.65rem] font-semibold leading-[1.12] tracking-[-0.04em] text-slate-950 sm:text-[2rem] lg:text-[2.35rem]">
                  {name.split(" ").map((word, i, arr) => {
                    const isAccent =
                      /^(heron|ro|ro\+?t?\d*|alkaline|uv)$/i.test(word.replace(/[()]/g, ""));
                    const isLast = i === arr.length - 1;
                    return (
                      <span key={`${word}-${i}`}>
                        <span
                          className={cn(
                            isAccent &&
                              "bg-gradient-to-r from-primary to-sky-500 bg-clip-text font-bold text-transparent",
                          )}
                        >
                          {word}
                        </span>
                        {!isLast ? " " : null}
                      </span>
                    );
                  })}
                </h2>

                <p className="mt-4 max-w-[28ch] text-[13px] font-normal leading-6 tracking-[-0.01em] text-slate-500 sm:text-sm sm:leading-7">
                  {slide.description ??
                    "Reliable purification, genuine support, and safer water for everyday life."}
                </p>

                {slide.href && (
                  <Link
                    href={slide.href}
                    className="group mt-7 inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-[-0.02em] text-slate-900"
                  >
                    <span className="relative">
                      Explore product
                      <span
                        aria-hidden
                        className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-primary transition duration-300 group-hover:scale-x-110"
                      />
                    </span>
                    <span className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-primary shadow-sm transition duration-300 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-white">
                      <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.article>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous product"
              className="absolute bottom-5 right-16 z-10 grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next product"
              className="absolute bottom-5 right-5 z-10 grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-7 left-7 z-10 flex items-center gap-2.5 sm:left-10">
          <span
            className={cn(
              label.className,
              "mr-1 text-[10px] font-medium tabular-nums tracking-wider text-slate-400",
            )}
          >
            {slideNo}
            <span className="text-slate-300"> / </span>
            {String(slides.length).padStart(2, "0")}
          </span>
          {slides.map((s, i) => (
            <button
              key={`${s.image}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index
                  ? "w-8 bg-primary"
                  : "w-1.5 bg-slate-300 hover:bg-slate-400",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
