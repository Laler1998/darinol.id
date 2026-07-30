"use client";

import { ArticleRow } from "./article-row";
import { ArticleRowSkeleton } from "./skeletons";
import { InboxIcon } from "./icons";
import { groupByRecency } from "@/lib/format";
import type { Copy, Language } from "@/lib/copy";
import type { FeedArticle } from "@/lib/types";

/**
 * Grouped by recency instead of one flat 60-item grid — a chronological feed is
 * far easier to scan when the time buckets are labelled.
 */
export function LatestFeed({
  articles,
  loading,
  language,
  t,
}: {
  articles: FeedArticle[];
  loading: boolean;
  language: Language;
  t: Copy;
}) {
  const groups = groupByRecency(articles, language);

  return (
    <section aria-label={t.latestTitle} className="glass-card overflow-hidden rounded-2xl">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-darinol-border/60 p-4 md:p-5">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight text-darinol-text">
            {t.latestTitle}
          </h2>
          <p className="mt-1 text-xs font-medium text-darinol-muted">{t.latestHint}</p>
        </div>
        <span className="text-[11px] font-semibold tabular-nums text-darinol-muted">
          {articles.length} {t.articles}
        </span>
      </header>

      <div className="p-4 md:p-5">
        {loading && !articles.length ? (
          <ArticleRowSkeleton count={8} t={t} />
        ) : groups.length ? (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.label}>
                <div className="mb-2.5 flex items-center gap-3">
                  <h3 className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-darinol-primaryInk">
                    {group.label}
                  </h3>
                  <span className="h-px flex-1 bg-darinol-border/70" aria-hidden="true" />
                  <span className="shrink-0 text-[11px] font-medium tabular-nums text-darinol-muted">
                    {group.articles.length}
                  </span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                  {group.articles.map((article) => (
                    <ArticleRow
                      key={`${article.topicId}-${article.url}`}
                      article={article}
                      categoryLabel={article.category}
                      isCulture={article.radarType === "culture"}
                      language={language}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <InboxIcon className="mx-auto h-6 w-6 text-darinol-muted/60" />
            <p className="mt-3 font-heading text-sm font-semibold text-darinol-text">
              {t.latestEmpty}
            </p>
            <p className="mt-1.5 text-xs text-darinol-muted">{t.noTopicBody}</p>
          </div>
        )}
      </div>
    </section>
  );
}
