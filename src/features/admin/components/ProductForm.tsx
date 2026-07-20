"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createProduct, updateProduct } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  images: string[];
  brand: string;
  status: "ACTIVE" | "DRAFT" | "DISCONTINUED";
  categoryId: string;
  isFeatured: boolean;
  isBestSeller: boolean;
};

type ProductFormProps = {
  categories: CategoryOption[];
  initial?: ProductFormValues;
  mode: "create" | "edit";
};

function slugifyClient(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export function ProductForm({ categories, initial, mode }: ProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [compareAtPrice, setCompareAtPrice] = useState(
    initial?.compareAtPrice != null ? String(initial.compareAtPrice) : "",
  );
  const [stock, setStock] = useState(String(initial?.stock ?? 0));
  const [imagesText, setImagesText] = useState(
    (initial?.images ?? []).join("\n"),
  );
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [status, setStatus] = useState<ProductFormValues["status"]>(
    initial?.status ?? "DRAFT",
  );
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? "",
  );
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isBestSeller, setIsBestSeller] = useState(
    initial?.isBestSeller ?? false,
  );

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugifyClient(value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const images = imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name,
      slug,
      sku,
      description: description || null,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      stock: Number.parseInt(stock, 10),
      images,
      brand: brand || null,
      status,
      categoryId,
      isFeatured,
      isBestSeller,
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProduct(payload)
          : await updateProduct({ id: initial!.id!, ...payload });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (mode === "create" && result.id) {
        router.push(`/admin/products/${result.id}`);
      } else {
        router.push("/admin/products");
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Name
          </label>
          <Input
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="h-10 rounded-lg"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Slug
          </label>
          <Input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="h-10 rounded-lg font-mono text-xs"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            SKU
          </label>
          <Input
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="h-10 rounded-lg font-mono text-xs"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Category
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Status
          </label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as ProductFormValues["status"])
            }
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="DISCONTINUED">Discontinued</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Price (BDT)
          </label>
          <Input
            required
            type="number"
            min={0.01}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-10 rounded-lg"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Compare-at price
          </label>
          <Input
            type="number"
            min={0.01}
            step="0.01"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            className="h-10 rounded-lg"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Stock
          </label>
          <Input
            required
            type="number"
            min={0}
            step={1}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="h-10 rounded-lg"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Brand
          </label>
          <Input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="h-10 rounded-lg"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Image URLs (one per line)
          </label>
          <textarea
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            rows={3}
            placeholder="/images/product.jpg"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-mono text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <div className="flex items-center gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="size-4 rounded border-slate-300"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isBestSeller}
              onChange={(e) => setIsBestSeller(e.target.checked)}
              className="size-4 rounded border-slate-300"
            />
            Best seller
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending || !categoryId}>
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
