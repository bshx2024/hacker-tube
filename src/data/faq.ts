export interface FAQItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    q: "What is HackerTube and why was it created?",
    a: "HackerTube is an anti-algorithm, human-curated video discovery directory created in response to mainstream YouTube's algorithmic 'enshittified wall of slop'. Instead of optimizing for watch time or clickbait engagement, HackerTube populates its feed exclusively with talks, lectures, and documentaries recommended by software engineers across 20 years of Hacker News comments (2007–2026)."
  },
  {
    q: "What is Andrej Karpathy's role in HackerTube?",
    a: "Andrej Karpathy (former OpenAI co-founder and Tesla AI Director) originated the concept in late October 2026. Frustrated by sensationalized YouTube feeds on a Friday night, he directed Claude Code to parse millions of Hacker News comments and spin up hackertube.org in roughly two hours, sparking a global wave of community-curated frontends."
  },
  {
    q: "Why does HackerTube use 50% mid-frame thumbnails?",
    a: "Mainstream YouTube creators are pressured by recommendation algorithms to upload exaggerated reaction faces, screaming red arrows, and clickbait graphics. HackerTube bypasses this by capturing a neutral, honest snapshot directly from the exact middle (50% mark) of the video, showing you what the lecture actually looks like."
  },
  {
    q: "Is there an Apple TV app or mobile client?",
    a: "Yes! Developer @jnaina released 'HackerTube for Apple TV' (hackertube-tvos on GitHub), allowing users to browse curated feeds on their TV while leveraging the native YouTube app for seamless streaming. HackerTube is also a responsive Progressive Web App (PWA) on mobile."
  },
  {
    q: "Can I download the dataset for AI agents or my own projects?",
    a: "Yes. In keeping with the open-source spirit, the complete structured dataset is available via our public JSON API at /api/dataset, complete with video IDs, categories, Hacker News citation excerpts, and AI key takeaways."
  },
  {
    q: "How does HackerTube protect user privacy?",
    a: "HackerTube requires zero logins or accounts. No tracking cookies or analytics telemetry are stored on our servers. Your watch history, bookmarks, and preferences stay 100% client-side inside your browser's localStorage."
  }
];
