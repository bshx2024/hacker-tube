import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { auth } from "@/core/auth";
import { db, schema } from "@/core/db";
import {
  extractYouTubeId,
  fetchYouTubeMeta,
  fetchYouTubeTranscript,
  generateStudyNote,
} from "@/core/services/noteGenerator";
import { StudyNote } from "@/data/studyNotes";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "invalid_url", message: "Please provide a valid YouTube video URL." },
        { status: 400 }
      );
    }

    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      return NextResponse.json(
        {
          error: "invalid_youtube_id",
          message: "Could not identify a valid YouTube video ID from the provided URL.",
        },
        { status: 400 }
      );
    }

    // Step 1: Check Global Deduplication Cache in Database
    const existingList = await db
      .select()
      .from(schema.generatedNote)
      .where(eq(schema.generatedNote.youtubeId, youtubeId))
      .limit(1);

    if (existingList.length > 0) {
      const existing = existingList[0];

      // Increment view count asynchronously
      db.update(schema.generatedNote)
        .set({ viewCount: (existing.viewCount || 1) + 1 })
        .where(eq(schema.generatedNote.id, existing.id))
        .catch(() => {});

      // Parse JSON columns back into StudyNote
      const studyNote: StudyNote = {
        videoId: `yt-${existing.youtubeId}`,
        h1Title: existing.title,
        seoTitle: `${existing.title.slice(0, 38)}... | Notes`,
        seoDescription: `${existing.executiveSummary.slice(0, 140)}...`,
        h2ExecutiveSummary: `Executive Summary & Core Mental Models: ${existing.title}`,
        h2Timestamps: `Key Timestamps & Milestone Breakdown`,
        h2Derivations: `Mathematical Formulations & Algorithmic Proofs`,
        h2Debates: `Hacker News Community Consensus & Technical Debates`,
        h2Faq: `Technical FAQ & Architectural Answers`,
        executiveSummary: existing.executiveSummary,
        coreMentalModels: JSON.parse(existing.coreMentalModelsJson || "[]"),
        keyTimestamps: JSON.parse(existing.keyTimestampsJson || "[]"),
        mathDerivations: JSON.parse(existing.mathDerivationsJson || "[]"),
        hnDebates: JSON.parse(existing.hnDebatesJson || "[]"),
        faqs: JSON.parse(existing.faqsJson || "[]"),
        obsidianFrontmatter: existing.obsidianMarkdown || "",
      };

      return NextResponse.json({
        success: true,
        isCached: true,
        note: studyNote,
        video: {
          id: `yt-${existing.youtubeId}`,
          title: existing.title,
          channelTitle: existing.channelTitle,
          youtubeId: existing.youtubeId,
          topic: existing.topic,
          duration: existing.duration || "30:00",
          hnPoints: 250,
          hnComments: 120,
          aiKeyTakeaways: studyNote.coreMentalModels.slice(0, 3),
        },
      });
    }

    // Step 2: Authentication Check for New Derivations
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "auth_required",
          message: "Please sign in with Google or GitHub to generate new AI lecture notes (5 free credits included).",
        },
        { status: 401 }
      );
    }

    // Step 3: Check User Credits and Plan
    const dbUserList = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, session.user.id))
      .limit(1);

    const currentUser = dbUserList[0] || session.user;
    const isPro = currentUser.plan === "pro";
    const credits = typeof currentUser.credits === "number" ? currentUser.credits : 5;

    if (!isPro && credits <= 0) {
      return NextResponse.json(
        {
          error: "insufficient_credits",
          paywall: true,
          message: "You have used all your free derivation credits. Upgrade to HackerTube Pro for unlimited derivations or buy a 10-credit pack.",
        },
        { status: 402 }
      );
    }

    // Step 4: Fetch Metadata and Transcript
    const [meta, transcriptData] = await Promise.all([
      fetchYouTubeMeta(youtubeId),
      fetchYouTubeTranscript(youtubeId),
    ]);

    // Step 5: Generate Deep Structured Study Note (1600+ words guaranteed)
    const result = await generateStudyNote({
      youtubeId,
      title: meta.title,
      channelTitle: meta.channelTitle,
      transcript: transcriptData.rawText,
      segments: transcriptData.segments,
    });

    // Step 6: Anti-Thin Content Guardrail
    // If word count >= 1200 words, mark as 'published' for public SEO indexing; else 'private'
    const status = result.wordCount >= 1200 ? "published" : "private";

    // Step 7: Save to Database
    const noteId = `note_${nanoid(16)}`;
    await db.insert(schema.generatedNote).values({
      id: noteId,
      youtubeId,
      youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      title: meta.title,
      channelTitle: meta.channelTitle,
      thumbnailUrl: result.thumbnailUrl,
      topic: result.topic,
      duration: "30:00",
      executiveSummary: result.studyNote.executiveSummary,
      coreMentalModelsJson: JSON.stringify(result.studyNote.coreMentalModels),
      keyTimestampsJson: JSON.stringify(result.studyNote.keyTimestamps),
      mathDerivationsJson: JSON.stringify(result.studyNote.mathDerivations),
      hnDebatesJson: JSON.stringify(result.studyNote.hnDebates),
      faqsJson: JSON.stringify(result.studyNote.faqs || []),
      obsidianMarkdown: result.studyNote.obsidianFrontmatter,
      status,
      wordCount: result.wordCount,
      creatorUserId: session.user.id,
      creatorEmail: session.user.email,
      viewCount: 1,
    });

    // Step 8: Deduct Credit if not Pro
    let remainingCredits = credits;
    if (!isPro) {
      remainingCredits = Math.max(0, credits - 1);
      await db
        .update(schema.user)
        .set({ credits: remainingCredits })
        .where(eq(schema.user.id, session.user.id));
    }

    return NextResponse.json({
      success: true,
      isCached: false,
      creditsLeft: remainingCredits,
      note: result.studyNote,
      video: {
        id: `yt-${youtubeId}`,
        title: meta.title,
        channelTitle: meta.channelTitle,
        youtubeId,
        topic: result.topic,
        duration: "30:00",
        hnPoints: 100,
        hnComments: 45,
        aiKeyTakeaways: result.studyNote.coreMentalModels.slice(0, 3),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error generating note.";
    console.error("Note generation error:", err);
    return NextResponse.json({ error: "generation_failed", message: errorMsg }, { status: 500 });
  }
}

