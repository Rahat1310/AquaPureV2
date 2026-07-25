"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

export type CatalogTab = {
  key: string;
  label: string;
};

type CatalogSegmentTabsProps = {
  tabs: CatalogTab[];
  active: string;
  paramKey?: string;
};

/**
 * Pill tab switcher for catalog hub pages (All Products / Accessories).
 * Preserves existing query params except page (resets to 1 on tab change).
 */
export function CatalogSegmentTabs({
  tabs,
  active,
  paramKey = "segment",
}: CatalogSegmentTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKey, key);
    params.delete("page");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div
      className="inline-flex flex-wrap gap-1.5 rounded-full border border-blue-100 bg-white/90 p-1.5 shadow-[0_8px_28px_rgba(27,79,209,0.08)]"
      role="tablist"
      aria-label="Catalog segment"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={hrefFor(tab.key)}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold transition",
              isActive
                ? "bg-primary text-white shadow-[0_8px_20px_rgba(27,79,209,0.28)]"
                : "text-slate-600 hover:bg-sky-50 hover:text-primary",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
