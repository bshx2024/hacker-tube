"use client";

import React, { useState } from "react";

export const SlopContrastSection: React.FC = () => {
  const [isHonestMode, setIsHonestMode] = useState(true);

  return (
    <section className="contrast-section" id="contrast-manifesto">
      <div className="container">
        <div className="section-title-wrap">
          <div className="section-eyebrow">The Manifesto</div>
          <h2 className="section-title">The Algorithmic Trap vs. The Human Filter</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "680px", margin: "12px auto 0", fontSize: "16px" }}>
            Commercial video platforms optimize for eyeballs and dopamine spikes. HackerTube optimizes for long-term intellectual leverage.
          </p>
        </div>

        {/* Feature Grid with Image & Contrast Details */}
        <div className="contrast-grid">
          {/* Visual Showcase Card */}
          <div className="contrast-visual-card">
            <div className="contrast-img-wrap">
              <img
                src="/images/anti-slop-contrast.jpg"
                alt="Visual comparison showing chaotic clickbait noise dissolving into clean structured knowledge nodes and Bell Labs history"
                className="contrast-img"
              />
              <div className="contrast-img-overlay">
                <span className="contrast-tag red">YouTube: Noise &amp; Addiction</span>
                <span className="contrast-arrow">➔</span>
                <span className="contrast-tag green">HackerTube: Pure Knowledge</span>
              </div>
            </div>
          </div>

          {/* Detailed Analytical Comparison Tiles */}
          <div className="contrast-cards-col">
            <div className="contrast-tile-slop">
              <div className="tile-badge-slop">❌ The Slop Firehose (Standard Algorithm)</div>
              <ul className="slop-list">
                <li><strong>Exaggerated Clickbait:</strong> Open-mouth screaming reaction thumbnails designed to trigger cortisol and impulsive clicks.</li>
                <li><strong>Watch-Time Optimization:</strong> Endless recommendations loop the same 5 topics you clicked yesterday, trapping you in an echo chamber.</li>
                <li><strong>Shallow Formats:</strong> 60-second shorts and over-edited hype videos that leave zero lasting comprehension.</li>
              </ul>
            </div>

            <div className="contrast-tile-signal">
              <div className="tile-badge-signal">✅ The Hacker News Standard (HackerTube)</div>
              <ul className="signal-list">
                <li><strong>50% Mid-frame Previews:</strong> Honest static frames taken from the middle of the lecture. What you see is what you learn.</li>
                <li><strong>20-Year Human Consensus:</strong> Filtered from 40,000+ organic recommendations by engineers with skin in the game.</li>
                <li><strong>Deep 1–2 Hour Masterclasses:</strong> MIT lectures, computer architecture deep dives, and foundational mathematical intuition.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interactive "One Live Thing" - Mid-Frame Simulator */}
        <div className="interactive-simulator-card">
          <div className="simulator-header">
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>
                Interactive Demonstration: Thumbnail Sanitizer
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Toggle below to experience the psychological difference between clickbait baiting and honest 50% timestamp preview.
              </p>
            </div>

            <div className="mode-toggle-group">
              <button
                className={`toggle-btn ${!isHonestMode ? "active-red" : ""}`}
                onClick={() => setIsHonestMode(false)}
              >
                😡 YouTube Clickbait
              </button>
              <button
                className={`toggle-btn ${isHonestMode ? "active-green" : ""}`}
                onClick={() => setIsHonestMode(true)}
              >
                🎯 50% Mid-Frame
              </button>
            </div>
          </div>

          <div className="simulator-preview-box">
            {isHonestMode ? (
              <div className="preview-content-honest">
                <div className="preview-badge-status green">✓ HackerTube Honest Frame (50% timestamp)</div>
                <div className="preview-headline">Neural Network Backpropagation: Matrix Derivation</div>
                <div className="preview-speaker">Speaker: Andrej Karpathy • 2h 25m • Stanford AI / Eureka Labs</div>
                <div className="preview-code-mock">
                  <code>
                    d_loss / d_weights = (X.T @ d_output) / batch_size<br/>
                    weights -= learning_rate * d_weights  # pure math, zero hype
                  </code>
                </div>
              </div>
            ) : (
              <div className="preview-content-clickbait">
                <div className="preview-badge-status red">⚠️ YouTube Retention Trap</div>
                <div className="preview-headline red-shout">🚨 YOU ARE CODING PYTHON WRONG?! (WATCH BEFORE DELETED!!!) 😱🔥</div>
                <div className="preview-speaker">Channel: 10x_Guru_Hacks • 8m 42s • [Mid-roll Ads: 5]</div>
                <div className="preview-code-mock red-border">
                  <em>*Exaggerated screaming face, glowing red arrows pointing to nowhere, 2 minutes of sponsored VPN pitch*</em>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
