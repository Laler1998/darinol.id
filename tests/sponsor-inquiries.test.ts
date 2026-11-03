import { describe, expect, it } from "vitest";
import { sponsorInquirySchema } from "@/lib/sponsor-inquiries";
import { maxSponsorDesignBytes, validateSponsorDesign } from "@/lib/sponsor-designs";
import { sponsorPlacementOptions } from "@/lib/sponsor-placements";

const validInquiry = {
  brand_name: "Contoh Brand",
  contact_name: "Ayu Putri",
  contact_email: "AYU@example.com",
  contact_whatsapp: "",
  product_url: "https://example.com/product",
  logo_url: "",
  product_description: "Produk untuk membantu pelanggan mengelola kebutuhan sehari-hari.",
  placements: ["homepage-radar-bottom", "homepage-inline"],
  contact_consent: true,
  website: "",
};

describe("sponsorInquirySchema", () => {
  it("accepts complete inquiries and normalizes contact email", () => {
    const result = sponsorInquirySchema.safeParse(validInquiry);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.contact_email).toBe("ayu@example.com");
  });

  it("allows an optional requested trend with a bounded length", () => {
    expect(sponsorInquirySchema.safeParse({ ...validInquiry, requested_trend: "Tren pembayaran digital" }).success).toBe(true);
    expect(sponsorInquirySchema.safeParse({ ...validInquiry, requested_trend: "x".repeat(161) }).success).toBe(false);
  });

  it("requires at least one known placement and contact consent", () => {
    expect(sponsorInquirySchema.safeParse({ ...validInquiry, placements: [] }).success).toBe(false);
    expect(sponsorInquirySchema.safeParse({ ...validInquiry, placements: ["unknown-slot"] }).success).toBe(false);
    expect(sponsorInquirySchema.safeParse({ ...validInquiry, contact_consent: false }).success).toBe(false);
  });

  it("accepts only HTTPS destinations and logo references", () => {
    expect(sponsorInquirySchema.safeParse({ ...validInquiry, product_url: "http://example.com" }).success).toBe(false);
    expect(sponsorInquirySchema.safeParse({ ...validInquiry, logo_url: "javascript:alert(1)" }).success).toBe(false);
  });

  it("enforces field length limits", () => {
    expect(sponsorInquirySchema.safeParse({ ...validInquiry, brand_name: "x".repeat(101) }).success).toBe(false);
    expect(sponsorInquirySchema.safeParse({ ...validInquiry, product_description: "x".repeat(1501) }).success).toBe(false);
  });
});

describe("validateSponsorDesign", () => {
  it("accepts matching PNG signatures and rejects MIME spoofing", async () => {
    const validPng = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "brand.png", { type: "image/png" });
    const spoofedPng = new File(["not an image"], "brand.png", { type: "image/png" });

    await expect(validateSponsorDesign(validPng)).resolves.toBe("image/png");
    await expect(validateSponsorDesign(spoofedPng)).resolves.toBeNull();
  });

  it("rejects empty files, unsupported types, and files over 4 MB", async () => {
    const empty = new File([], "empty.png", { type: "image/png" });
    const svg = new File(["<svg />"], "brand.svg", { type: "image/svg+xml" });
    const oversized = new File([new Uint8Array(maxSponsorDesignBytes + 1)], "large.png", { type: "image/png" });

    await expect(validateSponsorDesign(empty)).resolves.toBeNull();
    await expect(validateSponsorDesign(svg)).resolves.toBeNull();
    await expect(validateSponsorDesign(oversized)).resolves.toBeNull();
  });
});

