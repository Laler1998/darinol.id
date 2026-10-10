import { neon } from "@neondatabase/serverless";
import { calculateGrowth } from "@/lib/growth";
import type { Topic } from "@/lib/types";

type SnapshotRow = {
  market: string;
  radar_type: string;
  topic_id: string;
  topic_name: string;
  mention_count: number;
  source_count: number;
  observed_at: string;
};

type TrendSnapshot = {
  market: string;
  radarType: string;
  topicId: string;
  topicName: string;
  mentionCount: number;
  sourceCount: number;
  observedAt: string;
};

let sqlClient: ReturnType<typeof neon> | null = null;
let schemaReady = false;

function getSqlClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  sqlClient ??= neon(connectionString);
  return sqlClient;
}

async function ensureSchema() {
  if (schemaReady) return;
  const sql = getSqlClient();
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS darinol_trend_snapshots (
      market TEXT NOT NULL,
      radar_type TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      topic_name TEXT NOT NULL,
      mention_count INTEGER NOT NULL CHECK (mention_count >= 0),
      source_count INTEGER NOT NULL CHECK (source_count >= 0),
      observed_at TIMESTAMPTZ NOT NULL,
      PRIMARY KEY (market, radar_type, topic_id, observed_at)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS darinol_trend_snapshots_observed_at_idx
    ON darinol_trend_snapshots (observed_at DESC)
  `;
  schemaReady = true;
}

function topicMarket(topic: Topic) {
  return topic.market ?? (topic.radar_type === "culture" ? "global" : "indonesia");
}

function snapshotKey(row: Pick<SnapshotRow, "market" | "radar_type" | "topic_id">) {
  return `${row.market}:${row.radar_type}:${row.topic_id}`;
}

export async function applyHistoricalGrowth(topics: Topic[]) {
  const sql = getSqlClient();
  if (!sql) {
    return {
      history_status: "unconfigured" as const,
      topics: topics.map((topic) => {
        const canMeasure = topic.data_status === "live" && topic.radar_type === "news";
        return {
          ...topic,
          growth: canMeasure ? "Riwayat belum aktif" : "Belum diukur",
          growth_percent: null,
          growth_status: canMeasure ? "unavailable" as const : "not_measured" as const,
        };
      }),
    };
  }

  await ensureSchema();
  const rows = (await sql`
    SELECT DISTINCT ON (market, radar_type, topic_id)
      market, radar_type, topic_id, topic_name, mention_count, source_count, observed_at
    FROM darinol_trend_snapshots
    WHERE observed_at <= NOW() - INTERVAL '22 hours'
      AND observed_at >= NOW() - INTERVAL '26 hours'
    ORDER BY market, radar_type, topic_id, observed_at DESC
  `) as SnapshotRow[];
  const baselines = new Map(rows.map((row) => [snapshotKey(row), row]));

  return {
    history_status: "ready" as const,
    topics: topics.map((topic) => {
      if (topic.data_status !== "live" || topic.radar_type !== "news") {
        return {
          ...topic,
          growth: "Belum diukur",
          growth_percent: null,
          growth_status: "not_measured" as const,
        };
      }

      const baseline = baselines.get(snapshotKey({
        market: topicMarket(topic),
        radar_type: topic.radar_type,
        topic_id: topic.id,
      }));
      const currentCount = topic.total_articles ?? topic.articles.length;
      const measurement = calculateGrowth(baseline?.mention_count ?? null, currentCount);

      return {
        ...topic,
        ...measurement,
        growth: measurement.growth_status === "measured"
          ? `${measurement.growth_percent! >= 0 ? "+" : ""}${measurement.growth_percent}%`
          : measurement.growth_status === "new"
            ? "Baru muncul"
            : "Mengumpulkan baseline",
        growth_previous_count: baseline?.mention_count ?? null,
        growth_observed_at: baseline?.observed_at ?? null,
        whyViral: baseline
          ? [
              ...topic.whyViral,
              `Jumlah artikel berubah dari ${baseline.mention_count} menjadi ${currentCount} sejak snapshot ${new Date(baseline.observed_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}.`,
            ]
          : topic.whyViral,
      };
    }),
  };
}

export async function saveTrendSnapshots(topics: Topic[]) {
  const sql = getSqlClient();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured.");
  }

  await ensureSchema();
  const observedAt = new Date();
  observedAt.setUTCMinutes(0, 0, 0);
  const snapshots: TrendSnapshot[] = topics
    .filter((topic) => topic.radar_type === "news" && topic.data_status === "live")
    .map((topic) => ({
      market: topicMarket(topic),
      radarType: topic.radar_type,
      topicId: topic.id,
      topicName: topic.name,
      mentionCount: topic.total_articles ?? topic.articles.length,
      sourceCount: topic.total_sources ?? new Set(topic.articles.map((article) => article.source)).size,
      observedAt: observedAt.toISOString(),
    }));

  if (!snapshots.length) {
    return { saved: 0, observedAt: observedAt.toISOString() };
  }

  const snapshotRecords = snapshots.map((snapshot) => ({
    market: snapshot.market,
    radar_type: snapshot.radarType,
    topic_id: snapshot.topicId,
    topic_name: snapshot.topicName,
    mention_count: snapshot.mentionCount,
    source_count: snapshot.sourceCount,
    observed_at: snapshot.observedAt,
  }));

  await sql`
    INSERT INTO darinol_trend_snapshots (
      market, radar_type, topic_id, topic_name, mention_count, source_count, observed_at
    )
    SELECT market, radar_type, topic_id, topic_name, mention_count, source_count, observed_at
    FROM jsonb_to_recordset(${JSON.stringify(snapshotRecords)}::jsonb) AS snapshot_rows(
      market TEXT,
      radar_type TEXT,
      topic_id TEXT,
      topic_name TEXT,
      mention_count INTEGER,
      source_count INTEGER,
      observed_at TIMESTAMPTZ
    )
    ON CONFLICT (market, radar_type, topic_id, observed_at)
    DO UPDATE SET
      topic_name = EXCLUDED.topic_name,
      mention_count = EXCLUDED.mention_count,
      source_count = EXCLUDED.source_count
  `;
  await sql`
    DELETE FROM darinol_trend_snapshots
    WHERE observed_at < NOW() - INTERVAL '45 days'
  `;

  return { saved: snapshots.length, observedAt: observedAt.toISOString() };
}
