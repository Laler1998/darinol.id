"use client";

import { ArticleRow } from "./article-row";
import { ArticleRowSkeleton } from "./skeletons";
import { InboxIcon } from "./icons";
import { getCategoryStyle } from "@/lib/categories";
import { getTopicLabel } from "@/lib/format";
import type { Copy, Language } from "@/lib/copy";
import type { Topic } from "@/lib/types";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-darinol-muted">
        {label}
      </dt>
      <dd className="mt-0.5 font-heading text-lg font-semibold tabular-nums text-darinol-text">
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
}: {
  topic: Topic | null;
  loading: boolean;
  language: Language;
  onNextTopic: () => void;
  t: Copy;
}) {
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
  const label = getTopicLabel(topic);
  const style = getCategoryStyle(topic.category, isCulture);
  const articleCount = topic.total_articles ?? topic.articles.length;
  const sourceCount =
    topic.total_sources ?? new Set(topic.articles.map((article) => article.source)).size;
  const articles = topic.articles;

  return (
    <section aria-label={topic.name} className="glass-card overflow-hidden rounded-2xl">
      <header className="border-b border-darinol-border/60 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              style.chip,
            ].join(" ")}
          >
            {label}
          </span>
          <span className="rounded-md bg-darinol-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            {topic.growth}
          </span>
          {topic.is_sample ? (
            <span className="rounded-md bg-darinol-muted/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-darinol-muted">
              {t.cultureSample}
            </span>
          ) : null}
        </div>

        <h2 className="mt-2.5 font-heading text-2xl font-semibold leading-tight tracking-tight text-darinol-text md:text-3xl">
          {topic.name}
        </h2>

        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-darinol-border/60 pt-3">
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

      <div className="p-4 md:p-5">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h3 className="shrink-0 font-heading text-sm font-semibold text-darinol-text">
            {t.relatedNews}
          </h3>
          <span className="hidden text-[11px] font-medium text-darinol-muted sm:block">
            {t.relatedNewsHint}
          </span>
        </div>

        {loading && !articles.length ? (
          <ArticleRowSkeleton count={4} t={t} />
        ) : articles.length ? (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {articles.map((article) => (
              <ArticleRow
                key={`${article.source}-${article.url}`}
                article={article}
                language={language}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-darinol-border/60 bg-darinol-surface/40 px-3.5 py-3 text-sm text-darinol-muted">
            {t.noSource}
          </p>
        )}

        <details className="group mt-4 rounded-xl border border-darinol-border/60 bg-darinol-surface/40">
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

        <button
          type="button"
          onClick={onNextTopic}
          className="mt-3 h-10 w-full rounded-full border border-darinol-border bg-darinol-surface/70 text-xs font-semibold text-darinol-text transition hover:border-darinol-primary/50 hover:text-darinol-primaryInk"
        >
          {t.nextTopic}
        </button>
      </div>
    </section>
  );
}
