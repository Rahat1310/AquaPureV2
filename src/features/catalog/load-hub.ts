import "server-only";

import {
  getCatalogFacets,
  listProducts,
  parseCatalogSegment,
  resolveHubScope,
  type CatalogHub,
  type CatalogSegment,
  type CategoryScope,
} from "@/features/catalog/queries";
import { parseCatalogFilters, type CatalogFilters } from "@/features/catalog/params";
import {
  TECHNOLOGY_OPTIONS,
  type CatalogFacets,
  type ProductListResult,
} from "@/features/catalog/types";

export type CatalogHubPayload = {
  activeSegment: CatalogSegment;
  filters: CatalogFilters;
  facets: CatalogFacets;
  result: ProductListResult;
  scopeOk: boolean;
};

export async function loadCatalogHub(
  hub: CatalogHub,
  searchParams: Record<string, string | string[] | undefined>,
): Promise<CatalogHubPayload> {
  const fallback: CatalogSegment = hub === "products" ? "all" : "family";
  const segment = parseCatalogSegment(searchParams.segment, fallback);
  const activeSegment: CatalogSegment =
    hub === "accessories" && (segment === "all" || segment === "mother")
      ? "family"
      : segment;

  const scope: CategoryScope | null = await resolveHubScope(hub, activeSegment);
  if (!scope) {
    return {
      activeSegment,
      filters: parseCatalogFilters(searchParams),
      facets: {
        categories: [],
        brands: [],
        technologies: TECHNOLOGY_OPTIONS,
        priceMin: 0,
        priceMax: 0,
      },
      result: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 9,
        pageCount: 1,
      },
      scopeOk: false,
    };
  }

  const filters = parseCatalogFilters(searchParams);
  const [facets, result] = await Promise.all([
    getCatalogFacets(scope),
    listProducts(filters, scope),
  ]);

  return { activeSegment, filters, facets, result, scopeOk: true };
}
