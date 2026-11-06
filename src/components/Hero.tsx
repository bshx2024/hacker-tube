"use client";

import React, { useState, useEffect, useRef } from "react";
import { VideoItem } from "@/data/videos";
import { trackOutboundClick } from "@/lib/tracker";

interface HeroProps {
  onExplore: () => void;
  totalVideos: number;
  featuredVideos: VideoItem[];
  onPlayVideo: (v: VideoItem) => void;
  onOpenStudy: (v: VideoItem) => void;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string, e?: React.MouseEvent) => void;
  onShare?: (v: VideoItem) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExplore,
  totalVideos,
  featuredVideos,
  onPlayVideo,
  onOpenStudy,
  isSaved,
  onToggleSave,
  onShare,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeVideo = featuredVideos[currentIndex] || featuredVideos[0];

  // Auto-rotate every 6 seconds unless user is hovering
  useEffect(() => {
    if (isPaused || featuredVideos.length <= 1) return;

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredVideos.length);
    }, 6000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPaused, featuredVideos.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featuredVideos.length) % featuredVideos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredVideos.length);
  };

  if (!activeVideo) return null;

  const midframeThumb = `https://img.youtube.com/vi/${activeVideo.youtubeId}/hqdefault.jpg`;
  const saved = isSaved(activeVideo.id);

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-pill">
          <span className="hero-pill-pulse"></span>
          <span>⚡ Inspired by Andrej Karpathy • 20 Years of Hacker News Consensus</span>
        </div>

        <h1 className="hero-title">
          HackerTube: Stop Watching <span className="hero-title-gradient">Slop.</span>
        </h1>

        <p className="hero-subtitle">
          <strong>HackerTube</strong> is the anti-algorithm video web app inspired by Andrej Karpathy. Every lecture was organically recommended across 20 years of Hacker News—with zero clickbait, 50% runtime previews, and exportable AI study notes.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
          <button
            onClick={onExplore}
            className="nav-btn nav-btn-primary"
            style={{ padding: "12px 26px", fontSize: "15px" }}
            id="hero-explore-btn"
          >
            <span>▶</span>
            <span>Explore All Curated Talks ({totalVideos})</span>
          </button>

          <button
            onClick={() => onOpenStudy(activeVideo)}
            className="nav-btn"
            style={{
              padding: "12px 22px",
              fontSize: "15px",
              borderColor: "rgba(56, 189, 248, 0.4)",
              color: "var(--accent-sky)",
              background: "rgba(56, 189, 248, 0.08)",
            }}
            id="hero-study-btn"
            title="Open AI Study Companion for the featured talk"
          >
            <span>🧠</span>
            <span>AI Study Companion &amp; Derivations</span>
          </button>
        </div>

        {/* Provenance & Ecosystem Badges (Subtle to avoid immediate outbound bounce) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
            fontSize: "13px",
            color: "var(--text-muted)",
            marginBottom: "36px",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>Concept Origin:</span>
          <a
            href="https://karpathy.bearblog.dev/hacker-tube/"
            target="_blank"
            rel="noopener noreferrer"
            id="hero-karpathy-btn"
            onClick={() => trackOutboundClick("karpathy_blog", "hero")}
            style={{
              color: "var(--accent-emerald)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            <span>💡 Andrej Karpathy&apos;s Blog Post ↗</span>
          </a>
          <span>•</span>
          <a
            href="https://github.com/Jnaina/hackertube-tvos"
            target="_blank"
            rel="noopener noreferrer"
            id="hero-tvos-btn"
            onClick={() => trackOutboundClick("apple_tv", "hero")}
            style={{
              color: "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            <span>📺 Apple TV Client (tvOS) ↗</span>
          </a>
          <span>•</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            id="hero-github-btn"
            onClick={() => trackOutboundClick("github", "hero")}
            style={{
              color: "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            <span>⭐ Open Source on GitHub ↗</span>
          </a>
        </div>

        {/* Dynamic Featured Video Spotlight Window */}
        <div
          className="hero-showcase-container"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="hero-showcase-glow"></div>
          <div className="hero-showcase-card">
            {/* Window Browser Header Bar */}
            <div className="showcase-window-bar">
              <div className="window-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="window-address-bar">
                <span>hacker-tube.net/spotlight/{activeVideo.id}</span>
              </div>
              <div className="window-status-pill">
                <span className="live-signal-indicator"></span>
                <span>🔥 HN SPOTLIGHT {currentIndex + 1}/{featuredVideos.length}</span>
              </div>
            </div>

            {/* Spotlight Interactive Video Frame */}
            <div
              className="spotlight-media-frame"
              onClick={() => onPlayVideo(activeVideo)}
              style={{ cursor: "pointer" }}
            >
              {/* Mid-frame Background with Ambient Dark Gradient */}
              <img
                src={midframeThumb}
                alt={activeVideo.title}
                width="1280"
                height="720"
                className="spotlight-bg-img"
              />
              <div className="spotlight-gradient-overlay" />

              {/* Prev / Next Chevrons */}
              <button
                className="spotlight-nav-btn prev"
                onClick={handlePrev}
                aria-label="Previous Featured Talk"
                title="Previous Featured Talk"
              >
                ‹
              </button>
              <button
                className="spotlight-nav-btn next"
                onClick={handleNext}
                aria-label="Next Featured Talk"
                title="Next Featured Talk"
              >
                ›
              </button>

              {/* Content Overlay */}
              <div className="spotlight-content">
                <div className="spotlight-badges-row">
                  <span className="badge-50-percent" style={{ position: "static" }}>
                    <span>🎯</span>
                    <span>50% Timestamp</span>
                  </span>
                  <span className="card-hn-mentions">
                    <span>▲</span>
                    <span>{activeVideo.hnMentions} pts</span>
                  </span>
                  <span
                    className="card-topic-tag"
                    style={{
                      cursor: "pointer",
                      background: "rgba(56, 189, 248, 0.15)",
                      border: "1px solid rgba(56, 189, 248, 0.4)",
                      color: "#38bdf8",
                      fontWeight: 700,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenStudy(activeVideo);
                    }}
                    title="Click to open AI Study Companion Notes"
                  >
                    <span>🧠</span>
                    <span>AI Study Companion</span>
                  </span>
                  <span className="card-topic-tag" style={{ color: "var(--accent-sky)", fontWeight: 700 }}>
                    {activeVideo.topic} • {activeVideo.duration}
                  </span>
                </div>

                <h2 className="spotlight-title">{activeVideo.title}</h2>

                <div className="spotlight-speaker">
                  By <strong>{activeVideo.channelTitle}</strong> • Released {activeVideo.publishedYear}
                </div>

                {/* Real HN Community Quote Card */}
                <div className="spotlight-quote-box">
                  <div className="quote-label">💬 Top Community Endorsement:</div>
                  <div className="quote-text">&ldquo;{activeVideo.hnExcerpt}&rdquo;</div>
                  <div className="quote-author">— @{activeVideo.hnAuthor} ({activeVideo.hnYear})</div>
                </div>

                {/* CTA Buttons in Spotlight */}
                <div className="spotlight-actions">
                  <button
                    className="nav-btn nav-btn-primary"
                    style={{ padding: "10px 22px", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "8px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayVideo(activeVideo);
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>▶</span>
                    <span>Watch Full Lecture</span>
                  </button>

                  <button
                    className="nav-btn"
                    style={{
                      padding: "10px 20px",
                      fontSize: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)",
                      borderColor: "rgba(56, 189, 248, 0.5)",
                      color: "#38bdf8",
                      fontWeight: 700,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenStudy(activeVideo);
                    }}
                    title="Open AI Study Companion with 3-minute TL;DR, LaTeX derivations & Obsidian Export"
                  >
                    <span>🧠</span>
                    <span>AI Study Companion</span>
                  </button>

                  <button
                    className={`card-action-btn ${saved ? "saved" : ""}`}
                    style={{ padding: "10px 18px", fontSize: "14px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(activeVideo.id, e);
                    }}
                  >
                    <span>{saved ? "✓ Bookmarked" : "＋ Bookmark Lecture"}</span>
                  </button>

                  {onShare && (
                    <button
                      className="card-action-btn"
                      style={{
                        padding: "10px 18px",
                        fontSize: "14px",
                        borderColor: "rgba(56, 189, 248, 0.4)",
                        color: "#38bdf8",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare(activeVideo);
                      }}
                      title="Share Talk (Deep Link, 𝕏, Reddit, Markdown)"
                    >
                      <span>↗ Share Talk</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Progress Tabs */}
            <div className="spotlight-tabs-bar">
              {featuredVideos.map((video, idx) => (
                <button
                  key={video.id}
                  className={`spotlight-tab-item ${idx === currentIndex ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                >
                  <div className="tab-progress-track">
                    <div
                      className={`tab-progress-fill ${idx === currentIndex && !isPaused ? "animating" : ""}`}
                    />
                  </div>
                  <div className="tab-label-text">
                    <span className="tab-speaker">{video.channelTitle}:</span> {video.title.slice(0, 32)}...
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-stats-row">
          <div className="hero-stat-badge">
            <span className="hero-stat-number">{totalVideos}+</span>
            <span>Hand-curated Talks</span>
          </div>
          <div className="hero-stat-badge">
            <span className="hero-stat-number">50%</span>
            <span>Honest Mid-frame Previews</span>
          </div>
          <div className="hero-stat-badge">
            <span className="hero-stat-number">0</span>
            <span>Algorithms &amp; Tracking</span>
          </div>
          <div className="hero-stat-badge">
            <span className="hero-stat-number">100%</span>
            <span>Local &amp; Privacy-First</span>
          </div>
        </div>
      </div>
    </section>
  );
};
