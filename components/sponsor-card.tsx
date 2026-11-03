"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { trackFunnel } from "@/lib/analytics";
import type { PublicSponsor, SponsorPlacement } from "@/lib/sponsors";

type SponsorCardVariant = "banner" | "compact" | "inline";
const trackedImpressions = new Set<string>();
const opportunityCopy: Record<SponsorCardVariant, { headline: string; description: string }> = {
  banner: {
    headline: "Promosikan brand Anda di Darinol.",
    description: "Ruang iklan tersedia untuk brand yang ingin hadir di tengah tren.",
  },
  compact: {
    headline: "Ingin brand Anda tampil di radar?",
    description: "Tempat promosi tersedia di sini.",
  },
  inline: {
    headline: "Brand Anda bisa tampil di sini.",
    description: "Pasang iklan bersama Darinol.",
  },
};
const placementForVariant: Record<SponsorCardVariant, SponsorPlacement> = {
  banner: "homepage-radar-bottom",
  compact: "homepage-sidebar",
  inline: "homepage-inline",
};

function isSafeLocalImagePath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !/[\u0000-\u001f]/.test(value);
}

export function SponsorCard({ sponsor, variant = "banner" }: { sponsor: PublicSponsor | null; variant?: SponsorCardVariant }) {
  const cardRef = useRef<HTMLElement>(null);
  const impressionTracked = useRef<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [sponsor?.id, sponsor?.image_url]);

  useEffect(() => {
    const card = cardRef.current;
    const impressionKey = sponsor ? `${sponsor.id}:${sponsor.placement}` : "";
    if (!sponsor || !card || impressionTracked.current === impressionKey || trackedImpressions.has(impressionKey) || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || entry.intersectionRatio < 0.5 || impressionTracked.current === impressionKey || trackedImpressions.has(impressionKey)) return;
      impressionTracked.current = impressionKey;
      trackedImpressions.add(impressionKey);
      trackFunnel("sponsor_impression", {
        sponsor_id: sponsor.id,
        campaign_id: sponsor.campaign_id,
        placement: sponsor.placement,
      });
      observer.disconnect();
    }, { threshold: 0.5 });

    observer.observe(card);
    return () => observer.disconnect();
  }, [sponsor]);

  if (!sponsor) {
    const copy = opportunityCopy[variant];
    const layout = variant === "compact" ? "flex flex-col gap-2 p-3" : "flex flex-col gap-2 p-4";
    const tickerCopy = [copy.headline, copy.description, "Pasang iklan bersama Darinol"].join("  /  ");

    return (
      <aside className={`sponsor-slot sponsor-slot--${variant}`} aria-label="Ruang iklan tersedia">
        <div className={`rounded-md bg-darinol-primaryFill text-black ${layout}`}>
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em]">Ruang promosi</span>
          <h2 className="font-heading text-sm font-bold sm:text-base">{copy.headline}</h2>
          <p className="sr-only">{copy.description}</p>
          <div className="sponsor-ticker" aria-hidden="true">
            <div className="sponsor-ticker-track font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-darinol-primaryInk">
              <span>{tickerCopy}</span>
              <span>{tickerCopy}</span>
            </div>
          </div>
          <a
            className="mt-1 inline-flex min-h-11 w-fit items-center gap-2 border-b border-black/50 pb-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em]"
            href={`/pasang-iklan?placement=${placementForVariant[variant]}`}
            onClick={() => trackFunnel("advertising_inquiry_opened", { placement: placementForVariant[variant] })}
          >
            Pasang iklan<span aria-hidden="true">→</span>
          </a>
        </div>
      </aside>
    );
  }

  const safeImageUrl = sponsor.image_url && isSafeLocalImagePath(sponsor.image_url) ? sponsor.image_url : null;
  const showImage = Boolean(safeImageUrl && !imageFailed);
  const cardLayout = variant === "compact"
    ? "flex flex-col gap-3 p-3"
    : variant === "inline"
      ? "flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-3"
      : "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4";
  const imageFrame = variant === "compact"
    ? "mx-auto flex h-12 w-20 shrink-0 items-center justify-center"
    : "flex h-16 w-24 shrink-0 items-center justify-center";
  const ctaSize = variant === "compact" ? "w-full" : "shrink-0";

  return (
    <aside ref={cardRef} className={`sponsor-slot sponsor-slot--${variant}`} aria-label={`${sponsor.label}: ${sponsor.brand_name}`}>
      <div className={`flex rounded-md border border-darinol-border bg-white ${cardLayout}`}>
        {sponsor.image_url ? (
          <div className={imageFrame}>
            {showImage ? (
              <Image
                className="max-h-full max-w-full object-contain"
                src={safeImageUrl!}
                alt={`${sponsor.brand_name} logo`}
                width={100}
                height={60}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-darinol-primary/10 font-heading text-sm font-bold text-darinol-primary" role="img" aria-label={`${sponsor.brand_name} image unavailable`}>
                {sponsor.brand_name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-darinol-muted sm:text-[10px]">
            {sponsor.label} · {sponsor.brand_name}
          </span>
          <h2 className="mt-1 font-heading text-sm font-bold text-darinol-text">{sponsor.headline}</h2>
          <p className="mt-1 text-xs leading-relaxed text-darinol-muted">{sponsor.description}</p>
        </div>
        <a
          className={`inline-flex min-h-11 ${ctaSize} items-center justify-center gap-2 rounded-md border border-darinol-primary px-4 font-mono text-xs font-semibold text-darinol-primary hover:bg-darinol-primary/5`}
          href={sponsor.destination_url}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={() => trackFunnel("sponsor_click", {
            sponsor_id: sponsor.id,
            campaign_id: sponsor.campaign_id,
            placement: sponsor.placement,
          })}
        >
          {sponsor.cta_label ?? "Kunjungi"}<span aria-hidden="true">→</span>
        </a>
      </div>
    </aside>
  );
}