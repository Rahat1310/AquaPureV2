"use client";

import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const productLinks = [
  { label: "Family", href: "/category/residential" },
  { label: "Mother & Child", href: "/category/mother-and-child" },
  { label: "Accessories", href: "/category/accessories" },
  { label: "Office / Commercial", href: "/commercial-solutions" },
];

const helpLinks = [
  { label: "Brands", href: "/brands" },
  { label: "Contact Us", href: "/contact" },
  { label: "My Account", href: "/sign-in" },
  { label: "Request Quote", href: "/commercial-solutions" },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-[#092762] text-white">
      <div className="section-shell grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-3"
            aria-label="Padma Mineral Water home"
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-sm font-black tracking-tight text-primary">
              PMW
            </span>
            <span>
              <span className="block text-xl font-extrabold tracking-tight">PMW</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                Safe water. Safe life.
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-blue-100/80">
            Padma Mineral Water delivers clean purification for homes and businesses
            across Bangladesh.
          </p>
          <div className="mt-5 space-y-2.5 text-sm text-blue-100">
            <a
              href="tel:+8801700000000"
              className="flex items-center gap-2.5 transition hover:text-white"
            >
              <Phone className="size-4 text-sky-300" /> +880 1700-000000
            </a>
            <a
              href="mailto:care@padmamineralwater.com"
              className="flex items-center gap-2.5 transition hover:text-white"
            >
              <Mail className="size-4 text-sky-300" /> care@padmamineralwater.com
            </a>
            <span className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-sky-300" />
              House 24, Road 11, Banani, Dhaka
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-extrabold">Products</h3>
          <ul className="mt-4 space-y-2.5">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-blue-100/75 transition hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-extrabold">Help</h3>
          <ul className="mt-4 space-y-2.5">
            {helpLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-blue-100/75 transition hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className={cn(
              buttonVariants(),
              "mt-6 bg-white text-primary hover:bg-sky-50 hover:text-primary",
            )}
          >
            Get in touch
          </Link>
        </div>

        <div className="h-full min-h-[180px] w-full overflow-hidden rounded-2xl">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.0543666249615!2d90.40428941498198!3d23.791578384568853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70b8061e7c5%3A0xb3fcb0ff72c3d1b8!2sRoad%2011%2C%20Dhaka%201212!5e0!3m2!1sen!2sbd!4v1655000000000!5m2!1sen!2sbd"
            className="size-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Padma Mineral Water Location"
          />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="section-shell flex flex-col gap-3 py-5 text-xs text-blue-200/70 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-sky-300" />
            © {new Date().getFullYear()} Padma Mineral Water. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/contact">Contact</Link>
            <Link href="/brands">Brands</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
