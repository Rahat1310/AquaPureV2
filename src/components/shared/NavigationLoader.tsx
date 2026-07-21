"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function shouldHandleLink(anchor: HTMLAnchorElement, event: MouseEvent) {
  if (isModifiedClick(event)) return false;
  if (event.button !== 0) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash === window.location.hash
    ) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}

function NavigationLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    setLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Safety: never leave the spinner up forever
    timeoutRef.current = setTimeout(() => setLoading(false), 10000);
  }, []);

  useEffect(() => {
    stop();
  }, [pathname, searchParams, stop]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (!shouldHandleLink(anchor, event)) return;
      start();
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [start]);

  return (
    <>
      {/* Top progress bar */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] overflow-hidden transition-opacity duration-200",
          loading ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className={cn(
            "h-full w-1/3 rounded-r-full bg-gradient-to-r from-primary via-sky-400 to-primary shadow-[0_0_12px_rgba(27,79,209,0.55)]",
            loading && "animate-[nav-progress_1.1s_ease-in-out_infinite]",
          )}
        />
      </div>

      {/* Center spinner overlay */}
      <div
        role="status"
        aria-live="polite"
        aria-busy={loading}
        className={cn(
          "fixed inset-0 z-[9998] grid place-items-center bg-white/45 backdrop-blur-[2px] transition-opacity duration-200",
          loading
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-6 py-5 shadow-[0_18px_50px_rgba(25,65,130,0.14)] backdrop-blur-xl">
          <span
            aria-hidden
            className="size-9 animate-spin rounded-full border-[3px] border-sky-100 border-t-primary"
          />
          <span className="text-xs font-semibold tracking-wide text-slate-600">
            Loading…
          </span>
        </div>
        <span className="sr-only">Loading page</span>
      </div>
    </>
  );
}

/** Site-wide navigation feedback for Next.js client-side link clicks. */
export function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <NavigationLoaderInner />
    </Suspense>
  );
}
