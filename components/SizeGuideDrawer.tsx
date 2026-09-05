"use client";

import { useEffect, useState } from "react";
import SizeGuide from "./SizeGuide";

/**
 * Renders as a row matching the other accordion items (same title + "+"
 * treatment), but instead of expanding in place it opens a slide-over
 * panel from the right. Kept as its own overlay — not nested inside the
 * accordion's grid-rows expand — so opening it never changes the height
 * of the info column next to the gallery (that was stretching the video
 * taller than its own aspect ratio wants, which read as it "zooming").
 */
export default function SizeGuideDrawer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex w-full items-center justify-between border-b border-neutral-200 py-4 text-left text-sm font-medium tracking-wide"
      >
        Size guide
        <span className="text-lg font-light text-brand-700">+</span>
      </button>

      <div
        className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
          className={`absolute inset-y-0 right-0 flex w-[88vw] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="text-base font-semibold">Size guide</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <SizeGuide />
          </div>
        </div>
      </div>
    </>
  );
}
