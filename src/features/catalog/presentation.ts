import type { ProductBadge } from "@/components/shared/ProductCard";

import type { ProductListItem } from "./types";

export function productHref(slug: string): string {
  return `/product/${slug}`;
}

export function categoryHref(slug: string): string {
  return `/category/${slug}`;
}

export function getProductBadge(item: {
  isBestSeller: boolean;
  price: number;
  compareAtPrice: number | null;
}): ProductBadge | undefined {
  if (item.isBestSeller) return "Best Seller";
  if (item.compareAtPrice && item.compareAtPrice > item.price) {
    const pct = Math.round(
      ((item.compareAtPrice - item.price) / item.compareAtPrice) * 100,
    );
    if (pct > 0) return `Sale ${pct}%`;
  }
  return undefined;
}

/** Maps a catalog list item to ProductCard props. */
export function toProductCardProps(item: ProductListItem) {
  return {
    title: item.name,
    price: item.price,
    comparePrice: item.compareAtPrice,
    image: item.image,
    href: productHref(item.slug),
    badge: getProductBadge(item),
    rating: item.rating,
    reviewCount: item.reviewCount,
    specs: item.specPills,
  };
}
