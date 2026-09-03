"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          daryai
        </Link>
        <Link
          href="/cart"
          className="relative rounded-full border border-neutral-300 px-4 py-1.5 text-sm hover:bg-neutral-50"
        >
          Cart
          {count > 0 && (
            <span className="ml-1 inline-flex min-w-[1.25rem] justify-center rounded-full bg-black px-1 text-xs font-medium text-white">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
