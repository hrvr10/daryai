"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import FeedTile from "./FeedTile";
import type { Product } from "@/lib/products";

type Cols = 3 | 4;
const COLS_KEY = "daryai_cols";

// Mobile always shows 3 and has no toggle; sm+ picks up the chosen column
// count (3 or 4) via these responsive classes.
const colClass: Record<Cols, string> = {
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export default function Feed({
  initialItems = [],
  initialCursor = null,
}: {
  initialItems?: Product[];
  initialCursor?: string | null;
}) {
  const [items, setItems] = useState<Product[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [done, setDone] = useState(initialCursor === null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cols, setCols] = useState<Cols>(3);
  const sentinel = useRef<HTMLDivElement | null>(null);
  // The first page now arrives pre-rendered from the server, so the
  // mount effect below shouldn't re-fetch it — only later pages.
  const started = useRef(true);
  // Refs, not state, so the guard is correct even if the "load first page"
  // effect and the infinite-scroll observer's initial (already-intersecting)
  // callback both fire before either state update has landed.
  const loadingRef = useRef(false);
  const doneRef = useRef(initialCursor === null);

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
    if (loadingRef.current || doneRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/products", window.location.origin);
      url.searchParams.set("limit", "12");
      if (cursor) url.searchParams.set("cursor", cursor);
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      const incoming = data.items as Product[];
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...incoming.filter((p) => !seen.has(p.id))];
      });
      setCursor(data.nextCursor);
      if (!data.nextCursor || incoming.length === 0) {
        doneRef.current = true;
        setDone(true);
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [cursor]);

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
      <div className="flex items-center justify-between gap-4 px-4 py-6 sm:px-0 sm:py-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            New in
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Scroll the grid. Tap anything you like.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          <span className="mr-1 text-xs text-neutral-400">Grid</span>
          {([3, 4] as Cols[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => chooseCols(c)}
              aria-pressed={cols === c}
              className={`h-7 w-7 rounded-md border text-xs transition-colors ${
                cols === c
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-brand-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`grid grid-cols-3 ${colClass[cols]} gap-0.5 sm:gap-1.5 lg:gap-2`}
      >
        {items.map((product, i) => (
          <FeedTile key={`${product.id}-${i}`} product={product} index={i} />
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
