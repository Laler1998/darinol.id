"use client";

import Image from "next/image";
import { ClockIcon, MoonIcon, RefreshIcon, SearchIcon, SunIcon, TrendIcon } from "./icons";
import type { Copy, Language, MainView, ThemeMode } from "@/lib/copy";

export function AppShell({ search, onSearchChange, updatedAt, onRefresh, refreshing, activeView, onViewChange, language, onLanguageChange, themeMode, onThemeToggle, t }: {
  search: string; onSearchChange: (value: string) => void; updatedAt: string; onRefresh: () => void; refreshing: boolean; activeView: MainView; onViewChange: (view: MainView) => void; language: Language; onLanguageChange: (language: Language) => void; themeMode: ThemeMode; onThemeToggle: () => void; t: Copy;
}) {
  const navigation = [{ id: "radar" as const, label: t.radarTab, Icon: TrendIcon }, { id: "latest" as const, label: t.latestTab, Icon: ClockIcon }];
  const navButtons = navigation.map(({ id, label, Icon }) => { const active = id === activeView; return <button key={id} type="button" onClick={() => onViewChange(id)} aria-pressed={active} className={["tap-target flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-bold transition sm:text-sm", active ? "bg-darinol-primaryFill text-white shadow-[0_4px_10px_rgba(255,122,69,0.22)]" : "text-darinol-muted hover:bg-darinol-primary/10 hover:text-darinol-text"].join(" ")}><Icon className="h-4 w-4" />{label}</button>; });

  return <header className="sticky top-0 z-40 border-b border-darinol-border/70 bg-darinol-background/95 backdrop-blur-xl">
    <div className="mx-auto flex min-h-16 w-full max-w-[1600px] items-center gap-2 px-4 sm:px-6 lg:px-10">
      <Image src="/darinol-wordmark.png" alt="Darinol.id" width={270} height={90} className="h-7 w-auto shrink-0 object-contain sm:h-8" priority />
      <nav className="ml-2 hidden items-center gap-1 border-l border-darinol-border/70 pl-3 md:flex" aria-label="Menu utama">{navButtons}</nav>
      <label className="relative ml-auto hidden w-full max-w-sm lg:block"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-darinol-muted"><SearchIcon /></span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={t.search} aria-label={t.search} className="h-10 w-full rounded-lg border border-darinol-border bg-darinol-surface pl-9 pr-3 text-sm text-darinol-text placeholder:text-darinol-muted transition focus:border-darinol-primary focus:outline-none focus:ring-2 focus:ring-darinol-primary/20" /></label>
      <p className="ml-auto hidden whitespace-nowrap text-[11px] font-medium text-darinol-muted xl:block">{t.update} {updatedAt}</p>
      <div role="group" aria-label={t.languageSwitcher} className="hidden h-9 rounded-lg border border-darinol-border bg-darinol-surface p-0.5 sm:flex">{(["id", "en"] as const).map((item) => <button key={item} type="button" onClick={() => onLanguageChange(item)} aria-pressed={language === item} className={["rounded-md px-2 text-[11px] font-bold", language === item ? "bg-darinol-primaryFill text-white" : "text-darinol-muted hover:text-darinol-text"].join(" ")}>{item.toUpperCase()}</button>)}</div>
      <button type="button" onClick={onRefresh} disabled={refreshing} aria-label={refreshing ? t.refreshing : t.refresh} className="tap-target grid h-9 w-9 place-items-center rounded-lg border border-darinol-border bg-darinol-surface text-darinol-muted transition hover:border-darinol-primary/50 hover:text-darinol-primaryInk disabled:cursor-wait disabled:opacity-60"><RefreshIcon className={refreshing ? "animate-spin" : ""} /></button>
      <button type="button" onClick={onThemeToggle} aria-label={themeMode === "dark" ? t.light : t.dark} className="tap-target grid h-9 w-9 place-items-center rounded-lg border border-darinol-border bg-darinol-surface text-darinol-muted transition hover:border-darinol-primary/50 hover:text-darinol-primaryInk">{themeMode === "dark" ? <SunIcon /> : <MoonIcon />}</button>
    </div>
    <div className="border-t border-darinol-border/50 px-4 py-2 md:hidden"><nav className="mx-auto flex w-full max-w-[1600px] gap-1 overflow-x-auto" aria-label="Menu utama">{navButtons}</nav><label className="relative mx-auto mt-2 block w-full max-w-[1600px]"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-darinol-muted"><SearchIcon /></span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={t.search} aria-label={t.search} className="h-10 w-full rounded-lg border border-darinol-border bg-darinol-surface pl-9 pr-3 text-sm text-darinol-text placeholder:text-darinol-muted focus:border-darinol-primary focus:outline-none focus:ring-2 focus:ring-darinol-primary/20" /></label></div>
  </header>;
}