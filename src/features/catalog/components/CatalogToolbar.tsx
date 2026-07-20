"use client";

import { LayoutGrid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SORT_OPTIONS, type SortKey, type ViewMode } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

interface CatalogToolbarProps {
  total: number;
  page: number;
  pageSize: number;
  sort: SortKey;
  view: ViewMode;
}

export function CatalogToolbar({
  total,
  page,
  pageSize,
  sort,
  view,
}: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key !== "view") params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        {total === 0 ? (
          "No products found"
        ) : (
          <>
            Showing <span className="font-semibold text-slate-900">{from}–{to}</span> of{" "}
            <span className="font-semibold text-slate-900">{total}</span> products
          </>
        )}
      </p>

      <div className="flex items-center gap-3">
        <div className="relative">
          <label htmlFor="sort" className="sr-only">
            Sort products
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
            className="h-10 rounded-xl border border-border bg-white pl-4 pr-9 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex overflow-hidden rounded-xl border border-border">
          {(
            [
              { mode: "grid" as const, icon: LayoutGrid },
              { mode: "list" as const, icon: List },
            ]
          ).map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              type="button"
              aria-label={`${mode} view`}
              aria-pressed={view === mode}
              onClick={() => update("view", mode)}
              className={cn(
                "grid size-10 place-items-center transition",
                view === mode
                  ? "bg-primary text-white"
                  : "bg-white text-slate-500 hover:bg-secondary",
              )}
            >
              <Icon className="size-[18px]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
