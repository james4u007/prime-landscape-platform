import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://prime-landscape-platform.vercel.app"),
  title: {
    default: "Prime Landscape Services | Instant Lawn Care Pricing in Tarrant County",
    template: "%s | Prime Landscape Services",
  },
  description:
    "Instant lawn care pricing for Tarrant County. Enter your address and get weekly, bi-weekly, or monthly pricing in seconds — with a live photo of your property. Serving DFW since 1990.",
  keywords: ["lawn care Fort Worth", "lawn mowing Tarrant County", "landscaping DFW", "instant lawn quote", "irrigation Fort Worth"],
  openGraph: {
    title: "Prime Landscape Services",
    description: "Get an instant price for your Tarrant County property in 10 seconds.",
    type: "website",
    siteName: "Prime Landscape Services",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime Landscape Services",
    description: "Instant lawn care pricing for Tarrant County.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
