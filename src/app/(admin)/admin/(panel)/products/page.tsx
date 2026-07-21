import Link from "next/link";

import { getAdminSession } from "@/lib/admin-auth";
import { ProductsTable } from "@/features/admin/components/ProductsTable";
import { adminQuery } from "@/features/admin/guard";
import { AdminPermission } from "@/features/admin/permissions";
import { listProducts } from "@/features/admin/queries";
import { hasAnyRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  page?: string;
}>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const session = await getAdminSession();

  const q = params.q?.trim() || undefined;
  const status = params.status?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const data = await adminQuery(() =>
    listProducts({
      q,
      status: status as "ACTIVE" | "DRAFT" | "DISCONTINUED" | undefined,
      page,
    }),
  );

  const canWrite = hasAnyRole(session, [...AdminPermission.PRODUCTS_WRITE]);
  const canStock = hasAnyRole(session, [...AdminPermission.PRODUCTS_STOCK]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {canWrite
              ? "Create, edit, and bulk-manage the catalog."
              : "Update inventory levels for stocked SKUs."}
          </p>
        </div>
        {canWrite && (
          <Link href="/admin/products/new">
            <Button size="sm">New product</Button>
          </Link>
        )}
      </div>

      <ProductsTable
        products={data.items}
        canWrite={canWrite}
        canStock={canStock}
        q={q ?? ""}
        status={status ?? ""}
        page={data.page}
        pageCount={data.pageCount}
        total={data.total}
      />
    </div>
  );
}
