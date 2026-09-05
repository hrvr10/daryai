"use client";

import ProductImage from "@/components/ProductImage";
import type { Product } from "@/lib/products";

export type SaveState = "idle" | "saving" | "saved" | "error";

export default function ProductRow({
  product,
  price,
  sizes,
  active,
  dirty,
  saveState,
  errorMsg,
  onPriceChange,
  onSizesChange,
  onActiveChange,
  onSave,
}: {
  product: Product;
  price: string;
  sizes: string;
  active: boolean;
  dirty: boolean;
  saveState: SaveState;
  errorMsg?: string;
  onPriceChange: (v: string) => void;
  onSizesChange: (v: string) => void;
  onActiveChange: (v: boolean) => void;
  onSave: () => void;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-3 rounded-lg border border-neutral-200 p-4 transition-colors hover:border-neutral-300 sm:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))_auto_auto]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="h-full w-full"
          />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{product.name}</div>
          <div className="text-xs text-neutral-400">
            {product.source}
            {product.permalink && (
              <>
                {" · "}
                <a
                  href={product.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  reel
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-neutral-400 sm:hidden">
          Price
        </label>
        <div className="flex items-center rounded-md border border-neutral-300 focus-within:border-black">
          <span className="pl-2.5 text-sm text-neutral-400">₹</span>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            placeholder="Price"
            className="w-full rounded-md bg-transparent py-1.5 pl-1 pr-2.5 text-sm outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-neutral-400 sm:hidden">
          Sizes
        </label>
        <input
          type="text"
          value={sizes}
          onChange={(e) => onSizesChange(e.target.value)}
          placeholder="S, M, L, XL"
          className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-black"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => onActiveChange(e.target.checked)}
            className="peer sr-only"
          />
          <div className="h-6 w-11 rounded-full bg-neutral-300 transition-colors peer-checked:bg-black" />
          <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
        </label>
        <span
          className={`text-xs font-medium ${active ? "text-black" : "text-neutral-400"}`}
        >
          {active ? "Live" : "Hidden"}
        </span>
      </div>

      <div className="flex items-center justify-end gap-2">
        {dirty && saveState !== "saving" && (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
            title="Unsaved changes"
          />
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={saveState === "saving"}
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
              ? "Saved ✓"
              : "Save"}
        </button>
      </div>

      {saveState === "error" && errorMsg && (
        <p className="text-xs text-red-600 sm:col-span-full">{errorMsg}</p>
      )}
    </div>
  );
}
