"use client";

import { useState } from "react";
import ProductImage from "@/components/ProductImage";

type Slide = { kind: "video" | "image"; src: string; poster?: string };

export default function ProductGallery({
  slides,
  alt,
}: {
  slides: Slide[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const current = slides[active] ?? slides[0];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:w-16 sm:flex-col sm:overflow-visible">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 bg-brand-50 ${
                i === active ? "border-brand-700" : "border-transparent"
              }`}
              aria-label={`Show ${s.kind} ${i + 1}`}
            >
              <ProductImage
                src={s.kind === "video" ? s.poster || s.src : s.src}
                alt=""
                className="h-full w-full"
              />
              {s.kind === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7Z" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="aspect-[9/16] flex-1 overflow-hidden rounded-2xl bg-gradient-to-b from-brand-100 to-brand-50 shadow-sm sm:mx-auto sm:max-w-sm">
        {current.kind === "video" ? (
          <video
            key={current.src}
            src={current.src}
            poster={current.poster || undefined}
            controls
            autoPlay
            playsInline
            loop
            muted
            className="h-full w-full object-cover"
          />
        ) : (
          <ProductImage src={current.src} alt={alt} className="h-full w-full" />
        )}
      </div>
    </div>
  );
}
