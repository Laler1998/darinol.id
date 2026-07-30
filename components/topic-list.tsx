"use client";

import { useEffect, useRef } from "react";
import { SearchIcon } from "./icons";
import { TopicRow } from "./topic-row";
import { TopicRowSkeleton } from "./skeletons";
import { getCategoryStyle } from "@/lib/categories";
import type { Copy, Language } from "@/lib/copy";
import type { RadarFilter, Topic } from "@/lib/types";

export function TopicList({
  topics,
  totalCount,
  selectedTopicId,
  activeRadar,
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
  const showSkeleton = loading && topics.length === 0;
  const chipStripRef = useRef<HTMLDivElement | null>(null);

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
      <header className="border-b border-darinol-border/60 p-3">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="font-heading text-base font-semibold text-darinol-text">{t.radarTab}</h2>
          <span className="text-[11px] font-semibold tabular-nums text-darinol-muted">
            {totalCount} {t.topics}
          </span>
        </div>

        <label className="relative mb-3 block md:hidden">
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

        <div
          role="group"
          aria-label={t.radarSwitcher}
          className="mb-2.5 grid grid-cols-3 gap-1 rounded-xl bg-darinol-muted/10 p-1"
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

        <p className="mb-2.5 text-[11px] font-medium leading-relaxed text-darinol-muted">
          {activeRadar === "culture"
            ? t.cultureRadarHint
            : activeRadar === "news"
              ? t.newsRadarHint
              : t.allRadarHint}
        </p>

        <div ref={chipStripRef} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1.5">
          {categoryFilters.map((category) => {
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
          })}
        </div>
      </header>

      {/*
        The inner scroll area only exists from lg up, where this column is a
        sticky sidebar. Capping it on mobile created a scroll trap: the page and
        the list competed for the same drag.
      */}
      <div className="space-y-0.5 p-2 lg:max-h-[calc(100dvh-15rem)] lg:overflow-y-auto">
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
