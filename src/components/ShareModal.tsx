"use client";

import React, { useState, useEffect } from "react";
import { VideoItem } from "@/data/videos";
import { trackShare } from "@/lib/tracker";

interface ShareModalProps {
  video: VideoItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ video, isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset copied indicators on open or video change (React recommended pattern)
  const [prevVideoId, setPrevVideoId] = useState(video?.id);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (video?.id !== prevVideoId || isOpen !== prevIsOpen) {
    setPrevVideoId(video?.id);
    setPrevIsOpen(isOpen);
    setCopiedLink(false);
    setCopiedMarkdown(false);
  }

  if (!isOpen || !video) return null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.hacker-tube.net";
  const deepLink = `${baseUrl}/?v=${video.id}&ref=share`;
  const midframeThumb = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(deepLink);
      trackShare(video.id, "copy_link");
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // Fallback
    }
  };

  const markdownEmbedSnippet = `[![${video.title}](${midframeThumb})](${baseUrl}/?v=${video.id}&ref=github_readme)\n> **[${video.title}](${baseUrl}/?v=${video.id}&ref=github_readme)** — *${video.channelTitle} (${video.publishedYear})*\n> ${video.aiKeyTakeaways?.[0] || video.hnExcerpt} • [Watch on HackerTube](${baseUrl}/?v=${video.id}&ref=github_readme)`;

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownEmbedSnippet);
      trackShare(video.id, "markdown_embed");
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleSocialShare = (platform: "twitter" | "reddit" | "hackernews" | "linkedin") => {
    trackShare(video.id, platform);
    let shareUrl = "";

    if (platform === "twitter") {
      const tweetText = `Watching this high-signal, anti-slop tech talk: "${video.title}" by ${video.channelTitle} (${video.hnMentions} pts on HN).\n\nWatch with slide timestamps & derivations:\n${baseUrl}/?v=${video.id}&ref=twitter #HackerNews #AI #TechTalks`;
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    } else if (platform === "reddit") {
      const redditUrl = `${baseUrl}/?v=${video.id}&ref=reddit`;
      const title = `${video.title} - ${video.channelTitle} (${video.hnMentions} pts on HN)`;
      shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(redditUrl)}&title=${encodeURIComponent(title)}`;
    } else if (platform === "hackernews") {
      const hnUrl = `${baseUrl}/?v=${video.id}&ref=hackernews`;
      const title = `${video.title} (${video.publishedYear})`;
      shareUrl = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(hnUrl)}&t=${encodeURIComponent(title)}`;
    } else if (platform === "linkedin") {
      const liUrl = `${baseUrl}/?v=${video.id}&ref=linkedin`;
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(liUrl)}`;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=520");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} id="share-modal">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "640px", padding: "32px 28px" }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div style={{ marginBottom: "20px" }}>
          <div className="section-eyebrow" style={{ color: "var(--accent-sky)" }}>
            ✦ High-Signal Knowledge Outflow
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
            Share This Engineering Talk
          </h2>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.5 }}>
            Direct deep links open this talk directly with honest 50% preview, slide timestamps, and second-brain export tools.
          </p>
        </div>

        {/* Mini Preview Card */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            marginBottom: "22px",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", width: "120px", flexShrink: 0, borderRadius: "6px", overflow: "hidden", aspectRatio: "16/9" }}>
            <img
              src={midframeThumb}
              alt={video.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                background: "rgba(0,0,0,0.8)",
                color: "#10b981",
                fontSize: "10px",
                fontWeight: 700,
                padding: "1px 4px",
                borderRadius: "3px",
              }}
            >
              50% Mid
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="card-topic-tag" style={{ fontSize: "11px", padding: "2px 8px" }}>
                {video.topic}
              </span>
              <span style={{ fontSize: "11.5px", color: "#f59e0b", fontWeight: 700 }}>
                ▲ {video.hnMentions} pts
              </span>
            </div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: "2px",
              }}
              title={video.title}
            >
              {video.title}
            </h4>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {video.channelTitle} • {video.publishedYear} • {video.duration}
            </div>
          </div>
        </div>

        {/* 1. Direct Deep Link Box */}
        <div style={{ marginBottom: "22px" }}>
          <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
            Direct Talk Deep Link (Bypasses YouTube Algorithmic Slop)
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              readOnly
              value={deepLink}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="controls-search-input"
              style={{
                flex: 1,
                padding: "9px 12px",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                background: "rgba(10, 15, 30, 0.9)",
              }}
            />
            <button
              onClick={handleCopyLink}
              className="nav-btn nav-btn-primary"
              style={{
                padding: "9px 18px",
                fontSize: "13px",
                minWidth: "110px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>{copiedLink ? "✓ Copied" : "📋 Copy"}</span>
            </button>
          </div>
        </div>

        {/* 2. 1-Click Social Broadcast */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
            1-Click Developer Communities Broadcast
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
            <button
              className="share-broadcast-btn"
              onClick={() => handleSocialShare("twitter")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                color: "#e2e8f0",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "14px" }}>𝕏</span>
              <span>Post to 𝕏</span>
            </button>

            <button
              className="share-broadcast-btn"
              onClick={() => handleSocialShare("reddit")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 69, 0, 0.08)",
                border: "1px solid rgba(255, 69, 0, 0.3)",
                color: "#ff8255",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "14px" }}>🤖</span>
              <span>Reddit</span>
            </button>

            <button
              className="share-broadcast-btn"
              onClick={() => handleSocialShare("hackernews")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 102, 0, 0.08)",
                border: "1px solid rgba(255, 102, 0, 0.3)",
                color: "#ff742b",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "14px" }}>▲</span>
              <span>Hacker News</span>
            </button>

            <button
              className="share-broadcast-btn"
              onClick={() => handleSocialShare("linkedin")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: "rgba(10, 102, 194, 0.08)",
                border: "1px solid rgba(10, 102, 194, 0.3)",
                color: "#60a5fa",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "14px" }}>💼</span>
              <span>LinkedIn</span>
            </button>
          </div>
        </div>

        {/* 3. Markdown Embed Card for GitHub READMEs / Blogs */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-secondary)" }}>
              Markdown Card (for GitHub READMEs, Tech Blogs &amp; Obsidian)
            </label>
            <button
              onClick={handleCopyMarkdown}
              style={{
                fontSize: "12px",
                color: copiedMarkdown ? "var(--accent-emerald)" : "var(--accent-sky)",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {copiedMarkdown ? "✓ Copied Card!" : "Copy Snippet ↗"}
            </button>
          </div>

          <pre
            style={{
              padding: "12px 14px",
              borderRadius: "var(--radius-md)",
              background: "rgba(0, 0, 0, 0.45)",
              border: "1px solid var(--border-subtle)",
              color: "#94a3b8",
              fontFamily: "var(--font-mono)",
              fontSize: "11.5px",
              lineHeight: 1.45,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              maxHeight: "110px",
              overflowY: "auto",
            }}
          >
            {markdownEmbedSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
