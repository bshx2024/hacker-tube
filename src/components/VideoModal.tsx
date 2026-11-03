"use client";

import React, { useEffect } from "react";
import { VideoItem } from "@/data/videos";

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  video,
  onClose,
  isSaved,
  onToggleSave,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} id="video-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Embedded YouTube Player */}
        <div className="player-embed-wrap">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="modal-details">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <span className="card-topic-tag" style={{ fontSize: "14px" }}>
                {video.topic}
              </span>
              <h2 className="modal-title">{video.title}</h2>
              <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                By <strong>{video.channelTitle}</strong> • Released {video.publishedYear} • Duration {video.duration}
              </div>
            </div>

            <button
              className={`card-action-btn ${isSaved ? "saved" : ""}`}
              style={{ padding: "8px 16px", fontSize: "14px" }}
              onClick={(e) => onToggleSave(video.id, e)}
            >
              <span>{isSaved ? "✓" : "＋"}</span>
              <span>{isSaved ? "Saved to Bookmarks" : "Watch Later"}</span>
            </button>
          </div>

          {/* AI Key Takeaways (Critical for GEO & Information Gain) */}
          <div className="modal-takeaways">
            <div className="takeaways-heading">
              <span>⚡</span>
              <span>AI Key Takeaways & Core Concepts</span>
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
                💬 Hacker News Community Recommendation ({video.hnMentions} Mentions)
              </span>
              <a
                href={video.hnDiscussionUrl}
                target="_blank"
                rel="noopener noreferrer"
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
        </div>
      </div>
    </div>
  );
};
