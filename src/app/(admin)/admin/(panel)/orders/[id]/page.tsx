import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderStatusForm } from "@/features/admin/components/OrderStatusForm";
import { adminQuery } from "@/features/admin/guard";
import {
  formatDate,
  formatMoney,
  ORDER_STATUS_LABELS,
} from "@/features/admin/format";
import { getOrderAdmin } from "@/features/admin/queries";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const order = await adminQuery(() => getOrderAdmin(id));
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/orders"
          className="text-xs font-semibold text-primary hover:underline"
        >
          ← Orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {order.orderNumber}
          </h1>
          <Badge variant="secondary">
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Placed {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base">Line items</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-2.5">Product</th>
                    <th className="px-5 py-2.5">Qty</th>
                    <th className="px-5 py-2.5">Unit</th>
                    <th className="px-5 py-2.5">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-900">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.product.sku}
                          {item.variant ? ` · ${item.variant.name}` : ""}
                        </p>
                      </td>
                      <td className="px-5 py-3 tabular-nums">{item.qty}</td>
                      <td className="px-5 py-3 tabular-nums">
                        {formatMoney(item.unitPrice)}
                      </td>
                      <td className="px-5 py-3 font-medium tabular-nums">
                        {formatMoney(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-xl border-slate-200 shadow-sm">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-base">Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 px-5 pb-5 text-sm">
                <p className="font-semibold text-slate-900">
                  {order.user.name ?? "—"}
                </p>
                <p className="text-slate-600">{order.user.email}</p>
                {order.user.phone && (
                  <p className="text-slate-600">{order.user.phone}</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200 shadow-sm">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-base">Shipping address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 px-5 pb-5 text-sm text-slate-600">
                {order.address ? (
                  <>
                    <p className="font-semibold text-slate-900">
                      {order.address.recipientName}{" "}
                      <span className="font-normal text-slate-400">
                        ({order.address.label})
                      </span>
                    </p>
                    <p>{order.address.line1}</p>
                    {order.address.line2 && <p>{order.address.line2}</p>}
                    <p>
                      {order.address.city}, {order.address.district}
                      {order.address.postCode
                        ? ` ${order.address.postCode}`
                        : ""}
                    </p>
                    <p>{order.address.phone}</p>
                  </>
                ) : (
                  <p>No address on file.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base">Totals & payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 px-5 pb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span>{formatMoney(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax</span>
                <span>{formatMoney(order.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Method</span>
                  <span className="font-semibold text-slate-900">
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : order.paymentMethod === "BKASH"
                        ? "bKash"
                        : order.paymentMethod ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Payment status</span>
                  <span
                    className={
                      order.paymentStatus === "PAID"
                        ? "font-semibold text-emerald-700"
                        : "font-semibold text-amber-700"
                    }
                  >
                    {order.paymentStatus ?? "PENDING"}
                  </span>
                </div>

                {order.paymentMethod === "BKASH" && (
                  <div className="mt-2 rounded-lg border border-pink-100 bg-[#fff5f9] p-3 text-sm">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#E2136E]">
                      bKash verification
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Sender number</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {order.bkashSenderNumber ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">TrxID</span>
                        <span className="break-all font-mono font-semibold text-slate-900">
                          {order.bkashTrxId ?? "—"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                      Open bKash app / statement and match this TrxID + sender
                      number before moving status to Processing.
                    </p>
                  </div>
                )}

                <div className="pt-1 text-xs text-slate-500">
                  <p>Delivery: {order.deliveryOption ?? "—"}</p>
                  <p>Installation: {order.installationOption ?? "—"}</p>
                  {order.transactionRef && (
                    <p className="mt-1 break-all text-[11px] text-slate-400">
                      Internal ref: {order.transactionRef}
                    </p>
                  )}
                </div>
              </div>
              {order.notes && (
                <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  {order.notes}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <OrderStatusForm
              orderId={order.id}
              currentStatus={order.status}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
