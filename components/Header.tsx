"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-base font-normal uppercase tracking-[0.25em] sm:text-lg"
        >
          daryai
        </Link>
        <Link
          href="/cart"
          className="group relative flex items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-1.5 text-sm transition-colors hover:border-neutral-400 hover:bg-neutral-50"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          Cart
          {count > 0 && (
            <span className="ml-0.5 inline-flex min-w-[1.25rem] justify-center rounded-full bg-black px-1 text-xs font-medium text-white">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
