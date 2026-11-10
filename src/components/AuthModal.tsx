"use client";

import React, { useState } from "react";
import { signIn } from "@/core/auth/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleGitHubSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      await signIn.social({
        provider: "github",
        callbackURL: window.location.origin,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "GitHub sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setErrorMsg("");

      if (isSignUp) {
        await (signIn as any).email({
          email,
          password: password || "GeekPass2026!",
          callbackURL: window.location.origin,
        });
      } else {
        await (signIn as any).email({
          email,
          password: password || "GeekPass2026!",
          callbackURL: window.location.origin,
        });
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Sign in failed. Check your email credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "420px",
          width: "90%",
          padding: "24px",
          background: "#0d131f",
          border: "1px solid #1f293d",
          borderRadius: "12px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>⚡</span>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#f8fafc" }}>
              {isSignUp ? "Create HackerTube Account" : "Sign In to HackerTube"}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: 0, marginBottom: "20px", lineHeight: "1.5" }}>
          Sync your saved tech lectures across devices, access on-demand LaTeX math derivations, and export to Obsidian.
        </p>

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: "16px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "12px",
              borderRadius: "6px",
            }}
          >
            {errorMsg}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={handleGitHubSignIn}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "10px 16px",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: "16px" }}>🐙</span>
            <span>Continue with GitHub (Fast & Geek)</span>
          </button>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "10px 16px",
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "14px",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <span style={{ fontSize: "16px" }}>🌐</span>
            <span>Continue with Google</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ flex: 1, height: "1px", background: "#1e293b" }} />
          <span style={{ fontSize: "12px", color: "#64748b" }}>or with email</span>
          <div style={{ flex: 1, height: "1px", background: "#1e293b" }} />
        </div>

        <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alumni@stanford.edu"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#090d16",
                border: "1px solid #1e293b",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#090d16",
                border: "1px solid #1e293b",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              padding: "10px",
              background: "var(--accent-emerald, #10b981)",
              border: "none",
              borderRadius: "6px",
              color: "#090d16",
              fontSize: "14px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : isSignUp ? "Create Free Account" : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: "transparent",
              border: "none",
              color: "#38bdf8",
              fontSize: "12px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up with email"}
          </button>
        </div>
      </div>
    </div>
  );
};
