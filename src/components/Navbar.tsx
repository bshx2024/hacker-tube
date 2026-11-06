"use client";

import React from "react";
import { trackOutboundClick } from "@/lib/tracker";

interface NavbarProps {
  savedCount: number;
  onOpenSaved: () => void;
  onOpenShortcuts: () => void;
  onOpenSuggest?: () => void;
  isSavedView: boolean;
  onResetView: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  savedCount,
  onOpenSaved,
  onOpenShortcuts,
  onOpenSuggest,
  isSavedView,
  onResetView,
}) => {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <div className="logo-group" onClick={onResetView} style={{ cursor: "pointer" }}>
          <div className="logo-badge">HT</div>
          <div>
            <span className="brand-text">Hacker Tube</span>
            <span className="brand-tag">ANTI-ALGORITHM</span>
          </div>
        </div>

        <div className="nav-actions">
          <button
            className="nav-btn"
            onClick={onOpenSuggest}
            title="Suggest a high-signal video from Hacker News"
            id="btn-suggest-talk"
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              borderColor: "rgba(16, 185, 129, 0.3)",
              color: "var(--accent-emerald)",
              fontWeight: 600,
            }}
          >
            <span>＋</span>
            <span>Suggest Talk</span>
          </button>

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
            onClick={() => trackOutboundClick("dataset", "navbar")}
          >
            <span>📦</span>
            <span>Dataset</span>
          </a>

          <a
            href="https://github.com/bshx2024/hacker-tube"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn"
            title="View Open Source Code on GitHub"
            id="btn-github"
            onClick={() => trackOutboundClick("github", "navbar")}
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
