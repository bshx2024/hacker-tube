#!/usr/bin/env node

/**
 * HackerTube HN Synchronization Pipeline Engine
 * Continuously discovers, extracts, and validates high-signal YouTube talks
 * organically recommended across Hacker News discussions.
 *
 * Usage:
 *   npm run sync:hn
 *   node scripts/sync_hn_videos.mjs [--limit 50] [--min-points 10]
 */

import fs from "fs";
import path from "path";

const HN_ALGOLIA_API = "https://hn.algolia.com/api/v1";

// Regex to extract exactly 11-char YouTube Video ID
const YT_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^a-zA-Z0-9_-]|$)/gi;

// High-Signal Keyword Heuristics (Computer Science, Math, Systems, AI)
const HIGH_SIGNAL_KEYWORDS = [
  "lecture", "talk", "tutorial", "paper", "architecture", "compiler",
  "karpathy", "algorithm", "database", "distributed", "concurrency",
  "neural", "transformer", "carmack", "hickey", "bret victor",
  "knuth", "dijkstra", "performance", "systems", "kernel", "graphics"
];

// Anti-Slop Blacklist Keywords
const SLOP_KEYWORDS = [
  "music video", "official music", "vevo", "trailer", "reaction", "prank",
  "passive income", "get rich", "dropshipping", "tiktok compilation"
];

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchHnComments(query, hitsPerPage = 40) {
  try {
    const url = `${HN_ALGOLIA_API}/search?query=${encodeURIComponent(query)}&tags=comment&hitsPerPage=${hitsPerPage}`;
    const res = await fetch(url, { headers: { "User-Agent": "HackerTube-Sync/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.hits || [];
  } catch (err) {
    console.warn(`⚠️ Warning fetching HN query "${query}":`, err.message);
    return [];
  }
}

async function main() {
  console.log("⚡ Starting HackerTube Hacker News Video Synchronization...");

  // 1. Read existing video IDs from src/data/videos.ts
  const videosPath = path.join(process.cwd(), "src", "data", "videos.ts");
  let existingYtIds = new Set();

  if (fs.existsSync(videosPath)) {
    const content = fs.readFileSync(videosPath, "utf-8");
    const matches = content.matchAll(/youtubeId:\s*["']([^"']+)["']/g);
    for (const m of matches) {
      existingYtIds.add(m[1]);
    }
    console.log(`✓ Loaded ${existingYtIds.size} already curated YouTube talks.`);
  }

  // 2. Query Algolia HN search for recent & top YouTube recommendations
  console.log("🔍 Querying Hacker News discussions for high-signal video links...");
  const [hits1, hits2] = await Promise.all([
    fetchHnComments("youtube.com/watch", 50),
    fetchHnComments("youtu.be", 50),
  ]);

  const allHits = [...hits1, ...hits2];
  console.log(`✓ Retrieved ${allHits.length} HN comment candidates.`);

  const candidatesMap = new Map();

  for (const hit of allHits) {
    const commentHtml = hit.comment_text || "";
    const cleanText = stripHtml(commentHtml);

    // Extract all YouTube IDs in the comment
    const ytMatches = [...commentHtml.matchAll(YT_REGEX)];
    if (!ytMatches || ytMatches.length === 0) continue;

    for (const match of ytMatches) {
      const ytId = match[1];

      // Skip already curated
      if (existingYtIds.has(ytId)) continue;

      // Anti-slop keyword test
      const lowerText = cleanText.toLowerCase();
      const hasSlop = SLOP_KEYWORDS.some((kw) => lowerText.includes(kw));
      if (hasSlop) continue;

      // Score relevance
      let score = (hit.points || 1) + cleanText.length * 0.05;
      const matchedSignalKw = HIGH_SIGNAL_KEYWORDS.filter((kw) => lowerText.includes(kw));
      score += matchedSignalKw.length * 15;

      const storyId = hit.story_id;
      const commentId = hit.objectID;
      const hnUrl = `https://news.ycombinator.com/item?id=${commentId || storyId}`;

      if (!candidatesMap.has(ytId)) {
        candidatesMap.set(ytId, {
          youtubeId: ytId,
          midframeThumb: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
          hnAuthor: hit.author || "hn_user",
          hnYear: hit.created_at ? new Date(hit.created_at).getFullYear() : 2026,
          hnStoryTitle: hit.story_title || "Hacker News Discussion",
          hnUrl,
          excerpt: cleanText.slice(0, 240) + (cleanText.length > 240 ? "..." : ""),
          matchedKeywords: matchedSignalKw,
          frequency: 1,
          score: Math.round(score),
        });
      } else {
        const item = candidatesMap.get(ytId);
        item.frequency += 1;
        item.score += 20;
      }
    }
  }

  // 3. Sort candidates by score
  const sortedCandidates = Array.from(candidatesMap.values()).sort((a, b) => b.score - a.score);

  console.log(`\n========================================`);
  console.log(`🎯 Hacker News Sync Results: Found ${sortedCandidates.length} New Candidate Talks`);
  console.log(`========================================\n`);

  sortedCandidates.slice(0, 8).forEach((c, idx) => {
    console.log(`[#${idx + 1}] YouTube ID: ${c.youtubeId} (Score: ${c.score}, HN Mentions: ${c.frequency})`);
    console.log(`     Thumbnail (50%): ${c.midframeThumb}`);
    console.log(`     HN Thread: ${c.hnUrl}`);
    console.log(`     Comment by @${c.hnAuthor} (${c.hnYear}): "${c.excerpt}"`);
    console.log(`     Signals: ${c.matchedKeywords.join(", ") || "Technical Discussion"}\n`);
  });

  // 4. Save structured report
  const reportPath = path.join(process.cwd(), "reports", "hn_sync_candidates.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        lastSyncedAt: new Date().toISOString(),
        totalCandidates: sortedCandidates.length,
        candidates: sortedCandidates,
      },
      null,
      2
    )
  );

  console.log(`✓ Full candidate dataset saved to: ${reportPath}`);
  console.log(`💡 Next step: Review top candidates and add them to src/data/videos.ts to expand the library.`);
}

main().catch((err) => {
  console.error("❌ HN Sync pipeline error:", err);
  process.exit(1);
});
