"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  ScrollText,
  Shield,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

import type { NavItem } from "@/features/admin/permissions";
import { roleLabel } from "@/features/admin/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/products": Package,
  "/admin/orders": ClipboardList,
  "/admin/service-requests": Wrench,
  "/admin/quotes": FileText,
  "/admin/users": Users,
  "/admin/audit": ScrollText,
};

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminShellProps = {
  nav: NavItem[];
  user: { name?: string | null; email?: string | null; role: string };
  children: React.ReactNode;
};

export function AdminShell({ nav, user, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-slate-100 lg:flex">
          <div className="flex h-14 items-center gap-2.5 border-b border-slate-800 px-5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/20 text-sky-300">
              <Shield className="size-4" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">AquaPure</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Admin
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5 p-3" aria-label="Admin">
            {nav.map((item) => {
              const Icon = NAV_ICONS[item.href] ?? LayoutDashboard;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  )}
                >
                  <Icon className="size-4 shrink-0 opacity-90" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
            <div className="min-w-0 lg:hidden">
              <p className="truncate text-sm font-bold text-slate-900">AquaPure Admin</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user.name ?? "Staff"}
                </p>
                <p className="text-[11px] font-medium text-slate-500">
                  {roleLabel(user.role)}
                </p>
              </div>
              <SignOutButton signOutOptions={{ redirectUrl: "/admin/sign-in" }}>
                <Button type="button" variant="outline" size="sm" className="gap-1.5">
                  <LogOut className="size-3.5" />
                  Sign out
                </Button>
              </SignOutButton>
            </div>
          </header>

          <nav
            className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden"
            aria-label="Admin"
          >
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
