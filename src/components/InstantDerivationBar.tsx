"use client";

import React, { useState } from "react";
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

      // Success! Open note modal
      setIsGenerating(false);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setUrl("");

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
          padding: "16px 20px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), 0 0 20px rgba(56, 189, 248, 0.1)",
          backdropFilter: "blur(12px)",
          position: "relative",
        }}
      >
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
            <span
              style={{
                fontSize: "10px",
                background: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                padding: "2px 8px",
                borderRadius: "999px",
                fontWeight: 800,
                letterSpacing: "0.5px",
              }}
            >
              PRO &amp; CREDITS
            </span>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Paste any YouTube talk to extract LaTeX proofs &amp; Obsidian notes (5 free credits included)
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
                margin: "0 auto 20px auto",
              }}
            >
              ⚡
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-primary)" }}>
              Deriving Technical Lecture Notes
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 28px 0" }}>
              Our AI engine is deconstructing invariants, timing slices, and mathematical proofs.
            </p>

            {/* Steps Visualizer */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: currentStep >= 1 ? "rgba(56, 189, 248, 0.1)" : "rgba(255, 255, 255, 0.03)",
                  border: currentStep >= 1 ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                  color: currentStep >= 1 ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                <span>{currentStep > 1 ? "✓" : "⟳"}</span>
                <span>1. Fetching talk metadata &amp; audio timeline...</span>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: currentStep >= 2 ? "rgba(56, 189, 248, 0.1)" : "rgba(255, 255, 255, 0.03)",
                  border: currentStep >= 2 ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                  color: currentStep >= 2 ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                <span>{currentStep > 2 ? "✓" : currentStep === 2 ? "⟳" : "○"}</span>
                <span>2. Deconstructing core mental models &amp; milestones...</span>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: currentStep >= 3 ? "rgba(56, 189, 248, 0.1)" : "rgba(255, 255, 255, 0.03)",
                  border: currentStep >= 3 ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                  color: currentStep >= 3 ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                <span>{currentStep > 3 ? "✓" : currentStep === 3 ? "⟳" : "○"}</span>
                <span>3. Formulating rigorous LaTeX mathematical proofs...</span>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: currentStep >= 4 ? "rgba(56, 189, 248, 0.1)" : "rgba(255, 255, 255, 0.03)",
                  border: currentStep >= 4 ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                  color: currentStep >= 4 ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                <span>{currentStep === 4 ? "⟳" : "○"}</span>
                <span>4. Compiling Obsidian Markdown knowledge note...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          handleGenerate();
        }}
      />
    </>
  );
};

