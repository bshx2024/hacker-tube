"use client";

import React, { useState, useEffect } from "react";
import { TOPIC_CATEGORIES, TopicCategory } from "@/data/videos";
import { trackEvent } from "@/lib/tracker";

interface SuggestVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestVideoModal: React.FC<SuggestVideoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [channelTitle, setChannelTitle] = useState("");
  const [hnUrl, setHnUrl] = useState("");
  const [topic, setTopic] = useState<TopicCategory>("AI & Machine Learning");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract YouTube ID for mid-frame preview
  const ytMatch = youtubeUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
  );
  const extractedYtId = ytMatch ? ytMatch[1] : "";

  const handleSubmitDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim() || !title.trim()) {
      setStatusMessage({ type: "error", text: "Please enter at least a YouTube URL and Talk Title." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrl,
          title,
          channelTitle,
          hnUrl,
          topic,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: "✓ Thank you! Your talk proposal has been submitted to the curation review queue.",
        });
        trackEvent("submit_video_suggestion", {
          youtube_id: extractedYtId,
          topic,
          has_hn_url: !!hnUrl.trim(),
        });

        setTimeout(() => {
          setYoutubeUrl("");
          setTitle("");
          setChannelTitle("");
          setHnUrl("");
          setReason("");
          onClose();
        }, 2500);
      } else {
        setStatusMessage({ type: "error", text: data.error || "Submission failed. Please try again." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network error. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenGitHubIssue = () => {
    const issueTitle = encodeURIComponent(`[Talk Proposal] ${title || "New Curated Talk"}`);
    const issueBody = encodeURIComponent(`### 🎬 Proposed High-Signal Talk
- **Title**: ${title || "N/A"}
- **Speaker / Channel**: ${channelTitle || "N/A"}
- **YouTube URL**: ${youtubeUrl || "N/A"}
- **Topic Category**: ${topic}
- **Hacker News Thread**: ${hnUrl || "N/A"}

### 💡 Why is this high-signal? (HN Endorsement / Key Takeaways)
${reason || "Organically recommended on Hacker News."}

---
*Submitted via HackerTube Community Suggestion Modal*`);

    const githubUrl = `https://github.com/bshx2024/hacker-tube/issues/new?title=${issueTitle}&body=${issueBody}`;
    trackEvent("propose_talk_github", { topic });
    window.open(githubUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="modal-backdrop" onClick={onClose} id="suggest-modal">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "620px", padding: "32px 28px" }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div style={{ marginBottom: "20px" }}>
          <div className="section-eyebrow" style={{ color: "var(--accent-emerald)" }}>
            ✦ Community-Driven Curation
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
            Suggest a High-Signal Talk
          </h2>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.5 }}>
            Help keep HackerTube synchronized with the best technical lectures from Hacker News. Every talk must have genuine engineering peer consensus—zero clickbait.
          </p>
        </div>

        {statusMessage && (
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              marginBottom: "16px",
              fontSize: "13.5px",
              background:
                statusMessage.type === "success"
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(244, 63, 94, 0.15)",
              border: `1px solid ${
                statusMessage.type === "success" ? "var(--accent-emerald)" : "var(--accent-rose)"
              }`,
              color: statusMessage.type === "success" ? "#6ee7b7" : "#fda4af",
            }}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmitDirect} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* YouTube Link */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              YouTube URL or Video ID <span style={{ color: "var(--accent-rose)" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. https://www.youtube.com/watch?v=M3B63EGmIbc"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="controls-search-input"
              style={{ width: "100%", padding: "10px 14px", fontSize: "14px" }}
              required
            />
            {extractedYtId && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px", padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <img
                  src={`https://img.youtube.com/vi/${extractedYtId}/hqdefault.jpg`}
                  alt="50% Frame Preview"
                  style={{ width: "80px", height: "45px", objectFit: "cover", borderRadius: "4px" }}
                />
                <span style={{ fontSize: "12px", color: "var(--accent-emerald)" }}>
                  ✓ Detected YouTube ID: <code>{extractedYtId}</code> (Honest Midframe Verified)
                </span>
              </div>
            )}
          </div>

          {/* Talk Title & Speaker Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Talk Title <span style={{ color: "var(--accent-rose)" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Building micrograd from scratch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="controls-search-input"
                style={{ width: "100%", padding: "10px 14px", fontSize: "14px" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Speaker / Channel
              </label>
              <input
                type="text"
                placeholder="e.g. Andrej Karpathy"
                value={channelTitle}
                onChange={(e) => setChannelTitle(e.target.value)}
                className="controls-search-input"
                style={{ width: "100%", padding: "10px 14px", fontSize: "14px" }}
              />
            </div>
          </div>

          {/* HN Discussion URL & Topic Category */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Hacker News Discussion Link
              </label>
              <input
                type="text"
                placeholder="e.g. https://news.ycombinator.com/item?id=32514104"
                value={hnUrl}
                onChange={(e) => setHnUrl(e.target.value)}
                className="controls-search-input"
                style={{ width: "100%", padding: "10px 14px", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Topic Category
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as TopicCategory)}
                className="controls-select"
                style={{ width: "100%", padding: "10px 14px", fontSize: "14px", height: "42px" }}
              >
                {TOPIC_CATEGORIES.filter((t) => t !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Community Endorsement / Reason */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Why is this talk high-signal? (HN quote or core takeaway)
            </label>
            <textarea
              placeholder="e.g. Best tutorial on neural nets; codes computational graphs from scratch without PyTorch black magic."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="controls-search-input"
              rows={3}
              style={{ width: "100%", padding: "10px 14px", fontSize: "13.5px", resize: "vertical" }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="nav-btn"
              onClick={handleOpenGitHubIssue}
              style={{ fontSize: "13.5px", padding: "10px 16px" }}
              title="Open a pre-filled issue in our open source repository"
            >
              <span>⭐</span>
              <span>Propose via GitHub Issue ↗</span>
            </button>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="nav-btn"
                onClick={onClose}
                style={{ fontSize: "13.5px", padding: "10px 18px" }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="nav-btn nav-btn-primary"
                style={{ fontSize: "13.5px", padding: "10px 22px" }}
              >
                <span>{isSubmitting ? "Submitting..." : "🚀 Submit Talk"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

