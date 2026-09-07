import type { MetadataRoute } from "next";
import { articleSlug, fetchRssArticles } from "@/lib/rss";

const siteUrl = "https://www.darinol.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await fetchRssArticles().catch(() => []);
  const seenUrls = new Set<string>();

  return [
    {
      url: siteUrl,
      lastModified: "2026-09-07",
      changeFrequency: "daily",
      priority: 1,
    },
    ...articles.flatMap((article) => {
      if (!article.title || !article.url) return [];

      const url = `${siteUrl}/artikel/${articleSlug(article.title, article.source.name)}`;
      if (seenUrls.has(url)) return [];
      seenUrls.add(url);

      const publishedAt = article.publishedAt ? new Date(article.publishedAt) : null;
      const lastModified = publishedAt && !Number.isNaN(publishedAt.getTime())
        ? publishedAt
        : "2026-09-07";

      return [{
        url,
        lastModified,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }];
    }),
  ];
}
