import type { Metadata } from "next";
import Link from "next/link";
import { SponsorInquiryForm } from "@/components/sponsor-inquiry-form";
import { sponsorPlacementOptions } from "@/lib/sponsor-placements";

export const metadata: Metadata = {
  title: "Pasang Iklan",
  description: "Ajukan penempatan promosi brand atau produk di Darinol Trend Radar.",
};

export default async function SponsorInquiryPage({ searchParams }: { searchParams: Promise<{ placement?: string }> }) {
  const { placement } = await searchParams;
  const initialPlacement = sponsorPlacementOptions.find((option) => option.id === placement)?.id ?? "homepage-radar-bottom";

  return (
    <main className="min-h-screen px-4 py-8 text-darinol-text sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link className="inline-flex min-h-11 items-center gap-2 font-mono text-xs font-semibold text-darinol-primaryInk hover:underline" href="/">
          <span aria-hidden="true">←</span>Kembali ke radar
        </Link>

        <header className="mb-8 mt-4 max-w-3xl border-b border-darinol-border pb-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-darinol-primaryInk">Darinol · Kemitraan</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-darinol-text sm:text-4xl">Bawa brand Anda ke radar.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-darinol-muted sm:text-base">
            Kirim detail brand dan produk. Pilih posisi yang sesuai; tim Darinol akan meninjau materi dan menghubungi Anda untuk langkah berikutnya.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.8fr)] lg:gap-14">
          <SponsorInquiryForm initialPlacement={initialPlacement} />

          <aside className="self-start border-t border-darinol-border pt-5 lg:sticky lg:top-8 lg:border-t-0 lg:pt-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-darinol-muted">Info penempatan</p>
            <h2 className="mt-2 font-heading text-lg font-bold text-darinol-text">Dibuat agar nyaman dibaca.</h2>
            <p className="mt-2 text-sm leading-relaxed text-darinol-muted">Semua format menyesuaikan layar desktop dan ponsel. Logo bersifat opsional; copy dan CTA ditinjau sebelum iklan tayang.</p>
            <div className="mt-6 border-y border-darinol-border py-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-darinol-muted">Alur</p>
              <ol className="mt-3 space-y-3 text-sm text-darinol-text">
                <li className="flex gap-3"><span className="font-mono text-darinol-primaryInk">01</span><span>Kirim brand, tautan, dan placement.</span></li>
                <li className="flex gap-3"><span className="font-mono text-darinol-primaryInk">02</span><span>Tim Darinol meninjau kesesuaian materi.</span></li>
                <li className="flex gap-3"><span className="font-mono text-darinol-primaryInk">03</span><span>Detail jadwal dan pembayaran dibahas setelah disetujui.</span></li>
              </ol>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-darinol-muted">Form ini belum memproses pembayaran. Tim Darinol akan menghubungi Anda untuk membahas penawaran dan metode pembayaran setelah pengajuan ditinjau.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}