"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  bulkProductAction,
  deleteProduct,
  updateProductInventory,
} from "@/features/admin/actions";
import {
  formatMoney,
  PRODUCT_STATUS_LABELS,
} from "@/features/admin/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  brand: string | null;
  category: { id: string; name: string; slug: string } | null;
};

type ProductsTableProps = {
  products: ProductRow[];
  canWrite: boolean;
  canStock: boolean;
  q?: string;
  status?: string;
  page: number;
  pageCount: number;
  total: number;
};

function statusVariant(status: string): "success" | "warning" | "outline" | "sale" {
  if (status === "ACTIVE") return "success";
  if (status === "DRAFT") return "warning";
  if (status === "DISCONTINUED") return "sale";
  return "outline";
}

export function ProductsTable({
  products,
  canWrite,
  canStock,
  q = "",
  status = "",
  page,
  pageCount,
  total,
}: ProductsTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({});

  const allIds = products.map((p) => p.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.includes(id));

  function toggleAll() {
    setSelected(allSelected ? [] : allIds);
  }

  function toggleOne(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function runBulk(action: "delete" | "status", nextStatus?: string) {
    if (selected.length === 0) return;
    if (action === "delete" && !confirm(`Delete ${selected.length} product(s)?`)) return;

    setError(null);
    startTransition(async () => {
      const result = await bulkProductAction({
        productIds: selected,
        action,
        status: nextStatus as "ACTIVE" | "DRAFT" | "DISCONTINUED" | undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSelected([]);
      router.refresh();
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete “${name}”?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleStockSave(productId: string) {
    const raw = stockEdits[productId];
    if (raw === undefined) return;
    const stock = Number.parseInt(raw, 10);
    if (Number.isNaN(stock) || stock < 0) {
      setError("Stock must be a non-negative integer.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateProductInventory({ productId, stock });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStockEdits((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        method="get"
        action="/admin/products"
      >
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Search
          </label>
          <Input
            name="q"
            defaultValue={q}
            placeholder="Name, SKU, slug, brand…"
            className="h-10 rounded-lg"
          />
        </div>
        <div className="w-full sm:w-44">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Status
          </label>
          <select
            name="status"
            defaultValue={status}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="DISCONTINUED">Discontinued</option>
          </select>
        </div>
        <Button type="submit" size="sm" className="h-10">
          Filter
        </Button>
      </form>

      {canWrite && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-xs font-semibold text-slate-600">
            {selected.length} selected
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => runBulk("status", "ACTIVE")}
          >
            Mark Active
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => runBulk("status", "DRAFT")}
          >
            Mark Draft
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => runBulk("status", "DISCONTINUED")}
          >
            Discontinue
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() => runBulk("delete")}
          >
            Delete
          </Button>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                {canWrite && (
                  <th className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                )}
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={canWrite ? 8 : 7}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    {canWrite && (
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(p.id)}
                          onChange={() => toggleOne(p.id)}
                          aria-label={`Select ${p.name}`}
                        />
                      </td>
                    )}
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      {p.brand && (
                        <p className="text-xs text-slate-500">{p.brand}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-600">
                      {p.sku}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {p.category?.name ?? "—"}
                    </td>
                    <td className="px-3 py-3 font-medium">{formatMoney(p.price)}</td>
                    <td className="px-3 py-3">
                      {canStock && !canWrite ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={0}
                            className="h-8 w-20 rounded-md px-2"
                            value={stockEdits[p.id] ?? String(p.stock)}
                            onChange={(e) =>
                              setStockEdits((prev) => ({
                                ...prev,
                                [p.id]: e.target.value,
                              }))
                            }
                          />
                          {stockEdits[p.id] !== undefined &&
                            stockEdits[p.id] !== String(p.stock) && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                                disabled={pending}
                                onClick={() => handleStockSave(p.id)}
                              >
                                Save
                              </Button>
                            )}
                        </div>
                      ) : (
                        <span
                          className={
                            p.stock <= 5 ? "font-semibold text-amber-700" : ""
                          }
                        >
                          {p.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={statusVariant(p.status)}>
                        {PRODUCT_STATUS_LABELS[p.status] ?? p.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {canWrite && (
                          <>
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="inline-flex h-8 items-center rounded-lg border border-border bg-white px-3.5 text-xs font-semibold text-foreground transition hover:border-primary/35 hover:bg-secondary"
                            >
                              Edit
                            </Link>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 text-rose-600 hover:text-rose-700"
                              disabled={pending}
                              onClick={() => handleDelete(p.id, p.name)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                        {canStock && !canWrite && (
                          <span className="text-xs text-slate-400">Stock only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          <span>
            {total} product{total === 1 ? "" : "s"} · Page {page} of {pageCount}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/products?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&page=${page - 1}`}
                className="font-semibold text-primary hover:underline"
              >
                Previous
              </Link>
            )}
            {page < pageCount && (
              <Link
                href={`/admin/products?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&page=${page + 1}`}
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
