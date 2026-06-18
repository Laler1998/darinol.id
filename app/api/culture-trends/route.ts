import { NextResponse } from "next/server";
import { cultureTrendSources, sampleCultureTrends } from "@/lib/culture-trends";

export async function GET() {
  return NextResponse.json({
    source: "sample-culture-placeholder",
    updatedAt: new Date().toISOString(),
    radar_type: "culture",
    note: "MVP culture data is sample placeholder data until external source integrations are enabled.",
    sources: cultureTrendSources,
    topics: sampleCultureTrends,
  });
}
