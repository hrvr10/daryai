"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProductImage from "./ProductImage";
import { formatPrice, type Product } from "@/lib/products";

export default function FeedTile({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLAnchorElement>(null);
  // preload="none" meant a hover had to start the download from scratch —
  // the play() call had nothing buffered to play yet. Instead, buffer
  // tiles once they're actually on screen (there are only ever a handful
  // at a time) so a hover just resumes an already-downloading video.
  const [inView, setInView] = useState(false);
  // Once a video has played, the browser stops honouring `poster` — pausing
  // and seeking back to 0 shows the video's own first frame, which can
  // look different from the curated Instagram cover. Keeping the cover
  // image as its own layer and only fading the video in while hovered
  // means letting go always reveals the exact same cover shot again.
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Link
      ref={containerRef}
      href={`/product/${product.id}`}
      className="group relative block aspect-[9/16] animate-tile-in overflow-hidden bg-neutral-100 transition-shadow duration-300 hover:shadow-xl hover:shadow-black/10"
      style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
      onMouseEnter={() => {
        setHovering(true);
        videoRef.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        setHovering(false);
        const v = videoRef.current;
        if (!v) return;
        v.pause();
        v.currentTime = 0;
      }}
    >
      <ProductImage
        src={product.image}
        alt={product.name}
        className="h-full w-full transition duration-300 group-hover:scale-105"
      />
      {product.videoUrl && (
        <video
          ref={videoRef}
          src={product.videoUrl}
          muted
          loop
          playsInline
          preload={inView ? "auto" : "none"}
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-300 group-hover:scale-105 ${
            hovering ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
        <span className="truncate text-[11px] font-medium text-white">
          {product.name}
        </span>
        {product.price > 0 && (
          <span className="shrink-0 text-[11px] text-white/90">
            {formatPrice(product.price, product.currency)}
          </span>
        )}
      </div>
    </Link>
  );
}
