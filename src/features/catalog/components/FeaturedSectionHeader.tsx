"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type FeaturedSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  viewAllLabel?: string;
  className?: string;
};

export function FeaturedSectionHeader({
  eyebrow,
  title,
  description,
  href,
  viewAllLabel = "View all products",
  className,
}: FeaturedSectionHeaderProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("relative", className)}
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <p className="relative inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
          <span
            aria-hidden
            className="featured-pulse absolute -inset-x-3 -inset-y-1 rounded-full bg-primary/10"
          />
          <span className="relative">{eyebrow}</span>
        </p>
        <h2 className="relative mt-3 text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>

      <div className="mt-5 flex justify-end sm:absolute sm:right-0 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2">
        <Link
          href={href}
          className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-[0_10px_28px_rgba(27,79,209,0.1)] transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_14px_34px_rgba(27,79,209,0.16)] sm:text-base"
        >
          {viewAllLabel}
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5 sm:size-5" />
        </Link>
      </div>
    </motion.div>
  );
}
