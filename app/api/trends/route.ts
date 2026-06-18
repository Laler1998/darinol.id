import { NextResponse } from "next/server";
import { fetchRssArticles } from "@/lib/rss";

type NewsArticle = {
  source?: { name?: string | null };
  title?: string | null;
  description?: string | null;
  url?: string | null;
  publishedAt?: string | null;
};

type GdeltArticle = {
  title?: string;
  seendate?: string;
  url?: string;
  domain?: string;
  sourcecountry?: string;
};

type HackerNewsItem = {
  id: number;
  title?: string;
  url?: string;
  time?: number;
  score?: number;
  descendants?: number;
};

type CryptoMarket = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  total_volume: number;
};

type YouTubeSearchPayload = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      channelTitle?: string;
    };
  }>;
};

type Topic = {
  id: string;
  name: string;
  category: string;
  score: number;
  growth: string;
  whyViral: string[];
  ideas: string[];
  titles: string[];
  articles: TopicArticle[];
};

type TopicArticle = {
  title: string;
  source: string;
  url: string;
  publishedAt: string | null;
};

const fallbackUpdatedAt = new Date().toISOString();

function fallbackArticle(title: string, source: string, query: string): TopicArticle {
  return {
    title,
    source,
    url: `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`,
    publishedAt: fallbackUpdatedAt,
  };
}

function trendsJson(payload: unknown, init?: ResponseInit) {
  const response = NextResponse.json(payload, init);

  response.headers.set(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=900",
  );

  return response;
}

const fallbackTopics: Topic[] = [
  {
    id: "demo",
    name: "Demo",
    category: "Peristiwa",
    score: 99,
    growth: "+380%",
    whyViral: [
      "Banyak pencarian terkait aksi dan kondisi terbaru hari ini.",
      "Topik peristiwa lokal cepat menyebar lewat potongan video pendek.",
      "Creator butuh angle yang aman, jelas, dan tidak memicu misinformasi.",
    ],
    ideas: [
      "Apa yang Perlu Diketahui dari Demo Hari Ini?",
      "Kenapa Isu Demo Cepat Ramai di Media Sosial?",
      "Cara Membaca Berita Demo Tanpa Ikut Panik",
      "3 Hal yang Harus Dicek Sebelum Share Kabar Demo",
    ],
    titles: [
      "Demo Hari Ini Ramai Dibahas, Ini Intinya",
      "Kenapa Kabar Demo Cepat Viral?",
      "Sebelum Share Berita Demo, Cek Ini Dulu",
    ],
    articles: [
      fallbackArticle("Pantau kabar demo dan aksi terbaru hari ini", "Google News", "demo hari ini Indonesia"),
      fallbackArticle("Peristiwa lokal yang sedang ramai dibahas", "Google News", "peristiwa terbaru Indonesia hari ini"),
    ],
  },
  {
    id: "ai-video",
    name: "AI Video",
    category: "Technology",
    score: 96,
    growth: "+310%",
    whyViral: [
      "Tools AI video makin sering dipakai creator untuk produksi cepat.",
      "Perubahan fitur baru biasanya memicu banyak tutorial dan eksperimen.",
      "Audiens penasaran cara membuat video yang terlihat profesional.",
    ],
    ideas: [
      "AI Video Bisa Bikin Konten Lebih Cepat?",
      "Tools AI Video yang Lagi Sering Dibahas",
      "Cara Pakai AI Video Tanpa Terlihat Template",
      "Apa Risiko Konten AI Video untuk Creator?",
    ],
    titles: [
      "AI Video Makin Ramai, Creator Harus Tahu Ini",
      "Kenapa Semua Orang Mulai Coba AI Video?",
      "AI Video: Bantu Creator atau Bikin Konten Makin Sama?",
    ],
    articles: [
      fallbackArticle("Update teknologi AI video terbaru", "Google News", "AI video terbaru"),
      fallbackArticle("Kabar startup dan tools AI untuk creator", "Google News", "AI tools creator video"),
    ],
  },
  {
    id: "rupiah",
    name: "Rupiah",
    category: "Business",
    score: 91,
    growth: "+220%",
    whyViral: [
      "Pergerakan kurs cepat memengaruhi percakapan bisnis dan belanja harian.",
      "Media ekonomi rutin mengangkat dampaknya ke pasar dan masyarakat.",
      "Topik finansial mudah dibuat menjadi konten edukasi singkat.",
    ],
    ideas: [
      "Kenapa Rupiah Bisa Menguat atau Melemah?",
      "Dampak Kurs Rupiah ke Harga Barang",
      "Cara Membaca Kabar Rupiah untuk Pemula",
      "Apa Hubungan Rupiah, BI, dan The Fed?",
    ],
    titles: [
      "Rupiah Bergerak Lagi, Apa Penyebabnya?",
      "Kurs Rupiah Hari Ini: Kenapa Penting?",
      "Yang Perlu Dipahami dari Kabar Rupiah",
    ],
    articles: [
      fallbackArticle("Kabar rupiah dan ekonomi hari ini", "Google News", "rupiah ekonomi hari ini"),
      fallbackArticle("Update BI dan pasar keuangan Indonesia", "Google News", "Bank Indonesia rupiah pasar keuangan"),
    ],
  },
  {
    id: "timnas-indonesia",
    name: "Timnas Indonesia",
    category: "Sports",
    score: 89,
    growth: "+205%",
    whyViral: [
      "Topik sepak bola nasional punya basis percakapan yang besar.",
      "Update pemain, jadwal, dan hasil pertandingan cepat dibahas ulang.",
      "Konten reaksi dan analisis ringan mudah mendapatkan engagement.",
    ],
    ideas: [
      "Apa yang Bikin Timnas Indonesia Ramai Lagi?",
      "3 Poin Penting dari Kabar Timnas Terbaru",
      "Kenapa Fans Optimis dengan Timnas?",
      "Prediksi Angle Konten Timnas yang Aman Dibuat",
    ],
    titles: [
      "Timnas Indonesia Jadi Sorotan Lagi",
      "Kabar Timnas Terbaru yang Perlu Kamu Tahu",
      "Kenapa Timnas Indonesia Ramai Dibahas?",
    ],
    articles: [
      fallbackArticle("Berita Timnas Indonesia terbaru", "Google News", "Timnas Indonesia terbaru"),
      fallbackArticle("Update sepak bola Indonesia hari ini", "Google News", "sepak bola Indonesia hari ini"),
    ],
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    category: "Crypto",
    score: 92,
    growth: "+320%",
    whyViral: [
      "Pencarian meningkat dalam 48 jam terakhir.",
      "Banyak media nasional membahas topik ini.",
      "Percakapan sosial media meningkat.",
    ],
    ideas: [
      "Kenapa Bitcoin Naik Lagi?",
      "Apa yang Membuat Bitcoin Ramai Dibahas?",
      "Fakta Bitcoin yang Jarang Diketahui",
      "Apakah Bitcoin Masih Menarik?",
    ],
    titles: [
      "Bitcoin Naik Lagi, Apa Penyebabnya?",
      "Kenapa Bitcoin Mendadak Ramai?",
      "Yang Sedang Terjadi Dengan Bitcoin",
    ],
    articles: [
      fallbackArticle("Kabar Bitcoin dan pasar crypto terbaru", "Google News", "Bitcoin crypto terbaru"),
      fallbackArticle("Update harga dan sentimen crypto global", "Google News", "crypto market today Bitcoin"),
    ],
  },
  {
    id: "prabowo",
    name: "Prabowo",
    category: "Politics",
    score: 86,
    growth: "+175%",
    whyViral: [
      "Kebijakan pemerintah sering menjadi bahan diskusi publik.",
      "Media nasional mengangkat respons dari berbagai pihak.",
      "Creator perlu merangkum isu politik dengan bahasa netral.",
    ],
    ideas: [
      "Apa Inti Kabar Politik Terbaru Hari Ini?",
      "Cara Menjelaskan Isu Pemerintah Tanpa Bias",
      "Kenapa Kebijakan Ini Ramai Dibahas?",
      "3 Sudut Pandang dari Kabar Politik Terbaru",
    ],
    titles: [
      "Kabar Politik Hari Ini, Ini Ringkasannya",
      "Isu Pemerintah yang Sedang Ramai Dibahas",
      "Kenapa Topik Politik Ini Jadi Sorotan?",
    ],
    articles: [
      fallbackArticle("Berita politik nasional terbaru", "Google News", "politik nasional terbaru Prabowo"),
      fallbackArticle("Update kebijakan pemerintah hari ini", "Google News", "kebijakan pemerintah hari ini Indonesia"),
    ],
  },
  {
    id: "google",
    name: "Google",
    category: "Technology",
    score: 84,
    growth: "+160%",
    whyViral: [
      "Produk dan algoritma Google berdampak langsung ke creator dan bisnis.",
      "Update teknologi besar biasanya cepat dibahas media global.",
      "Banyak angle konten edukasi yang bisa dibuat dari satu perubahan fitur.",
    ],
    ideas: [
      "Update Google yang Harus Creator Tahu",
      "Apa Dampak Perubahan Google ke Konten?",
      "Kenapa Google Sering Jadi Topik Viral?",
      "Cara Mengikuti Update Teknologi Tanpa Bingung",
    ],
    titles: [
      "Google Update Lagi, Creator Perlu Tahu Ini",
      "Kabar Google Terbaru dan Dampaknya",
      "Kenapa Update Google Selalu Ramai?",
    ],
    articles: [
      fallbackArticle("Update Google dan teknologi terbaru", "Google News", "Google technology update"),
      fallbackArticle("Kabar AI dan produk Google terbaru", "Google News", "Google AI terbaru"),
    ],
  },
  {
    id: "film-indonesia",
    name: "Film Indonesia",
    category: "Entertainment",
    score: 81,
    growth: "+140%",
    whyViral: [
      "Rilis film, trailer, dan respons penonton cepat menjadi percakapan.",
      "Topik hiburan cocok untuk format review singkat dan rekomendasi.",
      "Creator bisa mengambil angle fakta, opini, atau reaksi audiens.",
    ],
    ideas: [
      "Film Indonesia yang Lagi Dibahas Minggu Ini",
      "Kenapa Film Ini Ramai di Media Sosial?",
      "Fakta Menarik dari Film Indonesia Terbaru",
      "Apakah Film Ini Layak Ditonton?",
    ],
    titles: [
      "Film Indonesia Ini Lagi Ramai Dibahas",
      "Kenapa Film Ini Jadi Sorotan?",
      "Fakta Singkat Film Indonesia Terbaru",
    ],
    articles: [
      fallbackArticle("Berita film Indonesia terbaru", "Google News", "film Indonesia terbaru"),
      fallbackArticle("Update hiburan dan bioskop Indonesia", "Google News", "hiburan bioskop Indonesia terbaru"),
    ],
  },
  {
    id: "gaza",
    name: "Gaza",
    category: "Global",
    score: 80,
    growth: "+130%",
    whyViral: [
      "Isu global sering menjadi percakapan lintas negara.",
      "Media internasional dan nasional memberi pembaruan berkala.",
      "Konten perlu hati-hati, faktual, dan tidak menyederhanakan konflik.",
    ],
    ideas: [
      "Ringkasan Isu Global Hari Ini",
      "Apa yang Perlu Dipahami dari Kabar Gaza?",
      "Cara Membahas Isu Global dengan Empati",
      "3 Hal yang Harus Dicek dari Berita Konflik",
    ],
    titles: [
      "Kabar Global Hari Ini, Ini Ringkasannya",
      "Yang Perlu Dipahami dari Isu Gaza",
      "Sebelum Share Kabar Global, Cek Ini Dulu",
    ],
    articles: [
      fallbackArticle("Berita global terbaru hari ini", "Google News", "Gaza global news today"),
      fallbackArticle("Update dunia dari media internasional", "Google News", "world news today Gaza"),
    ],
  },
];

const stopwords = new Set([
  "yang",
  "dan",
  "atau",
  "dari",
  "dengan",
  "untuk",
  "jadi",
  "ini",
  "itu",
  "akan",
  "dalam",
  "pada",
  "karena",
  "setelah",
  "saat",
  "hingga",
  "bisa",
  "ada",
  "ke",
  "di",
  "the",
  "this",
  "that",
  "with",
  "from",
  "after",
  "before",
  "over",
  "into",
  "more",
  "new",
  "latest",
  "breaking",
  "umumkan",
  "dugaan",
  "pemicu",
  "paparkan",
  "fokus",
  "teknis",
  "dorong",
  "pembangunan",
  "perkuat",
  "layanan",
  "penantian",
  "selama",
  "wujudkan",
  "jaga",
  "kekuatan",
  "hasilkan",
  "sejumlah",
  "meninggalnya",
  "disinformasi",
  "perparah",
  "kepala",
  "sebut",
  "serupa",
  "tapi",
  "sama",
  "wabah",
  "akibat",
  "soal",
  "bikin",
  "hari",
  "kemarin",
  "besok",
  "terbaru",
  "lengkap",
  "prediksi",
  "calon",
  "lawan",
  "of",
  "a",
  "to",
  "in",
  "for",
  "on",
]);

const preferredTopics = [
  "Timnas Indonesia",
  "Bitcoin",
  "Ethereum",
  "Solana",
  "BNB",
  "XRP",
  "Crypto",
  "Google",
  "Microsoft",
  "Apple",
  "Meta",
  "TikTok",
  "YouTube",
  "Prabowo",
  "AI Video",
  "OpenAI",
  "Nvidia",
  "Film Indonesia",
  "Rupiah",
  "IHSG",
  "Wall Street",
  "Federal Reserve",
  "The Fed",
  "MotoGP",
  "Liga Indonesia",
  "Piala Dunia",
  "KPK",
  "Jakarta",
  "Demo",
  "Unjuk Rasa",
  "Mahasiswa",
  "Banjir",
  "Gempa",
  "Kebakaran",
  "Kecelakaan",
  "OJK",
  "BI",
];

const categoryKeywords: Array<[string, string[]]> = [
  ["Social", ["reddit", "viral post", "thread"]],
  ["Peristiwa", ["demo", "unjuk rasa", "mahasiswa", "aksi", "massa", "polisi", "kecelakaan", "kebakaran", "banjir", "gempa", "longsor", "macet", "ditangkap", "kriminal", "korban", "evakuasi"]],
  ["Crypto", ["bitcoin", "crypto", "kripto", "ethereum", "blockchain", "solana", "binance", "coinbase", "token", "stablecoin"]],
  ["Sports", ["timnas", "bola", "sepak", "liga", "pemain", "pertandingan", "piala dunia", "world cup"]],
  ["Technology", ["ai", "openai", "nvidia", "teknologi", "video", "aplikasi", "startup", "digital", "software", "chip", "iphone", "google", "microsoft"]],
  ["Entertainment", ["film", "musik", "artis", "aktor", "drama", "konser"]],
  ["Politics", ["prabowo", "presiden", "politik", "menteri", "pemerintah", "pilkada"]],
  ["Business", ["saham", "ekonomi", "rupiah", "bisnis", "bank", "harga", "ihsg", "wall street", "market", "stock", "fed", "inflation", "oil"]],
  ["Global", ["war", "trump", "china", "russia", "ukraine", "israel", "gaza", "europe", "asia", "world", "global"]],
];

const topicCategoryOverrides: Record<string, string> = {
  Bitcoin: "Crypto",
  Ethereum: "Crypto",
  Solana: "Crypto",
  BNB: "Crypto",
  XRP: "Crypto",
  Crypto: "Crypto",
  Google: "Technology",
  Microsoft: "Technology",
  Apple: "Technology",
  Meta: "Technology",
  TikTok: "Technology",
  YouTube: "Technology",
  IHSG: "Business",
  Rupiah: "Business",
  OJK: "Business",
  BI: "Business",
  "Wall Street": "Business",
  "Federal Reserve": "Business",
  "The Fed": "Business",
  "Timnas Indonesia": "Sports",
  MotoGP: "Sports",
  "Liga Indonesia": "Sports",
  "Piala Dunia": "Sports",
  Prabowo: "Politics",
  KPK: "Politics",
  Jakarta: "General",
  Demo: "Peristiwa",
  "Unjuk Rasa": "Peristiwa",
  Mahasiswa: "Peristiwa",
  Banjir: "Peristiwa",
  Gempa: "Peristiwa",
  Kebakaran: "Peristiwa",
  Kecelakaan: "Peristiwa",
  OpenAI: "Technology",
  Nvidia: "Technology",
  "AI Video": "Technology",
  "Film Indonesia": "Entertainment",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function detectCategory(text: string) {
  const lower = text.toLowerCase();
  const match = categoryKeywords.find(([, keywords]) =>
    keywords.some((keyword) => new RegExp(`\\b${keyword}\\b`, "i").test(lower)),
  );
  return match?.[0] ?? "General";
}

function detectArticleCategory(article: NewsArticle, topicName: string) {
  const source = article.source?.name ?? "";
  const sourceLower = source.toLowerCase();

  if (sourceLower.includes("reddit")) {
    return "Social";
  }

  if (sourceLower.includes("hacker news")) {
    return "Technology";
  }

  if (sourceLower.includes("coingecko")) {
    return "Crypto";
  }

  if (sourceLower.includes("gdelt")) {
    return topicCategoryOverrides[topicName] ?? "Global";
  }

  return (
    topicCategoryOverrides[topicName] ??
    detectCategory(`${article.title ?? ""} ${article.description ?? ""}`)
  );
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesWholePhrase(text: string, phrase: string) {
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegex(phrase)}([^\\p{L}\\p{N}]|$)`, "iu").test(
    text,
  );
}

function getTodayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  return { start, end };
}

function isTodayArticle(article: NewsArticle) {
  if (!article.publishedAt) {
    return true;
  }

  const published = new Date(article.publishedAt);
  const { start, end } = getTodayRange();

  return published >= start && published < end;
}

async function fetchJson<T>(url: string, timeoutMs = 7000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
        "User-Agent": "Darinol.id Trend Dashboard/0.1",
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

function googleNewsUrl(query: string) {
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", `${query} when:1d`);
  url.searchParams.set("hl", "id");
  url.searchParams.set("gl", "ID");
  url.searchParams.set("ceid", "ID:id");
  return url.toString();
}

function gdeltDate(value: Date) {
  const pad = (number: number) => number.toString().padStart(2, "0");

  return [
    value.getUTCFullYear(),
    pad(value.getUTCMonth() + 1),
    pad(value.getUTCDate()),
    pad(value.getUTCHours()),
    pad(value.getUTCMinutes()),
    pad(value.getUTCSeconds()),
  ].join("");
}

function toGdeltPublishedAt(value?: string) {
  if (!value || value.length < 14) return null;

  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const hour = value.slice(8, 10);
  const minute = value.slice(10, 12);
  const second = value.slice(12, 14);

  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

function getGoogleNewsPublisher(title?: string | null) {
  if (!title) return "Google News";

  const match = title.match(/\s-\s([^-]+)$/);
  const publisher = match?.[1]?.trim();

  return publisher ? `Google News - ${publisher}` : "Google News";
}

async function fetchGoogleNewsArticles(): Promise<NewsArticle[]> {
  const queries = [
    "viral Indonesia",
    "berita hari ini",
    "demo OR unjuk rasa OR aksi mahasiswa hari ini",
    "demo Jakarta hari ini OR unjuk rasa DPR OR Monas",
    "kecelakaan OR kebakaran OR banjir OR gempa hari ini",
    "peristiwa hari ini Indonesia",
    "IHSG OR rupiah OR saham",
    "bitcoin OR ethereum OR crypto",
    "AI OR OpenAI OR teknologi OR startup OR kecerdasan buatan",
    "Nvidia OR chip AI OR semikonduktor OR data center",
    "Google Gemini OR Microsoft Copilot OR Apple Intelligence OR Meta AI",
    "aplikasi viral OR teknologi viral OR tools AI",
    "Prabowo OR Jakarta",
    "Timnas Indonesia OR Piala Dunia",
    "global news OR world news",
  ];

  const feeds = await Promise.allSettled(
    queries.map(async (query) => {
      const { default: Parser } = await import("rss-parser");
      const parser = new Parser({
        timeout: 7000,
        headers: {
          "User-Agent": "Darinol.id Trend Dashboard/0.1",
        },
      });
      const feed = await parser.parseURL(googleNewsUrl(query));

      return feed.items.slice(0, 4).map(
        (item): NewsArticle => ({
          source: { name: getGoogleNewsPublisher(item.title) },
          title: item.title ?? null,
          description: item.contentSnippet ?? item.summary ?? null,
          url: item.link ?? null,
          publishedAt: item.isoDate ?? item.pubDate ?? null,
        }),
      );
    }),
  );

  return feeds.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

async function fetchGdeltArticles(): Promise<NewsArticle[]> {
  const now = new Date();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const query =
    "(Indonesia OR Jakarta OR protest OR demonstration OR accident OR fire OR flood OR earthquake OR bitcoin OR crypto OR AI OR OpenAI OR technology OR economy OR stock OR geopolitics OR football)";
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", query);
  url.searchParams.set("mode", "artlist");
  url.searchParams.set("format", "json");
  url.searchParams.set("maxrecords", "50");
  url.searchParams.set("sort", "hybridrel");
  url.searchParams.set("startdatetime", gdeltDate(start));
  url.searchParams.set("enddatetime", gdeltDate(now));

  const payload = await fetchJson<{ articles?: GdeltArticle[] }>(url.toString(), 8000);

  return (payload.articles ?? []).map((article) => ({
    source: { name: article.domain ? `GDELT - ${article.domain}` : "GDELT" },
    title: article.title ?? null,
    description: article.sourcecountry ? `Global coverage: ${article.sourcecountry}` : null,
    url: article.url ?? null,
    publishedAt: toGdeltPublishedAt(article.seendate),
  }));
}

async function fetchHackerNewsArticles(): Promise<NewsArticle[]> {
  const ids = await fetchJson<number[]>(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
    7000,
  );
  const selectedIds = ids.slice(0, 35);
  const settledStories = await Promise.allSettled(
    selectedIds.map((id) =>
      fetchJson<HackerNewsItem>(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
        5000,
      ),
    ),
  );

  return settledStories.flatMap((result) => {
    if (result.status !== "fulfilled" || !result.value.title) return [];

    const item = result.value;
    const publishedAt = item.time ? new Date(item.time * 1000).toISOString() : null;

    return [
      {
        source: { name: "Hacker News" },
        title: item.title,
        description: `HN score ${item.score ?? 0}, ${item.descendants ?? 0} comments`,
        url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
        publishedAt,
      },
    ];
  });
}

async function fetchCryptoMarketArticles(): Promise<NewsArticle[]> {
  const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
  url.searchParams.set("vs_currency", "usd");
  url.searchParams.set("ids", "bitcoin,ethereum,solana,ripple,binancecoin");
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", "5");
  url.searchParams.set("page", "1");
  url.searchParams.set("price_change_percentage", "24h");

  const markets = await fetchJson<CryptoMarket[]>(url.toString(), 7000);

  return markets.map((coin) => {
    const change = coin.price_change_percentage_24h ?? 0;
    const direction = change >= 0 ? "naik" : "turun";

    return {
      source: { name: "CoinGecko Market" },
      title: `${coin.name} ${direction} ${Math.abs(change).toFixed(2)}% dalam 24 jam`,
      description: `Harga $${coin.current_price.toLocaleString("en-US")} dengan volume $${coin.total_volume.toLocaleString("en-US")}`,
      url: `https://www.coingecko.com/en/coins/${coin.id}`,
      publishedAt: new Date().toISOString(),
    };
  });
}

async function fetchYouTubeSignalArticles(): Promise<NewsArticle[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) return [];

  const publishedAfter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const queries = [
    "berita viral indonesia hari ini",
    "demo indonesia hari ini",
    "teknologi ai indonesia",
    "timnas indonesia",
    "ekonomi rupiah saham indonesia",
  ];

  const settled = await Promise.allSettled(
    queries.map(async (query) => {
      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("type", "video");
      url.searchParams.set("order", "relevance");
      url.searchParams.set("regionCode", "ID");
      url.searchParams.set("maxResults", "5");
      url.searchParams.set("publishedAfter", publishedAfter);
      url.searchParams.set("q", query);
      url.searchParams.set("key", apiKey);

      const payload = await fetchJson<YouTubeSearchPayload>(url.toString(), 8000);

      return (payload.items ?? []).flatMap((item): NewsArticle[] => {
        const videoId = item.id?.videoId;
        const snippet = item.snippet;

        if (!videoId || !snippet?.title) return [];

        return [
          {
            source: {
              name: snippet.channelTitle
                ? `YouTube - ${snippet.channelTitle}`
                : "YouTube",
            },
            title: snippet.title,
            description: snippet.description ?? null,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            publishedAt: snippet.publishedAt ?? null,
          },
        ];
      });
    }),
  );

  return settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

async function fetchFastSignalArticles() {
  const settled = await Promise.allSettled([
    fetchGoogleNewsArticles(),
    fetchGdeltArticles(),
    fetchHackerNewsArticles(),
    fetchCryptoMarketArticles(),
    fetchYouTubeSignalArticles(),
  ]);

  return settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

function extractTopicName(article: NewsArticle) {
  const title = (article.title ?? "")
    .replace(/\s[-|]\s[^-|]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const text = `${title} ${article.description ?? ""}`;
  const lower = text.toLowerCase();
  const preferred = preferredTopics.find((topic) => includesWholePhrase(lower, topic.toLowerCase()));

  if (preferred) {
    return preferred;
  }

  const words = text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !stopwords.has(word.toLowerCase()))
    .slice(0, 3);

  return titleCase(words.join(" ") || "Topik Hari Ini");
}

function buildTopics(articles: NewsArticle[]) {
  const seenArticles = new Set<string>();
  const sourceUsage = new Map<string, number>();
  const sourceLimit = 18;
  const grouped = new Map<
    string,
    {
      name: string;
      category: string;
      articles: NewsArticle[];
      sources: Set<string>;
      newest: number;
    }
  >();

  articles
    .filter(isTodayArticle)
    .filter((article) => article.title && article.url)
    .forEach((article) => {
      const source = article.source?.name ?? "News";
      const baseSource = source.replace(/^Google News -\s*/, "");
      const currentSourceUsage = sourceUsage.get(baseSource) ?? 0;

      if (currentSourceUsage >= sourceLimit) {
        return;
      }

      const articleKey = article.url ?? article.title ?? "";

      if (seenArticles.has(articleKey)) {
        return;
      }

      seenArticles.add(articleKey);
      sourceUsage.set(baseSource, currentSourceUsage + 1);

      const name = extractTopicName(article);
      const id = slugify(name);
      const published = article.publishedAt ? Date.parse(article.publishedAt) : Date.now();
      const existing = grouped.get(id);

      if (existing) {
        existing.articles.push(article);
        existing.sources.add(source);
        existing.newest = Math.max(existing.newest, published);
        return;
      }

      grouped.set(id, {
        name,
        category: detectArticleCategory(article, name),
        articles: [article],
        sources: new Set([source]),
        newest: published,
      });
    });

  const now = Date.now();

  const rankedTopics = Array.from(grouped.values())
    .map((group): Topic => {
      const articleCount = group.articles.length;
      const sourceCount = group.sources.size;
      const ageHours = Math.max(1, (now - group.newest) / 36e5);
      const recencyScore = Math.max(0, 35 - ageHours);
      const volumeScore = Math.min(30, articleCount * 10);
      const diversityScore = Math.min(20, sourceCount * 7);
      const singleArticlePenalty = articleCount === 1 ? 24 : 0;
      const score = Math.max(
        70,
        Math.min(99, Math.round(45 + recencyScore + volumeScore + diversityScore - singleArticlePenalty)),
      );
      const growth = `+${Math.min(380, 80 + articleCount * 45 + sourceCount * 25)}%`;

      return {
        id: slugify(group.name),
        name: group.name,
        category: group.category,
        score,
        growth,
        whyViral: [
          `Terdeteksi dari ${articleCount} artikel terbaru.`,
          `Dibahas oleh ${sourceCount} sumber berita berbeda.`,
          `Topik muncul dalam berita yang dipublikasikan beberapa jam terakhir.`,
        ],
        ideas: [
          `Kenapa ${group.name} ramai dibahas?`,
          `Apa yang membuat ${group.name} menarik hari ini?`,
          `Fakta ${group.name} yang perlu diketahui kreator`,
          `Apakah ${group.name} masih relevan untuk dibahas?`,
        ],
        titles: [
          `${group.name} Lagi Ramai, Apa Penyebabnya?`,
          `Kenapa ${group.name} Mendadak Dibahas?`,
          `Yang Sedang Terjadi Dengan ${group.name}`,
        ],
        articles: group.articles.slice(0, 5).map((article) => ({
          title: article.title ?? group.name,
          source: article.source?.name ?? "News",
          url: article.url ?? "#",
          publishedAt: article.publishedAt ?? null,
        })),
      };
    })
    .sort((a, b) => b.score - a.score);

  const categoryMinimums: Record<string, number> = {
    Technology: 4,
    Peristiwa: 5,
    Business: 4,
    Crypto: 3,
    Global: 3,
    Social: 2,
  };
  const selected = new Map<string, Topic>();

  Object.entries(categoryMinimums).forEach(([category, minimum]) => {
    rankedTopics
      .filter((topic) => topic.category === category)
      .slice(0, minimum)
      .forEach((topic) => selected.set(topic.id, topic));
  });

  rankedTopics.forEach((topic) => {
    if (selected.size < 28) {
      selected.set(topic.id, topic);
    }
  });

  return Array.from(selected.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 28);
}

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY;
  const country = process.env.NEWS_COUNTRY ?? "id";
  const pageSize = process.env.NEWS_PAGE_SIZE ?? "40";

  if (!apiKey) {
    const [rssArticles, fastSignalArticles] = await Promise.all([
      fetchRssArticles().catch(() => []),
      fetchFastSignalArticles().catch(() => []),
    ]);
    const topics = buildTopics([...rssArticles, ...fastSignalArticles]);

    return trendsJson({
      source: topics.length ? "fast-free" : "fallback",
      updatedAt: new Date().toISOString(),
      topics: topics.length ? topics : fallbackTopics,
    });
  }

  try {
    const rssArticlesPromise = fetchRssArticles();
    const fastSignalArticlesPromise = fetchFastSignalArticles();
    const headlineUrl = new URL("https://newsapi.org/v2/top-headlines");
    headlineUrl.searchParams.set("country", country);
    headlineUrl.searchParams.set("pageSize", pageSize);
    headlineUrl.searchParams.set("apiKey", apiKey);

    const headlineResponse = await fetch(headlineUrl, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (!headlineResponse.ok) {
      throw new Error(`NewsAPI top-headlines returned ${headlineResponse.status}`);
    }

    const headlinePayload = (await headlineResponse.json()) as {
      status: string;
      articles?: NewsArticle[];
    };

    let newsApiArticles = headlinePayload.articles ?? [];

    if (!newsApiArticles.length) {
      const everythingUrl = new URL("https://newsapi.org/v2/everything");
      everythingUrl.searchParams.set("q", "Indonesia OR Jakarta OR Prabowo OR Timnas OR Rupiah");
      everythingUrl.searchParams.set(
        "domains",
        "kompas.com,tempo.co,cnnindonesia.com,cnbcindonesia.com,antaranews.com,detik.com",
      );
      everythingUrl.searchParams.set("language", "id");
      everythingUrl.searchParams.set("sortBy", "publishedAt");
      everythingUrl.searchParams.set("from", getTodayRange().start.toISOString());
      everythingUrl.searchParams.set("to", getTodayRange().end.toISOString());
      everythingUrl.searchParams.set("pageSize", pageSize);
      everythingUrl.searchParams.set("apiKey", apiKey);

      const everythingResponse = await fetch(everythingUrl, {
        next: { revalidate: 60 },
        headers: { Accept: "application/json" },
      });

      if (everythingResponse.ok) {
        const everythingPayload = (await everythingResponse.json()) as {
          status: string;
          articles?: NewsArticle[];
        };
        newsApiArticles = everythingPayload.articles ?? [];
      }
    }

    const rssArticles = await rssArticlesPromise;
    const fastSignalArticles = await fastSignalArticlesPromise;
    const articles = [...newsApiArticles, ...rssArticles, ...fastSignalArticles];
    const topics = buildTopics(articles);

    return trendsJson({
      source: topics.length
        ? fastSignalArticles.length
          ? newsApiArticles.length
            ? "newsapi+fast-free"
            : "fast-free"
          : rssArticles.length && newsApiArticles.length
            ? "newsapi+rss"
            : rssArticles.length
              ? "rss"
              : "newsapi"
        : "fallback",
      updatedAt: new Date().toISOString(),
      topics: topics.length ? topics : fallbackTopics,
    });
  } catch (error) {
    const [rssArticles, fastSignalArticles] = await Promise.all([
      fetchRssArticles().catch(() => []),
      fetchFastSignalArticles().catch(() => []),
    ]);
    const topics = buildTopics([...rssArticles, ...fastSignalArticles]);

    if (topics.length) {
      return trendsJson({
        source: fastSignalArticles.length ? "fast-free" : "rss",
        updatedAt: new Date().toISOString(),
        topics,
      });
    }

    return trendsJson(
      {
        source: "fallback",
        updatedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown news fetch error",
        topics: fallbackTopics,
      },
      { status: 200 },
    );
  }
}
