"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  {
    href: "/account/service-requests",
    label: "Service Requests",
    icon: Wrench,
  },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label="Account"
        className="hidden lg:block lg:sticky lg:top-[110px] lg:self-start"
      >
        <div className="rounded-2xl border border-blue-100/80 bg-white/80 p-3 shadow-[0_18px_55px_rgba(25,65,130,0.08)] backdrop-blur-xl">
          <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Account
          </p>
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                      active
                        ? "bg-primary text-white shadow-[0_8px_20px_rgba(27,79,209,0.22)]"
                        : "text-slate-600 hover:bg-secondary hover:text-primary",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-1">
              <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="size-4 shrink-0" />
                  Log out
                </button>
              </SignOutButton>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile tabs */}
      <nav
        aria-label="Account"
        className="lg:hidden -mx-1 overflow-x-auto pb-1"
      >
        <ul className="flex min-w-max gap-1.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition",
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "border border-blue-100 bg-white/80 text-slate-600 backdrop-blur hover:border-primary/30 hover:text-primary",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-white/80 px-3.5 py-2 text-xs font-bold text-rose-600 backdrop-blur"
              >
                <LogOut className="size-3.5" />
                Log out
              </button>
            </SignOutButton>
          </li>
        </ul>
      </nav>
    </>
  );
}
