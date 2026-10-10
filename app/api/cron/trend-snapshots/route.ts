import { NextResponse } from "next/server";
import { saveTrendSnapshots } from "@/lib/trend-history";
import type { TrendsPayload } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const origin = new URL(request.url).origin;
    const snapshotId = Date.now();
    const [indonesiaResponse, worldResponse] = await Promise.all([
      fetch(`${origin}/api/trends?radar_type=all&snapshot=${snapshotId}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }),
      fetch(`${origin}/api/trends?radar_type=world&snapshot=${snapshotId}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }),
    ]);

    if (!indonesiaResponse.ok || !worldResponse.ok) {
      throw new Error(
        `Trend collection failed (Indonesia ${indonesiaResponse.status}, world ${worldResponse.status}).`,
      );
    }

    const payloads = await Promise.all([
      indonesiaResponse.json() as Promise<TrendsPayload>,
      worldResponse.json() as Promise<TrendsPayload>,
    ]);
    const snapshots = await saveTrendSnapshots(payloads.flatMap((payload) => payload.topics ?? []));

    return NextResponse.json({
      ...snapshots,
      source_status: payloads.map((payload) => ({
        radar_type: payload.radar_type,
        status: payload.data_status ?? "unavailable",
      })),
    });
  } catch (error) {
    console.error(
      "Trend snapshot job failed.",
      error instanceof Error ? error.message : "Unknown snapshot error",
    );
    return NextResponse.json(
      { error: "Trend snapshot job failed. Check server logs for details." },
      { status: 500 },
    );
  }
}
