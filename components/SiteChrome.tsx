"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "@/components/Header";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The full-screen reel view is its own immersive takeover — no header/
  // footer chrome (and no hidden-but-focusable links sitting behind it).
  const isImmersive = pathname?.startsWith("/reels");

  if (isImmersive) return <>{children}</>;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-0 sm:px-6 lg:px-8">{children}</main>
      <footer className="mx-auto mt-10 max-w-6xl border-t border-neutral-100 px-4 py-10 text-center text-xs text-neutral-400 sm:px-6 lg:px-8">
        <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {footerLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-black">
              {l.label}
            </Link>
          ))}
        </nav>
        daryai.in — © {new Date().getFullYear()}
      </footer>
    </>
  );
}
