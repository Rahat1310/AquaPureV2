import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/shared/ProductCard";
import { CatalogSegmentTabs } from "@/features/catalog/components/CatalogSegmentTabs";
import { CatalogToolbar } from "@/features/catalog/components/CatalogToolbar";
import { CategoryFilters } from "@/features/catalog/components/CategoryFilters";
import { Pagination } from "@/features/catalog/components/Pagination";
import {
  getCatalogFacets,
  listProducts,
  parseCatalogSegment,
  resolveHubScope,
  type CatalogHub,
  type CatalogSegment,
} from "@/features/catalog/queries";
import { parseCatalogFilters } from "@/features/catalog/params";
import { toProductCardProps } from "@/features/catalog/presentation";
import { cn } from "@/lib/utils";

type CatalogHubViewProps = {
  hub: CatalogHub;
  title: string;
  subtitle: string;
  searchParams: Record<string, string | string[] | undefined>;
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

/**
 * Shared listing UI for /products and /accessories with segment pills.
 */
export async function CatalogHubView({
  hub,
  title,
  subtitle,
  searchParams,
}: CatalogHubViewProps) {
  const fallback: CatalogSegment = hub === "products" ? "all" : "family";
  const segment = parseCatalogSegment(searchParams.segment, fallback);
  const activeSegment =
    hub === "accessories" && (segment === "all" || segment === "mother")
      ? "family"
      : segment;

  const scope = await resolveHubScope(hub, activeSegment);
  if (!scope) {
    return (
      <div className="section-shell py-16 text-center">
        <p className="text-sm font-semibold text-slate-900">Catalog unavailable.</p>
      </div>
    );
  }

  const filters = parseCatalogFilters(searchParams);
  const [facets, result] = await Promise.all([
    getCatalogFacets(scope),
    listProducts(filters, scope),
  ]);

  const tabs = hub === "products" ? [...PRODUCT_TABS] : [...ACCESSORY_TABS];

  return (
    <div className="section-shell py-10 lg:py-14">
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

        <Suspense
          fallback={
            <div className="h-11 w-64 animate-pulse rounded-full bg-slate-100" />
          }
        >
          <CatalogSegmentTabs tabs={tabs} active={activeSegment} />
        </Suspense>
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

          {result.items.length === 0 ? (
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
                  ? "grid sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col",
              )}
            >
              {result.items.map((product) => (
                <ProductCard
                  key={product.id}
                  layout={filters.view}
                  {...toProductCardProps(product)}
                />
              ))}
            </div>
          )}

          {result.pageCount > 1 && (
            <div className="mt-10">
              <Pagination page={result.page} pageCount={result.pageCount} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
