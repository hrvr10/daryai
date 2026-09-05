"use client";

import { useState } from "react";
import ProductImage from "@/components/ProductImage";
import type { Product } from "@/lib/products";

export type SaveState = "idle" | "saving" | "saved" | "error";

export type Draft = {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  sizes: string;
  colors: string;
  images: string[];
  active: boolean;
};

export default function ProductRow({
  product,
  draft,
  dirty,
  saveState,
  errorMsg,
  onChange,
  onSave,
}: {
  product: Product;
  draft: Draft;
  dirty: boolean;
  saveState: SaveState;
  errorMsg?: string;
  onChange: (patch: Partial<Draft>) => void;
  onSave: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  function addImage() {
    const url = imageUrlInput.trim();
    if (!url) return;
    onChange({ images: [...draft.images, url] });
    setImageUrlInput("");
  }

  function removeImage(i: number) {
    onChange({ images: draft.images.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="rounded-lg border border-neutral-200 transition-colors hover:border-neutral-300">
      <div className="grid grid-cols-1 items-center gap-3 p-4 sm:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))_auto_auto]">
        <div className="flex min-w-0 items-center gap-3">
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
              {" · "}
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="underline"
              >
                {expanded ? "Hide details" : "Edit details"}
              </button>
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
              value={draft.price}
              onChange={(e) => onChange({ price: e.target.value })}
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
            value={draft.sizes}
            onChange={(e) => onChange({ sizes: e.target.value })}
            placeholder="S, M, L, XL"
            className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => onChange({ active: e.target.checked })}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-neutral-300 transition-colors peer-checked:bg-black" />
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
          </label>
          <span
            className={`text-xs font-medium ${draft.active ? "text-black" : "text-neutral-400"}`}
          >
            {draft.active ? "Live" : "Hidden"}
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

      {expanded && (
        <div className="space-y-4 border-t border-neutral-200 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Name
            </label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Description
            </label>
            <textarea
              value={draft.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                Compare-at price (optional)
              </label>
              <div className="flex items-center rounded-md border border-neutral-300 focus-within:border-black">
                <span className="pl-2.5 text-sm text-neutral-400">₹</span>
                <input
                  type="number"
                  min={0}
                  value={draft.compareAtPrice}
                  onChange={(e) => onChange({ compareAtPrice: e.target.value })}
                  placeholder="e.g. 1999 to show a strike-through"
                  className="w-full rounded-md bg-transparent py-1.5 pl-1 pr-2.5 text-sm outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                Colours (comma separated)
              </label>
              <input
                type="text"
                value={draft.colors}
                onChange={(e) => onChange({ colors: e.target.value })}
                placeholder="Black, Olive, Cream"
                className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Extra photos (model shots, shown on the product page)
            </label>
            {draft.images.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {draft.images.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    className="group relative h-16 w-16 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100"
                  >
                    <ProductImage src={url} alt="" className="h-full w-full" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label="Remove image"
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
                placeholder="Paste an image URL"
                className="flex-1 rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={addImage}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:border-neutral-400"
              >
                Add
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Paste a link to an image hosted anywhere (Instagram post, Drive,
              your own site, etc.) — there&apos;s no direct upload yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
