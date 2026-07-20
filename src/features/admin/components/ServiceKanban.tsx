"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateServiceRequest } from "@/features/admin/actions";
import {
  formatDate,
  SERVICE_STATUS_LABELS,
} from "@/features/admin/format";
import { Badge } from "@/components/ui/badge";

const COLUMNS = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

export type ServiceRequestCard = {
  id: string;
  type: string;
  status: string;
  notes: string | null;
  customerName: string;
  phone: string;
  createdAt: Date | string;
  user: { id: string; name: string | null; email: string | null } | null;
  technician: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

export type TechnicianOption = {
  id: string;
  name: string | null;
  email: string | null;
};

type ServiceKanbanProps = {
  requests: ServiceRequestCard[];
  technicians: TechnicianOption[];
  canManage: boolean;
};

function columnVariant(
  status: string,
): "warning" | "secondary" | "success" | "sale" | "outline" {
  if (status === "OPEN") return "warning";
  if (status === "IN_PROGRESS") return "secondary";
  if (status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "sale";
  return "outline";
}

export function ServiceKanban({
  requests,
  technicians,
  canManage,
}: ServiceKanbanProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function update(id: string, status: string, technicianId: string | null) {
    setError(null);
    startTransition(async () => {
      const result = await updateServiceRequest({
        id,
        status: status as (typeof COLUMNS)[number],
        technicianId,
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
      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = requests.filter((r) => r.status === col);
          return (
            <div
              key={col}
              className="flex min-h-[280px] flex-col rounded-xl border border-slate-200 bg-slate-50/80"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  {SERVICE_STATUS_LABELS[col] ?? col}
                </span>
                <Badge variant={columnVariant(col)}>{items.length}</Badge>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2">
                {items.length === 0 && (
                  <p className="px-2 py-6 text-center text-xs text-slate-400">
                    No requests
                  </p>
                )}
                {items.map((req) => (
                  <article
                    key={req.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <p className="text-sm font-bold text-slate-900">{req.type}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {req.user?.name ?? req.customerName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {req.user?.email ?? req.phone}
                    </p>
                    {req.notes && (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                        {req.notes}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] text-slate-400">
                      {formatDate(req.createdAt)}
                    </p>

                    {canManage && (
                      <div className="mt-3 space-y-2 border-t border-slate-100 pt-2">
                        <label className="block text-[10px] font-semibold uppercase text-slate-400">
                          Status
                        </label>
                        <select
                          disabled={pending}
                          value={req.status}
                          onChange={(e) =>
                            update(
                              req.id,
                              e.target.value,
                              req.technician?.id ?? null,
                            )
                          }
                          className="h-8 w-full rounded-md border border-border bg-white px-2 text-xs outline-none focus:border-primary"
                        >
                          {COLUMNS.map((s) => (
                            <option key={s} value={s}>
                              {SERVICE_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>

                        <label className="block text-[10px] font-semibold uppercase text-slate-400">
                          Technician
                        </label>
                        <select
                          disabled={pending}
                          value={req.technician?.id ?? ""}
                          onChange={(e) =>
                            update(
                              req.id,
                              req.status,
                              e.target.value || null,
                            )
                          }
                          className="h-8 w-full rounded-md border border-border bg-white px-2 text-xs outline-none focus:border-primary"
                        >
                          <option value="">Unassigned</option>
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name ?? t.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {!canManage && req.technician && (
                      <p className="mt-2 text-xs text-slate-500">
                        Tech: {req.technician.name ?? req.technician.email}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
