import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Heart,
  MapPin,
  Package,
  Wrench,
} from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPortalOverview } from "@/features/portal/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Account — AquaPure",
  description: "Your AquaPure customer portal overview.",
};

export const dynamic = "force-dynamic";

const QUICK_LINKS = [
  {
    href: "/account/orders",
    label: "View Orders",
    desc: "Track deliveries and past purchases",
    icon: Package,
  },
  {
    href: "/account/addresses",
    label: "Manage Addresses",
    desc: "Saved delivery locations",
    icon: MapPin,
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    desc: "Products you’re saving for later",
    icon: Heart,
  },
  {
    href: "/account/service-requests",
    label: "Service Requests",
    desc: "AMC, installation & warranty",
    icon: Wrench,
  },
] as const;

export default async function AccountOverviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?redirect_url=/account");

  const overview = await getPortalOverview(session.user.id);
  const firstName =
    session.user.name?.split(" ")[0] ?? session.user.email?.split("@")[0] ?? "there";

  const stats = [
    {
      label: "Orders",
      value: overview.orderCount,
      href: "/account/orders",
      icon: Package,
    },
    {
      label: "Addresses",
      value: overview.addressCount,
      href: "/account/addresses",
      icon: MapPin,
    },
    {
      label: "Wishlist",
      value: overview.wishlistCount,
      href: "/account/wishlist",
      icon: Heart,
    },
    {
      label: "Open Services",
      value: overview.openServices,
      href: "/account/service-requests",
      icon: Wrench,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-blue-100/80 bg-white/75 p-6 shadow-[0_18px_55px_rgba(25,65,130,0.08)] backdrop-blur-xl sm:p-8">
        <Badge variant="secondary" className="mb-3">
          Customer Portal
        </Badge>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
          Manage orders, addresses, wishlist, and service requests in one place.
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-slate-400">
          At a glance
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, href, icon: Icon }) => (
            <Link key={label} href={href} className="group">
              <Card className="h-full border-blue-100/80 bg-white/85 transition group-hover:-translate-y-0.5 group-hover:shadow-[0_22px_50px_rgba(25,65,130,0.12)]">
                <CardContent className="flex items-center gap-4 p-5">
                  <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-extrabold tracking-tight text-slate-900">
                      {value}
                    </p>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-slate-400">
          Quick links
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map(({ href, label, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-blue-100/80 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:border-primary/25 hover:shadow-md"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">{label}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      <div>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
