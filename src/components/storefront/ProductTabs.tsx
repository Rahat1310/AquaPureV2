"use client";

import { Check, Download, Star } from "lucide-react";
import { useState } from "react";

import type { ReviewDTO } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

type TabKey =
  | "description"
  | "specifications"
  | "features"
  | "reviews"
  | "faqs"
  | "downloads";

const TABS: { key: TabKey; label: string }[] = [
  { key: "description", label: "Description" },
  { key: "specifications", label: "Specifications" },
  { key: "features", label: "Features" },
  { key: "reviews", label: "Reviews" },
  { key: "faqs", label: "FAQs" },
  { key: "downloads", label: "Downloads" },
];

const FEATURES = [
  "Multi-stage RO + UV purification",
  "Food-grade, BPA-free components",
  "Smart filter-change indicator",
  "Low noise, energy-efficient operation",
  "Free professional installation",
];

const FAQS = [
  {
    q: "What water source is this suitable for?",
    a: "It works with municipal (WASA) supply and tube-well water with TDS up to 2000 ppm.",
  },
  {
    q: "How long does installation take?",
    a: "A certified technician typically completes installation within 60–90 minutes.",
  },
  {
    q: "Are replacement filters easy to get?",
    a: "Yes, genuine filters are available nationwide and via our online store.",
  },
];

const DOWNLOADS = [
  { name: "User Manual (PDF)", size: "2.4 MB" },
  { name: "Warranty Card (PDF)", size: "0.4 MB" },
  { name: "Installation Guide (PDF)", size: "1.1 MB" },
];

export function ProductTabs({
  description,
  specs,
  reviews,
  rating,
}: {
  description: string | null;
  specs: Record<string, string | number>;
  reviews: ReviewDTO[];
  rating: number;
}) {
  const [active, setActive] = useState<TabKey>("description");
  const specEntries = Object.entries(specs);

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-blue-100">
        {TABS.map((tab) => {
          const count =
            tab.key === "reviews" && reviews.length > 0 ? ` (${reviews.length})` : "";
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={cn(
                "-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition",
                active === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-900",
              )}
            >
              {tab.label}
              {count}
            </button>
          );
        })}
      </div>

      <div className="py-7">
        {active === "description" && (
          <p className="max-w-3xl text-sm leading-7 text-slate-600">
            {description ?? "No description available for this product."}
          </p>
        )}

        {active === "specifications" && (
          <div className="max-w-3xl overflow-hidden rounded-2xl border border-blue-100">
            {specEntries.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No specifications listed.</p>
            ) : (
              specEntries.map(([key, value], index) => (
                <div
                  key={key}
                  className={cn(
                    "grid grid-cols-2 gap-4 px-5 py-3 text-sm",
                    index % 2 === 0 ? "bg-white" : "bg-[#f7faff]",
                  )}
                >
                  <span className="font-medium capitalize text-slate-500">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="font-semibold text-slate-900">{String(value)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {active === "features" && (
          <ul className="grid max-w-3xl gap-3 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        {active === "reviews" && (
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {rating > 0 ? rating.toFixed(1) : "—"}
              </span>
              <div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-4",
                        i < Math.round(rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-100 text-slate-200",
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500">
                  Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500">No reviews yet. Be the first to review.</p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-blue-100 bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      {review.authorName}
                    </span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-3.5",
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-100 text-slate-200",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {review.verifiedPurchase && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <Check className="size-3" /> Verified purchase
                    </span>
                  )}
                  {review.comment && (
                    <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {active === "faqs" && (
          <div className="max-w-3xl space-y-3">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-blue-100 bg-white p-5">
                <p className="text-sm font-bold text-slate-900">{faq.q}</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        )}

        {active === "downloads" && (
          <div className="max-w-3xl space-y-3">
            {DOWNLOADS.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white p-4"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                  <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                    <Download className="size-5" />
                  </span>
                  {file.name}
                </span>
                <span className="text-xs text-slate-400">{file.size}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
