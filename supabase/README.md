# Supabase Setup Darinol.id

## 1. Buat Project

1. Buka Supabase.
2. Buat project baru.
3. Simpan `Project URL` dan `anon public key`.

## 2. Isi Environment Variable

Di local `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Di Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Jangan masukkan service role key ke frontend.

## 3. Jalankan Schema

1. Buka Supabase SQL Editor.
2. Paste isi `supabase/schema.sql`.
3. Run.

Schema membuat:

- `profiles`: status akun user, plan, payment status.
- `saved_ideas`: ide konten yang disimpan user.
- `manual_payments`: catatan QRIS/manual payment.

## 4. Auth Setting

Untuk MVP paling mudah:

- Aktifkan Email Auth.
- Pakai magic link atau OTP email.
- Tambahkan domain Vercel ke allowed redirect URLs saat sudah deploy.

Local redirect URL:

```text
http://localhost:3000
http://127.0.0.1:3000
```

Production redirect URL:

```text
https://darinol-id.vercel.app
```

## 5. Manual Payment Flow

Untuk MVP:

1. User pilih Starter.
2. User scan QRIS manual.
3. User kirim bukti pembayaran ke admin.
4. Admin buka Supabase Dashboard.
5. Update `profiles.plan` menjadi `starter`.
6. Update `profiles.payment_status` menjadi `paid`.

Nanti kalau sudah pakai payment gateway QRIS dinamis, webhook bisa update table ini otomatis.
