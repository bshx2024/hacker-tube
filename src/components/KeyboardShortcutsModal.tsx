"use client";

import React, { useEffect } from "react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>⌨️</span>
            <span>Keyboard Shortcuts</span>
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>
            Navigate HackerTube at terminal speed without reaching for your mouse.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-primary)", borderRadius: "8px" }}>
              <span style={{ fontSize: "14px" }}>Focus Search Input</span>
              <kbd className="shortcut-hint" style={{ fontSize: "13px" }}>/</kbd>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-primary)", borderRadius: "8px" }}>
              <span style={{ fontSize: "14px" }}>Next / Previous Video</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <kbd className="shortcut-hint" style={{ fontSize: "13px" }}>J</kbd>
                <kbd className="shortcut-hint" style={{ fontSize: "13px" }}>K</kbd>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-primary)", borderRadius: "8px" }}>
              <span style={{ fontSize: "14px" }}>Open / Play Selected Video</span>
              <kbd className="shortcut-hint" style={{ fontSize: "13px" }}>Enter</kbd>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-primary)", borderRadius: "8px" }}>
              <span style={{ fontSize: "14px" }}>Toggle Bookmark (Save)</span>
              <kbd className="shortcut-hint" style={{ fontSize: "13px" }}>B</kbd>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-primary)", borderRadius: "8px" }}>
              <span style={{ fontSize: "14px" }}>Close Modal / Player</span>
              <kbd className="shortcut-hint" style={{ fontSize: "13px" }}>Esc</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
