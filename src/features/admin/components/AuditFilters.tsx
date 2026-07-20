"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuditFiltersProps = {
  q?: string;
  entityType?: string;
  userId?: string;
};

const ENTITY_TYPES = [
  "",
  "Product",
  "Order",
  "ServiceRequest",
  "User",
  "QuoteRequest",
];

export function AuditFilters({
  q = "",
  entityType = "",
  userId = "",
}: AuditFiltersProps) {
  return (
    <form
      method="get"
      action="/admin/audit"
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Search
        </label>
        <Input
          name="q"
          defaultValue={q}
          placeholder="Action, entity, user…"
          className="h-10 rounded-lg"
        />
      </div>
      <div className="w-full sm:w-48">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Entity type
        </label>
        <select
          name="entityType"
          defaultValue={entityType}
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
          <option value="">All types</option>
          {ENTITY_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full sm:w-56">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          User ID
        </label>
        <Input
          name="userId"
          defaultValue={userId}
          placeholder="cuid…"
          className="h-10 rounded-lg font-mono text-xs"
        />
      </div>
      <Button type="submit" size="sm" className="h-10">
        Filter
      </Button>
    </form>
  );
}
