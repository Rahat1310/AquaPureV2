import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  Truck,
} from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cancelOrder } from "@/features/checkout/actions";
import { getOrderById } from "@/features/checkout/queries";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order #${orderId.slice(-8).toUpperCase()} — Padma Mineral Water`,
  };
}

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const STATUS_STEPS = [
  { key: "PENDING", label: "Pending" },
  { key: "PAID", label: "Paid" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

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

export default async function PortalOrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/sign-in?redirect_url=/account/orders/${orderId}`);
  }

  const order = await getOrderById(orderId, session.user.id);
  if (!order) notFound();

  const isCancelled = order.status === "CANCELLED";
  const currentStepIdx = isCancelled
    ? -1
    : STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-primary"
      >
        <ArrowLeft className="size-4" /> All Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-BD", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          {!isCancelled && (
            <Card className="border-blue-100/80 bg-white/85">
              <CardContent className="p-6">
                <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">
                  Tracking
                </h2>
                <div className="flex items-center">
                  {STATUS_STEPS.map((s, i) => {
                    const isDone = i <= currentStepIdx;
                    const isActive = i === currentStepIdx;
                    return (
                      <div
                        key={s.key}
                        className="flex flex-1 flex-col items-center"
                      >
                        <div className="flex w-full items-center">
                          {i > 0 && (
                            <div
                              className={`h-0.5 flex-1 ${
                                i <= currentStepIdx
                                  ? "bg-primary"
                                  : "bg-slate-200"
                              }`}
                            />
                          )}
                          <div
                            className={`grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${
                              isActive
                                ? "border-primary bg-primary text-white ring-4 ring-primary/15"
                                : isDone
                                  ? "border-primary bg-primary text-white"
                                  : "border-slate-200 bg-white text-slate-400"
                            }`}
                          >
                            {isDone && !isActive ? (
                              <CheckCircle2 className="size-4" />
                            ) : (
                              i + 1
                            )}
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div
                              className={`h-0.5 flex-1 ${
                                i < currentStepIdx
                                  ? "bg-primary"
                                  : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>
                        <p
                          className={`mt-2 text-center text-[10px] font-bold uppercase tracking-wide ${
                            isActive
                              ? "text-primary"
                              : isDone
                                ? "text-slate-700"
                                : "text-slate-400"
                          }`}
                        >
                          {s.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-blue-100/80 bg-white/85">
            <CardContent className="p-6">
              <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-slate-400">
                Items
              </h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {item.qty}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-slate-500">
                          {item.variantName}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-bold text-slate-900">
                      {BDT.format(item.total)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5 border-t border-blue-50 pt-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{BDT.format(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span>
                    {order.shipping === 0
                      ? "Free"
                      : BDT.format(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 font-extrabold text-slate-900">
                  <span>Total</span>
                  <span className="text-primary">{BDT.format(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.status === "PENDING" && (
            <form
              action={async () => {
                "use server";
                await cancelOrder(orderId);
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="text-rose-600 hover:border-rose-200 hover:bg-rose-50"
              >
                Cancel Order
              </Button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="border-blue-100/80 bg-white/85">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                <Truck className="size-3.5" /> Delivery
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {order.deliveryOption === "EXPRESS"
                  ? "Express (1–2 business days)"
                  : "Standard (3–5 business days)"}
              </p>
              {order.installationOption === "SCHEDULED" && (
                <p className="mt-1 text-xs text-slate-500">
                  Professional installation scheduled
                </p>
              )}
            </CardContent>
          </Card>

          {order.address && (
            <Card className="border-blue-100/80 bg-white/85">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  <MapPin className="size-3.5" /> Ship To
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {order.address.recipientName}
                </p>
                <p className="mt-0.5 text-sm text-slate-600">
                  {order.address.line1}
                </p>
                {order.address.line2 && (
                  <p className="text-sm text-slate-600">{order.address.line2}</p>
                )}
                <p className="text-sm text-slate-600">
                  {order.address.city}, {order.address.district}
                  {order.address.postCode
                    ? ` — ${order.address.postCode}`
                    : ""}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {order.address.phone}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-blue-100/80 bg-white/85">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                <Package className="size-3.5" /> Payment
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod === "BKASH"
                    ? "bKash"
                    : (order.paymentMethod ?? "—")}
              </p>
              <Badge
                variant={order.paymentStatus === "PAID" ? "success" : "warning"}
                className="mt-2"
              >
                {order.paymentStatus === "PAID" ? "PAID" : "PENDING"}
              </Badge>
              {order.paymentMethod === "BKASH" && order.bkashTrxId && (
                <p className="mt-2 text-xs text-slate-500">
                  TrxID: {order.bkashTrxId}
                  {order.bkashSenderNumber ? ` · ${order.bkashSenderNumber}` : ""}
                </p>
              )}
            </CardContent>
          </Card>

          <Link
            href="/account/orders"
            className={buttonVariants({ variant: "outline", className: "w-full" })}
          >
            Back to Orders
          </Link>
        </aside>
      </div>
    </div>
  );
}
