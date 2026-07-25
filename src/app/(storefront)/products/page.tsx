import type { Metadata } from "next";

import { CatalogHubView } from "@/features/catalog/components/CatalogHubView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse Padma Mineral Water purifiers for family homes and office / commercial use.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const raw = await searchParams;

  return (
    <CatalogHubView
      hub="products"
      title="All Products"
      subtitle="Browse everything in one place — filter by All, Family, Mother & Child, or Office."
      searchParams={raw}
    />
  );
}
