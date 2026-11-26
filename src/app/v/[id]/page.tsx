import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq, or } from "drizzle-orm";
import { db, schema } from "@/core/db";
import { CURATED_VIDEOS, VideoItem } from "@/data/videos";
import { getStudyNoteForVideo, StudyNote } from "@/data/studyNotes";
import { getSlugByTopicName, TOPIC_METADATA } from "@/data/topics";
import { VideoDetailActions } from "@/components/VideoDetailActions";
import { DetailDerivationCTA } from "@/components/DetailDerivationCTA";
import { VideoDetailDwellTracker } from "@/components/VideoDetailDwellTracker";
import { VideoPlayerFacade } from "@/components/VideoPlayerFacade";
import { Footer } from "@/components/Footer";

export const dynamicParams = true;

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

const ALIAS_MAP: Record<string, string> = {
  "micrograd": "karpathy-micrograd",
  "fast-inverse-square-root": "carmack-quake-graphics",
  "inventing-on-principle": "bret-victor-principle",
  "zero-knowledge-proofs": "dan-boneh-crypto-intro",
  "essence-of-calculus-chapter-1": "3b1b-essence-of-calculus",
  "simple-made-easy": "rich-hickey-simple-made-easy",
  "deep-unsupervised-learning": "ilya-sutskever-unsupervised-learning",
  "world-models-jepa": "yann-lecun-world-models-jepa",
};

const REVERSE_ALIAS_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ALIAS_MAP).map(([alias, target]) => [target, alias])
);

export function generateStaticParams() {
  const baseParams = CURATED_VIDEOS.map((video) => ({
    id: video.id,
  }));
  const aliasParams = Object.keys(ALIAS_MAP).map((alias) => ({
    id: alias,
  }));
  return [...baseParams, ...aliasParams];
}

async function resolveVideoAndNote(id: string): Promise<{
  video: VideoItem;
  studyNote: StudyNote;
  isCustom: boolean;
  status: string;
} | null> {
  const targetId = ALIAS_MAP[id.toLowerCase()] || id;
  const curated = CURATED_VIDEOS.find((v) => v.id.toLowerCase() === targetId.toLowerCase());

  if (curated) {
    const studyNote = getStudyNoteForVideo(
      curated.id,
      curated.title,
      curated.channelTitle,
      curated.topic,
      curated.aiKeyTakeaways,
      curated.hnExcerpt,
      curated.hnAuthor,
      curated.youtubeId
    );
    return { video: curated, studyNote, isCustom: false, status: "published" };
  }

  // Check generatedNote in database by slug, youtubeId, or note id
  try {
    const cleanYt = targetId.startsWith("yt-") ? targetId.slice(3) : targetId;
    const dbList = await db
      .select()
      .from(schema.generatedNote)
      .where(
        or(
          eq(schema.generatedNote.slug, targetId),
          eq(schema.generatedNote.youtubeId, cleanYt),
          eq(schema.generatedNote.id, targetId)
        )
      )
      .limit(1);

    if (dbList.length > 0) {
      const gen = dbList[0];
      const canonicalId = gen.slug || `yt-${gen.youtubeId}`;
      const video: VideoItem = {
        id: canonicalId,
        youtubeId: gen.youtubeId,
        title: gen.title,
        channelTitle: gen.channelTitle,
        duration: gen.duration || "30:00",
        durationSeconds: 1800,
        publishedYear: new Date().getFullYear(),
        topic: (gen.topic as any) || "AI & Machine Learning",
        hnMentions: 1,
        hnExcerpt: gen.executiveSummary.slice(0, 160) + "...",
        hnAuthor: "hackertube_community",
        hnYear: new Date().getFullYear(),
        hnDiscussionUrl: gen.youtubeUrl,
        aiKeyTakeaways: JSON.parse(gen.coreMentalModelsJson || "[]").slice(0, 3),
      };

      const studyNote: StudyNote = {
        videoId: canonicalId,
        h1Title: gen.title,
        seoTitle: `${gen.title.slice(0, 38)}... | Notes`,
        seoDescription: `${gen.executiveSummary.slice(0, 140)}...`,
        h2ExecutiveSummary: `Executive Summary & Core Mental Models: ${gen.title}`,
        h2Timestamps: `Key Timestamps & Milestone Breakdown`,
        h2Derivations: `Mathematical Formulations & Algorithmic Proofs`,
        h2Debates: `Hacker News Community Consensus & Technical Debates`,
        h2Faq: `Technical FAQ & Architectural Answers`,
        executiveSummary: gen.executiveSummary,
        coreMentalModels: JSON.parse(gen.coreMentalModelsJson || "[]"),
        keyTimestamps: JSON.parse(gen.keyTimestampsJson || "[]"),
        mathDerivations: JSON.parse(gen.mathDerivationsJson || "[]"),
        hnDebates: JSON.parse(gen.hnDebatesJson || "[]"),
        faqs: JSON.parse(gen.faqsJson || "[]"),
        obsidianFrontmatter: gen.obsidianMarkdown || "",
      };

      return { video, studyNote, isCustom: true, status: gen.status };
    }
  } catch {
    // Database query fallback
  }

  return null;
}

export async function generateMetadata(props: VideoPageProps): Promise<Metadata> {
  const { id } = await props.params;
  const resolved = await resolveVideoAndNote(id);

  if (!resolved) {
    return {
      title: "Video Not Found",
    };
  }

  const { video, studyNote, status } = resolved;
  const midframeThumb = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
  const pageTitle =
    studyNote.seoTitle ||
    `${video.title.length > 38 ? video.title.slice(0, 38) + "..." : video.title} | ${video.channelTitle}`;
  const pageDesc =
    studyNote.seoDescription ||
    `${video.aiKeyTakeaways[0] || video.hnExcerpt} Free AI study notes, derivations and HN consensus on HackerTube.`;

  return {
    title: {
      absolute: pageTitle,
    },
    description: pageDesc,
    robots: status === "private" ? { index: false, follow: false } : { index: true, follow: true },
    alternates: {
      canonical: `https://www.hacker-tube.net/v/${video.id}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `https://www.hacker-tube.net/v/${video.id}`,
      siteName: "HackerTube",
      type: "video.other",
      images: [
        {
          url: midframeThumb,
          width: 480,
          height: 360,
          alt: video.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: [midframeThumb],
    },
  };
}

export default async function VideoPage(props: VideoPageProps) {
  const { id } = await props.params;
  const resolved = await resolveVideoAndNote(id);

  if (!resolved) {
    notFound();
  }

  const { video, studyNote } = resolved;
  const topicSlug = getSlugByTopicName(video.topic);
  const displayTopic = video.topic.replace("&", "and");

  const sameTopicVideos = CURATED_VIDEOS.filter(
    (v) => v.topic === video.topic && v.id !== video.id
  ).slice(0, 4);
  const crossTopicVideos = CURATED_VIDEOS.filter(
    (v) => v.topic !== video.topic && v.id !== video.id
  )
    .sort((a, b) => b.hnMentions - a.hnMentions)
    .slice(0, 4);

  const midframeThumb = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  const videoObject: Record<string, unknown> = {
    "@type": "VideoObject",
    name: video.title,
    description: studyNote.seoDescription || video.aiKeyTakeaways.join(". ") || video.hnExcerpt,
    thumbnailUrl: [midframeThumb],
    uploadDate: `${video.publishedYear}-01-01T00:00:00Z`,
    duration: `PT${Math.floor(video.durationSeconds / 60)}M${video.durationSeconds % 60}S`,
    contentUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`,
    author: {
      "@type": "Person",
      name: video.channelTitle,
    },
    publisher: {
      "@type": "Organization",
      name: "HackerTube",
      url: "https://www.hacker-tube.net",
    },
  };

  if (studyNote.keyTimestamps && studyNote.keyTimestamps.length > 0) {
    videoObject.hasPart = studyNote.keyTimestamps.map((item, idx, arr) => {
      const nextItem = arr[idx + 1];
      const endOffset = nextItem ? nextItem.seconds : video.durationSeconds;
      return {
        "@type": "Clip",
        name: item.title,
        startOffset: item.seconds,
        endOffset: endOffset,
        url: `https://www.hacker-tube.net/v/${video.id}#t=${item.seconds}`,
      };
    });
  }

  const graphList: Record<string, unknown>[] = [
    videoObject,
    {
      "@type": "TechArticle",
      headline: `${video.title}: AI Study Notes & Technical Derivations`,
      description: studyNote.executiveSummary,
      image: midframeThumb,
      author: {
        "@type": "Person",
        name: video.channelTitle,
      },
      publisher: {
        "@type": "Organization",
        name: "HackerTube",
        url: "https://www.hacker-tube.net",
      },
      articleBody: `${studyNote.executiveSummary} ${studyNote.coreMentalModels.join(" ")}`,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.hacker-tube.net",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: video.topic,
          item: `https://www.hacker-tube.net/topic/${topicSlug}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: video.title,
          item: `https://www.hacker-tube.net/v/${video.id}`,
        },
      ],
    },
  ];

  if (studyNote.faqs && studyNote.faqs.length > 0) {
    graphList.push({
      "@type": "FAQPage",
      mainEntity: studyNote.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graphList,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Active Dwell & Scroll Depth Telemetry */}
        <VideoDetailDwellTracker video={video} />

        {/* Top Sticky Header */}
        <header
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(9, 13, 22, 0.85)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "64px",
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              <span
                style={{
                  background: "var(--accent-emerald)",
                  color: "#000",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: 900,
                }}
              >
                H
              </span>
              <span>HackerTube</span>
            </Link>

            <nav style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Link
                href={`/topic/${topicSlug}`}
                className="nav-btn"
                style={{ padding: "6px 14px", fontSize: "13px" }}
              >
                ← {displayTopic}
              </Link>
              <a
                href="#study-notes"
                className="nav-btn nav-btn-primary"
                style={{ padding: "6px 14px", fontSize: "13px" }}
              >
                ⚡ Study Notes &amp; Proofs
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="container" style={{ flex: 1, padding: "36px 20px 80px", maxWidth: "980px" }}>
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: "flex",
              gap: "8px",
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={{ color: "var(--accent-sky)" }}>
              Home
            </Link>
            <span>/</span>
            <Link href={`/topic/${topicSlug}`} style={{ color: "var(--accent-sky)" }}>
              {displayTopic}
            </Link>
            <span>/</span>
            <span style={{ color: "var(--text-secondary)" }}>{video.title}</span>
          </nav>

          {/* Facade Video Player (Instant LCP & Honest 50% Runtime Preview) */}
          <VideoPlayerFacade video={video} midframeThumb={midframeThumb} />

          {/* Video Metadata Header */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
              <Link
                href={`/topic/${topicSlug}`}
                className="card-topic-tag"
                style={{ fontSize: "12px", padding: "3px 10px" }}
              >
                {displayTopic}
              </Link>
              <span style={{ fontSize: "12.5px", color: "var(--accent-amber)", fontWeight: 700 }}>
                ▲ {video.hnMentions} points on Hacker News
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>•</span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                By @{video.hnAuthor} ({video.hnYear})
              </span>
              {ALIAS_MAP[id.toLowerCase()] && (
                <Link
                  href={`/v/${video.id}`}
                  style={{
                    fontSize: "12px",
                    color: "var(--accent-sky)",
                    background: "rgba(56, 189, 248, 0.1)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                  }}
                  title="Canonical lecture page"
                >
                  Canonical: {video.id}
                </Link>
              )}
              {REVERSE_ALIAS_MAP[video.id] && id.toLowerCase() === video.id.toLowerCase() && (
                <Link
                  href={`/v/${REVERSE_ALIAS_MAP[video.id]}`}
                  style={{
                    fontSize: "12px",
                    color: "var(--accent-emerald)",
                    background: "rgba(16, 185, 129, 0.1)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                  title="Target search query deep dive"
                >
                  Guide: /{REVERSE_ALIAS_MAP[video.id]}
                </Link>
              )}
            </div>

            <h1
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: "var(--text-primary)",
                lineHeight: 1.35,
                marginBottom: "8px",
              }}
            >
              {studyNote.h1Title || video.title}
            </h1>

            <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
              Delivered by <strong style={{ color: "var(--text-secondary)" }}>{video.channelTitle}</strong> •
              Released in {video.publishedYear} • Duration: {video.duration}
            </div>
          </div>

          {/* Action Toolbar */}
          <VideoDetailActions video={video} studyNote={studyNote} />

          {/* Top Community Endorsement Quote */}
          <div
            style={{
              padding: "16px 20px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid var(--border-subtle)",
              borderLeft: "3px solid var(--accent-emerald)",
              borderRadius: "var(--radius-md)",
              marginBottom: "36px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                color: "var(--accent-emerald)",
                fontWeight: 700,
                marginBottom: "4px",
              }}
            >
              💬 TOP HACKER NEWS PEER ENDORSEMENT
            </div>
            <p style={{ fontSize: "14px", color: "#e2e8f0", fontStyle: "italic", lineHeight: 1.5 }}>
              “{video.hnExcerpt}”
            </p>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
              — Recommended by @{video.hnAuthor} on Hacker News ({video.hnYear})
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <section
            id="study-notes"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)",
              padding: "32px",
              marginBottom: "32px",
            }}
          >
            <div className="section-eyebrow" style={{ color: "var(--accent-sky)", marginBottom: "8px" }}>
              ⚡ High-Signal Brief
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "14px", color: "var(--text-primary)" }}>
              {studyNote.h2ExecutiveSummary || "Executive Summary and Core Mental Models"}
            </h2>

            <div
              style={{
                marginBottom: "20px",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                border: "1px solid var(--border-subtle)",
                maxWidth: "520px",
              }}
            >
              <img
                src={midframeThumb}
                alt={`${video.title} - ${video.channelTitle} High Definition Keyframe`}
                width={480}
                height={360}
                style={{ width: "100%", height: "auto", display: "block" }}
                loading="lazy"
              />
            </div>

            <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "20px" }}>
              {studyNote.executiveSummary}
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "10px", color: "var(--accent-emerald)" }}>
              Key Mental Models Derived from this Lecture:
            </h3>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {studyNote.coreMentalModels.map((model, idx) => (
                <li key={idx} style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.5 }}>
                  {model}
                </li>
              ))}
            </ul>
          </section>

          {/* Section 2: Key Timestamps & Slide Index */}
          <section
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)",
              padding: "32px",
              marginBottom: "32px",
            }}
          >
            <div className="section-eyebrow" style={{ color: "var(--accent-emerald)", marginBottom: "8px" }}>
              ⏱️ Navigation Index
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px", color: "var(--text-primary)" }}>
              {studyNote.h2Timestamps || "Key Timestamps and Slide Breakdown"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {studyNote.keyTimestamps.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "16px",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <a
                      href={`https://youtu.be/${video.youtubeId}?t=${item.seconds}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        background: "rgba(56, 189, 248, 0.15)",
                        color: "var(--accent-sky)",
                        borderRadius: "4px",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                      }}
                    >
                      ▶ {item.time}
                    </a>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {item.title}
                    </h3>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    <strong>Slide Concept:</strong> {item.slideConcept}
                  </div>
                  <div style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>
                    <strong>Takeaway:</strong> {item.keyTakeaway}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Mathematical Derivations & Code Insights */}
          {studyNote.mathDerivations.length > 0 && (
            <section
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                padding: "32px",
                marginBottom: "32px",
              }}
            >
              <div className="section-eyebrow" style={{ color: "var(--accent-sky)", marginBottom: "8px" }}>
                📐 First-Principles Rigor
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px", color: "var(--text-primary)" }}>
                {studyNote.h2Derivations || "Mathematical Derivations and Code Insights"}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {studyNote.mathDerivations.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "18px",
                      background: "rgba(0, 0, 0, 0.4)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                      {m.title}
                    </h3>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        padding: "10px 14px",
                        background: "rgba(10, 15, 30, 0.8)",
                        borderLeft: "3px solid var(--accent-sky)",
                        color: "#38bdf8",
                        borderRadius: "4px",
                        fontSize: "13.5px",
                        marginBottom: "10px",
                        overflowX: "auto",
                      }}
                    >
                      {m.formula}
                    </div>
                    <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {m.explanation}
                    </p>
                    {m.codeSnippet && (
                      <pre
                        style={{
                          marginTop: "12px",
                          padding: "12px",
                          borderRadius: "6px",
                          background: "#050914",
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          color: "#34d399",
                          overflowX: "auto",
                        }}
                      >
                        {m.codeSnippet}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 4: Hacker News Debates */}
          <section
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)",
              padding: "32px",
              marginBottom: "32px",
            }}
          >
            <div className="section-eyebrow" style={{ color: "var(--accent-amber)", marginBottom: "8px" }}>
              💬 Hacker News Peer Review
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px", color: "var(--text-primary)" }}>
              {studyNote.h2Debates || "Community Consensus and Critical Debates"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {studyNote.hnDebates.map((debate, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "16px",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                    {debate.topic}
                  </h3>
                  <div style={{ fontSize: "13.5px", color: "#e2e8f0", marginBottom: "6px" }}>
                    <strong style={{ color: "var(--accent-emerald)" }}>Consensus:</strong> {debate.consensus}
                  </div>
                  <div style={{ fontSize: "13.5px", color: "#cbd5e1", marginBottom: "10px" }}>
                    <strong style={{ color: "var(--accent-amber)" }}>Counter-Arguments and Trade-offs:</strong>{" "}
                    {debate.counterArgument}
                  </div>
                  <blockquote
                    style={{
                      fontStyle: "italic",
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      borderLeft: "2px solid var(--text-muted)",
                      paddingLeft: "10px",
                    }}
                  >
                    “{debate.topCommentQuote}” — @{debate.author}
                  </blockquote>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Lecture-Specific FAQ */}
          {studyNote.faqs && studyNote.faqs.length > 0 && (
            <section
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                padding: "32px",
                marginBottom: "32px",
              }}
            >
              <div className="section-eyebrow" style={{ color: "var(--accent-sky)", marginBottom: "8px" }}>
                ❓ Technical Questions and Answers
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px", color: "var(--text-primary)" }}>
                {studyNote.h2Faq || "Frequently Asked Technical Questions"}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {studyNote.faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    open={idx === 0}
                    style={{
                      padding: "16px 18px",
                      background: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <summary
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {faq.question}
                    </summary>
                    <p
                      style={{
                        marginTop: "12px",
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                      }}
                    >
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Section 5: APIVALE Ecosystem Partner Attribution */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(90deg, rgba(56, 189, 248, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "var(--radius-md)",
              marginBottom: "36px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 600 }}>
                ⚡ Inference Infrastructure Partner:{" "}
                <span style={{ color: "var(--accent-sky)" }}>APIVALE Cloud</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                High-throughput, low-latency gateway for DeepSeek, Qwen, GLM, Kimi and frontier Chinese models.
              </div>
            </div>
            <a
              href="https://apivale.com/hackertube?utm_source=hackertube&utm_medium=referral&utm_campaign=ai_study_notes&utm_content=inference_badge"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-btn"
              style={{
                fontSize: "12px",
                padding: "6px 14px",
                borderColor: "rgba(56, 189, 248, 0.4)",
                color: "var(--accent-sky)",
              }}
              title="Get unified API access for DeepSeek, Qwen, GLM, Kimi and Doubao"
            >
              Free Playground and Key ↗
            </a>
          </div>

          {/* Section 6: Contextual PLG Instant Derivation CTA (Anti-Bounce) */}
          <DetailDerivationCTA currentVideoTitle={video.title} currentTopic={displayTopic} />

          {/* Section 7: Anti-Dead-End Link Graph (Gefei SEO Rule 3: Out-Degree >= 12) */}
          <div style={{ marginTop: "40px" }}>
            {sameTopicVideos.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>
                  More High-Signal {displayTopic} Lectures
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {sameTopicVideos.map((r) => (
                    <Link
                      key={r.id}
                      href={`/v/${r.id}`}
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        textDecoration: "none",
                        transition: "border-color 0.2s ease, transform 0.2s ease",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "var(--accent-amber)", fontWeight: 700 }}>
                        ▲ {r.hnMentions} HN pts • {r.duration}
                      </span>
                      <h3 style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
                        {r.title}
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{r.channelTitle}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {crossTopicVideos.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>
                  Foundational Masterclasses Across Computing
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {crossTopicVideos.map((r) => (
                    <Link
                      key={r.id}
                      href={`/v/${r.id}`}
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        textDecoration: "none",
                        transition: "border-color 0.2s ease, transform 0.2s ease",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "var(--accent-sky)", fontWeight: 700 }}>
                        ▲ {r.hnMentions} HN pts • {r.topic}
                      </span>
                      <h3 style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
                        {r.title}
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{r.channelTitle}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Exploration Hubs (BFS Depth = 1) */}
            <div
              style={{
                padding: "20px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--text-secondary)" }}>
                Explore Curated Knowledge Hubs (Zero Clickbait)
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {TOPIC_METADATA.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/topic/${topic.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 14px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "12.5px",
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      transition: "border-color 0.2s ease, color 0.2s ease",
                    }}
                  >
                    <span>{topic.icon}</span>
                    <span>{topic.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

