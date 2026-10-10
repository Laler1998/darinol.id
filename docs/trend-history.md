# Trend data status and history

Trend percentages are now based on observed hourly snapshots. Before two snapshots exist for a live news topic, the UI says that it is collecting a baseline instead of showing an estimated percentage. Culture and sample/fallback topics are explicitly labeled and are not included in growth calculations.

## Configure persistent history

1. Provision a Neon Postgres database through the Vercel Marketplace and set `DATABASE_URL` in the project environment. The database user must be allowed to create the snapshot table and index on first use. Alternatively, run `db/trend-snapshots.sql` manually.
2. Set a strong `CRON_SECRET` in the same environment.
3. Deploy the project with the hourly Vercel Cron in `vercel.json` enabled.
4. The first successful run records a baseline. Growth is available after a previous snapshot for the same topic and market is between 45 and 150 minutes old.

The job records live news topics only, uses the observed article and source counts, and removes snapshots older than 45 days. Fallback/sample data never enters the history. The cron endpoint requires `Authorization: Bearer $CRON_SECRET`.

Without `DATABASE_URL`, the radar remains available, but growth is explicitly labeled unavailable. Database connection failures are logged and returned as `history_status: "unavailable"`; snapshot-job failures return HTTP 500.
