"use client";

import React, { useState, useEffect } from "react";
import { getDetectedGeekSource, GeekSourceType } from "@/lib/attribution";
import { trackOutboundClick } from "@/lib/tracker";

interface ChannelWelcomeBannerProps {
  onSelectTopic?: (topic: string) => void;
  onExplore?: () => void;
}

const STORAGE_DISMISSED_KEY = "ht_channel_banner_dismissed";

interface SourceConfig {
  badge: string;
  badgeBg: string;
  title: string;
  message: string;
  ctaText?: string;
  ctaAction?: () => void;
  ctaHref?: string;
}

export const ChannelWelcomeBanner: React.FC<ChannelWelcomeBannerProps> = ({
  onSelectTopic,
  onExplore,
}) => {
  const [detected, setDetected] = useState<{
    type: GeekSourceType;
    sourceName: string;
  } | null>(null);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Defer state update to next tick to avoid cascading synchronous render in hydration
    const timer = setTimeout(() => {
      try {
        if (sessionStorage.getItem(STORAGE_DISMISSED_KEY) === "true") {
          return;
        }
        const source = getDetectedGeekSource();
        if (source && source.type !== "direct" && source.type !== "search") {
          setDetected(source);
          setIsDismissed(false);
        }
      } catch {
        // Ignore private mode sessionStorage restrictions
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (isDismissed || !detected) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_DISMISSED_KEY, "true");
    } catch {
      // Ignore
    }
  };

  const getConfig = (): SourceConfig => {
    switch (detected.type) {
      case "hackernews":
        return {
          badge: "▲ Hacker News",
          badgeBg: "rgba(255, 102, 0, 0.15)",
          title: "Welcome Hacker News Readers!",
          message:
            "Organically curated from 20 years of HN comments. Mid-frame previews, zero slop, and full study notes exportable to Obsidian/Notion.",
          ctaText: "Explore Top Voted Talks",
          ctaAction: onExplore,
        };
      case "twitter":
        return {
          badge: "𝕏 Karpathy Concept",
          badgeBg: "rgba(56, 189, 248, 0.15)",
          title: "The Anti-Algorithm Movement",
          message:
            "Inspired by Andrej Karpathy's concept. Tech talks curated strictly by engineering peer consensus—never clickbait thumbnails.",
          ctaText: "Filter AI & Deep Learning",
          ctaAction: () => onSelectTopic?.("AI/ML"),
        };
      case "ai_search":
        return {
          badge: "✦ AI Search & GEO",
          badgeBg: "rgba(168, 85, 247, 0.15)",
          title: "Referred by AI Search / Agent",
          message:
            "Welcome! Access our structured JSON metadata, verified lecture index, and AI study notes with zero tracking.",
          ctaText: "Get Open Dataset",
          ctaHref: "/api/dataset",
        };
      case "reddit":
        return {
          badge: "⚡ Reddit Tech Community",
          badgeBg: "rgba(249, 115, 22, 0.15)",
          title: "Welcome r/programming & r/MachineLearning!",
          message:
            "Tired of 10-minute videos dragged out for ad revenue? Here are the highest-voted technical deep dives.",
          ctaText: "Explore Systems & OS",
          ctaAction: () => onSelectTopic?.("Systems"),
        };
      case "github":
        return {
          badge: "⭐ GitHub Community",
          badgeBg: "rgba(255, 255, 255, 0.12)",
          title: "Welcome GitHub Builder!",
          message:
            "HackerTube is 100% open source and privacy-preserving. Zero client-side lock-in, all notes exportable to Markdown.",
          ctaText: "View Repository",
          ctaHref: "https://github.com/bshx2024/hacker-tube",
        };
      default:
        return {
          badge: "⚡ Tech Community",
          badgeBg: "rgba(16, 185, 129, 0.15)",
          title: "High-Signal Knowledge Archive",
          message:
            "Human-curated tech talks from Hacker News. Free from clickbait and algorithmic slop.",
          ctaText: "Start Exploring",
          ctaAction: onExplore,
        };
    }
  };

  const config = getConfig();

  return (
    <div
      style={{
        background:
          "linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, rgba(9, 13, 22, 0.95) 50%, rgba(56, 189, 248, 0.08) 100%)",
        borderBottom: "1px solid rgba(16, 185, 129, 0.25)",
        padding: "10px 16px",
        position: "relative",
        zIndex: 40,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 auto" }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              background: config.badgeBg,
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#f1f5f9",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            {config.badge}
          </span>

          <div style={{ fontSize: "13px", lineHeight: "1.4", color: "var(--text-secondary)" }}>
            <strong style={{ color: "#f8fafc", marginRight: "6px" }}>{config.title}</strong>
            <span style={{ display: "inline-block" }}>{config.message}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {config.ctaText && config.ctaHref ? (
            <a
              href={config.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutboundClick("dataset", "welcome_banner")}
              className="nav-btn nav-btn-primary"
              style={{ padding: "4px 12px", fontSize: "12px", height: "28px" }}
            >
              {config.ctaText} →
            </a>
          ) : config.ctaText && config.ctaAction ? (
            <button
              onClick={config.ctaAction}
              className="nav-btn nav-btn-primary"
              style={{ padding: "4px 12px", fontSize: "12px", height: "28px" }}
            >
              {config.ctaText} ↓
            </button>
          ) : null}

          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            title="Dismiss"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "16px",
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
