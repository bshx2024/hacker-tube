"use client";

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-col" style={{ maxWidth: "340px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div className="logo-badge" style={{ width: "28px", height: "28px", fontSize: "14px" }}>HT</div>
              <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>HackerTube</span>
            </div>
            <p style={{ lineHeight: 1.6, marginBottom: "12px" }}>
              An open-source, community-driven front-end indexing the highest-signal technical and scientific talks recommended across Hacker News history.
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              All video streams are played through official YouTube embeds in compliance with YouTube API Developer Policies.
            </p>
          </div>

          <div className="footer-col">
            <h4>Ecosystem &amp; Spinoffs</h4>
            <ul className="footer-links">
              <li><a href="https://hackerbooks.org" target="_blank" rel="noopener noreferrer">HackerBooks (Books on HN)</a></li>
              <li><a href="https://wikihack.org" target="_blank" rel="noopener noreferrer">Wikihack (Wikipedia on HN)</a></li>
              <li><a href="https://hnrepos.com" target="_blank" rel="noopener noreferrer">Hnrepos (GitHub on HN)</a></li>
              <li><a href="https://github.com/Jnaina/hackertube-tvos" target="_blank" rel="noopener noreferrer">HackerTube for Apple TV</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Data &amp; Open Source</h4>
            <ul className="footer-links">
              <li><a href="/api/dataset" target="_blank" rel="noopener noreferrer">Download Curated Dataset (JSON)</a></li>
              <li><a href="/llms.txt" target="_blank" rel="noopener noreferrer">LLM Agent Manifest (/llms.txt)</a></li>
              <li><a href="https://github.com/bshx2024/hacker-tube" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
              <li><a href="https://karpathy.bearblog.dev/hacker-tube/" target="_blank" rel="noopener noreferrer">Karpathy Original Post</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Standards &amp; GEO</h4>
            <ul className="footer-links">
              <li><a href="#faq">Frequently Asked Questions</a></li>
              <li><a href="/robots.txt" target="_blank" rel="noopener noreferrer">AI Crawler Policy</a></li>
              <li><a href="https://news.ycombinator.com" target="_blank" rel="noopener noreferrer">Hacker News (Y Combinator)</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            Built with craft &amp; respect for human attention. Zero tracking. Zero ads.
          </div>
          <div>
            Inspired by Andrej Karpathy • Built for curious minds
          </div>
        </div>
      </div>
    </footer>
  );
};
