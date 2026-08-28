import localFont from "next/font/local";
import "./globals.css";

const gotu = localFont({
  src: "../public/fonts/Gotu-Regular.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-gotu",
});

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://daryai.in";

export const metadata = {
  metadataBase: new URL(site),
  title: "Daryai — coming soon",
  description:
    "Kaftans, co-ord sets and suit sets. Cut and sewn in Delhi. Opening soon.",
  openGraph: {
    title: "Daryai — coming soon",
    description:
      "Kaftans, co-ord sets and suit sets. Cut and sewn in Delhi. Opening soon.",
    url: site,
    siteName: "Daryai",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daryai — coming soon",
    description: "Kaftans, co-ord sets and suit sets. Cut and sewn in Delhi.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#b9b080",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={gotu.variable}>
      <body>{children}</body>
    </html>
  );
}
