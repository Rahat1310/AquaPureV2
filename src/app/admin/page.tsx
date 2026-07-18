import { auth } from "@/auth";
import { redirect } from "next/navigation";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "SERVICE_MANAGER", "SUPPORT"];

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/staff/login");
  const role = (session.user as { role?: string }).role ?? "";
  if (!STAFF_ROLES.includes(role)) redirect("/staff/login");

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user?.name} ({role})</p>
    </main>
  );
}
