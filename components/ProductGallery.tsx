"use client";

import { useRef, useState } from "react";
import ProductImage from "@/components/ProductImage";

type Slide = { kind: "video" | "image"; src: string; poster?: string };

export default function ProductGallery({
  slides,
  alt,
}: {
  slides: Slide[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [tapIcon, setTapIcon] = useState<"play" | "pause" | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tapIconTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = slides[active] ?? slides[0];

  function flashIcon(icon: "play" | "pause") {
    setTapIcon(icon);
    if (tapIconTimer.current) clearTimeout(tapIconTimer.current);
    tapIconTimer.current = setTimeout(() => setTapIcon(null), 550);
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      flashIcon("play");
    } else {
      v.pause();
      flashIcon("pause");
    }
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:w-16 sm:flex-col sm:overflow-visible">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 bg-brand-50 ${
                i === active ? "border-brand-700" : "border-transparent"
              }`}
              aria-label={`Show ${s.kind} ${i + 1}`}
            >
              <ProductImage
                src={s.kind === "video" ? s.poster || s.src : s.src}
                alt=""
                className="h-full w-full"
              />
              {s.kind === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7Z" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[9/16] flex-1 overflow-hidden rounded-2xl bg-gradient-to-b from-brand-100 to-brand-50 shadow-sm sm:mx-auto sm:max-w-sm">
        {current.kind === "video" ? (
          <>
            <video
              key={current.src}
              ref={videoRef}
              src={current.src}
              poster={current.poster || undefined}
              autoPlay
              playsInline
              loop
              muted={muted}
              onClick={togglePlay}
              className="h-full w-full cursor-pointer object-cover"
            />

            {/* Only mute and play/pause — the browser's full native
                control bar (skip 10s, fullscreen, AirPlay, speed menu…)
                was overkill for a silent product-preview clip. */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMuted((m) => !m);
              }}
              aria-label={muted ? "Unmute" : "Mute"}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition-transform duration-150 hover:scale-110 hover:bg-black/55 active:scale-95"
            >
              {muted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
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

            {tapIcon && (
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
          </>
        ) : (
          <ProductImage src={current.src} alt={alt} className="h-full w-full" />
        )}
      </div>
    </div>
  );
}
