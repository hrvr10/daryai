import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import SiteChrome from "@/components/SiteChrome";

const gotu = localFont({
  src: "./fonts/Gotu-Regular.woff2",
  variable: "--font-gotu",
  display: "swap",
});

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
    <html lang="en" className={gotu.variable}>
      <body className="min-h-screen font-sans antialiased">
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
