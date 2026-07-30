import { describe, expect, it } from "vitest";
import {
  buildLatestFeed,
  formatRelativeTime,
  getMomentumLabel,
  getTopicLabel,
  groupByRecency,
} from "@/lib/format";
import type { FeedArticle, Topic } from "@/lib/types";

const NOW = Date.now();
const minutesAgo = (m: number) => new Date(NOW - m * 60000).toISOString();

function topic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: "bitcoin",
    name: "Bitcoin",
    category: "Crypto",
    radar_type: "news",
    score: 90,
    growth: "+200%",
    whyViral: [],
    articles: [],
    ...overrides,
  };
}

function article(url: string, minutes: number) {
  return {
    title: `Judul ${url}`,
    source: "CoinDesk",
    url,
    publishedAt: minutesAgo(minutes),
  };
}

describe("buildLatestFeed", () => {
  it("sorts newest first across topics", () => {
    const feed = buildLatestFeed([
      topic({ id: "a", articles: [article("https://x/1", 120)] }),
      topic({ id: "b", articles: [article("https://x/2", 5)] }),
      topic({ id: "c", articles: [article("https://x/3", 40)] }),
    ]);

    expect(feed.map((a) => a.url)).toEqual(["https://x/2", "https://x/3", "https://x/1"]);
  });

  it("drops duplicate urls and placeholder links", () => {
    const feed = buildLatestFeed([
      topic({ id: "a", articles: [article("https://x/1", 10), article("https://x/1", 20)] }),
      topic({ id: "b", articles: [{ ...article("#", 5), url: "#" }] }),
    ]);

    expect(feed).toHaveLength(1);
    expect(feed[0].url).toBe("https://x/1");
  });

  it("respects the limit", () => {
    const many = Array.from({ length: 30 }, (_, i) => article(`https://x/${i}`, i));

    expect(buildLatestFeed([topic({ articles: many })], 10)).toHaveLength(10);
  });

  it("carries the topic name and category onto each article", () => {
    const [first] = buildLatestFeed([
      topic({ name: "Rupiah", category: "Business", articles: [article("https://x/1", 3)] }),
    ]);

    expect(first.topicName).toBe("Rupiah");
    expect(first.category).toBe("Business");
    expect(first.radarType).toBe("news");
  });
});

describe("groupByRecency", () => {
  const feedArticle = (minutes: number, url: string): FeedArticle => ({
    ...article(url, minutes),
    topicId: "t",
    topicName: "T",
    category: "Crypto",
    radarType: "news",
  });

  it("buckets by age and keeps bucket order regardless of input order", () => {
    const groups = groupByRecency(
      [feedArticle(600, "https://x/old"), feedArticle(2, "https://x/new"), feedArticle(45, "https://x/mid")],
      "id",
    );

    expect(groups.map((g) => g.label)).toEqual([
      "Baru saja",
      "1 jam terakhir",
      "12 jam terakhir",
    ]);
  });

  it("omits empty buckets", () => {
    const groups = groupByRecency([feedArticle(1, "https://x/1")], "id");

    expect(groups).toHaveLength(1);
    expect(groups[0].articles).toHaveLength(1);
  });

  it("localises bucket labels", () => {
    expect(groupByRecency([feedArticle(1, "https://x/1")], "en")[0].label).toBe("Just now");
  });

  it("treats a missing timestamp as just now instead of dropping it", () => {
    const groups = groupByRecency(
      [{ ...feedArticle(1, "https://x/1"), publishedAt: null }],
      "id",
    );

    expect(groups[0].label).toBe("Baru saja");
  });
});

describe("formatRelativeTime", () => {
  it("switches units as the gap grows", () => {
    expect(formatRelativeTime(minutesAgo(0), "id")).toBe("baru saja");
    expect(formatRelativeTime(minutesAgo(5), "id")).toBe("5 menit lalu");
    expect(formatRelativeTime(minutesAgo(120), "id")).toBe("2 jam lalu");
    expect(formatRelativeTime(minutesAgo(60 * 24 * 3), "id")).toBe("3 hari lalu");
  });

  it("falls back for null and unparseable input", () => {
    expect(formatRelativeTime(null, "id")).toBe("baru saja");
    expect(formatRelativeTime("not-a-date", "en")).toBe("just now");
  });
});

describe("getTopicLabel", () => {
  it("uses the category for news and the culture category for culture", () => {
    expect(getTopicLabel(topic())).toBe("Crypto");
    expect(
      getTopicLabel(topic({ radar_type: "culture", culture_category: "internet_slang" })),
    ).toBe("internet slang");
  });
});

describe("getMomentumLabel", () => {
  it("maps score bands to labels", () => {
    expect(getMomentumLabel(90, "id")).toBe("Sangat ramai");
    expect(getMomentumLabel(75, "id")).toBe("Naik cepat");
    expect(getMomentumLabel(50, "id")).toBe("Mulai ramai");
  });
});
