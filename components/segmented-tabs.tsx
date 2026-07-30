"use client";

import { ClockIcon, TrendIcon } from "./icons";
import type { Copy, MainView } from "@/lib/copy";

/**
 * Tabs carry both icon and label — icon-only navigation hurts discoverability.
 *
 * Deliberately NOT role="tablist"/"tab": that pattern promises an associated
 * tabpanel and arrow-key traversal, neither of which applies here (the switch
 * swaps the whole main region). A pressed-button group states the same thing
 * without making promises the widget does not keep.
 */
export function SegmentedTabs({
  activeView,
  onChange,
  t,
}: {
  activeView: MainView;
  onChange: (view: MainView) => void;
  t: Copy;
}) {
  const tabs = [
    { id: "radar" as const, label: t.radarTab, Icon: TrendIcon },
    { id: "latest" as const, label: t.latestTab, Icon: ClockIcon },
  ];

  return (
    <div
      role="group"
      aria-label={t.viewSwitcher}
      className="flex gap-1 rounded-full border border-darinol-border bg-darinol-surface/70 p-1"
    >
      {tabs.map(({ id, label, Icon }) => {
        const active = activeView === id;

        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={[
              "tap-target flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition sm:px-4",
              active
                ? "bg-darinol-primaryFill text-white shadow-[0_6px_16px_rgba(255,122,69,0.28)]"
                : "text-darinol-muted hover:bg-darinol-primary/8 hover:text-darinol-text",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
