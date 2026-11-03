"use client";

import { Fragment, useEffect, useRef } from "react";
import { SponsorCard } from "@/components/sponsor-card";
import type { PublicSponsor } from "@/lib/sponsors";
import { TopicRow } from "./topic-row";
import { TopicRowSkeleton } from "./skeletons";
import { getCategoryStyle } from "@/lib/categories";
import { categoryName, type Copy, type Language } from "@/lib/copy";
import type { RadarFilter, Topic } from "@/lib/types";

export function TopicList({ topics, totalCount, selectedTopicId, activeRadar, isCulture, selectedCategories, onCategoryPreferenceChange, onResetCategories, onRadarChange: _onRadarChange, categoryFilters, activeCategory, onCategoryChange, onSelectTopic, loading, language, t, inlineSponsor }: {
  topics: Topic[]; totalCount: number; selectedTopicId: string | null; activeRadar: RadarFilter; isCulture: boolean; selectedCategories: string[]; onCategoryPreferenceChange: (category: string) => void; onResetCategories: () => void; onRadarChange: (radar: RadarFilter) => void; categoryFilters: string[]; activeCategory: string; onCategoryChange: (category: string) => void; onSelectTopic: (topicId: string) => void; loading: boolean; search: string; onSearchChange: (value: string) => void; language: Language; t: Copy; inlineSponsor: PublicSponsor | null;
}) {
  const chipStripRef = useRef<HTMLDivElement | null>(null);
  const showSkeleton = loading && totalCount === 0;

  useEffect(() => {
    chipStripRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activeCategory]);
  const selectedNiches = selectedCategories.filter((category) => categoryFilters.includes(category) && category !== "Semua");

  return <section aria-label={t.radarTab} className="topic-list-layout">
    <div className="topic-filter-bar border-y border-darinol-border/70 bg-darinol-background/95 px-3 py-3 backdrop-blur xl:sticky xl:top-20 xl:z-30">
      <div className="flex w-full items-center gap-3">
        <div className="filter-label shrink-0"><p className="text-[15px] font-bold text-darinol-text">{t.categoryFilter}</p></div>
        <div ref={chipStripRef} className="topic-filter-options flex min-w-0 flex-1 gap-2 overflow-x-auto py-0.5">
          {categoryFilters.map((category) => { const active = activeCategory === category; const style = getCategoryStyle(category, activeRadar === "culture"); return <button key={category} type="button" onClick={() => onCategoryChange(category)} aria-pressed={active} className={["tap-target flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[15px] font-semibold transition", active ? "border-darinol-primary bg-darinol-primaryFill text-white" : "border-darinol-border bg-darinol-surface text-darinol-muted hover:border-darinol-primary/50 hover:text-darinol-text"].join(" ")}>{category !== "Semua" ? <span className={["h-1.5 w-1.5 rounded-full", active ? "bg-white" : style.dot].join(" ")} /> : null}{categoryName(category, language)}</button>; })}
        </div>
      </div>
    </div>
    {isCulture ? <details className="topic-niche-filter rounded-xl border border-darinol-border/60 bg-darinol-surface/40">
      <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm font-semibold text-darinol-text">
        <span>{t.creatorNiches}</span>
        <span className="text-xs font-medium text-darinol-muted">{selectedNiches.length ? t.selectedNiches(selectedNiches.length) : t.allNiches}</span>
      </summary>
      <div className="flex flex-wrap gap-2 border-t border-darinol-border/60 p-3">
        {categoryFilters.filter((category) => category !== "Semua").map((category) => {
          const selected = selectedCategories.includes(category);
          return <button key={category} type="button" role="checkbox" aria-checked={selected} onClick={() => onCategoryPreferenceChange(category)} className={["flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition", selected ? "border-darinol-primary bg-darinol-primary/10 text-darinol-text" : "border-darinol-border bg-darinol-surface text-darinol-muted hover:text-darinol-text"].join(" ")}>
            <span className={["grid h-4 w-4 place-items-center rounded border", selected ? "border-darinol-primary bg-darinol-primaryFill text-white" : "border-darinol-muted"].join(" ")} aria-hidden="true">{selected ? "✓" : ""}</span>
            <span>{categoryName(category, language)}</span>
          </button>;
        })}
        {selectedNiches.length ? <button type="button" onClick={onResetCategories} className="h-10 px-3 text-sm font-semibold text-darinol-primaryInk">{t.clearNicheSelection}</button> : null}
      </div>
    </details> : null}
    <div className="signal-list-heading flex items-end justify-between gap-4"><div><h2 className="font-heading text-2xl font-semibold text-darinol-text">{t.signalTitle}</h2><p className="mt-1 text-xs text-darinol-muted sm:text-sm">{t.signalCountText(totalCount)}</p></div></div>
    {showSkeleton ? <TopicRowSkeleton count={3} t={t} /> : totalCount === 0 ? <div className="rounded-xl border border-darinol-border/60 p-8 text-center"><p className="font-heading font-semibold text-darinol-text">{t.noTopicTitle}</p><p className="mt-1 text-sm text-darinol-muted">{t.noTopicBody}</p></div> : <>
      <div className="signal-featured-list">{topics.slice(0, 3).map((topic, index) => <Fragment key={topic.id}>
        <TopicRow topic={topic} rank={index + 1} selected={topic.id === selectedTopicId} language={language} onClick={() => onSelectTopic(topic.id)} />
        {index === 0 ? <SponsorCard sponsor={inlineSponsor} variant="inline" /> : null}
      </Fragment>)}</div>
    </>}
  </section>;
}
