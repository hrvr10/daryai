"use client";

import { useEffect, useState } from "react";
import { topsSizeGuide, bottomsSizeGuide } from "@/lib/sizeGuide";

export default function SizeGuide() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-neutral-500 underline hover:text-black"
      >
        Size guide
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Size guide</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-neutral-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <p className="mb-4 text-xs text-neutral-500">
              All measurements in cm, body measurements (not garment).
            </p>

            <div className="mb-5">
              <h3 className="mb-2 text-sm font-medium">Tops &amp; dresses</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                    <th className="py-1.5">Size</th>
                    <th className="py-1.5">Bust</th>
                    <th className="py-1.5">Waist</th>
                    <th className="py-1.5">Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {topsSizeGuide.map((row) => (
                    <tr key={row.size} className="border-b border-neutral-100">
                      <td className="py-1.5 font-medium">{row.size}</td>
                      <td className="py-1.5">{row.bust}</td>
                      <td className="py-1.5">{row.waist}</td>
                      <td className="py-1.5">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Bottoms</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                    <th className="py-1.5">Size</th>
                    <th className="py-1.5">Waist</th>
                    <th className="py-1.5">Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {bottomsSizeGuide.map((row) => (
                    <tr key={row.size} className="border-b border-neutral-100">
                      <td className="py-1.5 font-medium">{row.size}</td>
                      <td className="py-1.5">{row.waist}</td>
                      <td className="py-1.5">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
