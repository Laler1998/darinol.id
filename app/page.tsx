"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
    payTitle: "Dukung Darinol.id",
    payBody:
      "Pilih nominal yang nyaman. Setelah bayar, akun Supporter aktif dan kamu bisa pakai lebih banyak bahan berita.",
    payCustom: "Nominal lain",
    payContinue: "Simulasi bayar dan masuk",
    payLater: "Nanti dulu",
    payNote: "MVP ini masih simulasi. Versi produksi bisa disambungkan ke Midtrans, Xendit, atau Stripe.",
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
    payTitle: "Support Darinol.id",
    payBody:
      "Choose any amount that feels right. After payment, Supporter unlocks more news materials.",
    payCustom: "Custom amount",
    payContinue: "Simulate payment and enter",
    payLater: "Maybe later",
    payNote: "This MVP uses a simulated payment. Production can connect to Midtrans, Xendit, or Stripe.",
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
];

const detailTabs = ["Insight", "Konten"];

const platforms = ["TikTok", "Instagram", "YouTube Shorts", "X Thread", "LinkedIn"];
const outputFormats = ["Full Brief", "Hook", "Script", "Caption", "Carousel"];
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
  savedCount,
  hotNewsItems,
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
  savedCount: number;
  hotNewsItems: ReturnType<typeof getHotNewsItems>;
  language: Language;
  onLanguageChange: (language: Language) => void;
  themeMode: ThemeMode;
  onThemeToggle: () => void;
  t: Copy;
}) {
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
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-darinol-primary">
            Darinol.id
          </h1>
          <p className="mt-1 text-sm font-medium text-darinol-muted">
            {t.tagline}
          </p>
        </div>

        <div className="order-3 flex flex-wrap items-center justify-start gap-2 lg:justify-end">
            <span className="glass-soft h-8 rounded-full px-3 py-1.5 text-xs font-semibold text-darinol-muted">
              {selectedPlan ?? t.noAccount}
            </span>
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
                      ? "bg-darinol-primary text-white"
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
          <span className="shrink-0 rounded-full bg-darinol-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
            Live
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex w-max animate-[ticker_42s_linear_infinite] items-center gap-4 hover:[animation-play-state:paused]">
              {[...hotNewsItems, ...hotNewsItems].map((item, index) => (
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
          ? "border-darinol-primary bg-darinol-primary text-white shadow-soft"
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

function OnboardingOverlay({
  onChoosePlan,
  language,
  t,
}: {
  onChoosePlan: (plan: Plan) => void;
  language: Language;
  t: Copy;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-darinol-text/12 px-5 backdrop-blur-sm"
    >
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="glass-card w-full max-w-2xl rounded-[2rem] p-6 md:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-darinol-primary">
          {t.onboardingKicker}
        </p>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-darinol-text md:text-4xl">
          {t.onboardingTitle}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-darinol-muted">
          {t.onboardingBody}
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onChoosePlan("Free")}
            className="glass-soft rounded-3xl p-5 text-left transition hover:border-darinol-primary/35"
          >
            <p className="font-heading text-xl font-semibold text-darinol-text">
              {t.freeTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-darinol-muted">
              {t.freeBody}
            </p>
            <div className="mt-4 space-y-2 text-xs font-medium text-darinol-muted">
              <p>- {language === "id" ? "1 berita sebagai bahan konten" : "1 news item as content material"}</p>
              <p>- {t.freeBenefit}</p>
            </div>
            <p className="mt-5 text-sm font-semibold text-darinol-primary">
              {t.freeCta}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChoosePlan("Supporter")}
            className="rounded-3xl border border-darinol-primary/35 bg-darinol-primary p-5 text-left text-white shadow-soft transition hover:brightness-105"
          >
            <p className="font-heading text-xl font-semibold">
              {t.supporterTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              {t.supporterBody}
            </p>
            <div className="mt-4 space-y-2 text-xs font-medium text-white/80">
              <p>- {language === "id" ? "Bisa pakai beberapa berita pilihan" : "Use multiple selected news items"}</p>
              <p>- {t.supporterBenefit}</p>
            </div>
            <p className="mt-5 text-sm font-semibold">
              {t.supporterCta}
            </p>
          </button>
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-darinol-surface text-darinol-primary shadow-soft">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-darinol-primary/20 border-t-darinol-primary" />
        </div>
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
        <div className="float-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-darinol-primary text-white">
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
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="m4.93 4.93 2.83 2.83" />
            <path d="m16.24 16.24 2.83 2.83" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="m4.93 19.07 2.83-2.83" />
            <path d="m16.24 7.76 2.83-2.83" />
          </svg>
        </div>
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
        className="h-10 rounded-full bg-darinol-primary px-4 text-xs font-semibold text-white transition hover:brightness-105"
      >
        Lihat Supporter
      </button>
    </motion.div>
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
          className="h-10 rounded-full bg-darinol-primary px-4 text-xs font-semibold text-white"
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-darinol-text/25 px-5 backdrop-blur-sm"
    >
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="glass-card w-full max-w-md rounded-[2rem] p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-darinol-primary">
              Supporter
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
                  ? "border-darinol-primary bg-darinol-primary text-white"
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

        <button
          type="button"
          onClick={onPaid}
          className="mt-5 h-12 w-full rounded-full bg-darinol-primary px-5 text-sm font-semibold text-white transition hover:brightness-105"
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
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-darinol-muted">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-darinol-text">
        {text}
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
            className="glass-soft flex gap-3 rounded-2xl px-4 py-3 text-sm leading-relaxed text-darinol-text"
          >
            <span className="font-heading text-sm font-semibold text-darinol-primary">
              {index + 1}
            </span>
            <p>{item}</p>
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
        className="mt-5 h-11 rounded-full bg-darinol-primary px-5 text-sm font-semibold text-white transition hover:brightness-105"
      >
        {t.emptyButton}
      </button>
    </section>
  );
}

function ContentLoadingState({ t }: { t: Copy }) {
  return (
    <section className="glass-card rounded-3xl p-8 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-darinol-primary/20 border-t-darinol-primary" />
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
                  ? "border-darinol-primary bg-darinol-primary text-white shadow-soft"
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
                    ? "ml-auto bg-darinol-primary text-white"
                    : "bg-darinol-background text-darinol-text",
                ].join(" ")}
              >
                <p className="whitespace-pre-line">{message.text}</p>
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
          className="h-12 rounded-full bg-darinol-primary px-6 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
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
  activeTab,
  onTabChange,
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
  activeTab: string;
  onTabChange: (tab: string) => void;
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
          <div className="space-y-3">
            {topic.articles.slice(0, 5).map((article) => {
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
                          ? "border-darinol-primary bg-darinol-primary text-white"
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
            <button
              type="button"
              onClick={onCreateContent}
              disabled={!selectedArticleCount}
              className={[
                "h-12 w-full rounded-full px-5 text-sm font-semibold transition",
                selectedArticleCount
                  ? "bg-darinol-primary text-white hover:brightness-105"
                  : "cursor-not-allowed bg-darinol-surface text-darinol-muted",
              ].join(" ")}
            >
              {selectedArticleCount
                ? `${t.createContent} (${selectedArticleCount})`
                : t.markToCreate}
            </button>
          </div>
        ) : (
          <p className="glass-soft rounded-2xl px-4 py-3 text-sm text-darinol-muted">
            {t.noSource}
          </p>
        )}
      </motion.section>
    </div>
  );
  const contentContent = contentLoading ? (
    <ContentLoadingState t={t} />
  ) : !hasSelectedArticles ? (
    <ContentEmptyState onBackToInsight={() => onTabChange("Insight")} t={t} />
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
                    ? "border-darinol-primary bg-darinol-primary text-white"
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
      className="glass-card flex min-h-[620px] flex-col overflow-hidden rounded-[2rem] md:min-h-0"
    >
      <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
        <div className="mb-5 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between xl:mb-4">
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

        <div className="mb-5 flex rounded-full border border-darinol-border bg-darinol-background p-1 lg:hidden">
          {detailTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={[
                "h-10 flex-1 rounded-full px-4 text-sm font-semibold transition",
                activeTab === tab
                  ? "bg-darinol-surface text-darinol-primary shadow-soft"
                  : "text-darinol-muted hover:text-darinol-text",
              ].join(" ")}
            >
              {tab === "Konten" ? t.content : t.insight}
            </button>
          ))}
        </div>

        <div className="hidden min-h-0 flex-1 grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-4 xl:gap-5 lg:grid">
          <div className="min-h-0 overflow-y-auto pr-1">{insightContent}</div>
          <div className="min-h-0 overflow-y-auto pr-1">{contentContent}</div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto lg:hidden">
        {activeTab === "Insight" ? (
          <div className="space-y-6">
            <section>
              <h3 className="mb-3 font-heading text-lg font-semibold text-darinol-text">
                {t.whyViral}
              </h3>
              <ul className="space-y-3">
                {topic.whyViral.map((reason) => (
                  <li
                    key={reason}
                    className="flex gap-3 text-sm leading-relaxed text-darinol-muted"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-darinol-primary" />
                    {reason}
                  </li>
                ))}
              </ul>
            </section>

            <section>
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
                <div className="space-y-3">
                  {topic.articles.slice(0, 5).map((article) => {
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
                              ? "border-darinol-primary bg-darinol-primary text-white"
                              : "border-darinol-border bg-darinol-surface text-transparent hover:border-darinol-primary",
                          ].join(" ")}
                          aria-label={`Pakai artikel ${article.title}`}
                        >
                          {selected ? (
                            <svg
                              aria-hidden="true"
                              className="h-3.5 w-3.5"
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
                  )})}
                  <button
                    type="button"
                    onClick={onCreateContent}
                    disabled={!selectedArticleCount}
                    className={[
                      "h-12 w-full rounded-full px-5 text-sm font-semibold transition",
                      selectedArticleCount
                        ? "bg-darinol-primary text-white hover:brightness-105"
                        : "cursor-not-allowed bg-darinol-surface text-darinol-muted",
                    ].join(" ")}
                  >
                    {selectedArticleCount
                      ? `${t.createContent} (${selectedArticleCount})`
                      : t.markToCreate}
                  </button>
                </div>
              ) : (
                <p className="glass-soft rounded-2xl px-4 py-3 text-sm text-darinol-muted">
                  {t.noSource}
                </p>
              )}
            </section>
          </div>
        ) : contentLoading ? (
          <ContentLoadingState t={t} />
        ) : !hasSelectedArticles ? (
          <ContentEmptyState onBackToInsight={() => onTabChange("Insight")} t={t} />
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

            <section className="glass-card rounded-3xl p-4">
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
                          ? "border-darinol-primary bg-darinol-primary text-white"
                          : "border-darinol-border bg-darinol-surface text-darinol-muted hover:border-darinol-primary/40 hover:text-darinol-text",
                      ].join(" ")}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                <CompactTextBlock label={t.mainAngle} text={brief.angle} />
                <CompactTextBlock label={t.openingHook} text={brief.hook} />
              </div>
              <p className="glass-soft mt-3 rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed text-darinol-muted">
                {t.safetyNote}: {brief.caution}
              </p>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              <SimpleList title={t.contentIdeas} items={articleBasedIdeas} />
              <SimpleList title={t.readyTitles} items={articleBasedTitles} />
            </div>

            <section className="glass-card rounded-3xl p-4">
              <h3 className="font-heading text-lg font-semibold text-darinol-text">
                {t.quickDraft}
              </h3>
              <p className="mt-1 text-sm text-darinol-muted">
                {t.draftHint}
              </p>
              <div className="mt-4">
                <CompactTextBlock label={`${creatorMode} script`} text={brief.script} />
              </div>
            </section>
          </div>
        )}

        </div>

        <div className="mt-5 flex shrink-0 flex-col gap-3 border-t border-darinol-border pt-5 sm:flex-row lg:mt-4">
          <button
            type="button"
            onClick={onGenerateIdea}
            className="h-12 flex-1 rounded-full bg-darinol-primary px-5 text-sm font-semibold text-white transition hover:brightness-105"
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
  const [activeDetailTab, setActiveDetailTab] = useState(detailTabs[0]);
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
    "Free",
  );
  const [upgradeNotice, setUpgradeNotice] = useState(false);
  const [language, setLanguage] = useState<Language>("id");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [appBooting, setAppBooting] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("memuat data");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const t = copy[language];

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("darinol-language");
    const storedTheme = window.localStorage.getItem("darinol-theme");

    if (storedLanguage === "id" || storedLanguage === "en") {
      setLanguage(storedLanguage);
    }

    if (storedTheme === "light" || storedTheme === "dark") {
      setThemeMode(storedTheme);
    }

    const timer = window.setTimeout(() => {
      setAppBooting(false);
    }, 950);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
    window.localStorage.setItem("darinol-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    window.localStorage.setItem("darinol-language", language);
  }, [language]);

  useEffect(() => {
    let active = true;

    async function loadTrends() {
      try {
        const response = await fetch("/api/trends");
        const payload = (await response.json()) as {
          source: string;
          updatedAt: string;
          topics: Topic[];
        };

        if (!active) return;

        if (payload.topics?.length) {
          setTopics(payload.topics);
          setSelectedId(payload.topics[0].id);
          setUpdatedAt(
            new Intl.DateTimeFormat("id-ID", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(payload.updatedAt)),
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
    setActiveDetailTab("Konten");
    setContentLoading(true);
    window.setTimeout(() => {
      setContentLoading(false);
    }, 1400);
  }

  function handleDetailTabChange(tab: string) {
    if (tab === "Konten" && selectedArticles.length) {
      startContentLoading();
      return;
    }

    setActiveDetailTab(tab);
    setContentLoading(false);
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

  function handleChoosePlan(plan: Plan) {
    if (plan === "Supporter") {
      setPaymentOpen(true);
      setUpgradeNotice(false);
      return;
    }

    setSelectedPlan(plan);
    setUpgradeNotice(false);
  }

  function handlePaymentComplete() {
    setSelectedPlan("Supporter");
    setPaymentOpen(false);
    setUpgradeNotice(false);
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-dvh w-full flex-col px-3 py-3 sm:px-4 md:px-5 lg:h-dvh lg:px-6 lg:py-5"
    >
      <Header
        search={search}
        onSearchChange={setSearch}
        updatedAt={updatedAt}
        selectedPlan={selectedPlan}
        savedCount={savedTopicIds.length}
        hotNewsItems={hotNewsItems}
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

      <motion.div
        variants={staggerList}
        initial="hidden"
        animate="show"
        className="grid min-h-0 flex-1 gap-4 md:grid-cols-[minmax(300px,340px)_minmax(0,1fr)] xl:grid-cols-[minmax(330px,360px)_minmax(0,1fr)]"
      >
        <section className="min-h-0 md:flex md:flex-col">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-darinol-text">
              {t.trending}
            </h2>
            <span className="text-sm font-medium text-darinol-muted">
              {filteredTopics.length} {t.topics}
            </span>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
            {categoryFilters.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleSelectCategory(category)}
                className={[
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition",
                  activeCategory === category
                    ? "border-darinol-primary bg-darinol-primary text-white"
                    : "border-darinol-border bg-darinol-surface text-darinol-muted hover:border-darinol-primary/40 hover:text-darinol-text",
                ].join(" ")}
              >
                {category === "Semua" ? t.all : category}
              </button>
            ))}
          </div>

          <motion.div
            variants={staggerList}
            className="grid gap-3 sm:grid-cols-2 md:min-h-0 md:flex-1 md:grid-cols-1 md:overflow-y-auto md:pr-1"
          >
            {filteredTopics.map((topic, index) => (
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

        </section>

        <DetailPanel
          topic={selectedTopic}
          selectedArticles={selectedArticles}
          selectedArticleUrls={selectedArticleUrls}
          contentLoading={contentLoading}
          selectedPlan={selectedPlan}
          t={t}
          activeTab={activeDetailTab}
          onTabChange={handleDetailTabChange}
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
      </motion.div>

      {appBooting ? <AppLoadingOverlay t={t} /> : null}
      {paymentOpen ? (
        <PaymentModal
          t={t}
          onClose={() => setPaymentOpen(false)}
          onPaid={handlePaymentComplete}
        />
      ) : null}
      {!appBooting && !selectedPlan && !paymentOpen ? (
        <OnboardingOverlay
          onChoosePlan={handleChoosePlan}
          language={language}
          t={t}
        />
      ) : null}
    </motion.main>
  );
}

