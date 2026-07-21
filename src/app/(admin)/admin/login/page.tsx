import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/features/admin/components/AdminLoginForm";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin Sign In — Padma Mineral Water",
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <div className="flex flex-col">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Admin Portal
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in with the hardcoded admin account.
        </p>
      </div>
      <AdminLoginForm />
      <p className="mt-6 text-center text-sm text-slate-500">
        Customer?{" "}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Customer sign in →
        </Link>
      </p>
    </div>
  );
}
