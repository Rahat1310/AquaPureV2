import type { Metadata } from "next";

import { CommercialSolutions } from "@/components/storefront/CommercialSolutions";

export const metadata: Metadata = {
  title: "Commercial & Industrial Water Solutions",
  description:
    "Tailored water purification for hotels, hospitals, factories, restaurants, schools, apartments, and offices. Get a free consultation from AquaPure.",
  openGraph: {
    title: "Commercial & Industrial Water Solutions | AquaPure",
    description:
      "Tailored water purification for hotels, hospitals, factories, restaurants, schools, apartments, and offices.",
  },
};

export default function CommercialSolutionsPage() {
  return (
    <>
      <section className="water-grid border-b border-blue-100">
        <div className="section-shell max-w-2xl py-14 lg:py-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
            Commercial &amp; industrial
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Water solutions built for your business.
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Choose your industry to see recommended capacity, benefits, and to request a tailored consultation.
          </p>
        </div>
      </section>

      <section className="section-shell py-12 lg:py-16">
        <CommercialSolutions />
      </section>
    </>
  );
}
