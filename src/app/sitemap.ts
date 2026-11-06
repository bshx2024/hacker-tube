import { MetadataRoute } from "next";
import { CURATED_VIDEOS } from "@/data/videos";
import { TOPIC_METADATA } from "@/data/topics";

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

  return routes;
}

