"use client";

import React, { useEffect, useRef } from "react";
import { trackStudyOpen, trackEngagementHeartbeat, trackEvent } from "@/lib/tracker";

interface VideoDetailDwellTrackerProps {
  video: {
    id: string;
    title: string;
    topic: string;
  };
}

export const VideoDetailDwellTracker: React.FC<VideoDetailDwellTrackerProps> = ({ video }) => {
  const scrolledMilestones = useRef<Set<number>>(new Set());

  useEffect(() => {
    // 1. Initial page landing & study reading event
    trackStudyOpen({
      id: video.id,
      title: video.title,
      topic: video.topic,
    });

    // 2. Active Engagement Heartbeat (every 20 seconds)
    // Solves analytics 1-second single-page bounce misinterpretation and measures real reading dwell time
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        trackEngagementHeartbeat("page_reading", 20, {
          video_id: video.id,
          title: video.title,
          topic: video.topic,
        });
      }
    }, 20000);

    // 3. Scroll Depth Telemetry (25%, 50%, 75%, 100%)
    const handleScroll = () => {
      if (typeof window === "undefined" || typeof document === "undefined") return;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const currentScrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
      const milestones = [25, 50, 75, 100];

      milestones.forEach((m) => {
        if (currentScrollPercent >= m && !scrolledMilestones.current.has(m)) {
          scrolledMilestones.current.add(m);
          trackEvent("scroll_depth", {
            video_id: video.id,
            depth: m,
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [video.id, video.title, video.topic]);

  return null;
};

