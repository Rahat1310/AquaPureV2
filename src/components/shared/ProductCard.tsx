"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";

import { SafeImage } from "@/components/shared/SafeImage";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
        "relative overflow-hidden rounded-[1.15rem] border border-white/50 bg-gradient-to-br from-white/25 via-sky-50/20 to-blue-100/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl",
        isList ? "aspect-[1.2] sm:w-64 sm:shrink-0" : "aspect-[1.08]",
      )}
    >
      {/* Soft glass glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-sky-300/25 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -left-6 size-32 rounded-full bg-primary/15 blur-2xl"
      />

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
          className={cn(
            "absolute left-3 top-3 rounded-full border border-white/40 bg-amber-50/55 px-3 py-1 shadow-sm backdrop-blur-md",
            badge === "Best Seller" && "featured-badge-pulse",
          )}
        >
          {badge}
        </Badge>
      )}
      <button
        type="button"
        onClick={onToggleWishlist}
        className="absolute right-3 top-3 grid size-10 place-items-center rounded-full border border-white/45 bg-white/35 text-slate-500 shadow-[0_8px_20px_rgba(25,65,130,0.1)] backdrop-blur-md transition hover:border-primary/30 hover:bg-white/55 hover:text-primary"
        aria-label={`Add ${title} to wishlist`}
      >
        <Heart className="size-[18px]" />
      </button>
    </div>
  );

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-white/50 bg-white/20 p-2.5 shadow-[0_18px_50px_rgba(25,65,130,0.1)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/70 hover:bg-white/30 hover:shadow-[0_28px_70px_rgba(25,65,130,0.16)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[1.6rem] before:bg-gradient-to-br before:from-white/30 before:via-transparent before:to-sky-100/10 before:opacity-70",
        isList ? "flex-col sm:flex-row sm:gap-2" : "flex-col",
        className,
      )}
    >
      <div className={cn("relative z-[1]", isList && "sm:contents")}>
        {href ? (
          <Link href={href} className="block" aria-label={title}>
            {media}
          </Link>
        ) : (
          media
        )}
      </div>

      <div className="relative z-[1] flex flex-1 flex-col px-3.5 pb-3.5 pt-4 sm:px-4">
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
            <Badge
              key={spec}
              variant="secondary"
              className="border border-white/40 bg-sky-50/45 font-semibold tracking-normal backdrop-blur-sm"
            >
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
            <Button
              variant="outline"
              className="border-white/50 bg-white/30 px-3 backdrop-blur-md hover:bg-white/50"
              onClick={onAddToCart}
            >
              <ShoppingCart className="size-4" />
              Add to Cart
            </Button>
          ) : (
            <Link
              href={href ?? "#"}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-white/50 bg-white/30 px-3 backdrop-blur-md hover:bg-white/50",
              )}
            >
              <ShoppingCart className="size-4" />
              Add to Cart
            </Link>
          )}
          {onBuyNow ? (
            <Button className="px-3 shadow-[0_10px_24px_rgba(27,79,209,0.28)]" onClick={onBuyNow}>
              Buy Now
            </Button>
          ) : (
            <Link
              href={href ?? "#"}
              className={cn(
                buttonVariants(),
                "px-3 shadow-[0_10px_24px_rgba(27,79,209,0.28)]",
              )}
            >
              Buy Now
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
