import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthShell } from "@/components/shared/AuthShell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Create Account — Padma Mineral Water",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Padma Mineral Water for orders, wishlist, and service."
    >
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/account"
        appearance={clerkAppearance}
      />
    </AuthShell>
  );
}
