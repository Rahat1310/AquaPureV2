import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Brands — AquaPure",
  description: "Browse AquaPure partner brands and country origins.",
};

const brands = [
  { name: "AquaPure", country: "Bangladesh" },
  { name: "Kent", country: "India" },
  { name: "Livpure", country: "India" },
  { name: "Pureit", country: "India" },
  { name: "AO Smith", country: "USA" },
];

const countries = ["Bangladesh", "India", "China", "Korea", "USA"];

type PageProps = {
  searchParams: Promise<{ brand?: string; country?: string }>;
};

export default async function BrandsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedBrand = params.brand?.trim();
  const selectedCountry = params.country?.trim();

  const filtered = brands.filter((b) => {
    if (selectedBrand && b.name.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }
    if (
      selectedCountry &&
      b.country.toLowerCase() !== selectedCountry.toLowerCase()
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="section-shell py-12 lg:py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
          Brands
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Trusted brands &amp; origins.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          A short list of brands we stock — filter by brand or country.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/brands"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            !selectedBrand && !selectedCountry && "border-primary text-primary",
          )}
        >
          All
        </Link>
        {countries.map((country) => (
          <Link
            key={country}
            href={`/brands?country=${encodeURIComponent(country)}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              selectedCountry === country && "border-primary text-primary",
            )}
          >
            {country}
          </Link>
        ))}
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((brand) => (
          <li
            key={brand.name}
            className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
          >
            <p className="text-lg font-bold text-slate-900">{brand.name}</p>
            <p className="mt-1 text-sm text-slate-500">{brand.country}</p>
            <Link
              href={`/category/residential`}
              className="mt-4 inline-flex text-sm font-bold text-primary hover:underline"
            >
              Browse products →
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="col-span-full rounded-2xl border border-dashed border-blue-200 p-8 text-center text-sm text-slate-500">
            No brands match this filter.
          </li>
        )}
      </ul>
    </div>
  );
}
