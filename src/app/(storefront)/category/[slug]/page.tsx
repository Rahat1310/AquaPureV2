import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/shared/ProductCard";
import { CatalogToolbar } from "@/components/storefront/CatalogToolbar";
import { CategoryFilters } from "@/components/storefront/CategoryFilters";
import { Pagination } from "@/components/storefront/Pagination";
import {
  getCatalogFacets,
  listProducts,
  resolveCategoryScope,
} from "@/features/catalog/queries";
import { parseCatalogFilters } from "@/features/catalog/params";
import { toProductCardProps } from "@/features/catalog/presentation";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const scope = await resolveCategoryScope(slug);
  if (!scope) return { title: "Category not found" };

  const title = `${scope.current.name} Water Solutions`;
  const description =
    scope.current.description ??
    `Shop AquaPure ${scope.current.name.toLowerCase()} water purifiers and solutions with free installation and genuine warranty.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const rawSearch = await searchParams;

  const scope = await resolveCategoryScope(slug);
  if (!scope) notFound();

  const filters = parseCatalogFilters(rawSearch);
  const [facets, result] = await Promise.all([
    getCatalogFacets(scope),
    listProducts(filters, scope),
  ]);

  return (
    <div className="section-shell py-10 lg:py-14">
      {/* Breadcrumb + heading */}
      <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="size-3.5" />
        {scope.root.slug !== scope.current.slug ? (
          <>
            <Link href={`/category/${scope.root.slug}`} className="hover:text-primary">
              {scope.root.name}
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-slate-900">{scope.current.name}</span>
          </>
        ) : (
          <span className="text-slate-900">{scope.current.name}</span>
        )}
      </nav>

      <div className="mt-3 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-4xl">
          {scope.current.name}
        </h1>
        {scope.current.description && (
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {scope.current.description}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar filters */}
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

        {/* Results */}
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
              <p className="text-sm font-semibold text-slate-900">No products match your filters.</p>
              <p className="mt-1 text-sm text-slate-500">Try adjusting or clearing your filters.</p>
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
