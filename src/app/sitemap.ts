import { MetadataRoute } from "next";
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

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.hacker-tube.net";
  const now = new Date();

  // 1. Root Homepage
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
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

  return routes;
}

