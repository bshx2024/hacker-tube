import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { PricingSection } from "@/components/PricingSection";

export const metadata: Metadata = {
  title: "Pricing & Plans | HackerTube Pro",
  description:
    "Transparent pricing for HackerTube. Free community lecture catalog or HackerTube Pro with unlimited AI study companion, LaTeX math derivations, and Obsidian sync.",
  alternates: {
    canonical: "https://www.hacker-tube.net/pricing",
  },
};

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(9, 13, 22, 0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "64px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--text-primary)",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                background: "var(--accent-emerald)",
                color: "#000",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 900,
              }}
            >
              H
            </span>
            <span>HackerTube</span>
          </Link>

          <nav style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link href="/" className="nav-btn" style={{ fontSize: "13px", padding: "6px 14px", textDecoration: "none" }}>
              ← Back to Catalog
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Pricing Section */}
      <main style={{ flex: 1 }}>
        <PricingSection id="pricing-main" />

        {/* Feature Comparison Matrix */}
        <section className="container" style={{ maxWidth: "1000px", margin: "20px auto 60px auto", padding: "0 20px" }}>
          <h3 style={{ fontSize: "22px", fontWeight: 800, textAlign: "center", marginBottom: "24px" }}>
            Plan Comparison
          </h3>

          <div
            style={{
              overflowX: "auto",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(0, 0, 0, 0.3)" }}>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Feature</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700, width: "180px" }}>Free Community</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700, width: "220px", color: "var(--accent-emerald)" }}>
                    HackerTube Pro ($4/mo)
                  </th>
                </tr>
              </thead>
              <tbody style={{ color: "var(--text-secondary)" }}>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <td style={{ padding: "14px 20px" }}>Curated Talk Catalog &amp; Player</td>
                  <td style={{ padding: "14px 20px" }}>Full Access</td>
                  <td style={{ padding: "14px 20px", color: "var(--text-primary)" }}>Full Access</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <td style={{ padding: "14px 20px" }}>Ad-Free YouTube Embeds</td>
                  <td style={{ padding: "14px 20px" }}>✓ Included</td>
                  <td style={{ padding: "14px 20px", color: "var(--text-primary)" }}>✓ Included</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <td style={{ padding: "14px 20px" }}>AI Mathematical Derivations</td>
                  <td style={{ padding: "14px 20px" }}>5 per day</td>
                  <td style={{ padding: "14px 20px", color: "var(--accent-emerald)", fontWeight: 700 }}>Unlimited</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <td style={{ padding: "14px 20px" }}>LaTeX Formula Renderings</td>
                  <td style={{ padding: "14px 20px" }}>Standard</td>
                  <td style={{ padding: "14px 20px", color: "var(--accent-emerald)", fontWeight: 700 }}>Full Deep Derivations</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <td style={{ padding: "14px 20px" }}>One-Click Obsidian Export</td>
                  <td style={{ padding: "14px 20px" }}>Manual Copy</td>
                  <td style={{ padding: "14px 20px", color: "var(--accent-emerald)", fontWeight: 700 }}>Automated Markdown Sync</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <td style={{ padding: "14px 20px" }}>Cloud Sync Across Devices</td>
                  <td style={{ padding: "14px 20px" }}>Local Only</td>
                  <td style={{ padding: "14px 20px", color: "var(--accent-emerald)", fontWeight: 700 }}>Automatic Cloud Sync</td>
                </tr>
                <tr>
                  <td style={{ padding: "14px 20px" }}>Customer Support Guarantee</td>
                  <td style={{ padding: "14px 20px" }}>Community</td>
                  <td style={{ padding: "14px 20px", color: "var(--text-primary)" }}>Priority 24h (<a href="mailto:support@hacker-tube.net" style={{ color: "#38bdf8" }}>support@hacker-tube.net</a>)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Pricing & Refund FAQ */}
        <section className="container" style={{ maxWidth: "800px", margin: "0 auto 80px auto", padding: "0 20px" }}>
          <h3 style={{ fontSize: "22px", fontWeight: 800, textAlign: "center", marginBottom: "28px" }}>
            Billing &amp; Refund FAQ
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "20px 24px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              <h4 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 8px 0", color: "var(--text-primary)" }}>
                What payment methods do you accept?
              </h4>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                We accept major international credit and debit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, PayPal, and local payment methods via certified partners including <strong>Waffo</strong>, <strong>Stripe</strong>, and <strong>PayPal</strong>.
              </p>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "20px 24px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              <h4 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 8px 0", color: "var(--text-primary)" }}>
                Can I cancel my subscription anytime?
              </h4>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Yes! You can cancel your subscription with a single click at any time from your account dropdown. You will continue to have full Pro access until your current billing period ends, with zero subsequent charges.
              </p>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "20px 24px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              <h4 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 8px 0", color: "var(--accent-emerald)" }}>
                How does the 7-day money-back guarantee work?
              </h4>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                If you are not 100% satisfied with HackerTube Pro for any reason, email us at <a href="mailto:support@hacker-tube.net" style={{ color: "#38bdf8" }}>support@hacker-tube.net</a> within 7 days of your first charge. We will immediately issue a complete refund to your original payment method within 3-5 business days. No questions asked.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

