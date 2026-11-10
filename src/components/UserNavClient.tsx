"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "@/core/auth/client";
import { AuthModal } from "./AuthModal";

export const UserNavClient: React.FC = () => {
  const { data: session, isPending } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync local bookmarks on login & fetch pro status
  useEffect(() => {
    if (!session?.user?.id) return;

    // Check pro status
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.plan === "pro") {
          setIsPro(true);
        }
      })
      .catch(() => {});

    // Auto-sync localStorage bookmarks
    try {
      const local = localStorage.getItem("ht_saved_vids");
      if (local) {
        const vids = JSON.parse(local);
        if (Array.isArray(vids) && vids.length > 0) {
          fetch("/api/user/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoIds: vids }),
          }).catch(() => {});
        }
      }
    } catch {}
  }, [session?.user?.id]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "pro_monthly", provider: "stripe" }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Unable to start checkout session.");
      }
    } catch (err: any) {
      alert("Checkout error: " + err.message);
    } finally {
      setUpgrading(false);
    }
  };

  if (isPending) {
    return (
      <div
        style={{
          width: "80px",
          height: "34px",
          borderRadius: "6px",
          background: "rgba(255, 255, 255, 0.05)",
          animation: "pulse 1.5s infinite",
        }}
      />
    );
  }

  if (!session?.user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="nav-btn"
          id="btn-sign-in"
          style={{
            background: "rgba(56, 189, 248, 0.08)",
            borderColor: "rgba(56, 189, 248, 0.35)",
            color: "#38bdf8",
            fontWeight: 600,
          }}
        >
          <span>⚡</span>
          <span>Sign In</span>
        </button>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  const user = session.user;
  const displayName = user.name || user.email?.split("@")[0] || "Geek";

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="nav-btn"
        id="btn-user-profile"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255, 255, 255, 0.06)",
          borderColor: isPro ? "rgba(168, 85, 247, 0.5)" : "rgba(255, 255, 255, 0.15)",
        }}
      >
        {user.image ? (
          <img
            src={user.image}
            alt={displayName}
            style={{ width: "20px", height: "20px", borderRadius: "50%" }}
          />
        ) : (
          <span style={{ fontSize: "14px" }}>👨‍💻</span>
        )}
        <span style={{ maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayName}
        </span>
        {isPro && (
          <span
            style={{
              fontSize: "10px",
              padding: "2px 5px",
              background: "rgba(168, 85, 247, 0.25)",
              color: "#c084fc",
              borderRadius: "4px",
              fontWeight: 700,
            }}
          >
            PRO
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "220px",
            background: "#0d131f",
            border: "1px solid #1f293d",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            padding: "8px 0",
            zIndex: 1000,
          }}
        >
          <div style={{ padding: "8px 16px", borderBottom: "1px solid #1e293b" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>{displayName}</div>
            <div style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email}
            </div>
            <div style={{ marginTop: "6px", fontSize: "11px", color: isPro ? "#c084fc" : "#10b981", fontWeight: 600 }}>
              {isPro ? "✨ HackerTube Pro (Active)" : "🌱 Free Account"}
            </div>
          </div>

          <div style={{ padding: "6px 8px" }}>
            {!isPro && (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  background: "linear-gradient(90deg, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2))",
                  border: "1px solid rgba(168, 85, 247, 0.4)",
                  borderRadius: "6px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: upgrading ? "not-allowed" : "pointer",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>⚡ Upgrade Pro</span>
                <span style={{ fontSize: "11px", color: "#c084fc" }}>$4/mo</span>
              </button>
            )}

            <button
              onClick={() => {
                setDropdownOpen(false);
                signOut();
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background: "transparent",
                border: "none",
                borderRadius: "6px",
                color: "#94a3b8",
                fontSize: "12px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
