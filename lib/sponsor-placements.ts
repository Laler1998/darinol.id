import type { SponsorPlacement } from "@/lib/sponsors";

export const sponsorPlacementOptions = [
  {
    id: "homepage-radar-bottom",
    name: "Banner bawah radar",
    description: "Kartu selebar area konten, setelah daftar tren utama.",
    sizeGuide: "Desktop horizontal · ponsel bertumpuk",
    imageGuide: "Logo horizontal, rekomendasi 600 × 360 px",
  },
  {
    id: "homepage-sidebar",
    name: "Kartu ringkas sidebar",
    description: "Muncul di bawah ringkasan Radar Aktif pada layar desktop.",
    sizeGuide: "Kolom samping · ponsel selebar konten",
    imageGuide: "Logo persegi, rekomendasi 400 × 400 px",
  },
  {
    id: "homepage-inline",
    name: "Sisipan di tren",
    description: "Muncul di antara sinyal tren pertama dan kedua.",
    sizeGuide: "Selebar daftar tren · ponsel bertumpuk",
    imageGuide: "Logo horizontal, rekomendasi 600 × 360 px",
  },
] as const satisfies readonly { id: SponsorPlacement; name: string; description: string; sizeGuide: string; imageGuide: string }[];

export type SponsorPlacementOption = (typeof sponsorPlacementOptions)[number];

export function isSponsorPlacement(value: string): value is SponsorPlacement {
  return sponsorPlacementOptions.some((option) => option.id === value);
}