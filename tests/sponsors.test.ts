import { describe, expect, it } from "vitest";
import { getActiveSponsors, isAllowedSponsorImage, isValidSponsorDestination, selectActiveSponsor, type Sponsor } from "@/lib/sponsors";

const now = Date.parse("2026-10-18T00:00:00.000Z");

const activeSponsor: Sponsor = {
  id: "rapi-app",
  brand_name: "Rapi",
  headline: "Nyatat duit secepat ngetik chat.",
  description: "Tanpa form dan dropdown. Gratis, termasuk AI.",
  image_url: "/rapi-logo.png",
  destination_url: "https://www.rapiapp.online/app/",
  cta_label: "Mulai Gratis",
  label: "Iklan",
  placement: "homepage-radar-bottom",
  status: "active",
};

describe("sponsor selection", () => {
  it("leaves homepage ad slots available until a real sponsor is configured", () => {
    const slots = getActiveSponsors(now);
    const placements = ["homepage-radar-bottom", "homepage-sidebar", "homepage-inline"] as const;

    for (const placement of placements) {
      expect(slots[placement]).toBeNull();
    }
  });

  it("selects an active sponsor for its placement", () => {
    expect(selectActiveSponsor([activeSponsor], "homepage-radar-bottom", now)).toEqual(activeSponsor);
  });

  it("does not select inactive sponsors or sponsors in another placement", () => {
    expect(selectActiveSponsor([{ ...activeSponsor, status: "inactive" }], "homepage-radar-bottom", now)).toBeNull();
    expect(selectActiveSponsor([activeSponsor], "article-inline", now)).toBeNull();
  });

  it("respects campaign start and end boundaries", () => {
    expect(selectActiveSponsor([{ ...activeSponsor, start_at: "2026-10-18T00:00:01.000Z" }], "homepage-radar-bottom", now)).toBeNull();
    expect(selectActiveSponsor([{ ...activeSponsor, end_at: "2026-10-18T00:00:00.000Z" }], "homepage-radar-bottom", now)).toBeNull();
    expect(selectActiveSponsor([{ ...activeSponsor, start_at: "invalid" }], "homepage-radar-bottom", now)).toBeNull();
  });

  it("rejects unsafe destination and image URLs", () => {
    expect(selectActiveSponsor([{ ...activeSponsor, destination_url: "javascript:alert(1)" }], "homepage-radar-bottom", now)).toBeNull();
    expect(isValidSponsorDestination("http://rapiapp.online/app/")).toBe(false);
    expect(isAllowedSponsorImage("/rapi-logo.png")).toBe(true);
    expect(isAllowedSponsorImage("//other-site.example/logo.png")).toBe(false);
    expect(isAllowedSponsorImage("https://other-site.example/logo.png")).toBe(false);
  });
});