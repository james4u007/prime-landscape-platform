import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/worker", "/api"] },
    sitemap: "https://prime-landscape-platform.vercel.app/sitemap.xml",
  };
}
