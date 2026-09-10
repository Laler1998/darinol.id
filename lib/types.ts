export type RadarFilter = "news" | "culture" | "all";

export type TopicArticle = {
  title: string;
  source: string;
  url: string;
  publishedAt: string | null;
  description?: string | null;
  slug?: string;
};

export type Topic = {
  id: string;
  name: string;
  category: string;
  radar_type: "news" | "culture";
  culture_category?: string | null;
  source?: string;
  culture_score?: number;
  opportunity_score?: number | null;
  competition_score?: number | null;
  is_sample?: boolean;
  score: number;
  growth: string;
  /** Total articles detected for this topic, which can exceed `articles.length`. */
  total_articles?: number;
  /** Total distinct sources detected for this topic. */
  total_sources?: number;
  whyViral: string[];
  articles: TopicArticle[];
};

export type TrendsPayload = {
  source: string;
  updatedAt: string;
  radar_type?: RadarFilter;
  error?: string;
  topics: Topic[];
};

export type FeedArticle = TopicArticle & {
  topicId: string;
  topicName: string;
  category: string;
  radarType: "news" | "culture";
};
