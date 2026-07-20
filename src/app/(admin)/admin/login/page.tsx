import { redirect } from "next/navigation";

/** Legacy path — Clerk admin sign-in lives at /admin/sign-in */
export default function AdminLoginRedirectPage() {
  redirect("/admin/sign-in");
}
