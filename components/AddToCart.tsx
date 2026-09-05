"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { setBuyNow } from "@/lib/buyNow";
import type { Product } from "@/lib/products";

export default function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const sizeLabels = product.sizes.map((s) => s.label);
  const colorLabels = product.colors || [];
  const [size, setSize] = useState<string>(sizeLabels[0] ?? "");
  const [color, setColor] = useState<string>(colorLabels[0] ?? "");
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);

  const buyable = product.active && product.price > 0;

  if (!buyable) {
    return (
      <div className="rounded-md bg-neutral-100 px-4 py-3 text-sm text-neutral-500">
        Not available for purchase yet.
      </div>
    );
  }

  const line = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    size,
    color: color || undefined,
  };

  function handleBuyNow() {
    setBuying(true);
    setBuyNow({ ...line, qty: 1 });
    router.push("/checkout?mode=buynow");
  }

  return (
    <div className="space-y-4">
      {colorLabels.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-medium">Colour</div>
          <div className="flex flex-wrap gap-2">
            {colorLabels.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`rounded-md border px-3 py-2 text-sm transition-all duration-150 ${
                  color === c
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-neutral-300 hover:-translate-y-0.5 hover:border-brand-600"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizeLabels.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-medium">Size</div>
          <div className="flex flex-wrap gap-2">
            {sizeLabels.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`min-w-[3rem] rounded-md border px-3 py-2 text-sm transition-all duration-150 ${
                  size === s
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-neutral-300 hover:-translate-y-0.5 hover:border-brand-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            add(line);
            setAdded(true);
          }}
          className="w-full rounded-md border border-brand-700 bg-white px-4 py-3 text-sm font-medium text-brand-800 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-md active:translate-y-0 active:shadow-none"
        >
          Add to cart
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={buying}
          className="w-full rounded-md bg-brand-700 px-4 py-3 text-sm font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-lg active:translate-y-0 active:shadow-none disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {buying ? "…" : "Buy now"}
        </button>
      </div>

      {added && (
        <div className="flex items-center justify-between rounded-md bg-neutral-100 px-4 py-3 text-sm">
          <span>Added to cart.</span>
          <Link href="/cart" className="font-medium underline">
            Go to cart
          </Link>
        </div>
      )}
    </div>
  );
}
