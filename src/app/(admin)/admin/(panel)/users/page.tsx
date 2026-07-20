import { UsersTable } from "@/features/admin/components/UsersTable";
import { adminQuery } from "@/features/admin/guard";
import { listUsers } from "@/features/admin/queries";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  role?: string;
  page?: string;
}>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const role = params.role?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const data = await adminQuery(() =>
    listUsers({
      q,
      role: role as
        | "SUPER_ADMIN"
        | "ADMIN"
        | "SERVICE_MANAGER"
        | "SUPPORT"
        | "CUSTOMER"
        | undefined,
      page,
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Users
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage roles, 2FA flags, and account suspension (SUPER_ADMIN only).
        </p>
      </div>

      <UsersTable
        users={data.items}
        q={q ?? ""}
        role={role ?? ""}
        page={data.page}
        pageCount={data.pageCount}
        total={data.total}
      />
    </div>
  );
}
