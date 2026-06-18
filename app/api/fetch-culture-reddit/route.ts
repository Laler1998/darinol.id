import { NextResponse } from "next/server";
import { cultureSubreddits, fetchRedditCultureTrends, sampleCultureTrends } from "@/lib/culture-trends";

export async function POST() {
  const topics = await fetchRedditCultureTrends().catch(() => []);

  return NextResponse.json({
    source: topics.length ? "reddit-public-json" : "reddit-public-json-fallback",
    status: topics.length ? "live" : "fallback",
    note: topics.length
      ? "Fetched from Reddit public hot JSON feeds."
      : "Reddit public JSON fetch did not return data. Returning sample placeholder culture trends.",
    subreddits: cultureSubreddits,
    topics: topics.length ? topics : sampleCultureTrends,
  });
}
