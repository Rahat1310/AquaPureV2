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
    getFeaturedProducts(6),
    getFeaturedAccessories(4),
  ]);

  const heroSlides: HeroSlide[] =
    featured.length > 0
      ? featured.slice(0, 6).map((product) => ({
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
            <h1 className="mt-6 max-w-3xl overflow-visible text-4xl font-bold leading-[1.15] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[62px]">
              <span className="block pb-1">Purity in every</span>
              <span className="mt-1 inline-flex items-center gap-2 overflow-visible sm:gap-3">
                <span className="inline-block overflow-visible bg-gradient-to-r from-primary via-sky-500 to-cyan-400 bg-clip-text py-1 pl-[0.08em] pr-[0.18em] italic text-transparent [-webkit-box-decoration-break:clone]">
                  drop
                </span>
                <span
                  className="relative inline-flex shrink-0 items-end self-center"
                  aria-hidden="true"
                >
                  <span className="absolute inset-0 scale-150 rounded-full bg-sky-300/30 blur-2xl" />
                  <svg
                    viewBox="0 0 56 72"
                    className="relative h-[0.9em] w-auto drop-shadow-[0_10px_22px_rgba(27,79,209,0.28)]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="hero-drop-fill"
                        x1="10"
                        y1="4"
                        x2="48"
                        y2="68"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#38BDF8" />
                        <stop offset="0.45" stopColor="#1B4FD1" />
                        <stop offset="1" stopColor="#0EA5E9" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M28 3C28 3 6 28.5 6 46.2C6 58.4 15.4 68 28 68C40.6 68 50 58.4 50 46.2C50 28.5 28 3 28 3Z"
                      fill="url(#hero-drop-fill)"
                    />
                    <path
                      d="M18.5 48.5C21.8 55.2 30.2 57.8 38.5 52.2"
                      stroke="#7DD3FC"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <ellipse
                      cx="21"
                      cy="30"
                      rx="5.5"
                      ry="8"
                      fill="white"
                      fillOpacity="0.35"
                    />
                  </svg>
                </span>
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
      <Section
        id="featured"
        muted
        noTopBorder
        className="overflow-hidden bg-gradient-to-b from-sky-100/80 via-[#eef5ff] to-indigo-50/70"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-sky-300/35 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-4rem] top-1/3 size-80 rounded-full bg-blue-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-cyan-200/40 blur-3xl"
        />
        <div className="relative z-[1]">
          <FeaturedSectionHeader
            eyebrow="Popular"
            title="Featured products."
            description="Ready-to-buy models for everyday water care."
            href={categoryHref("residential")}
            viewAllLabel="View all products"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} {...toProductCardProps(product)} />
            ))}
          </div>
        </div>
      </Section>

      {/* Featured accessories */}
      {accessories.length > 0 && (
        <Section
          id="accessories"
          className="overflow-hidden border-y border-blue-100/80 bg-gradient-to-b from-blue-50 via-slate-50 to-sky-100/90"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/4 top-0 size-72 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 bottom-8 size-80 rounded-full bg-sky-300/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-1/4 left-[-3rem] size-56 rounded-full bg-indigo-200/35 blur-3xl"
          />
          <div className="relative z-[1]">
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
