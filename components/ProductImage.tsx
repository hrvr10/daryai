"use client";

import { useState } from "react";

/**
 * Shows the product photo from /public/products/.
 * If the file isn't there yet, falls back to a labelled placeholder tile
 * so the layout still looks complete.
 */
export default function ProductImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-100 text-neutral-400 ${className}`}
        aria-label={alt}
      >
        <span className="px-3 text-center text-xs uppercase tracking-wide">
          {alt}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
