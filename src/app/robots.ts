import type { MetadataRoute } from "next";
import { getCanonicalOrigin } from "@/lib/marketing/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = getCanonicalOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/auth", "/api", "/_next/"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
