import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main>
      <h1>My Dashboard</h1>
      <p>Welcome back, {session.user?.name ?? "Customer"}!</p>
    </main>
  );
}
