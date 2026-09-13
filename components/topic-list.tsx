"use client";

import { useEffect, useRef, useState } from "react";
import { TopicRow } from "./topic-row";
import { TopicRowSkeleton } from "./skeletons";
import { getCategoryStyle } from "@/lib/categories";
import type { Copy, Language } from "@/lib/copy";
import type { RadarFilter, Topic } from "@/lib/types";

export function TopicList({ topics, totalCount, selectedTopicId, activeRadar, isCulture, onRadarChange: _onRadarChange, categoryFilters, activeCategory, onCategoryChange, onSelectTopic, loading, language, t }: {
  topics: Topic[]; totalCount: number; selectedTopicId: string | null; activeRadar: RadarFilter; isCulture: boolean; selectedCategories: string[]; onCategoryPreferenceChange: (category: string) => void; onResetCategories: () => void; onRadarChange: (radar: RadarFilter) => void; categoryFilters: string[]; activeCategory: string; onCategoryChange: (category: string) => void; onSelectTopic: (topicId: string) => void; loading: boolean; search: string; onSearchChange: (value: string) => void; language: Language; t: Copy;
}) {
  const [showMore, setShowMore] = useState(false);
  const chipStripRef = useRef<HTMLDivElement | null>(null);
  const showSkeleton = loading && totalCount === 0;
  const featured = topics.slice(0, 3);
  const additional = topics.slice(3);

  useEffect(() => {
    chipStripRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activeCategory]);

  return <section aria-label={t.radarTab} className="space-y-4">
    <div className="sticky top-16 z-30 -mx-4 border-y border-darinol-border/70 bg-darinol-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 xl:-mx-14 xl:px-14">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3">
        <div className="filter-label shrink-0"><p className="text-[11px] font-bold text-darinol-text">Filter topik</p><span className="text-[10px] text-darinol-muted">{activeCategory === "Semua" ? t.all : activeCategory.replace(/_/g, " ")}</span></div>
        <div ref={chipStripRef} className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-0.5">
          {categoryFilters.map((category) => { const active = activeCategory === category; const style = getCategoryStyle(category, activeRadar === "culture"); return <button key={category} type="button" onClick={() => onCategoryChange(category)} aria-pressed={active} className={["tap-target flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition", active ? "border-darinol-primary bg-darinol-primaryFill text-white" : "border-darinol-border bg-darinol-surface text-darinol-muted hover:border-darinol-primary/50 hover:text-darinol-text"].join(" ")}>{category !== "Semua" ? <span className={["h-1.5 w-1.5 rounded-full", active ? "bg-white" : style.dot].join(" ")} /> : null}{category === "Semua" ? t.all : category.replace(/_/g, " ")}</button>; })}
        </div>
      </div>
    </div>
    <div className="flex items-end justify-between gap-4"><div><h2 className="font-heading text-2xl font-semibold text-darinol-text">{isCulture ? "Sinyal sosial utama" : "Sinyal utama"}</h2><p className="mt-1 text-sm text-darinol-muted">{isCulture ? "Tiga percakapan dan format kreator dengan momentum paling kuat saat ini." : "Tiga topik dengan pergerakan paling kuat saat ini."}</p></div><span className="hidden text-xs font-semibold text-darinol-primaryInk sm:block">{totalCount} {t.topics}</span></div>
    {showSkeleton ? <TopicRowSkeleton count={3} t={t} /> : totalCount === 0 ? <div className="rounded-xl border border-darinol-border/60 p-8 text-center"><p className="font-heading font-semibold text-darinol-text">{t.noTopicTitle}</p><p className="mt-1 text-sm text-darinol-muted">{t.noTopicBody}</p></div> : <>
      <div className="grid gap-3 md:grid-cols-3">{featured.map((topic, index) => <TopicRow key={topic.id} topic={topic} rank={index + 1} isPrimary selected={topic.id === selectedTopicId} language={language} onClick={() => onSelectTopic(topic.id)} />)}</div>
      {additional.length ? <div><button type="button" onClick={() => setShowMore((current) => !current)} className="rounded-lg border border-darinol-border bg-darinol-surface px-3 py-2 text-xs font-bold text-darinol-primaryInk transition hover:border-darinol-primary/50">{showMore ? "Sembunyikan sinyal lainnya" : `Lihat ${additional.length} sinyal lainnya`}</button>{showMore ? <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{additional.map((topic, index) => <TopicRow key={topic.id} topic={topic} rank={index + 4} selected={topic.id === selectedTopicId} language={language} onClick={() => onSelectTopic(topic.id)} />)}</div> : null}</div> : null}
    </>}
  </section>;
}
