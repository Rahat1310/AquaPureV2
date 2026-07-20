import Link from "next/link";

import { AuditFilters } from "@/features/admin/components/AuditFilters";
import { adminQuery } from "@/features/admin/guard";
import { formatDate } from "@/features/admin/format";
import { listAuditLogs } from "@/features/admin/queries";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  entityType?: string;
  userId?: string;
  page?: string;
}>;

function previewJson(value: string | null): string {
  if (!value) return "—";
  try {
    const parsed: unknown = JSON.parse(value);
    return JSON.stringify(parsed, null, 0).slice(0, 120);
  } catch {
    return value.slice(0, 120);
  }
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const entityType = params.entityType?.trim() || undefined;
  const userId = params.userId?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const data = await adminQuery(() =>
    listAuditLogs({ q, entityType, userId, page }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Audit log
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Immutable trail of administrative mutations (SUPER_ADMIN).
        </p>
      </div>

      <AuditFilters
        q={q ?? ""}
        entityType={entityType ?? ""}
        userId={userId ?? ""}
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Before → After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No audit entries found.
                  </td>
                </tr>
              ) : (
                data.items.map((log) => (
                  <tr key={log.id} className="align-top hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {log.user.name ?? "—"}
                      </p>
                      <p className="text-xs text-slate-400">{log.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{log.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <p className="font-semibold">{log.entityType}</p>
                      <p className="font-mono text-[11px] text-slate-400">
                        {log.entityId}
                      </p>
                    </td>
                    <td className="max-w-md px-4 py-3 font-mono text-[11px] text-slate-500">
                      <p className="truncate" title={log.beforeJson ?? undefined}>
                        <span className="font-sans font-semibold text-slate-400">
                          Before:{" "}
                        </span>
                        {previewJson(log.beforeJson)}
                      </p>
                      <p
                        className="mt-1 truncate"
                        title={log.afterJson ?? undefined}
                      >
                        <span className="font-sans font-semibold text-emerald-600">
                          After:{" "}
                        </span>
                        {previewJson(log.afterJson)}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          <span>
            {data.total} entr{data.total === 1 ? "y" : "ies"} · Page {data.page}{" "}
            of {data.pageCount}
          </span>
          <div className="flex gap-2">
            {data.page > 1 && (
              <Link
                href={`/admin/audit?q=${encodeURIComponent(q ?? "")}&entityType=${encodeURIComponent(entityType ?? "")}&userId=${encodeURIComponent(userId ?? "")}&page=${data.page - 1}`}
                className="font-semibold text-primary hover:underline"
              >
                Previous
              </Link>
            )}
            {data.page < data.pageCount && (
              <Link
                href={`/admin/audit?q=${encodeURIComponent(q ?? "")}&entityType=${encodeURIComponent(entityType ?? "")}&userId=${encodeURIComponent(userId ?? "")}&page=${data.page + 1}`}
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
