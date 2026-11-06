import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { FAQ_ITEMS } from "@/data/faq";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hacker-tube.net"),
  title: {
    default: "HackerTube — Hacker News Recommended Tech Talks & AI Videos",
    template: "%s | HackerTube",
  },
  description:
    "Explore HackerTube: the anti-algorithm video platform inspired by Andrej Karpathy. Discover high-signal tech talks, AI lectures, and engineering deep dives vetted across 20 years of Hacker News comments—zero clickbait, honest 50% runtime previews, and exportable AI study notes.",
  keywords: [
    "hackertube",
    "hacker tube",
    "HackerTube videos",
    "Hacker News videos",
    "HN recommended talks",
    "daily tech talks",
    "hacker tube karpathy",
    "anti algorithm video platform",
    "high signal tech talks",
    "AI lectures",
    "Andrej Karpathy HackerTube",
    "no clickbait youtube",
    "hackerbooks"
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
    title: "HackerTube — Hacker News Recommended Tech Talks & AI Videos",
    description:
      "Explore HackerTube: the anti-algorithm video platform inspired by Andrej Karpathy. Discover high-signal tech talks, AI lectures, and engineering deep dives vetted across 20 years of Hacker News comments—zero clickbait, honest 50% runtime previews, and exportable AI study notes.",
    url: "https://www.hacker-tube.net/",
    siteName: "HackerTube",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.hacker-tube.net/images/hero-showcase.jpg",
        width: 1200,
        height: 630,
        alt: "HackerTube Anti-Algorithm Video Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HackerTube — Hacker News Recommended Tech Talks & AI Videos",
    description:
      "Explore HackerTube: the anti-algorithm video platform inspired by Andrej Karpathy. High-signal technical talks vetted across 20 years of Hacker News.",
    images: ["https://www.hacker-tube.net/images/hero-showcase.jpg"],
  },
  alternates: {
    canonical: "https://www.hacker-tube.net/",
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
    url: "https://www.hacker-tube.net",
    description:
      "The anti-algorithm video platform inspired by Andrej Karpathy. Curating high-signal tech talks and AI lectures from Hacker News with honest previews.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.hacker-tube.net/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-33901F4SMS";

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
        {/* Umami Analytics (Self-hosted, Privacy-first, AdBlock Immune) */}
        <Script
          strategy="afterInteractive"
          src="https://umami-three-lac.vercel.app/script.js"
          data-website-id="1bf290ac-ebd2-4346-9b44-af0193597bf3"
        />

        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
