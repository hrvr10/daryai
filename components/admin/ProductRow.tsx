"use client";

import { useState } from "react";
import ProductImage from "@/components/ProductImage";
import type { Product } from "@/lib/products";

export default function ProductRow({ product }: { product: Product }) {
  const [price, setPrice] = useState(String(product.price || ""));
  const [sizes, setSizes] = useState(
    product.sizes.map((s) => s.label).join(", "),
  );
  const [active, setActive] = useState(product.active);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setState("saving");
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(price) || 0,
          sizes: sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((label) => ({ label, stock: 10 })),
          active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setState("saved");
      setTimeout(() => setState("idle"), 1500);
    } catch (err: any) {
      setState("error");
      setMsg(err.message || "Save failed");
    }
  }

  return (
    <div className="flex flex-col gap-3 border-b border-neutral-200 py-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3 sm:w-64">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-neutral-100">
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

      <label className="flex items-center gap-2 text-sm">
        <span className="text-neutral-500">₹</span>
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="w-24 rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-black"
        />
      </label>

      <input
        type="text"
        value={sizes}
        onChange={(e) => setSizes(e.target.value)}
        placeholder="S, M, L, XL"
        className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-black"
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Live
      </label>

      <button
        type="button"
        onClick={save}
        disabled={state === "saving"}
        className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {state === "saving"
          ? "Saving…"
          : state === "saved"
            ? "Saved ✓"
            : "Save"}
      </button>

      {state === "error" && (
        <span className="text-xs text-red-600">{msg}</span>
      )}
    </div>
  );
}
