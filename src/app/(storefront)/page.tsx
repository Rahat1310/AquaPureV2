import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  ShieldCheck,
} from "lucide-react";

import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { FloatingDroplets } from "@/components/shared/FloatingDroplets";
import { HeroCarousel, type HeroSlide } from "@/components/shared/HeroCarousel";
import { ProductCard } from "@/components/shared/ProductCard";
import { Section } from "@/components/shared/Section";
import { FeaturedSectionHeader } from "@/features/catalog/components/FeaturedSectionHeader";
import { buttonVariants } from "@/components/ui/button";
import { HomeProductSearch } from "@/features/catalog/components/HomeProductSearch";
import { getFeaturedAccessories, getFeaturedProducts } from "@/features/catalog/queries";
import { categoryHref, toProductCardProps } from "@/features/catalog/presentation";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const fallbackHeroSlides: HeroSlide[] = [
  {
    image: "/product-placeholder.svg",
    alt: "PMW RO water purifier",
    title: "Residence RO systems",
    eyebrow: "Family water care",
    description:
      "Compact purification designed for safer, better-tasting water at home.",
  },
  {
    image: "/product-placeholder.svg",
    alt: "PMW commercial purification",
    title: "Commercial solutions",
    eyebrow: "Office / Commercial",
    description:
      "Dependable high-capacity systems built around your daily water demand.",
  },
  {
    image: "/product-placeholder.svg",
    alt: "PMW mother & child care",
    title: "Mother & Child care",
    eyebrow: "Extra care",
    description:
      "Thoughtful water and air-care products for your family's sensitive needs.",
  },
];

export default async function HomePage() {
  const [featured, accessories] = await Promise.all([
    getFeaturedProducts(4),
    getFeaturedAccessories(4),
  ]);

  const heroSlides: HeroSlide[] =
    featured.length > 0
      ? featured.slice(0, 4).map((product) => ({
          image: product.image || "/product-placeholder.svg",
          alt: product.name,
          title: product.name,
          eyebrow: product.categoryName,
          description: product.brand
            ? `${product.brand} purification with genuine support from Padma Mineral Water.`
            : "Reliable purification with genuine support from Padma Mineral Water.",
          href: `/product/${product.slug}`,
        }))
      : fallbackHeroSlides;

  return (
    <>
      {/* Hero — brand copy left, cinematic product stage right */}
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

        <div className="section-shell relative z-[1] grid min-h-[600px] items-center gap-10 py-14 lg:grid-cols-[2fr_3fr] lg:gap-12 lg:py-20">
          <div className="lg:pr-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/75 px-3.5 py-2 text-xs font-bold text-primary shadow-sm backdrop-blur">
              <Droplets className="size-4 fill-sky-200" />
              Bangladesh&apos;s trusted water care partner
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[62px]">
              Pure water for
              <span className="block bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                every people
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Padma Mineral Water — simple, reliable purification for residence,
              commercial, and family care.
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

          <HeroCarousel slides={heroSlides} />
        </div>
      </section>

      {/* Featured products */}
      <Section id="featured" muted noTopBorder>
        <FeaturedSectionHeader
          eyebrow="Popular"
          title="Featured products."
          description="Ready-to-buy models for everyday water care."
          href={categoryHref("residential")}
          viewAllLabel="View all products"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} {...toProductCardProps(product)} />
          ))}
        </div>
      </Section>

      {/* Featured accessories */}
      {accessories.length > 0 && (
        <Section id="accessories">
          <FeaturedSectionHeader
            eyebrow="Essentials"
            title="Featured accessories."
            description="Filters, membranes, meters, and spare parts that keep systems running."
            href={categoryHref("accessories")}
            viewAllLabel="View all accessories"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {accessories.map((product) => (
              <ProductCard key={product.id} {...toProductCardProps(product)} />
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section>
        <div className="water-grid relative overflow-hidden rounded-[28px] border border-blue-100 px-6 py-12 text-center sm:px-10">
          <ShieldCheck className="mx-auto size-10 text-primary" />
          <h2 className="mx-auto mt-4 max-w-xl text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Need help choosing?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
          Tell us your water need — Padma Mineral Water will recommend the right
            purifier or accessory.
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
