"use client";

import React, { useState, useEffect } from "react";
import { VideoItem } from "@/data/videos";
import { trackVideoPlay, trackStudyOpen } from "@/lib/tracker";
import { audioHookManager } from "@/lib/audioHook";

interface VideoCardProps {
  video: VideoItem;
  onPlay: (v: VideoItem) => void;
  onOpenStudy: (v: VideoItem) => void;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  isSelectedKeyboard: boolean;
  onShare?: (v: VideoItem, e: React.MouseEvent) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlay,
  onOpenStudy,
  isSaved,
  onToggleSave,
  isSelectedKeyboard,
  onShare,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    const unsubscribe = audioHookManager.subscribe((isPlaying) => {
      const active = audioHookManager.getActiveVideoId() === video.id;
      setIsPlayingAudio(active && isPlaying);
    });
    return unsubscribe;
  }, [video.id]);

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

  const handleAudioHookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      audioHookManager.stop();
    } else {
      audioHookManager.play(video, "card");
    }
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

        {/* 10s Instant Audio Hook Button */}
        <button
          type="button"
          className={`audio-hook-thumb-btn ${isPlayingAudio ? "playing" : ""}`}
          onClick={handleAudioHookClick}
          title={isPlayingAudio ? "Stop 10s audio takeaway" : "⚡ Listen to 10s instant audio takeaway (Zero lag / Mobile friendly)"}
          aria-label="10s instant audio takeaway"
        >
          {isPlayingAudio ? (
            <>
              <div className="audio-hook-equalizer">
                <span className="eq-bar bar-1"></span>
                <span className="eq-bar bar-2"></span>
                <span className="eq-bar bar-3"></span>
                <span className="eq-bar bar-4"></span>
              </div>
              <span>Playing 10s</span>
            </>
          ) : (
            <>
              <span>🎧</span>
              <span>10s Audio Hook</span>
            </>
          )}
        </button>

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
          <a
            href={`/v/${video.id}`}
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                handleCardClick();
              }
            }}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {video.title}
          </a>
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
              className={`card-action-btn ${isPlayingAudio ? "saved" : ""}`}
              onClick={handleAudioHookClick}
              title={isPlayingAudio ? "Stop 10s Audio Takeaway" : "Listen to 10s Instant Audio Hook"}
              style={
                isPlayingAudio
                  ? { borderColor: "var(--accent-sky)", color: "var(--accent-sky)", background: "rgba(56, 189, 248, 0.15)" }
                  : undefined
              }
            >
              <span>{isPlayingAudio ? "⏹" : "🎧"}</span>
              <span>{isPlayingAudio ? "Stop" : "10s Audio"}</span>
            </button>
            {onShare && (
              <button
                className="card-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(video, e);
                }}
                title="Share talk with deep link, 𝕏 post, Reddit or Markdown embed"
                aria-label="Share talk"
              >
                <span>↗</span>
                <span>Share</span>
              </button>
            )}
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
