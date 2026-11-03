"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { LatestFeed } from "@/components/latest-feed";
import { TopicDetail } from "@/components/topic-detail";
import { TopicList } from "@/components/topic-list";
import { TrendAgent } from "@/components/trend-agent";
import { SignalRadar } from "@/components/signal-radar";
import { RadarOverview } from "@/components/radar-overview";
import { SponsorCard } from "@/components/sponsor-card";
import { AlertIcon, RefreshIcon } from "@/components/icons";
import { type Language, type MainView, type ThemeMode, copy, cultureCategoryFilters, newsCategoryFilters } from "@/lib/copy";
import { buildLatestFeed, getTopicLabel } from "@/lib/format";
import { getCategoryStyle } from "@/lib/categories";
import { trackFunnel } from "@/lib/analytics";
import type { SponsorSlots } from "@/lib/sponsors";
import type { RadarFilter, Topic, TrendsPayload } from "@/lib/types";

const CACHE_PREFIX = "darinol-trends-cache-v4";
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
type CachedPayload = TrendsPayload & { cachedAt?: number };

type HomeClientProps = { initialPayload: TrendsPayload; initialSponsors: SponsorSlots };

export default function HomeClient({ initialPayload, initialSponsors }: HomeClientProps) {
  const initialRadar: RadarFilter = initialPayload.radar_type === "culture" || initialPayload.radar_type === "world" ? initialPayload.radar_type : "news";
  const [topics, setTopics] = useState<Topic[]>(initialPayload.topics ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(initialPayload.topics?.[0]?.id ?? null);
  const [showSelectedDetail, setShowSelectedDetail] = useState(false);
  const [showAgent, setShowAgent] = useState(false);
  const [search, setSearch] = useState("");
  const [activeRadar, setActiveRadar] = useState<RadarFilter>(initialRadar);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [topicFeedback, setTopicFeedback] = useState<Record<string, "relevant" | "not_relevant">>({});
  const [activeView, setActiveView] = useState<MainView>(initialRadar === "culture" ? "culture" : initialRadar === "world" ? "world" : "radar");
  const [language, setLanguage] = useState<Language>("id");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(!initialPayload.topics?.length);
  const [loadFailed, setLoadFailed] = useState(false);
  const [updatedAtIso, setUpdatedAtIso] = useState(initialPayload.updatedAt ?? "");
  const [dataSource, setDataSource] = useState(initialPayload.source);
  const [showStaleData, setShowStaleData] = useState(false);
  const requestRef = useRef(0);
  const initialPayloadRef = useRef(initialPayload);
  const detailRef = useRef<HTMLDialogElement | null>(null);
  const firstSignalTrackedRef = useRef(false);
  const t = copy[language];

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("darinol-theme");
    const storedLanguage = window.localStorage.getItem("darinol-language");
    const storedCategories = window.localStorage.getItem("darinol-category-preferences");
    const storedMotion = window.localStorage.getItem("darinol-motion-preference");
    if (storedTheme === "light" || storedTheme === "dark") setThemeMode(storedTheme);
    if (storedLanguage === "id" || storedLanguage === "en") setLanguage(storedLanguage);
    setMotionEnabled(storedMotion === "on" || (storedMotion !== "off" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches));
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
    const dialog = detailRef.current;
    if (!dialog) return;
    if (showSelectedDetail && !dialog.open) dialog.showModal();
    if (!showSelectedDetail && dialog.open) dialog.close();
  }, [showSelectedDetail]);

  useEffect(() => {
    const syncTopicFeedback = () => {
      try {
        const value = JSON.parse(window.localStorage.getItem("darinol-topic-feedback-v1") ?? "{}");
        setTopicFeedback(value && typeof value === "object" && !Array.isArray(value) ? value : {});
      } catch {
        window.localStorage.removeItem("darinol-topic-feedback-v1");
        setTopicFeedback({});
      }
    };
    syncTopicFeedback();
    window.addEventListener("darinol:topic-feedback", syncTopicFeedback);
    return () => window.removeEventListener("darinol:topic-feedback", syncTopicFeedback);
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
        applyPayload({
          ...cached,
          topics: cached.topics.map((topic) => topic.data_status === "live"
            ? { ...topic, data_status: "stale" }
            : topic),
        });
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
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadTrends(activeRadar, { skipCache: true });
      }
    }, CACHE_TTL_MS);

    return () => window.clearInterval(interval);
  }, [activeRadar, loadTrends]);

  useEffect(() => {
    if (!topics.length || firstSignalTrackedRef.current) return;
    firstSignalTrackedRef.current = true;
    trackFunnel("first_signal_visible", { radar: activeRadar, source: dataSource, signal_count: topics.length, stale: showStaleData });
  }, [activeRadar, dataSource, showStaleData, topics.length]);

  const query = search.trim().toLowerCase();
  const filteredTopics = useMemo(() => topics.filter((topic) => {
    const matchesRadar = activeRadar === "all" || (activeRadar === "world" ? topic.market === "world" : topic.radar_type === activeRadar);
    const searchable = `${topic.name} ${topic.category} ${topic.culture_category ?? ""} ${topic.articles.map((article) => article.title).join(" ")}`.toLowerCase();
    const matchesSearch = !query || searchable.includes(query);
    const matchesCategory = activeCategory === "Semua" || topic.category === activeCategory || topic.culture_category === activeCategory;
    const preferenceOptions = topic.radar_type === "culture"
      ? cultureCategoryFilters.slice(1)
      : newsCategoryFilters.slice(1);
    const activePreferences = selectedCategories.filter((category) => preferenceOptions.includes(category));
    const topicPreference = topic.radar_type === "culture"
      ? topic.culture_category ?? ""
      : topic.category;
    const matchesPreference = activePreferences.length === 0 || activePreferences.includes(topicPreference);
    return matchesRadar && matchesSearch && matchesCategory && matchesPreference;
  }).sort((left, right) => {
    const weight = (topicId: string) => topicFeedback[topicId] === "relevant" ? 1 : topicFeedback[topicId] === "not_relevant" ? -1 : 0;
    return weight(right.id) - weight(left.id);
  }), [activeCategory, activeRadar, query, selectedCategories, topicFeedback, topics]);

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

  function handleMotionToggle() {
    setMotionEnabled((current) => {
      const next = !current;
      window.localStorage.setItem("darinol-motion-preference", next ? "on" : "off");
      return next;
    });
  }

  function handleSelectTopic(topicId: string) {
    setSelectedId(topicId);
    setShowSelectedDetail(true);
    const topic = filteredTopics.find((item) => item.id === topicId);
    trackFunnel("signal_opened", { radar: activeRadar, topic: topic?.name ?? topicId, category: topic?.category ?? "unknown" });
  }

  function handleNextTopic() {
    if (!filteredTopics.length) return;
    const currentIndex = filteredTopics.findIndex((topic) => topic.id === selectedTopic?.id);
    setSelectedId(filteredTopics[(currentIndex + 1) % filteredTopics.length].id);
  }

  const totalArticles = filteredTopics.reduce((total, topic) => total + (topic.total_articles ?? topic.articles.length), 0);
  const totalSources = filteredTopics.reduce((total, topic) => total + (topic.total_sources ?? new Set(topic.articles.map((article) => article.source)).size), 0);
  const rankedTopics = filteredTopics.slice(3, 8);
  const recentTopics = filteredTopics.slice(8);
  return (
    <div className={`terminal-home terminal-home--${themeMode} ${motionEnabled ? "terminal-home--motion-on" : "terminal-home--motion-off"} min-h-screen pb-24 sm:pb-28`}>
      <a href="#main" className="skip-link">{t.skipToContent}</a>
      <AppShell search={search} onSearchChange={setSearch} updatedAtIso={updatedAtIso} onRefresh={() => { trackFunnel("radar_refresh_requested", { radar: activeRadar }); void loadTrends(activeRadar, { skipCache: true }); }} refreshing={loading} activeView={activeView} onViewChange={setActiveView} language={language} onLanguageChange={setLanguage} themeMode={themeMode} onThemeToggle={() => setThemeMode((currentTheme) => currentTheme === "dark" ? "light" : "dark")} activeRadar={activeRadar} onRadarChange={handleSelectRadar} t={t} />
      <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9 xl:px-14">
        {showStaleData || dataSource.includes("fallback") || dataSource.includes("sample") ? <div role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-medium text-darinol-muted"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />{showStaleData ? t.staleDataNotice : t.fallbackDataNotice}</div> : null}{loadFailed ? <div role="alert" className="mb-6 flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-sm font-medium text-darinol-text"><AlertIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />{t.loadFailed}</p><button type="button" onClick={() => void loadTrends(activeRadar, { skipCache: true })} className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-darinol-primaryFill px-4 text-xs font-semibold text-white"><RefreshIcon className="h-3.5 w-3.5" />{t.refresh}</button></div> : null}
        <main id="main" className="w-full">
          {activeView === "latest" ? <section key="latest" className="page-view-enter latest-page">
            <header className="latest-page-heading"><p>{t.brandName} / {t.latestTab}</p><h1>{t.latestTab}</h1></header>
            <LatestFeed articles={latestFeed} loading={loading} language={language} t={t} />
          </section> : <div key={activeView} data-page={activeView} className="page-view-enter">
            <section className="radar-hero">
              <div className="radar-hero-copy">
                <p>{t.brandName} / {activeView === "world" ? t.worldRadar : activeView === "culture" ? t.cultureRadar : t.newsRadar}</p>
                <h1>{activeView === "world" ? "Radar Dunia" : activeView === "culture" ? "Radar Sosial & Kreator" : "Radar Tren Indonesia"}</h1>
                <div className="radar-hero-actions">
                  <span>{t.heroTagline}</span>
                  <button type="button" onClick={() => setShowAgent(true)} aria-expanded={showAgent}>
                    <span aria-hidden="true">AI</span>{t.heroAiCta}
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={motionEnabled}
                    aria-label={t.motionControl}
                    className="motion-toggle"
                    onClick={handleMotionToggle}
                  >
                    <span className="motion-toggle-track" aria-hidden="true"><span /></span>
                    <span>{motionEnabled ? t.motionOn : t.motionOff}</span>
                  </button>
                </div>
              </div>
              <div className="radar-hero-visual"><SignalRadar topics={filteredTopics} /></div>
            </section>
            <section id="radar-section" className="radar-workspace scroll-mt-6">
              <div className="radar-primary-column">
                <TopicList topics={filteredTopics} totalCount={filteredTopics.length} selectedTopicId={selectedTopic?.id ?? null} activeRadar={activeRadar} isCulture={activeView === "culture"} selectedCategories={selectedCategories} onCategoryPreferenceChange={handleCategoryPreferenceChange} onResetCategories={handleResetCategories} onRadarChange={handleSelectRadar} categoryFilters={categoryFilters} activeCategory={activeCategory} onCategoryChange={setActiveCategory} onSelectTopic={handleSelectTopic} loading={loading} search={search} onSearchChange={setSearch} language={language} t={t} inlineSponsor={initialSponsors["homepage-inline"]} />
              </div>
              <div className="radar-overview-column">
                <RadarOverview topics={rankedTopics} signalCount={filteredTopics.length} sourceCount={totalSources} articleCount={totalArticles} selectedTopicId={selectedTopic?.id ?? null} onSelectTopic={handleSelectTopic} language={language} />
                <SponsorCard sponsor={initialSponsors["homepage-sidebar"]} variant="compact" />
              </div>
              <section id="recent-trends" className="recent-trends">
                <header><h2>Tren Terkini</h2><span>{recentTopics.length} sinyal</span></header>
                {recentTopics.length ? <div className="recent-trends-grid">{recentTopics.map((topic, index) => {
                  const style = getCategoryStyle(topic.category, topic.radar_type === "culture");
                  return <button type="button" key={topic.id} className={"recent-trend"} onClick={() => handleSelectTopic(topic.id)} aria-current={topic.id === selectedTopic?.id ? "true" : undefined}>
                    <span className="recent-trend-rank">#{index + 9}</span>
                    <span className={["radar-overview-dot", style.dot].join(" ")} aria-hidden="true" />
                    <span className="recent-trend-name">{topic.name}</span>
                    <span className="recent-trend-category">{getTopicLabel(topic, language)}</span>
                    <span className="recent-trend-score">{topic.culture_score ?? topic.score}</span>
                  </button>;
                })}</div> : <p className="recent-trends-empty">Belum ada sinyal lanjutan.</p>}
              </section>
              <SponsorCard sponsor={initialSponsors["homepage-radar-bottom"]} variant="banner" />
            </section>
          </div>}
        </main>
      </div>
      <dialog
        ref={detailRef}
        className="radar-selected-dialog"
        aria-labelledby="radar-selected-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setShowSelectedDetail(false);
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          setShowSelectedDetail(false);
        }}
        onClose={() => setShowSelectedDetail(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setShowSelectedDetail(false);
        }}
      >
        <div className="radar-selected-dialog-inner">
          <header className="radar-selected-dialog-header">
            <div>
              <p>Detail sinyal</p>
              <h2 id="radar-selected-title">{selectedTopic?.name ?? "Pilih sinyal"}</h2>
            </div>
            <button type="button" autoFocus onClick={() => setShowSelectedDetail(false)}>Tutup</button>
          </header>
          <div key={selectedTopic?.id ?? "empty"} className="radar-selected-dialog-content topic-detail-enter">
            <TopicDetail topic={selectedTopic} loading={loading} language={language} onNextTopic={handleNextTopic} t={t} compact />
          </div>
        </div>
      </dialog>
      <TrendAgent topics={filteredTopics} language={language} open={showAgent} onOpenChange={setShowAgent} />
    </div>
  );
}
