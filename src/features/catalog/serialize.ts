import "server-only";

import type { ProductListItem } from "./types";

type DecimalLike = { toString(): string } | number | null | undefined;

export function toNumber(value: DecimalLike): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

export function toNullableNumber(value: DecimalLike): number | null {
  if (value === null || value === undefined) return null;
  return toNumber(value);
}

export function parseImages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function parseSpecs(
  raw: string | null | undefined,
): Record<string, string | number> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Convert a specs object into up to `max` short, human-friendly pill labels. */
export function buildSpecPills(
  specs: Record<string, string | number>,
  max = 3,
): string[] {
  const pills: string[] = [];

  if (specs.stages) pills.push(`${specs.stages} Stage`);
  if (specs.capacity) pills.push(String(specs.capacity));
  if (specs.production) pills.push(String(specs.production));
  if (specs.alkalineFilter === "Yes" || specs.phRange) pills.push("Alkaline");
  if (specs.hotTemp || specs.hotCapacity) pills.push("Hot & Cold");
  if (specs.filtration) pills.push(String(specs.filtration));
  if (specs.storageTank) pills.push(`${specs.storageTank} Tank`);
  if (specs.warranty) pills.push(`${specs.warranty} Warranty`);
  if (specs.micron) pills.push(`${specs.micron} Micron`);
  if (specs.size) pills.push(String(specs.size));

  return Array.from(new Set(pills)).slice(0, max);
}

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: DecimalLike;
  compareAtPrice: DecimalLike;
  stock: number;
  images: string | null;
  specs: string | null;
  brand: string | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  createdAt: Date;
  category?: { name: string } | null;
  reviews?: { rating: number }[];
  _count?: { reviews: number };
};

export function averageRating(reviews: { rating: number }[] | undefined): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function toProductListItem(row: ProductRow): ProductListItem {
  const images = parseImages(row.images);
  const specs = parseSpecs(row.specs);
  const reviews = row.reviews ?? [];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    price: toNumber(row.price),
    compareAtPrice: toNullableNumber(row.compareAtPrice),
    stock: row.stock,
    image: images[0] ?? null,
    brand: row.brand,
    isFeatured: row.isFeatured,
    isBestSeller: row.isBestSeller,
    specPills: buildSpecPills(specs),
    rating: averageRating(reviews),
    reviewCount: row._count?.reviews ?? reviews.length,
    categoryName: row.category?.name ?? "",
    createdAt: row.createdAt.toISOString(),
  };
}
