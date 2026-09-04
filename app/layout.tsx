import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import Header from "@/components/Header";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export const metadata: Metadata = {
  title: "daryai",
  description: "Clothing, scroll and shop.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <CartProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-0 sm:px-6 lg:px-8">
            {children}
          </main>
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
        </CartProvider>
      </body>
    </html>
  );
}
