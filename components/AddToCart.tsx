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
  const [size, setSize] = useState<string>(sizeLabels[0] ?? "");
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
  };

  function handleBuyNow() {
    setBuying(true);
    setBuyNow({ ...line, qty: 1 });
    router.push("/checkout?mode=buynow");
  }

  return (
    <div className="space-y-4">
      {sizeLabels.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-medium">Size</div>
          <div className="flex flex-wrap gap-2">
            {sizeLabels.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`min-w-[3rem] rounded-md border px-3 py-2 text-sm ${
                  size === s
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 hover:border-neutral-500"
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
          className="w-full rounded-md border border-black bg-white px-4 py-3 text-sm font-medium text-black hover:bg-neutral-50"
        >
          Add to cart
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={buying}
          className="w-full rounded-md bg-black px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
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
