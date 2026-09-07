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
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
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

  return (
    <div className="mx-auto w-full max-w-[1680px] px-3 pb-10 sm:px-4 md:px-5 lg:px-6">
      <a href="#main" className="skip-link">{t.skipToContent}</a>
      <AppShell search={search} onSearchChange={setSearch} updatedAt={updatedAtIso ? formatClock(updatedAtIso, language) : "—"} onRefresh={() => void loadTrends(activeRadar, { skipCache: true })} refreshing={loading} activeView={activeView} onViewChange={setActiveView} language={language} onLanguageChange={setLanguage} themeMode={themeMode} onThemeToggle={() => setThemeMode((currentTheme) => currentTheme === "dark" ? "light" : "dark")} t={t} />

      {loadFailed ? <div role="alert" className="mb-4 flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm font-medium text-darinol-text"><AlertIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />{t.loadFailed}</p>
        <button type="button" onClick={() => void loadTrends(activeRadar, { skipCache: true })} className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-darinol-primaryFill px-4 text-xs font-semibold text-white transition hover:brightness-105"><RefreshIcon className="h-3.5 w-3.5" />{t.refresh}</button>
      </div> : null}

      <header className="mb-5 max-w-3xl">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-darinol-text sm:text-3xl">{t.heroTitle}</h1>
        <p className="mt-2 text-sm leading-relaxed text-darinol-muted sm:text-base">{t.heroBody}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => handleSelectRadar("culture")} className="tap-target h-10 rounded-full bg-darinol-primaryFill px-4 text-xs font-semibold text-white transition hover:brightness-105">{t.exploreCulture}</button>
          <button type="button" onClick={() => setActiveView("latest")} className="tap-target h-10 rounded-full border border-darinol-border bg-darinol-surface/70 px-4 text-xs font-semibold text-darinol-text transition hover:border-darinol-primary/50 hover:text-darinol-primaryInk">{t.readLatest}</button>
        </div>
      </header>

      <main id="main">{activeView === "radar" ? <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
        <TopicList topics={filteredTopics} totalCount={filteredTopics.length} selectedTopicId={selectedTopic?.id ?? null} activeRadar={activeRadar} selectedCategories={selectedCategories} onCategoryPreferenceChange={handleCategoryPreferenceChange} onResetCategories={handleResetCategories} onRadarChange={handleSelectRadar} categoryFilters={categoryFilters} activeCategory={activeCategory} onCategoryChange={setActiveCategory} onSelectTopic={handleSelectTopic} loading={loading} search={search} onSearchChange={setSearch} language={language} t={t} />
        <div ref={detailRef} className="lg:sticky lg:top-32"><TopicDetail topic={selectedTopic} loading={loading} language={language} onNextTopic={handleNextTopic} t={t} /></div>
      </div> : <LatestFeed articles={latestFeed} loading={loading} language={language} t={t} />}</main>
      <TrendAgent topics={filteredTopics} language={language} />
    </div>
  );
}
