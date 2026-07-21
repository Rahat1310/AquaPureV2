import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { adminQuery } from "@/features/admin/guard";
import { AdminPermission } from "@/features/admin/permissions";
import { listCategories } from "@/features/admin/queries";
import { hasAnyRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const session = await getAdminSession();
  if (!hasAnyRole(session, [...AdminPermission.PRODUCTS_WRITE])) {
    redirect("/admin/products");
  }

  const categories = await adminQuery(() => listCategories());

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="text-xs font-semibold text-primary hover:underline"
        >
          ← Products
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
          New product
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a SKU to the PMW catalog.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <ProductForm
          mode="create"
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          }))}
        />
      </div>
    </div>
  );
}
