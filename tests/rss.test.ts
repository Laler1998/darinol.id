import { describe, expect, it } from "vitest";
import { articleSlug, normalizeArticleSlug, stripArticleHashSuffix } from "@/lib/rss";

describe("articleSlug", () => {
  it("creates unique slugs when the same title appears from the same source", () => {
    const first = articleSlug("Bitcoin Naik", "Detik News", "https://example.com/1");
    const second = articleSlug("Bitcoin Naik", "Detik News", "https://example.com/2");
    const base = normalizeArticleSlug("Bitcoin Naik-Detik News");

    expect(first).not.toBe(second);
    expect(first.startsWith(`${base}-`)).toBe(true);
    expect(stripArticleHashSuffix(first)).toBe(base);
    expect(stripArticleHashSuffix(second)).toBe(base);
  });

  it("keeps compatibility with legacy article slugs without a hash suffix", () => {
    const legacy = "bitcoin-naik-detik-news";
    const hashed = "bitcoin-naik-detik-news-abc123";

    expect(stripArticleHashSuffix(legacy)).toBe("bitcoin-naik-detik-news");
    expect(stripArticleHashSuffix(hashed)).toBe("bitcoin-naik-detik-news");
    expect(stripArticleHashSuffix("bitcoin-naik-detik-news-2024")).toBe("bitcoin-naik-detik-news-2024");
  });
});
