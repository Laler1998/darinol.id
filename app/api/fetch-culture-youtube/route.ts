import { NextResponse } from "next/server";
import { sampleCultureTrends } from "@/lib/culture-trends";

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

  return NextResponse.json({
    source: "youtube-prepared",
    status: "prepared",
    note: "YouTube Data API fetch endpoint is reserved for most popular videos by category and region. Live ingestion is not enabled in this MVP response.",
    topics: [],
  });
}
