"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ProductImage from "./ProductImage";
import { formatPrice, type Product } from "@/lib/products";

type Cols = 3 | 4;
const COLS_KEY = "daryai_cols";

// Mobile always shows 3 and has no toggle; sm+ picks up the chosen column
// count (3 or 4) via these responsive classes.
const colClass: Record<Cols, string> = {
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export default function Feed() {
  const [items, setItems] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cols, setCols] = useState<Cols>(3);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(COLS_KEY));
      if (saved === 3 || saved === 4) setCols(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const chooseCols = (c: Cols) => {
    setCols(c);
    try {
      localStorage.setItem(COLS_KEY, String(c));
    } catch {
      /* ignore */
    }
  };

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/products", window.location.origin);
      url.searchParams.set("limit", "12");
      if (cursor) url.searchParams.set("cursor", cursor);
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setItems((prev) => [...prev, ...(data.items as Product[])]);
      setCursor(data.nextCursor);
      if (!data.nextCursor || data.items.length === 0) setDone(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, done]);

  // First page.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    loadMore();
  }, [loadMore]);

  // Infinite scroll.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "800px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  return (
    <div>
      <div className="hidden items-center justify-end gap-1 pb-3 sm:flex">
        <span className="mr-1 text-xs text-neutral-400">Grid</span>
        {([3, 4] as Cols[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => chooseCols(c)}
            aria-pressed={cols === c}
            className={`h-7 w-7 rounded-md border text-xs ${
              cols === c
                ? "border-black bg-black text-white"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-500"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className={`grid grid-cols-3 ${colClass[cols]} gap-0.5 sm:gap-1`}>
        {items.map((product, i) => (
          <Link
            key={`${product.id}-${i}`}
            href={`/product/${product.id}`}
            className="group relative block aspect-[9/16] overflow-hidden bg-neutral-100"
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              className="h-full w-full transition duration-300 group-hover:scale-105"
            />
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
        ))}
      </div>

      <div ref={sentinel} className="h-12" />

      <div className="py-4 text-center text-xs text-neutral-400">
        {loading && "Loading…"}
        {error && <span className="text-red-500">{error}</span>}
        {done && !loading && items.length === 0 && "No products yet."}
        {done && !loading && items.length > 0 && "You're all caught up."}
      </div>
    </div>
  );
}
