import { redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/AdminShell";
import { getSessionRole, navForRole } from "@/features/admin/permissions";
import { getAdminSession } from "@/lib/admin-auth";
import { Role } from "@/lib/rbac";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session?.user) redirect("/admin/login");

  const role = getSessionRole(
    session as { user?: { role?: string } | null },
  );
  if (role !== Role.SUPER_ADMIN && role !== Role.ADMIN) {
    redirect("/admin/login");
  }

  return (
    <AdminShell
      nav={navForRole(role!)}
      user={{
        name: session.user.name,
        email: session.user.email,
        role: role!,
      }}
    >
      {children}
    </AdminShell>
  );
}
