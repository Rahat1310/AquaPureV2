import { redirect } from "next/navigation";

/** Legacy Clerk staff path — admin now uses email/password at /admin/login */
export default function AdminSignInRedirectPage() {
  redirect("/admin/login");
}
