import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShoppingBag } from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrdersByUser } from "@/features/checkout/queries";

export const metadata: Metadata = {
  title: "Orders — AquaPure",
  description: "Your AquaPure order history and delivery status.",
};

export const dynamic = "force-dynamic";

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const STATUS_VARIANT: Record<
  string,
  "warning" | "secondary" | "default" | "success" | "sale" | "outline"
> = {
  PENDING: "warning",
  PAID: "secondary",
  PROCESSING: "default",
  SHIPPED: "secondary",
  DELIVERED: "success",
  CANCELLED: "sale",
};

export default async function PortalOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?redirect_url=/account/orders");

  const orders = await getOrdersByUser(session.user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track purchases and view delivery status.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-blue-200 bg-white/60 py-20 text-center backdrop-blur">
          <div className="grid size-16 place-items-center rounded-2xl bg-secondary text-primary">
            <ShoppingBag className="size-8" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">No orders yet</p>
            <p className="mt-1 text-sm text-slate-500">
              When you place an order it will appear here.
            </p>
          </div>
          <Link href="/" className={buttonVariants()}>
            Browse Products
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Card className="border-blue-100/80 bg-white/85 transition hover:shadow-md">
                <CardContent className="flex flex-wrap items-start gap-4 p-5">
                  <div className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                    <Package className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold tracking-tight text-slate-900">
                        {order.orderNumber}
                      </span>
                      <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {" · "}
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
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
                      href={`/account/orders/${order.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      View Details
                    </Link>
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
