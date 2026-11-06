import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CURATED_VIDEOS } from "@/data/videos";
import { getStudyNoteForVideo } from "@/data/studyNotes";
import { getSlugByTopicName } from "@/data/topics";
import { VideoDetailActions } from "@/components/VideoDetailActions";

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return CURATED_VIDEOS.map((video) => ({
    id: video.id,
  }));
}

export async function generateMetadata(props: VideoPageProps): Promise<Metadata> {
  const { id } = await props.params;
  const video = CURATED_VIDEOS.find((v) => v.id.toLowerCase() === id.toLowerCase());

  if (!video) {
    return {
      title: "Video Not Found",
    };
  }

  const midframeThumb = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
  const pageTitle = `${video.title} (${video.channelTitle}) — AI Study Notes & HN Consensus`;
  const pageDesc = `${video.aiKeyTakeaways[0] || video.hnExcerpt} Full derivations, slide index, and Hacker News consensus. Free & anti-slop on HackerTube.`;

  return {
    title: pageTitle,
    description: pageDesc,
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
  const video = CURATED_VIDEOS.find((v) => v.id.toLowerCase() === id.toLowerCase());

  if (!video) {
    notFound();
  }

  const topicSlug = getSlugByTopicName(video.topic);
  const studyNote = getStudyNoteForVideo(
    video.id,
    video.title,
    video.channelTitle,
    video.topic,
    video.aiKeyTakeaways,
    video.hnExcerpt,
    video.hnAuthor,
    video.youtubeId
  );

  const relatedVideos = CURATED_VIDEOS.filter(
    (v) => v.topic === video.topic && v.id !== video.id
  ).slice(0, 3);

  const midframeThumb = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoObject",
        name: video.title,
        description: video.aiKeyTakeaways.join(". ") || video.hnExcerpt,
        thumbnailUrl: [midframeThumb],
        uploadDate: `${video.publishedYear}-01-01T00:00:00Z`,
        duration: `PT${Math.floor(video.durationSeconds / 60)}M${video.durationSeconds % 60}S`,
        contentUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`,
        author: {
          "@type": "Person",
          name: video.channelTitle,
        },
      },
      {
        "@type": "TechArticle",
        headline: `${video.title}: AI Study Notes & Technical Derivations`,
        description: studyNote.executiveSummary,
        image: midframeThumb,
        author: {
          "@type": "Organization",
          name: "HackerTube Knowledge Community",
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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
                ← {video.topic}
              </Link>
              <Link
                href={`/?v=${video.id}`}
                className="nav-btn nav-btn-primary"
                style={{ padding: "6px 14px", fontSize: "13px" }}
              >
                ▶ Watch in App
              </Link>
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
              {video.topic}
            </Link>
            <span>/</span>
            <span style={{ color: "var(--text-secondary)" }}>{video.title}</span>
          </nav>

          {/* Embedded Video Player Container */}
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              background: "#000",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              marginBottom: "24px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
              title={video.title}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video Metadata Header */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
              <Link
                href={`/topic/${topicSlug}`}
                className="card-topic-tag"
                style={{ fontSize: "12px", padding: "3px 10px" }}
              >
                {video.topic}
              </Link>
              <span style={{ fontSize: "12.5px", color: "var(--accent-amber)", fontWeight: 700 }}>
                ▲ {video.hnMentions} points on Hacker News
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>•</span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                By @{video.hnAuthor} ({video.hnYear})
              </span>
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
              {video.title}
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
              &ldquo;{video.hnExcerpt}&rdquo;
            </p>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
              — Recommended by @{video.hnAuthor} on Hacker News ({video.hnYear})
            </div>
          </div>

          {/* Section 1: Executive Summary */}
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
              ⚡ High-Signal Brief
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "14px", color: "var(--text-primary)" }}>
              Executive Summary &amp; Core Mental Models
            </h2>
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
              Key Timestamps &amp; Slide Breakdown
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
                Mathematical Derivations &amp; Code Insights
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
              Community Consensus &amp; Critical Debates
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
                    <strong style={{ color: "var(--accent-amber)" }}>Counter-Arguments &amp; Trade-offs:</strong>{" "}
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
                    &ldquo;{debate.topCommentQuote}&rdquo; — @{debate.author}
                  </blockquote>
                </div>
              ))}
            </div>
          </section>

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
                High-throughput, low-latency LLM gateway powering AI study companion synthesis.
              </div>
            </div>
            <a
              href="https://apivale.com/?utm_source=hackertube&utm_medium=referral&utm_campaign=video_page_badge"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-btn"
              style={{
                fontSize: "12px",
                padding: "6px 14px",
                borderColor: "rgba(56, 189, 248, 0.4)",
                color: "var(--accent-sky)",
              }}
            >
              Free Playground &amp; Key ↗
            </a>
          </div>

          {/* Section 6: Related Lectures in Same Topic */}
          {relatedVideos.length > 0 && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>
                More High-Signal {video.topic} Lectures
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "16px",
                }}
              >
                {relatedVideos.map((r) => (
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
        </main>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: "24px 0",
            textAlign: "center",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          <div className="container">
            <p>
              HackerTube • Inspired by Andrej Karpathy • High-Signal Tech Talks without Algorithmic Slop
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

