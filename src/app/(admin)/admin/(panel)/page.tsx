import Link from "next/link";
import {
  ClipboardList,
  FileText,
  Package,
  Users,
  Wrench,
  Banknote,
} from "lucide-react";

import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminQuery } from "@/features/admin/guard";
import {
  formatDate,
  formatMoney,
  ORDER_STATUS_LABELS,
  roleLabel,
} from "@/features/admin/format";
import { getSessionRole } from "@/features/admin/permissions";
import { getAdminDashboardStats } from "@/features/admin/queries";
import { Role } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function orderBadgeVariant(
  status: string,
): "warning" | "secondary" | "success" | "sale" | "outline" | "default" {
  if (status === "PENDING") return "warning";
  if (status === "PAID" || status === "PROCESSING") return "secondary";
  if (status === "SHIPPED" || status === "DELIVERED") return "success";
  if (status === "CANCELLED") return "sale";
  return "outline";
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = getSessionRole(
    session as { user?: { role?: string } | null } | null,
  );
  const stats = await adminQuery(() => getAdminDashboardStats());

  const isServiceManager = role === Role.SERVICE_MANAGER;
  const isSupport = role === Role.SUPPORT;

  const cards = isServiceManager
    ? [
        {
          label: "Open service requests",
          value: String(stats.openServiceRequests),
          icon: Wrench,
          hint: "OPEN + IN_PROGRESS",
        },
        {
          label: "Active products",
          value: String(stats.activeProductCount),
          icon: Package,
          hint: `${stats.productCount} total catalog`,
        },
        {
          label: "Pending orders",
          value: String(stats.pendingOrders),
          icon: ClipboardList,
          hint: "For warehouse visibility",
        },
      ]
    : isSupport
      ? [
          {
            label: "Pending orders",
            value: String(stats.pendingOrders),
            icon: ClipboardList,
            hint: `${stats.orderCount} total orders`,
          },
          {
            label: "New quotes",
            value: String(stats.newQuotes),
            icon: FileText,
            hint: "Awaiting follow-up",
          },
          {
            label: "Revenue (paid+)",
            value: formatMoney(stats.revenue),
            icon: Banknote,
            hint: "PAID through DELIVERED",
          },
        ]
      : [
          {
            label: "Revenue (paid+)",
            value: formatMoney(stats.revenue),
            icon: Banknote,
            hint: "PAID through DELIVERED",
          },
          {
            label: "Pending orders",
            value: String(stats.pendingOrders),
            icon: ClipboardList,
            hint: `${stats.orderCount} total`,
          },
          {
            label: "Active products",
            value: String(stats.activeProductCount),
            icon: Package,
            hint: `${stats.productCount} total`,
          },
          {
            label: "Open service",
            value: String(stats.openServiceRequests),
            icon: Wrench,
            hint: "OPEN + IN_PROGRESS",
          },
          {
            label: "New quotes",
            value: String(stats.newQuotes),
            icon: FileText,
            hint: "Awaiting follow-up",
          },
          {
            label: "Users",
            value: String(stats.userCount),
            icon: Users,
            hint: "All accounts",
          },
        ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {role ? roleLabel(role) : "Staff"} dashboard · operational snapshot
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, hint }) => (
          <Card
            key={label}
            className="rounded-xl border-slate-200 shadow-sm shadow-slate-200/60"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-3 p-5 pb-2">
              <div>
                <CardDescription className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </CardDescription>
                <CardTitle className="mt-1 text-2xl font-extrabold tabular-nums">
                  {value}
                </CardTitle>
              </div>
              <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <p className="text-xs text-slate-400">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isServiceManager && (
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-5">
            <div>
              <CardTitle className="text-base">Recent orders</CardTitle>
              <CardDescription>Latest storefront checkouts</CardDescription>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {stats.recentOrders.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-slate-500">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-y border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-2.5">Order</th>
                      <th className="px-5 py-2.5">Customer</th>
                      <th className="px-5 py-2.5">Status</th>
                      <th className="px-5 py-2.5">Total</th>
                      <th className="px-5 py-2.5">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80">
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-900">
                            {order.customerName ?? "—"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {order.customerEmail}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={orderBadgeVariant(order.status)}>
                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 font-medium tabular-nums">
                          {formatMoney(order.total)}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isServiceManager && (
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="p-5">
            <CardTitle className="text-base">Service queue</CardTitle>
            <CardDescription>
              Jump to the kanban board to assign technicians and update status.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <Link
              href="/admin/service-requests"
              className="inline-flex text-sm font-semibold text-primary hover:underline"
            >
              Open service requests →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
