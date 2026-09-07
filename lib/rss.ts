import Parser from "rss-parser";
import { unstable_cache } from "next/cache";

export type NormalizedRssArticle = {
  source: { name: string };
  title: string | null;
  description: string | null;
  url: string | null;
  image: string | null;
  publishedAt: string | null;
};

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "Darinol.id Trend Dashboard/0.1",
  },
});

const rssSources = [
  {
    name: "Detik News",
    url: "https://rss.detik.com/index.php/detikcom",
  },
  {
    name: "Detik Finance",
    url: "https://rss.detik.com/index.php/finance",
  },
  {
    name: "Detik Inet",
    url: "https://rss.detik.com/index.php/inet",
  },
  {
    name: "Antara News",
    url: "https://www.antaranews.com/rss/terkini.xml",
  },
  {
    name: "Antara Ekonomi",
    url: "https://www.antaranews.com/rss/ekonomi.xml",
  },
  {
    name: "CNBC Indonesia",
    url: "https://www.cnbcindonesia.com/news/rss",
  },
  {
    name: "CNBC Market",
    url: "https://www.cnbcindonesia.com/market/rss",
  },
  {
    name: "CNN Indonesia",
    url: "https://www.cnnindonesia.com/nasional/rss",
  },
  {
    name: "CNN Ekonomi",
    url: "https://www.cnnindonesia.com/ekonomi/rss",
  },
  {
    name: "Kompas Nasional",
    url: "https://nasional.kompas.com/rss",
  },
  {
    name: "Kompas Money",
    url: "https://money.kompas.com/rss",
  },
  {
    name: "Tempo",
    url: "https://rss.tempo.co/nasional",
  },
  {
    name: "Tempo Bisnis",
    url: "https://rss.tempo.co/bisnis",
  },
  {
    name: "Kompas Tekno",
    url: "https://tekno.kompas.com/rss",
  },
  {
    name: "Kompas Bola",
    url: "https://bola.kompas.com/rss",
  },
  {
    name: "Liputan6 News",
    url: "https://www.liputan6.com/rss",
  },
  {
    name: "Republika",
    url: "https://www.republika.co.id/rss",
  },
  {
    name: "Okezone",
    url: "https://sindikasi.okezone.com/index.php/rss/0/RSS2.0",
  },
  {
    name: "Suara News",
    url: "https://www.suara.com/rss/news",
  },
  {
    name: "Merdeka",
    url: "https://www.merdeka.com/feed/",
  },
  {
    name: "Media Indonesia",
    url: "https://mediaindonesia.com/feed",
  },
  {
    name: "Bisnis Indonesia",
    url: "https://www.bisnis.com/rss",
  },
  {
    name: "IDX Channel",
    url: "https://www.idxchannel.com/rss",
  },
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
  },
  {
    name: "Cointelegraph",
    url: "https://cointelegraph.com/rss",
  },
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
  },
  {
    name: "The Guardian World",
    url: "https://www.theguardian.com/world/rss",
  },
  {
    name: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
  },
  {
    name: "Reddit WorldNews",
    url: "https://www.reddit.com/r/worldnews/top/.rss?t=day",
  },
  {
    name: "Reddit Technology",
    url: "https://www.reddit.com/r/technology/top/.rss?t=day",
  },
  {
    name: "Reddit CryptoCurrency",
    url: "https://www.reddit.com/r/CryptoCurrency/top/.rss?t=day",
  },
  {
    name: "Reddit Stocks",
    url: "https://www.reddit.com/r/stocks/top/.rss?t=day",
  },
  {
    name: "Reddit Indonesia",
    url: "https://www.reddit.com/r/indonesia/top/.rss?t=day",
  },
];

const rssSourceNames = new Set(rssSources.map((source) => source.name));
const articleHistory = new Map<string, NormalizedRssArticle>();

function extractArticleImage(item: Parser.Item & { enclosure?: { url?: string } }) {
  const enclosureImage = item.enclosure?.url;
  if (enclosureImage) return enclosureImage;

  const content = item.content ?? item.summary ?? "";
  const imageMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imageMatch?.[1] ?? null;
}

export function isRssSource(source: string) {
  return rssSourceNames.has(source);
}

export function normalizeArticleSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

export function stripArticleHashSuffix(value: string) {
  return value.replace(/-[a-z0-9]{5,}$/i, "").replace(/-+$/g, "");
}

export function articleSlug(title: string, source: string, url?: string) {
  const base = normalizeArticleSlug(`${title}-${source}`);

  if (!url) return base;

  const hash = Array.from(url)
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0)
    .toString(36);

  return `${base}-${hash}`.slice(0, 150);
}

async function fetchRssArticlesUncached() {
  const settledFeeds = await Promise.allSettled(
    rssSources.map(async (source) => {
      const feed = await parser.parseURL(source.url);

      return feed.items.slice(0, 8).map(
        (item): NormalizedRssArticle => ({
          source: { name: source.name },
          title: item.title ?? null,
          description:
            item.contentSnippet ??
            item.summary ??
            item.content?.replace(/<[^>]*>/g, " ").slice(0, 220) ??
            null,
          url: item.link ?? null,
          image: extractArticleImage(item),
          publishedAt: item.isoDate ?? item.pubDate ?? null,
        }),
      );
    }),
  );

  const articles = settledFeeds.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  return articles;
}

const getCachedRssArticles = unstable_cache(
  fetchRssArticlesUncached,
  ["darinol-rss-articles"],
  { revalidate: 60 },
);

export async function fetchRssArticles() {
  const articles = await getCachedRssArticles();

  articles.forEach((article) => {
    if (article.title) {
      const key = articleSlug(article.title, article.source.name, article.url ?? undefined);
      articleHistory.set(key, article);
      articleHistory.set(normalizeArticleSlug(`${article.title}-${article.source.name}`), article);
    }
  });

  return articles;
}

export async function findRssArticle(slug: string) {
  const historicalArticle = articleHistory.get(slug);
  if (historicalArticle) return historicalArticle;

  const baseSlug = stripArticleHashSuffix(slug);
  const historicalLegacyArticle = baseSlug && baseSlug !== slug ? articleHistory.get(baseSlug) : null;
  if (historicalLegacyArticle) return historicalLegacyArticle;

  const articles = await fetchRssArticles();

  return (
    articles.find((article) => {
      if (!article.title || !article.source.name) return false;

      const generated = articleSlug(article.title, article.source.name, article.url ?? undefined);
      const normalizedBase = normalizeArticleSlug(`${article.title}-${article.source.name}`);
      return generated === slug || generated === baseSlug || normalizedBase === baseSlug;
    }) ?? articleHistory.get(baseSlug) ?? null
  );
}
