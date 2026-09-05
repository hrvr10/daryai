"use client";

import Link from "next/link";
import { useRef } from "react";
import ProductImage from "./ProductImage";
import { formatPrice, type Product } from "@/lib/products";

export default function FeedTile({ product }: { product: Product }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative block aspect-[9/16] overflow-hidden bg-neutral-100"
      onMouseEnter={() => videoRef.current?.play().catch(() => {})}
      onMouseLeave={() => {
        const v = videoRef.current;
        if (!v) return;
        v.pause();
        v.currentTime = 0;
      }}
    >
      {product.videoUrl ? (
        <video
          ref={videoRef}
          src={product.videoUrl}
          poster={product.image || undefined}
          muted
          loop
          playsInline
          preload="none"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full transition duration-300 group-hover:scale-105"
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
