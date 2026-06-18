import { NextResponse } from "next/server";
import { fetchYouTubeCultureTrends, sampleCultureTrends } from "@/lib/culture-trends";

export async function POST() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      source: "youtube-placeholder",
      status: "needs_api_key",
      note: "YouTube Data API integration is prepared, but YOUTUBE_API_KEY is not configured. Returning sample placeholder culture trends.",
      topics: sampleCultureTrends.filter((trend) =>
        ["music", "gaming", "film", "entertainment", "creator_trend", "lifestyle"].includes(
          trend.culture_category,
        ),
      ),
    });
  }

  const topics = await fetchYouTubeCultureTrends().catch(() => []);

  return NextResponse.json({
    source: topics.length ? "youtube-most-popular" : "youtube-fallback",
    status: topics.length ? "live" : "fallback",
    note: topics.length
      ? "Fetched from YouTube Data API most popular videos for Indonesia."
      : "YouTube Data API did not return culture trends. Returning sample placeholder culture trends.",
    topics: topics.length ? topics : sampleCultureTrends,
  });
}
