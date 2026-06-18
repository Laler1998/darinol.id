import { NextResponse } from "next/server";
import { cultureTrendSources, fetchCultureTrends } from "@/lib/culture-trends";

export async function GET() {
  const payload = await fetchCultureTrends();

  return NextResponse.json({
    source: payload.source,
    updatedAt: new Date().toISOString(),
    radar_type: "culture",
    note: payload.source === "sample-culture-placeholder"
      ? "MVP culture data is sample placeholder data until external source integrations return data."
      : "Culture Radar combines available YouTube and Reddit signals.",
    sources: cultureTrendSources,
    youtube_count: payload.youtube_count,
    reddit_count: payload.reddit_count,
    topics: payload.topics,
  });
}
