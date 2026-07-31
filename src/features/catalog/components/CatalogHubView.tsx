"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import { ChevronRight, SlidersHorizontal, Loader2 } from "lucide-react";

import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { fetchCatalogHub } from "@/features/catalog/actions";
import { CatalogSegmentTabs } from "@/features/catalog/components/CatalogSegmentTabs";
import { CatalogToolbar } from "@/features/catalog/components/CatalogToolbar";
import { CategoryFilters } from "@/features/catalog/components/CategoryFilters";
import type { CatalogHubPayload } from "@/features/catalog/load-hub";
import type { CatalogHub, CatalogSegment } from "@/features/catalog/queries";
import { toProductCardProps } from "@/features/catalog/presentation";
import { cn } from "@/lib/utils";

type CatalogHubViewProps = {
  hub: CatalogHub;
  title: string;
  subtitle: string;
  /** Default (empty-query) payload from the static/ISR server render */
  initial: CatalogHubPayload;
};

const PRODUCT_TABS = [
  { key: "all", label: "All" },
  { key: "family", label: "Family" },
  { key: "mother", label: "Mother & Child" },
  { key: "office", label: "Office" },
] as const;

const ACCESSORY_TABS = [
  { key: "family", label: "Family" },
  { key: "office", label: "Office" },
] as const;

const SEGMENT_LABELS: Record<CatalogSegment, string> = {
  all: "All",
  family: "Family",
  mother: "Mother & Child",
  office: "Office",
};

function searchParamsToRecord(
  sp: URLSearchParams,
): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  sp.forEach((value, key) => {
    const existing = out[key];
    if (existing === undefined) out[key] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else out[key] = [existing, value];
  });
  return out;
}

/**
 * Shared listing UI for /products and /accessories.
 * Server passes the default listing (`initial`); URL filters hydrate via
 * a server action so the route itself can stay static / ISR.
 */
function CatalogHubViewInner({
  hub,
  title,
  subtitle,
  initial,
}: CatalogHubViewProps) {
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const [payload, setPayload] = useState<CatalogHubPayload>(initial);
  const [accumulatedItems, setAccumulatedItems] = useState(initial.result.items);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    // Default URL — keep SSR/ISR payload (no extra round-trip)
    if (!queryKey) {
      setPayload(initial);
      setAccumulatedItems(initial.result.items);
      return;
    }

    const record = searchParamsToRecord(searchParams);
    startTransition(async () => {
      const next = await fetchCatalogHub(hub, record);
      setPayload(next);
      setAccumulatedItems(next.result.items);
    });
  }, [queryKey, hub, initial, searchParams]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = payload.result.page + 1;
    const record = searchParamsToRecord(searchParams);
    record.page = String(nextPage);
    
    try {
      const next = await fetchCatalogHub(hub, record);
      setPayload(next);
      setAccumulatedItems((prev) => [...prev, ...next.result.items]);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const tabs = useMemo(
    () => (hub === "products" ? [...PRODUCT_TABS] : [...ACCESSORY_TABS]),
    [hub],
  );

  const { activeSegment, filters, facets, result, scopeOk } = payload;

  if (!scopeOk) {
    return (
      <div className="section-shell py-16 text-center">
        <p className="text-sm font-semibold text-slate-900">Catalog unavailable.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "section-shell py-10 lg:py-14",
        isPending && "opacity-70 transition-opacity",
      )}
    >
      <nav
        className="flex items-center gap-1.5 text-xs font-medium text-slate-500"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-slate-900">{title}</span>
      </nav>

      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">{subtitle}</p>
        </div>

        <CatalogSegmentTabs tabs={tabs} active={activeSegment} />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-500">
        Showing{" "}
        <span className="text-primary">{SEGMENT_LABELS[activeSegment]}</span> ·{" "}
        {result.total} product{result.total === 1 ? "" : "s"}
        {hub === "products" ? (
          <span className="font-normal text-slate-400">
            {" "}
            — use the tabs or sidebar filters to narrow results
          </span>
        ) : null}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div>
          <details className="lg:hidden">
            <summary className="mb-4 flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-bold text-slate-900">
              <SlidersHorizontal className="size-4 text-primary" /> Filters
            </summary>
            <CategoryFilters facets={facets} selected={filters} />
          </details>
          <div className="hidden lg:block">
            <CategoryFilters facets={facets} selected={filters} />
          </div>
        </div>

        <div>
          <CatalogToolbar
            total={result.total}
            page={result.page}
            pageSize={result.pageSize}
            sort={filters.sort}
            view={filters.view}
          />

          {accumulatedItems.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-blue-200 bg-white p-12 text-center">
              <p className="text-sm font-semibold text-slate-900">
                No products in this segment.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try another tab or clear your filters.
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "mt-6 gap-6",
                filters.view === "grid"
                  ? "grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3"
                  : "flex flex-col",
              )}
            >
              {accumulatedItems.map((product) => (
                <ProductCard
                  key={product.id}
                  layout={filters.view}
                  {...toProductCardProps(product)}
                />
              ))}
            </div>
          )}

          {payload.result.page < payload.result.pageCount && (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="min-w-[200px]"
              >
                {isLoadingMore && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isLoadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CatalogHubView(props: CatalogHubViewProps) {
  return (
    <Suspense
      fallback={
        <div className="section-shell py-10 lg:py-14">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-6 h-11 w-80 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      }
    >
      <CatalogHubViewInner {...props} />
    </Suspense>
  );
}
