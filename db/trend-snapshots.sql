CREATE TABLE IF NOT EXISTS darinol_trend_snapshots (
  market TEXT NOT NULL,
  radar_type TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  mention_count INTEGER NOT NULL CHECK (mention_count >= 0),
  source_count INTEGER NOT NULL CHECK (source_count >= 0),
  observed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (market, radar_type, topic_id, observed_at)
);

CREATE INDEX IF NOT EXISTS darinol_trend_snapshots_observed_at_idx
  ON darinol_trend_snapshots (observed_at DESC);
