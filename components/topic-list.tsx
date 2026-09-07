"use client";

import { useEffect, useRef } from "react";
import { ChevronRightIcon, SearchIcon } from "./icons";
import { TopicRow } from "./topic-row";
import { TopicRowSkeleton } from "./skeletons";
import { getCategoryStyle } from "@/lib/categories";
import { newsCategoryFilters } from "@/lib/copy";
import type { Copy, Language } from "@/lib/copy";
import type { RadarFilter, Topic } from "@/lib/types";

// Reordering these adjusts which categories get the always-visible quick tab;
// the rest fold into the "Semua Kategori" overflow select.
const PRIMARY_NEWS_CATEGORIES = ["Technology", "Crypto", "Business", "Politics"];

export function TopicList({
  topics,
  totalCount,
  selectedTopicId,
  activeRadar,
  selectedCategories,
  onCategoryPreferenceChange,
  onResetCategories,
  onRadarChange,
  categoryFilters,
  activeCategory,
  onCategoryChange,
  onSelectTopic,
  loading,
  search,
  onSearchChange,
  language,
  t,
}: {
  topics: Topic[];
  totalCount: number;
  selectedTopicId: string | null;
  activeRadar: RadarFilter;
  selectedCategories: string[];
  onCategoryPreferenceChange: (category: string) => void;
  onResetCategories: () => void;
  onRadarChange: (radar: RadarFilter) => void;
  categoryFilters: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onSelectTopic: (topicId: string) => void;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  language: Language;
  t: Copy;
}) {
  // Once topics have loaded once, a background refresh must not blank the
  // list back to a skeleton — that reads as the page resetting.
  const showSkeleton = loading && totalCount === 0;
  const chipStripRef = useRef<HTMLDivElement | null>(null);
  const primaryCategories = PRIMARY_NEWS_CATEGORIES.filter((category) =>
    categoryFilters.includes(category),
  );
  const overflowCategories = categoryFilters.filter(
    (category) => category !== "Semua" && !primaryCategories.includes(category),
  );
  const isNewsCategorySet = activeRadar !== "culture";

  // The chip strip scrolls horizontally, so the active filter can end up off
  // screen — keep it visible or the user cannot tell what is filtered.
  useEffect(() => {
    const active = chipStripRef.current?.querySelector('[aria-pressed="true"]');

    active?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activeCategory, categoryFilters]);

  return (
    <section
      aria-label={t.radarTab}
      className="glass-card flex flex-col overflow-hidden rounded-2xl"
    >
      <header className="border-b border-darinol-border/60 p-4 sm:p-5">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold tracking-tight text-darinol-text">{t.radarTab}</h2>
          <span className="text-[11px] font-semibold tabular-nums text-darinol-muted">
            {totalCount} {t.topics}
          </span>
        </div>

        <label className="relative mb-4 block md:hidden">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-darinol-muted">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            className="h-10 w-full rounded-full border border-darinol-border bg-darinol-surface/70 pl-9 pr-3 text-sm text-darinol-text placeholder:text-darinol-muted focus:border-darinol-primary focus:outline-none focus:ring-2 focus:ring-darinol-primary/25"
          />
        </label>

        <details className="group mb-4 rounded-xl border border-darinol-border/60 bg-darinol-surface/40">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5">
            <span className="text-xs font-semibold text-darinol-text">{t.categoryPreferences}</span>
            <span className="text-[11px] font-medium text-darinol-muted group-open:hidden">{t.expand}</span>
          </summary>
          <div className="px-3 pb-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] leading-relaxed text-darinol-muted">
                {t.categoryPreferencesHint}
              </p>
              {selectedCategories.length ? (
                <button
                  type="button"
                  onClick={onResetCategories}
                  className="shrink-0 text-[11px] font-semibold text-darinol-primaryInk underline-offset-2 hover:underline"
                >
                  {t.resetCategories}
                </button>
              ) : null}
            </div>
            <div className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 py-1">
              {newsCategoryFilters
                .filter((category) => category !== "Semua")
                .map((category) => {
                  const selected = selectedCategories.includes(category);
                  const style = getCategoryStyle(category, false);

                  return (
                    <button
                      key={`preference-${category}`}
                      type="button"
                      onClick={() => onCategoryPreferenceChange(category)}
                      aria-pressed={selected}
                      className={[
                        "tap-target flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold transition",
                        selected
                          ? "border-darinol-primary bg-darinol-primary/10 text-darinol-primaryInk"
                          : "border-darinol-border bg-darinol-surface/50 text-darinol-muted hover:border-darinol-primary/40 hover:text-darinol-text",
                      ].join(" ")}
                    >
                      <span className={["h-1.5 w-1.5 rounded-full", style.dot].join(" ")} aria-hidden="true" />
                      {category}
                    </button>
                  );
                })}
            </div>
          </div>
        </details>

        <div
          role="group"
          aria-label={t.radarSwitcher}
          className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-darinol-muted/10 p-1"
        >
          {(
            [
              ["news", t.newsRadar],
              ["culture", t.cultureRadar],
              ["all", t.allRadar],
            ] as const
          ).map(([radar, label]) => (
            <button
              key={radar}
              type="button"
              onClick={() => onRadarChange(radar)}
              aria-pressed={activeRadar === radar}
              className={[
                "tap-target h-9 rounded-lg text-xs font-semibold transition",
                activeRadar === radar
                  ? "bg-darinol-surface text-darinol-text shadow-sm"
                  : "text-darinol-muted hover:text-darinol-text",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="mb-3 text-xs font-medium leading-relaxed text-darinol-muted">
          {activeRadar === "culture"
            ? t.cultureRadarHint
            : activeRadar === "news"
              ? t.newsRadarHint
              : t.allRadarHint}
        </p>

        <div ref={chipStripRef} className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 py-1.5">
          {isNewsCategorySet ? (
            <>
              {["Semua", ...primaryCategories].map((category) => {
                const active = activeCategory === category;
                const style = getCategoryStyle(category, false);
                const isAll = category === "Semua";

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onCategoryChange(category)}
                    aria-pressed={active}
                    className={[
                      "tap-target flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold transition",
                      active
                        ? "border-darinol-text bg-darinol-text text-darinol-background"
                        : "border-darinol-border bg-darinol-surface/50 text-darinol-muted hover:border-darinol-primary/40 hover:text-darinol-text",
                    ].join(" ")}
                  >
                    {!isAll ? (
                      <span
                        className={["h-1.5 w-1.5 rounded-full", active ? "bg-darinol-background" : style.dot].join(" ")}
                        aria-hidden="true"
                      />
                    ) : null}
                    {isAll ? t.all : category}
                  </button>
                );
              })}
            </>
          ) : (
            categoryFilters.map((category) => {
              const active = activeCategory === category;
              const style = getCategoryStyle(category, activeRadar === "culture");
              const isAll = category === "Semua";

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryChange(category)}
                  aria-pressed={active}
                  className={[
                    "tap-target flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold transition",
                    active
                      ? "border-darinol-text bg-darinol-text text-darinol-background"
                      : "border-darinol-border bg-darinol-surface/50 text-darinol-muted hover:border-darinol-primary/40 hover:text-darinol-text",
                  ].join(" ")}
                >
                  {!isAll ? (
                    <span
                      className={[
                        "h-1.5 w-1.5 rounded-full",
                        active ? "bg-darinol-background" : style.dot,
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  ) : null}
                  {isAll ? t.all : category.replace(/_/g, " ")}
                </button>
              );
            })
          )}
        </div>

        {isNewsCategorySet && overflowCategories.length ? (
          <details className="group relative mt-2">
            <summary
              aria-label={t.categoryDropdownLabel}
              className="flex min-h-10 w-full cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-darinol-border bg-darinol-surface/40 px-3 text-xs font-semibold text-darinol-muted transition hover:border-darinol-primary/40 hover:text-darinol-text focus:outline-none"
            >
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-darinol-primary" aria-hidden="true" />
                {overflowCategories.includes(activeCategory) ? activeCategory : t.moreCategories}
              </span>
              <ChevronRightIcon className="h-3.5 w-3.5 rotate-90 transition group-open:-rotate-90" />
            </summary>
            <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-darinol-border bg-darinol-surface p-1.5 shadow-[0_16px_36px_rgba(8,12,16,0.28)]">
              <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-darinol-muted">
                {t.moreCategories}
              </p>
              <div className="grid gap-1 sm:grid-cols-2">
                {overflowCategories.map((category) => {
                  const active = activeCategory === category;
                  const style = getCategoryStyle(category, false);

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => onCategoryChange(category)}
                      aria-pressed={active}
                      className={[
                        "flex min-h-10 items-center gap-2 rounded-lg px-2.5 text-left text-xs font-semibold transition",
                        active
                          ? "bg-darinol-primary/10 text-darinol-primaryInk"
                          : "text-darinol-muted hover:bg-darinol-surfaceRaised hover:text-darinol-text",
                      ].join(" ")}
                    >
                      <span className={["h-1.5 w-1.5 rounded-full", style.dot].join(" ")} aria-hidden="true" />
                      <span className="flex-1">{category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </details>
        ) : null}
      </header>

      {/*
        The inner scroll area only exists from lg up, where this column is a
        sticky sidebar. Capping it on mobile created a scroll trap: the page and
        the list competed for the same drag.
      */}
      <div className="space-y-1 p-3 lg:max-h-[calc(100dvh-18rem)] lg:overflow-y-auto">
        {showSkeleton ? (
          <TopicRowSkeleton count={8} t={t} />
        ) : totalCount === 0 ? (
          <div className="px-3 py-10 text-center">
            <p className="font-heading text-sm font-semibold text-darinol-text">{t.noTopicTitle}</p>
            <p className="mt-1.5 text-xs text-darinol-muted">{t.noTopicBody}</p>
          </div>
        ) : (
          topics.map((topic, index) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              rank={index + 1}
              isPrimary={index === 0}
              selected={topic.id === selectedTopicId}
              language={language}
              onClick={() => onSelectTopic(topic.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
