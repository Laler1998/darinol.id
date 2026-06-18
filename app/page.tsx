"use client";

import { type PointerEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getCurrentUserProfile, signInWithPassword, signUpWithPassword } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Topic = {
  id: string;
  name: string;
  category: string;
  score: number;
  growth: string;
  whyViral: string[];
  ideas: string[];
  titles: string[];
  articles: TopicArticle[];
};

type TrendsPayload = {
  source: string;
  updatedAt: string;
  topics: Topic[];
};

type TopicArticle = {
  title: string;
  source: string;
  url: string;
  publishedAt: string | null;
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

type Language = "id" | "en";
type ThemeMode = "light" | "dark";
type Plan = "Free" | "Supporter";
type MainView = "Berita" | "Buat Konten";
type LoginPlan = "Free" | "Supporter";

const planLimits = {
  Free: {
    maxArticles: 1,
    canSave: false,
  },
  Supporter: {
    maxArticles: 5,
    canSave: true,
  },
} as const;

const copy = {
  id: {
    tagline: "Dari Tren Jadi Konten.",
    update: "Update",
    noAccount: "Belum pilih akun",
    saved: "tersimpan",
    search: "Cari topik...",
    trending: "Sedang Naik",
    topics: "topik",
    all: "Semua",
    insight: "Insight",
    content: "Konten",
    viralLabel: "Sangat Viral",
    viralScore: "Viral Score",
    whyViral: "Kenapa Viral?",
    relatedNews: "Berita Terkait",
    markNews: "Tandai berita yang mau dijadikan bahan konten.",
    materials: "bahan",
    openSource: "Buka sumber",
    createContent: "Buat Konten",
    markToCreate: "Tandai Berita untuk Buat Konten",
    noSource: "Belum ada berita sumber untuk topik ini.",
    askRiri: "Tanya Riri Darinol.id",
    ririIntro:
      "Riri bantu ubah berita pilihan jadi hook, script, caption, dan format konten.",
    material: "Bahan",
    askPlaceholder: "Tanya Riri...",
    send: "Kirim",
    contentDirection: "Arahan Konten",
    directionHint: "Pilih format, lalu pakai angle dan hook yang paling kuat.",
    mainAngle: "Angle utama",
    openingHook: "Hook pembuka",
    safetyNote: "Catatan aman",
    contentIdeas: "Ide Konten",
    readyTitles: "Judul Siap Pakai",
    quickDraft: "Draft Cepat",
    draftHint: "Draft awal yang bisa langsung kamu poles.",
    generateIdea: "Generate Ide Baru",
    saveIdea: "Simpan Ide",
    savedIdea: "Tersimpan",
    upgradeToSave: "Upgrade untuk Simpan",
    nextTopic: "Lihat Topik Berikutnya",
    freeLimitTitle: "Free Creator cukup untuk mulai, tapi ada limit.",
    freeLimitBody:
      "Free hanya bisa memakai 1 berita sebagai bahan dan belum bisa menyimpan ide. Masuk Supporter untuk multi-berita, simpan ide, dan brief lebih dalam.",
    upgradeCta: "Upgrade ke Supporter",
    planFreeShort: "1 bahan, tanpa simpan",
    planSupporterShort: "Multi bahan, bisa simpan",
    freeBenefit: "Riset tren dan coba Riri dasar",
    supporterBenefit: "Brief Riri lebih dalam dan rapi",
    hotNews: "Hot News",
    newsPage: "Berita",
    contentPage: "Buat Konten",
    newsPageHint: "Baca tren dan pilih artikel yang mau dijadikan bahan.",
    contentPageHint: "Ubah artikel pilihan jadi brief, ide, judul, dan draft.",
    trendSignal: "Sinyal Tren",
    selectedMaterial: "Bahan Terpilih",
    sourcePreview: "Preview Sumber",
    sourcePreviewHint: "Beberapa media bisa memblokir preview. Kalau kosong, buka sumber asli.",
    payTitle: "Dukung Darinol.id",
    payBody:
      "Pilih nominal bebas, lalu transfer manual. Setelah konfirmasi, akun Supporter bisa diaktifkan.",
    payCustom: "Nominal lain",
    payContinue: "Saya sudah bayar, aktifkan demo",
    payLater: "Nanti dulu",
    payNote: "Untuk MVP, pembayaran diverifikasi manual. Versi produksi nanti bisa disambungkan ke payment gateway.",
    manualPayment: "Manual Payment",
    paymentDestination: "Tujuan Pembayaran",
    paymentConfirm: "Konfirmasi Pembayaran",
    paymentConfirmBody:
      "Kirim bukti transfer ke admin Darinol.id, lalu akun kamu akan diubah menjadi Supporter.",
    copyPaymentInfo: "Copy info pembayaran",
    emptyTitle: "Pilih bahan kontennya dulu",
    emptyBody:
      "Riri akan membuat ide dari artikel yang kamu tandai di Insight, supaya hasilnya lebih tajam dan tidak melebar ke mana-mana.",
    emptyButton: "Ke Insight",
    thinkingTitle: "Riri sedang membaca bahanmu",
    thinkingBody:
      "Sebentar ya. Riri sedang mencari angle, hook, dan draft yang paling masuk akal dari artikel pilihanmu.",
    boot: "Menyiapkan tren terbaru untuk kontenmu.",
    onboardingKicker: "Siap bikin konten lebih cepat?",
    onboardingTitle: "Pilih akun Darinol kamu",
    onboardingBody:
      "Darinol bantu kamu menangkap topik yang lagi naik, memilih berita yang relevan, lalu mengubahnya jadi ide konten yang siap dieksekusi.",
    loginEmail: "Email kamu",
    loginEmailPlaceholder: "nama@email.com",
    loginPassword: "Password",
    loginPasswordPlaceholder: "Minimal 6 karakter",
    loginModeSignIn: "Masuk",
    loginModeSignUp: "Daftar",
    continueFree: "Masuk sebagai Free",
    chooseStarter: "Pilih Starter",
    starterBadge: "Starter",
    qrisTitle: "Bayar pakai QRIS",
    qrisBody: "Scan QRIS atau copy instruksi pembayaran. Setelah konfirmasi, akun Starter aktif untuk demo.",
    freeTitle: "Free Creator",
    freeBody:
      "Cocok buat mulai riset tren harian, pilih artikel, dan bikin ide konten pertama tanpa ribet.",
    freeCta: "Mulai gratis",
    supporterTitle: "Supporter",
    supporterBody:
      "Untuk kreator yang mau lebih serius: simpan ide, bangun history, atur niche, dan dukung Darinol dengan nominal bebas.",
    supporterCta: "Dukung dan masuk",
    noTopicTitle: "Topik tidak ditemukan",
    noTopicBody: "Coba cari nama topik atau kategori lain.",
    light: "Terang",
    dark: "Gelap",
  },
  en: {
    tagline: "From Trend to Content.",
    update: "Updated",
    noAccount: "No account selected",
    saved: "saved",
    search: "Search topic...",
    trending: "Trending Now",
    topics: "topics",
    all: "All",
    insight: "Insight",
    content: "Content",
    viralLabel: "Highly Viral",
    viralScore: "Viral Score",
    whyViral: "Why It Is Viral",
    relatedNews: "Related News",
    markNews: "Mark the news you want to use as content material.",
    materials: "materials",
    openSource: "Open source",
    createContent: "Create Content",
    markToCreate: "Mark News to Create Content",
    noSource: "No source news yet for this topic.",
    askRiri: "Ask Riri Darinol.id",
    ririIntro:
      "Riri turns selected news into hooks, scripts, captions, and content formats.",
    material: "Material",
    askPlaceholder: "Ask Riri...",
    send: "Send",
    contentDirection: "Content Direction",
    directionHint: "Choose a format, then use the strongest angle and hook.",
    mainAngle: "Main angle",
    openingHook: "Opening hook",
    safetyNote: "Safety note",
    contentIdeas: "Content Ideas",
    readyTitles: "Ready-to-use Titles",
    quickDraft: "Quick Draft",
    draftHint: "A first draft you can polish right away.",
    generateIdea: "Generate New Idea",
    saveIdea: "Save Idea",
    savedIdea: "Saved",
    upgradeToSave: "Upgrade to Save",
    nextTopic: "Next Topic",
    freeLimitTitle: "Free Creator is enough to start, but it has limits.",
    freeLimitBody:
      "Free can use 1 news item as material and cannot save ideas yet. Switch to Supporter for multi-news, saved ideas, and deeper briefs.",
    upgradeCta: "Upgrade to Supporter",
    planFreeShort: "1 material, no saving",
    planSupporterShort: "Multi-material, saving enabled",
    freeBenefit: "Research trends and try basic Riri",
    supporterBenefit: "Deeper, cleaner Riri briefs",
    hotNews: "Hot News",
    newsPage: "News",
    contentPage: "Create Content",
    newsPageHint: "Read trends and choose articles as content material.",
    contentPageHint: "Turn selected articles into briefs, ideas, titles, and drafts.",
    trendSignal: "Trend Signal",
    selectedMaterial: "Selected Material",
    sourcePreview: "Source Preview",
    sourcePreviewHint: "Some publishers may block previews. If it is blank, open the original source.",
    payTitle: "Support Darinol.id",
    payBody:
      "Choose any amount, then pay manually. After confirmation, Supporter can be activated.",
    payCustom: "Custom amount",
    payContinue: "I have paid, activate demo",
    payLater: "Maybe later",
    payNote: "For this MVP, payment is verified manually. Production can connect to a payment gateway later.",
    manualPayment: "Manual Payment",
    paymentDestination: "Payment Destination",
    paymentConfirm: "Payment Confirmation",
    paymentConfirmBody:
      "Send your payment proof to Darinol.id admin, then your account will be changed to Supporter.",
    copyPaymentInfo: "Copy payment info",
    emptyTitle: "Choose your content material first",
    emptyBody:
      "Riri will create ideas from the articles you mark in Insight, so the result stays sharp and focused.",
    emptyButton: "Go to Insight",
    thinkingTitle: "Riri is reading your material",
    thinkingBody:
      "One moment. Riri is finding the most sensible angle, hook, and draft from your selected articles.",
    boot: "Preparing fresh trends for your content.",
    onboardingKicker: "Ready to create content faster?",
    onboardingTitle: "Choose your Darinol account",
    onboardingBody:
      "Darinol helps you catch rising topics, pick relevant news, and turn them into content ideas ready to execute.",
    loginEmail: "Your email",
    loginEmailPlaceholder: "name@email.com",
    loginPassword: "Password",
    loginPasswordPlaceholder: "At least 6 characters",
    loginModeSignIn: "Sign in",
    loginModeSignUp: "Sign up",
    continueFree: "Enter as Free",
    chooseStarter: "Choose Starter",
    starterBadge: "Starter",
    qrisTitle: "Pay with QRIS",
    qrisBody: "Scan QRIS or copy the payment instruction. After confirmation, Starter is active for demo.",
    freeTitle: "Free Creator",
    freeBody:
      "Best for daily trend research, selecting articles, and creating your first content ideas without friction.",
    freeCta: "Start free",
    supporterTitle: "Supporter",
    supporterBody:
      "For creators who want more: save ideas, build history, set niches, and support Darinol with any amount.",
    supporterCta: "Support and enter",
    noTopicTitle: "No topic found",
    noTopicBody: "Try another topic name or category.",
    light: "Light",
    dark: "Dark",
  },
} as const;

type Copy = (typeof copy)[Language];

const categoryFilters = [
  "Semua",
  "Business",
  "Peristiwa",
  "Crypto",
  "Technology",
  "Social",
  "Global",
  "Politics",
  "Sports",
];

const creatorModes = [
  "Explainer",
  "Short Video",
  "Carousel",
  "Thread",
  "Soft News",
  "Storytelling",
  "Hot Take",
];

const detailTabs = ["Insight", "Konten"];

const platforms = ["TikTok", "Instagram", "YouTube Shorts", "X Thread", "LinkedIn"];
const outputFormats = ["Full Brief", "Hook", "Script", "Caption", "Carousel", "Thread", "Outline"];
const contentTones = ["Santai", "Edukasi", "Tegas", "Story", "Profesional"];
const quickRiriActions = [
  { label: "Buat Hook", prompt: "Buatkan hook paling kuat dari berita ini" },
  { label: "Script 45 detik", prompt: "Buatkan script video 45 detik" },
  { label: "Caption", prompt: "Buatkan caption yang siap dipakai" },
  { label: "Carousel", prompt: "Ubah jadi carousel 6 slide" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const staggerList = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.045,
    },
  },
};

const initialTopics: Topic[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    category: "Crypto",
    score: 92,
    growth: "+320%",
    whyViral: [
      "Pencarian meningkat dalam 48 jam terakhir.",
      "Banyak media nasional membahas topik ini.",
      "Percakapan sosial media meningkat.",
    ],
    ideas: [
      "Kenapa Bitcoin Naik Lagi?",
      "Apa yang Membuat Bitcoin Ramai Dibahas?",
      "Fakta Bitcoin yang Jarang Diketahui",
      "Apakah Bitcoin Masih Menarik?",
    ],
    titles: [
      "Bitcoin Naik Lagi, Apa Penyebabnya?",
      "Kenapa Bitcoin Mendadak Ramai?",
      "Yang Sedang Terjadi Dengan Bitcoin",
    ],
    articles: [],
  },
  {
    id: "timnas-indonesia",
    name: "Timnas Indonesia",
    category: "Sports",
    score: 88,
    growth: "+240%",
    whyViral: [
      "Fans ramai membahas update skuad dan performa pemain.",
      "Cuplikan pertandingan banyak dibagikan ulang.",
      "Diskusi prediksi line-up meningkat di sosial media.",
    ],
    ideas: [
      "Kenapa Timnas Makin Banyak Dibahas?",
      "Pemain Timnas yang Lagi Jadi Sorotan",
      "Apa yang Bikin Fans Makin Optimis?",
      "Momen Timnas yang Cocok Jadi Konten Pendek",
    ],
    titles: [
      "Timnas Lagi Panas, Ini Penyebabnya",
      "Kenapa Fans Makin Percaya Timnas?",
      "Yang Harus Kamu Tahu dari Update Timnas",
    ],
    articles: [],
  },
  {
    id: "ai-video",
    name: "AI Video",
    category: "Technology",
    score: 84,
    growth: "+180%",
    whyViral: [
      "Tools video AI semakin sering dicoba kreator.",
      "Banyak contoh before-after viral di platform video pendek.",
      "Audiens ingin tahu cara membuat konten lebih cepat.",
    ],
    ideas: [
      "Cara Pakai AI Video untuk Konten Harian",
      "Apakah AI Video Bisa Menggantikan Editor?",
      "Kesalahan Pemula Saat Membuat Video AI",
      "Workflow AI Video yang Mudah Dicoba",
    ],
    titles: [
      "AI Video Lagi Ramai, Apa Gunanya?",
      "Cara Kreator Pakai AI Video",
      "Yang Perlu Kamu Tahu Sebelum Pakai AI Video",
    ],
    articles: [],
  },
  {
    id: "film-indonesia",
    name: "Film Indonesia",
    category: "Entertainment",
    score: 81,
    growth: "+140%",
    whyViral: [
      "Review penonton ramai dibagikan di sosial media.",
      "Potongan adegan dan opini kreator memicu diskusi.",
      "Rilis lokal terbaru mendorong pencarian meningkat.",
    ],
    ideas: [
      "Film Indonesia yang Lagi Ramai Dibahas",
      "Kenapa Film Lokal Makin Banyak Ditonton?",
      "Review Singkat Tanpa Spoiler",
      "Aktor yang Sedang Jadi Sorotan",
    ],
    titles: [
      "Film Indonesia Ini Lagi Ramai, Worth It?",
      "Kenapa Film Ini Viral di Timeline?",
      "Rekomendasi Film Lokal Minggu Ini",
    ],
    articles: [],
  },
  {
    id: "prabowo",
    name: "Prabowo",
    category: "Politics",
    score: 79,
    growth: "+120%",
    whyViral: [
      "Agenda dan pernyataan terbaru ramai dikutip media.",
      "Percakapan publik meningkat di berbagai platform.",
      "Banyak kreator membuat ringkasan konteks politik.",
    ],
    ideas: [
      "Apa yang Sedang Dibahas tentang Prabowo?",
      "Ringkasan Isu Politik Tanpa Drama",
      "Konteks Singkat untuk Audiens Awam",
      "Pertanyaan Publik yang Paling Sering Muncul",
    ],
    titles: [
      "Kenapa Prabowo Ramai Dibahas?",
      "Isu Politik Ini Lagi Naik",
      "Konteks Singkat yang Perlu Kamu Tahu",
    ],
    articles: [],
  },
];

function Header({
  search,
  onSearchChange,
  updatedAt,
  selectedPlan,
  accountEmail,
  onAccountClick,
  savedCount,
  hotNewsItems,
  isMobile,
  language,
  onLanguageChange,
  themeMode,
  onThemeToggle,
  t,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  updatedAt: string;
  selectedPlan: string | null;
  accountEmail: string;
  onAccountClick: () => void;
  savedCount: number;
  hotNewsItems: ReturnType<typeof getHotNewsItems>;
  isMobile: boolean;
  language: Language;
  onLanguageChange: (language: Language) => void;
  themeMode: ThemeMode;
  onThemeToggle: () => void;
  t: Copy;
}) {
  const tickerItems = isMobile
    ? hotNewsItems.slice(0, 4)
    : [...hotNewsItems, ...hotNewsItems];

  return (
    <header className="shrink-0 pb-3 lg:pb-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <div className="order-2 lg:order-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-darinol-muted">
            {t.update}
          </p>
          <p className="mt-1 text-sm font-semibold text-darinol-text">
            {updatedAt}
          </p>
        </div>

        <div className="order-1 text-left lg:order-2 lg:text-center">
            <h1 className="bg-gradient-to-r from-darinol-primary via-[#ff9865] to-[#ff6a3d] bg-clip-text font-heading text-2xl font-semibold tracking-tight text-transparent">
            Darinol.id
          </h1>
          <p className="mt-1 text-sm font-medium text-darinol-muted">
            {t.tagline}
          </p>
        </div>

        <div className="order-3 flex flex-wrap items-center justify-start gap-2 lg:justify-end">
            <button
              type="button"
              onClick={onAccountClick}
              className="glass-soft h-8 max-w-[280px] truncate rounded-full px-3 py-1.5 text-xs font-semibold text-darinol-muted transition hover:text-darinol-text"
            >
              {selectedPlan ?? t.noAccount} • {accountEmail || "Belum login"}
            </button>
            <span className="glass-soft h-8 rounded-full px-3 py-1.5 text-xs font-semibold text-darinol-muted">
              {savedCount} {t.saved}
            </span>
            <div className="glass-soft flex h-8 rounded-full p-0.5">
              {(["id", "en"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onLanguageChange(item)}
                  className={[
                    "h-7 rounded-full px-3 text-xs font-semibold transition",
                    language === item
                      ? "orange-gradient text-white"
                      : "text-darinol-muted hover:text-darinol-text",
                  ].join(" ")}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onThemeToggle}
              className="glass-soft h-8 rounded-full px-3 text-xs font-semibold text-darinol-muted transition hover:text-darinol-text"
            >
              {themeMode === "dark" ? t.light : t.dark}
            </button>
        </div>
      </div>

      <label className="relative mt-4 block w-full">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-darinol-muted">
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t.search}
          className="glass-card h-11 w-full rounded-full pl-11 pr-4 text-sm text-darinol-text outline-none transition focus:border-darinol-primary focus:ring-4 focus:ring-darinol-primary/10"
        />
      </label>

      <div className="glass-soft mt-3 overflow-hidden rounded-full">
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="orange-gradient moving-accent shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
            Live
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div
              className={[
                "flex w-max items-center gap-4",
                isMobile
                  ? "overflow-x-auto"
                  : "animate-[ticker_42s_linear_infinite] hover:[animation-play-state:paused]",
              ].join(" ")}
            >
              {tickerItems.map((item, index) => (
                <span
                  key={`${item.label}-${item.text}-${index}`}
                  className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-darinol-muted"
                >
                  <span className="text-darinol-primary">{item.label}</span>
                  <span className="max-w-[520px] truncate text-darinol-text">
                    {item.text}
                  </span>
                  <span className="font-medium text-darinol-muted">
                    {item.source}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}

function TopicCard({
  topic,
  rank,
  selected,
  onClick,
}: {
  topic: Topic;
  rank: number;
  selected: boolean;
  onClick: () => void;
}) {
  const momentumLabel = topic.score >= 90 ? "Sangat viral" : topic.score >= 82 ? "Naik cepat" : "Mulai ramai";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={fadeUp}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className={[
        "w-full rounded-2xl border p-3 text-left transition duration-200",
        selected
          ? "orange-gradient border-darinol-primary text-white shadow-soft"
          : "glass-card border-transparent text-darinol-text hover:-translate-y-0.5 hover:border-darinol-primary/25",
      ].join(" ")}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-heading text-xs font-semibold",
              selected
                ? "bg-white text-darinol-primary"
                : "bg-darinol-primary/10 text-darinol-primary",
            ].join(" ")}
          >
            {rank}
          </span>
          <span
            className={[
              "truncate rounded-full px-2.5 py-1 text-[11px] font-semibold",
              selected
                ? "bg-white/20 text-white"
                : "bg-darinol-primary/10 text-darinol-primary",
            ].join(" ")}
          >
            {topic.category}
          </span>
        </div>
        <span
          className={[
            "text-[11px] font-semibold",
            selected ? "text-white/90" : "text-darinol-muted",
          ].join(" ")}
        >
          Score {topic.score}
        </span>
      </div>

      <h3 className="font-heading text-base font-semibold tracking-tight">
        {topic.name}
      </h3>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <p
            className={[
              "text-xs font-semibold",
              selected ? "text-white/90" : "text-darinol-success",
            ].join(" ")}
          >
            {topic.growth}
          </p>
          <p
            className={[
              "mt-1 text-[11px] font-medium",
              selected ? "text-white/70" : "text-darinol-muted",
            ].join(" ")}
          >
            {momentumLabel}
          </p>
        </div>
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/10">
          <span
            className={[
              "block h-full rounded-full",
              selected ? "bg-white" : "bg-darinol-primary",
            ].join(" ")}
            style={{ width: `${Math.min(topic.score, 100)}%` }}
          />
        </div>
      </div>
    </motion.button>
  );
}

function BrandIcon({
  className = "h-12 w-12",
  animated = false,
  reveal = false,
}: {
  className?: string;
  animated?: boolean;
  reveal?: boolean;
}) {
  return (
    <motion.div
      initial={
        reveal
          ? {
              opacity: 0,
              scale: 0.72,
              y: 18,
              rotate: -10,
              filter: "drop-shadow(0 0 0 rgba(255, 122, 69, 0))",
            }
          : undefined
      }
      animate={
        reveal
          ? {
              opacity: 1,
              scale: 1,
              y: [18, -2, 0],
              rotate: [-10, 1.4, 0],
              filter: [
                "drop-shadow(0 0 0 rgba(255, 122, 69, 0))",
                "drop-shadow(0 26px 38px rgba(255, 122, 69, 0.34))",
                "drop-shadow(0 14px 24px rgba(255, 122, 69, 0.2))",
              ],
            }
          : animated
          ? {
              y: [0, -2, 0],
              rotate: [0, -0.7, 0.7, 0],
              filter: [
                "drop-shadow(0 12px 20px rgba(255, 122, 69, 0.16))",
                "drop-shadow(0 18px 30px rgba(255, 122, 69, 0.26))",
                "drop-shadow(0 12px 20px rgba(255, 122, 69, 0.16))",
              ],
            }
          : undefined
      }
      transition={
        reveal
          ? {
              duration: 1.25,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.72, 1],
            }
          : { duration: 6.8, repeat: Infinity, ease: "easeInOut" }
      }
      className={["relative shrink-0", className].join(" ")}
    >
      <img
        src="/darinol-icon.png?v=6"
        alt="Darinol.id"
        className="h-full w-full rounded-[26%] object-cover"
      />
      {animated ? (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-[26%] ring-1 ring-darinol-primary/20"
          animate={{ opacity: [0.45, 0.9, 0.45], scale: [1, 1.035, 1] }}
          transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
    </motion.div>
  );
}

function PlanPreview({
  title,
  body,
  highlight = false,
}: {
  title: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-3xl border px-4 py-3",
        highlight
          ? "border-darinol-primary/30 bg-darinol-primary/10"
          : "border-darinol-border bg-darinol-surface/50",
      ].join(" ")}
    >
      <p className="font-heading text-sm font-semibold text-darinol-text">
        {title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-darinol-muted">
        {body}
      </p>
    </div>
  );
}

function OnboardingOverlay({
  onChoosePlan,
  onClose,
  language,
  t,
  authMessage,
  authLoading,
}: {
  onChoosePlan: (
    plan: Plan,
    email: string,
    password: string,
    authMode: "signin" | "signup",
  ) => void;
  onClose?: () => void;
  language: Language;
  t: Copy;
  authMessage: string;
  authLoading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [selectedLoginPlan, setSelectedLoginPlan] = useState<LoginPlan>("Free");
  const [amount, setAmount] = useState("25000");
  const amountLabel = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
  const paymentInfo = `Darinol.id Starter\nEmail: ${email || "isi email kamu"}\nNominal: ${amountLabel}\nMetode: QRIS\nKonfirmasi: kirim bukti pembayaran ke admin Darinol.id`;

  function handleContinue() {
    onChoosePlan(selectedLoginPlan, email, password, authMode);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex h-dvh items-start justify-center overflow-y-auto overscroll-contain bg-darinol-text/12 px-3 py-3 backdrop-blur-sm [-webkit-overflow-scrolling:touch] sm:items-center sm:px-5 sm:py-5"
    >
      <div className="ambient-layer" aria-hidden="true" />
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="glass-card relative max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-[1.5rem] p-4 [-webkit-overflow-scrolling:touch] sm:max-h-none sm:overflow-hidden sm:rounded-[2rem] md:p-6 lg:p-8"
      >
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-white/60 text-darinol-muted shadow-soft backdrop-blur-xl transition hover:scale-105 hover:border-darinol-primary/30 hover:text-darinol-primary dark:border-white/10 dark:bg-white/10"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        ) : null}
        <motion.div
          aria-hidden="true"
          animate={{ x: ["-35%", "45%", "-35%"], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-24 left-0 h-48 w-72 rounded-full bg-darinol-primary/20 blur-3xl"
        />
        <div className="relative grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="py-1 lg:py-8">
            <div className="mb-4 flex items-center gap-3 sm:mb-7 sm:gap-4">
              <BrandIcon className="h-12 w-12 sm:h-16 sm:w-16" animated reveal />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-darinol-primary">
                  Darinol.id
                </p>
                <p className="mt-1 text-sm font-medium text-darinol-muted">
                  {t.tagline}
                </p>
              </div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-darinol-primary"
            >
              {t.onboardingKicker}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.68, duration: 0.55, ease: "easeOut" }}
              className="mt-2 max-w-xl font-heading text-3xl font-semibold tracking-tight text-darinol-text sm:mt-3 md:text-5xl"
            >
              {t.onboardingTitle}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.82, duration: 0.55, ease: "easeOut" }}
              className="mt-3 max-w-lg text-sm leading-relaxed text-darinol-muted sm:mt-4"
            >
              {t.onboardingBody}
            </motion.p>

            <div className="mt-5 grid gap-3 sm:mt-8 sm:grid-cols-2">
              <PlanPreview title={t.freeTitle} body={t.freeBenefit} />
              <PlanPreview title={t.starterBadge} body={t.supporterBenefit} highlight />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.55, ease: "easeOut" }}
            className="glass-soft rounded-[1.75rem] p-4 md:p-5"
          >
            <div className="mb-4 grid grid-cols-2 rounded-full bg-darinol-background/70 p-1">
              {(["signin", "signup"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAuthMode(mode)}
                  className={[
                    "h-10 rounded-full text-sm font-semibold transition",
                    authMode === mode
                      ? "orange-gradient text-white shadow-orange"
                      : "text-darinol-muted hover:text-darinol-text",
                  ].join(" ")}
                >
                  {mode === "signin" ? t.loginModeSignIn : t.loginModeSignUp}
                </button>
              ))}
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-darinol-muted">
                {t.loginEmail}
              </span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.loginEmailPlaceholder}
                className="mt-2 h-12 w-full rounded-2xl border border-darinol-border bg-darinol-surface/80 px-4 text-sm font-semibold text-darinol-text outline-none focus:border-darinol-primary focus:ring-4 focus:ring-darinol-primary/10"
              />
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-darinol-muted">
                {t.loginPassword}
              </span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t.loginPasswordPlaceholder}
                type="password"
                className="mt-2 h-12 w-full rounded-2xl border border-darinol-border bg-darinol-surface/80 px-4 text-sm font-semibold text-darinol-text outline-none focus:border-darinol-primary focus:ring-4 focus:ring-darinol-primary/10"
              />
            </label>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(["Free", "Supporter"] as const).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setSelectedLoginPlan(plan)}
                  className={[
                    "rounded-2xl border p-4 text-left transition",
                    selectedLoginPlan === plan
                      ? plan === "Supporter"
                        ? "orange-gradient border-darinol-primary text-white"
                        : "border-darinol-primary bg-darinol-surface text-darinol-primary"
                      : "border-darinol-border bg-darinol-surface/70 text-darinol-text hover:border-darinol-primary/35",
                  ].join(" ")}
                >
                  <p className="font-heading text-lg font-semibold">
                    {plan === "Free" ? t.freeTitle : t.starterBadge}
                  </p>
                  <p className={["mt-1 text-xs leading-relaxed", selectedLoginPlan === plan && plan === "Supporter" ? "text-white/80" : "text-darinol-muted"].join(" ")}>
                    {plan === "Free" ? t.freeBody : t.supporterBody}
                  </p>
                </button>
              ))}
            </div>

            {selectedLoginPlan === "Supporter" ? (
              <div className="mt-4 rounded-3xl border border-darinol-primary/20 bg-darinol-surface/80 p-4">
                <div className="flex items-start gap-4">
                  <div className="grid h-28 w-28 shrink-0 place-items-center rounded-2xl border border-darinol-border bg-white p-3">
                    <div className="grid h-full w-full place-items-center rounded-xl bg-[linear-gradient(90deg,#111_12%,transparent_12%_22%,#111_22%_34%,transparent_34%_48%,#111_48%_58%,transparent_58%_70%,#111_70%_82%,transparent_82%),linear-gradient(#111_12%,transparent_12%_22%,#111_22%_34%,transparent_34%_48%,#111_48%_58%,transparent_58%_70%,#111_70%_82%,transparent_82%)] bg-[length:22px_22px] text-[10px] font-bold text-darinol-primary">
                      QRIS
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-lg font-semibold text-darinol-text">
                      {t.qrisTitle}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-darinol-muted">
                      {t.qrisBody}
                    </p>
                    <label className="mt-3 block">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-darinol-muted">
                        {t.payCustom}
                      </span>
                      <input
                        value={amount}
                        onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
                        inputMode="numeric"
                        className="mt-2 h-11 w-full rounded-2xl border border-darinol-border bg-darinol-background px-4 text-sm font-semibold text-darinol-text outline-none focus:border-darinol-primary focus:ring-4 focus:ring-darinol-primary/10"
                      />
                    </label>
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-darinol-background px-4 py-3">
                      <span className="font-heading text-lg font-semibold text-darinol-text">
                        {amountLabel}
                      </span>
                      <CopyButton text={paymentInfo} />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleContinue}
              disabled={authLoading}
              className="orange-gradient moving-accent mt-5 h-12 w-full rounded-full px-5 text-sm font-semibold text-white transition hover:brightness-105"
            >
              {authLoading
                ? "Menghubungkan..."
                : selectedLoginPlan === "Free"
                  ? t.continueFree
                  : t.payContinue}
            </button>
            {authMessage ? (
              <p className="mt-3 rounded-2xl border border-darinol-primary/20 bg-darinol-primary/5 px-4 py-3 text-center text-xs font-semibold leading-relaxed text-darinol-primary">
                {authMessage}
              </p>
            ) : null}
            <p className="mt-3 text-center text-xs font-medium text-darinol-muted">
              {selectedLoginPlan === "Free" ? t.planFreeShort : t.paymentConfirmBody}
            </p>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}

function AppLoadingOverlay({ t }: { t: Copy }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-darinol-background px-5"
    >
      <section className="text-center">
        <BrandIcon className="mx-auto h-20 w-20" animated reveal />
        <h2 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-darinol-text">
          Darinol.id
        </h2>
        <p className="mt-2 text-sm font-medium text-darinol-muted">
          {t.boot}
        </p>
      </section>
    </motion.div>
  );
}

function WelcomeStrip({
  selectedPlan,
  onUpgrade,
}: {
  selectedPlan: Plan | null;
  onUpgrade: () => void;
}) {
  if (selectedPlan === "Supporter") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-card mb-4 flex shrink-0 flex-col gap-3 rounded-3xl px-4 py-3 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-center gap-3">
        <BrandIcon className="h-11 w-11" animated />
        <div>
          <p className="font-heading text-sm font-semibold text-darinol-text">
            Mulai dari Free. Pilih berita, lalu minta Riri bikin konten.
          </p>
          <p className="mt-1 text-xs font-medium text-darinol-muted">
            AI penuh dan multi-bahan bisa diaktifkan saat kamu butuh Supporter.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onUpgrade}
        className="orange-gradient moving-accent h-10 rounded-full px-4 text-xs font-semibold text-white transition hover:brightness-105"
      >
        Lihat Supporter
      </button>
    </motion.div>
  );
}

function MainNavigation({
  activeView,
  onChange,
  t,
}: {
  activeView: MainView;
  onChange: (view: MainView) => void;
  t: Copy;
}) {
  const views: Array<{ id: MainView; title: string; hint: string }> = [
    { id: "Berita", title: t.newsPage, hint: t.newsPageHint },
    { id: "Buat Konten", title: t.contentPage, hint: t.contentPageHint },
  ];

  return (
    <nav className="glass-soft mb-4 grid gap-2 rounded-[2rem] p-2 md:grid-cols-2">
      {views.map((view) => {
        const active = activeView === view.id;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onChange(view.id)}
            className={[
              "rounded-[1.5rem] border p-4 text-left transition",
              active
                ? "orange-gradient border-darinol-primary text-white shadow-soft"
                : "border-transparent bg-transparent text-darinol-text hover:bg-darinol-surface/55",
            ].join(" ")}
          >
            <span
              className={[
                "font-heading text-lg font-semibold",
                active ? "text-white" : "text-darinol-text",
              ].join(" ")}
            >
              {view.title}
            </span>
            <span
              className={[
                "mt-1 block text-sm font-medium leading-relaxed",
                active ? "text-white/80" : "text-darinol-muted",
              ].join(" ")}
            >
              {view.hint}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function UpgradeNotice({
  t,
  onUpgrade,
  onDismiss,
}: {
  t: Copy;
  onUpgrade: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4 flex shrink-0 flex-col gap-3 rounded-3xl border border-darinol-primary/25 bg-darinol-primary/10 px-4 py-3 text-sm text-darinol-text md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p className="font-heading font-semibold text-darinol-text">
          {t.freeLimitTitle}
        </p>
        <p className="mt-1 leading-relaxed text-darinol-muted">
          {t.freeLimitBody}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDismiss}
          className="h-10 rounded-full border border-darinol-border bg-darinol-surface px-4 text-xs font-semibold text-darinol-muted"
        >
          OK
        </button>
        <button
          type="button"
          onClick={onUpgrade}
          className="orange-gradient h-10 rounded-full px-4 text-xs font-semibold text-white"
        >
          {t.upgradeCta}
        </button>
      </div>
    </motion.div>
  );
}

function PaymentModal({
  t,
  onClose,
  onPaid,
}: {
  t: Copy;
  onClose: () => void;
  onPaid: () => void;
}) {
  const amounts = ["10000", "25000", "50000"];
  const [amount, setAmount] = useState(amounts[1]);
  const amountLabel = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
  const paymentDestination = "Darinol.id Supporter\nBank/E-wallet: isi rekening admin\nNama: Darinol.id\nCatatan: Supporter Darinol";
  const paymentInfo = `${paymentDestination}\nNominal: ${amountLabel}\nKonfirmasi: kirim bukti transfer ke admin Darinol.id`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-darinol-text/25 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-5"
    >
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="glass-card w-full max-w-md rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-darinol-primary">
              {t.manualPayment}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-darinol-text">
              {t.payTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-darinol-border bg-darinol-background text-sm font-semibold text-darinol-muted"
            aria-label={t.payLater}
          >
            x
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-darinol-muted">
          {t.payBody}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {amounts.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setAmount(item)}
              className={[
                "h-11 rounded-full border text-xs font-semibold transition",
                amount === item
                  ? "orange-gradient border-darinol-primary text-white"
                  : "border-darinol-border bg-darinol-background text-darinol-muted hover:border-darinol-primary/40 hover:text-darinol-text",
              ].join(" ")}
            >
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(Number(item))}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-darinol-muted">
            {t.payCustom}
          </span>
          <input
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value.replace(/\D/g, ""))
            }
            inputMode="numeric"
            className="mt-2 h-12 w-full rounded-2xl border border-darinol-border bg-darinol-background px-4 text-sm font-semibold text-darinol-text outline-none focus:border-darinol-primary focus:ring-4 focus:ring-darinol-primary/10"
          />
        </label>

        <div className="mt-5 rounded-2xl bg-darinol-background px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-darinol-muted">
            Total
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold text-darinol-text">
            {amountLabel}
          </p>
        </div>

        <div className="mt-3 rounded-2xl border border-darinol-border bg-darinol-surface/70 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-darinol-muted">
                {t.paymentDestination}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-relaxed text-darinol-text">
                {paymentDestination}
              </p>
            </div>
            <CopyButton text={paymentInfo} />
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-darinol-primary/20 bg-darinol-primary/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-darinol-primary">
            {t.paymentConfirm}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-darinol-muted">
            {t.paymentConfirmBody}
          </p>
        </div>

        <button
          type="button"
          onClick={onPaid}
          className="orange-gradient moving-accent mt-5 h-12 w-full rounded-full px-5 text-sm font-semibold text-white transition hover:brightness-105"
        >
          {t.payContinue}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 h-11 w-full rounded-full text-sm font-semibold text-darinol-muted transition hover:text-darinol-text"
        >
          {t.payLater}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-darinol-muted">
          {t.payNote}
        </p>
      </motion.section>
    </motion.div>
  );
}

function IdeaCard({ idea }: { idea: string }) {
  return (
    <article className="glass-soft rounded-2xl p-4 transition hover:border-darinol-primary/30 hover:bg-darinol-primary/5">
      <p className="text-sm font-medium leading-relaxed text-darinol-text">
        {idea}
      </p>
    </article>
  );
}

function formatArticleTime(value: string | null) {
  if (!value) return "hari ini";

  return formatUpdatedAt(value);
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getSelectedArticles(topic: Topic, selectedUrls: string[]) {
  const selectedSet = new Set(selectedUrls);
  return topic.articles.filter((article) =>
    selectedSet.has(article.url),
  );
}

function getHotNewsItems(topics: Topic[]) {
  const articleItems = topics
    .flatMap((topic) =>
      topic.articles.slice(0, 2).map((article) => ({
        label: topic.name,
        text: article.title,
        source: article.source,
      })),
    )
    .slice(0, 10);

  if (articleItems.length) return articleItems;

  return topics.slice(0, 10).map((topic) => ({
    label: topic.category,
    text: `${topic.name} ${topic.growth}`,
    source: `Score ${topic.score}`,
  }));
}

function getArticleContext(topic: Topic, selectedArticles: TopicArticle[] = []) {
  const articles = selectedArticles;
  const article = articles[0];

  if (!article) {
    return {
      title: topic.name,
      source: "Belum ada sumber",
      summary: `${topic.name} sedang naik berdasarkan sinyal topik.`,
      count: 0,
    };
  }

  const sources = Array.from(new Set(articles.map((item) => item.source)));
  const titles = articles.map((item) => item.title);

  return {
    title:
      titles.length === 1
        ? titles[0]
        : `${titles[0]} + ${titles.length - 1} artikel lain`,
    source:
      sources.length === 1
        ? sources[0]
        : `${sources[0]} + ${sources.length - 1} sumber lain`,
    summary: titles.map((title, index) => `${index + 1}. ${title}`).join(" "),
    count: articles.length,
  };
}

function getContentBrief(
  topic: Topic,
  mode: string,
  selectedArticles: TopicArticle[] = [],
) {
  const primaryReason = topic.whyViral[0] ?? "Topik ini sedang banyak dibahas.";
  const sourceCount = selectedArticles.length || topic.articles.length;
  const articleContext = getArticleContext(topic, selectedArticles);
  const articleLabel =
    articleContext.count > 1
      ? `${articleContext.count} berita pilihan`
      : "berita pilihan";

  return {
    context: `${articleLabel}: ${articleContext.summary}. ${primaryReason}`,
    audience: `Kreator bisa mengubah ${articleLabel} ini menjadi konten ringkas untuk audiens yang ingin cepat paham tanpa membaca banyak artikel.`,
    angle:
      mode === "Short Video"
        ? `Buka dari inti ${articleLabel}, lalu jelaskan konteksnya dalam 3 poin.`
        : mode === "Carousel"
          ? `Buat rangkaian slide dari ${articleLabel}: apa yang terjadi, kenapa ramai, dampaknya, dan pertanyaan untuk audiens.`
          : mode === "Thread"
            ? `Ubah ${articleLabel} menjadi alur sebab-akibat supaya pembaca paham kenapa ${topic.name} muncul di timeline.`
            : `Jelaskan ${articleLabel} dari ${articleContext.source} dengan bahasa sederhana dan fokus ke alasan kenapa ini penting hari ini.`,
    hook: `${articleContext.title}`,
    script: `Hook: ${articleContext.title}\nKonteks: ${primaryReason}\nIsi: jelaskan 3 poin dari ${articleLabel} dan hubungkan dengan kenapa ${topic.name} sedang naik.\nClose: ajak audiens komentar apakah topik ini penting untuk diikuti.`,
    caution:
      topic.category === "Politics" || topic.category === "Peristiwa"
        ? "Gunakan bahasa netral, sebutkan sumber, dan hindari klaim yang belum terverifikasi."
        : sourceCount > 0
          ? "Gunakan artikel terkait sebagai rujukan, tapi jangan menyalin isi berita."
          : "Validasi ulang sumber sebelum dipublikasikan.",
  };
}

function getArticleBasedIdeas(topic: Topic, selectedArticles: TopicArticle[] = []) {
  const articleContext = getArticleContext(topic, selectedArticles);

  if (!topic.articles.length) {
    return topic.ideas;
  }

  const articleLabel =
    articleContext.count > 1 ? `${articleContext.count} berita` : "berita";

  return [
    `Ringkas ${articleLabel} dari ${articleContext.source}: apa yang terjadi di ${topic.name}?`,
    `Kenapa ${articleLabel} ini mulai ramai dibahas?`,
    `3 poin penting dari update ${topic.name} yang harus audiens tahu`,
    `Apa dampak ${articleLabel} ini untuk orang biasa atau kreator?`,
  ];
}

function getArticleBasedTitles(topic: Topic, selectedArticles: TopicArticle[] = []) {
  const articleContext = getArticleContext(topic, selectedArticles);

  if (!topic.articles.length) {
    return topic.titles;
  }

  return [
    `${topic.name} Ramai Lagi, Ini Berita Pemicunya`,
    `Update ${topic.name}: Apa yang Sebenarnya Terjadi?`,
    `Dari ${articleContext.source}: Kenapa ${topic.name} Jadi Sorotan?`,
  ];
}

function MiniBriefCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <article className="glass-soft rounded-2xl p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-darinol-primary">
        {title}
      </p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-darinol-text">
        {body}
      </p>
    </article>
  );
}

function CompactTextBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div className="glass-soft rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-darinol-muted">
          {label}
        </p>
        <CopyButton text={text} />
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-darinol-text">
        {text}
      </p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-full border border-darinol-border bg-darinol-surface/80 px-3 py-1 text-[11px] font-semibold text-darinol-muted transition hover:border-darinol-primary/40 hover:text-darinol-primary"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-soft rounded-2xl px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-darinol-muted">
        {label}
      </p>
      <p className="mt-1 font-heading text-xl font-semibold text-darinol-text">
        {value}
      </p>
    </div>
  );
}

function SimpleList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-card rounded-3xl p-4"
    >
      <h3 className="font-heading text-base font-semibold text-darinol-text">
        {title}
      </h3>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div
            key={item}
            className="glass-soft flex items-start gap-3 rounded-2xl px-4 py-3 text-sm leading-relaxed text-darinol-text"
          >
            <span className="font-heading text-sm font-semibold text-darinol-primary">
              {index + 1}
            </span>
            <p className="flex-1">{item}</p>
            <CopyButton text={item} />
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function ContentEmptyState({
  onBackToInsight,
  t,
}: {
  onBackToInsight: () => void;
  t: Copy;
}) {
  return (
    <section className="glass-card rounded-3xl p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-darinol-surface text-darinol-primary shadow-soft">
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </div>
      <h3 className="mt-4 font-heading text-xl font-semibold text-darinol-text">
        {t.emptyTitle}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-darinol-muted">
        {t.emptyBody}
      </p>
      <button
        type="button"
        onClick={onBackToInsight}
        className="orange-gradient moving-accent mt-5 h-11 rounded-full px-5 text-sm font-semibold text-white transition hover:brightness-105"
      >
        {t.emptyButton}
      </button>
    </section>
  );
}

function ContentLoadingState({ t }: { t: Copy }) {
  return (
    <section className="glass-card rounded-3xl p-8 text-center">
      <BrandIcon className="mx-auto h-16 w-16" animated />
      <h3 className="mt-5 font-heading text-xl font-semibold text-darinol-text">
        {t.thinkingTitle}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-darinol-muted">
        {t.thinkingBody}
      </p>
    </section>
  );
}

function getPlatformAdvice(
  topic: Topic,
  platform: string,
  selectedArticles: TopicArticle[] = [],
) {
  const articleContext = getArticleContext(topic, selectedArticles);
  const articleLabel =
    articleContext.count > 1
      ? `${articleContext.count} berita pilihan`
      : "berita pilihan";
  const base = {
    objective: `Ubah ${articleLabel} dari ${articleContext.source} menjadi konten yang bikin audiens cepat paham kenapa ${topic.name} ramai.`,
    caution:
      topic.category === "Peristiwa" || topic.category === "Politics"
        ? "Tetap netral, sebutkan sumber, dan pisahkan fakta dari opini."
        : "Ambil intinya dari sumber, lalu ubah jadi sudut pandang kreator. Jangan menyalin artikel.",
  };

  if (platform === "TikTok" || platform === "YouTube Shorts") {
    return {
      ...base,
      format: "Video 35-45 detik, 1 hook, 3 poin, 1 pertanyaan penutup.",
      hook: `Berita ini bikin ${topic.name} ramai dibahas: ${articleContext.title}`,
      structure: [
        "0-3 detik: sebutkan perubahan paling menarik.",
        "4-25 detik: jelaskan 3 poin utama dengan bahasa awam.",
        "26-40 detik: beri konteks dampak ke audiens.",
        "Akhir: tanya pendapat audiens.",
      ],
      cta: `Menurut kamu ${topic.name} bakal makin ramai atau cepat hilang?`,
    };
  }

  if (platform === "Instagram") {
    return {
      ...base,
      format: "Carousel 6 slide atau Reels singkat.",
      hook: `${topic.name}: ini berita yang bikin topiknya naik`,
      structure: [
        "Slide 1: hook besar.",
        "Slide 2: apa yang terjadi.",
        "Slide 3-4: kenapa viral.",
        "Slide 5: dampak untuk audiens.",
        "Slide 6: pertanyaan atau save prompt.",
      ],
      cta: "Save dulu kalau kamu mau pantau update topik ini.",
    };
  }

  if (platform === "X Thread") {
    return {
      ...base,
      format: "Thread 5 tweet, ringkas, tajam, berbasis sumber.",
      hook: `${topic.name} lagi naik. Mulainya dari berita ini: ${articleContext.title}`,
      structure: [
        "Tweet 1: hook dan janji konteks.",
        "Tweet 2: fakta utama.",
        "Tweet 3: kenapa orang membahasnya.",
        "Tweet 4: dampak/kemungkinan berikutnya.",
        "Tweet 5: sumber dan pertanyaan.",
      ],
      cta: "Kalau kamu mau, aku bisa bikin versi script 60 detiknya.",
    };
  }

  return {
    ...base,
    format: "Post edukatif profesional, 120-180 kata.",
    hook: `${articleContext.title}`,
    structure: [
      "Pembuka: insight utama.",
      "Isi: jelaskan konteks dan dampaknya.",
      "Penutup: takeaway praktis.",
    ],
    cta: "Apa insight yang paling relevan untuk industrimu?",
  };
}

function buildSpecialistReply(
  topic: Topic,
  platform: string,
  prompt: string,
  selectedArticles: TopicArticle[] = [],
) {
  const advice = getPlatformAdvice(topic, platform, selectedArticles);
  const articleContext = getArticleContext(topic, selectedArticles);
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("hook")) {
    return `Riri siap. Untuk ${platform}, hook berdasarkan berita pilihan:\n\n"${advice.hook}"\n\nAlternatif:\n1. Jangan scroll dulu, ada update ${topic.name} dari ${articleContext.source}.\n2. Banyak yang bahas ${topic.name}, tapi berita pemicunya ini.\n3. Ini versi singkat dari berita: ${articleContext.title}`;
  }

  if (lowerPrompt.includes("script") || lowerPrompt.includes("skrip")) {
    return `Riri bikinkan script ${platform} berdasarkan berita pilihan:\n\nSumber: ${articleContext.source}\nBerita: ${articleContext.title}\n\nHook: ${advice.hook}\n\nIsi:\n1. Ceritakan inti berita dengan bahasa sederhana.\n2. Jelaskan kenapa berita ini membuat ${topic.name} naik.\n3. Tambahkan konteks agar audiens tidak cuma ikut ramai.\n\nClose: ${advice.cta}`;
  }

  if (lowerPrompt.includes("carousel")) {
    return `Ini struktur carousel dari Riri:\n\n1. ${advice.hook}\n2. Ringkas berita dari ${articleContext.source}.\n3. Apa yang sebenarnya terjadi?\n4. Kenapa ${topic.name} jadi ramai?\n5. Dampaknya untuk audiens.\n6. ${advice.cta}`;
  }

  return `Saran Riri untuk ${platform} berdasarkan berita pilihan:\n\nSumber: ${articleContext.source}\nBerita: ${articleContext.title}\n\nFormat: ${advice.format}\n\nAngle: ${advice.objective}\n\nStruktur:\n${advice.structure.map((item) => `- ${item}`).join("\n")}\n\nCTA: ${advice.cta}\n\nCatatan: ${advice.caution}`;
}

function RiriThinking() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="flex min-h-28 items-center justify-center rounded-2xl bg-darinol-background px-4 py-5"
    >
      <div className="flex flex-col items-center gap-3">
        <motion.div
          animate={{ y: [0, -4, 0], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-darinol-primary/10 text-darinol-primary"
        >
          <svg
            aria-hidden="true"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
            <path d="M19 16v3" />
            <path d="M17.5 17.5h3" />
          </svg>
        </motion.div>
        <div className="flex items-center gap-2">
          <span className="font-heading text-sm font-semibold text-darinol-text">
            Riri
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-darinol-primary [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-darinol-primary [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-darinol-primary" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function SpecialistChat({
  topic,
  selectedArticles,
  platform,
  outputFormat,
  t,
  onPlatformChange,
  onOutputFormatChange,
  messages,
  input,
  onInputChange,
  onSubmit,
  onQuickPrompt,
  loading,
}: {
  topic: Topic;
  selectedArticles: TopicArticle[];
  platform: string;
  outputFormat: string;
  t: Copy;
  onPlatformChange: (platform: string) => void;
  onOutputFormatChange: (format: string) => void;
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onQuickPrompt: (prompt: string) => void;
  loading: boolean;
}) {
  const advice = getPlatformAdvice(topic, platform, selectedArticles);
  const articleContext = getArticleContext(topic, selectedArticles);

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-card rounded-3xl p-4"
    >
      <div className="mb-4">
        <div>
          <h3 className="font-heading text-lg font-semibold text-darinol-text">
            {t.askRiri}
          </h3>
          <p className="mt-1 text-sm text-darinol-muted">
            {t.ririIntro}
          </p>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {platforms.map((item) => (
            <motion.button
              key={item}
              type="button"
              onClick={() => onPlatformChange(item)}
              whileTap={{ scale: 0.96 }}
              className={[
                "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition",
                platform === item
                  ? "orange-gradient border-darinol-primary text-white shadow-soft"
                  : "border-darinol-border bg-darinol-surface text-darinol-muted hover:border-darinol-primary/40 hover:text-darinol-text",
              ].join(" ")}
            >
              {item}
            </motion.button>
          ))}
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {outputFormats.map((item) => (
            <motion.button
              key={item}
              type="button"
              onClick={() => onOutputFormatChange(item)}
              whileTap={{ scale: 0.96 }}
              className={[
                "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition",
                outputFormat === item
                  ? "border-darinol-text bg-darinol-text text-darinol-surface"
                  : "border-darinol-border bg-darinol-surface text-darinol-muted hover:border-darinol-text/30 hover:text-darinol-text",
              ].join(" ")}
            >
              {item}
            </motion.button>
          ))}
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {contentTones.map((item) => (
            <motion.button
              key={item}
              type="button"
              onClick={() => onQuickPrompt(`Ubah gaya konten jadi ${item}`)}
              disabled={loading}
              whileTap={{ scale: 0.96 }}
              className="shrink-0 rounded-full border border-darinol-border bg-darinol-surface/80 px-3 py-2 text-xs font-semibold text-darinol-muted transition hover:border-darinol-primary/40 hover:text-darinol-text disabled:cursor-wait disabled:opacity-60"
            >
              {item}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="glass-soft mb-3 rounded-2xl px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-darinol-muted">
          {t.material}
        </p>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-darinol-text">
          {articleContext.title}
        </p>
        <p className="mt-1 text-xs font-medium text-darinol-muted">
          {articleContext.source} - {platform} - {advice.format}
        </p>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {quickRiriActions.map((action) => (
          <motion.button
            key={action.label}
            type="button"
            onClick={() => onQuickPrompt(action.prompt)}
            disabled={loading}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="shrink-0 rounded-full border border-darinol-border bg-darinol-surface px-3 py-2 text-xs font-semibold text-darinol-muted transition hover:border-darinol-primary/40 hover:text-darinol-text disabled:cursor-wait disabled:opacity-60"
          >
            {action.label}
          </motion.button>
        ))}
      </div>

      <div className="glass-soft max-h-48 space-y-3 overflow-y-auto rounded-2xl p-3">
        {messages.length ? (
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className={[
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "orange-gradient ml-auto text-white"
                    : "bg-darinol-background text-darinol-text",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <p className="flex-1 whitespace-pre-line">{message.text}</p>
                  {message.role === "assistant" ? (
                    <CopyButton text={message.text} />
                  ) : null}
                </div>
              </motion.div>
            ))}
            {loading ? <RiriThinking /> : null}
          </AnimatePresence>
        ) : loading ? (
          <RiriThinking />
        ) : (
          <RiriThinking />
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          disabled={loading}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit();
            }
          }}
          placeholder={t.askPlaceholder}
          className="h-12 flex-1 rounded-full border border-darinol-border bg-darinol-surface px-4 text-sm text-darinol-text outline-none focus:border-darinol-primary focus:ring-4 focus:ring-darinol-primary/10 disabled:cursor-wait disabled:opacity-70"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="orange-gradient moving-accent h-12 rounded-full px-6 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "..." : t.send}
        </button>
      </div>
    </motion.section>
  );
}

function DetailPanel({
  topic,
  selectedArticles,
  selectedArticleUrls,
  contentLoading,
  selectedPlan,
  t,
  activeView,
  onViewChange,
  onToggleArticle,
  onCreateContent,
  creatorMode,
  onCreatorModeChange,
  specialistPlatform,
  specialistOutputFormat,
  onSpecialistPlatformChange,
  onSpecialistOutputFormatChange,
  specialistMessages,
  specialistInput,
  onSpecialistInputChange,
  onSpecialistSubmit,
  onSpecialistQuickPrompt,
  specialistLoading,
  onNextTopic,
  onGenerateIdea,
  onSaveTopic,
  saved,
}: {
  topic: Topic;
  selectedArticles: TopicArticle[];
  selectedArticleUrls: string[];
  contentLoading: boolean;
  selectedPlan: Plan | null;
  t: Copy;
  activeView: MainView;
  onViewChange: (view: MainView) => void;
  onToggleArticle: (articleUrl: string) => void;
  onCreateContent: () => void;
  creatorMode: string;
  onCreatorModeChange: (mode: string) => void;
  specialistPlatform: string;
  specialistOutputFormat: string;
  onSpecialistPlatformChange: (platform: string) => void;
  onSpecialistOutputFormatChange: (format: string) => void;
  specialistMessages: ChatMessage[];
  specialistInput: string;
  onSpecialistInputChange: (value: string) => void;
  onSpecialistSubmit: () => void;
  onSpecialistQuickPrompt: (prompt: string) => void;
  specialistLoading: boolean;
  onNextTopic: () => void;
  onGenerateIdea: () => void;
  onSaveTopic: () => void;
  saved: boolean;
}) {
  const brief = getContentBrief(topic, creatorMode, selectedArticles);
  const articleBasedIdeas = getArticleBasedIdeas(topic, selectedArticles);
  const articleBasedTitles = getArticleBasedTitles(topic, selectedArticles);
  const selectedArticleCount = selectedArticleUrls.length;
  const hasSelectedArticles = selectedArticles.length > 0;
  const insightContent = (
    <div className="space-y-5">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="glass-card rounded-3xl p-4"
      >
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold text-darinol-text">
              {t.relatedNews}
            </h3>
            <p className="mt-1 text-xs font-medium text-darinol-muted">
              {t.markNews}
            </p>
          </div>
          {topic.articles.length ? (
            <span className="w-fit rounded-full bg-darinol-primary/10 px-3 py-1 text-xs font-semibold text-darinol-primary">
              {selectedArticleCount} {t.materials}
            </span>
          ) : null}
        </div>
        {topic.articles.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {topic.articles.slice(0, 12).map((article) => {
              const selected = selectedArticleUrls.includes(article.url);

              return (
                <article
                  key={`${article.source}-${article.url}`}
                  className={[
                    "rounded-2xl border px-4 py-3 transition",
                    selected
                      ? "border-darinol-primary bg-darinol-primary/5"
                      : "glass-soft hover:border-darinol-primary/35",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleArticle(article.url)}
                      className={[
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
                        selected
                          ? "orange-gradient border-darinol-primary text-white"
                          : "border-darinol-border bg-darinol-surface text-transparent hover:border-darinol-primary",
                      ].join(" ")}
                      aria-label={`Pakai artikel ${article.title}`}
                    >
                      {selected ? (
                        <svg
                          aria-hidden="true"
                          className="h-3.5 w-3.5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                      ) : null}
                    </button>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleArticle(article.url)}
                        className="block text-left text-sm font-semibold leading-relaxed text-darinol-text"
                      >
                        {article.title}
                      </button>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-darinol-muted">
                        <span>
                          {article.source} - {formatArticleTime(article.publishedAt)}
                        </span>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-darinol-primary hover:underline"
                        >
                          {t.openSource}
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="glass-soft rounded-2xl px-4 py-3 text-sm text-darinol-muted">
            {t.noSource}
          </p>
        )}
        <button
          type="button"
          onClick={onCreateContent}
          disabled={!selectedArticleCount}
          className={[
            "mt-4 h-12 w-full rounded-full px-5 text-sm font-semibold transition",
            selectedArticleCount
                ? "orange-gradient moving-accent text-white hover:brightness-105"
              : "cursor-not-allowed bg-darinol-surface text-darinol-muted",
          ].join(" ")}
        >
          {selectedArticleCount
            ? `${t.createContent} (${selectedArticleCount})`
            : t.markToCreate}
        </button>
      </motion.section>
    </div>
  );
  const contentContent = contentLoading ? (
    <ContentLoadingState t={t} />
  ) : !hasSelectedArticles ? (
    <ContentEmptyState onBackToInsight={() => onViewChange("Berita")} t={t} />
  ) : (
    <div className="space-y-5">
      <SpecialistChat
        topic={topic}
        selectedArticles={selectedArticles}
        platform={specialistPlatform}
        outputFormat={specialistOutputFormat}
        t={t}
        onPlatformChange={onSpecialistPlatformChange}
        onOutputFormatChange={onSpecialistOutputFormatChange}
        messages={specialistMessages}
        input={specialistInput}
        onInputChange={onSpecialistInputChange}
        onSubmit={onSpecialistSubmit}
        onQuickPrompt={onSpecialistQuickPrompt}
        loading={specialistLoading}
      />

      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="glass-card rounded-3xl p-4"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold text-darinol-text">
              {t.contentDirection}
            </h3>
            <p className="mt-1 text-sm text-darinol-muted">
              {t.directionHint}
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {creatorModes.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onCreatorModeChange(mode)}
                className={[
                  "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition",
                  creatorMode === mode
                    ? "orange-gradient border-darinol-primary text-white"
                    : "border-darinol-border bg-darinol-surface text-darinol-muted hover:border-darinol-primary/40 hover:text-darinol-text",
                ].join(" ")}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 2xl:grid-cols-[1.1fr_0.9fr]">
          <CompactTextBlock label={t.mainAngle} text={brief.angle} />
          <CompactTextBlock label={t.openingHook} text={brief.hook} />
        </div>
        <p className="glass-soft mt-3 rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed text-darinol-muted">
          {t.safetyNote}: {brief.caution}
        </p>
      </motion.section>

      <div className="grid gap-4 2xl:grid-cols-2">
        <SimpleList title={t.contentIdeas} items={articleBasedIdeas} />
        <SimpleList title={t.readyTitles} items={articleBasedTitles} />
      </div>

      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="glass-card rounded-3xl p-4"
      >
        <h3 className="font-heading text-lg font-semibold text-darinol-text">
          {t.quickDraft}
        </h3>
        <p className="mt-1 text-sm text-darinol-muted">
          {t.draftHint}
        </p>
        <div className="mt-4">
          <CompactTextBlock label={`${creatorMode} script`} text={brief.script} />
        </div>
      </motion.section>
    </div>
  );

  return (
    <motion.section
      key={topic.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="glass-card rounded-[2rem]"
    >
      <div className="p-4 md:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between xl:mb-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-darinol-primary/10 px-3 py-1 text-xs font-semibold text-darinol-primary">
                {topic.category}
              </span>
              <span className="rounded-full bg-darinol-success/10 px-3 py-1 text-xs font-semibold text-darinol-success">
              {topic.growth}
              </span>
            </div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-darinol-text md:text-4xl">
              {topic.name}
            </h2>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-darinol-primary">
              {t.viralLabel}
            </p>
          </div>

          <div className="glass-soft w-fit rounded-2xl px-5 py-3 text-center">
            <p className="font-heading text-4xl font-semibold leading-none text-darinol-primary">
              {topic.score}
            </p>
            <p className="mt-1 text-xs font-semibold text-darinol-muted">
              {t.viralScore}
            </p>
          </div>
        </div>

        {activeView === "Berita" ? (
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(280px,0.82fr)]">
            <div>{insightContent}</div>
            <section className="glass-card rounded-3xl p-4">
              <h3 className="font-heading text-lg font-semibold text-darinol-text">
                {t.trendSignal}
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <CompactStat label={t.viralScore} value={String(topic.score)} />
                <CompactStat label="Growth" value={topic.growth} />
                <CompactStat label="Category" value={topic.category} />
              </div>
              <div className="mt-4 rounded-2xl border border-darinol-border bg-darinol-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-darinol-primary">
                  {t.selectedMaterial}
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-darinol-muted">
                  {selectedArticleCount
                    ? `${selectedArticleCount} ${t.materials} siap diproses Riri.`
                    : t.markNews}
                </p>
              </div>
            </section>
          </div>
        ) : (
          <div>{contentContent}</div>
        )}

        <div className="mt-5 flex shrink-0 flex-col gap-3 border-t border-darinol-border pt-5 sm:flex-row lg:mt-4">
          <button
            type="button"
            onClick={onGenerateIdea}
            className="orange-gradient moving-accent h-12 flex-1 rounded-full px-5 text-sm font-semibold text-white transition hover:brightness-105"
          >
            {t.generateIdea}
          </button>
          <button
            type="button"
            onClick={onSaveTopic}
            className="h-12 flex-1 rounded-full border border-darinol-primary/40 bg-darinol-primary/5 px-5 text-sm font-semibold text-darinol-primary transition hover:bg-darinol-primary/10"
          >
            {selectedPlan === "Supporter"
              ? saved
                ? t.savedIdea
                : t.saveIdea
              : t.upgradeToSave}
          </button>
          <button
            type="button"
            onClick={onNextTopic}
            className="h-12 flex-1 rounded-full border border-darinol-border bg-darinol-surface px-5 text-sm font-semibold text-darinol-text transition hover:border-darinol-primary/40 hover:bg-darinol-primary/5"
          >
            {t.nextTopic}
          </button>
        </div>
      </div>
    </motion.section>
  );
}

export default function Page() {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [selectedId, setSelectedId] = useState(initialTopics[0].id);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeMainView, setActiveMainView] = useState<MainView>("Berita");
  const [creatorMode, setCreatorMode] = useState(creatorModes[0]);
  const [specialistPlatform, setSpecialistPlatform] = useState(platforms[0]);
  const [specialistOutputFormat, setSpecialistOutputFormat] = useState(
    outputFormats[0],
  );
  const [specialistMessages, setSpecialistMessages] = useState<ChatMessage[]>([]);
  const [specialistInput, setSpecialistInput] = useState("");
  const [specialistLoading, setSpecialistLoading] = useState(false);
  const [savedTopicIds, setSavedTopicIds] = useState<string[]>([]);
  const [selectedArticleUrlsByTopic, setSelectedArticleUrlsByTopic] = useState<
    Record<string, string[]>
  >({});
  const [contentLoading, setContentLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"Free" | "Supporter" | null>(
    null,
  );
  const [upgradeNotice, setUpgradeNotice] = useState(false);
  const [language, setLanguage] = useState<Language>("id");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [appBooting, setAppBooting] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("memuat data");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const t = copy[language];
  const onboardingOpen = !appBooting && (!selectedPlan || accountOpen) && !paymentOpen;

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("darinol-language");
    const storedTheme = window.localStorage.getItem("darinol-theme");
    const storedPlan = window.localStorage.getItem("darinol-plan");
    const storedEmail = window.localStorage.getItem("darinol-email");

    if (storedLanguage === "id" || storedLanguage === "en") {
      setLanguage(storedLanguage);
    }

    if (storedTheme === "light" || storedTheme === "dark") {
      setThemeMode(storedTheme);
    }

    if (storedPlan === "Free" || storedPlan === "Supporter") {
      setSelectedPlan(storedPlan);
    }

    if (storedEmail) {
      setAccountEmail(storedEmail);
    }

    const timer = window.setTimeout(() => {
      setAppBooting(false);
    }, 2100);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
    window.localStorage.setItem("darinol-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    window.localStorage.setItem("darinol-language", language);
  }, [language]);

  useEffect(() => {
    if (!onboardingOpen && !paymentOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [onboardingOpen, paymentOpen]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = getSupabaseBrowserClient();
    let active = true;

    async function syncProfile() {
      const profile = await getCurrentUserProfile();

      if (!active || !profile) return;

      const nextPlan = profile.plan === "free" ? "Free" : "Supporter";
      const profileEmail = profile.email ?? "";

      setSelectedPlan(nextPlan);
      setAccountEmail(profileEmail);
      window.localStorage.setItem("darinol-plan", nextPlan);
      if (profileEmail) {
        window.localStorage.setItem("darinol-email", profileEmail);
      }
      setAuthMessage(
        profile.plan === "free"
          ? "Supabase tersambung. Akun Free aktif."
          : "Supabase tersambung. Akun Starter aktif.",
      );
    }

    void syncProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncProfile();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    const cacheKey = "darinol-trends-cache";

    function applyTrends(payload: TrendsPayload) {
      if (!active || !payload.topics?.length) return;

      setTopics(payload.topics);
      setSelectedId((currentId) =>
        payload.topics.some((topic) => topic.id === currentId)
          ? currentId
          : payload.topics[0].id,
      );
      setUpdatedAt(formatUpdatedAt(payload.updatedAt));
    }

    async function loadTrends() {
      try {
        const cachedValue = window.localStorage.getItem(cacheKey);

        if (cachedValue) {
          const cached = JSON.parse(cachedValue) as TrendsPayload & {
            cachedAt?: number;
          };
          const isFresh = cached.cachedAt
            ? Date.now() - cached.cachedAt < 5 * 60 * 1000
            : false;

          if (isFresh) {
            applyTrends(cached);
          }
        }

        const response = await fetch("/api/trends");
        const payload = (await response.json()) as TrendsPayload;

        if (!active) return;

        if (payload.topics?.length) {
          applyTrends(payload);
          window.localStorage.setItem(
            cacheKey,
            JSON.stringify({ ...payload, cachedAt: Date.now() }),
          );
        }
      } catch {
        if (!active) return;
        setUpdatedAt("data dummy");
      }
    }

    loadTrends();

    return () => {
      active = false;
    };
  }, []);

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase();

    return topics.filter((topic) => {
      const searchable = `${topic.name} ${topic.category}`.toLowerCase();
      const matchesSearch = searchable.includes(query);
      const matchesCategory =
        activeCategory === "Semua" || topic.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, search, topics]);

  const selectedTopic =
    topics.find((topic) => topic.id === selectedId) ?? topics[0];
  const selectedArticleUrls = selectedArticleUrlsByTopic[selectedTopic.id] ?? [];
  const selectedArticles = getSelectedArticles(selectedTopic, selectedArticleUrls);
  const hotNewsItems = useMemo(() => getHotNewsItems(topics), [topics]);
  const visibleTopics = isMobile ? filteredTopics.slice(0, 8) : filteredTopics;
  const visibleArticles = isMobile
    ? selectedTopic.articles.slice(0, 6)
    : selectedTopic.articles.slice(0, 15);
  function handleSelectTopic(topicId: string) {
    setSelectedId(topicId);
    setContentLoading(false);
    setSpecialistMessages([]);
    setSpecialistInput("");
  }

  function handleSelectCategory(category: string) {
    setActiveCategory(category);

    const nextTopic = topics.find((topic) => {
      const searchable = `${topic.name} ${topic.category}`.toLowerCase();
      const matchesSearch = searchable.includes(search.trim().toLowerCase());
      const matchesCategory = category === "Semua" || topic.category === category;

      return matchesSearch && matchesCategory;
    });

    if (nextTopic) {
      setSelectedId(nextTopic.id);
      setContentLoading(false);
      setSpecialistMessages([]);
      setSpecialistInput("");
    }
  }

  function handleNextTopic() {
    const visibleTopics = filteredTopics.length ? filteredTopics : topics;
    const currentIndex = visibleTopics.findIndex((topic) => topic.id === selectedId);
    const nextTopic = visibleTopics[(currentIndex + 1) % visibleTopics.length];
    setSelectedId(nextTopic.id);
    setContentLoading(false);
    setSpecialistMessages([]);
    setSpecialistInput("");
  }

  function handleGenerateIdea() {
    const articleContext = getArticleContext(selectedTopic, selectedArticles);
    const newIdea = selectedArticles.length
      ? `Angle cepat: ${articleContext.title} dalam 60 detik`
      : `Angle cepat: ${selectedTopic.name} dalam 60 detik`;

    setTopics((currentTopics) =>
      currentTopics.map((topic) =>
        topic.id === selectedTopic.id
          ? {
              ...topic,
              ideas: topic.ideas.includes(newIdea)
                ? topic.ideas
                : [...topic.ideas, newIdea],
            }
          : topic,
      ),
    );
  }

  function handleSaveTopic() {
    if (selectedPlan !== "Supporter") {
      setUpgradeNotice(true);
      return;
    }

    setSavedTopicIds((currentIds) =>
      currentIds.includes(selectedTopic.id)
        ? currentIds.filter((id) => id !== selectedTopic.id)
        : [...currentIds, selectedTopic.id],
    );
  }

  function handleToggleArticle(articleUrl: string) {
    setSelectedArticleUrlsByTopic((currentMap) => {
      const currentUrls = currentMap[selectedTopic.id] ?? [];
      const currentPlan = selectedPlan ?? "Free";
      const maxArticles = planLimits[currentPlan].maxArticles;

      if (!currentUrls.includes(articleUrl) && currentUrls.length >= maxArticles) {
        setUpgradeNotice(currentPlan === "Free");
        return currentMap;
      }

      const nextUrls = currentUrls.includes(articleUrl)
        ? currentUrls.filter((url) => url !== articleUrl)
        : [...currentUrls, articleUrl];

      return {
        ...currentMap,
        [selectedTopic.id]: nextUrls,
      };
    });
    setContentLoading(false);
    setSpecialistMessages([]);
    setSpecialistInput("");
  }

  function startContentLoading() {
    setActiveMainView("Buat Konten");
    setContentLoading(true);
    window.setTimeout(() => {
      setContentLoading(false);
    }, 1400);
  }

  function handleCreateContent() {
    if (!selectedArticles.length) return;
    startContentLoading();
  }

  async function handleSpecialistSubmit(promptOverride?: string) {
    const prompt = (promptOverride ?? specialistInput).trim();

    if (!prompt || specialistLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: prompt,
    };

    setSpecialistMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);
    setSpecialistInput("");
    setSpecialistLoading(true);

    try {
      const response = await fetch("/api/riri", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: selectedTopic,
          selectedArticles,
          platform: specialistPlatform,
          outputFormat: specialistOutputFormat,
          plan: selectedPlan ?? "Free",
          prompt,
        }),
      });
      const payload = (await response.json()) as { reply?: string };
      const reply =
        payload.reply ??
        buildSpecialistReply(
          selectedTopic,
          specialistPlatform,
          prompt,
          selectedArticles,
        );

      setSpecialistMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: reply,
        },
      ]);
    } catch {
      setSpecialistMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: buildSpecialistReply(
            selectedTopic,
            specialistPlatform,
            prompt,
            selectedArticles,
          ),
        },
      ]);
    } finally {
      setSpecialistLoading(false);
    }
  }

  function handleSpecialistQuickPrompt(prompt: string) {
    void handleSpecialistSubmit(prompt);
  }

  async function handleChoosePlan(
    plan: Plan,
    email = "",
    password = "",
    authMode: "signin" | "signup" = "signin",
  ) {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    setAuthMessage("");

    if (isSupabaseConfigured) {
      if (!cleanEmail || cleanPassword.length < 6) {
        setAuthMessage("Isi email dan password minimal 6 karakter dulu.");
        return;
      }

      setAuthLoading(true);

      try {
        const result =
          authMode === "signup"
            ? await signUpWithPassword(cleanEmail, cleanPassword)
            : await signInWithPassword(cleanEmail, cleanPassword);
        setAuthMessage(
          result.ok
            ? authMode === "signup"
              ? "Akun berhasil dibuat. Kalau Supabase minta konfirmasi, cek email kamu."
              : "Login berhasil. Akun kamu sudah tersambung."
            : `Supabase belum berhasil: ${result.message}`,
        );

        if (!result.ok) return;
      } finally {
        setAuthLoading(false);
      }
    } else if (!isSupabaseConfigured) {
      setAuthMessage("Supabase belum terisi di .env.local. Masuk demo dulu.");
    } else {
      setAuthMessage("Email kosong. Masuk demo dulu.");
    }

    if (cleanEmail) {
      setAccountEmail(cleanEmail);
      window.localStorage.setItem("darinol-email", cleanEmail);
    }

    setSelectedPlan(plan);
    window.localStorage.setItem("darinol-plan", plan);
    setAccountOpen(false);
    setPaymentOpen(false);
    setUpgradeNotice(false);
  }

  function handlePaymentComplete() {
    setSelectedPlan("Supporter");
    window.localStorage.setItem("darinol-plan", "Supporter");
    setPaymentOpen(false);
    setUpgradeNotice(false);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--cursor-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--cursor-y", `${event.clientY}px`);
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      onPointerMove={isMobile ? undefined : handlePointerMove}
      className="mx-auto flex min-h-dvh w-full max-w-[1680px] flex-col overflow-x-hidden px-3 py-3 sm:px-4 md:px-5 lg:px-6 lg:py-5"
    >
      <div className="ambient-layer" aria-hidden="true" />
      <Header
        search={search}
        onSearchChange={setSearch}
        updatedAt={updatedAt}
        selectedPlan={selectedPlan}
        accountEmail={accountEmail}
        onAccountClick={() => {
          setAuthMessage("");
          setAccountOpen(true);
        }}
        savedCount={savedTopicIds.length}
        hotNewsItems={hotNewsItems}
        isMobile={isMobile}
        language={language}
        onLanguageChange={setLanguage}
        themeMode={themeMode}
        onThemeToggle={() =>
          setThemeMode((currentTheme) =>
            currentTheme === "dark" ? "light" : "dark",
          )
        }
        t={t}
      />

      {upgradeNotice ? (
        <UpgradeNotice
          t={t}
          onDismiss={() => setUpgradeNotice(false)}
          onUpgrade={() => setPaymentOpen(true)}
        />
      ) : null}
      <WelcomeStrip
        selectedPlan={selectedPlan}
        onUpgrade={() => setPaymentOpen(true)}
      />

      <MainNavigation
        activeView={activeMainView}
        onChange={(view) => {
          setActiveMainView(view);
          setContentLoading(false);
        }}
        t={t}
      />

      {activeMainView === "Berita" ? (
        <motion.section
          variants={staggerList}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <div className="glass-card rounded-[2rem] p-4 md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-3xl font-semibold tracking-tight text-darinol-text">
                  {t.newsPage}
                </h2>
                <p className="mt-2 text-sm font-medium text-darinol-muted">
                  {t.newsPageHint}
                </p>
              </div>
              <span className="w-fit rounded-full bg-darinol-primary/10 px-4 py-2 text-sm font-semibold text-darinol-primary">
                {filteredTopics.length} {t.topics}
              </span>
            </div>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {categoryFilters.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleSelectCategory(category)}
                  className={[
                    "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition",
                    activeCategory === category
                      ? "orange-gradient border-darinol-primary text-white"
                      : "border-darinol-border bg-darinol-surface text-darinol-muted hover:border-darinol-primary/40 hover:text-darinol-text",
                  ].join(" ")}
                >
                  {category === "Semua" ? t.all : category}
                </button>
              ))}
            </div>

            <motion.div
              variants={staggerList}
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
            >
              {visibleTopics.map((topic, index) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  rank={index + 1}
                  selected={topic.id === selectedTopic.id}
                  onClick={() => handleSelectTopic(topic.id)}
                />
              ))}
            </motion.div>

            {filteredTopics.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-darinol-border bg-darinol-surface p-6 text-center shadow-soft">
                <p className="font-heading text-lg font-semibold text-darinol-text">
                  {t.noTopicTitle}
                </p>
                <p className="mt-2 text-sm text-darinol-muted">
                  {t.noTopicBody}
                </p>
              </div>
            ) : null}
          </div>

          <div className="glass-card rounded-[2rem] p-4 md:p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-darinol-primary/10 px-3 py-1 text-xs font-semibold text-darinol-primary">
                    {selectedTopic.category}
                  </span>
                  <span className="rounded-full bg-darinol-primary/10 px-3 py-1 text-xs font-semibold text-darinol-primary">
                    {selectedTopic.growth}
                  </span>
                </div>
                <h3 className="font-heading text-3xl font-semibold tracking-tight text-darinol-text">
                  {selectedTopic.name}
                </h3>
                <p className="mt-2 text-sm font-medium text-darinol-muted">
                  {t.markNews}
                </p>
              </div>
              <div className="grid w-full gap-3 sm:grid-cols-3 md:w-auto">
                <CompactStat label={t.viralScore} value={String(selectedTopic.score)} />
                <CompactStat label="Growth" value={selectedTopic.growth} />
                <CompactStat label={t.selectedMaterial} value={String(selectedArticleUrls.length)} />
              </div>
            </div>

            {selectedTopic.articles.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {visibleArticles.map((article) => {
                  const selected = selectedArticleUrls.includes(article.url);

                  return (
                    <article
                      key={`${article.source}-${article.url}`}
                      className={[
                        "rounded-3xl border p-4 transition backdrop-blur-xl",
                        selected
                          ? "border-darinol-primary bg-darinol-primary/5"
                          : "border-white/45 bg-white/25 hover:border-darinol-primary/35 dark:border-white/10 dark:bg-white/5",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleArticle(article.url)}
                          className={[
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition",
                            selected
                              ? "orange-gradient border-darinol-primary text-white"
                              : "border-darinol-border bg-darinol-surface text-transparent hover:border-darinol-primary",
                          ].join(" ")}
                          aria-label={`Pakai artikel ${article.title}`}
                        >
                          {selected ? (
                            <svg
                              aria-hidden="true"
                              className="h-4 w-4 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m5 12 4 4L19 6" />
                            </svg>
                          ) : null}
                        </button>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleArticle(article.url)}
                            className="text-left text-base font-semibold leading-relaxed text-darinol-text"
                          >
                            {article.title}
                          </button>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-darinol-muted">
                            <span>
                              {article.source} - {formatArticleTime(article.publishedAt)}
                            </span>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-darinol-primary hover:underline"
                            >
                              {t.openSource}
                            </a>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="glass-soft rounded-2xl px-4 py-3 text-sm text-darinol-muted">
                {t.noSource}
              </p>
            )}

            <button
              type="button"
              onClick={handleCreateContent}
              disabled={!selectedArticleUrls.length}
              className={[
                "mt-5 h-12 w-full rounded-full px-5 text-sm font-semibold transition md:w-auto md:min-w-56",
                selectedArticleUrls.length
                  ? "orange-gradient moving-accent text-white hover:brightness-105"
                  : "cursor-not-allowed bg-darinol-surface text-darinol-muted",
              ].join(" ")}
            >
              {selectedArticleUrls.length
                ? `${t.createContent} (${selectedArticleUrls.length})`
                : t.markToCreate}
            </button>

          </div>
        </motion.section>
      ) : (
        <motion.section
          variants={staggerList}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <div className="glass-card rounded-[2rem] p-4 md:p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-3xl font-semibold tracking-tight text-darinol-text">
                  {t.contentPage}
                </h2>
                <p className="mt-2 text-sm font-medium text-darinol-muted">
                  {t.contentPageHint}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMainView("Berita")}
                className="h-11 w-fit rounded-full border border-darinol-border bg-darinol-surface px-5 text-sm font-semibold text-darinol-text transition hover:border-darinol-primary/40 hover:bg-darinol-primary/5"
              >
                {t.newsPage}
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
              {visibleTopics.map((topic, index) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic.id)}
                  className={[
                    "min-w-56 rounded-2xl border p-3 text-left transition",
                    topic.id === selectedTopic.id
                      ? "orange-gradient border-darinol-primary text-white"
                      : "border-darinol-border bg-darinol-surface text-darinol-text hover:border-darinol-primary/35",
                  ].join(" ")}
                >
                  <span className="text-xs font-semibold opacity-70">
                    #{index + 1} - {topic.category}
                  </span>
                  <span className="mt-1 block font-heading text-lg font-semibold">
                    {topic.name}
                  </span>
                  <span className="mt-1 block text-xs font-semibold opacity-80">
                    {topic.score} score - {topic.growth}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <DetailPanel
            topic={selectedTopic}
            selectedArticles={selectedArticles}
            selectedArticleUrls={selectedArticleUrls}
            contentLoading={contentLoading}
            selectedPlan={selectedPlan}
            t={t}
            activeView={activeMainView}
            onViewChange={setActiveMainView}
            onToggleArticle={handleToggleArticle}
            onCreateContent={handleCreateContent}
            creatorMode={creatorMode}
            onCreatorModeChange={setCreatorMode}
            specialistPlatform={specialistPlatform}
            specialistOutputFormat={specialistOutputFormat}
            onSpecialistPlatformChange={setSpecialistPlatform}
            onSpecialistOutputFormatChange={setSpecialistOutputFormat}
            specialistMessages={specialistMessages}
            specialistInput={specialistInput}
            onSpecialistInputChange={setSpecialistInput}
            onSpecialistSubmit={handleSpecialistSubmit}
            onSpecialistQuickPrompt={handleSpecialistQuickPrompt}
            specialistLoading={specialistLoading}
            onNextTopic={handleNextTopic}
            onGenerateIdea={handleGenerateIdea}
            onSaveTopic={handleSaveTopic}
            saved={savedTopicIds.includes(selectedTopic.id)}
          />
        </motion.section>
      )}

      {appBooting ? <AppLoadingOverlay t={t} /> : null}
      {paymentOpen ? (
        <PaymentModal
          t={t}
          onClose={() => setPaymentOpen(false)}
          onPaid={handlePaymentComplete}
        />
      ) : null}
      {onboardingOpen ? (
        <OnboardingOverlay
          onChoosePlan={handleChoosePlan}
          onClose={selectedPlan ? () => setAccountOpen(false) : undefined}
          language={language}
          t={t}
          authMessage={authMessage}
          authLoading={authLoading}
        />
      ) : null}
    </motion.main>
  );
}

