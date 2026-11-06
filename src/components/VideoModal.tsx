"use client";

import React, { useState, useEffect } from "react";
import { VideoItem } from "@/data/videos";
import { getStudyNoteForVideo, StudyNote } from "@/data/studyNotes";
import {
  trackExportNotes,
  trackHnClick,
  trackStudyOpen,
  trackEngagementHeartbeat,
  trackOutboundClick,
} from "@/lib/tracker";

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  initialTab?: "player" | "study";
  onShare?: (v: VideoItem) => void;
  onTabChange?: (tab: "player" | "study") => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  video,
  onClose,
  isSaved,
  onToggleSave,
  initialTab = "player",
  onShare,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<"player" | "study">(initialTab);
  const [seekSeconds, setSeekSeconds] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleTabSwitch = (tab: "player" | "study") => {
    setActiveTab(tab);
    onTabChange?.(tab);
    if (tab === "study" && video) {
      trackStudyOpen(video);
    }
  };

  // Sync state when video or initialTab prop changes (React recommended pattern)
  const [prevVideoId, setPrevVideoId] = useState(video?.id);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (video?.id !== prevVideoId || initialTab !== prevInitialTab) {
    setPrevVideoId(video?.id);
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
    setSeekSeconds(0);
    setToastMessage(null);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Active Engagement Heartbeat (solves GA4 iframe focus loss & tracks true dwell time)
  useEffect(() => {
    if (!video) return;

    let elapsed = 0;
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        elapsed += 20;
        trackEngagementHeartbeat("video_modal", 20, {
          video_id: video.id,
          tab: activeTab,
          total_seconds: elapsed,
        });
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [video, activeTab]);

  if (!video) return null;

  const studyNote: StudyNote = getStudyNoteForVideo(
    video.id,
    video.title,
    video.channelTitle,
    video.topic,
    video.aiKeyTakeaways,
    video.hnExcerpt,
    video.hnAuthor,
    video.youtubeId
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const generateMarkdownContent = () => {
    return `${studyNote.obsidianFrontmatter}

# ${video.title}

> **Speaker**: ${video.channelTitle} (${video.publishedYear}) | **Duration**: ${video.duration} | **Topic**: ${video.topic}
> **Hacker News Thread**: [${video.hnMentions} points by @${video.hnAuthor}](${video.hnDiscussionUrl})
> **Stream & AI Notes**: [HackerTube](https://www.hacker-tube.net/?v=${video.id}&ref=obsidian_notes) • [Original YouTube](https://youtu.be/${video.youtubeId})
> **Inference Infrastructure**: [APIVALE Cloud](https://apivale.com/hackertube?utm_source=hackertube&utm_medium=referral&utm_campaign=ai_study_notes&utm_content=inference_badge) (High-Throughput Gateway for DeepSeek, Qwen & Frontier Models)

---

## ⚡ Executive Summary (TL;DR)
${studyNote.executiveSummary}

### Core Mental Models
${studyNote.coreMentalModels.map((m) => `- ${m}`).join("\n")}

---

## ⏱️ Key Timestamps & Slide Index
${studyNote.keyTimestamps
  .map(
    (t) =>
      `### [${t.time}](https://youtu.be/${video.youtubeId}?t=${t.seconds}) ${t.title}\n- **Slide / Whiteboard**: ${t.slideConcept}\n- **Key Takeaway**: ${t.keyTakeaway}`
  )
  .join("\n\n")}

---

## 📐 Mathematical Derivations & Code Insights
${studyNote.mathDerivations
  .map(
    (m) =>
      `### ${m.title}\n$$\n${m.formula}\n$$\n${m.explanation}${
        m.codeSnippet ? `\n\n\`\`\`python\n${m.codeSnippet}\n\`\`\`` : ""
      }`
  )
  .join("\n\n")}

---

## 💬 Hacker News Community Review & Critical Debates
${studyNote.hnDebates
  .map(
    (d) =>
      `### ${d.topic}\n- **Consensus**: ${d.consensus}\n- **Counter-Argument & Caveats**: ${d.counterArgument}\n\n> "${d.topCommentQuote}"\n> — @${d.author}`
  )
  .join("\n\n")}
`;
  };

  const handleCopyMarkdown = async () => {
    try {
      const content = generateMarkdownContent();
      await navigator.clipboard.writeText(content);
      trackExportNotes(video.id, "markdown");
      showToast("✓ Copied full study note to clipboard! Ready to paste into Obsidian, Notion or Logseq.");
    } catch {
      showToast("⚠️ Could not write to clipboard automatically. Please copy manually.");
    }
  };

  const handleExportObsidian = () => {
    try {
      const content = generateMarkdownContent();
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HackerTube-${video.id}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      trackExportNotes(video.id, "obsidian");
      showToast("✓ Downloaded Obsidian Markdown note! Drag into your Obsidian vault.");
    } catch {
      showToast("⚠️ Failed to trigger download.");
    }
  };

  const handleCopyNotion = async () => {
    try {
      const content = generateMarkdownContent();
      await navigator.clipboard.writeText(content);
      trackExportNotes(video.id, "notion");
      showToast("✓ Notion-ready blocks copied! Simply press Ctrl+V / Cmd+V in any Notion page.");
    } catch {
      showToast("⚠️ Could not write to clipboard.");
    }
  };

  const handleTimestampSeek = (seconds: number) => {
    setSeekSeconds(seconds);
    setActiveTab("player");
    // Scroll modal top smoothly so user immediately sees video playing
    const modalEl = document.querySelector(".modal-content");
    if (modalEl) {
      modalEl.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1${
    seekSeconds > 0 ? `&start=${seekSeconds}` : ""
  }`;

  return (
    <div className="modal-backdrop" onClick={onClose} id="video-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Modal Tab Switcher & Second Brain Export Bar AT THE TOP */}
        <div className="modal-tabs-header">
          <div className="modal-tab-group">
            <button
              className={`modal-tab-btn ${activeTab === "player" ? "active" : ""}`}
              onClick={() => handleTabSwitch("player")}
            >
              <span>📺</span>
              <span>Overview &amp; Player</span>
            </button>
            <button
              className={`modal-tab-btn ${activeTab === "study" ? "active" : ""}`}
              onClick={() => handleTabSwitch("study")}
            >
              <span>🧠</span>
              <span>AI Study Companion</span>
              <span className="tab-pro-badge">HIGH SIGNAL</span>
            </button>
          </div>

          <div className="second-brain-toolbar">
            {onShare && (
              <button
                className="export-tool-btn"
                onClick={() => onShare(video)}
                title="Share talk with deep link, 𝕏 post, Reddit or Markdown embed"
                style={{ borderColor: "rgba(56, 189, 248, 0.4)", color: "#38bdf8" }}
              >
                <span>↗</span>
                <span>Share Talk</span>
              </button>
            )}

            <button
              className="export-tool-btn primary"
              onClick={handleCopyMarkdown}
              title="Copy clean structured Markdown with frontmatter"
            >
              <span>📋</span>
              <span>Copy Markdown</span>
            </button>

            <button
              className="export-tool-btn"
              onClick={handleExportObsidian}
              title="Download formatted .md file for Obsidian"
            >
              <span>📓</span>
              <span>Obsidian (.md)</span>
            </button>

            <button
              className="export-tool-btn"
              onClick={handleCopyNotion}
              title="Copy formatted blocks for Notion"
            >
              <span>📝</span>
              <span>Notion</span>
            </button>

            <a
              href={video.hnDiscussionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="export-tool-btn"
              title="View original Hacker News thread"
            >
              <span>💬</span>
              <span>HN Thread ({video.hnMentions} pts) ↗</span>
            </a>
          </div>
        </div>

        {/* Embedded YouTube Player */}
        <div className="player-embed-wrap">
          <iframe
            key={`${video.youtubeId}-${seekSeconds}`}
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Toast Notification Alert */}
        {toastMessage && (
          <div style={{ padding: "12px 24px 0" }}>
            <div className="toast-feedback">
              <span>{toastMessage}</span>
              <button
                onClick={() => setToastMessage(null)}
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Standard Overview View */}
        {activeTab === "player" && (
          <div className="modal-details">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <span className="card-topic-tag" style={{ fontSize: "14px" }}>
                  {video.topic}
                </span>
                <h2 className="modal-title">{video.title}</h2>
                <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  By <strong>{video.channelTitle}</strong> • Released {video.publishedYear} • Duration {video.duration}
                  {seekSeconds > 0 && (
                    <span style={{ color: "var(--accent-cyan)", marginLeft: "12px" }}>
                      ▶ Playing from {Math.floor(seekSeconds / 60)}m {seekSeconds % 60}s
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                {onShare && (
                  <button
                    className="card-action-btn"
                    style={{ padding: "8px 16px", fontSize: "14px", borderColor: "rgba(56, 189, 248, 0.4)", color: "#38bdf8" }}
                    onClick={() => onShare(video)}
                    title="Share talk with deep link, 𝕏 post, Reddit or Markdown embed"
                  >
                    <span>↗</span>
                    <span>Share Talk</span>
                  </button>
                )}

                <button
                  className={`card-action-btn ${isSaved ? "saved" : ""}`}
                  style={{ padding: "8px 16px", fontSize: "14px" }}
                  onClick={(e) => onToggleSave(video.id, e)}
                >
                  <span>{isSaved ? "✓" : "＋"}</span>
                  <span>{isSaved ? "Bookmarked" : "Bookmark Lecture"}</span>
                </button>
              </div>
            </div>

            {/* Fast Study Jump Banner */}
            <div
              style={{
                marginTop: "18px",
                padding: "12px 18px",
                background: "linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ fontSize: "13.5px", color: "#e2e8f0" }}>
                <strong style={{ color: "var(--accent-sky)" }}>🧠 AI Study Companion Ready:</strong> Key slide timestamps, math derivations, and HN peer reviews available for this talk.
              </div>
              <button
                className="nav-btn nav-btn-primary"
                style={{ padding: "6px 14px", fontSize: "12px" }}
                onClick={() => handleTabSwitch("study")}
              >
                Open Study Notes ➔
              </button>
            </div>

            {/* AI Key Takeaways */}
            <div className="modal-takeaways">
              <div className="takeaways-heading">
                <span>⚡</span>
                <span>Core Engineering Takeaways</span>
              </div>
              <ul className="takeaways-list">
                {video.aiKeyTakeaways.map((point, index) => (
                  <li key={index} className="takeaway-item">
                    <span style={{ color: "var(--accent-emerald)" }}>▹</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hacker News Recommendation Context */}
            <div className="modal-hn-box">
              <div className="hn-box-header">
                <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--accent-amber)" }}>
                  💬 Hacker News Community Endorsement (▲ {video.hnMentions} pts)
                </span>
                <a
                  href={video.hnDiscussionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackHnClick(video.id, video.hnDiscussionUrl)}
                  style={{ fontSize: "12px", color: "var(--accent-cyan)", textDecoration: "underline" }}
                >
                  View on Hacker News ↗
                </a>
              </div>
              <p className="hn-quote-full">
                &ldquo;{video.hnExcerpt}&rdquo;
              </p>
              <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)", textAlign: "right" }}>
                — Recommended by @{video.hnAuthor} ({video.hnYear})
              </div>
            </div>

            {/* Builder Hands-on Footnote */}
            <div className="study-builder-footer">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span>🛠️</span>
                <span>
                  <strong>Builder Sandbox:</strong> Ready to prototype with DeepSeek, Qwen, GLM, or Kimi? Test endpoints on{" "}
                  <a
                    href="https://apivale.com/hackertube?utm_source=hackertube&utm_medium=referral&utm_campaign=ai_study_notes&utm_content=builder_footer"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--accent-sky)", fontWeight: 700, textDecoration: "underline" }}
                    onClick={() => trackOutboundClick("apivale", "study_companion_footer")}
                  >
                    APIVALE.com
                  </a>
                  {" "}with instant developer credits.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Deep Dive Companion View */}
        {activeTab === "study" && (
          <div className="study-companion-body">
            {/* APIVALE Cloud Infrastructure Attribution Badge */}
            <div className="study-infrastructure-badge">
              <div className="infrastructure-badge-left">
                <span className="infrastructure-dot"></span>
                <span>
                  <strong style={{ color: "var(--accent-sky)" }}>⚡ Inference Infrastructure:</strong> AI structured derivations &amp; takeaways computed via{" "}
                  <a
                    href="https://apivale.com/hackertube?utm_source=hackertube&utm_medium=referral&utm_campaign=ai_study_notes&utm_content=inference_badge"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="infrastructure-link"
                    onClick={() => trackOutboundClick("apivale", "study_companion")}
                  >
                    APIVALE.com
                  </a>
                  {" "}— Unified gateway for DeepSeek, Qwen &amp; frontier Chinese models.
                </span>
              </div>
              <a
                href="https://apivale.com/hackertube?utm_source=hackertube&utm_medium=referral&utm_campaign=ai_study_notes&utm_content=inference_badge"
                target="_blank"
                rel="noopener noreferrer"
                className="infrastructure-cta"
                onClick={() => trackOutboundClick("apivale", "study_companion")}
                title="Get unified API access for DeepSeek, Qwen, GLM, Kimi & Doubao models"
              >
                <span>Free Playground &amp; Key ↗</span>
              </a>
            </div>

            {/* Executive Summary & Mental Models */}
            <div className="study-box-lead">
              <div className="study-box-title">
                <span>⚡</span>
                <span>Executive Mental Model &amp; 3-Minute TL;DR</span>
              </div>
              <p className="study-summary-text">{studyNote.executiveSummary}</p>

              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                Foundational Mental Models:
              </div>
              <div className="mental-models-grid">
                {studyNote.coreMentalModels.map((model, idx) => (
                  <div key={idx} className="mental-model-row">
                    <span style={{ color: "var(--accent-sky)", fontWeight: 700 }}>#{idx + 1}</span>
                    <span>{model}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Timeline & Slide Index */}
            <div>
              <div className="study-section-heading">
                <span>⏱️</span>
                <span>Interactive Keyframe &amp; Slide Index (Click to Seek Video)</span>
              </div>

              <div className="timeline-index-list">
                {studyNote.keyTimestamps.map((item, idx) => (
                  <div key={idx} className="timeline-item-card">
                    <button
                      className="timestamp-jump-btn"
                      onClick={() => handleTimestampSeek(item.seconds)}
                      title={`Jump to ${item.time} in video`}
                    >
                      <span>▶</span>
                      <span>{item.time}</span>
                    </button>
                    <div className="timeline-item-content">
                      <div className="timeline-item-title">{item.title}</div>
                      <div className="timeline-item-concept">📐 Focus: {item.slideConcept}</div>
                      <div className="timeline-item-takeaway">{item.keyTakeaway}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mathematical Derivations & Code Walkthrough */}
            <div>
              <div className="study-section-heading">
                <span>📐</span>
                <span>Mathematical Formulations &amp; Code Mechanics</span>
              </div>

              <div className="math-cards-grid">
                {studyNote.mathDerivations.map((item, idx) => (
                  <div key={idx} className="math-card">
                    <div className="math-formula-header">
                      <span>{item.title}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>FORMULA</span>
                    </div>
                    <div className="math-formula-display">{item.formula}</div>
                    <div className="math-explanation">{item.explanation}</div>
                    {item.codeSnippet && (
                      <pre className="math-code-snippet">
                        <code>{item.codeSnippet}</code>
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hacker News Community Debates & Counter-Arguments */}
            <div>
              <div className="study-section-heading">
                <span>💬</span>
                <span>Hacker News Peer Review: Consensus vs. Counter-Arguments</span>
              </div>

              <div className="debates-list">
                {studyNote.hnDebates.map((item, idx) => (
                  <div key={idx} className="debate-card">
                    <div className="debate-title">🔥 Topic: {item.topic}</div>
                    <div className="debate-columns">
                      <div className="debate-col-box">
                        <strong style={{ color: "var(--accent-emerald)", display: "block", marginBottom: "4px" }}>
                          ✓ Community Consensus:
                        </strong>
                        <p>{item.consensus}</p>
                      </div>
                      <div className="debate-col-box">
                        <strong style={{ color: "var(--accent-rose)", display: "block", marginBottom: "4px" }}>
                          ⚠️ Senior Counter-Argument / Caveat:
                        </strong>
                        <p>{item.counterArgument}</p>
                      </div>
                    </div>
                    <div className="debate-quote">
                      &ldquo;{item.topCommentQuote}&rdquo; — @{item.author}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Builder Hands-on Footnote */}
            <div className="study-builder-footer">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span>🛠️</span>
                <span>
                  <strong>Builder Sandbox:</strong> Ready to prototype with DeepSeek, Qwen, GLM, or Kimi? Test endpoints on{" "}
                  <a
                    href="https://apivale.com/hackertube?utm_source=hackertube&utm_medium=referral&utm_campaign=ai_study_notes&utm_content=builder_footer"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--accent-sky)", fontWeight: 700, textDecoration: "underline" }}
                    onClick={() => trackOutboundClick("apivale", "study_companion_footer")}
                  >
                    APIVALE.com
                  </a>
                  {" "}with instant developer credits.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
