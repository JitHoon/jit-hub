import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/features/content/utils/pipeline";

const BASE_URL = "https://jit-hub.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();

  const nodeEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/nodes/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...nodeEntries,
  ];
}
