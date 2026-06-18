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

function scoreCultureTrend({
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
