"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

const footerColumns = [
  {
    title: "Company",
    links: ["About AquaPure", "Our Projects", "Careers", "Dealer Network", "Blog & Guides"],
  },
  {
    title: "Products",
    links: ["Residential", "Commercial", "Industrial", "Accessories", "Mother & Child"],
  },
  {
    title: "Support",
    links: ["Book a Service", "Track Order", "Warranty", "FAQs", "Contact Us"],
  },
];

const certifications = [
  "ISO 9001 Quality",
  "BSTI Compliant",
  "NSF Components",
  "WQA Standards",
];

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = () => {
    setSubscribed(true);
    reset();
  };

  return (
    <footer className="mt-20 bg-[#092762] text-white">
      <div className="border-b border-white/10 bg-gradient-to-r from-primary via-[#1746bd] to-[#0e73bd]">
        <div className="section-shell flex flex-col gap-6 py-9 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-200">
              Water wisdom, delivered
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
              Join the AquaPure newsletter.
            </h2>
            <p className="mt-1 text-sm text-blue-100">
              Care tips, new solutions, and members-only offers.
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-xl"
            noValidate
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                placeholder="Your email address"
                aria-label="Email address"
                className="h-12 border-white/20 bg-white text-slate-900"
                {...register("email")}
              />
              <Button type="submit" className="h-12 shrink-0 bg-[#08275f] px-6 hover:bg-[#061e49]">
                Subscribe
              </Button>
            </div>
            <p className="mt-2 min-h-4 text-xs text-blue-100" aria-live="polite">
              {errors.email?.message ??
                (subscribed ? "Thanks — you are on the list." : "No spam. Unsubscribe anytime.")}
            </p>
          </form>
        </div>
      </div>

      <div className="section-shell grid gap-10 py-14 lg:grid-cols-[1.25fr_1.7fr_1.1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label="AquaPure home">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-xl font-black text-primary">
              A
            </span>
            <span>
              <span className="block text-xl font-extrabold tracking-tight">AquaPure</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-200">
                Pure water. Pure life.
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-blue-100/80">
            Thoughtful water purification for healthier homes, stronger businesses, and a more sustainable future.
          </p>
          <div className="mt-5 space-y-2.5 text-sm text-blue-100">
            <a href="tel:+8801700000000" className="flex items-center gap-2.5 transition hover:text-white">
              <Phone className="size-4 text-sky-300" /> +880 1700-000000
            </a>
            <a href="mailto:care@aquapure.com" className="flex items-center gap-2.5 transition hover:text-white">
              <Mail className="size-4 text-sky-300" /> care@aquapure.com
            </a>
            <span className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-sky-300" />
              House 24, Road 11, Banani, Dhaka
            </span>
          </div>
          <div className="mt-6 flex gap-2">
            {[
              { label: "Facebook", mark: "f" },
              { label: "Instagram", mark: "◎" },
              { label: "LinkedIn", mark: "in" },
              { label: "YouTube", mark: "▶" },
            ].map(({ label, mark }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-xs font-extrabold text-blue-100 transition hover:-translate-y-0.5 hover:border-sky-300/40 hover:bg-white/10 hover:text-white"
              >
                {mark}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-extrabold">{column.title}</h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-blue-100/70 transition hover:text-white">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-extrabold">Visit our experience center</h3>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1">
            <iframe
              title="AquaPure experience center map"
              src="https://www.google.com/maps?q=Banani%2C%20Dhaka%2C%20Bangladesh&output=embed"
              width="100%"
              height="210"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-xl border-0 grayscale transition duration-500 hover:grayscale-0"
            />
          </div>
        </div>
      </div>

      <div className="border-y border-white/10 bg-white/[0.035]">
        <div className="section-shell grid gap-3 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {certifications.map((certification, index) => (
            <div key={certification} className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-100">
              {index % 2 === 0 ? (
                <BadgeCheck className="size-5 text-sky-300" />
              ) : (
                <ShieldCheck className="size-5 text-sky-300" />
              )}
              {certification}
            </div>
          ))}
        </div>
      </div>

      <div className="section-shell flex flex-col gap-3 py-5 text-xs text-blue-200/65 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} AquaPure. All rights reserved.</p>
        <div className="flex gap-5">
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms & Conditions</Link>
          <Link href="#">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
