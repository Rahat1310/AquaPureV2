import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | Padma Mineral Water",
  description: "Secure administrative access for PMW staff.",
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-900 antialiased selection:bg-primary/20 selection:text-primary">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
