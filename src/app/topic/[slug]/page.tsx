import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CURATED_VIDEOS } from "@/data/videos";
import { TOPIC_METADATA, getTopicBySlug } from "@/data/topics";
import { Footer } from "@/components/Footer";
import { db, schema } from "@/core/db";
import { eq, and } from "drizzle-orm";

interface TopicPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return TOPIC_METADATA.map((topic) => ({
    slug: topic.slug,
  }));
}

export async function generateMetadata(props: TopicPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    return {
      title: "Topic Not Found",
    };
  }

  const videos = CURATED_VIDEOS.filter((v) => v.topic === topic.name);

  return {
    title: topic.title,
    description: `${topic.description} Explore ${videos.length} foundational engineering lectures vetted by 20 years of Hacker News comments.`,
    alternates: {
      canonical: `https://www.hacker-tube.net/topic/${slug}`,
    },
    openGraph: {
      title: `${topic.title} | HackerTube`,
      description: topic.description,
      url: `https://www.hacker-tube.net/topic/${slug}`,
      siteName: "HackerTube",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${topic.title} | HackerTube`,
      description: topic.description,
    },
  };
}

export default async function TopicPage(props: TopicPageProps) {
  const { slug } = await props.params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const videos = CURATED_VIDEOS.filter((v) => v.topic === topic.name).sort(
    (a, b) => b.hnMentions - a.hnMentions
  );

  let communityNotes: (typeof schema.generatedNote.$inferSelect)[] = [];
  try {
    communityNotes = await db
      .select()
      .from(schema.generatedNote)
      .where(and(eq(schema.generatedNote.topic, topic.name), eq(schema.generatedNote.status, "published")))
      .limit(12);
  } catch {}

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: topic.title,
    description: topic.description,
    url: `https://www.hacker-tube.net/topic/${slug}`,
    breadcrumb: {
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
          name: "Topics",
          item: "https://www.hacker-tube.net/#videos",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: topic.name,
          item: `https://www.hacker-tube.net/topic/${slug}`,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: videos.map((video, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://www.hacker-tube.net/v/${video.id}`,
        name: video.title,
        description: video.aiKeyTakeaways[0] || video.hnExcerpt,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Simple Static Header */}
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

            <nav style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <Link
                href="/"
                className="nav-btn"
                style={{ padding: "6px 14px", fontSize: "13px" }}
              >
                ← All Curated Talks
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="container" style={{ flex: 1, padding: "40px 20px 80px" }}>
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: "flex",
              gap: "8px",
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "24px",
            }}
          >
            <Link href="/" style={{ color: "var(--accent-sky)" }}>
              Home
            </Link>
            <span>/</span>
            <span>Topics</span>
            <span>/</span>
            <span style={{ color: "var(--text-secondary)" }}>{topic.name}</span>
          </nav>

          {/* Topic Hero Banner */}
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)",
              padding: "36px 32px",
              marginBottom: "40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "300px",
                height: "300px",
                background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div
              className="section-eyebrow"
              style={{
                color: "var(--accent-sky)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "12px",
              }}
            >
              <span>{topic.icon}</span>
              <span>{topic.badge} • 20 Years Hacker News Archive</span>
            </div>

            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "var(--text-primary)",
                lineHeight: 1.3,
                marginBottom: "14px",
              }}
            >
              {topic.title}
            </h1>

            <p
              style={{
                fontSize: "15px",
                color: "var(--text-secondary)",
                maxWidth: "760px",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              {topic.description}
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "12.5px",
                  fontFamily: "var(--font-mono)",
                  background: "rgba(16, 185, 129, 0.12)",
                  color: "var(--accent-emerald)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                ✓ {videos.length} High-Signal Lectures
              </span>
              <span
                style={{
                  fontSize: "12.5px",
                  color: "var(--text-muted)",
                }}
              >
                Zero Commercial Slop • 50% Mid-frame Snapshots • LaTeX Derivations
              </span>
            </div>
          </div>

          {/* Videos List Grid */}
          <div className="section-title-wrap" style={{ marginBottom: "20px" }}>
            <h2 className="section-title" style={{ fontSize: "20px" }}>
              Curated {topic.name} Lectures
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
              marginBottom: "60px",
            }}
          >
            {videos.map((video) => {
              const midframeThumb = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
              return (
                <article
                  key={video.id}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, border-color 0.2s",
                  }}
                >
                  <Link
                    href={`/v/${video.id}`}
                    style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", display: "block" }}
                  >
                    <img
                      src={midframeThumb}
                      alt={video.title}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div className="badge-50-percent">
                      <span>🎯</span>
                      <span>50%</span>
                    </div>
                    <div className="duration-pill">{video.duration}</div>
                  </Link>

                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>{video.publishedYear}</span>
                      <span style={{ color: "var(--accent-amber)", fontWeight: 700 }}>
                        ▲ {video.hnMentions} HN pts
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        lineHeight: 1.4,
                        marginBottom: "8px",
                      }}
                    >
                      <Link
                        href={`/v/${video.id}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {video.title}
                      </Link>
                    </h3>

                    <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "12px" }}>
                      By <strong style={{ color: "var(--text-secondary)" }}>{video.channelTitle}</strong>
                    </div>

                    <div
                      style={{
                        fontSize: "12.5px",
                        color: "#94a3b8",
                        background: "rgba(0, 0, 0, 0.3)",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        borderLeft: "2px solid var(--accent-emerald)",
                        fontStyle: "italic",
                        marginBottom: "16px",
                        flex: 1,
                      }}
                    >
                      &ldquo;{video.hnExcerpt}&rdquo;
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "auto",
                      }}
                    >
                      <Link
                        href={`/v/${video.id}`}
                        className="nav-btn nav-btn-primary"
                        style={{ flex: 1, padding: "8px 12px", fontSize: "12px", textAlign: "center" }}
                      >
                        🧠 AI Study Notes &amp; Derivations
                      </Link>
                      <Link
                        href={`/?v=${video.id}`}
                        className="nav-btn"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                        title="Watch in HackerTube App Player"
                      >
                        ▶ Watch
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Community Verified Study Notes Grid (Gefei SEO: Aggregating UGC into Keyword Topics) */}
          {communityNotes.length > 0 && (
            <div style={{ marginBottom: "50px" }}>
              <div className="section-title-wrap" style={{ marginBottom: "16px" }}>
                <h2 className="section-title" style={{ fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🧠</span> Community Derivations &amp; LaTeX Notes ({communityNotes.length})
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                  Verified 1600+ word deep technical study notes, mathematical proofs, and mental models synthesized by engineers.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {communityNotes.map((note) => {
                  const targetSlug = note.slug || `yt-${note.youtubeId}`;
                  const thumb = note.thumbnailUrl || `https://img.youtube.com/vi/${note.youtubeId}/hqdefault.jpg`;
                  return (
                    <article
                      key={note.id}
                      style={{
                        background: "rgba(15, 23, 42, 0.7)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-lg)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#050811" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumb}
                          alt={note.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            right: "8px",
                            background: "rgba(0, 0, 0, 0.8)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            color: "var(--accent-emerald)",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                          }}
                        >
                          {note.wordCount} words
                        </div>
                      </div>

                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                        <div style={{ fontSize: "11px", color: "var(--accent-sky)", fontWeight: 600, marginBottom: "4px" }}>
                          {note.channelTitle}
                        </div>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", lineHeight: 1.4 }}>
                          <Link href={`/v/${targetSlug}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {note.title}
                          </Link>
                        </h3>
                        <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "14px", flex: 1 }}>
                          {note.executiveSummary.slice(0, 110)}...
                        </p>
                        <Link
                          href={`/v/${targetSlug}`}
                          className="nav-btn nav-btn-primary"
                          style={{ padding: "8px 12px", fontSize: "12px", textAlign: "center" }}
                        >
                          ⚡ Read LaTeX Notes &amp; Proofs
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cross-Topic Internal Linking Footer */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.5)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)",
              padding: "28px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px", color: "var(--text-primary)" }}>
              Explore Other Hacker News Knowledge Domains
            </h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {TOPIC_METADATA.map((other) => (
                <Link
                  key={other.slug}
                  href={`/topic/${other.slug}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    background: other.slug === slug ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${
                      other.slug === slug ? "var(--accent-sky)" : "var(--border-subtle)"
                    }`,
                    color: other.slug === slug ? "var(--accent-sky)" : "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  <span>{other.icon}</span>
                  <span>{other.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

