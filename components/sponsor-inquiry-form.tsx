"use client";

import { useState } from "react";
import { sponsorPlacementOptions, type SponsorPlacementOption } from "@/lib/sponsor-placements";

const fieldClassName = "mt-1.5 min-h-11 w-full rounded-md border border-darinol-border bg-darinol-surface px-3 py-2 text-sm text-darinol-text outline-none transition focus:border-darinol-primary focus:ring-2 focus:ring-darinol-primary/20";

export function SponsorInquiryForm({ initialPlacement }: { initialPlacement: SponsorPlacementOption["id"] }) {
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([initialPlacement]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function togglePlacement(placement: string) {
    setSelectedPlacements((current) => current.includes(placement)
      ? current.filter((item) => item !== placement)
      : [...current, placement]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/sponsor-inquiries", {
        method: "POST",
        body: formData,
      });
      const result = await response.json() as { ok?: boolean; error?: string; file_uploaded?: boolean; notification_sent?: boolean };

      if (!response.ok || !result.ok) throw new Error(result.error ?? "Pengajuan belum dapat dikirim.");

      form.reset();
      setSelectedPlacements([initialPlacement]);
      setFeedback({
        type: "success",
        message: result.notification_sent
          ? `Pengajuan diterima dan notifikasi email terkirim${result.file_uploaded ? ", termasuk file desain" : ""}. Materi tidak tayang sebelum disetujui. Pembayaran belum diminta.`
          : `Pengajuan tersimpan, tetapi notifikasi email belum terkirim. Tim mungkin belum melihat pengajuan ini; coba hubungi Darinol secara langsung.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Terjadi kendala. Coba lagi nanti.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <section aria-labelledby="advertiser-details-title">
        <div className="mb-4 border-b border-darinol-border pb-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-darinol-muted">01 · Brand</p>
          <h2 id="advertiser-details-title" className="mt-1 font-heading text-lg font-bold text-darinol-text">Ceritakan tentang brand Anda</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-darinol-text">
            Nama brand / bisnis
            <input className={fieldClassName} name="brand_name" minLength={2} maxLength={100} autoComplete="organization" required />
          </label>
          <label className="text-sm font-semibold text-darinol-text">
            Website / halaman produk
            <input className={fieldClassName} name="product_url" type="url" inputMode="url" placeholder="https://" maxLength={2048} required />
            <span className="mt-1 block text-xs font-normal text-darinol-muted">Gunakan URL HTTPS yang bisa ditinjau tim Darinol.</span>
          </label>
          <label className="text-sm font-semibold text-darinol-text sm:col-span-2">
            Deskripsi produk / pesan iklan
            <textarea className={`${fieldClassName} min-h-28 resize-y`} name="product_description" minLength={20} maxLength={1500} placeholder="Jelaskan produk dan pesan yang ingin ditampilkan." required />
          </label>
          <label className="text-sm font-semibold text-darinol-text sm:col-span-2">
            Topik tren yang ingin diangkat (opsional)
            <input className={fieldClassName} name="requested_trend" maxLength={160} placeholder="Contoh: tren pembayaran digital di UMKM" />
            <span className="mt-1 block text-xs font-normal text-darinol-muted">Tim Darinol meninjau topik secara editorial; skor sinyal tidak dibuat-buat.</span>
          </label>
          <label className="text-sm font-semibold text-darinol-text sm:col-span-2">
            URL logo (opsional)
            <input className={fieldClassName} name="logo_url" type="url" inputMode="url" placeholder="https://" maxLength={2048} />
            <span className="mt-1 block text-xs font-normal text-darinol-muted">Sebagai referensi materi; ukuran rekomendasi mengikuti format di samping.</span>
          </label>
        </div>
      </section>

      <section aria-labelledby="contact-details-title">
        <div className="mb-4 border-b border-darinol-border pb-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-darinol-muted">02 · Kontak</p>
          <h2 id="contact-details-title" className="mt-1 font-heading text-lg font-bold text-darinol-text">Ke mana tim kami menghubungi?</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-darinol-text">
            Nama kontak
            <input className={fieldClassName} name="contact_name" minLength={2} maxLength={100} autoComplete="name" required />
          </label>
          <label className="text-sm font-semibold text-darinol-text">
            Email
            <input className={fieldClassName} name="contact_email" type="email" maxLength={254} autoComplete="email" required />
          </label>
          <label className="text-sm font-semibold text-darinol-text sm:col-span-2">
            WhatsApp (opsional)
            <input className={fieldClassName} name="contact_whatsapp" type="tel" maxLength={40} autoComplete="tel" />
          </label>
        </div>
      </section>

      <fieldset className="space-y-3" aria-describedby="placement-help">
        <legend className="font-heading text-lg font-bold text-darinol-text">Pilih format penempatan</legend>
        <p id="placement-help" className="text-sm text-darinol-muted">Boleh pilih lebih dari satu. Tim Darinol akan mengonfirmasi ketersediaannya.</p>
        <div className="divide-y divide-darinol-border border-y border-darinol-border">
          {sponsorPlacementOptions.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-start gap-3 py-3">
              <input
                className="mt-1 h-4 w-4 accent-darinol-primary"
                type="checkbox"
                name="placements"
                value={option.id}
                checked={selectedPlacements.includes(option.id)}
                onChange={() => togglePlacement(option.id)}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-darinol-text">{option.name}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-darinol-muted">{option.description}</span>
                <span className="mt-1 block font-mono text-[10px] text-darinol-muted">{option.sizeGuide} · {option.imageGuide}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <section aria-labelledby="design-file-title">
        <div className="mb-4 border-b border-darinol-border pb-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-darinol-muted">03 · Materi</p>
          <h2 id="design-file-title" className="mt-1 font-heading text-lg font-bold text-darinol-text">Punya desain iklan?</h2>
        </div>
        <label className="block text-sm font-semibold text-darinol-text">
          Upload file desain (opsional)
          <input className={`${fieldClassName} h-auto file:mr-3 file:rounded-sm file:border-0 file:bg-darinol-primaryFill file:px-3 file:py-2 file:font-semibold file:text-white`} name="design_file" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" aria-describedby="design-file-help" />
        </label>
        <p id="design-file-help" className="mt-2 text-xs leading-relaxed text-darinol-muted">JPG, PNG, WebP, atau PDF · maks. 4 MB. File disimpan privat dan hanya ditinjau tim Darinol; iklan tidak tayang otomatis. Bisa dikirim belakangan jika desain belum siap.</p>
      </section>

      <div className="border-l-2 border-darinol-primary bg-darinol-surface px-4 py-3" role="note">
        <p className="text-sm font-semibold text-darinol-text">Pembayaran online belum tersedia.</p>
        <p className="mt-1 text-xs leading-relaxed text-darinol-muted">Belum ada tagihan saat mengirim form ini. Tim Darinol akan menghubungi Anda setelah meninjau pengajuan untuk membahas penawaran dan metode pembayaran.</p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-darinol-muted">
        <input className="mt-1 h-4 w-4 accent-darinol-primary" type="checkbox" name="contact_consent" value="yes" required />
        <span>Saya setuju dihubungi Darinol untuk menindaklanjuti pengajuan ini.</span>
      </label>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>Website <input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {feedback ? (
        <p className={feedback.type === "success" ? "border-l-2 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm text-emerald-950" : "border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-950"} role="status" aria-live="polite">
          {feedback.message}
        </p>
      ) : null}

      <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-darinol-primaryFill px-5 font-semibold text-white transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60 sm:w-auto" type="submit" disabled={submitting || selectedPlacements.length === 0}>
        {submitting ? "Mengirim pengajuan..." : "Kirim pengajuan"}<span aria-hidden="true">→</span>
      </button>
    </form>
  );
}