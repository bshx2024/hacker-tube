import { NextRequest, NextResponse } from "next/server";

interface IngestionEvent {
  event_name: string;
  anonymous_id?: string;
  properties?: Record<string, unknown>;
  page_url?: string;
  referrer?: string;
  timestamp?: number;
  first_source?: string;
  first_medium?: string;
  first_campaign?: string;
  last_source?: string;
  geek_source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json({ success: false, error: "Empty body" }, { status: 400 });
    }

    const payload: IngestionEvent = JSON.parse(rawBody);

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const country =
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-country-code") ||
      "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    const enrichedRecord = {
      event: payload.event_name,
      anon_id: payload.anonymous_id || "anonymous",
      props: payload.properties || {},
      page_url: payload.page_url || "",
      referrer: payload.referrer || "",
      first_source: payload.first_source || "direct",
      last_source: payload.last_source || payload.first_source || "direct",
      geek_source: payload.geek_source || "direct",
      ip: clientIp,
      country,
      ua: userAgent,
      ts: payload.timestamp || Math.floor(Date.now() / 1000),
    };

    // Output structured JSON line in server logs (readily indexable by Cloudflare / Vercel / Logtail)
    console.log(`[HT-EVENT] ${JSON.stringify(enrichedRecord)}`);

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("[HT-EVENT-ERR]", err);
    return NextResponse.json(
      { success: false, error: "Malformed event" },
      { status: 400 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
