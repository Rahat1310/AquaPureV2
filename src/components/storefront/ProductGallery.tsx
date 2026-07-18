"use client";

import { useState } from "react";

import { SafeImage } from "@/components/shared/SafeImage";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const gallery = images.length > 0 ? images : ["/product-placeholder.svg"];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-sky-50 via-white to-blue-50">
        <SafeImage
          src={gallery[active]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 520px"
          className="object-contain p-8"
        />
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-3">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={active === index}
              className={cn(
                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border bg-white transition",
                active === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-blue-100 hover:border-primary/40",
              )}
            >
              <SafeImage
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
