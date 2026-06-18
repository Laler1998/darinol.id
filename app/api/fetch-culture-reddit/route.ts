import { NextResponse } from "next/server";
import { sampleCultureTrends } from "@/lib/culture-trends";

const preparedSubreddits = [
  "indonesia",
  "memes",
  "TikTokCringe",
  "popculturechat",
  "gaming",
  "movies",
  "streetwear",
];

export async function POST() {
  return NextResponse.json({
    source: "reddit-public-json-placeholder",
    status: "prepared",
    note: "Reddit hot/top public JSON feed integration is prepared. Returning sample placeholder culture trends for MVP.",
    subreddits: preparedSubreddits,
    topics: sampleCultureTrends,
  });
}
