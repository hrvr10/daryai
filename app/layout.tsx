import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import SiteChrome from "@/components/SiteChrome";

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
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
