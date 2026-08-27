"use client";

import { ExternalIcon } from "./icons";
import { getCategoryStyle } from "@/lib/categories";
import { formatRelativeTime } from "@/lib/format";
import type { Language } from "@/lib/copy";
import type { TopicArticle } from "@/lib/types";

/**
 * The whole row is one link. Previously the title and a separate "open source"
 * link pointed at the same URL, which doubled the tab stops and shrank the
 * effective target for no gain.
 */
export function ArticleRow({
  article,
  categoryLabel,
  isCulture = false,
  language,
}: {
  article: TopicArticle;
  categoryLabel?: string;
  isCulture?: boolean;
  language: Language;
}) {
  const hasSource = Boolean(article.url) && article.url !== "#";
  const style = getCategoryStyle(categoryLabel ?? "", isCulture);

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-snug text-darinol-text">{article.title}</p>
        {hasSource ? (
          <ExternalIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-darinol-muted/50 transition group-hover:text-darinol-primaryInk" />
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-darinol-muted">
        {categoryLabel ? (
          <span
            className={[
              "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              style.chip,
            ].join(" ")}
          >
            {categoryLabel}
          </span>
        ) : null}
        <span className="truncate">{article.source}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={article.publishedAt ?? undefined} className="tabular-nums">
          {formatRelativeTime(article.publishedAt, language)}
        </time>
      </div>
    </>
  );

  if (!hasSource) {
    return (
      <div className="rounded-xl border border-darinol-border/60 bg-darinol-surface/40 px-3.5 py-3">
        {content}
      </div>
    );
  }

  return (
    <a
      href={article.slug ? `/artikel/${article.slug}` : article.url}
      target={article.slug ? undefined : "_blank"}
      rel={article.slug ? undefined : "noreferrer"}
      className="group block rounded-xl border border-darinol-border/60 bg-darinol-surface/40 px-3.5 py-3 transition hover:border-darinol-primary/50 hover:bg-darinol-surface"
    >
      {content}
    </a>
  );
}
