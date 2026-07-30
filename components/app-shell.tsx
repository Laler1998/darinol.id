"use client";

import { MoonIcon, RefreshIcon, SearchIcon, SunIcon } from "./icons";
import { SegmentedTabs } from "./segmented-tabs";
import type { Copy, Language, MainView, ThemeMode } from "@/lib/copy";

/**
 * Compact sticky chrome. Navigation and refresh stay reachable from any scroll
 * depth, which is the main reason the old full-height header was replaced.
 */
export function AppShell({
  search,
  onSearchChange,
  updatedAt,
  onRefresh,
  refreshing,
  activeView,
  onViewChange,
  language,
  onLanguageChange,
  themeMode,
  onThemeToggle,
  t,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  updatedAt: string;
  onRefresh: () => void;
  refreshing: boolean;
  activeView: MainView;
  onViewChange: (view: MainView) => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
  themeMode: ThemeMode;
  onThemeToggle: () => void;
  t: Copy;
}) {
  return (
    <div className="sticky top-0 z-40 -mx-3 mb-4 border-b border-darinol-border/70 bg-darinol-background/85 px-3 backdrop-blur-xl sm:-mx-4 sm:px-4 md:-mx-5 md:px-5 lg:-mx-6 lg:px-6">
      <div className="mx-auto flex h-14 w-full max-w-[1680px] items-center gap-3">
        {/* Brand mark, not a link: it used to jump to #main, duplicating the
            skip link and adding a tab stop that did nothing useful. */}
        <p className="flex h-9 items-center gap-2.5">
          <img
            src="/darinol-icon.png?v=6"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-[26%] object-cover"
          />
          <span className="hidden font-heading text-base font-semibold tracking-tight text-darinol-text sm:block">
            Darinol<span className="text-darinol-primaryInk">.id</span>
          </span>
        </p>

        <label className="relative ml-auto hidden min-w-0 flex-1 md:block md:max-w-sm">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-darinol-muted">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            className="h-9 w-full rounded-full border border-darinol-border bg-darinol-surface/70 pl-10 pr-3 text-sm text-darinol-text transition placeholder:text-darinol-muted hover:border-darinol-primary/40 focus:border-darinol-primary focus:outline-none focus:ring-2 focus:ring-darinol-primary/25"
          />
        </label>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label={refreshing ? t.refreshing : t.refresh}
            className="tap-target flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full border border-darinol-border bg-darinol-surface/70 px-3 text-xs font-semibold text-darinol-text transition hover:border-darinol-primary/50 hover:text-darinol-primaryInk disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshIcon className={refreshing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
            <span className="hidden lg:inline">{refreshing ? t.refreshing : t.refresh}</span>
          </button>

          <div
            role="group"
            aria-label={t.languageSwitcher}
            className="flex h-9 rounded-full border border-darinol-border bg-darinol-surface/70 p-0.5"
          >
            {(["id", "en"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onLanguageChange(item)}
                aria-pressed={language === item}
                className={[
                  "tap-target h-8 min-w-11 rounded-full text-xs font-semibold transition",
                  language === item
                    ? "bg-darinol-primaryFill text-white"
                    : "text-darinol-muted hover:text-darinol-text",
                ].join(" ")}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onThemeToggle}
            aria-label={themeMode === "dark" ? t.light : t.dark}
            className="tap-target grid h-9 w-9 place-items-center rounded-full border border-darinol-border bg-darinol-surface/70 text-darinol-muted transition hover:border-darinol-primary/50 hover:text-darinol-primaryInk"
          >
            {themeMode === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-3 pb-2.5">
        <SegmentedTabs activeView={activeView} onChange={onViewChange} t={t} />
        <p
          className="hidden shrink-0 text-[11px] font-medium text-darinol-muted sm:block"
          aria-live="polite"
        >
          {t.update} {updatedAt}
        </p>
      </div>
    </div>
  );
}
