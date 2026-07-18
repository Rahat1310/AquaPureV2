import { z } from "zod";

import type { SortKey, ViewMode } from "./types";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const PAGE_SIZE = 9;

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap((v) => v.split(",")).filter(Boolean);
  return value.split(",").filter(Boolean);
}

const filterSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  sort: z
    .enum(["featured", "price-asc", "price-desc", "newest", "name"])
    .catch("featured"),
  view: z.enum(["grid", "list"]).catch("grid"),
  minPrice: z.coerce.number().min(0).optional().catch(undefined),
  maxPrice: z.coerce.number().min(0).optional().catch(undefined),
});

export interface CatalogFilters {
  page: number;
  pageSize: number;
  sort: SortKey;
  view: ViewMode;
  categories: string[];
  brands: string[];
  technologies: string[];
  minPrice?: number;
  maxPrice?: number;
}

export function parseCatalogFilters(raw: RawSearchParams): CatalogFilters {
  const base = filterSchema.parse({
    page: raw.page,
    sort: raw.sort,
    view: raw.view,
    minPrice: raw.minPrice,
    maxPrice: raw.maxPrice,
  });

  return {
    ...base,
    pageSize: PAGE_SIZE,
    categories: toArray(raw.category),
    brands: toArray(raw.brand),
    technologies: toArray(raw.tech),
  };
}

/** Build a query string from a partial set of filters, dropping empty values. */
export function buildQueryString(
  current: RawSearchParams,
  updates: Record<string, string | string[] | number | undefined | null>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    if (value === undefined) continue;
    for (const v of Array.isArray(value) ? value : [value]) {
      if (v) params.append(key, v);
    }
  }

  for (const [key, value] of Object.entries(updates)) {
    params.delete(key);
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const v of value) if (v) params.append(key, v);
    } else {
      params.set(key, String(value));
    }
  }

  const str = params.toString();
  return str ? `?${str}` : "";
}
