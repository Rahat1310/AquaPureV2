export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  image: string | null;
  brand: string | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  specPills: string[];
  rating: number;
  reviewCount: number;
  categoryName: string;
  createdAt: string;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  images: string[];
  specs: Record<string, string | number>;
  categoryId: string;
  categorySlug: string;
  variants: ProductVariantDTO[];
  reviews: ReviewDTO[];
}

export interface ProductVariantDTO {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string | number>;
}

export interface ReviewDTO {
  id: string;
  rating: number;
  comment: string | null;
  verifiedPurchase: boolean;
  authorName: string;
  createdAt: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
  children: CategoryNode[];
}

export interface FacetOption {
  label: string;
  value: string;
  count?: number;
}

export interface CatalogFacets {
  categories: FacetOption[];
  brands: FacetOption[];
  technologies: FacetOption[];
  priceMin: number;
  priceMax: number;
}

export interface ProductListResult {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type SortKey =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "name";

export type ViewMode = "grid" | "list";

/**
 * Technology facet options. Matching is done with a case-insensitive
 * `contains` against the product name (SQLite LIKE is case-insensitive
 * for ASCII), so these tokens map to how products are named in the DB.
 */
export const TECHNOLOGY_OPTIONS: FacetOption[] = [
  { label: "RO", value: "ro" },
  { label: "UV", value: "uv" },
  { label: "UF", value: "uf" },
  { label: "Alkaline", value: "alkaline" },
  { label: "Hot & Cold", value: "hot" },
  { label: "Under Sink", value: "under sink" },
  { label: "Industrial", value: "industrial" },
];

export const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
  { label: "Name (A–Z)", value: "name" },
];
