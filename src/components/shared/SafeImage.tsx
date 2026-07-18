"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

const FALLBACK_SRC = "/product-placeholder.svg";

/**
 * next/image wrapper that gracefully falls back to a local placeholder when the
 * source fails to load (e.g. seed data points at Cloudinary assets that are not
 * uploaded yet). Keeps real DB image URLs in the markup for SEO / future assets.
 */
export function SafeImage({ src, alt, ...props }: ImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== FALLBACK_SRC) setCurrentSrc(FALLBACK_SRC);
      }}
    />
  );
}
