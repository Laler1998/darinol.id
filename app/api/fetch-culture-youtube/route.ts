import { NextResponse } from "next/server";
import { fetchYouTubeCultureTrends, sampleCultureTrends } from "@/lib/culture-trends";

async function handleYouTubeCultureFetch() {
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
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const topics = await fetchYouTubeCultureTrends();

    return NextResponse.json({
      source: topics.length ? "youtube-most-popular" : "youtube-fallback",
      status: topics.length ? "live" : "fallback",
      note: topics.length
        ? "Fetched from YouTube Data API most popular videos for Indonesia."
        : "YouTube Data API returned no videos. Returning sample placeholder culture trends.",
      topics: topics.length ? topics : sampleCultureTrends,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({
      source: "youtube-error-fallback",
      status: "fallback",
      note: "YouTube Data API request failed. Returning sample placeholder culture trends.",
      error: error instanceof Error ? error.message : "Unknown YouTube API error",
      topics: sampleCultureTrends,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}

export async function GET() {
  return handleYouTubeCultureFetch();
}

export async function POST() {
  return handleYouTubeCultureFetch();
}
