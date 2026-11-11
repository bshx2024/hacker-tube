import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | HackerTube",
  description:
    "Terms of Service, billing conditions, refund policy, and acceptable use guidelines for HackerTube.",
  alternates: {
    canonical: "https://www.hacker-tube.net/terms",
  },
};

export default function TermsPage() {
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
          <div style={{ display: "inline-block", padding: "4px 10px", background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-emerald)", borderRadius: "4px", fontSize: "12px", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>
            LEGAL &amp; COMPLIANCE
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 10px 0", letterSpacing: "-0.5px" }}>
            Terms of Service
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
            Last updated: November 11, 2026 • Effective immediately
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px", lineHeight: 1.7, fontSize: "15px", color: "var(--text-secondary)" }}>
          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using <strong>HackerTube</strong> (&quot;the Service&quot;, located at <a href="https://www.hacker-tube.net" style={{ color: "var(--accent-emerald)" }}>https://www.hacker-tube.net</a>), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              2. Description of the Service
            </h2>
            <p>
              HackerTube is an AI-augmented educational catalog and study companion indexing seminal computer science and engineering talks. We provide curated technical lectures, AI-generated study outlines, LaTeX mathematical derivations, and note synchronization capabilities.
            </p>
            <p>
              Video playback is delivered via official YouTube embed players in strict adherence to the <strong>YouTube API Services Terms of Service</strong>. HackerTube does not host or store copyrighted video streams on its own servers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              3. User Accounts &amp; Security
            </h2>
            <p>
              When creating an account, you must provide accurate and complete information. You are responsible for safeguarding your login credentials and for any activities or actions under your account. We reserve the right to suspend or terminate accounts that violate our terms or engage in abusive traffic.
            </p>
          </section>

          <section style={{ background: "rgba(15, 23, 42, 0.6)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent-emerald)", marginBottom: "12px" }}>
              4. Subscription, Pricing &amp; Refund Policy
            </h2>
            <p style={{ marginBottom: "12px" }}>
              <strong>Pricing &amp; Plans:</strong> HackerTube offers free community access and optional paid tiers (including <em>HackerTube Pro</em> subscription at $4.00/month, and one-time on-demand derivation packs at $1.00). All fees are clearly stated in USD prior to purchase.
            </p>
            <p style={{ marginBottom: "12px" }}>
              <strong>Payment Processing:</strong> Payments are securely processed through our authorized Merchant of Record (MoR) and payment gateway partners, including <strong>Waffo</strong>, <strong>Stripe</strong>, and <strong>PayPal</strong>. HackerTube does not collect or store full credit card numbers on its servers.
            </p>
            <p style={{ marginBottom: "12px" }}>
              <strong>Cancellation:</strong> You may cancel your subscription at any time directly from your account settings. Upon cancellation, your Pro benefits remain active until the end of your current paid billing period, with zero recurring charges thereafter.
            </p>
            <p style={{ margin: 0 }}>
              <strong>7-Day Refund Policy:</strong> We offer a <strong>7-day 100% money-back guarantee</strong> for first-time Pro subscribers. If you are not completely satisfied with our service, email us at <a href="mailto:support@hacker-tube.net" style={{ color: "#38bdf8" }}>support@hacker-tube.net</a> within 7 days of purchase, and our team will issue a full refund to your original payment method within 3 to 5 business days.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              5. Intellectual Property
            </h2>
            <p>
              All original content, AI synthesis algorithms, software design, interface elements, and branding created by HackerTube are the exclusive property of HackerTube and its licensors. Educational talk excerpts and third-party references remain the property of their respective creators and copyright owners under fair use guidelines.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              6. Limitation of Liability
            </h2>
            <p>
              HackerTube is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. In no event shall HackerTube, its contributors, or partners be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the service.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              7. Contact Information
            </h2>
            <p>
              If you have any questions about these Terms of Service or need billing assistance, please reach out to our team:
            </p>
            <ul style={{ paddingLeft: "20px", margin: "8px 0 0 0" }}>
              <li>Email: <a href="mailto:support@hacker-tube.net" style={{ color: "#38bdf8" }}>support@hacker-tube.net</a></li>
              <li>Operator: HackerTube Studio</li>
              <li>Website: <a href="https://www.hacker-tube.net" style={{ color: "var(--accent-emerald)" }}>https://www.hacker-tube.net</a></li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

