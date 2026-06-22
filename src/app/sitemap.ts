import type { MetadataRoute } from "next";
import { getCanonicalOrigin } from "@/lib/marketing/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getCanonicalOrigin();
  const lastModified = new Date();

  return [
    { url: `${origin}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/dashboard`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${origin}/program`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${origin}/modules`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${origin}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
