import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/shared/AuthShell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Sign In — Padma Mineral Water",
};

type PageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

/** Already signed in → go to intended page instead of sitting on /sign-in. */
export default async function SignInPage({ searchParams }: PageProps) {
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
