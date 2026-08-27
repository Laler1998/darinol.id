import type { MetadataRoute } from "next";
import { articleSlug, fetchRssArticles } from "@/lib/rss";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://darinol.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await fetchRssArticles().catch(() => []);

  return [
    {
      url: siteUrl,
      lastModified: "2026-08-28",
      changeFrequency: "daily",
      priority: 1,
    },
    ...articles.flatMap((article) => {
      if (!article.title || !article.url) return [];

      const publishedAt = article.publishedAt ? new Date(article.publishedAt) : null;
      const lastModified = publishedAt && !Number.isNaN(publishedAt.getTime())
        ? publishedAt
        : "2026-08-28";

      return [{
        url: `${siteUrl}/artikel/${articleSlug(article.title, article.source.name)}`,
        lastModified,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }];
    }),
  ];
}
