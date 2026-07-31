import type { Metadata } from "next";

import { CatalogHubView } from "@/features/catalog/components/CatalogHubView";
import { loadCatalogHub } from "@/features/catalog/load-hub";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "All Accessories",
  description:
    "Shop Padma Mineral Water filters, membranes, meters, and commercial accessories.",
};

export default async function AccessoriesPage() {
  // No searchParams here — keeps the route static/ISR. Filters hydrate client-side.
  const initial = await loadCatalogHub("accessories", {});

  return (
    <CatalogHubView
      hub="accessories"
      title="All Accessories"
      subtitle="Switch between Family and Office accessories for filters, parts, and fittings."
      initial={initial}
    />
  );
}
