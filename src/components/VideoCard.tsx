"use client";

import React from "react";
import { VideoItem } from "@/data/videos";
import { trackVideoPlay, trackStudyOpen } from "@/lib/tracker";

interface VideoCardProps {
  video: VideoItem;
  onPlay: (v: VideoItem) => void;
  onOpenStudy: (v: VideoItem) => void;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  isSelectedKeyboard: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlay,
  onOpenStudy,
  isSaved,
  onToggleSave,
  isSelectedKeyboard,
}) => {
  // Use mid-video frame (hqdefault or 0.jpg which represents middle/preview)
  const midframeThumb = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  const handleCardClick = () => {
    trackVideoPlay(video);
    onPlay(video);
  };

  const handleStudyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackStudyOpen(video);
    onOpenStudy(video);
  };

  return (
    <article
      className={`video-card ${isSelectedKeyboard ? "active-keyboard" : ""}`}
      onClick={handleCardClick}
      id={`video-${video.id}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="thumbnail-wrap">
        <img
          src={midframeThumb}
          alt={`Mid-frame preview of ${video.title}`}
          className="thumbnail-img"
          loading="lazy"
          width="480"
          height="270"
        />

        <div className="badge-50-percent" title="Captured at 50% video runtime to prevent clickbait">
          <span>🎯</span>
          <span>50%</span>
        </div>

        <div className="duration-pill">{video.duration}</div>

        <div className="play-overlay-btn">
          <div className="play-icon-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
      </div>

      <div className="card-content">
        <div className="card-meta-top">
          <span className="card-topic-tag">{video.topic}</span>
          <span className="card-hn-mentions">
            <span>▲</span>
            <span>{video.hnMentions} pts</span>
          </span>
        </div>

        <h3 className="card-title" title={video.title}>
          {video.title}
        </h3>

        <div className="card-channel">
          <span>{video.channelTitle}</span> • <span>{video.publishedYear}</span>
        </div>

        <div className="card-hn-quote">
          &ldquo;{video.hnExcerpt}&rdquo;
        </div>

        <div className="card-footer">
          <span>via @{video.hnAuthor} ({video.hnYear})</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              className="card-action-btn"
              onClick={handleStudyClick}
              title="Open AI Study Companion Notes"
              style={{
                borderColor: "rgba(56, 189, 248, 0.4)",
                color: "#38bdf8",
                background: "rgba(56, 189, 248, 0.08)",
              }}
            >
              <span>🧠</span>
              <span>AI Notes</span>
            </button>
            <button
              className={`card-action-btn ${isSaved ? "saved" : ""}`}
              onClick={(e) => onToggleSave(video.id, e)}
              title={isSaved ? "Remove Bookmark" : "Bookmark"}
              aria-label={isSaved ? "Remove Bookmark" : "Bookmark"}
            >
              <span>{isSaved ? "✓" : "＋"}</span>
              <span>{isSaved ? "Bookmarked" : "Bookmark"}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
