import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/features/content/utils/pipeline";
import { SITE_URL } from "@/constants/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();

  const nodeEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/nodes/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...nodeEntries,
  ];
}
