import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us — AquaPure",
  description: "Talk to AquaPure about residence, commercial, or accessory water solutions.",
};

export default function ContactPage() {
  return (
    <div className="section-shell py-12 lg:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
          Contact Us
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          We&apos;re here to help.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          Ask about residence purifiers, commercial systems, accessories, or mother &amp; child
          products.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
        <a
          href="tel:+8801700000000"
          className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:border-primary/30"
        >
          <Phone className="size-5 text-primary" />
          <p className="mt-3 text-sm font-bold text-slate-900">Call</p>
          <p className="mt-1 text-sm text-slate-600">+880 1700-000000</p>
        </a>
        <a
          href="https://wa.me/8801700000000"
          className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:border-primary/30"
        >
          <MessageCircle className="size-5 text-primary" />
          <p className="mt-3 text-sm font-bold text-slate-900">WhatsApp</p>
          <p className="mt-1 text-sm text-slate-600">Chat with our team</p>
        </a>
        <a
          href="mailto:care@aquapure.com"
          className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:border-primary/30"
        >
          <Mail className="size-5 text-primary" />
          <p className="mt-3 text-sm font-bold text-slate-900">Email</p>
          <p className="mt-1 text-sm text-slate-600">care@aquapure.com</p>
        </a>
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <MapPin className="size-5 text-primary" />
          <p className="mt-3 text-sm font-bold text-slate-900">Visit</p>
          <p className="mt-1 text-sm text-slate-600">
            House 24, Road 11, Banani, Dhaka
          </p>
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-3">
        <Link href="/commercial-solutions" className={cn(buttonVariants())}>
          Request Quote
        </Link>
        <Link
          href="/category/residential"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Shop Residence
        </Link>
      </div>
    </div>
  );
}
