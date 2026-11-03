import { describe, expect, it } from "vitest";
import { articleSlug, matchesArticleSlug, normalizeArticleSlug } from "@/lib/rss";

describe("articleSlug", () => {
  it("creates unique slugs when the same title appears from the same source", () => {
    const first = articleSlug("Bitcoin Naik", "Detik News", "https://example.com/1");
    const second = articleSlug("Bitcoin Naik", "Detik News", "https://example.com/2");
    const base = normalizeArticleSlug("Bitcoin Naik-Detik News");

    expect(first).not.toBe(second);
    expect(first.startsWith(`${base}-`)).toBe(true);
    expect(matchesArticleSlug({
      title: "Bitcoin Naik",
      source: { name: "Detik News" },
      url: "https://example.com/1",
    }, first)).toBe(true);
  });

  it("matches legacy slugs whose source name looks like a hash suffix", () => {
    const article = {
      title: "Bitcoin's volatility curve has a midterm bump",
      source: { name: "CoinDesk" },
      url: "https://example.com/article",
    };
    const legacySlug = "bitcoin-s-volatility-curve-has-a-midterm-bump-coindesk";

    expect(matchesArticleSlug(article, legacySlug)).toBe(true);
    expect(matchesArticleSlug(article, `${legacySlug}-wrong`)).toBe(false);
  });
});
