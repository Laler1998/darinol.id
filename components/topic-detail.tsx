"use client";

import { useEffect, useState } from "react";
import { ArticleRow } from "./article-row";
import { ArticleRowSkeleton } from "./skeletons";
import { InboxIcon } from "./icons";
import { getCategoryStyle } from "@/lib/categories";
import { getDataStatusLabel, getGrowthLabel, getTopicLabel } from "@/lib/format";
import { isLowQualityHeadline } from "@/lib/news-quality";
import type { Copy, Language } from "@/lib/copy";
import type { Topic } from "@/lib/types";

type TopicFeedback = "relevant" | "not_relevant";
type SavedTopic = { topic: Topic; savedAt: string };

const SAVED_TOPICS_KEY = "darinol-saved-topics-v1";
const TOPIC_FEEDBACK_KEY = "darinol-topic-feedback-v1";

function readTopicFeedback(): Record<string, TopicFeedback> {
  try {
    const value = JSON.parse(window.localStorage.getItem(TOPIC_FEEDBACK_KEY) ?? "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-darinol-muted">
        {label}
      </dt>
      <dd className="mt-0.5 font-heading text-base font-semibold tabular-nums text-darinol-text">
        {value}
      </dd>
    </div>
  );
}

export function TopicDetail({
  topic,
  loading,
  language,
  onNextTopic,
  t,
  compact = false,
}: {
  topic: Topic | null;
  loading: boolean;
  language: Language;
  onNextTopic: () => void;
  t: Copy;
  compact?: boolean;
}) {
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([]);
  const [feedback, setFeedback] = useState<TopicFeedback | null>(null);

  useEffect(() => {
    try {
      const value = JSON.parse(window.localStorage.getItem(SAVED_TOPICS_KEY) ?? "[]");
      setSavedTopics(Array.isArray(value) ? value.filter((item) => item?.topic?.id && item?.savedAt) : []);
    } catch {
      window.localStorage.removeItem(SAVED_TOPICS_KEY);
    }
  }, []);

  useEffect(() => {
    setFeedback(topic ? readTopicFeedback()[topic.id] ?? null : null);
  }, [topic?.id]);

  if (!topic) {
    return (
      <section className="glass-card rounded-2xl p-6">
        {loading ? (
          <ArticleRowSkeleton count={4} t={t} />
        ) : (
          <div className="py-10 text-center">
            <InboxIcon className="mx-auto h-6 w-6 text-darinol-muted/60" />
            <p className="mt-3 font-heading text-sm font-semibold text-darinol-text">
              {t.noTopicTitle}
            </p>
            <p className="mt-1.5 text-xs text-darinol-muted">{t.noTopicBody}</p>
          </div>
        )}
      </section>
    );
  }

  const isCulture = topic.radar_type === "culture";
  const label = getTopicLabel(topic, language);
  const rawDataStatusLabel = getDataStatusLabel(topic, language);
  const dataStatusLabel = rawDataStatusLabel === t.liveStatus ? null : rawDataStatusLabel;
  const growthLabel = getGrowthLabel(topic, language);
  const growthClass = topic.growth_status === "measured" && (topic.growth_percent ?? 0) > 0
    ? "bg-darinol-success/10 text-emerald-700 dark:text-emerald-300"
    : topic.growth_status === "measured" && (topic.growth_percent ?? 0) < 0
      ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : "bg-darinol-muted/10 text-darinol-muted";
  const style = getCategoryStyle(topic.category, isCulture);
  const articleCount = topic.total_articles ?? topic.articles.length;
  const sourceCount =
    topic.total_sources ?? new Set(topic.articles.map((article) => article.source)).size;
  const articles = topic.articles.slice(0, 4);
  const remainingArticles = Math.max(topic.articles.length - articles.length, 0);
  const isSaved = savedTopics.some((item) => item.topic.id === topic.id);

  function toggleSavedTopic() {
    if (!topic) return;
    const next = isSaved
      ? savedTopics.filter((item) => item.topic.id !== topic.id)
      : [{ topic, savedAt: new Date().toISOString() }, ...savedTopics.filter((item) => item.topic.id !== topic.id)].slice(0, 50);
    setSavedTopics(next);
    window.localStorage.setItem(SAVED_TOPICS_KEY, JSON.stringify(next));
  }

  function setTopicFeedback(value: TopicFeedback) {
    if (!topic) return;
    const next = readTopicFeedback();
    if (next[topic.id] === value) delete next[topic.id];
    else next[topic.id] = value;
    window.localStorage.setItem(TOPIC_FEEDBACK_KEY, JSON.stringify(next));
    setFeedback(next[topic.id] ?? null);
    window.dispatchEvent(new Event("darinol:topic-feedback"));
  }

  return (
    <section aria-label={topic.name} className="glass-card topic-detail-shell overflow-hidden rounded-2xl">
      <header className="border-b border-darinol-border/60 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              style.chip,
            ].join(" ")}
          >
            {label}
          </span>
          {growthLabel ? <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${growthClass}`}>
            {t.growth}: {growthLabel}
          </span> : null}
          {dataStatusLabel ? (
            <span className="rounded-md border border-darinol-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-darinol-muted">
              {dataStatusLabel}
            </span>
          ) : null}
          {!isCulture && topic.market ? (
            <span className="rounded-md bg-darinol-muted/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-darinol-muted">
              {topic.market === "world" ? t.worldRadar : t.indonesia} · {topic.verified ? t.crossSourceCoverage : t.singleSourceCoverage}
            </span>
          ) : null}          {topic.is_sample ? (
            <span className="rounded-md bg-darinol-muted/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-darinol-muted">
              {t.cultureSample}
            </span>
          ) : null}
        </div>

        {!compact ? <h3 className="mt-3 font-heading text-2xl font-semibold leading-tight tracking-tight text-darinol-text md:text-3xl">
          {topic.name}
        </h3> : null}

        <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-darinol-border/60 pt-3">
          <Stat
            label={isCulture ? t.cultureScore : t.trendScore}
            value={String(topic.culture_score ?? topic.score)}
          />
          <Stat label={t.articles} value={String(articleCount)} />
          <Stat
            label={isCulture ? t.opportunityScore : t.sourceCount}
            value={isCulture ? String(topic.opportunity_score ?? "—") : String(sourceCount)}
          />
        </dl>
      </header>

      <div className="p-5 sm:p-6">
        <details className="group mb-5 rounded-xl border border-darinol-border/60 bg-darinol-surface/40">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-sm font-semibold text-darinol-text">
            {t.readScoreAndGrowth}
            <span className="text-xs font-medium text-darinol-muted group-open:hidden">{t.expand}</span>
          </summary>
          <div className="space-y-2 px-3.5 pb-3.5 text-xs leading-relaxed text-darinol-muted">
            <p>{isCulture ? t.socialActivityExplanation : t.newsActivityExplanation}</p>
            <p>{t.growthBaselineExplanation}</p>
          </div>
        </details>

        <details className="group mb-5 rounded-xl border border-darinol-border/60 bg-darinol-surface/40">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-sm font-semibold text-darinol-text">
            {t.whyTrending}
            <span className="text-xs font-medium text-darinol-muted group-open:hidden">
              {t.expand}
            </span>
          </summary>
          <ul className="space-y-2 px-3.5 pb-3.5">
            {topic.whyViral.map((reason) => (
              <li key={reason} className="flex gap-2.5">
                <span
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-darinol-primary"
                  aria-hidden="true"
                />
                <span className="text-xs font-medium leading-relaxed text-darinol-muted">
                  {reason}
                </span>
              </li>
            ))}
          </ul>
        </details>

        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h3 className="shrink-0 font-heading text-base font-semibold text-darinol-text">
            {t.relatedNews}
          </h3>
          <span className="hidden text-[11px] font-medium text-darinol-muted sm:block">
            {t.relatedNewsHint}
          </span>
        </div>

        {loading && !articles.length ? (
          <ArticleRowSkeleton count={4} t={t} />
        ) : articles.length ? (
          <div className={compact ? "grid gap-2" : "grid gap-3 sm:grid-cols-2"}>
            {articles.map((article) => (
              <ArticleRow
                key={`${article.source}-${article.url}`}
                article={article}
                categoryLabel={label}
                language={language}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-darinol-border/60 bg-darinol-surface/40 px-3.5 py-3 text-sm text-darinol-muted">
            {t.noSource}
          </p>
        )}

        {remainingArticles ? <p className="mt-3 text-xs font-semibold text-darinol-primaryInk">+ {remainingArticles} sumber lainnya tersedia</p> : null}

        {isCulture ? <div className="mt-5 border-t border-darinol-border/60 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={toggleSavedTopic} aria-pressed={isSaved} className="min-h-10 rounded-lg border border-darinol-border px-3 text-sm font-semibold text-darinol-text transition hover:border-darinol-primary/60">
              {isSaved ? t.savedRemove : t.saveTopic}
            </button>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.relevanceGroup}>
              <span className="text-xs font-medium text-darinol-muted">{t.relevantToMe}</span>
              <button type="button" aria-pressed={feedback === "relevant"} onClick={() => setTopicFeedback("relevant")} className={["min-h-10 rounded-lg border px-3 text-sm font-semibold", feedback === "relevant" ? "border-darinol-primary bg-darinol-primary/10 text-darinol-text" : "border-darinol-border text-darinol-muted"].join(" ")}>{t.relevant}</button>
              <button type="button" aria-pressed={feedback === "not_relevant"} onClick={() => setTopicFeedback("not_relevant")} className={["min-h-10 rounded-lg border px-3 text-sm font-semibold", feedback === "not_relevant" ? "border-darinol-primary bg-darinol-primary/10 text-darinol-text" : "border-darinol-border text-darinol-muted"].join(" ")}>{t.notRelevant}</button>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-darinol-muted">{t.localFeedback}</p>
          <details className="group mt-3 rounded-lg border border-darinol-border/60 bg-darinol-surface/40">
            <summary className="flex min-h-10 cursor-pointer items-center justify-between gap-3 px-3 text-sm font-semibold text-darinol-text">
              <span>{t.savedTopics(savedTopics.length)}</span>
              <span className="text-xs font-medium text-darinol-muted group-open:hidden">{t.expand}</span>
            </summary>
            {savedTopics.length ? <ul className="divide-y divide-darinol-border/60 border-t border-darinol-border/60">
              {savedTopics.map((item) => <li key={item.topic.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-darinol-text">{item.topic.name}</p>
                  <p className="text-xs text-darinol-muted">{getTopicLabel(item.topic, language)} · {new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", { day: "2-digit", month: "short", timeZone: "Asia/Jakarta" }).format(new Date(item.savedAt))} WIB</p>
                </div>
                {item.topic.articles[0]?.url && !isLowQualityHeadline(item.topic.articles[0].title, item.topic.articles[0].source, item.topic.articles[0].url) ? <a href={item.topic.articles[0].url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-darinol-primaryInk">{t.openSource}</a> : null}
              </li>)}
            </ul> : <p className="border-t border-darinol-border/60 px-3 py-3 text-xs text-darinol-muted">{t.emptySavedTopics}</p>}
          </details>
        </div> : null}

        <button
          type="button"
          onClick={onNextTopic}
          className="mt-4 h-11 w-full rounded-full border border-darinol-border bg-darinol-surface/70 text-sm font-semibold text-darinol-text transition hover:border-darinol-primary/50 hover:text-darinol-primaryInk"
        >
          {t.nextTopic}
        </button>
      </div>
    </section>
  );
}
