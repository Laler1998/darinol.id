"use client";

import { useEffect, useState } from "react";
import { ChevronRightIcon, TrendIcon } from "./icons";
import { getCategoryStyle } from "@/lib/categories";
import { getDataStatusLabel, getGrowthLabel, getTopicLabel } from "@/lib/format";
import type { Language } from "@/lib/copy";
import type { Topic } from "@/lib/types";

function useAnimatedScore(score: number) {
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDisplayedScore(score); return; }
    const start = performance.now();
    const from = displayedScore;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 360, 1);
      setDisplayedScore(Math.round(from + (score - from) * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return displayedScore;
}

/**
 * The top three signals use a compact ranked-card treatment; the remaining
 * signals stay as dense rows so the strongest signals remain easy to scan.
 */
export function TopicRow({
  topic,
  rank,
  isPrimary = false,
  selected,
  language,
  onClick,
}: {
  topic: Topic;
  rank: number;
  isPrimary?: boolean;
  selected: boolean;
  language: Language;
  onClick: () => void;
}) {
  const isCulture = topic.radar_type === "culture";
  const label = getTopicLabel(topic);
  const style = getCategoryStyle(topic.category, isCulture);
  const articleCount = topic.total_articles ?? topic.articles.length;
  const sourceCount =
    topic.total_sources ?? new Set(topic.articles.map((article) => article.source)).size;
  const score = topic.culture_score ?? topic.score;
  const displayedScore = useAnimatedScore(score);
  const statusLabel = getDataStatusLabel(topic, language);
  const growthLabel = getGrowthLabel(topic, language);
  const growthIsPositive = topic.growth_status === "measured" && (topic.growth_percent ?? 0) > 0;
  const growthIsNegative = topic.growth_status === "measured" && (topic.growth_percent ?? 0) < 0;

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    event.currentTarget.style.setProperty("--card-pointer-x", `${x}%`);
    event.currentTarget.style.setProperty("--card-pointer-y", `${y}%`);
    event.currentTarget.style.setProperty("--card-glow-opacity", "1");
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLButtonElement>) {
    event.currentTarget.style.setProperty("--card-glow-opacity", "0");
  }

  if (isPrimary) {
    return (
      <button
        type="button"
        onClick={onClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        aria-current={selected ? "true" : undefined}
        className={[
          "trend-card group flex w-full min-h-[196px] flex-col gap-3 signal-enter rounded-2xl border px-4 py-[18px] text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:border-darinol-primary/50 hover:shadow-[0_12px_28px_rgba(0,0,0,0.16)] active:scale-[0.97]",
          selected
            ? "border-darinol-primary bg-darinol-primary/10"
            : isPrimary
              ? "border-darinol-border"
              : "border-darinol-border",
          rank === 1 && !selected ? "trend-card-rank1" : "",
        ].join(" ")}
      >
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-darinol-primary px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#1a0a03]">
            #{rank}
          </span>
          <span className="rounded-md bg-darinol-muted/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-darinol-muted">
            {label}
          </span>
          {statusLabel ? (
            <span className="rounded-md border border-darinol-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-darinol-muted">
              {statusLabel}
            </span>
          ) : null}
        </div>

        <span className="line-clamp-2 min-h-[3.5rem] font-heading text-[18px] font-semibold leading-[1.4] text-darinol-text">
          {topic.name}
        </span>

        <div className="flex items-end justify-between gap-3">
          <span className={[
            "flex items-center gap-1.5 text-xs font-medium",
            growthIsPositive
              ? "text-emerald-600 dark:text-[#7ee0a8]"
              : growthIsNegative
                ? "text-rose-600 dark:text-rose-400"
                : "text-darinol-muted",
          ].join(" ")}>
            {growthIsPositive ? <TrendIcon className="h-3.5 w-3.5" /> : null}
            {growthLabel}
          </span>
          <span className="font-heading text-[22px] font-bold tabular-nums text-darinol-primaryInk">
            {score}
          </span>
        </div>

        <div className="flex items-center gap-3 border-t border-darinol-border/60 pt-3 text-[13px] font-medium tabular-nums text-darinol-muted">
          <span>{articleCount} {language === "id" ? "berita" : "articles"}</span>
          <span aria-hidden="true">·</span>
          <span>{sourceCount} {language === "id" ? "sumber" : "sources"}</span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
      className={[
        "group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
        selected
          ? "border-darinol-primary bg-darinol-primary/8"
          : "border-transparent hover:border-darinol-border hover:bg-darinol-surface/70",
      ].join(" ")}
    >
      <span
        className={[
          "w-5 shrink-0 text-right font-heading text-xs font-semibold tabular-nums",
          selected ? "text-darinol-primaryInk" : "text-darinol-muted",
        ].join(" ")}
      >
        {rank}
      </span>

      <span className={["h-8 w-1 shrink-0 rounded-full", style.dot].join(" ")} aria-hidden="true" />

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-heading text-sm font-semibold text-darinol-text">{topic.name}</span>
          <span
            className={[
              "hidden shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:block",
              style.chip,
            ].join(" ")}
          >
            {label}
          </span>
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-darinol-muted">
          {/* Category stays available as text on narrow screens, where the chip is hidden. */}
          <span className="truncate font-semibold sm:hidden">{label}</span>
          <span className="sm:hidden" aria-hidden="true">·</span>
          <span className="shrink-0 tabular-nums">
            {articleCount} {language === "id" ? "berita" : "articles"}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{growthLabel}</span>
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-2">
        <span className="hidden w-16 sm:block" aria-hidden="true">
          <span className="block h-1.5 overflow-hidden rounded-full bg-darinol-muted/20">
            <span
              className="momentum-fill block h-full rounded-full bg-darinol-primary"
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </span>
        </span>
        <span className="w-7 text-right font-heading text-sm font-semibold tabular-nums text-darinol-text">
          {score}
        </span>
        <ChevronRightIcon
          className={[
            "h-4 w-4 transition",
            selected
              ? "text-darinol-primaryInk"
              : "text-darinol-muted/60 group-hover:text-darinol-primaryInk",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
