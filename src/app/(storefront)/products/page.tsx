import type { Metadata } from "next";

import { CatalogHubView } from "@/features/catalog/components/CatalogHubView";
import { loadCatalogHub } from "@/features/catalog/load-hub";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse Padma Mineral Water purifiers for family homes and office / commercial use.",
};

export default async function ProductsPage() {
  // No searchParams here — keeps the route static/ISR. Filters hydrate client-side.
  const initial = await loadCatalogHub("products", {});

  return (
    <CatalogHubView
      hub="products"
      title="All Products"
      subtitle="Browse everything in one place — filter by All, Family, Mother & Child, or Office."
      initial={initial}
    />
  );
}
