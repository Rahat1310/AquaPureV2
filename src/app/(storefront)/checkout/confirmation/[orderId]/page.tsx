import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, MapPin, Package, Truck } from "lucide-react";

import { auth } from "@/auth";
import { getOrderById } from "@/features/checkout/queries";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Order Confirmed — Padma Mineral Water",
  description: "Your Padma Mineral Water order has been placed successfully.",
};

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const STATUS_STEPS = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const order = await getOrderById(orderId, session.user.id);
  if (!order) notFound();

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="section-shell py-12 lg:py-16">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-emerald-500 text-white shadow-[0_16px_48px_rgba(16,185,129,0.25)]">
          <CheckCircle2 className="size-10" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Order Placed!
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Thank you! Your order has been received and is being processed.
        </p>
        <div className="mt-4 inline-block rounded-2xl bg-[#f0f4ff] px-6 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Order Number</p>
          <p className="text-xl font-extrabold tracking-tight text-primary">{order.orderNumber}</p>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-6">
        {/* Order status timeline */}
        <div className="rounded-2xl border border-blue-100 bg-white p-6">
          <h2 className="mb-5 text-sm font-extrabold uppercase tracking-widest text-slate-500">
            Order Status
          </h2>
          <div className="flex items-center">
            {STATUS_STEPS.map((s, i) => {
              const isDone = i <= currentStep;
              const isActive = i === currentStep;
              return (
                <div key={s} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {i > 0 && (
                      <div
                        className={`h-0.5 flex-1 transition-colors ${isDone ? "bg-primary" : "bg-slate-200"}`}
                      />
                    )}
                    <div
                      className={`grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-all ${
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
                        className={`h-0.5 flex-1 transition-colors ${i < currentStep ? "bg-primary" : "bg-slate-200"}`}
                      />
                    )}
                  </div>
                  <p
                    className={`mt-2 text-center text-[10px] font-bold uppercase tracking-wide ${
                      isActive ? "text-primary" : isDone ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {s}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items */}
        <div className="rounded-2xl border border-blue-100 bg-white p-6">
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-slate-500">
            Items Ordered
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {item.qty}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                  {item.variantName && (
                    <p className="text-xs text-slate-500">{item.variantName}</p>
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
              <span>{order.shipping === 0 ? "Free" : BDT.format(order.shipping)}</span>
            </div>
            <div className="flex justify-between pt-2 font-extrabold text-slate-900">
              <span>Total</span>
              <span className="text-primary">{BDT.format(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery & address */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-slate-500">
              <Truck className="size-4" /> Delivery
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {order.deliveryOption === "EXPRESS" ? "Express (1–2 days)" : "Standard (3–5 days)"}
            </p>
            {order.installationOption === "SCHEDULED" && (
              <p className="mt-1 text-xs text-slate-500">
                Professional installation — a technician will contact you.
              </p>
            )}
          </div>

          {order.address && (
            <div className="rounded-2xl border border-blue-100 bg-white p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-slate-500">
                <MapPin className="size-4" /> Ship to
              </div>
              <p className="text-sm font-semibold text-slate-900">{order.address.recipientName}</p>
              <p className="mt-0.5 text-sm text-slate-600">
                {order.address.line1}, {order.address.city}, {order.address.district}
              </p>
              <p className="text-sm text-slate-600">{order.address.phone}</p>
            </div>
          )}
        </div>

        {/* Payment info */}
        <div className="rounded-2xl border border-blue-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-slate-500" />
            <p className="text-sm font-semibold text-slate-700">
              Payment:{" "}
              {order.paymentMethod === "COD"
                ? "Cash on Delivery"
                : order.paymentMethod === "BKASH"
                  ? "bKash"
                  : order.paymentMethod ?? "—"}
            </p>
            <span
              className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold ${
                order.paymentStatus === "PAID" || order.status === "PAID"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {order.paymentStatus === "PAID" || order.status === "PAID"
                ? "PAID"
                : "PAYMENT PENDING"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/track-order" className={buttonVariants()}>
            Track Order
          </Link>
          <Link href={`/orders/${order.id}`} className={buttonVariants({ variant: "outline" })}>
            Order details
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
