"use client";

import React, { useRef } from "react";
import { TOPIC_CATEGORIES, TopicCategory } from "@/data/videos";

export type DurationFilter = "all" | "short" | "medium" | "long";
export type SortOption = "mentions" | "latest" | "duration";

interface ControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTopic: TopicCategory;
  onTopicChange: (topic: TopicCategory) => void;
  durationFilter: DurationFilter;
  onDurationChange: (d: DurationFilter) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  isSavedView: boolean;
  onToggleSavedView: (val: boolean) => void;
  savedCount: number;
}

export const Controls: React.FC<ControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedTopic,
  onTopicChange,
  durationFilter,
  onDurationChange,
  sortBy,
  onSortChange,
  isSavedView,
  onToggleSavedView,
  savedCount,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="controls-panel" id="controls-panel">
      {/* Search Bar */}
      <div className="search-bar-wrap">
        <span style={{ fontSize: "18px", color: "var(--text-muted)" }}>🔍</span>
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="Search talks by title, channel, topic, or HN quote..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          id="search-input"
        />
        <span className="shortcut-hint">Press &apos;/&apos; to search</span>
      </div>

      {/* Categories */}
      <div className="filters-row">
        <div className="category-pills">
          <button
            className={`cat-pill ${!isSavedView ? "active" : ""}`}
            onClick={() => onToggleSavedView(false)}
          >
            🔥 All Curated
          </button>
          <button
            className={`cat-pill ${isSavedView ? "active" : ""}`}
            onClick={() => onToggleSavedView(true)}
          >
            🔖 Bookmarks ({savedCount})
          </button>

          <span style={{ borderLeft: "1px solid var(--border-subtle)", margin: "0 4px" }} />

          {TOPIC_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${!isSavedView && selectedTopic === cat ? "active" : ""}`}
              onClick={() => {
                if (isSavedView) onToggleSavedView(false);
                onTopicChange(cat);
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary dropdown filters */}
        <div className="secondary-filters">
          <select
            className="filter-select"
            value={durationFilter}
            onChange={(e) => onDurationChange(e.target.value as DurationFilter)}
            id="filter-duration"
          >
            <option value="all">Any Length</option>
            <option value="short">&lt; 20 Mins</option>
            <option value="medium">20–45 Mins</option>
            <option value="long">45+ Mins (Deep Dives)</option>
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            id="filter-sort"
          >
            <option value="mentions">Sort: Most HN Mentions</option>
            <option value="latest">Sort: Release Year</option>
            <option value="duration">Sort: Longest First</option>
          </select>
        </div>
      </div>
    </div>
  );
};
