import { del, put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { sponsorDesignExtension, validateSponsorDesign } from "@/lib/sponsor-designs";
import { sponsorInquirySchema } from "@/lib/sponsor-inquiries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({ error: "Pengajuan belum tersedia. Silakan coba lagi nanti." }, { status: 503 });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 5_000_000) {
    return NextResponse.json({ error: "Ukuran pengajuan melebihi batas." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Format form tidak valid." }, { status: 400 });
  }

  const result = sponsorInquirySchema.safeParse({
    brand_name: form.get("brand_name"),
    contact_name: form.get("contact_name"),
    contact_email: form.get("contact_email"),
    contact_whatsapp: form.get("contact_whatsapp") ?? "",
    product_url: form.get("product_url"),
    logo_url: form.get("logo_url") ?? "",
    product_description: form.get("product_description"),
    requested_trend: form.get("requested_trend") ?? "",
    placements: form.getAll("placements"),
    contact_consent: form.get("contact_consent") === "yes",
    website: form.get("website") ?? "",
  });
  if (!result.success) {
    return NextResponse.json({ error: "Periksa kembali isian form." }, { status: 400 });
  }

  const inquiry = result.data;
  if (inquiry.website?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const fileEntry = form.get("design_file");
  const designFile = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
  if (designFile && !(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN))) {
    return NextResponse.json({ error: "Upload desain belum aktif. Kirim pengajuan tanpa file atau coba lagi nanti." }, { status: 503 });
  }

  const contentType = designFile ? await validateSponsorDesign(designFile) : null;
  if (designFile && !contentType) {
    return NextResponse.json({ error: "File harus berupa JPG, PNG, WebP, atau PDF dengan ukuran maksimal 4 MB." }, { status: 400 });
  }

  let uploadedPath: string | null = null;
  try {
    const sql = neon(connectionString);
    const recentInquiry = await sql`
      SELECT id
      FROM darinol_sponsor_inquiries
      WHERE contact_email = ${inquiry.contact_email}
        AND created_at > NOW() - INTERVAL '15 minutes'
      LIMIT 1
    `;
    if (recentInquiry.length) {
      return NextResponse.json({ error: "Pengajuan baru saja diterima. Tunggu 15 menit sebelum mengirim lagi." }, { status: 429 });
    }

    const inquiryId = crypto.randomUUID();
    let storedFileName: string | null = null;
    let storedContentType: string | null = null;

    if (designFile && contentType) {
      storedFileName = designFile.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 200);
      storedContentType = contentType;
      const uploaded = await put(
        `sponsor-inquiries/${inquiryId}/design.${sponsorDesignExtension(contentType)}`,
        designFile,
        { access: "private", addRandomSuffix: true, contentType },
      );
      uploadedPath = uploaded.pathname;
    }

    await sql`
      INSERT INTO darinol_sponsor_inquiries (
        id, brand_name, contact_name, contact_email, contact_whatsapp,
        product_url, logo_url, product_description, requested_trend,
        design_blob_path, design_file_name,
        design_file_content_type, design_review_status, placements, contact_consent
      ) VALUES (
        ${inquiryId},
        ${inquiry.brand_name},
        ${inquiry.contact_name},
        ${inquiry.contact_email},
        ${inquiry.contact_whatsapp || null},
        ${inquiry.product_url},
        ${inquiry.logo_url || null},
        ${inquiry.product_description},
        ${inquiry.requested_trend || null},
        ${uploadedPath},
        ${storedFileName},
        ${storedContentType},
        ${uploadedPath ? "pending_review" : "not_submitted"},
        ${JSON.stringify(inquiry.placements)}::jsonb,
        ${inquiry.contact_consent}
      )
    `;

    let notificationSent = false;
    const notificationEmail = process.env.SPONSOR_NOTIFICATION_EMAIL;
    const resendApiKey = process.env.RESEND_API_KEY;
    const senderDomain = process.env.RESEND_EMAIL_DOMAIN;

    if (notificationEmail && resendApiKey && senderDomain) {
      try {
        const { data, error } = await new Resend(resendApiKey).emails.send({
          from: `Darinol Sponsor Inquiries <inquiries@${senderDomain}>`,
          to: [notificationEmail],
          subject: `[Darinol] Pengajuan iklan baru: ${inquiry.brand_name}`,
          text: [
            "Pengajuan iklan baru masuk ke Darinol.",
            "",
            `Brand: ${inquiry.brand_name}`,
            `Nama kontak: ${inquiry.contact_name}`,
            `Email: ${inquiry.contact_email}`,
            `WhatsApp: ${inquiry.contact_whatsapp || "Tidak dicantumkan"}`,
            `Website: ${inquiry.product_url}`,
            `Placement: ${inquiry.placements.join(", ")}`,
            `Tren: ${inquiry.requested_trend || "Tidak dicantumkan"}`,
            "",
            "Deskripsi:",
            inquiry.product_description,
            "",
            `File desain diunggah: ${uploadedPath ? "Ya" : "Tidak"}`,
          ].join("\n"),
        }, {
          idempotencyKey: `sponsor-inquiry/${inquiryId}`,
        });

        if (error) {
          console.error("Sponsor inquiry email notification failed.", error.name, error.message);
        } else {
          notificationSent = Boolean(data?.id);
        }
      } catch (error) {
        console.error(
          "Sponsor inquiry email notification failed.",
          error instanceof Error ? error.message : "Unknown email error",
        );
      }
    } else {
      console.error("Sponsor inquiry email notification is not configured.");
    }

    return NextResponse.json({ ok: true, review_status: "pending_review", file_uploaded: Boolean(uploadedPath), notification_sent: notificationSent }, { status: 201 });
  } catch (error) {
    if (uploadedPath) {
      try {
        await del(uploadedPath);
      } catch {
        console.error("Orphan sponsor design cleanup failed.");
      }
    }
    console.error("Sponsor inquiry could not be saved.", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Pengajuan belum dapat disimpan. Silakan coba lagi nanti." }, { status: 503 });
  }
}