import { getCategoryStyle } from "@/lib/categories";
import { getTopicLabel, getGrowthLabel } from "@/lib/format";
import type { Language } from "@/lib/copy";
import type { Topic } from "@/lib/types";

export function RadarOverview({
  topics,
  signalCount,
  sourceCount,
  articleCount,
  selectedTopicId,
  onSelectTopic,
  language,
}: {
  topics: Topic[];
  signalCount: number;
  sourceCount: number;
  articleCount: number;
  selectedTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
  language: Language;
}) {
  return (
    <aside className="radar-overview" aria-label="Ringkasan radar aktif">
      <h2 className="radar-overview-title"><span aria-hidden="true" />Radar Aktif</h2>
      <div className="radar-overview-stats">
        <div><strong>{signalCount}</strong><span>Sinyal</span></div>
        <div><strong>{sourceCount}</strong><span>Sumber</span></div>
        <div><strong>{articleCount}</strong><span>Berita</span></div>
      </div>
      <h3 className="radar-overview-ranking-title">Peringkat 4-8</h3>
      {topics.length ? <ol className="radar-overview-ranking" start={4}>
        {topics.map((topic, index) => {
          const style = getCategoryStyle(topic.category, topic.radar_type === "culture");
          const score = topic.culture_score ?? topic.score;
          const growth = getGrowthLabel(topic, language);
          return <li key={topic.id}>
            <button type="button" className={selectedTopicId === topic.id ? "is-selected" : ""} onClick={() => onSelectTopic(topic.id)} aria-current={selectedTopicId === topic.id ? "true" : undefined}>
              <span className="radar-overview-rank">#{index + 4}</span>
              <span className={["radar-overview-dot", style.dot].join(" ")} aria-hidden="true" />
              <span className="radar-overview-topic">{topic.name}</span>
              <span className="radar-overview-score">{score}</span>
              {growth ? <span className="radar-overview-growth">{growth}</span> : null}
              <span className="sr-only">{getTopicLabel(topic, language)}</span>
            </button>
          </li>;
        })}
      </ol> : <p className="radar-overview-empty">Belum ada sinyal lanjutan.</p>}
      <a className="radar-overview-link" href="#recent-trends">Lihat semua sinyal <span aria-hidden="true">→</span></a>
    </aside>
  );
}