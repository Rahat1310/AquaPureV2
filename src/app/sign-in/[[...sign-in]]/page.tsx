import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — AquaPure",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-[#eef5ff] to-white px-4 py-16">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Sign in to AquaPure
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Customers can create an account. Staff use the admin invite link.
          </p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/account"
          forceRedirectUrl="/account"
        />
        <p className="text-center text-sm text-slate-500">
          Staff?{" "}
          <a href="/admin/sign-in" className="font-semibold text-primary hover:underline">
            Admin sign in →
          </a>
        </p>
      </div>
    </main>
  );
}
