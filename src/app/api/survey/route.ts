import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface SurveySubmissionPayload {
  desiredFeature: string;
  pricingPreference: string;
  role?: string;
  feedback?: string;
  contact?: string;
  source?: string;
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

    const payload: SurveySubmissionPayload = JSON.parse(rawBody);

    if (!payload.desiredFeature || !payload.pricingPreference) {
      return NextResponse.json(
        { success: false, error: "Feature and pricing preferences are required." },
        { status: 400 }
      );
    }

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const country =
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-country-code") ||
      "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    const record = {
      type: "geek_survey_response",
      desiredFeature: payload.desiredFeature,
      pricingPreference: payload.pricingPreference,
      role: payload.role || "undisclosed",
      feedback: (payload.feedback || "").trim(),
      contact: (payload.contact || "").trim(),
      source: payload.source || "web_modal",
      ip: clientIp,
      country,
      ua: userAgent,
      timestamp: new Date().toISOString(),
    };

    // 1. Output structured JSON line in server logs (Vercel / Cloudflare runtime logging)
    console.log(`[HT-SURVEY] ${JSON.stringify(record)}`);

    // 2. Append to local JSONL audit file if file system is writable
    try {
      const reportsDir = path.join(process.cwd(), "reports");
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      const jsonlPath = path.join(reportsDir, "survey_responses.jsonl");
      await fs.promises.appendFile(jsonlPath, JSON.stringify(record) + "\n", "utf-8");
    } catch {
      // Silently continue if running in read-only serverless environment
    }

    return NextResponse.json({
      success: true,
      message: "Thank you, fellow hacker! Your vote and pricing preference have been recorded.",
      record: {
        desiredFeature: record.desiredFeature,
        pricingPreference: record.pricingPreference,
      },
    });
  } catch (err) {
    console.error("[HT-SURVEY-ERR]", err);
    return NextResponse.json(
      { success: false, error: "Malformed survey submission payload" },
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
