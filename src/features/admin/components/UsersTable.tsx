"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateUser } from "@/features/admin/actions";
import { formatDate, roleLabel } from "@/features/admin/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SERVICE_MANAGER",
  "SUPPORT",
  "CUSTOMER",
] as const;

export type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date | string;
};

type UsersTableProps = {
  users: UserRow[];
  q?: string;
  role?: string;
  page: number;
  pageCount: number;
  total: number;
};

export function UsersTable({
  users,
  q = "",
  role = "",
  page,
  pageCount,
  total,
}: UsersTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save(
    user: UserRow,
    patch: Partial<Pick<UserRow, "role" | "isActive" | "twoFactorEnabled">>,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await updateUser({
        id: user.id,
        role: (patch.role ?? user.role) as (typeof ROLES)[number],
        isActive: patch.isActive ?? user.isActive,
        twoFactorEnabled: patch.twoFactorEnabled ?? user.twoFactorEnabled,
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
        action="/admin/users"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Search
          </label>
          <Input
            name="q"
            defaultValue={q}
            placeholder="Name, email, phone…"
            className="h-10 rounded-lg"
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Role
          </label>
          <select
            name="role"
            defaultValue={role}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
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
                <th className="px-3 py-3">User</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">2FA</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Joined</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">
                        {u.name ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        disabled={pending}
                        value={u.role}
                        onChange={(e) => save(u, { role: e.target.value })}
                        className="h-8 rounded-md border border-border bg-white px-2 text-xs outline-none focus:border-primary"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {roleLabel(r)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                        <input
                          type="checkbox"
                          disabled={pending}
                          checked={u.twoFactorEnabled}
                          onChange={(e) =>
                            save(u, { twoFactorEnabled: e.target.checked })
                          }
                        />
                        {u.twoFactorEnabled ? "On" : "Off"}
                      </label>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={u.isActive ? "success" : "sale"}>
                        {u.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant={u.isActive ? "outline" : "default"}
                        className="h-8"
                        disabled={pending}
                        onClick={() => save(u, { isActive: !u.isActive })}
                      >
                        {u.isActive ? "Suspend" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          <span>
            {total} user{total === 1 ? "" : "s"} · Page {page} of {pageCount}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/users?q=${encodeURIComponent(q)}&role=${encodeURIComponent(role)}&page=${page - 1}`}
                className="font-semibold text-primary hover:underline"
              >
                Previous
              </a>
            )}
            {page < pageCount && (
              <a
                href={`/admin/users?q=${encodeURIComponent(q)}&role=${encodeURIComponent(role)}&page=${page + 1}`}
                className="font-semibold text-primary hover:underline"
              >
                Next
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
