import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign In — AquaPure",
};

/**
 * Staff-only entry. There is no public admin registration —
 * invite users in Clerk, then map email → role via HARDCODED_STAFF_ROLES.
 */
export default function AdminSignInPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Admin Portal
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Staff sign-in only. Accounts are invite-only — no public registration.
        </p>
      </div>
      <SignIn
        routing="path"
        path="/admin/sign-in"
        // Hide sign-up for staff door
        signUpUrl="/admin/sign-in"
        fallbackRedirectUrl="/admin"
        forceRedirectUrl="/admin"
      />
      <p className="mt-6 text-center text-sm text-slate-500">
        Customer?{" "}
        <a href="/sign-in" className="font-semibold text-primary hover:underline">
          Customer sign in →
        </a>
      </p>
    </div>
  );
}
