import { describe, expect, it } from "vitest";
import { isLowQualityHeadline } from "@/lib/news-quality";

describe("isLowQualityHeadline", () => {
  it.each([
    "Football live gratis Reddit Persita vs Persija",
    "Tonton langsung pertandingan Persita vs Persija",
    "Saluran TV gratis untuk pertandingan malam ini",
    "Watch free live stream: football final",
  ])("rejects spam-like headline: %s", (title) => {
    expect(isLowQualityHeadline(title)).toBe(true);
  });

  it.each([
    "XNXX.COM=+XnXX VIDEO 18+ Indonesia Bokep Indo Viral",
    "Pendaftaran situs judi online dengan bonus slot gacor",
    "Pornhub video terbaru tersebar di media sosial",
  ])("rejects adult or gambling headline: %s", (title) => {
    expect(isLowQualityHeadline(title, "Google News - Publisher")).toBe(true);
  });

  it("rejects prohibited publisher names even when linked through Google News", () => {
    expect(isLowQualityHeadline(
      "Local university hosts a technology conference",
      "Google News - XNXX",
      "https://news.google.com/rss/articles/example",
    )).toBe(true);
  });

  it.each([
    "https://xnxx.example/story",
    "https://slot-gacor.example/promo",
    "javascript:alert(1)",
  ])("rejects blocked or unsafe outbound URL: %s", (url) => {
    expect(isLowQualityHeadline("Ordinary news headline", "Publisher", url)).toBe(true);
  });

  it("rejects a prohibited URL even when the headline is missing", () => {
    expect(isLowQualityHeadline(null, "Google News", "https://xnxx.example/story")).toBe(true);
  });

  it.each([
    "Persija Jakarta menang dalam laga Liga 1",
    "Pemerintah umumkan aturan baru hari ini",
    "Live report: perkembangan sidang di Jakarta",
    "Riset terbaru soal dampak perubahan iklim",
  ])("keeps ordinary news headline: %s", (title) => {
    expect(isLowQualityHeadline(title)).toBe(false);
  });

  it("allows a missing title to be handled by normal validation", () => {
    expect(isLowQualityHeadline(null)).toBe(false);
  });
});
