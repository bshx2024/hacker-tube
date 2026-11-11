"use client";

import React, { useState } from "react";
import { signIn, signUp } from "@/core/auth/client";

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
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : "GitHub sign-in failed. Please try again.";
      if (msg.includes("Provider not found") || msg.includes("PROVIDER_NOT_FOUND")) {
        msg = "GitHub OAuth is pending configuration in Vercel. Please use the Email tab below to sign up/sign in instantly (5 free credits included)!";
      }
      setErrorMsg(msg);
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
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : "Google sign-in failed. Please try again.";
      if (msg.includes("Provider not found") || msg.includes("PROVIDER_NOT_FOUND")) {
        msg = "Google OAuth is pending configuration in Vercel. Please use the Email tab below to sign up/sign in instantly!";
      }
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setErrorMsg("");

      const cleanEmail = email.trim().toLowerCase();

      if (isSignUp) {
        if (!password || password.length < 8) {
          setErrorMsg("Password must be at least 8 characters long.");
          setLoading(false);
          return;
        }

        const res = await signUp.email({
          email: cleanEmail,
          password,
          name: cleanEmail.split("@")[0],
          callbackURL: window.location.origin,
        });

        if (res?.error) {
          setErrorMsg(res.error.message || "Sign up failed. Please try a stronger password.");
          setLoading(false);
          return;
        }
      } else {
        const res = await signIn.email({
          email: cleanEmail,
          password: password || "GeekPass2026!",
          callbackURL: window.location.origin,
        });

        if (res?.error) {
          setErrorMsg(
            res.error.message ||
              "Invalid credentials. If this is your first time, please switch to 'Sign Up' tab to create your account!"
          );
          setLoading(false);
          return;
        }
      }

      onClose();
      if (onSuccess) onSuccess();
      // Reload to ensure all sessions and permissions sync immediately
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setErrorMsg(msg);
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
            <div>{errorMsg}</div>
            {!isSignUp && (
              <div style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMsg("");
                  }}
                  style={{
                    background: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid #10b981",
                    color: "#34d399",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  👉 Switch to &ldquo;Sign Up&rdquo; to create this account
                </button>
              </div>
            )}
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

        {/* Tab switch between Sign In and Sign Up */}
        <div
          style={{
            display: "flex",
            background: "#090d16",
            borderRadius: "8px",
            padding: "4px",
            marginBottom: "16px",
            border: "1px solid #1e293b",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg("");
            }}
            style={{
              flex: 1,
              padding: "8px 0",
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: !isSignUp ? "rgba(16, 185, 129, 0.2)" : "transparent",
              color: !isSignUp ? "#34d399" : "#94a3b8",
              transition: "all 0.2s",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg("");
            }}
            style={{
              flex: 1,
              padding: "8px 0",
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: isSignUp ? "rgba(16, 185, 129, 0.2)" : "transparent",
              color: isSignUp ? "#34d399" : "#94a3b8",
              transition: "all 0.2s",
            }}
          >
            Sign Up
          </button>
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
              {isSignUp ? "Password (at least 8 characters)" : "Password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? "Create a password (min 8 chars)" : "••••••••"}
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
