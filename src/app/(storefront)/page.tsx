import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Factory,
  HeartHandshake,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { FloatingDroplets } from "@/components/shared/FloatingDroplets";
import { LightCaustics } from "@/components/shared/LightCaustics";
import { ProductCard } from "@/components/shared/ProductCard";
import { SafeImage } from "@/components/shared/SafeImage";
import { Section } from "@/components/shared/Section";
import { FaqAccordion } from "@/features/catalog/components/FaqAccordion";
import { SectionHeading } from "@/features/catalog/components/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { HomeProductSearch } from "@/features/catalog/components/HomeProductSearch";
import { getFeaturedProducts } from "@/features/catalog/queries";
import { categoryHref, toProductCardProps } from "@/features/catalog/presentation";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const shopCategories = [
  {
    name: "Residence",
    slug: "residential",
    detail: "RO, UV, hot & cold, and home dispensers.",
    icon: Droplets,
  },
  {
    name: "Commercial",
    slug: "commercial",
    href: "/commercial-solutions",
    detail: "RO plants and systems for business.",
    icon: Factory,
  },
  {
    name: "Accessories",
    slug: "accessories",
    detail: "Filters, membranes, taps, and meters.",
    icon: Wrench,
  },
  {
    name: "Mother & Child",
    slug: "mother-and-child",
    detail: "Alkaline, formalin removal, shower & air.",
    icon: HeartHandshake,
  },
] as const;

const faqs = [
  {
    question: "Is installation free?",
    answer:
      "Yes. AquaPure purifiers include free professional installation within our service areas.",
  },
  {
    question: "How often should filters be replaced?",
    answer:
      "Pre-filters every 6–12 months and the RO membrane every 2–3 years, depending on water quality.",
  },
  {
    question: "What warranty do I get?",
    answer:
      "Products carry a 1–3 year warranty depending on the model, with genuine spare parts support.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts(4);

  return (
    <>
      {/* Hero — brand first with restored ambient UI */}
      <section className="water-grid relative overflow-x-clip border-b border-blue-100">
        <AmbientBackground />
        <FloatingDroplets />
        {/* Decorative geometric rings (original hero UI) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-20 size-72 rounded-full border-[44px] border-white/40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-sky-300/20 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-10 left-[42%] size-56 rounded-full border-[28px] border-sky-200/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 right-[18%] size-64 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="section-shell relative z-[1] grid min-h-[600px] items-center gap-12 py-16 lg:grid-cols-[1.04fr_.96fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/75 px-3.5 py-2 text-xs font-bold text-primary shadow-sm backdrop-blur">
              <Droplets className="size-4 fill-sky-200" />
              Bangladesh&apos;s trusted water care partner
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[62px]">
              Pure water for
              <span className="block bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                every home.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Simple, reliable purification for residence, commercial, and family care.
            </p>
            <HomeProductSearch className="mt-6" />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="#featured" className={cn(buttonVariants({ size: "lg" }))}>
                Shop Purifiers <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contact"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Contact Us
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-600">
              {["Free installation", "Genuine warranty", "Expert aftercare"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <LightCaustics />
            <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/60 p-5 shadow-[0_30px_80px_rgba(27,79,209,0.16)] backdrop-blur sm:p-8">
              <div className="relative aspect-square">
                <SafeImage
                  src="/product-placeholder.svg"
                  alt="AquaPure water purifier"
                  fill
                  priority
                  className="object-contain"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white bg-white/95 p-4 shadow-lg backdrop-blur sm:right-auto sm:max-w-[220px]">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <ShieldCheck className="size-5 shrink-0 text-primary" />
                    Multi-stage protection
                  </span>
                  <span className="mt-1 block text-[11px] text-slate-500">
                    Clean. Balanced. Great tasting.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop categories */}
      <Section>
        <SectionHeading
          eyebrow="Shop"
          title="What do you need?"
          description="Four clear collections — nothing extra."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shopCategories.map((category) => {
            const Icon = category.icon;
            const href =
              "href" in category && category.href
                ? category.href
                : categoryHref(category.slug);
            return (
              <Link
                key={category.slug}
                href={href}
                className="group rounded-2xl border border-blue-100 bg-white p-6 shadow-[0_12px_36px_rgba(25,65,130,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(25,65,130,0.12)]"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900">
                  {category.name}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">{category.detail}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  Browse <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* Featured */}
      <Section id="featured" muted noTopBorder>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="left"
            eyebrow="Popular"
            title="Featured products."
            description="Ready-to-buy models for everyday water care."
          />
          <Link
            href={categoryHref("residential")}
            className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} {...toProductCardProps(product)} />
          ))}
        </div>
      </Section>

      {/* Short FAQ */}
      <Section>
        <SectionHeading eyebrow="Help" title="Common questions." />
        <FaqAccordion items={faqs} className="mt-8" />
      </Section>

      {/* CTA */}
      <Section>
        <div className="water-grid relative overflow-hidden rounded-[28px] border border-blue-100 px-6 py-12 text-center sm:px-10">
          <ShieldCheck className="mx-auto size-10 text-primary" />
          <h2 className="mx-auto mt-4 max-w-xl text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Need help choosing?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
            Tell us your water need — we&apos;ll recommend the right purifier or accessory.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className={cn(buttonVariants({ size: "lg" }))}>
              Contact Us
            </Link>
            <Link
              href="/commercial-solutions"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Commercial Quote
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
