import Image from "next/image";

type Sponsor = {
  name: string;
  headline?: string;
  message?: string;
  imageSrc?: string;
  imageAlt?: string;
  href?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function SponsorSlot({ sponsor = null }: { sponsor?: Sponsor | null }) {
  return (
    <aside className="sponsor-slot border-y border-dashed border-darinol-border py-4" aria-label="Promosi dan peluang sponsor">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-darinol-muted sm:text-[10px]">
          {sponsor ? "Promosi · Didukung oleh" : "Peluang sponsor"}
        </span>
        <h2 className="mt-1 font-heading text-base font-bold text-darinol-text sm:text-lg">
          {sponsor?.href ? <a className="hover:text-darinol-primary" href={sponsor.href}>{sponsor.name}</a> : sponsor?.name ?? "Bawa brand Anda ke radar Darinol."}
        </h2>
      </div>
      {!sponsor ? <p className="mb-3 max-w-xl text-xs leading-relaxed text-darinol-muted sm:text-sm">Jangkau audiens yang sedang mengikuti tren. Hubungi tim Darinol untuk memasang iklan.</p> : null}
      <div className="flex flex-col gap-3 rounded-md border border-darinol-border bg-white p-4 sm:flex-row sm:items-center sm:gap-4" aria-label="Contoh iklan sponsor">
        {sponsor?.imageSrc ? (
          <div className="flex h-16 w-24 shrink-0 items-center justify-center">
            <Image className="max-h-full max-w-full object-contain" src={sponsor.imageSrc} alt={sponsor.imageAlt ?? sponsor.name} width={100} height={60} />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-darinol-muted">{sponsor ? `Iklan · ${sponsor.name}` : "Contoh iklan"}</span>
        <h3 className="mt-1 font-heading text-sm font-bold text-darinol-text">{sponsor?.headline ?? "Nama brand · Produk unggulan"}</h3>
        <p className="mt-1 text-xs leading-relaxed text-darinol-muted">{sponsor?.message ?? "Temani tren hari ini dengan solusi yang pas."}</p>
        </div>
        {sponsor?.ctaHref ? (
          <a className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-darinol-primary px-4 font-mono text-xs font-semibold text-darinol-primary hover:bg-darinol-primary/5" href={sponsor.ctaHref} target="_blank" rel="noreferrer">
            {sponsor.ctaLabel ?? "Kenali brand ini"}<span aria-hidden="true">→</span>
          </a>
        ) : <span className="font-mono text-[10px] font-semibold text-darinol-primary">{sponsor?.ctaLabel ?? "Kenali brand ini"} →</span>}
      </div>
    </aside>
  );
}