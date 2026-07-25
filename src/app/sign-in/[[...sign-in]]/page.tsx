import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthShell } from "@/components/shared/AuthShell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Sign In — Padma Mineral Water",
};

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage orders, wishlist, and your account."
    >
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/account"
        appearance={clerkAppearance}
      />
    </AuthShell>
  );
}
