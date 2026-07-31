"use server";

import { loadCatalogHub, type CatalogHubPayload } from "@/features/catalog/load-hub";
import type { CatalogHub } from "@/features/catalog/queries";

/** Client-side filter/segment changes — keeps hub pages statically prerenderable. */
export async function fetchCatalogHub(
  hub: CatalogHub,
  searchParams: Record<string, string | string[] | undefined>,
): Promise<CatalogHubPayload> {
  return loadCatalogHub(hub, searchParams);
}
