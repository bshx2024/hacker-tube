"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/core/auth/client";
import { AuthModal } from "./AuthModal";
import { VideoItem } from "@/data/videos";
import { StudyNote } from "@/data/studyNotes";

interface InstantDerivationBarProps {
  onOpenGeneratedNote: (video: VideoItem, note: StudyNote) => void;
  onOpenPricing?: () => void;
}

export const InstantDerivationBar: React.FC<InstantDerivationBarProps> = ({
  onOpenGeneratedNote,
  onOpenPricing,
}) => {
  const { data: session } = useSession();
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [creditsToast, setCreditsToast] = useState<string | null>(null);

  // Sync real-time user credits & plan on mount or login
  useEffect(() => {
    if (!session?.user?.id) {
      setUserCredits(null);
      setUserPlan("free");
      return;
    }

    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUserCredits(typeof data.user.credits === "number" ? data.user.credits : 5);
          setUserPlan(data.user.plan || "free");
        }
      })
      .catch(() => {});
  }, [session?.user?.id]);

  // Extract YouTube ID on the fly
  const extractId = (val: string): string | null => {
    if (!val) return null;
    const trimmed = val.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
    );
    return match ? match[1] : null;
  };

  const detectedYtId = extractId(url);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    if (!detectedYtId) {
      setErrorMessage("Please enter a valid YouTube video link (e.g., https://www.youtube.com/watch?v=...)");
      return;
    }

    // If not logged in, prompt sign in
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);
    setCurrentStep(1);

    // Progressive step simulation for delightful UX
    const t1 = setTimeout(() => setCurrentStep(2), 1200);
    const t2 = setTimeout(() => setCurrentStep(3), 2800);
    const t3 = setTimeout(() => setCurrentStep(4), 4500);

    try {
      const res = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.paywall || res.status === 402) {
          setIsGenerating(false);
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          if (onOpenPricing) {
            onOpenPricing();
          } else {
            const pricingEl = document.getElementById("pricing");
            if (pricingEl) pricingEl.scrollIntoView({ behavior: "smooth" });
          }
          alert(data.message || "You have reached your derivation limit. Please upgrade to Pro.");
          return;
        }

        if (res.status === 401) {
          setShowAuthModal(true);
          setIsGenerating(false);
          return;
        }

        throw new Error(data.message || "Failed to generate lecture note.");
      }

      // Success! Update local credits
      setIsGenerating(false);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setUrl("");

      if (typeof data.creditsLeft === "number") {
        setUserCredits(data.creditsLeft);
        setCreditsToast(`🎉 Note generated! You have ${data.creditsLeft} credit${data.creditsLeft === 1 ? "" : "s"} left.`);
      }

      if (data.video && data.note) {
        onOpenGeneratedNote(data.video, data.note);
      }
    } catch (err: unknown) {
      setIsGenerating(false);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      const msg = err instanceof Error ? err.message : "Error generating notes.";
      setErrorMessage(msg);
    }
  };

  return (
    <>
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto 28px auto",
          background: "rgba(15, 23, 42, 0.75)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: "16px",
          padding: "18px 20px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), 0 0 20px rgba(56, 189, 248, 0.1)",
          backdropFilter: "blur(12px)",
          position: "relative",
        }}
      >
        {/* New User Welcome Banner if credits === 5 */}
        {session?.user && userCredits === 5 && (
          <div
            style={{
              marginBottom: "14px",
              padding: "7px 12px",
              background: "linear-gradient(90deg, rgba(56, 189, 248, 0.12), rgba(16, 185, 129, 0.12))",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🎉</span>
              <span>
                Welcome <strong>{session.user.name || session.user.email}</strong>! You have <strong>5 free derivation credits</strong>. Click a sample below to test!
              </span>
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: "var(--accent-sky)" }}>
            <span style={{ fontSize: "16px" }}>⚡</span>
            <span>INSTANT ON-DEMAND LECTURE DERIVATION</span>
            {userPlan === "pro" ? (
              <span
                style={{
                  fontSize: "10px",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.25))",
                  color: "var(--accent-emerald)",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>👑</span> PRO UNLIMITED
              </span>
            ) : userCredits !== null ? (
              <span
                style={{
                  fontSize: "10px",
                  background: userCredits > 0 ? "rgba(56, 189, 248, 0.18)" : "rgba(239, 68, 68, 0.18)",
                  color: userCredits > 0 ? "#38bdf8" : "#fca5a5",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  border: `1px solid ${userCredits > 0 ? "rgba(56, 189, 248, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>⚡</span> {userCredits} CREDIT{userCredits === 1 ? "" : "S"} LEFT
              </span>
            ) : (
              <span
                style={{
                  fontSize: "10px",
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                }}
              >
                ✨ 5 FREE CREDITS ON LOGIN
              </span>
            )}
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Paste any YouTube talk to extract LaTeX proofs &amp; Obsidian notes
          </div>
        </div>

        <form onSubmit={handleGenerate} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setErrorMessage("");
              }}
              placeholder="⚡ Paste any YouTube lecture URL to generate Obsidian AI Notes (5 free credits)"
              style={{
                width: "100%",
                background: "rgba(9, 13, 22, 0.9)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "12px 16px",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                fontFamily: "var(--font-mono)",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-sky)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="nav-btn"
            style={{
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              color: "#fff",
              border: "1px solid rgba(56, 189, 248, 0.5)",
              padding: "0 22px",
              height: "46px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: isGenerating ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
              borderRadius: "10px",
            }}
          >
            <span>{isGenerating ? "⏳" : "⚡"}</span>
            <span>{isGenerating ? "Synthesizing..." : "Generate Deep Notes"}</span>
          </button>
        </form>

        {/* 1-Click Sample Lecture Chips for Zero-Friction Activation */}
        <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <span>💡</span> Try a sample:
          </span>
          {[
            {
              label: "3Blue1Brown: Neural Nets",
              url: "https://www.youtube.com/watch?v=aircAruvnKk",
            },
            {
              label: "Karpathy: Intro to LLMs",
              url: "https://www.youtube.com/watch?v=VMj-3S1tku0",
            },
            {
              label: "Yann LeCun: World Models",
              url: "https://www.youtube.com/watch?v=bZQun8Y4L2A",
            },
            {
              label: "Bret Victor: Principle",
              url: "https://www.youtube.com/watch?v=PUv66718DII",
            },
          ].map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                setErrorMessage("");
              }}
              style={{
                background: url === sample.url ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${url === sample.url ? "rgba(56, 189, 248, 0.5)" : "rgba(255, 255, 255, 0.12)"}`,
                borderRadius: "20px",
                padding: "3px 10px",
                color: url === sample.url ? "#38bdf8" : "var(--text-secondary)",
                fontSize: "11px",
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                if (url !== sample.url) {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <span>⚡</span>
              <span>{sample.label}</span>
            </button>
          ))}
        </div>

        {/* Live Detected Preview Pill */}
        {detectedYtId && (
          <div
            style={{
              marginTop: "12px",
              padding: "8px 12px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "12px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://img.youtube.com/vi/${detectedYtId}/hqdefault.jpg`}
              alt="Preview"
              style={{ width: "48px", height: "32px", objectFit: "cover", borderRadius: "4px" }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ color: "var(--accent-emerald)", fontWeight: 700 }}>✓ Valid YouTube Lecture Detected: </span>
              <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>ID: {detectedYtId}</span>
            </div>
            <span style={{ color: "var(--accent-emerald)", fontSize: "11px", fontWeight: 700 }}>Ready to Derivate</span>
          </div>
        )}

        {/* Success toast after generation */}
        {creditsToast && (
          <div
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: "8px",
              color: "#34d399",
              fontSize: "12.5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{creditsToast}</span>
            <button
              type="button"
              onClick={() => setCreditsToast(null)}
              style={{ background: "none", border: "none", color: "#34d399", cursor: "pointer", fontSize: "14px" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div
            style={{
              marginTop: "10px",
              color: "#f87171",
              fontSize: "13px",
              background: "rgba(239, 68, 68, 0.1)",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}
      </div>

      {/* Progressive Step Generation Modal */}
      {isGenerating && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--accent-sky)",
              borderRadius: "16px",
              padding: "36px 32px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.2)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(56, 189, 248, 0.12)",
                border: "2px solid var(--accent-sky)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                margin: "0 auto 16px auto",
              }}
            >
              ⚡
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Synthesizing Deep Technical Derivations
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px" }}>
              Extracting mathematical proofs, LaTeX formulations, and Hacker News consensus.
            </p>

            <div style={{ display: "grid", gap: "12px", textAlign: "left" }}>
              {[
                { step: 1, label: "Fetching audio transcript & milestone chapters" },
                { step: 2, label: "Decomposing first-principles & architectural mental models" },
                { step: 3, label: "Rigorous LaTeX mathematical derivations & algorithm walk-through" },
                { step: 4, label: "Formatting Obsidian / Notion Markdown frontmatter" },
              ].map((s) => {
                const isDone = currentStep > s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <div
                    key={s.step}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: isCurrent
                        ? "rgba(56, 189, 248, 0.1)"
                        : isDone
                        ? "rgba(16, 185, 129, 0.08)"
                        : "rgba(255, 255, 255, 0.02)",
                      border: `1px solid ${
                        isCurrent
                          ? "rgba(56, 189, 248, 0.3)"
                          : isDone
                          ? "rgba(16, 185, 129, 0.2)"
                          : "rgba(255, 255, 255, 0.05)"
                      }`,
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>{isDone ? "✅" : isCurrent ? "⏳" : "⚪"}</span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: isDone ? "var(--accent-emerald)" : isCurrent ? "var(--accent-sky)" : "var(--text-muted)",
                        fontWeight: isCurrent || isDone ? 600 : 400,
                      }}
                    >
                      Step {s.step}: {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // Refetch user profile on login
          fetch("/api/user/profile")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.user) {
                setUserCredits(typeof data.user.credits === "number" ? data.user.credits : 5);
                setUserPlan(data.user.plan || "free");
              }
            })
            .catch(() => {});
        }}
      />
    </>
  );
};
