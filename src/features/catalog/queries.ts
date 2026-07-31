import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { CatalogFilters } from "./params";
import {
  averageRating,
  parseImages,
  parseSpecs,
  toNullableNumber,
  toNumber,
  toProductListItem,
} from "./serialize";
import {
  TECHNOLOGY_OPTIONS,
  type CatalogFacets,
  type CategoryNode,
  type ProductDetail,
  type ProductListItem,
  type ProductListResult,
  type ProductSearchHit,
} from "./types";

const ACTIVE = "ACTIVE";

/** Cross-request catalog TTL. Bust via revalidateTag("products") on admin writes. */
const CATALOG_REVALIDATE = 600;

const listSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  price: true,
  compareAtPrice: true,
  stock: true,
  images: true,
  specs: true,
  brand: true,
  isFeatured: true,
  isBestSeller: true,
  createdAt: true,
  category: { select: { name: true } },
  // Count only — avoids loading every review row for each product card
  _count: {
    select: { reviews: { where: { isApproved: true } } },
  },
} satisfies Prisma.ProductSelect;

function catalogFiltersKey(filters: CatalogFilters): string {
  return [
    filters.page,
    filters.pageSize,
    filters.sort,
    filters.minPrice ?? "",
    filters.maxPrice ?? "",
    [...filters.categories].sort().join(","),
    [...filters.brands].sort().join(","),
    [...filters.technologies].sort().join(","),
  ].join("|");
}

// ─── Featured / Best Sellers ────────────────────────────────────

async function _getFeaturedProducts(limit: number): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    where: { status: ACTIVE, isFeatured: true },
    select: listSelect,
    orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return attachListRatings(rows.map(toProductListItem));
}

export function getFeaturedProducts(limit = 8): Promise<ProductListItem[]> {
  return unstable_cache(
    () => _getFeaturedProducts(limit),
    ["featured-products", String(limit)],
    { tags: ["products"], revalidate: CATALOG_REVALIDATE },
  )();
}

async function _getBestSellers(limit: number): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    where: { status: ACTIVE, isBestSeller: true },
    select: listSelect,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
  return attachListRatings(rows.map(toProductListItem));
}

export function getBestSellers(limit = 8): Promise<ProductListItem[]> {
  return unstable_cache(
    () => _getBestSellers(limit),
    ["best-sellers", String(limit)],
    { tags: ["products"], revalidate: CATALOG_REVALIDATE },
  )();
}

// ─── Categories ─────────────────────────────────────────────────

async function _getRootCategories(): Promise<CategoryNode[]> {
  const roots = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { displayOrder: "asc" },
    include: {
      children: { orderBy: { displayOrder: "asc" } },
      _count: { select: { products: { where: { status: ACTIVE } } } },
    },
  });

  return roots.map((root) => ({
    id: root.id,
    name: root.name,
    slug: root.slug,
    description: root.description,
    image: root.image,
    productCount: root._count.products,
    children: root.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      description: child.description,
      image: child.image,
      productCount: 0,
      children: [],
    })),
  }));
}

export const getRootCategories = unstable_cache(
  _getRootCategories,
  ["root-categories"],
  { tags: ["products"], revalidate: CATALOG_REVALIDATE },
);

export interface CategoryScope {
  current: { id: string; name: string; slug: string; description: string | null };
  root: { id: string; name: string; slug: string };
  sidebarCategories: { id: string; name: string; slug: string }[];
  descendantIds: string[];
}

async function _resolveCategoryScope(
  slug: string,
): Promise<CategoryScope | null> {
  const current = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: { orderBy: { displayOrder: "asc" } },
      parent: { include: { children: { orderBy: { displayOrder: "asc" } } } },
    },
  });

  if (!current) return null;

  const isRoot = current.parentId === null;
  const root = isRoot
    ? { id: current.id, name: current.name, slug: current.slug }
    : {
        id: current.parent!.id,
        name: current.parent!.name,
        slug: current.parent!.slug,
      };

  const sidebarSource = isRoot ? current.children : current.parent!.children;
  const sidebarCategories = sidebarSource.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  const descendantIds = isRoot
    ? [current.id, ...current.children.map((c) => c.id)]
    : [current.id];

  return {
    current: {
      id: current.id,
      name: current.name,
      slug: current.slug,
      description: current.description,
    },
    root,
    sidebarCategories,
    descendantIds,
  };
}

/** Request-deduped + cross-request cached category tree lookup. */
export const resolveCategoryScope = cache(
  (slug: string): Promise<CategoryScope | null> =>
    unstable_cache(
      () => _resolveCategoryScope(slug),
      ["category-scope", slug],
      { tags: ["products"], revalidate: CATALOG_REVALIDATE },
    )(),
);

export type CatalogHub = "products" | "accessories";
export type CatalogSegment = "all" | "family" | "mother" | "office";

const OFFICE_ACCESSORY_SLUGS = [
  "water-dispenser",
  "membrane",
  "fittings",
] as const;

async function mergeScopes(
  scopes: CategoryScope[],
  meta: {
    name: string;
    slug: string;
    description: string;
  },
): Promise<CategoryScope | null> {
  if (scopes.length === 0) return null;
  const primary = scopes[0]!;
  const ids = new Set<string>();
  const sidebar: CategoryScope["sidebarCategories"] = [];
  const seen = new Set<string>();

  for (const scope of scopes) {
    for (const id of scope.descendantIds) ids.add(id);
    for (const cat of scope.sidebarCategories) {
      if (seen.has(cat.id)) continue;
      seen.add(cat.id);
      sidebar.push(cat);
    }
  }

  return {
    current: {
      id: primary.current.id,
      name: meta.name,
      slug: meta.slug,
      description: meta.description,
    },
    root: primary.root,
    sidebarCategories: sidebar,
    descendantIds: [...ids],
  };
}

/**
 * Scope for /products and /accessories hub pages.
 * Products: All | Family | Mother & Child | Office
 * Accessories: Family | Office
 */
export async function resolveHubScope(
  hub: CatalogHub,
  segment: CatalogSegment,
): Promise<CategoryScope | null> {
  if (hub === "products") {
    if (segment === "all") {
      const scopes = (
        await Promise.all([
          resolveCategoryScope("residential"),
          resolveCategoryScope("mother-and-child"),
          resolveCategoryScope("commercial"),
        ])
      ).filter((s): s is CategoryScope => Boolean(s));

      return mergeScopes(scopes, {
        name: "All Products",
        slug: "all",
        description:
          "Browse every Padma Mineral Water purifier — family, mother & child, and office.",
      });
    }

    if (segment === "mother") {
      const scope = await resolveCategoryScope("mother-and-child");
      if (!scope) return null;
      return {
        ...scope,
        current: {
          ...scope.current,
          name: "Mother & Child",
          slug: "mother",
          description:
            scope.current.description ??
            "Purifiers and care products for mothers, babies, and families.",
        },
      };
    }

    const rootSlug = segment === "family" ? "residential" : "commercial";
    const scope = await resolveCategoryScope(rootSlug);
    if (!scope) return null;

    if (segment === "family") {
      return {
        ...scope,
        current: {
          ...scope.current,
          name: "Family",
          slug: "family",
          description:
            scope.current.description ??
            "Residential water purifiers for everyday home use.",
        },
      };
    }

    return {
      ...scope,
      current: {
        ...scope.current,
        name: "Office",
        slug: "office",
        description:
          scope.current.description ??
          "Commercial and industrial RO systems for offices and facilities.",
      },
    };
  }

  // Accessories hub — only family / office segments
  const accessories = await resolveCategoryScope("accessories");
  if (!accessories) return null;

  const accessorySegment = segment === "office" ? "office" : "family";

  if (accessorySegment === "family") {
    const officeIds = await prisma.category.findMany({
      where: { slug: { in: [...OFFICE_ACCESSORY_SLUGS] } },
      select: { id: true },
    });
    const exclude = new Set(officeIds.map((c) => c.id));
    const descendantIds = accessories.descendantIds.filter(
      (id) => !exclude.has(id),
    );
    const sidebarCategories = accessories.sidebarCategories.filter(
      (c) => !exclude.has(c.id),
    );

    return {
      current: {
        id: accessories.current.id,
        name: "Family accessories",
        slug: "family",
        description:
          "Filters, cartridges, meters, and parts for home purifiers.",
      },
      root: accessories.root,
      sidebarCategories,
      descendantIds:
        descendantIds.length > 0 ? descendantIds : accessories.descendantIds,
    };
  }

  const officeCats = await prisma.category.findMany({
    where: { slug: { in: [...OFFICE_ACCESSORY_SLUGS] } },
    select: { id: true, name: true, slug: true },
  });

  if (officeCats.length === 0) {
    return {
      ...accessories,
      current: {
        ...accessories.current,
        name: "Office accessories",
        slug: "office",
        description: "Accessories for commercial and office systems.",
      },
    };
  }

  return {
    current: {
      id: accessories.current.id,
      name: "Office accessories",
      slug: "office",
      description:
        "Dispensers, membranes, and fittings for office & commercial setups.",
    },
    root: accessories.root,
    sidebarCategories: officeCats,
    descendantIds: officeCats.map((c) => c.id),
  };
}

export function parseCatalogSegment(
  raw: string | string[] | undefined,
  fallback: CatalogSegment = "all",
): CatalogSegment {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "office" || value === "family" || value === "mother" || value === "all") {
    return value;
  }
  return fallback;
}

// ─── Filtered product listing ───────────────────────────────────

function buildTechnologyFilter(tech: string[]): Prisma.ProductWhereInput[] {
  const active = TECHNOLOGY_OPTIONS.filter((opt) => tech.includes(opt.value));
  if (active.length === 0) return [];
  return [
    {
      OR: active.map((opt) => ({
        name: { contains: opt.value },
      })),
    },
  ];
}

function buildOrderBy(
  sort: CatalogFilters["sort"],
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    case "name":
      return [{ name: "asc" }];
    case "featured":
    default:
      return [{ isFeatured: "desc" }, { isBestSeller: "desc" }, { createdAt: "desc" }];
  }
}

async function resolveSelectedCategoryIds(
  slugs: string[],
  fallbackIds: string[],
): Promise<string[]> {
  if (slugs.length === 0) return fallbackIds;
  const rows = await prisma.category.findMany({
    where: { slug: { in: slugs } },
    select: { id: true },
  });
  const selected = rows.map((r) => r.id).filter((id) => fallbackIds.includes(id));
  return selected.length > 0 ? selected : fallbackIds;
}

async function _listProducts(
  filters: CatalogFilters,
  scope: CategoryScope | null | undefined,
): Promise<ProductListResult> {
  const scopeIds = scope?.descendantIds ?? [];
  const categoryIds = scope
    ? await resolveSelectedCategoryIds(filters.categories, scopeIds)
    : [];

  const and: Prisma.ProductWhereInput[] = [
    { status: ACTIVE },
    ...buildTechnologyFilter(filters.technologies),
  ];

  if (categoryIds.length > 0) and.push({ categoryId: { in: categoryIds } });
  if (filters.brands.length > 0) and.push({ brand: { in: filters.brands } });
  if (filters.minPrice !== undefined)
    and.push({ price: { gte: new Prisma.Decimal(filters.minPrice) } });
  if (filters.maxPrice !== undefined)
    and.push({ price: { lte: new Prisma.Decimal(filters.maxPrice) } });

  const where: Prisma.ProductWhereInput = { AND: and };

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: listSelect,
      orderBy: buildOrderBy(filters.sort),
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
  ]);

  const items = await attachListRatings(rows.map(toProductListItem));

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

/** Cache listing results per filter+scope — major Neon saver on hub/category pages. */
export async function listProducts(
  filters: CatalogFilters,
  scope?: CategoryScope | null,
): Promise<ProductListResult> {
  const scopeKey = scope
    ? `${scope.current.slug}:${[...scope.descendantIds].sort().join(",")}`
    : "none";

  return unstable_cache(
    () => _listProducts(filters, scope),
    ["list-products", scopeKey, catalogFiltersKey(filters)],
    { tags: ["products"], revalidate: CATALOG_REVALIDATE },
  )();
}

/** One groupBy for averages instead of loading every review row per card. */
async function attachListRatings(
  items: ProductListItem[],
): Promise<ProductListItem[]> {
  if (items.length === 0) return items;

  const stats = await prisma.review.groupBy({
    by: ["productId"],
    where: {
      productId: { in: items.map((i) => i.id) },
      isApproved: true,
    },
    _avg: { rating: true },
    _count: { _all: true },
  });

  const byId = new Map(
    stats.map((s) => [
      s.productId,
      {
        rating: Math.round((s._avg.rating ?? 0) * 10) / 10,
        reviewCount: s._count._all,
      },
    ]),
  );

  return items.map((item) => {
    const s = byId.get(item.id);
    if (!s) return item;
    return { ...item, rating: s.rating, reviewCount: s.reviewCount };
  });
}

// ─── Facets (sidebar filter options) ────────────────────────────

async function _getCatalogFacets(scope: CategoryScope): Promise<CatalogFacets> {
  const scopeWhere: Prisma.ProductWhereInput = {
    status: ACTIVE,
    categoryId: { in: scope.descendantIds },
  };

  const [byCategory, byBrand, priceAgg] = await Promise.all([
    prisma.product.groupBy({
      by: ["categoryId"],
      where: scopeWhere,
      _count: { _all: true },
    }),
    prisma.product.groupBy({
      by: ["brand"],
      where: scopeWhere,
      _count: { _all: true },
    }),
    prisma.product.aggregate({
      where: scopeWhere,
      _min: { price: true },
      _max: { price: true },
    }),
  ]);

  const countByCategory = new Map(
    byCategory.map((row) => [row.categoryId, row._count._all]),
  );

  return {
    categories: scope.sidebarCategories
      .map((c) => ({
        label: c.name,
        value: c.slug,
        count: countByCategory.get(c.id) ?? 0,
      }))
      .filter((c) => c.count > 0),
    brands: byBrand
      .filter((row): row is typeof row & { brand: string } => row.brand !== null)
      .map((row) => ({
        label: row.brand,
        value: row.brand,
        count: row._count._all,
      })),
    technologies: TECHNOLOGY_OPTIONS,
    priceMin: Math.floor(toNumber(priceAgg._min.price)),
    priceMax: Math.ceil(toNumber(priceAgg._max.price)) || 0,
  };
}

export async function getCatalogFacets(
  scope: CategoryScope,
): Promise<CatalogFacets> {
  const scopeKey = `${scope.current.slug}:${[...scope.descendantIds].sort().join(",")}`;
  return unstable_cache(
    () => _getCatalogFacets(scope),
    ["catalog-facets", scopeKey],
    { tags: ["products"], revalidate: CATALOG_REVALIDATE },
  )();
}

// ─── Product detail ─────────────────────────────────────────────

async function _getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: { slug, status: ACTIVE },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      variants: { orderBy: { price: "asc" } },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!product) return null;

  const specs = parseSpecs(product.specs);
  const images = parseImages(product.images);
  const reviews = product.reviews.map((r) => ({ rating: r.rating }));

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: toNumber(product.price),
    compareAtPrice: toNullableNumber(product.compareAtPrice),
    stock: product.stock,
    image: images[0] ?? null,
    images,
    specs,
    brand: product.brand,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    specPills: [],
    rating: averageRating(reviews),
    reviewCount: product.reviews.length,
    categoryId: product.category.id,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    createdAt: product.createdAt.toISOString(),
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: toNumber(v.price),
      stock: v.stock,
      attributes: parseSpecs(v.attributes),
    })),
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      verifiedPurchase: r.verifiedPurchase,
      authorName: r.user.name ?? "Verified Customer",
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

/**
 * Product detail — React cache() dedupes metadata+page in one request;
 * unstable_cache avoids Neon on repeat views for ~10 minutes.
 */
export const getProductBySlug = cache(
  (slug: string): Promise<ProductDetail | null> =>
    unstable_cache(
      () => _getProductBySlug(slug),
      ["product-by-slug", slug],
      { tags: ["products"], revalidate: CATALOG_REVALIDATE },
    )(),
);

async function _getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit: number,
): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    where: {
      status: ACTIVE,
      id: { not: excludeProductId },
      category: { id: categoryId },
    },
    select: listSelect,
    orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return attachListRatings(rows.map(toProductListItem));
}

export function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4,
): Promise<ProductListItem[]> {
  return unstable_cache(
    () => _getRelatedProducts(categoryId, excludeProductId, limit),
    ["related-products", categoryId, excludeProductId, String(limit)],
    { tags: ["products"], revalidate: CATALOG_REVALIDATE },
  )();
}

export async function getProductsInCategory(
  slug: string,
  limit = 4,
): Promise<ProductListItem[]> {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: { select: { id: true } } },
  });
  if (!category) return [];

  const ids = [category.id, ...category.children.map((c) => c.id)];
  const rows = await prisma.product.findMany({
    where: { status: ACTIVE, categoryId: { in: ids } },
    select: listSelect,
    orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return attachListRatings(rows.map(toProductListItem));
}

/** Homepage accessories strip — same card grid as featured products. */
export function getFeaturedAccessories(
  limit = 4,
): Promise<ProductListItem[]> {
  return unstable_cache(
    () => getProductsInCategory("accessories", limit),
    ["featured-accessories", String(limit)],
    { tags: ["products"], revalidate: CATALOG_REVALIDATE },
  )();
}

export interface TestimonialDTO {
  id: string;
  quote: string;
  name: string;
  rating: number;
  productName: string;
  verifiedPurchase: boolean;
}

export async function getFeaturedTestimonials(limit = 3): Promise<TestimonialDTO[]> {
  const rows = await prisma.review.findMany({
    where: { isApproved: true, comment: { not: null } },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      user: { select: { name: true } },
      product: { select: { name: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    quote: r.comment ?? "",
    name: r.user.name ?? "Verified Customer",
    rating: r.rating,
    productName: r.product.name,
    verifiedPurchase: r.verifiedPurchase,
  }));
}

export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { status: ACTIVE },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const rows = await prisma.category.findMany({
    select: { slug: true },
    orderBy: { displayOrder: "asc" },
  });
  return rows.map((r) => r.slug);
}

// ─── Homepage / storefront product search ─────────────────────────────────────

export type { ProductSearchHit };

const SEARCH_MIN_CHARS = 2;
const SEARCH_DEFAULT_LIMIT = 8;

/**
 * Lightweight product search for typeahead.
 * - ACTIVE only
 * - Matches name / sku / brand / slug (case-insensitive)
 * - Caps result count; no review joins
 */
export async function searchProducts(
  rawQuery: string,
  limit = SEARCH_DEFAULT_LIMIT,
): Promise<ProductSearchHit[]> {
  const q = rawQuery.trim().replace(/\s+/g, " ");
  if (q.length < SEARCH_MIN_CHARS) return [];

  const take = Math.min(Math.max(limit, 1), 12);

  const rows = await prisma.product.findMany({
    where: {
      status: ACTIVE,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      price: true,
      images: true,
      brand: true,
      isBestSeller: true,
      category: { select: { name: true } },
    },
    orderBy: [
      { isBestSeller: "desc" },
      { isFeatured: "desc" },
      { name: "asc" },
    ],
    take,
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    price: toNumber(row.price),
    image: parseImages(row.images)[0] ?? null,
    brand: row.brand,
    categoryName: row.category?.name ?? "",
  }));
}

export { SEARCH_MIN_CHARS };
