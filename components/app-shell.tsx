"use client";

import Image from "next/image";
import { ClockIcon, MoonIcon, RefreshIcon, SearchIcon, SunIcon, TrendIcon } from "./icons";
import type { Copy, Language, MainView, ThemeMode } from "@/lib/copy";

export function AppShell({
  search, onSearchChange, updatedAt, onRefresh, refreshing, activeView, onViewChange,
  language, onLanguageChange, themeMode, onThemeToggle, t,
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
  const navigation = [
    { id: "radar" as const, label: t.radarTab, Icon: TrendIcon },
    { id: "latest" as const, label: t.latestTab, Icon: ClockIcon },
  ];

  const controls = (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={onRefresh} disabled={refreshing} aria-label={refreshing ? t.refreshing : t.refresh} className="tap-target grid h-9 w-9 place-items-center rounded-lg border border-darinol-border bg-darinol-surface text-darinol-muted transition hover:border-darinol-primary/50 hover:text-darinol-primaryInk disabled:cursor-wait disabled:opacity-60">
        <RefreshIcon className={refreshing ? "animate-spin" : ""} />
      </button>
      <button type="button" onClick={onThemeToggle} aria-label={themeMode === "dark" ? t.light : t.dark} className="tap-target grid h-9 w-9 place-items-center rounded-lg border border-darinol-border bg-darinol-surface text-darinol-muted transition hover:border-darinol-primary/50 hover:text-darinol-primaryInk">
        {themeMode === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );

  return (
    <>
      <aside className="dashboard-sidebar hidden min-h-screen flex-col lg:sticky lg:top-0 lg:h-screen border-r border-darinol-border/70 bg-darinol-surface/70 px-3 py-5 lg:flex">
        <div className="flex items-center px-2">
          <Image src="/darinol-wordmark.png" alt="Darinol.id" width={270} height={90} className="h-8 w-auto object-contain" priority />
        </div>
        <nav className="mt-9" aria-label="Menu utama">
          <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-darinol-muted">Menu</p>
          <div className="space-y-1">
            {navigation.map(({ id, label, Icon }) => {
              const active = id === activeView;
              return <button key={id} type="button" onClick={() => onViewChange(id)} aria-pressed={active} className={["flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition", active ? "bg-darinol-primary/15 text-darinol-primaryInk" : "text-darinol-muted hover:bg-darinol-primary/8 hover:text-darinol-text"].join(" ")}><Icon className="h-4 w-4" />{label}</button>;
            })}
          </div>
        </nav>
        <div className="mt-8 border-t border-darinol-border/60 pt-5">
          <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-darinol-muted">Status</p>
          <p className="flex items-center gap-2 px-3 text-xs font-medium text-darinol-muted"><span className="h-2 w-2 rounded-full bg-darinol-success" />{t.update} {updatedAt}</p>
        </div>
        <div className="mt-auto space-y-3 px-1">
          <div role="group" aria-label={t.languageSwitcher} className="flex rounded-lg border border-darinol-border bg-darinol-surface p-0.5">
            {(["id", "en"] as const).map((item) => <button key={item} type="button" onClick={() => onLanguageChange(item)} aria-pressed={language === item} className={["h-8 flex-1 rounded-md text-xs font-bold", language === item ? "bg-darinol-primaryFill text-white" : "text-darinol-muted"].join(" ")}>{item.toUpperCase()}</button>)}
          </div>
          {controls}
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-darinol-border/70 bg-darinol-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3"><Image src="/darinol-wordmark.png" alt="Darinol.id" width={270} height={90} className="h-7 w-auto object-contain" priority />{controls}</div>
        <div className="mt-3 flex gap-1 overflow-x-auto" role="group" aria-label={t.viewSwitcher}>{navigation.map(({ id, label, Icon }) => { const active = id === activeView; return <button key={id} type="button" onClick={() => onViewChange(id)} aria-pressed={active} className={["tap-target flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-bold", active ? "bg-darinol-primaryFill text-white" : "border border-darinol-border bg-darinol-surface text-darinol-muted"].join(" ")}><Icon className="h-4 w-4" />{label}</button>; })}</div>
        <label className="relative mt-3 block"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-darinol-muted"><SearchIcon /></span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={t.search} aria-label={t.search} className="h-10 w-full rounded-lg border border-darinol-border bg-darinol-surface pl-9 pr-3 text-sm text-darinol-text placeholder:text-darinol-muted focus:border-darinol-primary focus:outline-none focus:ring-2 focus:ring-darinol-primary/25" /></label>
      </header>
    </>
  );
}