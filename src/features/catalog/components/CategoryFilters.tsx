"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { CatalogFacets } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

interface CategoryFiltersProps {
  facets: CatalogFacets;
  selected: {
    categories: string[];
    brands: string[];
    technologies: string[];
    minPrice?: number;
    maxPrice?: number;
  };
}

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

export function CategoryFilters({ facets, selected }: CategoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(selected.minPrice ?? facets.priceMin);
  const [maxPrice, setMaxPrice] = useState(selected.maxPrice ?? facets.priceMax);

  useEffect(() => {
    setMinPrice(selected.minPrice ?? facets.priceMin);
    setMaxPrice(selected.maxPrice ?? facets.priceMax);
  }, [selected.minPrice, selected.maxPrice, facets.priceMin, facets.priceMax]);

  const commit = useCallback(
    (updates: Record<string, string[] | string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        params.delete(key);
        if (value === null || value === "") continue;
        if (Array.isArray(value)) {
          for (const v of value) if (v) params.append(key, v);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toggle = (key: string, current: string[], value: string) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    commit({ [key]: next });
  };

  const hasActiveFilters =
    selected.categories.length > 0 ||
    selected.brands.length > 0 ||
    selected.technologies.length > 0 ||
    selected.minPrice !== undefined ||
    selected.maxPrice !== undefined;

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => router.push(pathname, { scroll: false })}
            className="text-xs font-bold text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {facets.categories.length > 0 && (
        <FilterGroup title="Category">
          {facets.categories.map((c) => (
            <CheckRow
              key={c.value}
              label={c.label}
              count={c.count}
              checked={selected.categories.includes(c.value)}
              onChange={() => toggle("category", selected.categories, c.value)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Price range">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>{BDT.format(minPrice)}</span>
          <span>{BDT.format(maxPrice)}</span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            aria-label="Minimum price"
            min={facets.priceMin}
            max={facets.priceMax}
            value={minPrice}
            onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
            onPointerUp={() => commit({ minPrice: String(minPrice) })}
            onKeyUp={() => commit({ minPrice: String(minPrice) })}
            className="w-full accent-[#1b4fd1]"
          />
          <input
            type="range"
            aria-label="Maximum price"
            min={facets.priceMin}
            max={facets.priceMax}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
            onPointerUp={() => commit({ maxPrice: String(maxPrice) })}
            onKeyUp={() => commit({ maxPrice: String(maxPrice) })}
            className="w-full accent-[#1b4fd1]"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Technology">
        {facets.technologies.map((t) => (
          <CheckRow
            key={t.value}
            label={t.label}
            checked={selected.technologies.includes(t.value)}
            onChange={() => toggle("tech", selected.technologies, t.value)}
          />
        ))}
      </FilterGroup>

      {facets.brands.length > 0 && (
        <FilterGroup title="Brand">
          {facets.brands.map((b) => (
            <CheckRow
              key={b.value}
              label={b.label}
              count={b.count}
              checked={selected.brands.includes(b.value)}
              onChange={() => toggle("brand", selected.brands, b.value)}
            />
          ))}
        </FilterGroup>
      )}

      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(pathname, { scroll: false })}
        >
          Reset filters
        </Button>
      )}
    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_10px_35px_rgba(25,65,130,0.05)]">
      <h3 className="mb-3 text-sm font-bold text-slate-900">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded border-slate-300 accent-[#1b4fd1]"
      />
      <span className={cn("flex-1", checked && "font-semibold text-slate-900")}>{label}</span>
      {count !== undefined && (
        <span className="text-xs text-slate-400">{count}</span>
      )}
    </label>
  );
}
