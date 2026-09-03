import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import Header from "@/components/Header";

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
          <main className="mx-auto max-w-3xl px-0 sm:px-4">{children}</main>
          <footer className="mx-auto max-w-3xl px-4 py-10 text-center text-xs text-neutral-400">
            daryai.in — © {new Date().getFullYear()}
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
