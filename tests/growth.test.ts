import { describe, expect, it } from "vitest";
import { calculateGrowth } from "@/lib/growth";

describe("calculateGrowth", () => {
  it("calculates the observed percentage change", () => {
    expect(calculateGrowth(10, 15)).toEqual({ growth_percent: 50, growth_status: "measured" });
    expect(calculateGrowth(10, 5)).toEqual({ growth_percent: -50, growth_status: "measured" });
    expect(calculateGrowth(0, 0)).toEqual({ growth_percent: 0, growth_status: "measured" });
  });

  it("distinguishes a new topic from one without a baseline", () => {
    expect(calculateGrowth(0, 3)).toEqual({ growth_percent: null, growth_status: "new" });
    expect(calculateGrowth(null, 3)).toEqual({ growth_percent: null, growth_status: "collecting" });
  });
});
