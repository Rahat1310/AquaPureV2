"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";

import { SafeImage } from "@/components/shared/SafeImage";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ProductBadge = "Best Seller" | "New" | `Sale ${number}%`;

export interface ProductCardProps {
  title: string;
  price: number;
  comparePrice?: number | null;
  image?: string | null;
  imageAlt?: string;
  href?: string;
  badge?: ProductBadge;
  rating?: number;
  reviewCount?: number;
  specs?: string[];
  currency?: string;
  layout?: "grid" | "list";
  className?: string;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  onToggleWishlist?: () => void;
}

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductCard({
  title,
  price,
  comparePrice,
  image,
  imageAlt = title,
  href,
  badge,
  rating = 0,
  reviewCount = 0,
  specs = [],
  currency = "BDT",
  layout = "grid",
  className,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
}: ProductCardProps) {
  const badgeVariant =
    badge === "Best Seller" ? "warning" : badge === "New" ? "success" : "sale";
  const isList = layout === "list";
  const imageSrc = image || "/product-placeholder.svg";

  const media = (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-50",
        isList ? "aspect-[1.2] sm:w-64 sm:shrink-0" : "aspect-[1.08]",
      )}
    >
      <SafeImage
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
        className="object-contain p-5 transition duration-500 group-hover:scale-[1.04]"
      />
      {badge && (
        <Badge
          variant={badgeVariant}
          className="absolute left-4 top-4 rounded-full px-3 py-1 shadow-sm"
        >
          {badge}
        </Badge>
      )}
      <button
        type="button"
        onClick={onToggleWishlist}
        className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-blue-100 bg-white/90 text-slate-500 shadow-sm backdrop-blur transition hover:border-primary/30 hover:text-primary"
        aria-label={`Add ${title} to wishlist`}
      >
        <Heart className="size-[18px]" />
      </button>
    </div>
  );

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(25,65,130,0.14)]",
        isList ? "flex-col sm:flex-row" : "flex-col",
        className,
      )}
    >
      {href ? (
        <Link href={href} className="block" aria-label={title}>
          {media}
        </Link>
      ) : (
        media
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn(
                  "size-3.5",
                  index < Math.round(rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-100 text-slate-200",
                )}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-slate-500">
            {reviewCount > 0 ? `${rating.toFixed(1)} (${reviewCount})` : "No reviews yet"}
          </span>
        </div>

        {href ? (
          <Link href={href}>
            <h3 className="line-clamp-2 min-h-[48px] text-[17px] font-bold leading-6 tracking-[-0.02em] text-slate-900 transition group-hover:text-primary">
              {title}
            </h3>
          </Link>
        ) : (
          <h3 className="line-clamp-2 min-h-[48px] text-[17px] font-bold leading-6 tracking-[-0.02em] text-slate-900">
            {title}
          </h3>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {specs.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="font-semibold tracking-normal">
              {spec}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-end gap-2 pt-5">
          <span className="text-xl font-extrabold tracking-tight text-primary">
            {formatPrice(price, currency)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="pb-0.5 text-sm font-medium text-slate-400 line-through">
              {formatPrice(comparePrice, currency)}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {onAddToCart ? (
            <Button variant="outline" className="px-3" onClick={onAddToCart}>
              <ShoppingCart className="size-4" />
              Add to Cart
            </Button>
          ) : (
            <Link
              href={href ?? "#"}
              className={cn(buttonVariants({ variant: "outline" }), "px-3")}
            >
              <ShoppingCart className="size-4" />
              Add to Cart
            </Link>
          )}
          {onBuyNow ? (
            <Button className="px-3" onClick={onBuyNow}>
              Buy Now
            </Button>
          ) : (
            <Link href={href ?? "#"} className={cn(buttonVariants(), "px-3")}>
              Buy Now
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
