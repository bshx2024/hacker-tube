import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | HackerTube",
  description:
    "Privacy Policy, data collection practices, cookie standards, and security measures for HackerTube.",
  alternates: {
    canonical: "https://www.hacker-tube.net/privacy",
  },
};

export default function PrivacyPage() {
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

      {/* Main Content */}
      <main className="container" style={{ flex: 1, maxWidth: "800px", padding: "48px 20px" }}>
        <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "24px" }}>
          <div style={{ display: "inline-block", padding: "4px 10px", background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", borderRadius: "4px", fontSize: "12px", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>
            PRIVACY &amp; DATA PROTECTION
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 10px 0", letterSpacing: "-0.5px" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
            Last updated: November 11, 2026 • Strict zero-tracking principles
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px", lineHeight: 1.7, fontSize: "15px", color: "var(--text-secondary)" }}>
          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              1. Overview &amp; Philosophy
            </h2>
            <p>
              At <strong>HackerTube</strong> (<a href="https://www.hacker-tube.net" style={{ color: "var(--accent-emerald)" }}>https://www.hacker-tube.net</a>), we take privacy and intellectual focus seriously. We believe in minimal data footprint, zero third-party advertising trackers, and transparent data handling. This Privacy Policy details what information we collect, why we collect it, and how your data is protected.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              2. Information We Collect
            </h2>
            <p>We only collect information necessary to provide and secure our educational study companion:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li><strong>Account Credentials:</strong> When you register, we collect your email address, encrypted password hash (if registering via email), or your OAuth account identifier (via Google or GitHub sign-in).</li>
              <li><strong>Usage Preferences:</strong> Bookmarked lectures, learning history, and study progress synced across your devices.</li>
              <li><strong>Survey Responses:</strong> Voluntary feedback submitted to help shape product features (such as desired lecture topics or export format preferences).</li>
              <li><strong>Payment Records:</strong> When you upgrade to Pro or purchase derivation packs, transaction records (e.g. order number, transaction ID, subscription status, amount, and timestamp) are stored for account entitlement. <em>We never store your full credit card number, CVV, or card security code.</em></li>
            </ul>
          </section>

          <section style={{ background: "rgba(15, 23, 42, 0.6)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#38bdf8", marginBottom: "12px" }}>
              3. Payment Processing &amp; Third Parties
            </h2>
            <p style={{ marginBottom: "12px" }}>
              All commercial transactions are processed through PCI-DSS Level 1 compliant Merchant of Record (MoR) and gateway providers, including:
            </p>
            <ul style={{ paddingLeft: "20px", margin: "0 0 12px 0" }}>
              <li><strong>Waffo:</strong> Global payment and merchant of record services.</li>
              <li><strong>Stripe:</strong> Credit card, Google Pay, and Apple Pay processing.</li>
              <li><strong>PayPal:</strong> Global digital wallet and card checkout.</li>
            </ul>
            <p style={{ margin: 0 }}>
              Payment information is encrypted and transmitted directly to these certified processors under their respective privacy policies and global security standards.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              4. Cookies &amp; Local Storage
            </h2>
            <p>
              HackerTube uses strictly necessary first-party cookies and browser local storage solely to:
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li>Maintain your authenticated user session securely.</li>
              <li>Persist your local bookmarks prior to cloud synchronization.</li>
              <li>Remember theme and player controls preferences.</li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              We do <strong>not</strong> use third-party advertising cookies, retargeting pixels, or behavioral tracking networks.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              5. Your Rights (GDPR &amp; CCPA Compliance)
            </h2>
            <p>
              Regardless of where you reside, you have the right to:
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li>Access the personal information we hold about you.</li>
              <li>Request correction or deletion of your personal data.</li>
              <li>Export your saved bookmarks and account data.</li>
              <li>Opt-out of any optional communication at any time.</li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              To exercise any of these rights, simply email us at <a href="mailto:support@hacker-tube.net" style={{ color: "#38bdf8" }}>support@hacker-tube.net</a>. Account deletion requests are completed within 48 hours.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              6. Data Security
            </h2>
            <p>
              We implement industry-standard security measures, including HTTPS encryption in transit, strict HTTPS headers, prepared SQL statements to prevent injection, and zero plain-text password storage.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              7. Contact Us
            </h2>
            <p>
              For privacy-related inquiries, data requests, or compliance questions:
            </p>
            <ul style={{ paddingLeft: "20px", margin: "8px 0 0 0" }}>
              <li>Email: <a href="mailto:support@hacker-tube.net" style={{ color: "#38bdf8" }}>support@hacker-tube.net</a></li>
              <li>Platform: HackerTube (<a href="https://www.hacker-tube.net" style={{ color: "var(--accent-emerald)" }}>https://www.hacker-tube.net</a>)</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

