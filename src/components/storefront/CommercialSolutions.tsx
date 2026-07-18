"use client";

import {
  Building2,
  Check,
  Factory,
  GraduationCap,
  Hotel,
  Stethoscope,
  UtensilsCrossed,
  Building,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { QuoteRequestDialog } from "@/components/storefront/QuoteRequestDialog";
import { cn } from "@/lib/utils";

interface Segment {
  key: string;
  label: string;
  icon: LucideIcon;
  headline: string;
  description: string;
  capacity: string;
  benefits: string[];
}

const segments: Segment[] = [
  {
    key: "hotels",
    label: "Hotels",
    icon: Hotel,
    headline: "Consistent, great-tasting water for every guest.",
    description:
      "Central RO plants and point-of-use dispensers that deliver reliable water across rooms, kitchens, and banquet halls.",
    capacity: "500 – 3,000 GPD",
    benefits: [
      "Central + point-of-use configurations",
      "Low-maintenance, high-uptime systems",
      "Kitchen and guest-safe mineral balance",
      "Priority AMC & emergency service",
    ],
  },
  {
    key: "hospitals",
    label: "Hospitals",
    icon: Stethoscope,
    headline: "Medical-grade water you can depend on.",
    description:
      "Purpose-built treatment lines meeting stringent purity standards for labs, dialysis, and general use.",
    capacity: "250 – 2,000 GPD",
    benefits: [
      "Lab & dialysis-grade purity",
      "Redundant systems for zero downtime",
      "Compliance-ready documentation",
      "24/7 monitoring & support",
    ],
  },
  {
    key: "factories",
    label: "Factories",
    icon: Factory,
    headline: "Process water engineered for production.",
    description:
      "Industrial RO, softeners, and iron-removal plants tuned to your process water specifications.",
    capacity: "1,000 – 5,000 GPD",
    benefits: [
      "Stainless-steel industrial frames",
      "Custom capacity & pressure planning",
      "Softening & iron/arsenic removal",
      "Turnkey installation & commissioning",
    ],
  },
  {
    key: "restaurants",
    label: "Restaurants",
    icon: UtensilsCrossed,
    headline: "Pure water that protects taste and equipment.",
    description:
      "Compact commercial RO systems that keep beverages crisp and protect kitchen equipment from scale.",
    capacity: "100 – 800 GPD",
    benefits: [
      "Scale protection for equipment",
      "Better taste for beverages & ice",
      "Space-saving under-counter options",
      "Quick filter-swap servicing",
    ],
  },
  {
    key: "schools",
    label: "Schools",
    icon: GraduationCap,
    headline: "Safe drinking water for every student.",
    description:
      "Multi-tap purification stations designed for high-traffic campuses and hostels.",
    capacity: "250 – 1,500 GPD",
    benefits: [
      "Multi-tap drinking stations",
      "Child-safe, tamper-resistant design",
      "High-volume storage",
      "Affordable AMC packages",
    ],
  },
  {
    key: "apartments",
    label: "Apartments",
    icon: Building2,
    headline: "Whole-building water treatment made simple.",
    description:
      "Central treatment plants and per-unit purifiers for residential complexes and towers.",
    capacity: "500 – 3,000 GPD",
    benefits: [
      "Central + per-unit solutions",
      "Consistent supply across floors",
      "Managed maintenance contracts",
      "Transparent capacity planning",
    ],
  },
  {
    key: "offices",
    label: "Offices",
    icon: Building,
    headline: "Reliable hydration for your workplace.",
    description:
      "Hot & cold dispensers and RO systems sized for teams of any scale.",
    capacity: "100 – 1,000 GPD",
    benefits: [
      "Hot & cold dispensing",
      "Sleek, modern designs",
      "Flexible rental & purchase plans",
      "Scheduled servicing",
    ],
  },
];

export function CommercialSolutions() {
  const [activeKey, setActiveKey] = useState(segments[0].key);
  const [dialogOpen, setDialogOpen] = useState(false);
  const active = segments.find((s) => s.key === activeKey)!;

  return (
    <>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {segments.map((segment) => {
          const isActive = segment.key === activeKey;
          const Icon = segment.icon;
          return (
            <button
              key={segment.key}
              type="button"
              onClick={() => setActiveKey(segment.key)}
              aria-pressed={isActive}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                isActive
                  ? "border-primary bg-primary text-white shadow-[0_10px_24px_rgba(27,79,209,0.22)]"
                  : "border-border bg-white text-slate-600 hover:border-primary/40 hover:text-primary",
              )}
            >
              <Icon className="size-4" />
              {segment.label}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="mt-8 grid gap-8 overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_20px_60px_rgba(25,65,130,0.1)] lg:grid-cols-2">
        <div className="relative min-h-[280px] overflow-hidden bg-gradient-to-br from-primary via-[#1746bd] to-sky-500 p-8 text-white">
          <div className="absolute -right-12 -top-12 size-56 rounded-full bg-white/10 blur-2xl" />
          <active.icon className="size-12" />
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {active.headline}
          </h2>
          <div className="mt-6 inline-flex flex-col rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-200">
              Capacity range
            </span>
            <span className="mt-1 text-xl font-extrabold">{active.capacity}</span>
          </div>
        </div>

        <div className="p-8">
          <p className="text-sm leading-7 text-slate-600">{active.description}</p>
          <ul className="mt-6 grid gap-3">
            {active.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="size-3.5" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => setDialogOpen(true)}>
              Get Consultation
            </Button>
            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <QuoteRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={`${active.label} consultation request`}
        defaultRequirement={`I'm interested in a commercial water solution for ${active.label.toLowerCase()} (capacity ${active.capacity}). Please get in touch.`}
      />
    </>
  );
}
