import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ProductForm } from "@/features/admin/components/ProductForm";
import { adminQuery } from "@/features/admin/guard";
import { AdminPermission } from "@/features/admin/permissions";
import { getProductForEdit, listCategories } from "@/features/admin/queries";
import { getAdminSession } from "@/lib/admin-auth";
import { hasAnyRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function AdminEditProductPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasAnyRole(session, [...AdminPermission.PRODUCTS_WRITE])) {
    redirect("/admin/products");
  }

  const [product, categories] = await Promise.all([
    adminQuery(() => getProductForEdit(id)),
    adminQuery(() => listCategories()),
  ]);

  if (!product) notFound();

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
          Edit product
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {product.name} · {product.sku}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <ProductForm
          mode="edit"
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          }))}
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            description: product.description ?? "",
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            stock: product.stock,
            images: product.images,
            brand: product.brand ?? "",
            status: product.status as "ACTIVE" | "DRAFT" | "DISCONTINUED",
            categoryId: product.categoryId,
            isFeatured: product.isFeatured,
            isBestSeller: product.isBestSeller,
          }}
        />
      </div>
    </div>
  );
}
