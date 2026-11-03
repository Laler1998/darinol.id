export type SponsorStatus = "draft" | "active" | "inactive";
export type SponsorPlacement = "homepage-radar-bottom" | "homepage-sidebar" | "homepage-inline" | "article-inline";

export type Sponsor = {
  id: string;
  brand_name: string;
  headline: string;
  description: string;
  image_url?: string;
  destination_url: string;
  cta_label?: string;
  label: string;
  placement: SponsorPlacement;
  status: SponsorStatus;
  start_at?: string;
  end_at?: string;
  campaign_id?: string;
};

export type PublicSponsor = Omit<Sponsor, "status" | "start_at" | "end_at">;
export type SponsorSlots = Record<SponsorPlacement, PublicSponsor | null>;

export const sponsors: readonly Sponsor[] = [];

export function isValidSponsorDestination(value: string) {
  try {
    const destination = new URL(value);
    return destination.protocol === "https:" && !destination.username && !destination.password;
  } catch {
    return false;
  }
}

export function isAllowedSponsorImage(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !/[\u0000-\u001f]/.test(value);
}

export function isSponsorActive(sponsor: Sponsor, now = Date.now()) {
  if (sponsor.status !== "active" || !isValidSponsorDestination(sponsor.destination_url)) return false;

  const startsAt = sponsor.start_at ? Date.parse(sponsor.start_at) : null;
  const endsAt = sponsor.end_at ? Date.parse(sponsor.end_at) : null;

  if (sponsor.start_at && (!Number.isFinite(startsAt) || (startsAt as number) > now)) return false;
  if (sponsor.end_at && (!Number.isFinite(endsAt) || (endsAt as number) <= now)) return false;

  return true;
}

export function selectActiveSponsor(sponsorList: readonly Sponsor[], placement: SponsorPlacement, now = Date.now()) {
  return sponsorList.find((sponsor) => sponsor.placement === placement && isSponsorActive(sponsor, now)) ?? null;
}

export function getActiveSponsor(placement: SponsorPlacement, now = Date.now()): PublicSponsor | null {
  const sponsor = selectActiveSponsor(sponsors, placement, now);
  if (!sponsor) return null;

  const { status, start_at, end_at, ...publicSponsor } = sponsor;
  return publicSponsor;
}

export function getActiveSponsors(now = Date.now()): SponsorSlots {
  return {
    "homepage-radar-bottom": getActiveSponsor("homepage-radar-bottom", now),
    "homepage-sidebar": getActiveSponsor("homepage-sidebar", now),
    "homepage-inline": getActiveSponsor("homepage-inline", now),
    "article-inline": getActiveSponsor("article-inline", now),
  };
}