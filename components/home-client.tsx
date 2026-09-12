"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { LatestFeed } from "@/components/latest-feed";
import { TopicDetail } from "@/components/topic-detail";
import { TopicList } from "@/components/topic-list";
import { TrendAgent } from "@/components/trend-agent";
import { AlertIcon, RefreshIcon } from "@/components/icons";
import { type Language, type MainView, type ThemeMode, copy, cultureCategoryFilters, newsCategoryFilters } from "@/lib/copy";
import { buildLatestFeed, formatClock } from "@/lib/format";
import type { RadarFilter, Topic, TrendsPayload } from "@/lib/types";

const CACHE_PREFIX = "darinol-trends-cache-v4";
const CACHE_TTL_MS = 5 * 60 * 1000;
type CachedPayload = TrendsPayload & { cachedAt?: number };

type HomeClientProps = { initialPayload: TrendsPayload };

export default function HomeClient({ initialPayload }: HomeClientProps) {
  const initialRadar = initialPayload.radar_type === "culture" ? "culture" : "news";
  const [topics, setTopics] = useState<Topic[]>(initialPayload.topics ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(initialPayload.topics?.[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [activeRadar, setActiveRadar] = useState<RadarFilter>(initialRadar);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<MainView>("radar");
  const [language, setLanguage] = useState<Language>("id");
  // Dark is the intended premium default; a stored preference still wins.
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(!initialPayload.topics?.length);
  const [loadFailed, setLoadFailed] = useState(false);
  const [updatedAtIso, setUpdatedAtIso] = useState(initialPayload.updatedAt ?? "");
  const requestRef = useRef(0);
  const initialPayloadRef = useRef(initialPayload);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const t = copy[language];

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("darinol-language");
    const storedTheme = window.localStorage.getItem("darinol-theme");
    const storedCategories = window.localStorage.getItem("darinol-category-preferences");
    if (storedLanguage === "id" || storedLanguage === "en") setLanguage(storedLanguage);
    if (storedTheme === "light" || storedTheme === "dark") setThemeMode(storedTheme);
    if (storedCategories) {
      try {
        const parsed = JSON.parse(storedCategories);
        if (Array.isArray(parsed) && parsed.every((category) => typeof category === "string")) {
          setSelectedCategories(parsed);
        }
      } catch {
        window.localStorage.removeItem("darinol-category-preferences");
      }
    }
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
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
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(
      "darinol-category-preferences",
      JSON.stringify(selectedCategories),
    );
  }, [selectedCategories]);

  const applyPayload = useCallback((payload: TrendsPayload) => {
    if (!payload.topics?.length) return;
    setTopics(payload.topics);
    setSelectedId((currentId) => currentId && payload.topics.some((topic) => topic.id === currentId) ? currentId : payload.topics[0].id);
    setUpdatedAtIso(payload.updatedAt);
  }, []);

  const loadTrends = useCallback(async (radar: RadarFilter, options: { skipCache?: boolean } = {}) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    const cacheKey = `${CACHE_PREFIX}-${radar}`;
    setLoading(true);
    setLoadFailed(false);

    if (!options.skipCache) {
      try {
        const cachedValue = window.localStorage.getItem(cacheKey);
        if (cachedValue) {
          const cached = JSON.parse(cachedValue) as CachedPayload;
          if (cached.cachedAt && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
            applyPayload(cached);
            setLoading(false);
          }
        }
      } catch {
        window.localStorage.removeItem(cacheKey);
      }
    }

    try {
      const response = await fetch(`/api/trends?radar_type=${radar}`, { cache: options.skipCache ? "no-store" : "default" });
      const payload = (await response.json()) as TrendsPayload;
      if (requestRef.current !== requestId) return;
      if (!payload.topics?.length) throw new Error("Empty trends payload");
      applyPayload(payload);
      window.localStorage.setItem(cacheKey, JSON.stringify({ ...payload, cachedAt: Date.now() }));
    } catch {
      if (requestRef.current !== requestId) return;
      setLoadFailed(true);
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  }, [applyPayload]);

  useEffect(() => {
    if (activeRadar === initialRadar && initialPayloadRef.current.topics?.length) {
      try {
        window.localStorage.setItem(`${CACHE_PREFIX}-${initialRadar}`, JSON.stringify({ ...initialPayloadRef.current, cachedAt: Date.now() }));
      } catch {
        // The server-rendered payload remains usable when storage is unavailable.
      }
      initialPayloadRef.current = { ...initialPayloadRef.current, topics: [] };
      return;
    }
    void loadTrends(activeRadar);
  }, [activeRadar, initialRadar, loadTrends]);

  const query = search.trim().toLowerCase();
  const filteredTopics = useMemo(() => topics.filter((topic) => {
    const matchesRadar = activeRadar === "all" || topic.radar_type === activeRadar;
    const searchable = `${topic.name} ${topic.category} ${topic.culture_category ?? ""} ${topic.articles.map((article) => article.title).join(" ")}`.toLowerCase();
    const matchesSearch = !query || searchable.includes(query);
    const matchesCategory = activeCategory === "Semua" || topic.category === activeCategory || topic.culture_category === activeCategory;
    const matchesPreference =
      selectedCategories.length === 0 ||
      topic.radar_type === "culture" ||
      selectedCategories.includes(topic.category);
    return matchesRadar && matchesSearch && matchesCategory && matchesPreference;
  }), [activeCategory, activeRadar, query, selectedCategories, topics]);

  const latestFeed = useMemo(() => {
    const feed = buildLatestFeed(filteredTopics, isMobile ? 40 : 90);
    if (!query) return feed;
    return feed.filter((article) => `${article.title} ${article.source} ${article.topicName}`.toLowerCase().includes(query));
  }, [filteredTopics, isMobile, query]);

  const selectedTopic = filteredTopics.find((topic) => topic.id === selectedId) ?? filteredTopics[0] ?? null;
  const categoryFilters = useMemo(() => {
    if (activeRadar !== "culture") return newsCategoryFilters;
    const availableCategories = new Set(topics.filter((topic) => topic.radar_type === "culture" && topic.culture_category).map((topic) => topic.culture_category as string));
    return [cultureCategoryFilters[0], ...cultureCategoryFilters.slice(1).filter((category) => availableCategories.has(category))];
  }, [activeRadar, topics]);

  useEffect(() => {
    if (!categoryFilters.includes(activeCategory)) setActiveCategory("Semua");
  }, [activeCategory, categoryFilters]);

  function handleSelectRadar(radar: RadarFilter) {
    setActiveRadar(radar);
    setActiveCategory("Semua");
    setSelectedId(null);
  }

  function handleCategoryPreferenceChange(category: string) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  function handleResetCategories() {
    setSelectedCategories([]);
  }

  function handleSelectTopic(topicId: string) {
    setSelectedId(topicId);
    if (isMobile) window.requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function handleNextTopic() {
    if (!filteredTopics.length) return;
    const currentIndex = filteredTopics.findIndex((topic) => topic.id === selectedTopic?.id);
    setSelectedId(filteredTopics[(currentIndex + 1) % filteredTopics.length].id);
  }

  const totalArticles = filteredTopics.reduce((total, topic) => total + (topic.total_articles ?? topic.articles.length), 0);
  const totalSources = filteredTopics.reduce((total, topic) => total + (topic.total_sources ?? new Set(topic.articles.map((article) => article.source)).size), 0);
  const highestScore = filteredTopics[0]?.culture_score ?? filteredTopics[0]?.score ?? 0;
  const highestTopic = filteredTopics[0]?.name ?? "—";

  return (
    <div className="min-h-screen bg-darinol-background">
      <a href="#main" className="skip-link">{t.skipToContent}</a>
      <AppShell search={search} onSearchChange={setSearch} updatedAt={updatedAtIso ? formatClock(updatedAtIso, language) : "—"} onRefresh={() => void loadTrends(activeRadar, { skipCache: true })} refreshing={loading} activeView={activeView} onViewChange={setActiveView} language={language} onLanguageChange={setLanguage} themeMode={themeMode} onThemeToggle={() => setThemeMode((currentTheme) => currentTheme === "dark" ? "light" : "dark")} t={t} />
      <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9 xl:px-14">
        {loadFailed ? <div role="alert" className="mb-6 flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-sm font-medium text-darinol-text"><AlertIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />{t.loadFailed}</p><button type="button" onClick={() => void loadTrends(activeRadar, { skipCache: true })} className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-darinol-primaryFill px-4 text-xs font-semibold text-white"><RefreshIcon className="h-3.5 w-3.5" />{t.refresh}</button></div> : null}
        <main id="main" className="mx-auto w-full max-w-[1440px]">
          <header className="border-b border-darinol-border/70 pb-6"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="text-xs font-medium text-darinol-muted">Darinol / <span className="text-darinol-text">{activeView === "radar" ? t.radarTab : t.latestTab}</span></p><h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-darinol-text sm:text-4xl">{activeView === "radar" ? "Sinyal tren hari ini" : t.latestTab}</h1></div><label className="relative hidden w-full max-w-sm lg:block"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-darinol-muted">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} aria-label={t.search} className="h-10 w-full rounded-lg border border-darinol-border bg-darinol-surface pl-9 pr-3 text-sm text-darinol-text placeholder:text-darinol-muted focus:border-darinol-primary focus:outline-none focus:ring-2 focus:ring-darinol-primary/25" /></label></div></header>
          {activeView === "radar" ? <><section className="grid gap-3 py-6 sm:grid-cols-3" aria-label="Ringkasan radar"><div className="rounded-xl border border-darinol-border/70 bg-darinol-surface p-4"><p className="text-xs font-medium text-darinol-muted">Skor tertinggi</p><p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-darinol-primaryInk">{highestScore}</p><p className="mt-1 text-xs text-darinol-muted">{highestTopic}</p></div><div className="rounded-xl border border-darinol-border/70 bg-darinol-surface p-4"><p className="text-xs font-medium text-darinol-muted">Sumber aktif</p><p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-darinol-text">{totalSources}</p><p className="mt-1 text-xs text-darinol-success">Dari topik yang terpantau</p></div><div className="rounded-xl border border-darinol-border/70 bg-darinol-surface p-4"><p className="text-xs font-medium text-darinol-muted">Berita masuk</p><p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-darinol-text">{totalArticles}</p><p className="mt-1 text-xs text-darinol-muted">Update berkala</p></div></section><section id="radar-section" className="scroll-mt-6"><div className="mb-4 flex items-center justify-between gap-4"><div><h2 className="font-heading text-xl font-semibold text-darinol-text">Radar topik</h2><p className="mt-1 text-sm text-darinol-muted">Pilih sinyal untuk melihat berita dan sumber terkait.</p></div><span className="hidden text-xs font-semibold text-darinol-primaryInk sm:block">{filteredTopics.length} sinyal terpantau</span></div><div className="grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]"><TopicList topics={filteredTopics} totalCount={filteredTopics.length} selectedTopicId={selectedTopic?.id ?? null} activeRadar={activeRadar} selectedCategories={selectedCategories} onCategoryPreferenceChange={handleCategoryPreferenceChange} onResetCategories={handleResetCategories} onRadarChange={handleSelectRadar} categoryFilters={categoryFilters} activeCategory={activeCategory} onCategoryChange={setActiveCategory} onSelectTopic={handleSelectTopic} loading={loading} search={search} onSearchChange={setSearch} language={language} t={t} /><div ref={detailRef} className="lg:sticky lg:top-7"><TopicDetail topic={selectedTopic} loading={loading} language={language} onNextTopic={handleNextTopic} t={t} /></div></div></section></> : <section className="pt-6"><LatestFeed articles={latestFeed} loading={loading} language={language} t={t} /></section>}
        </main>
      </div>
      <TrendAgent topics={filteredTopics} language={language} />
    </div>
  );
}