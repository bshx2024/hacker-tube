"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CURATED_VIDEOS, VideoItem, TopicCategory } from "@/data/videos";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Controls, DurationFilter, SortOption } from "@/components/Controls";
import { VideoCard } from "@/components/VideoCard";
import { VideoModal } from "@/components/VideoModal";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { SlopContrastSection } from "@/components/SlopContrastSection";
import { ChannelWelcomeBanner } from "@/components/ChannelWelcomeBanner";
import { initAttributionTracker } from "@/lib/attribution";
import {
  trackPageView,
  trackBookmark,
  trackFilterTopic,
  trackVideoPlay,
  trackStudyOpen,
  trackEngagementHeartbeat,
} from "@/lib/tracker";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory>("All");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("mentions");
  const [isSavedView, setIsSavedView] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("hackertube_saved_ids");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<"player" | "study">("player");
  const [keyboardIndex, setKeyboardIndex] = useState<number>(-1);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Initialize First-Party Channel Attribution & Dispatch Page View
  useEffect(() => {
    initAttributionTracker();
    trackPageView();
  }, []);

  // Page Foreground Dwell Heartbeat (keeps GA4 active & logs reading retention)
  useEffect(() => {
    let dwellSeconds = 0;
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        dwellSeconds += 30;
        trackEngagementHeartbeat("page_reading", 30, {
          total_seconds: dwellSeconds,
          is_saved_view: isSavedView,
          selected_topic: selectedTopic,
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isSavedView, selectedTopic]);

  const handlePlayVideo = useCallback((v: VideoItem) => {
    trackVideoPlay(v);
    setActiveVideo(v);
    setModalInitialTab("player");
  }, []);

  const handleOpenStudy = useCallback((v: VideoItem) => {
    trackStudyOpen(v);
    setActiveVideo(v);
    setModalInitialTab("study");
  }, []);

  // Save bookmarks to localStorage and track event
  const handleToggleSave = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) => {
      const isSaved = prev.includes(id);
      const next = isSaved ? prev.filter((item) => item !== id) : [...prev, id];
      trackBookmark(id, isSaved ? "unsave" : "save");
      try {
        localStorage.setItem("hackertube_saved_ids", JSON.stringify(next));
      } catch {
        // Storage fallback
      }
      return next;
    });
  }, []);

  // Filter & sort videos
  const filteredVideos = useMemo(() => {
    return CURATED_VIDEOS.filter((video) => {
      // Bookmarks filter
      if (isSavedView && !savedIds.includes(video.id)) {
        return false;
      }

      // Topic filter
      if (!isSavedView && selectedTopic !== "All" && video.topic !== selectedTopic) {
        return false;
      }

      // Duration filter
      if (durationFilter === "short" && video.durationSeconds >= 1200) return false;
      if (durationFilter === "medium" && (video.durationSeconds < 1200 || video.durationSeconds > 2700)) return false;
      if (durationFilter === "long" && video.durationSeconds <= 2700) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = video.title.toLowerCase().includes(query);
        const matchesChannel = video.channelTitle.toLowerCase().includes(query);
        const matchesTopic = video.topic.toLowerCase().includes(query);
        const matchesExcerpt = video.hnExcerpt.toLowerCase().includes(query);
        const matchesAuthor = video.hnAuthor.toLowerCase().includes(query);
        return matchesTitle || matchesChannel || matchesTopic || matchesExcerpt || matchesAuthor;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "mentions") return b.hnMentions - a.hnMentions;
      if (sortBy === "latest") return b.publishedYear - a.publishedYear;
      if (sortBy === "duration") return b.durationSeconds - a.durationSeconds;
      return 0;
    });
  }, [isSavedView, savedIds, selectedTopic, durationFilter, searchQuery, sortBy]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't hijack if user is typing in search input or any other input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.getElementById("search-input") as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      } else if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        setKeyboardIndex((prev) => {
          const next = prev + 1 >= filteredVideos.length ? 0 : prev + 1;
          const el = document.getElementById(`video-${filteredVideos[next]?.id}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          return next;
        });
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        setKeyboardIndex((prev) => {
          const next = prev - 1 < 0 ? filteredVideos.length - 1 : prev - 1;
          const el = document.getElementById(`video-${filteredVideos[next]?.id}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          return next;
        });
      } else if (e.key === "Enter" && keyboardIndex >= 0 && filteredVideos[keyboardIndex]) {
        e.preventDefault();
        setActiveVideo(filteredVideos[keyboardIndex]);
      } else if ((e.key === "b" || e.key === "B") && keyboardIndex >= 0 && filteredVideos[keyboardIndex]) {
        e.preventDefault();
        handleToggleSave(filteredVideos[keyboardIndex].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredVideos, keyboardIndex, handleToggleSave]);

  const scrollToControls = () => {
    const el = document.getElementById("controls-panel");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleResetToAll = () => {
    setIsSavedView(false);
    setSelectedTopic("All");
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Select Top 5 most-voted HN talks for the spotlight carousel
  const featuredVideos = useMemo(() => {
    return [...CURATED_VIDEOS].sort((a, b) => b.hnMentions - a.hnMentions).slice(0, 5);
  }, []);

  return (
    <>
      <Navbar
        savedCount={savedIds.length}
        onOpenSaved={() => setIsSavedView(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isSavedView={isSavedView}
        onResetView={handleResetToAll}
      />

      <ChannelWelcomeBanner
        onSelectTopic={(topic) => {
          setSelectedTopic(topic as TopicCategory);
          trackFilterTopic(topic);
          scrollToControls();
        }}
        onExplore={scrollToControls}
      />

      <main>
        <Hero
          onExplore={scrollToControls}
          totalVideos={CURATED_VIDEOS.length}
          featuredVideos={featuredVideos}
          onPlayVideo={handlePlayVideo}
          onOpenStudy={handleOpenStudy}
          isSaved={(id) => savedIds.includes(id)}
          onToggleSave={handleToggleSave}
        />

        <SlopContrastSection />

        <div className="container">
          <div className="section-title-wrap" style={{ marginTop: "48px", marginBottom: "24px" }}>
            <div className="section-eyebrow">The Curated Library</div>
            <h2 className="section-title">HackerTube Curated Archive: High-Signal Talks &amp; AI Study Notes</h2>
          </div>

          <Controls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTopic={selectedTopic}
            onTopicChange={(topic) => {
              setSelectedTopic(topic);
              trackFilterTopic(topic);
            }}
            durationFilter={durationFilter}
            onDurationChange={setDurationFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            isSavedView={isSavedView}
            onToggleSavedView={setIsSavedView}
            savedCount={savedIds.length}
          />

          {/* Video List / Grid */}
          {filteredVideos.length > 0 ? (
            <div className="video-grid" id="video-grid">
              {filteredVideos.map((video, idx) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={handlePlayVideo}
                  onOpenStudy={handleOpenStudy}
                  isSaved={savedIds.includes(video.id)}
                  onToggleSave={handleToggleSave}
                  isSelectedKeyboard={keyboardIndex === idx}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "var(--bg-card)",
                borderRadius: "var(--radius-xl)",
                border: "1px dashed var(--border-subtle)",
                marginBottom: "60px",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
                {isSavedView ? "No Bookmarked Talks Yet" : "No Talks Found Matching Your Criteria"}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "500px", margin: "0 auto 20px" }}>
                {isSavedView
                  ? "Click the '+ Save' bookmark button on any video card to save talks locally for later study."
                  : "Try clearing search keywords or selecting a broader topic category."}
              </p>
              <button
                className="nav-btn nav-btn-primary"
                onClick={handleResetToAll}
                style={{ padding: "8px 20px" }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        <FAQSection />
      </main>

      <Footer />

      {/* Video Player Modal */}
      <VideoModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
        isSaved={activeVideo ? savedIds.includes(activeVideo.id) : false}
        onToggleSave={handleToggleSave}
        initialTab={modalInitialTab}
      />

      {/* Shortcuts Guide Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
}
