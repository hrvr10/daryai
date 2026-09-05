"use client";

import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const { lines, subtotal, setQty, remove, count } = useCart();

  return (
    <div className="mx-auto max-w-2xl px-4 py-5 sm:px-0 sm:py-8">
      <h1 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">
        Your cart
      </h1>

      {count === 0 ? (
        <div className="rounded-md border border-neutral-200 p-8 text-center text-sm text-neutral-500">
          Nothing here yet.{" "}
          <Link href="/" className="font-medium text-black underline">
            Start scrolling
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {lines.map((line) => (
              <li key={`${line.id}-${line.size}-${line.color || ""}`} className="flex gap-4 py-4">
                <Link
                  href={`/product/${line.id}`}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100 sm:h-24 sm:w-24"
                >
                  <ProductImage
                    src={line.image}
                    alt={line.name}
                    className="h-full w-full"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">{line.name}</div>
                      {(line.size || line.color) && (
                        <div className="text-xs text-neutral-500">
                          {[line.color, line.size && `Size ${line.size}`]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      )}
                    </div>
                    <div className="text-sm">
                      {formatPrice(line.price * line.qty)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-md border border-neutral-300">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        className="px-2 py-1 text-sm"
                        onClick={() =>
                          setQty(line.id, line.size, line.color, line.qty - 1)
                        }
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center text-sm">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        className="px-2 py-1 text-sm"
                        onClick={() =>
                          setQty(line.id, line.size, line.color, line.qty + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-neutral-500 underline"
                      onClick={() => remove(line.id, line.size, line.color)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>

          <Link
            href="/checkout"
            className="block w-full rounded-md bg-black px-4 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
          >
            Checkout
          </Link>
        </div>
      )}
    </div>
  );
}
