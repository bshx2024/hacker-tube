"use client";

import React, { useState } from "react";
import { VideoItem } from "@/data/videos";
import { StudyNote } from "@/data/studyNotes";
import { ShareModal } from "@/components/ShareModal";
import { trackExportNotes, trackShare } from "@/lib/tracker";

interface VideoDetailActionsProps {
  video: VideoItem;
  studyNote: StudyNote;
}

export const VideoDetailActions: React.FC<VideoDetailActionsProps> = ({
  video,
  studyNote,
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const generateMarkdown = () => {
    return `${studyNote.obsidianFrontmatter}

# ${video.title}

> **Speaker**: ${video.channelTitle} (${video.publishedYear}) | **Duration**: ${video.duration} | **Topic**: ${video.topic}
> **Hacker News Thread**: [${video.hnMentions} points by @${video.hnAuthor}](${video.hnDiscussionUrl})
> **Stream & AI Notes**: [HackerTube](https://www.hacker-tube.net/?v=${video.id}&ref=obsidian_notes) • [Original YouTube](https://youtu.be/${video.youtubeId})
> **Inference Infrastructure**: [APIVALE Cloud](https://apivale.com/?utm_source=hackertube&utm_medium=referral&utm_campaign=obsidian_notes) (High-Throughput Model Gateway for Engineers)

---

## ⚡ Executive Summary (TL;DR)
${studyNote.executiveSummary}

### Core Mental Models
${studyNote.coreMentalModels.map((m) => `- ${m}`).join("\n")}

---

## ⏱️ Key Timestamps & Slide Index
${studyNote.keyTimestamps
  .map(
    (t) =>
      `### [${t.time}](https://youtu.be/${video.youtubeId}?t=${t.seconds}) ${t.title}\n- **Slide / Whiteboard**: ${t.slideConcept}\n- **Key Takeaway**: ${t.keyTakeaway}`
  )
  .join("\n\n")}

---

## 📐 Mathematical Derivations & Code Insights
${studyNote.mathDerivations
  .map(
    (m) =>
      `### ${m.title}\n$$\n${m.formula}\n$$\n${m.explanation}${
        m.codeSnippet ? `\n\n\`\`\`python\n${m.codeSnippet}\n\`\`\`` : ""
      }`
  )
  .join("\n\n")}

---

## 💬 Hacker News Community Review & Critical Debates
${studyNote.hnDebates
  .map(
    (d) =>
      `### ${d.topic}\n- **Consensus**: ${d.consensus}\n- **Counter-Argument & Caveats**: ${d.counterArgument}\n\n> "${d.topCommentQuote}"\n> — @${d.author}`
  )
  .join("\n\n")}
`;
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdown());
      trackExportNotes(video.id, "markdown");
      showToast("✓ Copied markdown study notes with Obsidian frontmatter!");
    } catch {
      showToast("⚠️ Could not access clipboard.");
    }
  };

  const handleExportObsidian = () => {
    try {
      const content = generateMarkdown();
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HackerTube-${video.id}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      trackExportNotes(video.id, "obsidian");
      showToast("✓ Downloaded Obsidian Markdown file!");
    } catch {
      showToast("⚠️ Failed to download file.");
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <button
          className="nav-btn nav-btn-primary"
          onClick={handleCopyMarkdown}
          style={{ padding: "8px 14px", fontSize: "13px" }}
          title="Copy structured Markdown to clipboard"
        >
          <span>📋</span>
          <span>Copy Study Notes</span>
        </button>

        <button
          className="nav-btn"
          onClick={handleExportObsidian}
          style={{ padding: "8px 14px", fontSize: "13px" }}
          title="Download formatted .md for your Obsidian vault"
        >
          <span>📓</span>
          <span>Download Obsidian .md</span>
        </button>

        <button
          className="nav-btn"
          onClick={() => {
            trackShare(video.id, "copy_link");
            setIsShareOpen(true);
          }}
          style={{
            padding: "8px 14px",
            fontSize: "13px",
            borderColor: "rgba(56, 189, 248, 0.4)",
            color: "#38bdf8",
          }}
          title="Share talk with deep link, 𝕏 post, Reddit or Markdown embed"
        >
          <span>↗</span>
          <span>Share Talk</span>
        </button>

        <a
          href={video.hnDiscussionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-btn"
          style={{ padding: "8px 14px", fontSize: "13px" }}
          title="View original Hacker News thread"
        >
          <span>💬</span>
          <span>HN Discussion ({video.hnMentions} pts) ↗</span>
        </a>
      </div>

      {toastMsg && (
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid var(--accent-emerald)",
            color: "#6ee7b7",
            borderRadius: "var(--radius-md)",
            fontSize: "13.5px",
            marginBottom: "16px",
          }}
        >
          {toastMsg}
        </div>
      )}

      <ShareModal
        isOpen={isShareOpen}
        video={video}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
};

