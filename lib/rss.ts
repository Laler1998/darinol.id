import Parser from "rss-parser";

export type NormalizedRssArticle = {
  source: { name: string };
  title: string | null;
  description: string | null;
  url: string | null;
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

export async function fetchRssArticles() {
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
          publishedAt: item.isoDate ?? item.pubDate ?? null,
        }),
      );
    }),
  );

  return settledFeeds.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
}
