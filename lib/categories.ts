/**
 * Per-category colour tokens.
 *
 * A news radar is scanned, not read top-to-bottom, so category needs to be
 * recognisable pre-attentively. Brand orange stays reserved for actions and the
 * active state; categories get their own hue. All chip pairs were picked to clear
 * 4.5:1 against both the light and dark surface.
 */
type CategoryStyle = {
  /** Chip background + text, light and dark. */
  chip: string;
  /** Solid colour for the leading indicator bar/dot. */
  dot: string;
};

const FALLBACK: CategoryStyle = {
  chip: "bg-slate-500/10 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300",
  dot: "bg-slate-500",
};

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Peristiwa: {
    chip: "bg-rose-500/10 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  Health: {
    chip: "bg-red-500/10 text-red-700 dark:bg-red-400/15 dark:text-red-300",
    dot: "bg-red-500",
  },
  Education: {
    chip: "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  Climate: {
    chip: "bg-lime-500/10 text-lime-800 dark:bg-lime-400/15 dark:text-lime-300",
    dot: "bg-lime-500",
  },
  Science: {
    chip: "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300",
    dot: "bg-cyan-500",
  },
  Food: {
    chip: "bg-orange-500/10 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  Travel: {
    chip: "bg-sky-500/10 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  Business: {
    chip: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  Technology: {
    chip: "bg-violet-500/10 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  Crypto: {
    chip: "bg-amber-500/10 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  Politics: {
    chip: "bg-pink-500/10 text-pink-700 dark:bg-pink-400/15 dark:text-pink-300",
    dot: "bg-pink-500",
  },
  Sports: {
    chip: "bg-teal-500/10 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300",
    dot: "bg-teal-500",
  },
  Entertainment: {
    chip: "bg-fuchsia-500/10 text-fuchsia-700 dark:bg-fuchsia-400/15 dark:text-fuchsia-300",
    dot: "bg-fuchsia-500",
  },
  Global: {
    chip: "bg-blue-500/10 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  Social: {
    chip: "bg-yellow-500/10 text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-300",
    dot: "bg-yellow-500",
  },
  General: FALLBACK,
};

/** Culture signals share one hue so they read as a family, not as news categories. */
const CULTURE_STYLE: CategoryStyle = {
  chip: "bg-darinol-primary/10 text-darinol-primaryInk dark:bg-darinol-primary/20",
  dot: "bg-darinol-primary",
};

export function getCategoryStyle(category: string, isCulture = false): CategoryStyle {
  if (isCulture) return CULTURE_STYLE;

  return CATEGORY_STYLES[category] ?? FALLBACK;
}
