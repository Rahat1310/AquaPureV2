"use server";

import { redirect } from "next/navigation";

/**
 * Legacy Auth.js actions — Clerk owns sign-in/up UI now.
 * Kept so old imports do not break builds.
 */
export async function customerSignIn(_formData: FormData): Promise<void> {
  void _formData;
  redirect("/sign-in");
}

export async function staffSignIn(_formData: FormData): Promise<void> {
  void _formData;
  redirect("/admin/sign-in");
}
