import type { Metadata } from "next";

import { CommercialSolutions } from "@/features/commercial/components/CommercialSolutions";

export const metadata: Metadata = {
  title: "Commercial Water Solutions",
  description:
    "Commercial and industrial RO systems for restaurants, clinics, offices, and factories. Request a quote from AquaPure.",
  openGraph: {
    title: "Commercial Water Solutions | AquaPure",
    description:
      "Commercial and industrial RO systems for restaurants, clinics, offices, and factories.",
  },
};

export default function CommercialSolutionsPage() {
  return (
    <>
      <section className="water-grid border-b border-blue-100">
        <div className="section-shell max-w-2xl py-14 lg:py-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
            Commercial
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Water systems for your business.
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Tell us your industry and capacity need — we&apos;ll recommend the right RO system.
          </p>
        </div>
      </section>

      <section className="section-shell py-12 lg:py-16">
        <CommercialSolutions />
      </section>
    </>
  );
}
