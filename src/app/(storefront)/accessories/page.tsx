import type { Metadata } from "next";

import { CatalogHubView } from "@/features/catalog/components/CatalogHubView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Accessories",
  description:
    "Shop Padma Mineral Water filters, membranes, meters, and commercial accessories.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccessoriesPage({ searchParams }: PageProps) {
  const raw = await searchParams;

  return (
    <CatalogHubView
      hub="accessories"
      title="All Accessories"
      subtitle="Switch between Family and Office accessories for filters, parts, and fittings."
      searchParams={raw}
    />
  );
}
