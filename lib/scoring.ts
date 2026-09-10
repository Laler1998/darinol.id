/**
 * Trend scoring for the news radar.
 *
 * Extracted from the API route so it can be tested directly. The weights are
 * tuned so scores spread across the 35-99 band rather than saturating at 99 —
 * an earlier version added up to 123 before clamping, which made almost every
 * topic score 99 and left the radar unable to rank anything.
 */
export const SCORE_FLOOR = 35;
export const SCORE_CEILING = 99;

/** Freshness is worth this much at age 0 and decays to 0 over ~12 hours. */
const RECENCY_MAX = 30;
const RECENCY_DECAY_PER_HOUR = 2.5;
const VOLUME_MAX = 36;
const DIVERSITY_MAX = 26;
/** Higher = slower approach to the ceiling, so large stories keep separating. */
const VOLUME_SCALE = 5;
const DIVERSITY_SCALE = 3.5;
/** A lone article is usually noise, not a trend. */
const SINGLE_ARTICLE_PENALTY = 18;
const BASE = 12;

/**
 * Smooth saturation instead of a hard cap. A hard cap made a 14-article story
 * from 9 sources score identically to a 6-article one from 4, because both had
 * already maxed out volume and diversity — the radar flattened exactly where
 * ranking matters most. This curve always increases, so bigger always outranks
 * smaller, while still tapering so one runaway topic cannot dominate.
 */
function saturating(count: number, max: number, scale: number): number {
  return max * (1 - Math.exp(-count / scale));
}

export function scoreTopic({
  articleCount,
  sourceCount,
  newestPublishedAt,
  now = Date.now(),
}: {
  articleCount: number;
  sourceCount: number;
  /** Epoch ms of the most recent article in the group. */
  newestPublishedAt: number;
  now?: number;
}): number {
  const ageHours = Math.max(0, (now - newestPublishedAt) / 36e5);
  const recency = Math.max(0, RECENCY_MAX - ageHours * RECENCY_DECAY_PER_HOUR);
  const volume = saturating(articleCount, VOLUME_MAX, VOLUME_SCALE);
  const diversity = saturating(sourceCount, DIVERSITY_MAX, DIVERSITY_SCALE);
  const penalty = articleCount === 1 ? SINGLE_ARTICLE_PENALTY : 0;

  return Math.max(
    SCORE_FLOOR,
    Math.min(SCORE_CEILING, Math.round(BASE + recency + volume + diversity - penalty)),
  );
}

export function growthLabel({
  articleCount,
  sourceCount,
}: {
  articleCount: number;
  sourceCount: number;
}): string {
  return `+${Math.min(380, 80 + articleCount * 45 + sourceCount * 25)}%`;
}
