"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ClockIcon, MoonIcon, RefreshIcon, SearchIcon, SunIcon, TrendIcon } from "./icons";
import type { Copy, Language, MainView, ThemeMode } from "@/lib/copy";
import type { RadarFilter } from "@/lib/types";
import { trackFunnel } from "@/lib/analytics";
import { formatClock } from "@/lib/format";

export function AppShell({ search, onSearchChange, updatedAtIso, onRefresh, refreshing, activeView, onViewChange, language, onLanguageChange, themeMode, onThemeToggle, activeRadar, onRadarChange, t }: {
  search: string; onSearchChange: (value: string) => void; updatedAtIso: string; onRefresh: () => void; refreshing: boolean; activeView: MainView; onViewChange: (view: MainView) => void; language: Language; onLanguageChange: (language: Language) => void; themeMode: ThemeMode; onThemeToggle: () => void; activeRadar: RadarFilter; onRadarChange: (radar: RadarFilter) => void; t: Copy;
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [updatedAtLabel, setUpdatedAtLabel] = useState("");
  useEffect(() => {
    setUpdatedAtLabel(updatedAtIso ? formatClock(updatedAtIso, language) : "—");
  }, [updatedAtIso, language]);
  const navigation = [{ id: "radar" as const, label: t.newsRadar, mobileLabel: t.newsRadar, Icon: TrendIcon }, { id: "world" as const, label: t.worldRadar, mobileLabel: t.mobileWorld, Icon: TrendIcon }, { id: "latest" as const, label: t.latestTab, mobileLabel: t.mobileLatest, Icon: ClockIcon }, { id: "culture" as const, label: t.cultureRadar, mobileLabel: t.mobileCreators, Icon: TrendIcon }];
  const navButtons = navigation.map(({ id, label, mobileLabel, Icon }) => { const active = id === activeView; return <button key={id} type="button" onClick={() => { const radar: RadarFilter = id === "culture" ? "culture" : id === "world" ? "world" : "news"; trackFunnel("radar_view_changed", { view: id, radar }); onViewChange(id); onRadarChange(radar); }} aria-label={label} aria-pressed={active} className={["tap-target flex h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-[15px] font-bold transition", active ? "bg-darinol-primaryFill text-white shadow-[0_4px_10px_rgba(255,122,69,0.22)]" : "text-darinol-muted hover:bg-darinol-primary/10 hover:text-darinol-text"].join(" ")}><Icon className="h-4 w-4" /><span className="hidden md:inline">{label}</span><span className="md:hidden">{mobileLabel}</span></button>; });

  return <header className="site-header sticky top-0 z-40 border-b border-darinol-border/70 bg-darinol-background">
    <div className="site-header-main">
      <div className="site-header-controls site-header-controls-left">
        <div className="language-switcher" role="group" aria-label={t.languageSwitcher}>
          {(["id", "en"] as const).map((option) => <button key={option} type="button" aria-pressed={language === option} onClick={() => onLanguageChange(option)}>{option.toUpperCase()}</button>)}
        </div>
      </div>
      <Image src="/darinol-wordmark.png" alt={t.brandName} width={270} height={90} className="site-header-logo h-7 w-auto object-contain sm:h-8" priority />
      <div className="site-header-controls site-header-controls-right">
        <button type="button" onClick={onRefresh} disabled={refreshing} aria-label={refreshing ? t.refreshing : t.refresh} className="header-icon-button tap-target"><RefreshIcon className={refreshing ? "animate-spin" : ""} /></button>
        <button type="button" onClick={onThemeToggle} aria-label={themeMode === "dark" ? t.light : t.dark} className="header-icon-button tap-target">{themeMode === "dark" ? <SunIcon /> : <MoonIcon />}</button>
      </div>
    </div>
    <div className="site-header-nav-row">
      <p className="site-header-status hidden items-center gap-2 whitespace-nowrap font-mono text-[10px] text-darinol-muted xl:flex"><span className={["live-status w-[5.75rem] shrink-0", refreshing ? "is-refreshing" : ""].join(" ")}><i aria-hidden="true" />{t.radarActive}</span><span className="shrink-0" aria-hidden="true">·</span><span className="w-32 shrink-0">{updatedAtLabel || "—"}</span></p>
      <nav className="site-header-nav" aria-label={t.mainMenu}>{navButtons}</nav>
      <label className="site-header-search relative hidden w-full max-w-[15rem] xl:block"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-darinol-muted"><SearchIcon /></span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={t.search} aria-label={t.search} className="h-9 w-full rounded-lg border border-darinol-border bg-darinol-surface pl-9 pr-3 text-sm text-darinol-text placeholder:text-darinol-muted transition focus:border-darinol-primary focus:outline-none focus:ring-2 focus:ring-darinol-primary/20" /></label>
    </div>
    <div className="site-header-mobile-search md:hidden">{mobileSearchOpen ? <label id="mobile-search" className="relative block w-full px-4 pb-2 sm:px-6"><span className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-darinol-muted"><SearchIcon /></span><input autoFocus value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={t.search} aria-label={t.search} className="h-10 w-full rounded-lg border border-darinol-border bg-darinol-surface pl-9 pr-3 text-sm text-darinol-text placeholder:text-darinol-muted focus:border-darinol-primary focus:outline-none focus:ring-2 focus:ring-darinol-primary/20" /></label> : null}</div>
    <div className="site-header-mobile-nav-row md:hidden"><nav className="mobile-primary-nav flex min-w-0 flex-1 gap-1 overflow-x-auto" aria-label={t.mainMenu}>{navButtons}</nav><button type="button" onClick={() => setMobileSearchOpen((open) => !open)} aria-expanded={mobileSearchOpen} aria-controls="mobile-search" aria-label={t.search} className="header-icon-button tap-target shrink-0"><SearchIcon /></button></div>
    <p className="site-header-mobile-status flex items-center gap-2 border-t border-darinol-border/50 px-4 py-1.5 font-mono text-[9px] text-darinol-muted sm:px-6 md:hidden"><span className={["live-status w-[5.25rem] shrink-0", refreshing ? "is-refreshing" : ""].join(" ")}><i aria-hidden="true" />{t.radarActive}</span><span className="shrink-0" aria-hidden="true">·</span><span className="w-28 shrink-0">{updatedAtLabel || "—"}</span></p>
  </header>;
}
