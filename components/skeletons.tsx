"use client";

import type { Copy } from "@/lib/copy";

/**
 * Skeletons match the real row heights so nothing shifts when data lands.
 */
export function TopicRowSkeleton({ count = 6, t }: { count?: number; t: Copy }) {
  return (
    <div className="space-y-0.5" role="status" aria-label={t.loadingTopics}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-2.5">
          <span className="skeleton h-3 w-4 rounded" />
          <span className="skeleton h-8 w-1 rounded-full" />
          <span className="min-w-0 flex-1 space-y-2">
            <span
              className="skeleton block h-3.5 rounded"
              style={{ width: `${58 + ((index * 13) % 34)}%` }}
            />
            <span className="skeleton block h-2.5 w-24 rounded" />
          </span>
          <span className="skeleton h-1.5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ArticleRowSkeleton({ count = 6, t }: { count?: number; t: Copy }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2" role="status" aria-label={t.loadingArticles}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-darinol-border/60 bg-darinol-surface/40 px-3.5 py-3"
        >
          <span className="skeleton block h-3.5 rounded" />
          <span
            className="skeleton mt-2 block h-3.5 rounded"
            style={{ width: `${44 + ((index * 17) % 38)}%` }}
          />
          <span className="skeleton mt-3 block h-2.5 w-32 rounded" />
        </div>
      ))}
    </div>
  );
}
