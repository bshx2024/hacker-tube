# 🚀 HackerTube 社区发布与海外增长物料包 (Show HN & X Launch Kit)

本文档包含了针对海外极客社群（Hacker News、Twitter/X、Reddit、Product Hunt）的完整发布方案与文案模板，完全对齐硅谷开源社区文化，杜绝营销套话，以真诚、克制、硬核的工程师口吻呈现。

---

## 📌 1. Hacker News 发布主帖 (Show HN)

> **发布板块**：`https://news.ycombinator.com/submit`  
> **推荐发布时间**：美东时间周二或周三上午 09:00~10:00 EST (北京时间 22:00~23:00)，此时欧美工程师正开启工作早高峰。

### Title (标有 80 字符限制):
```
Show HN: HackerTube – Anti-algorithm video web app inspired by Karpathy
```

### URL:
```
https://www.hacker-tube.net
```

### Text / First Comment (真实、谦逊、极客共鸣):
```markdown
Hi HN,

A few days ago, Andrej Karpathy posted a thought-provoking idea on his blog [0] advocating for a "HackerTube": a YouTube front-end strictly curated from 20 years of Hacker News comments, bypassing the engagement-optimized algorithmic slop, red-circle clickbait, and retention hacks that have ruined modern video discovery.

Karpathy noted that while he had the initial data-extraction prototype, someone should turn this into a real, polished web tool for the community. So we built HackerTube (https://www.hacker-tube.net).

Key architectural and curation design choices:

1. 50% Mid-Frame Rule: We never render the creator's uploaded thumbnail. Instead, we pull a snapshot from exactly 50% through the timeline. What you see is the honest whiteboard, terminal, or slide deck—not a thumbnail designer's hype.

2. Community Consensus Verification: Every talk is indexed with its historical HN endorsement quote, points, and discussion link.

3. AI Study Companion & Derivations: For top long-form lectures (e.g., Karpathy's "Building GPT", Casey Muratori's "Clean Code", Bret Victor's "Inventing on Principle"), we've compiled slide indexes, LaTeX mathematical derivations, and 3-minute mental models—all exportable to Obsidian (.md) or Notion with zero telemetry.

4. Keyboard-First UX: Full Vim/HN navigation. Press `/` to search, `J`/`K` to step through talks, `Enter` to open, `B` to bookmark locally.

5. Open Data & API: You can curl the clean JSON dataset directly at `https://www.hacker-tube.net/api/dataset` or inspect our crawler rules at `/llms.txt`.

Code & issue tracker: https://github.com/bshx2024/hacker-tube

We'd love HN's feedback on lecture taxonomy and candidate talks we should index next. You can also suggest talks directly on the site via the "＋ Suggest Talk" button.

[0] https://karpathy.bearblog.dev/hacker-tube/
```

---

## 📌 2. Twitter / X 官方推文与 @Andrej Karpathy 互动模板

> **发布账号**：项目官方推特或个人开发者推特  
> **互动对象**：引用或回复 Karpathy 的原始推文，或单独发推并 @karpathy

### 主推文 (Main Tweet):
```
Inspired by @karpathy's "HackerTube" concept, we turned it into a full, live web app: https://www.hacker-tube.net

⚡ Stop Watching Slop:
• 20 years of Hacker News community-voted lectures
• The 50% mid-frame preview rule (zero clickbait)
• AI Study Companion with LaTeX derivations & 1-click Obsidian export
• Vim keybindings (J/K/Enter)

100% open dataset: /api/dataset
GitHub: https://github.com/bshx2024/hacker-tube

Drop your favorite timeless lectures in the thread! 👇
```

### 跟评 1 (Obsidian 导出与功能细节):
```
For deep learners: each talk includes keyframe timestamps, mathematical proofs (scaled dot-product attention, IEEE 754 bit-hack derivations), and HN peer reviews. 

Click "Obsidian (.md)" to drag clean structured notes directly into your local second brain vault.
```

### 跟评 2 (开源与社区提报):
```
We also built an automated pipeline (`npm run sync:hn`) syncing new high-scoring talks from HN Algolia, plus a community submission modal on the site.

Check it out and let us know what you think! 🚀
```

---

## 📌 3. Reddit 相关板块发布指南

> **目标 Subreddit**：
> - `r/programming` (严格技术探讨，重点讲架构与反垃圾信息流机制)
> - `r/MachineLearning` (重点推荐 Karpathy、3Blue1Brown 等 AI/ML 深度导读笔记)
> - `r/webdev` (重点讨论 Next.js 16 静态生成、PWA 及 Vim 键盘控制实现)

### Post Title for r/programming:
```
I built HackerTube: An anti-algorithm video directory with honest 50% previews and Obsidian export (inspired by Karpathy)
```

---

## 📌 4. 社区提报处理标准（PR / Issue Review Checklist）

当社区极客通过网页提报或 GitHub Issue 提交新视频时，核查清单如下：
- [ ] 该视频在 Hacker News 上是否具有 **大于 20 points** 的正面推荐讨论？
- [ ] 视频在 50% 进度处是否有清晰的代码、幻灯片或演讲现场？
- [ ] 是否排除了任何营销号、引战、纯商业宣传内容？
- [ ] 是否配置了 3 句式 AI 核心技术要点（Key Takeaways）？
