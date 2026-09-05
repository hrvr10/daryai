"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatPrice, type Product } from "@/lib/products";

// How many slides around the active one keep a real, buffering <video>
// mounted. Everything outside this window only shows the poster image —
// keeps memory/bandwidth bounded while making the next swipe feel instant
// because that video has already been downloading in the background.
// Keep this tight: preloading more than one ahead means several videos
// buffer at once, which starves the active one's bandwidth on mobile.
const PRELOAD_BEHIND = 1;
const PRELOAD_AHEAD = 1;

export default function ReelFeed() {
  const [items, setItems] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [tapIcon, setTapIcon] = useState<"play" | "pause" | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [readyVideos, setReadyVideos] = useState<Set<number>>(new Set());

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const doneRef = useRef(false);
  const tapIconTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || doneRef.current) return;
    loadingRef.current = true;
    try {
      const url = new URL("/api/products", window.location.origin);
      url.searchParams.set("limit", "6");
      if (cursorRef.current) url.searchParams.set("cursor", cursorRef.current);
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) return;
      const incoming = data.items as Product[];
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...incoming.filter((p) => !seen.has(p.id))];
      });
      cursorRef.current = data.nextCursor;
      if (!data.nextCursor || incoming.length === 0) doneRef.current = true;
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  // Load the next page once the viewer is near the end of what's loaded.
  useEffect(() => {
    if (activeIndex >= items.length - 3) loadMore();
  }, [activeIndex, items.length, loadMore]);

  // Track which slide is centred in the scroller.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root, threshold: [0.6] },
    );
    const slides = root.querySelectorAll("[data-index]");
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items.length]);

  // Play the active video, pause the rest. Also surface a brief "buffering"
  // state so a slow network shows a spinner instead of looking frozen —
  // with the preload window below this should be rare in practice.
  useEffect(() => {
    setBuffering(false);

    videoRefs.current.forEach((video, idx) => {
      if (idx !== activeIndex) video.pause();
    });

    const active = videoRefs.current.get(activeIndex);
    if (!active) return;

    active.currentTime = 0;
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    active.addEventListener("waiting", onWaiting);
    active.addEventListener("playing", onPlaying);
    active.play().catch(() => {});

    return () => {
      active.removeEventListener("waiting", onWaiting);
      active.removeEventListener("playing", onPlaying);
    };
  }, [activeIndex]);

  function flashIcon(icon: "play" | "pause") {
    setTapIcon(icon);
    if (tapIconTimer.current) clearTimeout(tapIconTimer.current);
    tapIconTimer.current = setTimeout(() => setTapIcon(null), 550);
  }

  // Warm up the connection to each upcoming video's CDN host (DNS + TLS)
  // before the <video> element even requests it — shaves real latency off
  // the moment a swipe lands on a reel that hasn't started buffering yet.
  useEffect(() => {
    const created: HTMLLinkElement[] = [];
    items.forEach((p, i) => {
      const distance = i - activeIndex;
      if (distance < -PRELOAD_BEHIND || distance > PRELOAD_AHEAD + 1) return;
      if (!p.videoUrl) return;
      let origin: string;
      try {
        origin = new URL(p.videoUrl).origin;
      } catch {
        return;
      }
      if (document.querySelector(`link[data-reel-preconnect="${origin}"]`)) return;
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = origin;
      link.crossOrigin = "anonymous";
      link.dataset.reelPreconnect = origin;
      document.head.appendChild(link);
      created.push(link);
    });
    return () => created.forEach((l) => l.remove());
  }, [items, activeIndex]);

  function togglePlay(index: number) {
    const video = videoRefs.current.get(index);
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      flashIcon("play");
    } else {
      video.pause();
      flashIcon("pause");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Link
        href="/"
        aria-label="Close reels"
        className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMuted((m) => !m);
        }}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
      >
        {muted ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 9v6h4l5 4V5L8 9H4Z"
              fill="currentColor"
            />
            <path
              d="M17 8l4 8M21 8l-4 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
            <path
              d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      <div
        ref={containerRef}
        // No `scroll-smooth`: that forces an eased animation on every
        // scroll, which actually fights fast successive swipes and feels
        // laggier than just letting native touch/snap physics take over.
        className="h-full w-full snap-y snap-mandatory overflow-y-scroll"
      >
        {items.map((product, i) => {
          const distance = i - activeIndex;
          const isActive = distance === 0;
          const isNear =
            distance >= -PRELOAD_BEHIND && distance <= PRELOAD_AHEAD;

          return (
            <div
              key={`${product.id}-${i}`}
              data-index={i}
              onClick={() => togglePlay(i)}
              className="relative flex h-full w-full snap-start items-center justify-center bg-neutral-950"
            >
              {/* Poster stays mounted underneath for every slide, so a
                  swipe never shows a blank frame. The video crossfades in
                  on top only once it actually has a frame ready — that's
                  what removes the poster-then-video "pop". */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {product.videoUrl && isNear && (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(i, el);
                    else videoRefs.current.delete(i);
                  }}
                  src={product.videoUrl}
                  muted={muted}
                  loop
                  playsInline
                  // The active slide and the one right after it buffer
                  // ahead of time; anything a swipe further back only
                  // needs its metadata (it's already been watched).
                  preload={distance >= 0 ? "auto" : "metadata"}
                  onLoadedData={() =>
                    setReadyVideos((prev) =>
                      prev.has(i) ? prev : new Set(prev).add(i),
                    )
                  }
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-150 ${
                    readyVideos.has(i) ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              {isActive && buffering && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </div>
              )}

              {tapIcon && isActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black/40 p-5 text-white">
                    {tapIcon === "play" ? (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7Z" />
                      </svg>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-20 pt-16 sm:pb-10">
                <div className="mb-3 text-sm text-white">
                  <div className="font-medium">{product.name}</div>
                  {product.price > 0 && (
                    <div className="text-white/80">
                      {formatPrice(product.price, product.currency)}
                    </div>
                  )}
                </div>
                <Link
                  href={`/product/${product.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto inline-block rounded-full border border-white/50 bg-white/20 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md"
                >
                  Shop now
                </Link>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
            No reels yet.
          </div>
        )}
      </div>
    </div>
  );
}
