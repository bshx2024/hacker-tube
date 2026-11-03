import { NextResponse } from "next/server";
import { CURATED_VIDEOS } from "@/data/videos";

export async function GET() {
  return NextResponse.json(
    {
      meta: {
        platform: "HackerTube",
        version: "1.0.0",
        description: "Community-curated technical videos extracted from Hacker News discussions (2007-2026).",
        license: "MIT / Open Data",
        totalVideos: CURATED_VIDEOS.length,
        generator: "HackerTube AI & Pipeline",
        inspiredBy: "Andrej Karpathy (hackertube.org)",
        updatedAt: new Date().toISOString(),
      },
      videos: CURATED_VIDEOS,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    }
  );
}
