import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { auth } from "@/auth";
import { CheckoutFlow } from "@/features/checkout/components/CheckoutFlow";
import { getCartSummary } from "@/features/cart/queries";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Checkout — AquaPure",
  description: "Complete your AquaPure order: delivery address, options, and payment.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?redirect_url=/checkout");
  }

  const cart = await getCartSummary(session.user.id);

  if (cart.items.length === 0) {
    return (
      <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 grid size-20 place-items-center rounded-2xl bg-secondary text-primary">
          <ShoppingBag className="size-10" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-slate-500">
          Add some items before proceeding to checkout.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-6" })}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="section-shell py-10 lg:py-14">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900">
        Checkout
      </h1>
      <CheckoutFlow cart={cart} />
    </div>
  );
}
