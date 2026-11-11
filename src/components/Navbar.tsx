"use client";

import React from "react";
import { trackOutboundClick } from "@/lib/tracker";
import { UserNavClient } from "./UserNavClient";

interface NavbarProps {
  savedCount: number;
  onOpenSaved: () => void;
  onOpenShortcuts: () => void;
  onOpenSuggest?: () => void;
  onOpenSurvey?: () => void;
  isSavedView: boolean;
  onResetView: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  savedCount,
  onOpenSaved,
  onOpenShortcuts,
  onOpenSuggest,
  onOpenSurvey,
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

          <a
            href="/pricing"
            className="nav-btn"
            title="View Transparent Plans & Pricing"
            id="btn-pricing"
            style={{
              background: "rgba(56, 189, 248, 0.08)",
              borderColor: "rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <span>💎</span>
            <span>Pricing</span>
          </a>

          {onOpenSurvey && (
            <button
              className="nav-btn"
              onClick={onOpenSurvey}
              title="Shape HackerTube Pro roadmap (30s survey)"
              id="btn-survey"
              style={{
                background: "rgba(168, 85, 247, 0.08)",
                borderColor: "rgba(168, 85, 247, 0.35)",
                color: "#c084fc",
                fontWeight: 600,
              }}
            >
              <span>⚡</span>
              <span>Pro Survey</span>
            </button>
          )}

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

          <UserNavClient />
        </div>
      </div>
    </header>
  );
};
