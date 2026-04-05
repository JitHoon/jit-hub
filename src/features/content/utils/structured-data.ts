import { SITE_URL, SITE_NAME, AUTHOR } from "@/constants/site";

export function buildTechArticleJsonLd(
  slug: string,
  title: string,
  tags: string[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description: tags.join(", "),
    keywords: tags,
    url: `${SITE_URL}/nodes/${slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    author: {
      "@type": "Person",
      name: AUTHOR.name,
      url: AUTHOR.url,
      jobTitle: AUTHOR.jobTitle,
    },
  };
}
