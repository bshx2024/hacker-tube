import { NextRequest, NextResponse } from "next/server";

interface SuggestionPayload {
  youtubeUrl: string;
  title: string;
  channelTitle?: string;
  hnUrl?: string;
  topic?: string;
  reason?: string;
  authorHandle?: string;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json(
        { success: false, error: "Empty request payload" },
        { status: 400 }
      );
    }

    const payload: SuggestionPayload = JSON.parse(rawBody);

    if (!payload.youtubeUrl || !payload.title) {
      return NextResponse.json(
        { success: false, error: "YouTube URL and Talk Title are required." },
        { status: 400 }
      );
    }

    // Extract YouTube ID
    const ytMatch = payload.youtubeUrl.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
    );
    const parsedYoutubeId = ytMatch ? ytMatch[1] : payload.youtubeUrl.trim();

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";
    const country =
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-country-code") ||
      "unknown";

    const record = {
      type: "user_suggestion",
      youtubeId: parsedYoutubeId,
      youtubeUrl: payload.youtubeUrl,
      title: payload.title.trim(),
      channelTitle: payload.channelTitle?.trim() || "Unknown Speaker",
      hnUrl: payload.hnUrl?.trim() || "",
      topic: payload.topic || "AI & Machine Learning",
      reason: payload.reason?.trim() || "",
      authorHandle: payload.authorHandle?.trim() || "anonymous_geek",
      ip: clientIp,
      country,
      timestamp: new Date().toISOString(),
    };

    // Output structured JSON line in server logs for audit & batch ingestion
    console.log(`[HT-SUGGESTION] ${JSON.stringify(record)}`);

    return NextResponse.json({
      success: true,
      message: "Thank you! Your talk proposal has been submitted to the community curation review queue.",
      record: {
        youtubeId: record.youtubeId,
        title: record.title,
      },
    });
  } catch (err) {
    console.error("[HT-SUGGESTION-ERR]", err);
    return NextResponse.json(
      { success: false, error: "Malformed request payload" },
      { status: 400 }
    );
  }
}

