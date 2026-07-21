"use server";

import { redirect } from "next/navigation";

import {
  clearAdminSession,
  getAdminCredentials,
  setAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export type AdminLoginState = {
  error?: string;
};

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { email: expectedEmail, password: expectedPassword } =
    getAdminCredentials();

  if (!expectedEmail || !expectedPassword) {
    return {
      error:
        "Admin login is not configured. Add ADMIN_EMAIL and ADMIN_PASSWORD to .env, then restart npm run dev.",
    };
  }

  if (!verifyAdminCredentials(email, password)) {
    return {
      error: "Invalid email or password. Use the exact ADMIN_EMAIL from .env.",
    };
  }

  await setAdminSession(email);
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}
