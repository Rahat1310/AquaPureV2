import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShoppingBag } from "lucide-react";

import { auth } from "@/auth";
import { getOrdersByUser } from "@/features/checkout/queries";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Orders — AquaPure",
  description: "View all your AquaPure orders and track their delivery status.",
};

export const dynamic = "force-dynamic";

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-sky-100 text-sky-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?redirect_url=/orders");

  const orders = await getOrdersByUser(session.user.id);

  return (
    <div className="section-shell py-10 lg:py-14">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="grid size-20 place-items-center rounded-2xl bg-secondary text-primary">
            <ShoppingBag className="size-10" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">No orders yet</p>
            <p className="mt-1 text-slate-500">
              When you place an order it will appear here.
            </p>
          </div>
          <Link href="/" className={buttonVariants()}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                  <Package className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold tracking-tight text-slate-900">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        STATUS_STYLES[order.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("en-BD", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {" · "}
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {order.items.slice(0, 2).map((item) => (
                      <span
                        key={item.id}
                        className="max-w-[180px] truncate rounded-lg bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {item.name}
                        {item.variantName ? ` (${item.variantName})` : ""}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="rounded-lg bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
                        +{order.items.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-extrabold text-primary">
                    {BDT.format(order.total)}
                  </span>
                  <Link
                    href={`/orders/${order.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
