import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminShell } from "@/features/admin/components/AdminShell";
import {
  getSessionRole,
  navForRole,
  STAFF_ROLES,
} from "@/features/admin/permissions";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const role = getSessionRole(
    session as { user?: { role?: string } | null },
  );
  if (!role || !STAFF_ROLES.includes(role)) redirect("/admin/sign-in");

  return (
    <AdminShell
      nav={navForRole(role)}
      user={{
        name: session.user.name,
        email: session.user.email,
        role,
      }}
    >
      {children}
    </AdminShell>
  );
}
