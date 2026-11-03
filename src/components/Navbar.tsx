"use client";

import React from "react";

interface NavbarProps {
  savedCount: number;
  onOpenSaved: () => void;
  onOpenShortcuts: () => void;
  isSavedView: boolean;
  onResetView: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  savedCount,
  onOpenSaved,
  onOpenShortcuts,
  isSavedView,
  onResetView,
}) => {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <div className="logo-group" onClick={onResetView} style={{ cursor: "pointer" }}>
          <div className="logo-badge">HT</div>
          <div>
            <span className="brand-text">HackerTube</span>
            <span className="brand-tag">ANTI-ALGORITHM</span>
          </div>
        </div>

        <div className="nav-actions">
          <button
            className="nav-btn"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts"
            id="btn-shortcuts"
          >
            <span>⌨️</span>
            <span>Shortcuts</span>
          </button>

          <a
            href="/api/dataset"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn"
            title="Download Full Clean JSON Dataset"
            id="btn-dataset"
          >
            <span>📦</span>
            <span>Dataset</span>
          </a>

          <a
            href="https://github.com/hackertube/hackertube"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn"
            title="View Open Source Code on GitHub"
            id="btn-github"
          >
            <span>⭐</span>
            <span>GitHub</span>
          </a>

          <button
            className={`nav-btn ${isSavedView ? "nav-btn-primary" : ""}`}
            onClick={onOpenSaved}
            id="btn-watch-later"
          >
            <span>🔖</span>
            <span>Saved {savedCount > 0 ? `(${savedCount})` : ""}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
