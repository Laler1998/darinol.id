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
import { trackFunnel } from "@/lib/analytics";
import type { RadarFilter, Topic, TrendsPayload } from "@/lib/types";

const CACHE_PREFIX = "darinol-trends-cache-v4";
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
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
  const [dataSource, setDataSource] = useState(initialPayload.source);
  const [showStaleData, setShowStaleData] = useState(false);
  const requestRef = useRef(0);
  const initialPayloadRef = useRef(initialPayload);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const firstSignalTrackedRef = useRef(false);
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
    setDataSource(payload.source);
  }, []);

  const getCachedPayload = useCallback((radar: RadarFilter) => {
    try {
      const cachedValue = window.localStorage.getItem(`${CACHE_PREFIX}-${radar}`);
      if (!cachedValue) return null;
      const cached = JSON.parse(cachedValue) as CachedPayload;
      if (!cached.cachedAt || Date.now() - cached.cachedAt > CACHE_MAX_AGE_MS || !cached.topics?.length) return null;
      return cached;
    } catch {
      window.localStorage.removeItem(`${CACHE_PREFIX}-${radar}`);
      return null;
    }
  }, []);
  const loadTrends = useCallback(async (radar: RadarFilter, options: { skipCache?: boolean } = {}) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    const cacheKey = `${CACHE_PREFIX}-${radar}`;
    setLoading(true);
    setLoadFailed(false);

    if (!options.skipCache) {
      const cached = getCachedPayload(radar);
      if (cached) {
        applyPayload(cached);
        setShowStaleData(true);
        setLoading(false);
      }
    }

    try {
      const response = await fetch(`/api/trends?radar_type=${radar}`, { cache: options.skipCache ? "no-store" : "default" });
      if (!response.ok) throw new Error(`Trends request failed: ${response.status}`);
      const payload = (await response.json()) as TrendsPayload;
      if (requestRef.current !== requestId) return;
      if (!payload.topics?.length) throw new Error("Empty trends payload");
      applyPayload(payload);
      window.localStorage.setItem(cacheKey, JSON.stringify({ ...payload, cachedAt: Date.now() }));
      setShowStaleData(false);
    } catch {
      if (requestRef.current !== requestId) return;
      setLoadFailed(true);
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  }, [applyPayload, getCachedPayload]);

  useEffect(() => {
    // Refresh in the background after rendering server/browser data immediately.
    void loadTrends(activeRadar);
  }, [activeRadar, loadTrends]);

  useEffect(() => {
    if (!topics.length || firstSignalTrackedRef.current) return;
    firstSignalTrackedRef.current = true;
    trackFunnel("first_signal_visible", { radar: activeRadar, source: dataSource, signal_count: topics.length, stale: showStaleData });
  }, [activeRadar, dataSource, showStaleData, topics.length]);

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
    const topic = filteredTopics.find((item) => item.id === topicId);
    trackFunnel("signal_opened", { radar: activeRadar, topic: topic?.name ?? topicId, category: topic?.category ?? "unknown" });
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
  const highestOpportunity = filteredTopics[0]?.opportunity_score ?? 0;

  return (
    <div className="min-h-screen bg-darinol-background">
      <a href="#main" className="skip-link">{t.skipToContent}</a>
      <AppShell search={search} onSearchChange={setSearch} updatedAt={updatedAtIso ? formatClock(updatedAtIso, language) : "—"} onRefresh={() => { trackFunnel("radar_refresh_requested", { radar: activeRadar }); void loadTrends(activeRadar, { skipCache: true }); }} refreshing={loading} activeView={activeView} onViewChange={setActiveView} language={language} onLanguageChange={setLanguage} themeMode={themeMode} onThemeToggle={() => setThemeMode((currentTheme) => currentTheme === "dark" ? "light" : "dark")} activeRadar={activeRadar} onRadarChange={handleSelectRadar} t={t} />
      <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9 xl:px-14">
        {showStaleData || dataSource.includes("fallback") || dataSource.includes("sample") ? <div role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-medium text-darinol-muted"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />{showStaleData ? "Menampilkan data terakhir sambil memperbarui radar." : "Sebagian data menggunakan sumber cadangan."}</div> : null}{loadFailed ? <div role="alert" className="mb-6 flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-sm font-medium text-darinol-text"><AlertIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />{t.loadFailed}</p><button type="button" onClick={() => void loadTrends(activeRadar, { skipCache: true })} className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-darinol-primaryFill px-4 text-xs font-semibold text-white"><RefreshIcon className="h-3.5 w-3.5" />{t.refresh}</button></div> : null}
        <main id="main" className="mx-auto w-full max-w-[1440px]">
          <header className="border-b border-darinol-border/70 pb-5"><div><p className="text-xs font-medium text-darinol-muted">Darinol / <span className="text-darinol-text">{activeView === "radar" ? t.radarTab : activeView === "culture" ? t.cultureRadar : t.latestTab}</span></p><h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-darinol-text sm:text-4xl">{activeView === "radar" ? "Sinyal yang layak ditindaklanjuti" : activeView === "culture" ? "Sinyal sosial yang layak dieksplorasi" : t.latestTab}</h1>{activeView !== "latest" ? <p className="mt-2 max-w-2xl text-sm text-darinol-muted">{activeView === "culture" ? "Pantau percakapan, format konten, dan peluang kreator yang sedang bergerak." : "Mulai dari sinyal teratas, pilih topik, lalu baca bukti dan sumber yang menggerakkannya."}</p> : null}</div></header>
          {activeView !== "latest" ? <div key={activeView} data-page={activeView} className="page-view-enter"><section id="radar-section" className="scroll-mt-6"><div className="space-y-5"><TopicList topics={filteredTopics} totalCount={filteredTopics.length} selectedTopicId={selectedTopic?.id ?? null} activeRadar={activeRadar} isCulture={activeView === "culture"} selectedCategories={selectedCategories} onCategoryPreferenceChange={handleCategoryPreferenceChange} onResetCategories={handleResetCategories} onRadarChange={handleSelectRadar} categoryFilters={categoryFilters} activeCategory={activeCategory} onCategoryChange={setActiveCategory} onSelectTopic={handleSelectTopic} loading={loading} search={search} onSearchChange={setSearch} language={language} t={t} /><div className="dashboard-summary"><section className="grid gap-3 py-6 sm:grid-cols-3" aria-label="Ringkasan radar"><div className="rounded-xl border border-darinol-border/70 bg-darinol-surface p-4"><p className="text-xs font-medium text-darinol-muted">{activeView === "culture" ? t.cultureScore : "Skor tertinggi"}</p><p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-darinol-primaryInk">{highestScore}</p><p className="mt-1 text-xs text-darinol-muted">{highestTopic}</p></div><div className="rounded-xl border border-darinol-border/70 bg-darinol-surface p-4"><p className="text-xs font-medium text-darinol-muted">{activeView === "culture" ? t.opportunityScore : "Sumber aktif"}</p><p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-darinol-text">{activeView === "culture" ? highestOpportunity : totalSources}</p><p className="mt-1 text-xs text-darinol-success">{activeView === "culture" ? "Peluang teratas saat ini" : "Dari topik yang terpantau"}</p></div><div className="rounded-xl border border-darinol-border/70 bg-darinol-surface p-4"><p className="text-xs font-medium text-darinol-muted">{activeView === "culture" ? "Konten terpantau" : "Berita masuk"}</p><p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-darinol-text">{totalArticles}</p><p className="mt-1 text-xs text-darinol-muted">Update berkala</p></div></section></div><div ref={detailRef} key={selectedTopic?.id ?? "empty"} className="topic-detail-enter mx-auto w-full max-w-5xl"><TopicDetail topic={selectedTopic} loading={loading} language={language} onNextTopic={handleNextTopic} t={t} /></div></div></section></div> : <section key="latest" className="page-view-enter pt-6"><LatestFeed articles={latestFeed} loading={loading} language={language} t={t} /></section>}
        </main>
      </div>
      <TrendAgent topics={filteredTopics} language={language} />
    </div>
  );
}
