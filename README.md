# HackerTube ⚡

> **The Anti-Algorithm, Human-Curated Video Platform for Engineers & Hackers**  
> *Inspired by Andrej Karpathy's weekend experiment ([hackertube.org](https://hackertube.org))*

---

## 📖 Overview

Mainstream video platforms optimize purely for engagement, watch time, and clickbait dopamine loops. **HackerTube** is a clean, alternative video platform built on **human curation**:

- **Curated from 20 Years of Hacker News (2007–2026)**: Indexes high-signal tech talks, computer science lectures, and deep dives organically recommended and debated by real software engineers.
- **50% Mid-frame Thumbnails**: Replaces sensationalized open-mouth creator thumbnails with honest, neutral snapshots taken from the middle (50% timestamp) of each video.
- **Zero Tracking, Zero Ads**: Pure privacy-first architecture with local session state (`localStorage`). No user accounts or cookies required.
- **AI Key Takeaways**: High-density 3-bullet technical summaries for every talk to maximize learning efficiency.
- **GEO & LLM-Friendly**: Built with `/llms.txt`, full Schema.org structured data, and an open JSON dataset API at `/api/dataset`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router, SSG & SSR)
- **Styling**: Pure Vanilla CSS with tailored dark mode and cyber-editorial aesthetics
- **Streaming**: Official YouTube IFrame Player API (Strictly compliant with YouTube API Developer Policies)
- **Open Data**: Static JSON metadata and RESTful export endpoint

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/bshx2024/hacker-tube.git
cd hacker-tube
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```

---

## 📦 Open Dataset

HackerTube provides an open, agent-ready JSON export of its curated catalog:

- **Local Endpoint**: `http://localhost:3000/api/dataset`
- **LLM Manifest**: `http://localhost:3000/llms.txt`

---

## ⌨️ Keyboard Shortcuts

- `/` : Focus live search
- `J` / `K` : Navigate down/up through talks
- `Enter` : Play selected talk in modal
- `B` : Toggle bookmark (Watch Later)
- `Esc` : Close player modal

---

## 📄 License & Attribution

- Built with respect for human attention and craftsmanship.
- Concept originally initiated by **Andrej Karpathy** ([karpathy.bearblog.dev](https://karpathy.bearblog.dev/hacker-tube/)).
- All video streams are served via official YouTube embeds. Video copyrights belong to their respective creators and channels.
