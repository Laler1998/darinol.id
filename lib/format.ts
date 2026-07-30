import type { FeedArticle, Topic } from "./types";

export function formatClock(value: string, language: "id" | "en" = "id") {
  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRelativeTime(value: string | null, language: "id" | "en") {
  if (!value) return language === "id" ? "baru saja" : "just now";

  const published = Date.parse(value);

  if (Number.isNaN(published)) {
    return language === "id" ? "baru saja" : "just now";
  }

  const minutes = Math.round((Date.now() - published) / 60000);

  if (minutes < 1) return language === "id" ? "baru saja" : "just now";
  if (minutes < 60) return language === "id" ? `${minutes} menit lalu` : `${minutes}m ago`;

  const hours = Math.round(minutes / 60);

  if (hours < 24) return language === "id" ? `${hours} jam lalu` : `${hours}h ago`;

  const days = Math.round(hours / 24);

  return language === "id" ? `${days} hari lalu` : `${days}d ago`;
}

export function getMomentumLabel(score: number, language: "id" | "en") {
  if (score >= 85) return language === "id" ? "Sangat ramai" : "Very hot";
  if (score >= 70) return language === "id" ? "Naik cepat" : "Rising fast";
  return language === "id" ? "Mulai ramai" : "Picking up";
}

export function getTopicLabel(topic: Topic) {
  if (topic.radar_type === "culture") {
    return topic.culture_category?.replace(/_/g, " ") ?? "culture";
  }

  return topic.category;
}

export function buildLatestFeed(topics: Topic[], limit = 60): FeedArticle[] {
  const seen = new Set<string>();
  const feed: FeedArticle[] = [];

  topics.forEach((topic) => {
    topic.articles.forEach((article) => {
      if (!article.url || article.url === "#" || seen.has(article.url)) return;

      seen.add(article.url);
      feed.push({
        ...article,
        topicId: topic.id,
        topicName: topic.name,
        category: getTopicLabel(topic),
        radarType: topic.radar_type,
      });
    });
  });

  return feed
    .sort((a, b) => {
      const timeA = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const timeB = b.publishedAt ? Date.parse(b.publishedAt) : 0;

      return timeB - timeA;
    })
    .slice(0, limit);
}

/** Recency buckets, in ascending age. */
const RECENCY_BUCKETS = [
  { maxMinutes: 15, id: { label: "Baru saja" }, en: { label: "Just now" } },
  { maxMinutes: 60, id: { label: "1 jam terakhir" }, en: { label: "Past hour" } },
  { maxMinutes: 180, id: { label: "3 jam terakhir" }, en: { label: "Past 3 hours" } },
  { maxMinutes: 720, id: { label: "12 jam terakhir" }, en: { label: "Past 12 hours" } },
  { maxMinutes: Infinity, id: { label: "Lebih lama" }, en: { label: "Earlier" } },
] as const;

export function groupByRecency(articles: FeedArticle[], language: "id" | "en") {
  const now = Date.now();
  const groups = new Map<string, FeedArticle[]>();

  articles.forEach((article) => {
    const published = article.publishedAt ? Date.parse(article.publishedAt) : now;
    const ageMinutes = Number.isNaN(published) ? 0 : (now - published) / 60000;
    const bucket =
      RECENCY_BUCKETS.find((item) => ageMinutes < item.maxMinutes) ??
      RECENCY_BUCKETS[RECENCY_BUCKETS.length - 1];
    const label = bucket[language].label;

    groups.set(label, [...(groups.get(label) ?? []), article]);
  });

  // Preserve bucket order rather than insertion order.
  return RECENCY_BUCKETS.map((bucket) => bucket[language].label)
    .filter((label) => groups.has(label))
    .map((label) => ({ label, articles: groups.get(label) ?? [] }));
}
