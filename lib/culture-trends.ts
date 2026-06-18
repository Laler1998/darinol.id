export type RadarType = "news" | "culture";

export type CultureCategory =
  | "music"
  | "meme"
  | "lifestyle"
  | "fashion"
  | "food"
  | "beauty"
  | "gaming"
  | "film"
  | "internet_slang"
  | "entertainment"
  | "creator_trend";

export type CultureTrend = {
  id: string;
  name: string;
  category: string;
  culture_category: CultureCategory;
  radar_type: "culture";
  source: string;
  score: number;
  growth: string;
  culture_score: number;
  frequency_score: number;
  recency_score: number;
  engagement_score: number;
  cross_platform_score: number;
  competition_score: number | null;
  opportunity_score: number | null;
  whyViral: string[];
  ideas: string[];
  titles: string[];
  articles: Array<{
    title: string;
    source: string;
    url: string;
    publishedAt: string | null;
  }>;
  is_sample: boolean;
};

type RedditListing = {
  data?: {
    children?: Array<{
      data?: {
        id?: string;
        title?: string;
        subreddit?: string;
        permalink?: string;
        url?: string;
        created_utc?: number;
        score?: number;
        num_comments?: number;
        over_18?: boolean;
      };
    }>;
  };
};

type YouTubeVideosPayload = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      channelTitle?: string;
      publishedAt?: string;
      categoryId?: string;
    };
    statistics?: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
  }>;
};

export function scoreCultureTrend({
  frequency_score,
  recency_score,
  engagement_score,
  cross_platform_score,
  competition_score,
}: {
  frequency_score: number;
  recency_score: number;
  engagement_score: number;
  cross_platform_score: number;
  competition_score: number | null;
}) {
  const culture_score =
    frequency_score + recency_score + engagement_score + cross_platform_score;
  const opportunity_score =
    competition_score === null ? null : culture_score - competition_score;

  return {
    culture_score,
    opportunity_score,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function clampScore(value: number) {
  return Math.max(0, Math.min(30, Math.round(value)));
}

function sourceUrlFromReddit(permalink?: string, url?: string) {
  if (permalink) return `https://www.reddit.com${permalink}`;
  return url ?? "https://www.reddit.com";
}

function inferRedditCategory(subreddit?: string, title = ""): CultureCategory {
  const text = `${subreddit ?? ""} ${title}`.toLowerCase();

  if (text.includes("gaming") || text.includes("game")) return "gaming";
  if (text.includes("movie") || text.includes("film") || text.includes("series")) return "film";
  if (text.includes("fashion") || text.includes("streetwear")) return "fashion";
  if (text.includes("food") || text.includes("kuliner")) return "food";
  if (text.includes("beauty") || text.includes("makeup")) return "beauty";
  if (text.includes("slang") || text.includes("bahasa")) return "internet_slang";
  if (text.includes("meme")) return "meme";
  if (text.includes("popculture") || text.includes("entertainment")) return "entertainment";
  return "creator_trend";
}

function inferYouTubeCategory(categoryId?: string, title = ""): CultureCategory {
  const lower = title.toLowerCase();

  if (categoryId === "10" || lower.includes("music") || lower.includes("lagu")) return "music";
  if (categoryId === "20" || lower.includes("game")) return "gaming";
  if (categoryId === "24") return "entertainment";
  if (categoryId === "1" || lower.includes("film") || lower.includes("series")) return "film";
  if (lower.includes("food") || lower.includes("makan")) return "food";
  if (lower.includes("beauty") || lower.includes("makeup")) return "beauty";
  if (lower.includes("fashion") || lower.includes("outfit")) return "fashion";
  return "creator_trend";
}

function buildCultureTrend({
  id,
  name,
  culture_category,
  source,
  sourceUrl,
  publishedAt,
  frequency_score,
  recency_score,
  engagement_score,
  cross_platform_score,
  competition_score = null,
  whyViral,
  ideas,
  is_sample = false,
}: {
  id: string;
  name: string;
  culture_category: CultureCategory;
  source: string;
  sourceUrl: string;
  publishedAt: string | null;
  frequency_score: number;
  recency_score: number;
  engagement_score: number;
  cross_platform_score: number;
  competition_score?: number | null;
  whyViral: string[];
  ideas: string[];
  is_sample?: boolean;
}): CultureTrend {
  const scores = scoreCultureTrend({
    frequency_score,
    recency_score,
    engagement_score,
    cross_platform_score,
    competition_score,
  });
  const score = Math.max(60, Math.min(99, scores.culture_score));

  return {
    id,
    name,
    category: "Culture",
    culture_category,
    radar_type: "culture",
    source,
    score,
    growth: `+${Math.min(240, 60 + frequency_score * 4 + engagement_score * 3)}%`,
    culture_score: scores.culture_score,
    frequency_score,
    recency_score,
    engagement_score,
    cross_platform_score,
    competition_score,
    opportunity_score: scores.opportunity_score,
    whyViral,
    ideas,
    titles: [
      name,
      `Kenapa ${name} mulai ramai?`,
      `Angle konten dari trend ${name}`,
    ],
    articles: [
      {
        title: name,
        source,
        url: sourceUrl,
        publishedAt,
      },
    ],
    is_sample,
  };
}

function sampleCultureTrend(
  trend: Omit<CultureTrend, "radar_type" | "category" | "culture_score" | "opportunity_score" | "is_sample">,
): CultureTrend {
  const scores = scoreCultureTrend(trend);

  return {
    ...trend,
    radar_type: "culture",
    category: "Culture",
    culture_score: scores.culture_score,
    opportunity_score: scores.opportunity_score,
    is_sample: true,
  };
}

export const cultureTrendSources = [
  {
    id: "youtube",
    name: "YouTube Data API",
    status: process.env.YOUTUBE_API_KEY ? "ready" : "needs_api_key",
    note: "Prepared for most popular videos by category and region.",
  },
  {
    id: "reddit",
    name: "Reddit public JSON feeds",
    status: "prepared",
    note: "Prepared for hot/top posts from selected subreddits.",
  },
  {
    id: "pinterest",
    name: "Pinterest Trends",
    status: "manual_placeholder",
    note: "Manual/source placeholder for MVP.",
  },
  {
    id: "spotify",
    name: "Spotify chart/manual music trend source",
    status: "manual_placeholder",
    note: "Manual/source placeholder for MVP.",
  },
  {
    id: "seed_accounts",
    name: "TikTok/Instagram seed accounts",
    status: "manual_placeholder",
    note: "Manual monitoring placeholder. No scraping is used.",
  },
] as const;

export const sampleCultureTrends: CultureTrend[] = [
  sampleCultureTrend({
    id: "pov-kerja-remote-cafe",
    name: "POV kerja remote dari cafe",
    culture_category: "lifestyle",
    source: "Sample placeholder - manual seed",
    score: 86,
    growth: "+180%",
    frequency_score: 24,
    recency_score: 22,
    engagement_score: 20,
    cross_platform_score: 16,
    competition_score: null,
    whyViral: [
      "Format ini naik karena relatable untuk pekerja muda dan mudah direplikasi.",
      "Visual cafe, laptop, dan rutinitas kerja mudah dipakai untuk short video.",
      "Bisa masuk ke angle freelancer, agency, fresh graduate, dan introvert.",
    ],
    ideas: [
      "Versi anak agency",
      "Versi freelancer",
      "Versi fresh graduate",
      "Versi introvert",
    ],
    titles: [
      "POV Kerja Remote dari Cafe",
      "Realita Kerja dari Cafe Seharian",
      "Kerja Remote: Produktif atau Cuma Estetik?",
    ],
    articles: [
      {
        title: "Sample culture signal: POV kerja remote dari cafe",
        source: "Sample placeholder",
        url: "#",
        publishedAt: new Date().toISOString(),
      },
    ],
  }),
  sampleCultureTrend({
    id: "get-ready-with-me-budget",
    name: "GRWM budget tapi tetap rapi",
    culture_category: "beauty",
    source: "Sample placeholder - creator trend",
    score: 82,
    growth: "+145%",
    frequency_score: 22,
    recency_score: 20,
    engagement_score: 18,
    cross_platform_score: 14,
    competition_score: null,
    whyViral: [
      "Format GRWM tetap kuat karena terasa personal dan mudah dibuat harian.",
      "Angle budget cocok dengan audiens yang sensitif harga.",
      "Bisa digabung dengan fashion, beauty, dan lifestyle creator.",
    ],
    ideas: [
      "GRWM interview kerja",
      "GRWM ke kantor tanpa mahal",
      "GRWM first date low budget",
      "GRWM creator pemula",
    ],
    titles: [
      "GRWM Budget tapi Tetap Rapi",
      "Tampil Proper Tanpa Keluar Banyak",
      "Starter Pack GRWM Low Budget",
    ],
    articles: [
      {
        title: "Sample culture signal: GRWM low budget",
        source: "Sample placeholder",
        url: "#",
        publishedAt: new Date().toISOString(),
      },
    ],
  }),
  sampleCultureTrend({
    id: "meme-gajian-langsung-hilang",
    name: "Meme gajian langsung hilang",
    culture_category: "meme",
    source: "Sample placeholder - Reddit/public meme monitoring",
    score: 79,
    growth: "+120%",
    frequency_score: 20,
    recency_score: 18,
    engagement_score: 17,
    cross_platform_score: 12,
    competition_score: null,
    whyViral: [
      "Relatable dengan pekerja muda dan mudah diparodikan.",
      "Format meme finansial ringan sering dipakai lintas platform.",
      "Bisa masuk ke konten edukasi keuangan atau humor kantor.",
    ],
    ideas: [
      "Versi tanggal tua",
      "Versi anak kos",
      "Versi freelancer invoice telat",
      "Versi agency banyak revisi",
    ],
    titles: [
      "Gajian Masuk, Saldo Langsung Pergi",
      "Meme Tanggal Tua yang Terlalu Nyata",
      "Kenapa Gajian Terasa Cuma Lewat?",
    ],
    articles: [
      {
        title: "Sample culture signal: meme gajian",
        source: "Sample placeholder",
        url: "#",
        publishedAt: new Date().toISOString(),
      },
    ],
  }),
];

export const cultureSubreddits = [
  "indonesia",
  "memes",
  "TikTokCringe",
  "popculturechat",
  "gaming",
  "movies",
  "streetwear",
] as const;

async function fetchJson<T>(url: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 300 },
      headers: {
        Accept: "application/json",
        "User-Agent": "Darinol.id Culture Radar/0.1",
      },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchRedditCultureTrends() {
  const settled = await Promise.allSettled(
    cultureSubreddits.map(async (subreddit) => {
      const payload = await fetchJson<RedditListing>(
        `https://www.reddit.com/r/${subreddit}/hot.json?limit=8`,
      );

      return (payload.data?.children ?? []).flatMap((child) => {
        const post = child.data;
        if (!post?.id || !post.title || post.over_18) return [];

        const score = post.score ?? 0;
        const comments = post.num_comments ?? 0;
        const publishedAt = post.created_utc
          ? new Date(post.created_utc * 1000).toISOString()
          : null;
        const frequency_score = clampScore(10 + comments / 18);
        const recency_score = clampScore(24);
        const engagement_score = clampScore(8 + score / 450 + comments / 35);
        const culture_category = inferRedditCategory(post.subreddit, post.title);

        return [
          buildCultureTrend({
            id: `reddit-${slugify(post.subreddit ?? subreddit)}-${post.id}`,
            name: post.title,
            culture_category,
            source: `Reddit - r/${post.subreddit ?? subreddit}`,
            sourceUrl: sourceUrlFromReddit(post.permalink, post.url),
            publishedAt,
            frequency_score,
            recency_score,
            engagement_score,
            cross_platform_score: 4,
            whyViral: [
              `Naik di komunitas r/${post.subreddit ?? subreddit}.`,
              `${score.toLocaleString("id-ID")} upvotes dan ${comments.toLocaleString("id-ID")} komentar terdeteksi dari Reddit.`,
              "Cocok dipakai sebagai sinyal awal culture, meme, atau creator trend.",
            ],
            ideas: [
              "Buat versi lokal Indonesia",
              "Ubah jadi POV pendek",
              "Ambil format diskusinya untuk carousel",
              "Buat reaction atau explainer ringan",
            ],
          }),
        ];
      });
    }),
  );

  return settled
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => b.culture_score - a.culture_score)
    .slice(0, 18);
}

export async function fetchYouTubeCultureTrends() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) return [];

  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("chart", "mostPopular");
  url.searchParams.set("regionCode", "ID");
  url.searchParams.set("maxResults", "20");
  url.searchParams.set("key", apiKey);

  const payload = await fetchJson<YouTubeVideosPayload>(url.toString());

  return (payload.items ?? []).flatMap((item) => {
    if (!item.id || !item.snippet?.title) return [];

    const views = Number(item.statistics?.viewCount ?? 0);
    const likes = Number(item.statistics?.likeCount ?? 0);
    const comments = Number(item.statistics?.commentCount ?? 0);
    const engagementBase = likes + comments * 4;
    const culture_category = inferYouTubeCategory(item.snippet.categoryId, item.snippet.title);
    const frequency_score = clampScore(14 + Math.log10(Math.max(1, views)));
    const recency_score = clampScore(22);
    const engagement_score = clampScore(10 + Math.log10(Math.max(1, engagementBase)) * 5);

    return [
      buildCultureTrend({
        id: `youtube-${item.id}`,
        name: item.snippet.title,
        culture_category,
        source: item.snippet.channelTitle
          ? `YouTube - ${item.snippet.channelTitle}`
          : "YouTube",
        sourceUrl: `https://www.youtube.com/watch?v=${item.id}`,
        publishedAt: item.snippet.publishedAt ?? null,
        frequency_score,
        recency_score,
        engagement_score,
        cross_platform_score: 6,
        whyViral: [
          "Masuk daftar video populer YouTube Indonesia.",
          `${views.toLocaleString("id-ID")} views terdeteksi dari YouTube Data API.`,
          "Bisa dipakai untuk membaca arah minat audiens dan format konten yang sedang naik.",
        ],
        ideas: [
          "Buat hook dari judul video",
          "Ubah jadi short video commentary",
          "Ambil format storytelling-nya",
          "Buat carousel insight untuk niche kamu",
        ],
      }),
    ];
  });
}

export async function fetchCultureTrends() {
  const [youtubeResult, redditResult] = await Promise.allSettled([
    fetchYouTubeCultureTrends(),
    fetchRedditCultureTrends(),
  ]);
  const youtube = youtubeResult.status === "fulfilled" ? youtubeResult.value : [];
  const reddit = redditResult.status === "fulfilled" ? redditResult.value : [];
  const liveTopics = [...youtube, ...reddit]
    .sort((a, b) => b.culture_score - a.culture_score)
    .slice(0, 24);

  return {
    source: liveTopics.length ? "youtube+reddit" : "sample-culture-placeholder",
    youtube_count: youtube.length,
    reddit_count: reddit.length,
    topics: liveTopics.length ? liveTopics : sampleCultureTrends,
  };
}
