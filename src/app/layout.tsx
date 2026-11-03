import type { Metadata } from "next";
import "./globals.css";
import { FAQ_ITEMS } from "@/data/faq";

export const metadata: Metadata = {
  title: "HackerTube – Human-Curated Tech Videos, No Slop & No Clickbait",
  description:
    "Tired of YouTube's algorithm and clickbait slop? HackerTube curates the highest-signal tech talks, AI lectures, and deep dives organically recommended by Hacker News engineers. Clean mid-frame thumbnails, zero tracking, open-source on GitHub.",
  keywords: [
    "hackertube",
    "hacker tube",
    "hacker tube karpathy",
    "anti algorithm video platform",
    "hacker news videos",
    "tech talks",
    "curated lectures",
    "no clickbait youtube",
    "hackerbooks",
    "hacker tube github",
    "hacker tube app"
  ],
  authors: [{ name: "HackerTube Community" }],
  creator: "Andrej Karpathy Community Concept",
  publisher: "HackerTube",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "HackerTube – Human-Curated Tech Videos, No Slop & No Clickbait",
    description:
      "The anti-algorithm video platform. Hand-curated talks from 20 years of Hacker News comments with neutral 50% mid-frame thumbnails and zero tracking.",
    url: "https://hackertube.org",
    siteName: "HackerTube",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HackerTube – Human-Curated Tech Videos, No Slop & No Clickbait",
    description:
      "Tired of algorithmic slop on YouTube? Watch high-signal tech talks recommended by Hacker News engineers.",
  },
  alternates: {
    canonical: "https://hackertube.org",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Construct JSON-LD Schemas for GEO and Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HackerTube",
    url: "https://hackertube.org",
    description:
      "The anti-algorithm video platform curating technical and scientific videos recommended across Hacker News comments.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://hackertube.org/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
