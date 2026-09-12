"use client";

/**
 * Lightweight route fallback. It deliberately contains no media so navigation
 * never waits for a video download or decode before meaningful UI is visible.
 */
export function LoadingOverlay({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="loading-overlay loading-overlay-active" role="status" aria-live="polite" aria-label="Memuat konten">
      <div className="loading-overlay-stage w-full max-w-md p-5">
        <div className="w-full space-y-4 rounded-3xl border border-darinol-border/60 bg-darinol-surface/80 p-5">
          <span className="skeleton block h-5 w-36 rounded" />
          <span className="skeleton block h-32 rounded-2xl" />
          <span className="skeleton block h-4 w-4/5 rounded" />
          <span className="skeleton block h-4 w-3/5 rounded" />
        </div>
      </div>
    </div>
  );
}