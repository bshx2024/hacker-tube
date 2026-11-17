"use client";

import React, { useState } from "react";
import Image from "next/image";
import { VideoItem } from "@/data/videos";
import { trackVideoPlay } from "@/lib/tracker";

interface VideoPlayerFacadeProps {
  video: VideoItem;
  midframeThumb: string;
}

export const VideoPlayerFacade: React.FC<VideoPlayerFacadeProps> = ({
  video,
  midframeThumb,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStartPlay = () => {
    trackVideoPlay(video);
    setIsPlaying(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleStartPlay();
    }
  };

  if (isPlaying) {
    return (
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
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={video.title}
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleStartPlay}
      onKeyDown={handleKeyDown}
      aria-label={`Play lecture: ${video.title}`}
      style={{
        width: "100%",
        aspectRatio: "16 / 9",
        background: "#090d16",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        marginBottom: "24px",
        position: "relative",
        cursor: "pointer",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
        border: "1px solid var(--border-subtle)",
        transition: "border-color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease",
      }}
      className="video-facade-container"
    >
      {/* 50% Midframe Honest Preview Image */}
      <img
        src={midframeThumb}
        alt={`50% runtime preview for ${video.title}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          filter: "brightness(0.82) contrast(1.05)",
          transition: "filter 0.3s ease, transform 0.4s ease",
        }}
        className="video-facade-img"
        loading="eager"
      />

      {/* Dark Vignette & Sci-Fi Scanline Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(9, 13, 22, 0.95) 0%, rgba(9, 13, 22, 0.35) 45%, rgba(9, 13, 22, 0.75) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Overlay Badges */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          right: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "none",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              color: "var(--accent-emerald)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: "12px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "5px",
              backdropFilter: "blur(8px)",
            }}
          >
            <span>▲</span> {video.hnMentions} HN Mentions
          </span>
          <span
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              color: "#e2e8f0",
              border: "1px solid var(--border-subtle)",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: "12px",
              fontWeight: 600,
              backdropFilter: "blur(8px)",
            }}
          >
            50% Runtime Frame
          </span>
        </div>

        <span
          style={{
            background: "rgba(0, 0, 0, 0.75)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle)",
            padding: "4px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: "12.5px",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            backdropFilter: "blur(8px)",
          }}
        >
          {video.duration}
        </span>
      </div>

      {/* Center Tactical Play Hook */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          pointerEvents: "none",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(6, 182, 212, 0.9))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 30px rgba(16, 185, 129, 0.45)",
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
          }}
          className="video-facade-play-btn"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginLeft: "4px" }}
          >
            <path d="M5 3L19 12L5 21V3Z" fill="#090d16" />
          </svg>
        </div>

        <div style={{ pointerEvents: "none" }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "0.2px",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            Click or Press Space to Watch Video
          </div>
          <div
            style={{
              fontSize: "12.5px",
              color: "var(--text-secondary)",
              marginTop: "4px",
              letterSpacing: "0.3px",
            }}
          >
            Zero Clickbait · Honest 50% Preview · Clean Fast Embed
          </div>
        </div>
      </div>
    </div>
  );
};

