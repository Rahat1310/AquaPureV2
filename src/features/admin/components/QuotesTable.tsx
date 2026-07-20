"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateQuoteRequest } from "@/features/admin/actions";
import {
  formatDate,
  QUOTE_STATUS_LABELS,
} from "@/features/admin/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUSES = ["NEW", "CONTACTED", "CLOSED_WON", "CLOSED_LOST"] as const;

export type QuoteRow = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string;
  requirement: string;
  status: string;
  createdAt: Date | string;
  assignedTo: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;
};

export type SalesRepOption = {
  id: string;
  name: string | null;
  email: string | null;
};

type QuotesTableProps = {
  quotes: QuoteRow[];
  salesReps: SalesRepOption[];
  q?: string;
  status?: string;
};

function statusVariant(
  status: string,
): "warning" | "secondary" | "success" | "sale" | "outline" {
  if (status === "NEW") return "warning";
  if (status === "CONTACTED") return "secondary";
  if (status === "CLOSED_WON") return "success";
  if (status === "CLOSED_LOST") return "sale";
  return "outline";
}

export function QuotesTable({
  quotes,
  salesReps,
  q = "",
  status = "",
}: QuotesTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save(
    quote: QuoteRow,
    patch: { status?: string; assignedToId?: string | null },
  ) {
    setError(null);
    startTransition(async () => {
      const result = await updateQuoteRequest({
        id: quote.id,
        status: (patch.status ?? quote.status) as (typeof STATUSES)[number],
        assignedToId:
          patch.assignedToId !== undefined
            ? patch.assignedToId
            : (quote.assignedTo?.id ?? null),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <form
        method="get"
        action="/admin/quotes"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Search
          </label>
          <Input
            name="q"
            defaultValue={q}
            placeholder="Name, company, email…"
            className="h-10 rounded-lg"
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Status
          </label>
          <select
            name="status"
            defaultValue={status}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {QUOTE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm" className="h-10">
          Filter
        </Button>
      </form>

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
                <th className="px-3 py-3">Lead</th>
                <th className="px-3 py-3">Requirement</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Assigned</th>
                <th className="px-3 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No quote requests found.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{quote.name}</p>
                      {quote.company && (
                        <p className="text-xs text-slate-500">{quote.company}</p>
                      )}
                      <p className="text-xs text-slate-400">{quote.email}</p>
                      <p className="text-xs text-slate-400">{quote.phone}</p>
                    </td>
                    <td className="max-w-xs px-3 py-3">
                      <p className="line-clamp-3 text-xs text-slate-600">
                        {quote.requirement}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1.5">
                        <Badge variant={statusVariant(quote.status)}>
                          {QUOTE_STATUS_LABELS[quote.status] ?? quote.status}
                        </Badge>
                        <select
                          disabled={pending}
                          value={quote.status}
                          onChange={(e) =>
                            save(quote, { status: e.target.value })
                          }
                          className="block h-8 w-full min-w-[140px] rounded-md border border-border bg-white px-2 text-xs outline-none focus:border-primary"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {QUOTE_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        disabled={pending}
                        value={quote.assignedTo?.id ?? ""}
                        onChange={(e) =>
                          save(quote, {
                            assignedToId: e.target.value || null,
                          })
                        }
                        className="h-8 w-full min-w-[140px] rounded-md border border-border bg-white px-2 text-xs outline-none focus:border-primary"
                      >
                        <option value="">Unassigned</option>
                        {salesReps.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name ?? r.email}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {formatDate(quote.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
