import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Trash2 } from "lucide-react";

import { auth } from "@/auth";
import { SafeImage } from "@/components/shared/SafeImage";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { removeFromWishlist } from "@/features/portal/actions";
import { getWishlistByUser } from "@/features/portal/queries";

export const metadata: Metadata = {
  title: "Wishlist — AquaPure",
  description: "Products you’ve saved for later.",
};

export const dynamic = "force-dynamic";

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?redirect_url=/account/wishlist");

  const items = await getWishlistByUser(session.user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Wishlist
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Products you’ve saved for later.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-blue-200 bg-white/60 py-20 text-center backdrop-blur">
          <div className="grid size-16 place-items-center rounded-2xl bg-secondary text-primary">
            <Heart className="size-8" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">Wishlist is empty</p>
            <p className="mt-1 text-sm text-slate-500">
              Tap the heart on a product to save it here.
            </p>
          </div>
          <Link href="/" className={buttonVariants()}>
            Browse Products
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map(({ productId, product }) => (
            <li key={productId}>
              <Card className="h-full overflow-hidden border-blue-100/80 bg-white/85">
                <Link
                  href={`/product/${product.slug}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-secondary"
                >
                  <SafeImage
                    src={product.image || "/product-placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain p-4 transition hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                </Link>
                <CardContent className="flex flex-col gap-3 p-4">
                  {product.brand && (
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {product.brand}
                    </p>
                  )}
                  <Link
                    href={`/product/${product.slug}`}
                    className="line-clamp-2 font-bold text-slate-900 transition hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-primary">
                      {BDT.format(product.price)}
                    </span>
                    {product.compareAtPrice != null &&
                      product.compareAtPrice > product.price && (
                        <span className="text-sm text-slate-400 line-through">
                          {BDT.format(product.compareAtPrice)}
                        </span>
                      )}
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Link
                      href={`/product/${product.slug}`}
                      className={buttonVariants({
                        size: "sm",
                        className: "flex-1",
                      })}
                    >
                      View Product
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await removeFromWishlist(productId);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        aria-label="Remove from wishlist"
                        className="text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
