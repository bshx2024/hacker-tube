"use client";

import React, { useState, useEffect, useCallback } from "react";
import { trackSurveySubmit } from "@/lib/tracker";

interface GeekMicroSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceContext?: string;
}

export const GeekMicroSurveyModal: React.FC<GeekMicroSurveyModalProps> = ({
  isOpen,
  onClose,
  sourceContext = "navbar",
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string>("on_demand_notes");
  const [pricingPreference, setPricingPreference] = useState<string>("sub_coffee");
  const [role, setRole] = useState<string>("ai_engineer");
  const [feedback, setFeedback] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeature || !pricingPreference) {
      setErrorMessage("Please select your preferred feature and pricing model.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desiredFeature: selectedFeature,
          pricingPreference,
          role,
          feedback,
          contact,
          source: sourceContext,
        }),
      });

      if (!res.ok) {
        throw new Error("Survey submission failed");
      }

      trackSurveySubmit({
        feature: selectedFeature,
        pricing: pricingPreference,
        role,
        hasFeedback: Boolean(feedback.trim()),
        hasContact: Boolean(contact.trim()),
        source: sourceContext,
      });

      setIsSuccess(true);
    } catch {
      setErrorMessage("Network issue. Your input couldn't be saved, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const featureOptions = [
    {
      id: "on_demand_notes",
      icon: "⚡",
      title: "On-demand AI Study Notes for ANY YouTube URL",
      desc: "Paste any talk link: auto-extract LaTeX equations, slide timestamps, and mental models in 30s.",
    },
    {
      id: "vault_sync",
      icon: "📚",
      title: "Obsidian & Notion Vault Auto-Sync",
      desc: "1-click push all talk notes directly into your personal second-brain folder via API.",
    },
    {
      id: "bilingual_subtitles",
      icon: "🌐",
      title: "Hardcore Tech Bilingual Subtitles",
      desc: "AI translations tuned specifically for machine learning, distributed systems, and low-level math terms.",
    },
    {
      id: "code_sandbox",
      icon: "🧠",
      title: "Interactive Code Sandbox & Mindmaps",
      desc: "Run Python/PyTorch code snippets straight in the browser beside the lecture video.",
    },
  ];

  const pricingOptions = [
    {
      id: "sub_coffee",
      label: "$3 - $5 / mo",
      badge: "COFFEE TIER",
      desc: "Standard subscriber (unlimited notes extraction, vault auto-sync).",
    },
    {
      id: "sub_pro",
      label: "$10 - $15 / mo",
      badge: "PRO RESEARCHER",
      desc: "Power users (private model inference, custom prompt tuning, API access).",
    },
    {
      id: "pay_per_video",
      label: "Pay-as-you-go",
      badge: "MICRO-METERED",
      desc: "Pay ~$0.10 per video note extraction. No recurring subscriptions.",
    },
    {
      id: "free_sponsor",
      label: "100% Free & Open",
      badge: "COMMUNITY SPONSORED",
      desc: "Keep all features open source; fund compute via unobtrusive developer sponsors & grants.",
    },
  ];

  const roleOptions = [
    { id: "ai_engineer", label: "🤖 AI / ML Engineer" },
    { id: "backend_arch", label: "💻 Systems / Backend Architect" },
    { id: "indie_founder", label: "🚀 Indie Hacker / Founder" },
    { id: "student_scholar", label: "🎓 CS Student / Researcher" },
    { id: "other", label: "⚡ Other Curious Mind" },
  ];

  return (
    <div className="modal-backdrop" onClick={handleClose} id="survey-modal">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "680px",
          padding: "28px 32px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button className="modal-close-btn" onClick={handleClose} aria-label="Close survey">
          ✕
        </button>

        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "1px solid rgba(168, 85, 247, 0.4)",
                    color: "#c084fc",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontWeight: 700,
                  }}
                >
                  ROADMAP &amp; PRO FEEDBACK
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>~30 seconds</span>
              </div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  marginBottom: "6px",
                }}
              >
                Shape HackerTube&apos;s Future
              </h2>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Help us build high-signal developer tools without algorithmic slop. Zero spam, honest engineering.
              </p>
            </div>

            {errorMessage && (
              <div
                style={{
                  background: "rgba(244, 63, 94, 0.15)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "#fda4af",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* Question 1: Desired Pro Feature */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                }}
              >
                1. Which upcoming AI feature would bring you the most value? *
              </label>
              <div style={{ display: "grid", gap: "10px" }}>
                {featureOptions.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFeature(f.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: selectedFeature === f.id ? "rgba(16, 185, 129, 0.1)" : "rgba(15, 23, 42, 0.5)",
                      border:
                        selectedFeature === f.id
                          ? "1.5px solid var(--accent-emerald)"
                          : "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: "20px", marginTop: "1px" }}>{f.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 700,
                          color: selectedFeature === f.id ? "#34d399" : "var(--text-primary)",
                          marginBottom: "2px",
                        }}
                      >
                        {f.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                        {f.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 2: Willingness to Pay & Pricing */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                }}
              >
                2. If you would pay for on-demand AI study companions, what pricing feels right? *
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "10px",
                }}
              >
                {pricingOptions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setPricingPreference(p.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: pricingPreference === p.id ? "rgba(56, 189, 248, 0.1)" : "rgba(15, 23, 42, 0.5)",
                      border:
                        pricingPreference === p.id
                          ? "1.5px solid var(--accent-sky)"
                          : "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: pricingPreference === p.id ? "#38bdf8" : "var(--text-primary)",
                        }}
                      >
                        {p.label}
                      </span>
                      <span
                        style={{
                          fontSize: "9.5px",
                          fontFamily: "var(--font-mono)",
                          background: "rgba(255, 255, 255, 0.06)",
                          color: "var(--text-secondary)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.35 }}>
                      {p.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 3: Developer Role */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                3. What best describes your primary engineering role?
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {roleOptions.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                      background: role === r.id ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.04)",
                      border:
                        role === r.id
                          ? "1px solid var(--accent-emerald)"
                          : "1px solid var(--border-subtle)",
                      color: role === r.id ? "#34d399" : "var(--text-secondary)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 4: Freeform Feedback */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "6px",
                }}
              >
                4. Any specific talks or ideas you&apos;d love to see on HackerTube? (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g., Please add Shannon's Information Theory lectures, or support auto-sync to Logseq/Notion..."
                rows={2}
                style={{
                  width: "100%",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Question 5: Optional Contact for Early Access */}
            <div style={{ marginBottom: "26px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "6px",
                }}
              >
                5. Email or GitHub handle for early Pro / Beta access (Optional)
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="developer@example.com or @username"
                style={{
                  width: "100%",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className="nav-btn"
                onClick={handleClose}
                style={{ padding: "9px 18px", fontSize: "13.5px" }}
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="nav-btn nav-btn-primary"
                style={{
                  padding: "9px 22px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  background: "var(--accent-emerald)",
                  color: "#051f15",
                  boxShadow: "0 0 16px rgba(16, 185, 129, 0.25)",
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit ⚡"}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid var(--accent-emerald)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                margin: "0 auto 16px",
                color: "var(--accent-emerald)",
              }}
            >
              ✓
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: "8px",
              }}
            >
              Signal Received!
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                maxWidth: "460px",
                margin: "0 auto 20px",
                lineHeight: 1.6,
              }}
            >
              Thank you, fellow hacker! Your vote directly shapes the HackerTube roadmap. We will prioritize high-signal engineering features without algorithmic distractions.
            </p>
            <button
              className="nav-btn nav-btn-primary"
              onClick={handleClose}
              style={{ padding: "9px 24px", fontSize: "14px" }}
            >
              Back to Exploring Talks ⚡
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
