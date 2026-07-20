import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminQuery } from "@/features/admin/guard";
import {
  formatDate,
  formatMoney,
  ORDER_STATUS_LABELS,
} from "@/features/admin/format";
import { listOrders } from "@/features/admin/queries";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  page?: string;
}>;

const STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

function orderBadgeVariant(
  status: string,
): "warning" | "secondary" | "success" | "sale" | "outline" {
  if (status === "PENDING") return "warning";
  if (status === "PAID" || status === "PROCESSING") return "secondary";
  if (status === "SHIPPED" || status === "DELIVERED") return "success";
  if (status === "CANCELLED") return "sale";
  return "outline";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const status = params.status?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const data = await adminQuery(() =>
    listOrders({
      q,
      status: status as (typeof STATUSES)[number] | undefined,
      page,
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Orders
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track fulfillment and payment status.
        </p>
      </div>

      <form
        method="get"
        action="/admin/orders"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Search
          </label>
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Order number, customer, txn ref…"
            className="h-10 rounded-lg"
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Status
          </label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm" className="h-10">
          Filter
        </Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                data.items.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="text-[11px] text-slate-400">
                        {order.paymentMethod}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {order.user.name ?? "—"}
                      </p>
                      <p className="text-xs text-slate-400">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={orderBadgeVariant(order.status)}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">
                      {order.itemCount}
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {formatMoney(order.total)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          <span>
            {data.total} order{data.total === 1 ? "" : "s"} · Page {data.page} of{" "}
            {data.pageCount}
          </span>
          <div className="flex gap-2">
            {data.page > 1 && (
              <Link
                href={`/admin/orders?q=${encodeURIComponent(q ?? "")}&status=${encodeURIComponent(status ?? "")}&page=${data.page - 1}`}
                className="font-semibold text-primary hover:underline"
              >
                Previous
              </Link>
            )}
            {data.page < data.pageCount && (
              <Link
                href={`/admin/orders?q=${encodeURIComponent(q ?? "")}&status=${encodeURIComponent(status ?? "")}&page=${data.page + 1}`}
                className="font-semibold text-primary hover:underline"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
