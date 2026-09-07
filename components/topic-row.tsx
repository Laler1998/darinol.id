"use client";

import { ChevronRightIcon, TrendIcon } from "./icons";
import { getCategoryStyle } from "@/lib/categories";
import { getMomentumLabel, getTopicLabel } from "@/lib/format";
import type { Language } from "@/lib/copy";
import type { Topic } from "@/lib/types";

/**
 * Dense scannable row, not a card. 28 topics in a 4-column card grid forced
 * users to hunt; a single ranked column reads top-to-bottom like a chart.
 * Rank 1 gets an elevated briefing treatment so the strongest signal is
 * visually unmistakable before a user reads a single number.
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

  if (isPrimary) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-current={selected ? "true" : undefined}
        className={[
          "group flex w-full flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition",
          selected
            ? "border-darinol-primary bg-darinol-primary/10"
            : "border-darinol-primary/30 bg-darinol-surfaceRaised hover:border-darinol-primary/50",
        ].join(" ")}
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-darinol-primaryFill px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            #1
          </span>
          <span className={["rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", style.chip].join(" ")}>
            {label}
          </span>
        </div>

        <span className="font-heading text-xl font-semibold leading-tight text-darinol-text">
          {topic.name}
        </span>

        <div className="flex items-end justify-between gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-darinol-muted">
            <TrendIcon className="h-3.5 w-3.5 text-darinol-primaryInk" />
            {getMomentumLabel(topic.score, language)}
          </span>
          <span className="font-heading text-3xl font-semibold tabular-nums text-darinol-text">
            {score}
          </span>
        </div>

        <div className="flex items-center gap-3 border-t border-darinol-border/60 pt-3 text-[11px] font-medium tabular-nums text-darinol-muted">
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
          <span className="truncate font-heading text-sm font-semibold text-darinol-text">
            {topic.name}
          </span>
          <span
            className={[
              "hidden shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:block",
              style.chip,
            ].join(" ")}
          >
            {label}
          </span>
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-darinol-muted">
          {/* Category stays available as text on narrow screens, where the chip is hidden. */}
          <span className="truncate font-semibold sm:hidden">{label}</span>
          <span className="sm:hidden" aria-hidden="true">
            ·
          </span>
          <span className="shrink-0 tabular-nums">
            {articleCount} {language === "id" ? "berita" : "articles"}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{getMomentumLabel(topic.score, language)}</span>
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-2">
        <span className="hidden w-16 sm:block" aria-hidden="true">
          <span className="block h-1.5 overflow-hidden rounded-full bg-darinol-muted/20">
            <span
              className="block h-full rounded-full bg-darinol-primary"
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
