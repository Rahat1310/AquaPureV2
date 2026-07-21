"use client";

import { useActionState } from "react";

import { adminLogin, type AdminLoginState } from "@/features/admin/login-actions";
import { Button } from "@/components/ui/button";

const initial: AdminLoginState = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLogin, initial);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-primary/30 focus:bg-white focus:ring-2"
          placeholder="admin@padmamineralwater.com"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-primary/30 focus:bg-white focus:ring-2"
          placeholder="••••••••"
        />
      </div>
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
