import "server-only";

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
} from "./types";

const ACTIVE = "ACTIVE";

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
  reviews: { where: { isApproved: true }, select: { rating: true } },
} satisfies Prisma.ProductSelect;

// ─── Featured / Best Sellers ────────────────────────────────────

export async function getFeaturedProducts(limit = 8): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    where: { status: ACTIVE, isFeatured: true },
    select: listSelect,
    orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map(toProductListItem);
}

export async function getBestSellers(limit = 8): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    where: { status: ACTIVE, isBestSeller: true },
    select: listSelect,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
  return rows.map(toProductListItem);
}

// ─── Categories ─────────────────────────────────────────────────

export async function getRootCategories(): Promise<CategoryNode[]> {
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

export interface CategoryScope {
  current: { id: string; name: string; slug: string; description: string | null };
  root: { id: string; name: string; slug: string };
  sidebarCategories: { id: string; name: string; slug: string }[];
  descendantIds: string[];
}

export async function resolveCategoryScope(
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

export async function listProducts(
  filters: CatalogFilters,
  scope?: CategoryScope | null,
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

  return {
    items: rows.map(toProductListItem),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

// ─── Facets (sidebar filter options) ────────────────────────────

export async function getCatalogFacets(
  scope: CategoryScope,
): Promise<CatalogFacets> {
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

// ─── Product detail ─────────────────────────────────────────────

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
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

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4,
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
  return rows.map(toProductListItem);
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
  return rows.map(toProductListItem);
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
