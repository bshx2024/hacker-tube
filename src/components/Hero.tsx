"use client";

import React, { useState, useEffect, useRef } from "react";
import { VideoItem } from "@/data/videos";

interface HeroProps {
  onExplore: () => void;
  totalVideos: number;
  featuredVideos: VideoItem[];
  onPlayVideo: (v: VideoItem) => void;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string, e?: React.MouseEvent) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExplore,
  totalVideos,
  featuredVideos,
  onPlayVideo,
  isSaved,
  onToggleSave,
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
          <span>Curated from 20 Years of Hacker News (2007–2026)</span>
        </div>

        <h1 className="hero-title">
          Stop Watching <span className="hero-title-gradient">Slop.</span>
        </h1>

        <p className="hero-subtitle">
          The anti-algorithm video platform for hackers, engineers, and deep thinkers.
          Every video here was recommended by real humans in Hacker News comments—with zero
          clickbait thumbnails, zero tracking, and pure technical signal.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "40px" }}>
          <button
            onClick={onExplore}
            className="nav-btn nav-btn-primary"
            style={{ padding: "12px 24px", fontSize: "15px" }}
            id="hero-explore-btn"
          >
            <span>▶</span>
            <span>Explore All Curated Talks</span>
          </button>

          <a
            href="https://karpathy.bearblog.dev/hacker-tube/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn"
            style={{ padding: "12px 24px", fontSize: "15px" }}
            id="hero-karpathy-btn"
          >
            <span>💡</span>
            <span>Inspired by Andrej Karpathy</span>
          </a>

          <a
            href="https://github.com/Jnaina/hackertube-tvos"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn"
            style={{ padding: "12px 24px", fontSize: "15px" }}
            id="hero-tvos-btn"
          >
            <span>📺</span>
            <span>Apple TV Client</span>
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
                <span>hackertube.org/spotlight/{activeVideo.id}</span>
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
                    <span>50% Mid-frame Preview</span>
                  </span>
                  <span className="card-hn-mentions">
                    <span>🔥</span>
                    <span>{activeVideo.hnMentions} HN Mentions</span>
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
                    <span>Watch Full Lecture Now</span>
                  </button>

                  <button
                    className={`card-action-btn ${saved ? "saved" : ""}`}
                    style={{ padding: "10px 18px", fontSize: "14px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(activeVideo.id, e);
                    }}
                  >
                    <span>{saved ? "✓ Saved" : "＋ Save to Watch Later"}</span>
                  </button>
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
