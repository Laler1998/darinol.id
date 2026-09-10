# Milestone Media Sosial dan Sumber Global

## Status saat ini

- Berita: RSS Indonesia, Google News RSS, NewsAPI bila `NEWS_API_KEY` tersedia, GDELT, Hacker News, dan sinyal market.
- Culture: Reddit public feeds dan YouTube Data API.
- YouTube kini membaca `YOUTUBE_REGION_CODES` dengan default `ID,US,GB,JP`.
- GDELT dan sumber berita lain digabung dengan deduplikasi URL kanonik serta judul ternormalisasi.

## Milestone 1 - Global news baseline

**Target:** coverage global tanpa menambah biaya API wajib.

- Pertahankan RSS Indonesia dan tambahkan feed internasional yang memiliki RSS resmi.
- Gunakan GDELT untuk discovery lintas negara dan bahasa.
- Simpan provider, domain, negara sumber bila tersedia, waktu publikasi UTC, URL kanonik, dan status live/fallback.
- Batasi hasil per provider agar satu domain atau satu negara tidak mendominasi.
- Acceptance criteria: satu artikel yang sama dari GDELT, RSS, dan Google News tampil satu kali; kegagalan GDELT tidak menghilangkan RSS.

**Biaya dan quota:** GDELT Doc API tersedia publik tanpa API key, tetapi tetap perlu timeout, cache, pembatasan request, dan monitoring karena kebijakan layanan dapat berubah. RSS tidak memiliki quota terpusat, namun ikuti aturan publisher dan jangan melakukan polling agresif.

## Milestone 2 - YouTube regional

**Target:** sinyal video populer per negara.

- Aktifkan `ID,US,GB,JP` melalui `YOUTUBE_REGION_CODES`.
- Tampilkan region pada source dan telemetry.
- Jalankan request per region dengan `Promise.allSettled`; satu region gagal tidak menggagalkan region lain.
- Cache response dan hindari `search.list` untuk polling umum karena lebih mahal.
- Acceptance criteria: response mengembalikan video dari region yang aktif, partial failure tetap menghasilkan data, dan tanpa API key tetap memakai fallback yang jelas.

**Biaya dan quota:** YouTube Data API memiliki kuota default harian berbasis unit. `videos.list` umumnya jauh lebih hemat daripada `search.list`; angka dan kuota dapat berubah, jadi cek Google Cloud Console dan dokumentasi resmi sebelum produksi. Empat region berarti minimal empat request chart per refresh.

## Milestone 3 - Reddit dan komunitas

**Target:** percakapan komunitas sebagai sinyal, bukan pengganti berita terverifikasi.

- Ganti ketergantungan public JSON dengan akses Reddit yang disetujui untuk kebutuhan produksi bila diperlukan.
- Pertahankan allowlist subreddit, filter NSFW, attribution, dan metadata komunitas.
- Pisahkan volume post dari engagement agar komunitas besar tidak otomatis menang.
- Acceptance criteria: sumber, komunitas, waktu, dan status fallback tersedia; data yang dihapus tidak disimpan ulang.

**Biaya dan quota:** akses Reddit komersial dan batas pemakaian mengikuti persetujuan serta kebijakan Reddit yang berlaku. Jangan mengasumsikan public endpoint bebas untuk skala produksi; verifikasi terms dan quota sebelum launch.

## Milestone 4 - Provider sosial resmi

Prioritas validasi setelah kebutuhan bisnis jelas:

| Provider | Kegunaan | Risiko utama | Keputusan awal |
| --- | --- | --- | --- |
| TikTok Research/Content APIs | creator dan video trend | akses terbatas, approval, quota | discovery/approval dulu |
| Instagram Graph API | akun bisnis/creator yang diotorisasi | tidak cocok untuk pencarian publik bebas | gunakan akun seed berizin |
| X API | percakapan real-time | paket berbayar dan quota berubah | pilot kecil berbasis keyword |
| Pinterest Trends | search dan kategori inspirasi | akses data tidak selalu setara API publik | manual atau partner resmi |
| Spotify API/charts | musik dan audio | rate limit, data chart bukan social conversation | sinyal pendamping |

**Acceptance criteria umum:** setiap provider memiliki adapter terpisah, schema normalisasi yang sama, secret server-side, rate-limit budget, attribution, retention policy, health status, dan test fixture tanpa memanggil API live.

## Urutan rilis yang disarankan

1. Global RSS + GDELT + deduplikasi.
2. YouTube regional `ID,US,GB,JP`.
3. Reddit production access dan scoring komunitas.
4. Satu pilot provider sosial berbayar setelah KPI ditetapkan.
5. Cross-platform scoring hanya setelah identitas topik dan timestamp sudah konsisten.

## KPI dan guardrail

- coverage per negara dan bahasa;
- proporsi topik dengan minimal dua provider;
- duplicate rate setelah normalisasi;
- freshness p95;
- provider success rate dan quota burn;
- false merge rate pada deduplikasi;
- cost per 1.000 item yang diproses.

Jangan menampilkan data sample seolah-olah live. Semua API key disimpan di server/Vercel environment variables dan tidak pernah dikirim ke browser.
