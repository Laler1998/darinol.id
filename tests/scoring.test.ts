import { describe, expect, it } from "vitest";
import { SCORE_CEILING, SCORE_FLOOR, growthLabel, scoreTopic } from "@/lib/scoring";

const NOW = Date.parse("2026-07-30T12:00:00Z");
const hoursAgo = (h: number) => NOW - h * 36e5;

describe("scoreTopic", () => {
  it("stays inside the 35-99 band even at the extremes", () => {
    const huge = scoreTopic({
      articleCount: 500,
      sourceCount: 500,
      newestPublishedAt: NOW,
      now: NOW,
    });
    const tiny = scoreTopic({
      articleCount: 1,
      sourceCount: 1,
      newestPublishedAt: hoursAgo(1000),
      now: NOW,
    });

    expect(huge).toBe(SCORE_CEILING);
    expect(tiny).toBe(SCORE_FLOOR);
  });

  /**
   * The regression that motivated these tests: the old weights summed past 99
   * for almost any topic, so everything clamped to 99 and the radar could not
   * rank. A realistic mid-sized topic must land clearly below the ceiling.
   */
  it("does not saturate for an ordinary topic", () => {
    const score = scoreTopic({
      articleCount: 3,
      sourceCount: 2,
      newestPublishedAt: hoursAgo(2),
      now: NOW,
    });

    expect(score).toBeLessThan(SCORE_CEILING);
    expect(score).toBeGreaterThan(SCORE_FLOOR);
  });

  it("produces a spread of distinct scores across typical inputs", () => {
    const inputs = [
      { articleCount: 14, sourceCount: 9 },
      { articleCount: 6, sourceCount: 4 },
      { articleCount: 3, sourceCount: 2 },
      { articleCount: 2, sourceCount: 1 },
      { articleCount: 1, sourceCount: 1 },
    ];
    const scores = inputs.map((input) =>
      scoreTopic({ ...input, newestPublishedAt: hoursAgo(3), now: NOW }),
    );

    // Strictly descending: more coverage must always outrank less.
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThan(scores[i - 1]);
    }
    expect(new Set(scores).size).toBe(scores.length);
  });

  it("ranks a fresher topic above an older one with identical coverage", () => {
    const coverage = { articleCount: 4, sourceCount: 3 };
    const fresh = scoreTopic({ ...coverage, newestPublishedAt: hoursAgo(1), now: NOW });
    const stale = scoreTopic({ ...coverage, newestPublishedAt: hoursAgo(10), now: NOW });

    expect(fresh).toBeGreaterThan(stale);
  });

  it("penalises a single-article topic against a two-article one", () => {
    const one = scoreTopic({
      articleCount: 1,
      sourceCount: 1,
      newestPublishedAt: hoursAgo(1),
      now: NOW,
    });
    const two = scoreTopic({
      articleCount: 2,
      sourceCount: 2,
      newestPublishedAt: hoursAgo(1),
      now: NOW,
    });

    expect(two - one).toBeGreaterThan(20);
  });

  it("treats a future timestamp as brand new rather than negative age", () => {
    const future = scoreTopic({
      articleCount: 3,
      sourceCount: 2,
      newestPublishedAt: NOW + 36e5,
      now: NOW,
    });
    const exact = scoreTopic({
      articleCount: 3,
      sourceCount: 2,
      newestPublishedAt: NOW,
      now: NOW,
    });

    expect(future).toBe(exact);
  });
});

describe("growthLabel", () => {
  it("formats as a percentage and caps at 380%", () => {
    expect(growthLabel({ articleCount: 1, sourceCount: 1 })).toBe("+150%");
    expect(growthLabel({ articleCount: 99, sourceCount: 99 })).toBe("+380%");
  });
});
