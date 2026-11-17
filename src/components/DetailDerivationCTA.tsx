"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/core/auth/client";
import { AuthModal } from "./AuthModal";

interface DetailDerivationCTAProps {
  currentVideoTitle?: string;
  currentTopic?: string;
}

export const DetailDerivationCTA: React.FC<DetailDerivationCTAProps> = ({
  currentVideoTitle,
  currentTopic,
}) => {
  const { data: session } = useSession();
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setUserCredits(null);
      return;
    }

    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUserCredits(typeof data.user.credits === "number" ? data.user.credits : 5);
        }
      })
      .catch(() => {});
  }, [session?.user?.id]);

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
      setErrorMessage("Please enter a valid YouTube video link (e.g. https://www.youtube.com/watch?v=...)");
      return;
    }

    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);
    setCurrentStep(1);

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
          window.location.href = "/pricing";
          return;
        }

        if (res.status === 401) {
          setShowAuthModal(true);
          setIsGenerating(false);
          return;
        }

        throw new Error(data.message || "Failed to generate lecture note.");
      }

      setIsGenerating(false);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      const targetPath = data.slug ? `/v/${data.slug}` : (data.video?.id ? `/v/${data.video.id}` : "/");
      window.location.href = targetPath;
    } catch (err: unknown) {
      setIsGenerating(false);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      const msg = err instanceof Error ? err.message : "Error generating notes.";
      setErrorMessage(msg);
    }
  };

  const sampleChips = [
    { title: "Andrej Karpathy: Micrograd", path: "/v/karpathy-micrograd" },
    { title: "Ilya Sutskever: Unsupervised Learning", path: "/v/ilya-sutskever-unsupervised-learning" },
    { title: "Yann LeCun: JEPA World Models", path: "/v/yann-lecun-world-models-jepa" },
    { title: "Rich Hickey: Simple Made Easy", path: "/v/rich-hickey-simple-made-easy" },
    { title: "John Carmack: Fast Inverse Square Root", path: "/v/fast-inverse-square-root" },
  ];

  return (
    <>
      <section
        style={{
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(9, 13, 22, 0.95) 100%)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          borderRadius: "var(--radius-xl)",
          padding: "28px 24px",
          marginBottom: "36px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
          position: "relative",
          overflow: "hidden",
        }}
        aria-label="Synthesize AI Study Notes"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "999px", padding: "3px 10px", fontSize: "11.5px", color: "var(--accent-sky)", fontWeight: 700, marginBottom: "8px" }}>
              <span>⚡ ON-DEMAND AI NOTE DERIVATION</span>
              <span>•</span>
              <span>Obsidian Ready</span>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0, lineHeight: 1.35 }}>
              Synthesize Deep LaTeX Notes for ANY YouTube Talk
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", margin: "6px 0 0", lineHeight: 1.5 }}>
              Loved the mathematical proofs for {currentVideoTitle ? `"${currentVideoTitle.slice(0, 45)}..."` : "this lecture"}? Paste any technical lecture to extract slide timestamps, mental models, and LaTeX in 30s.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.12)", color: "var(--accent-emerald)", border: "1px solid rgba(16, 185, 129, 0.3)", fontWeight: 700 }}>
              {session?.user ? `⚡ ${userCredits ?? 5} Free Credits` : "⚡ 5 Free Credits Included"}
            </span>
            <Link
              href="/pricing"
              style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none" }}
            >
              Pro Plans →
            </Link>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
          <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
            <input
              type="text"
              placeholder="Paste any YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setErrorMessage("");
              }}
              disabled={isGenerating}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(15, 23, 42, 0.9)",
                border: errorMessage ? "1px solid #ef4444" : "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "13.5px",
                outline: "none",
                fontFamily: "var(--font-mono)",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating || !url.trim()}
            className="nav-btn nav-btn-primary"
            style={{
              padding: "12px 22px",
              fontSize: "13.5px",
              fontWeight: 700,
              cursor: isGenerating || !url.trim() ? "not-allowed" : "pointer",
              opacity: isGenerating || !url.trim() ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {isGenerating ? (
              <span>⚡ Synthesizing Step {currentStep}/4...</span>
            ) : (
              <span>⚡ Synthesize Notes (Free)</span>
            )}
          </button>
        </form>

        {/* Generating Progress Indicator */}
        {isGenerating && (
          <div style={{ marginTop: "14px", padding: "12px 16px", background: "rgba(15, 23, 42, 0.9)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--accent-sky)", fontWeight: 600, marginBottom: "8px" }}>
              <span>
                {currentStep === 1 && "1/4: Fetching YouTube transcript & verified captions..."}
                {currentStep === 2 && "2/4: Calling DeepSeek-R1 / Qwen2.5-72B for mathematical proofs..."}
                {currentStep === 3 && "3/4: Structuring Obsidian frontmatter & slide timestamps..."}
                {currentStep === 4 && "4/4: Finalizing zero-slop Markdown document..."}
              </span>
              <span>{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <div style={{ width: "100%", height: "4px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "2px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(currentStep / 4) * 100}%`,
                  background: "linear-gradient(90deg, var(--accent-sky), var(--accent-emerald))",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <div style={{ color: "#ef4444", fontSize: "12.5px", marginTop: "8px" }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* 1-Click Sample Chips for Zero-Friction Exploration */}
        <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Or explore verified derivations:
          </span>
          {sampleChips.map((chip) => (
            <Link
              key={chip.path}
              href={chip.path}
              style={{
                fontSize: "11.5px",
                color: "var(--text-secondary)",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "999px",
                padding: "3px 10px",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              {chip.title}
            </Link>
          ))}
        </div>
      </section>

      {/* Auth Modal for Unauthenticated Users */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

