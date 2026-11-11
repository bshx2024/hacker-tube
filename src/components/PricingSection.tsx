"use client";

import React, { useState } from "react";
import { useSession } from "@/core/auth/client";
import { AuthModal } from "./AuthModal";

export const PricingSection: React.FC<{ id?: string }> = ({ id = "pricing" }) => {
  const { data: session } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: "pro_monthly" | "micro_pack") => {
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setLoadingPlan(planId);
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Unable to start checkout. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      alert("Checkout error: " + msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id={id} style={{ padding: "80px 0 60px 0", borderTop: "1px solid var(--border-subtle)" }}>
      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              background: "rgba(16, 185, 129, 0.12)",
              color: "var(--accent-emerald)",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              marginBottom: "12px",
              letterSpacing: "0.5px",
            }}
          >
            TRANSPARENT HACKER-FRIENDLY PRICING
          </div>
          <h2 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 12px 0", letterSpacing: "-0.5px" }}>
            Simple Plans for Curious Minds
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
            Free community access forever. Upgrade anytime to unlock unlimited AI math derivations, deep study outlines, and Obsidian sync.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            alignItems: "stretch",
            marginBottom: "40px",
          }}
        >
          {/* Card 1: Free Community */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "16px",
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                Community
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "16px" }}>
                <span style={{ fontSize: "38px", fontWeight: 900, color: "var(--text-primary)" }}>$0</span>
                <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>/ forever</span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "24px" }}>
                Essential video indexing and community curated technical talks from 20 years of Hacker News history.
              </p>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "20px", marginBottom: "28px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>
                  What&apos;s Included:
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--accent-emerald)" }}>✓</span>
                    <span>Full access to 100+ curated talks</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--accent-emerald)" }}>✓</span>
                    <span>Ad-free YouTube player integration</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--accent-emerald)" }}>✓</span>
                    <span>5 daily AI lecture derivations</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--accent-emerald)" }}>✓</span>
                    <span>Local browser bookmarks</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById("videos");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="nav-btn"
              style={{ width: "100%", padding: "12px 0", justifyContent: "center", fontSize: "14px", fontWeight: 600 }}
            >
              Explore Free Catalog
            </button>
          </div>

          {/* Card 2: Pro Monthly (Highlighted) */}
          <div
            style={{
              background: "linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)",
              border: "2px solid var(--accent-emerald)",
              borderRadius: "16px",
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              boxShadow: "0 0 25px rgba(16, 185, 129, 0.15)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--accent-emerald)",
                color: "#000",
                fontSize: "11px",
                fontWeight: 900,
                padding: "3px 12px",
                borderRadius: "999px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Recommended for Builders
            </div>

            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-emerald)", textTransform: "uppercase", marginBottom: "8px" }}>
                HackerTube Pro
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "16px" }}>
                <span style={{ fontSize: "38px", fontWeight: 900, color: "var(--text-primary)" }}>$4.00</span>
                <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>/ month (Coffee Plan)</span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "24px" }}>
                Full-power AI study companion. Unlimited LaTeX math formulas, Obsidian export, and frontier model notes.
              </p>

              <div style={{ borderTop: "1px solid rgba(16, 185, 129, 0.2)", paddingTop: "20px", marginBottom: "28px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-emerald)", textTransform: "uppercase", marginBottom: "12px" }}>
                  Everything in Free, plus:
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--accent-emerald)", fontWeight: 900 }}>✓</span>
                    <span><strong>Unlimited</strong> AI lecture notes &amp; derivations</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--accent-emerald)", fontWeight: 900 }}>✓</span>
                    <span><strong>LaTeX math proofs</strong> &amp; equation walkthroughs</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--accent-emerald)", fontWeight: 900 }}>✓</span>
                    <span><strong>One-click Obsidian</strong> Markdown export</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--accent-emerald)", fontWeight: 900 }}>✓</span>
                    <span>Cross-device cloud bookmark synchronization</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--accent-emerald)", fontWeight: 900 }}>✓</span>
                    <span>Priority GPU queue (zero wait latency)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <button
                onClick={() => handleSelectPlan("pro_monthly")}
                disabled={loadingPlan === "pro_monthly"}
                className="nav-btn nav-btn-primary"
                style={{
                  width: "100%",
                  padding: "14px 0",
                  justifyContent: "center",
                  fontSize: "15px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {loadingPlan === "pro_monthly" ? "Redirecting to Checkout..." : "Upgrade to Pro ($4.00/mo) ⚡"}
              </button>
              <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", marginTop: "10px" }}>
                🛡️ 7-Day Money-Back Guarantee • Cancel Anytime
              </div>
            </div>
          </div>

          {/* Card 3: On-Demand Derivation Pack */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "16px",
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", marginBottom: "8px" }}>
                Micro Pack
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "16px" }}>
                <span style={{ fontSize: "38px", fontWeight: 900, color: "var(--text-primary)" }}>$1.00</span>
                <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>/ one-time</span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "24px" }}>
                10 on-demand AI math &amp; code derivations for any video ($0.10/lecture). Perfect for occasional deep research.
              </p>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "20px", marginBottom: "28px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", marginBottom: "12px" }}>
                  What&apos;s Included:
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#38bdf8" }}>✓</span>
                    <span>10 On-demand derivation credits</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#38bdf8" }}>✓</span>
                    <span>Credits never expire</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#38bdf8" }}>✓</span>
                    <span>No recurring monthly charge</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#38bdf8" }}>✓</span>
                    <span>Full LaTeX math formatting</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <button
                onClick={() => handleSelectPlan("micro_pack")}
                disabled={loadingPlan === "micro_pack"}
                className="nav-btn"
                style={{
                  width: "100%",
                  padding: "12px 0",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderColor: "rgba(56, 189, 248, 0.4)",
                  color: "#38bdf8",
                }}
              >
                {loadingPlan === "micro_pack" ? "Redirecting..." : "Get 10 Credits ($1.00)"}
              </button>
              <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", marginTop: "10px" }}>
                One-time payment • No subscription
              </div>
            </div>
          </div>
        </div>

        {/* Customer Support & Billing Questions Contact Box */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "20px 24px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              💬 Need billing assistance, refunds, or have feedback?
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Contact our human customer support team directly at{" "}
              <a href="mailto:support@hacker-tube.net" style={{ color: "var(--accent-emerald)", fontWeight: 700, textDecoration: "underline" }}>
                support@hacker-tube.net
              </a>
              . All inquiries answered within 24 hours.
            </div>
          </div>
          <a
            href="mailto:support@hacker-tube.net"
            className="nav-btn"
            style={{ padding: "8px 20px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
          >
            ✉️ Email Support
          </a>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </section>
  );
};

