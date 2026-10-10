export type GrowthStatus =
  | "measured"
  | "new"
  | "collecting"
  | "unavailable"
  | "not_measured";

export function calculateGrowth(previousCount: number | null, currentCount: number) {
  if (previousCount === null) {
    return { growth_percent: null, growth_status: "collecting" as const };
  }

  if (previousCount === 0 && currentCount > 0) {
    return { growth_percent: null, growth_status: "new" as const };
  }

  if (previousCount === 0) {
    return { growth_percent: 0, growth_status: "measured" as const };
  }

  return {
    growth_percent: Math.round(((currentCount - previousCount) / previousCount) * 100),
    growth_status: "measured" as const,
  };
}
