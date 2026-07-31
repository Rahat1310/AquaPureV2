import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/shared/AuthShell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Create Account — Padma Mineral Water",
};

type PageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

/** Already signed in → skip sign-up entirely. */
export default async function SignUpPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  const { redirect_url } = await searchParams;

  if (userId) {
    const target =
      redirect_url && redirect_url.startsWith("/") && !redirect_url.startsWith("//")
        ? redirect_url
        : "/account";
    redirect(target);
  }

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
