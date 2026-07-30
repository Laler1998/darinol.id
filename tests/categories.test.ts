import { describe, expect, it } from "vitest";
import { getCategoryStyle } from "@/lib/categories";
import { newsCategoryFilters } from "@/lib/copy";

describe("getCategoryStyle", () => {
  it("returns a distinct dot colour for every filterable news category", () => {
    const categories = newsCategoryFilters.filter((c) => c !== "Semua");
    const dots = categories.map((c) => getCategoryStyle(c).dot);

    // "General" deliberately shares the neutral fallback, so allow one repeat.
    expect(new Set(dots).size).toBeGreaterThanOrEqual(categories.length - 1);
  });

  it("falls back to the neutral style for an unknown category", () => {
    const unknown = getCategoryStyle("Nonexistent");

    expect(unknown).toEqual(getCategoryStyle("General"));
  });

  it("uses one shared style for culture regardless of category name", () => {
    expect(getCategoryStyle("music", true)).toEqual(getCategoryStyle("meme", true));
  });

  /**
   * Tailwind only scans the globs in tailwind.config.ts. These class strings
   * live in lib/, which was once missing from that list — every chip silently
   * rendered grey. Guard the shape so a malformed entry is caught here.
   */
  it("emits both a text and a background utility for each chip", () => {
    for (const category of newsCategoryFilters) {
      const { chip, dot } = getCategoryStyle(category);

      expect(chip).toMatch(/\btext-/);
      expect(chip).toMatch(/\bbg-/);
      expect(chip).toMatch(/\bdark:/);
      expect(dot).toMatch(/^bg-/);
    }
  });
});
