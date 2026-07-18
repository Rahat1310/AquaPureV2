import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Star, Truck, Wrench } from "lucide-react";

import { ProductCard } from "@/components/shared/ProductCard";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { ProductPurchasePanel } from "@/components/storefront/ProductPurchasePanel";
import { ProductTabs } from "@/components/storefront/ProductTabs";
import { Badge } from "@/components/ui/badge";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/features/catalog/queries";
import {
  buildSpecPills,
} from "@/features/catalog/serialize";
import { categoryHref, toProductCardProps } from "@/features/catalog/presentation";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const description =
    product.description?.slice(0, 160) ??
    `${product.name} — AquaPure water purifier with free installation and genuine warranty.`;
  const ogImage = product.image ? [{ url: product.image }] : undefined;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

const deliveryInfo = [
  { icon: Truck, title: "Free delivery", detail: "Nationwide across Bangladesh" },
  { icon: Wrench, title: "Free installation", detail: "By certified technicians" },
  { icon: ShieldCheck, title: "Genuine warranty", detail: "Manufacturer backed" },
];

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(
    product.categoryId,
    product.id,
    4,
  );

  const specPills = buildSpecPills(product.specs, 6);

  return (
    <div className="section-shell py-10 lg:py-14">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href={categoryHref(product.categorySlug)} className="hover:text-primary">
          {product.categoryName}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-slate-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          {product.isBestSeller && (
            <Badge variant="warning" className="mb-3">Best Seller</Badge>
          )}
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-[34px]">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex" aria-label={`${product.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-4",
                    i < Math.round(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-100 text-slate-200",
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-slate-500">
              {product.reviewCount > 0
                ? `${product.rating.toFixed(1)} · ${product.reviewCount} reviews`
                : "No reviews yet"}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-500">SKU: {product.sku}</span>
          </div>

          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
              Save{" "}
              {new Intl.NumberFormat("en-BD", {
                style: "currency",
                currency: "BDT",
                maximumFractionDigits: 0,
              }).format(product.compareAtPrice - product.price)}
            </div>
          )}

          {specPills.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {specPills.map((pill) => (
                <Badge key={pill} variant="secondary" className="font-semibold tracking-normal">
                  {pill}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-6">
            <ProductPurchasePanel
              basePrice={product.price}
              stock={product.stock}
              variants={product.variants}
            />
          </div>

          {/* Delivery & installation info panel */}
          <div className="mt-7 grid gap-3 rounded-2xl border border-blue-100 bg-[#f7faff] p-5 sm:grid-cols-3">
            {deliveryInfo.map((info) => (
              <div key={info.title} className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">
                  <info.icon className="size-5" />
                </span>
                <span>
                  <strong className="block text-xs font-bold text-slate-900">{info.title}</strong>
                  <span className="text-[11px] text-slate-500">{info.detail}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <ProductTabs
          description={product.description}
          specs={product.specs}
          reviews={product.reviews}
          rating={product.rating}
        />
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-slate-950">
            Related products
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} {...toProductCardProps(item)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
