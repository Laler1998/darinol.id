import { getCategoryStyle } from "@/lib/categories";
import { getGrowthLabel, getTopicLabel } from "@/lib/format";
import type { Language } from "@/lib/copy";
import type { Topic, TopicArticle } from "@/lib/types";

function latestArticle(articles: TopicArticle[]) {
  return articles.reduce<TopicArticle | null>((latest, article) => {
    if (!latest) return article;
    if (!article.publishedAt) return latest;
    if (!latest.publishedAt || Date.parse(article.publishedAt) > Date.parse(latest.publishedAt)) return article;
    return latest;
  }, null);
}

export function TopicRow({
  topic,
  rank,
  selected,
  language,
  onClick,
}: {
  topic: Topic;
  rank: number;
  selected: boolean;
  language: Language;
  onClick: () => void;
}) {
  const isCulture = topic.radar_type === "culture";
  const label = getTopicLabel(topic, language);
  const style = getCategoryStyle(topic.category, isCulture);
  const articleCount = topic.total_articles ?? topic.articles.length;
  const sourceCount = topic.total_sources ?? new Set(topic.articles.map((article) => article.source)).size;
  const score = topic.culture_score ?? topic.score;
  const newestArticle = latestArticle(topic.articles);
  const previousCount = topic.growth_previous_count;
  const canShowSparkline = topic.radar_type === "news" && typeof previousCount === "number" && (topic.growth_status === "measured" || topic.growth_status === "new");
  const trendDelta = typeof previousCount === "number" ? articleCount - previousCount : null;
  const sparklineColor = trendDelta !== null && trendDelta < 0 ? "#9B9288" : "#FF7A45";
  const sparklineStartY = trendDelta === null || trendDelta === 0 ? 14 : trendDelta > 0 ? 23 : 5;
  const sparklineEndY = trendDelta === null || trendDelta === 0 ? 14 : trendDelta > 0 ? 5 : 23;
  const growthLabel = getGrowthLabel(topic, language);
  const headline = newestArticle?.title ?? "Belum ada berita terbaru";
  const headlineSource = newestArticle?.source ?? "";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
      aria-label={`${rank}. ${topic.name}. ${label}. ${headline}. ${headlineSource}. Skor ${score}. ${articleCount} berita, ${sourceCount} sumber`}
      className={["signal-featured", selected ? "is-selected" : ""].join(" ")}
    >
      <span className="signal-featured-rank">#{rank}</span>
      <span className="signal-featured-content">
        <span className={["signal-category", style.chip].join(" ")}>
          <span className={["signal-category-dot", style.dot].join(" ")} aria-hidden="true" />
          {label}
        </span>
        <span className="signal-featured-name">{topic.name}</span>
        <span className="signal-featured-headline" title={`${headline}${headlineSource ? ` · ${headlineSource}` : ""}`}>
          {headline}{headlineSource ? ` · ${headlineSource}` : ""}
        </span>
        <span className="signal-featured-meta">
          <span>{articleCount} berita · {sourceCount} sumber</span>
          {canShowSparkline ? <svg width="54" height="18" viewBox="0 0 54 18" role="img" aria-label={growthLabel ? `Tren ${growthLabel}` : "Tren berita"}><polyline points={`0,${sparklineStartY * 0.6} 54,${sparklineEndY * 0.6}`} fill="none" stroke={sparklineColor} strokeWidth="1.5" /><circle cx="54" cy={sparklineEndY * 0.6} r="2" fill={sparklineColor} /></svg> : null}
        </span>
      </span>
      <span className="signal-featured-score" aria-label={`Skor ${score} dari 100`}>
        <span className="signal-featured-track"><span style={{ width: `${Math.min(score, 100)}%` }} /></span>
        <span className="signal-featured-score-number">{score}<small>/100</small></span>
      </span>
    </button>
  );
}
