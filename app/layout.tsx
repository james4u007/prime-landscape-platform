import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prime Landscape Services | Tarrant County Lawn Care & Landscaping",
  description:
    "Instant lawn care pricing for Tarrant County. Enter your address and get weekly, bi-weekly, or monthly pricing in seconds. Serving DFW since 1990.",
  openGraph: {
    title: "Prime Landscape Services",
    description: "Get an instant price for your property in Tarrant County.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
