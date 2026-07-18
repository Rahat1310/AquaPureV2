import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Factory,
  FlaskConical,
  Gauge,
  PackageCheck,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import { BrandLogoWall } from "@/components/shared/BrandLogoWall";
import { ProductCard } from "@/components/shared/ProductCard";
import { SafeImage } from "@/components/shared/SafeImage";
import { Section } from "@/components/shared/Section";
import { StatsBar } from "@/components/shared/StatsBar";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { TrustBadgeRow } from "@/components/shared/TrustBadgeRow";
import { BlogCard } from "@/components/storefront/BlogCard";
import { FaqAccordion } from "@/components/storefront/FaqAccordion";
import { SectionHeading } from "@/components/storefront/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import {
  getFeaturedProducts,
  getFeaturedTestimonials,
  getProductsInCategory,
  getRootCategories,
} from "@/features/catalog/queries";
import { categoryHref, toProductCardProps } from "@/features/catalog/presentation";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const categoryIcons: Record<string, typeof Droplets> = {
  residential: Droplets,
  commercial: Factory,
  accessories: Wrench,
  "mother-and-child": ShieldCheck,
  "air-purifier": Sparkles,
};

const purificationStages = [
  { title: "Sediment Filtration", detail: "Removes sand, silt, and suspended particles." },
  { title: "Activated Carbon", detail: "Strips chlorine, odour, and organic compounds." },
  { title: "RO Membrane", detail: "Eliminates dissolved salts, heavy metals, and TDS." },
  { title: "UV + Mineral", detail: "Destroys microbes and rebalances essential minerals." },
];

const installationSteps = [
  { title: "Book Online", detail: "Request a free water assessment in minutes.", icon: PhoneCall },
  { title: "Water Test", detail: "Our expert tests your source and recommends a fit.", icon: FlaskConical },
  { title: "Pro Installation", detail: "Certified technicians install free of charge.", icon: Wrench },
  { title: "Aftercare", detail: "Scheduled servicing keeps performance at its peak.", icon: PackageCheck },
];

const projects = [
  { name: "Radisson Blu, Dhaka", scope: "2,000 LPH central RO plant", tag: "Hospitality" },
  { name: "Square Hospital", scope: "Medical-grade water for 3 wings", tag: "Healthcare" },
  { name: "Pran-RFL Factory", scope: "5,000 GPD process water line", tag: "Industrial" },
];

const blogPosts = [
  { title: "How to read your water TDS the right way", category: "Water Wisdom", read: "4 min read" },
  { title: "RO vs UV vs UF: which purifier fits your home?", category: "Buying Guide", read: "6 min read" },
  { title: "5 signs it is time to change your filters", category: "Maintenance", read: "3 min read" },
];

const faqs = [
  {
    question: "Is installation really free?",
    answer:
      "Yes. Every AquaPure residential and commercial purifier includes free professional installation by our certified technicians within our service areas.",
  },
  {
    question: "How often should filters be replaced?",
    answer:
      "Pre-filters are typically replaced every 6–12 months and the RO membrane every 2–3 years, depending on your local water quality and usage.",
  },
  {
    question: "Do you serve areas outside Dhaka?",
    answer:
      "We deliver nationwide across Bangladesh and provide on-site installation and servicing in all major cities through our dealer and service network.",
  },
  {
    question: "What warranty do I get?",
    answer:
      "Products carry a 1–3 year warranty depending on the model, backed by genuine spare parts and responsive after-sales support.",
  },
];

const commercialStats = [
  { value: "250–5000", label: "GPD capacity range" },
  { value: "7+", label: "Industries served" },
  { value: "48hr", label: "Site assessment" },
  { value: "AMC", label: "Annual maintenance" },
];

export default async function HomePage() {
  const [featured, categories, accessories, testimonials] = await Promise.all([
    getFeaturedProducts(4),
    getRootCategories(),
    getProductsInCategory("accessories", 4),
    getFeaturedTestimonials(3),
  ]);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="water-grid relative overflow-x-clip border-b border-blue-100">
        <div className="pointer-events-none absolute -left-24 top-20 size-72 rounded-full border-[44px] border-white/35" />
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-sky-300/15 blur-2xl" />
        <div className="section-shell relative grid min-h-[600px] items-center gap-12 py-16 lg:grid-cols-[1.04fr_.96fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/75 px-3.5 py-2 text-xs font-bold text-primary shadow-sm backdrop-blur">
              <Droplets className="size-4 fill-sky-200" />
              Bangladesh&apos;s trusted water care partner
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[62px]">
              Pure water for a
              <span className="block bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                healthier tomorrow.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Advanced purification designed around your water, your family, and your everyday life.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#featured" className={cn(buttonVariants({ size: "lg" }))}>
                Explore Purifiers <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/commercial-solutions"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Get a Free Water Test
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
            <div className="pointer-events-none absolute inset-8 rounded-full bg-gradient-to-br from-sky-200/75 to-blue-200/45 blur-2xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/60 p-5 shadow-[0_30px_80px_rgba(27,79,209,0.16)] backdrop-blur sm:p-8">
              <div className="relative aspect-square">
                <SafeImage
                  src="/product-placeholder.svg"
                  alt="AquaPure premium water purifier"
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

      {/* ─── Trust Indicators ─────────────────────────────── */}
      <Section className="relative z-10 -mt-8 py-0 md:py-0" shellClassName="pb-0">
        <TrustBadgeRow />
      </Section>

      {/* ─── Categories ───────────────────────────────────── */}
      <Section>
        <SectionHeading
          eyebrow="Shop by need"
          title="Solutions for every space."
          description="From compact home purifiers to industrial treatment plants — find the right water solution."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories
            .filter((c) => c.productCount > 0 || c.children.length > 0)
            .slice(0, 4)
            .map((category) => {
              const Icon = categoryIcons[category.slug] ?? Droplets;
              return (
                <Link
                  key={category.id}
                  href={categoryHref(category.slug)}
                  className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-[0_16px_50px_rgba(25,65,130,0.07)] transition hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(25,65,130,0.14)]"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {category.children.length} categories
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                    Browse <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
        </div>
      </Section>

      {/* ─── Featured Products (from DB, isFeatured=true) ─── */}
      <Section id="featured" muted>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="left"
            eyebrow="Customer favourites"
            title="Featured purifiers."
            description="Hand-picked models loved for their performance and reliability."
          />
          <Link
            href={categoryHref("residential")}
            className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            View all products <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} {...toProductCardProps(product)} />
          ))}
        </div>
      </Section>

      {/* ─── Commercial Solutions ─────────────────────────── */}
      <Section>
        <div className="relative overflow-hidden rounded-[32px] bg-[#0e2f7f] px-6 py-12 text-white shadow-[0_30px_80px_rgba(14,47,127,0.28)] sm:px-10 lg:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-sky-400/20 blur-2xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-300">
                Commercial &amp; industrial
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
                Water systems engineered for business.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100">
                Purpose-built RO plants, softeners, and treatment systems for hotels, hospitals,
                factories, and more — with capacity planning, installation, and AMC support.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/commercial-solutions"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-white text-primary hover:bg-blue-50 hover:text-primary",
                  )}
                >
                  Explore Solutions
                </Link>
                <Link
                  href="/commercial-solutions"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white",
                  )}
                >
                  Get Consultation
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {commercialStats.map((item) => (
                <div
                  key={item.label}
                  className="flex min-h-[104px] flex-col justify-center rounded-2xl bg-white/10 p-5 backdrop-blur"
                >
                  <strong className="block text-2xl font-extrabold tracking-tight">{item.value}</strong>
                  <span className="mt-1 text-xs text-blue-100">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Technology explainer ─────────────────────────── */}
      <Section muted>
        <SectionHeading
          eyebrow="How it works"
          title="Multi-stage purification technology."
          description="Every drop passes through a precisely engineered sequence before it reaches your glass."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {purificationStages.map((stage, index) => (
            <div
              key={stage.title}
              className="relative rounded-2xl border border-blue-100/80 bg-white p-6 shadow-[0_18px_55px_rgba(25,65,130,0.09)]"
            >
              <span className="grid size-10 place-items-center rounded-full bg-primary text-sm font-extrabold text-white shadow-[0_4px_14px_rgba(27,79,209,0.25)]">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">{stage.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{stage.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Accessories (from DB) ────────────────────────── */}
      {accessories.length > 0 && (
        <Section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow="Keep it running"
              title="Filters & accessories."
              description="Genuine replacement parts and add-ons for peak purifier performance."
            />
            <Link
              href={categoryHref("accessories")}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              Shop accessories <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {accessories.map((product) => (
              <ProductCard key={product.id} {...toProductCardProps(product)} />
            ))}
          </div>
        </Section>
      )}

      {/* ─── Installation Process ─────────────────────────── */}
      <Section muted>
        <SectionHeading
          eyebrow="Simple & free"
          title="Installation in four easy steps."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {installationSteps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white text-primary shadow-[0_14px_40px_rgba(25,65,130,0.1)]">
                <step.icon className="size-7" />
              </span>
              <h3 className="mt-5 text-base font-bold text-slate-900">
                {index + 1}. {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Projects ─────────────────────────────────────── */}
      <Section>
        <SectionHeading
          eyebrow="Proven at scale"
          title="Trusted on landmark projects."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.name}
              className="group overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-[0_18px_55px_rgba(25,65,130,0.09)]"
            >
              <div className="relative aspect-[1.6] bg-gradient-to-br from-primary/90 to-sky-500">
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-primary">
                  {project.tag}
                </span>
                <Gauge className="absolute bottom-4 right-4 size-10 text-white/40" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold tracking-tight text-slate-900">{project.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{project.scope}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Testimonials (from DB reviews) ───────────────── */}
      <Section muted>
        <SectionHeading
          eyebrow="Trusted every day"
          title="Stories from the AquaPure community."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard
              key={t.id}
              quote={t.quote}
              name={t.name}
              role={t.productName}
              rating={t.rating}
              verified={t.verifiedPurchase}
            />
          ))}
        </div>
      </Section>

      {/* ─── Statistics ───────────────────────────────────── */}
      <Section>
        <StatsBar />
      </Section>

      {/* ─── Partner Brands ───────────────────────────────── */}
      <Section>
        <SectionHeading
          eyebrow="World-class technology"
          title="Brands selected for lasting quality."
        />
        <BrandLogoWall className="mt-9" />
      </Section>

      {/* ─── Blog ─────────────────────────────────────────── */}
      <Section muted>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading align="left" eyebrow="Water wisdom" title="From the AquaPure blog." />
          <Link href="/blog" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            Read all articles <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogCard
              key={post.title}
              title={post.title}
              category={post.category}
              readTime={post.read}
            />
          ))}
        </div>
      </Section>

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <Section>
        <SectionHeading eyebrow="Good to know" title="Frequently asked questions." />
        <FaqAccordion items={faqs} className="mt-10" />
      </Section>

      {/* ─── Final CTA ────────────────────────────────────── */}
      <Section>
        <div className="water-grid relative overflow-hidden rounded-[32px] border border-blue-100 px-6 py-14 text-center shadow-[0_24px_70px_rgba(25,65,130,0.12)] sm:px-12">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Ready for cleaner, healthier water?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Book a free water test today and let our experts recommend the perfect purifier for you.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/commercial-solutions" className={cn(buttonVariants({ size: "lg" }))}>
              Book Free Water Test
            </Link>
            <Link
              href={categoryHref("residential")}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Browse Purifiers
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
