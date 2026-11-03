import { z } from "zod";
import { sponsorPlacementOptions } from "@/lib/sponsor-placements";

const placementIds = sponsorPlacementOptions.map((option) => option.id) as [string, ...string[]];

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const sponsorInquirySchema = z.object({
  brand_name: z.string().trim().min(2).max(100),
  contact_name: z.string().trim().min(2).max(100),
  contact_email: z.email().transform((value) => value.toLowerCase()),
  contact_whatsapp: z.string().trim().max(40).optional(),
  product_url: z.url().refine(isHttpsUrl, "URL website harus menggunakan HTTPS."),
  logo_url: z.string().trim().max(2048).optional().refine((value) => !value || isHttpsUrl(value), "URL logo harus menggunakan HTTPS."),
  product_description: z.string().trim().min(20).max(1500),
  requested_trend: z.string().trim().max(160).optional(),
  placements: z.array(z.enum(placementIds)).min(1).max(sponsorPlacementOptions.length),
  contact_consent: z.literal(true),
  website: z.string().max(200).optional(),
});

export type SponsorInquiryInput = z.input<typeof sponsorInquirySchema>;
export type ValidSponsorInquiry = z.output<typeof sponsorInquirySchema>;