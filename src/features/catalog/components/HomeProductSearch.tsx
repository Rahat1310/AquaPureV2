"use client";

import Link from "next/link";
import { Loader2, Search, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { SafeImage } from "@/components/shared/SafeImage";
import { Input } from "@/components/ui/input";
import type { ProductSearchHit } from "@/features/catalog/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;
/** Stable id — avoid useId() which can mismatch under Clerk SSR/hydration. */
const LISTBOX_ID = "home-product-search-listbox";

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

type SearchResponse = {
  results: ProductSearchHit[];
  q: string;
};

export function HomeProductSearch({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  const [results, setResults] = useState<ProductSearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [fetching, setFetching] = useState(false);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setError(null);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Debounced fetch with abort of stale requests
  useEffect(() => {
    const q = debouncedQuery.trim();

    abortRef.current?.abort();
    abortRef.current = null;

    if (q.length < MIN_CHARS) {
      startTransition(() => {
        setResults([]);
        setError(null);
        setFetching(false);
      });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setFetching(true);
    setError(null);

    const url = `/api/catalog/search?q=${encodeURIComponent(q)}&limit=8`;

    fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Search failed");
        return res.json() as Promise<SearchResponse>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        startTransition(() => {
          setResults(data.results);
          setOpen(true);
          setFetching(false);
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        startTransition(() => {
          setResults([]);
          setFetching(false);
          setError(err instanceof Error ? err.message : "Search failed");
        });
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const showPanel =
    open &&
    (query.trim().length >= MIN_CHARS || results.length > 0 || fetching || error);

  const isLoading = fetching || (pending && query.trim().length >= MIN_CHARS);

  return (
    <div ref={rootRef} className={cn("relative w-full max-w-xl", className)}>
      <label htmlFor="home-product-search" className="sr-only">
        Search products
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          id="home-product-search"
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={showPanel ? LISTBOX_ID : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Search purifiers, filters, brands…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0 || query.trim().length >= MIN_CHARS) {
              setOpen(true);
            }
          }}
          className="h-12 rounded-2xl border-blue-100 bg-white/90 pl-10 pr-10 shadow-[0_10px_30px_rgba(27,79,209,0.08)] backdrop-blur"
          suppressHydrationWarning
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Clear search"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <X className="size-4" />
            )}
          </button>
        )}
        {!query && isLoading && (
          <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {showPanel && (
        <div
          id={LISTBOX_ID}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_20px_50px_rgba(15,40,90,0.14)]"
        >
          {query.trim().length > 0 && query.trim().length < MIN_CHARS && (
            <p className="px-4 py-3 text-sm text-slate-500">
              Type at least {MIN_CHARS} characters to search.
            </p>
          )}

          {error && (
            <p className="px-4 py-3 text-sm text-rose-600">{error}</p>
          )}

          {!error &&
            query.trim().length >= MIN_CHARS &&
            !isLoading &&
            results.length === 0 && (
              <p className="px-4 py-3 text-sm text-slate-500">
                No products match &ldquo;{query.trim()}&rdquo;.
              </p>
            )}

          {results.length > 0 && (
            <ul className="max-h-[340px] overflow-y-auto py-1">
              {results.map((hit) => (
                <li key={hit.id} role="option">
                  <Link
                    href={`/product/${hit.slug}`}
                    className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-secondary"
                    onClick={() => setOpen(false)}
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                      {hit.image ? (
                        <SafeImage
                          src={hit.image}
                          alt=""
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <span className="grid size-full place-items-center text-[10px] font-bold text-slate-300">
                          N/A
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {hit.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {[hit.brand, hit.categoryName, hit.sku]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-primary">
                      {BDT.format(hit.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {results.length > 0 && (
            <p className="border-t border-blue-50 px-4 py-2 text-center text-[11px] font-medium text-slate-400">
              Showing top {results.length} match
              {results.length === 1 ? "" : "es"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
