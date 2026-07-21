import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — Padma Mineral Water",
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-[#eef5ff] to-white px-4 py-16">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Create your PMW account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Join Padma Mineral Water to track orders, wishlist, and service requests.
          </p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/account"
          forceRedirectUrl="/account"
        />
      </div>
    </main>
  );
}
