import { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db, schema } from "@/core/db";
import { CURATED_VIDEOS } from "@/data/videos";
import { TOPIC_METADATA } from "@/data/topics";

const KEYWORD_ALIASES = [
  "fast-inverse-square-root",
  "simple-made-easy",
  "essence-of-calculus-chapter-1",
  "zero-knowledge-proofs",
  "inventing-on-principle",
  "deep-unsupervised-learning",
  "world-models-jepa",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.hacker-tube.net";
  const now = new Date();

  // 1. Root & Core Static Pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 2. Programmatic Topic Category Pages
  TOPIC_METADATA.forEach((topic) => {
    routes.push({
      url: `${baseUrl}/topic/${topic.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    });
  });

  // 3. Programmatic Video Deep-Dive Knowledge Pages
  CURATED_VIDEOS.forEach((video) => {
    routes.push({
      url: `${baseUrl}/v/${video.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  });

  // 4. Keyword-Rich Deep-Dive Study Guides (Alias routes for high-intent queries)
  KEYWORD_ALIASES.forEach((alias) => {
    routes.push({
      url: `${baseUrl}/v/${alias}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.88,
    });
  });

  // 5. Dynamic Community Generated High-Signal Notes (Anti-Thin: Published only)
  try {
    const publishedNotes = await db
      .select({
        youtubeId: schema.generatedNote.youtubeId,
        updatedAt: schema.generatedNote.updatedAt,
      })
      .from(schema.generatedNote)
      .where(eq(schema.generatedNote.status, "published"))
      .limit(500);

    publishedNotes.forEach((item) => {
      routes.push({
        url: `${baseUrl}/v/yt-${item.youtubeId}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.85,
      });
    });
  } catch {
    // Database query fallback
  }

  return routes;
}

