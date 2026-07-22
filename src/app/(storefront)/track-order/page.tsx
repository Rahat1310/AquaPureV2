import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShoppingBag } from "lucide-react";

import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button";
import { getOrdersByUser } from "@/features/checkout/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Track Order — Padma Mineral Water",
  description: "Track your Padma Mineral Water orders and payment status.",
};

export const dynamic = "force-dynamic";

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-sky-100 text-sky-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

function paymentLabel(method: string | null) {
  if (method === "COD") return "Cash on Delivery";
  if (method === "BKASH") return "bKash";
  return method ?? "—";
}

export default async function TrackOrderPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?redirect_url=/track-order");

  const orders = await getOrdersByUser(session.user.id);

  return (
    <div className="section-shell py-10 lg:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Track orders
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Active and past orders with live fulfillment status.
          </p>
        </div>
        <Link href="/orders" className={cn(buttonVariants({ variant: "outline" }), "text-sm")}>
          Order history
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-blue-200 bg-white/60 py-20 text-center">
          <ShoppingBag className="size-10 text-slate-300" />
          <p className="text-lg font-bold text-slate-900">No orders yet</p>
          <Link href="/category/residential" className={buttonVariants()}>
            Browse products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Order
                  </p>
                  <p className="text-lg font-extrabold text-slate-900">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleString("en-BD")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                      ORDER_STATUS_STYLES[order.status] ?? "bg-slate-100 text-slate-600",
                    )}
                  >
                    {order.status}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                      PAYMENT_STATUS_STYLES[order.paymentStatus] ??
                        "bg-slate-100 text-slate-600",
                    )}
                  >
                    Payment {order.paymentStatus}
                  </span>
                </div>
              </div>

              <ul className="mt-4 space-y-2 border-t border-blue-50 pt-4">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex items-center gap-2 text-slate-700">
                      <Package className="size-3.5 text-slate-400" />
                      {item.name}
                      <span className="text-slate-400">×{item.qty}</span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      {BDT.format(item.total)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-blue-50 pt-4">
                <div className="text-sm text-slate-600">
                  <p>
                    Method:{" "}
                    <span className="font-semibold text-slate-900">
                      {paymentLabel(order.paymentMethod)}
                    </span>
                  </p>
                  {order.paymentMethod === "BKASH" && order.bkashTrxId && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      TrxID: {order.bkashTrxId}
                      {order.bkashSenderNumber ? ` · ${order.bkashSenderNumber}` : ""}
                    </p>
                  )}
                  <p className="mt-0.5">
                    Delivery:{" "}
                    {order.shipping === 0 ? "Free" : BDT.format(order.shipping)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </p>
                  <p className="text-xl font-extrabold text-primary">
                    {BDT.format(order.total)}
                  </p>
                  <Link
                    href={`/orders/${order.id}`}
                    className="mt-1 inline-block text-xs font-bold text-primary hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
