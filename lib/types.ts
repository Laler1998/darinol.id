export type RadarFilter = "news" | "world" | "culture" | "all";
export type NewsMarket = "indonesia" | "world";

export type TopicArticle = {
  title: string;
  source: string;
  url: string;
  publishedAt: string | null;
  description?: string | null;
  slug?: string;
  market?: NewsMarket;
  language?: string;
};

export type Topic = {
  id: string;
  name: string;
  category: string;
  radar_type: "news" | "culture";
  culture_category?: string | null;
  source?: string;
  market?: NewsMarket;
  verified?: boolean;
  culture_score?: number;
  opportunity_score?: number | null;
  competition_score?: number | null;
  is_sample?: boolean;
  data_status?: "live" | "stale" | "sample" | "fallback";
  growth_percent?: number | null;
  growth_status?: "measured" | "new" | "collecting" | "unavailable" | "not_measured";
  growth_previous_count?: number | null;
  growth_observed_at?: string | null;
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
  data_status?: "live" | "partial" | "fallback" | "sample";
  history_status?: "ready" | "unconfigured" | "unavailable";
  error?: string;
  topics: Topic[];
};

export type FeedArticle = TopicArticle & {
  topicId: string;
  topicName: string;
  category: string;
  radarType: "news" | "culture";
};
