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
              <div className="pt-2 text-xs text-slate-500">
                <p>Method: {order.paymentMethod ?? "—"}</p>
                {order.transactionRef && <p>Txn: {order.transactionRef}</p>}
                <p>Delivery: {order.deliveryOption ?? "—"}</p>
                <p>Installation: {order.installationOption ?? "—"}</p>
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
