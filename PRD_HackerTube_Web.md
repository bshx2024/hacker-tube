# HackerTube Web 产品需求文档 (PRD)

**版本号**：v1.0.0  
**状态**：已定稿 (Ready for Development)  
**项目代号**：HackerTube (反算法·极客高信噪比视频知识聚合站)  
**文件路径**：`e:/SaaS-Tool/hacker-tube/PRD_HackerTube_Web.md`

---

## 1. 项目背景与产品定位 (Background & Value Proposition)

### 1.1 核心痛点与行业背景
主流视频平台（以 YouTube 为代表）的推荐机制完全以“完播率、点击率（CTR）和用户停留时长”为导向，导致算法不断向用户投喂迎合人性弱点的“成瘾性电子垃圾（Enshittified Slop）”、夸张引战封面（Clickbait Thumbnails）以及同质化内容。严肃技术工程师、科研人员及深度学习者面临严重的**信息茧房与高时间搜寻成本**。

### 1.2 灵感来源与核心机制
本项目灵感直接源自 AI 著名学者 **Andrej Karpathy** 于 2026 年 10 月底发起的高口碑概念项目：
- 摒弃算法推荐，回归 **“Web 1.0 的纯粹性与人类社群精选（Human-Curated）”**。
- 从 **Hacker News (HN)** 历年（2007–2026年）约 4300 万条历史技术讨论中，深度提取出数千个被真实极客反复推荐验证的高价值硬核视频。
- **反标题党机制**：强制截取视频 **50% 进度处的一帧作为预览封面**，彻底剔除夸张封面。

### 1.3 产品定位与使命
**“程序员与极客的纯净知识视频聚合站 + AI 效率助手”**。  
用最现代、干净的极客界面，为全球开发者提供高信噪比技术演讲、学术报告、算法推演与纪录片，拒绝算法洗脑与注意力剥削。

---

## 2. SEO & GEO（大模型优化）战略规范

为了在传统搜索引擎（Google）和生成式大模型搜索引擎（SearchGPT, Perplexity, Claude, Google AI Overviews）中均获得高排名和高频引用，全站严格遵循以下规范：

### 2.1 页面 TDK 与文案标准

#### 首页 Title
```html
<title>HackerTube — Hacker News Recommended Tech Talks &amp; AI Videos</title>
```

#### 首页 Meta Description
```html
<meta name="description" content="Explore HackerTube: the anti-algorithm video platform inspired by Andrej Karpathy. Discover high-signal tech talks, AI lectures, and engineering deep dives vetted across 20 years of Hacker News comments—zero clickbait, honest 50% runtime previews, and exportable AI study notes." />
```

#### 关键词矩阵 (Keywords Matrix)
- **核心主词**：`hackertube`, `hacker tube`, `HackerTube videos`, `Hacker News videos`, `HN recommended talks`, `daily tech talks`
- **长尾与意图承接词**：`hacker tube karpathy`, `anti algorithm video platform`, `high signal tech talks`, `AI lectures`, `no clickbait youtube`, `hackerbooks`
- **严防负向干扰词**：**全站绝对禁止出现** `hacker typer`, `devices hackers use`, `hacker rules` 等容易导致搜索引擎词义混淆的无关词。

### 2.2 GEO（大模型友好度）专项实现

1. **部署 `/llms.txt` 标准文件**：
   - 遵循最新的 `llms.txt` 规范，在根目录提供机器友好型 Markdown 摘要，供 Perplexity、Claude、ChatGPT 爬虫瞬间理解 HackerTube 的产品定位、数据源（Hacker News）、核心特点及技术分类。

### 2.3 程序化 SEO 矩阵与静态站点地图 (Programmatic SEO & XML Sitemap)
- **动态 XML 站点地图 (`src/app/sitemap.ts`)**：
  - 自动遍历全站根页面、所有主题分类路由及全部独立演讲深读页面，按权重配置 `priority` 与 `changeFrequency`；
  - 彻底规避爬虫访问 `sitemap.xml` 发生 404 错误。
- **分类独立路由 (`/topic/[slug]`)**：
  - 预渲染 6 大细分领域的独立静态落地页（AI、系统架构、数学科学、计算历史、工程文化、安全黑客），具备独立 TDK、BreadcrumbList 与 ItemList 结构化数据。
- **独立演讲知识详情页 (`/v/[id]`)**：
  - 针对每个技术演讲提供独立 SSG 静态落地页，SSR 直出包含 LaTeX 数学公式、50% 中帧截图、核心推导、HN 讨论争议、VideoObject 与 TechArticle 结构化数据的完整语义 HTML，让搜索引擎爬虫与大模型 RAG 引擎能 100% 索引每篇技术笔记。
   - 在站点根目录提供标准的 Markdown 格式概览，简述网站数据来源、分类体系、API 及开源数据集位置。
2. **`robots.txt` 放行 AI 爬虫**：
   - 显式声明允许 `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended` 无障碍爬取全站 HTML。
3. **结构化数据 (JSON-LD)**：
   - **`FAQPage` Schema**：嵌入针对核心痛点的问题（如 *What is HackerTube?*, *Who created it?*, *How are videos curated?*）。
   - **`ItemList` & `VideoObject` Schema**：完整标记每个收录视频的元数据与来源社区出处。
4. **提升信息增益 (Information Gain)**：
   - 拒绝仅放置空 iframe。每个视频卡片必须挂载：
     - **HN 原帖真实引言（Quote Anchor）**；
     - **AI 生成的 3 句式核心摘要（Key Takeaways）**。
5. **权威实体交叉验证**：
   - 在 About 页面完整锚定并外部链接至 Karpathy 原始博文、Hacker News 数据集源及 GitHub 仓库。

---

## 3. 信息架构与页面功能设计 (Information Architecture)

```
HackerTube 站点结构
├── 首页 (Home / Feed)
│   ├── 顶部导航 (Nav): Logo, 主题切换(Light/Dark), 搜索框, GitHub/App 入口
│   ├── Hero 痛点区域: "Stop Watching Slop", 价值主张, 核心 CTA
│   ├── 主题/时长过滤栏: All, AI/ML, Systems, Math, Founders | 时长: <15m, 15-45m, >45m
│   └── 视频网格 (Video Grid): 50% 真实中帧缩略图、HN 推荐次数徽标、即时悬浮预览
│
├── 视频详情/独立播放页 (Video Detail Modal / Page)
│   ├── YouTube 官方嵌入播放器 (响应式，合规调用)
│   ├── 视频元数据与讲者信息
│   ├── AI 智能速读区: 1分钟核心速览 (Key Takeaways) + 关键技术要点
│   └── Hacker News 推荐溯源卡片: 显示当年 HN 评论者原话、讨论帖跳转外链
│
├── 专题聚合页 (Collections - 专攻长尾与 GEO)
│   ├── /collection/best-ai-deep-dives
│   ├── /collection/retro-computing-gems
│   └── /collection/top-founder-talks
│
└── 底部与数据开放区 (Footer & Open Data)
    ├── 数据集直接下载入口 (dataset.json)
    ├── 客户端指南: Apple TV / PWA 离线安装
    ├── 姐妹项目联动: HackerBooks, Wikihack
    └── 免责声明与 YouTube API 服务条款致谢
```

### 3.1 核心页面交互细节

#### (1) Hero 区域
- **Hero Pill 徽章**：`⚡ Inspired by Andrej Karpathy • 20 Years of Hacker News Consensus`
- **大标题 (H1)**：`HackerTube: Stop Watching Slop.`
- **副标题**：*HackerTube is the anti-algorithm video web app inspired by Andrej Karpathy. Every lecture was organically recommended across 20 years of Hacker News—with zero clickbait, 50% runtime previews, and exportable AI study notes.*
- **主 CTA 按钮组**（聚焦站内探索与交互，避免过早跳出）：
  - `[ ▶ Explore All Curated Talks ({total}) ]`（平滑滚动至视频列表）
  - `[ 🧠 AI Study Companion & Derivations ]`（呼出精选演讲 AI 导读）
- **次级生态与概念外链行**（轻量居中外链，不抢主操作视觉焦点）：
  - `💡 Andrej Karpathy's Blog Post ↗`
  - `📺 Apple TV Client (tvOS) ↗`
  - `⭐ Open Source on GitHub ↗`
- **Library 区域大标题 (H2)**：`HackerTube Curated Archive: High-Signal Talks & AI Study Notes`

#### (2) 活跃停留与真实时长心跳监测 (Engagement Heartbeat Telemetry)
- **解决痛点**：用户点击嵌入式 YouTube 播放器或阅读 AI 笔记时，浏览器焦点离开主窗口导致 GA4 将停留时长误判为 15~17 秒。
- **机制**：
  - 在 `VideoModal` 开启状态下，每 20 秒发送一次活跃心跳（带视频 ID 与激活 Tab）；
  - 在首页阅读状态下，每 30 秒发送一次前台心跳；
  - 双通道分发：向第一方 `/api/track` 上报同时，向 GA4 派发 `user_engagement` 事件（携带 `engagement_time_msec`），修正停留时间统计。

#### (3) 极客开发者生态与算力基础设施伙伴 (APIVALE Cloud Integration)
- **定位**：零反感、原生高信噪比的技术算力支持，面向全球开发者提供中国主流前沿大模型（DeepSeek、通义千问 Qwen、智谱 GLM、月之暗面 Kimi、字节豆包 Doubao）的高吞吐统一网关支持，顺承用户学完算法硬核视频后的模型调用实操需求。
- **植入触点与链路**：
  - **AI 导读顶部算力徽章**：`⚡ Inference Infrastructure: AI structured derivations computed via APIVALE.com`，附带 `Free Playground & Key ↗`；
  - **Obsidian / Notion 导出笔记**：自动将 `Inference Infrastructure: APIVALE Cloud` 永久存入开发者本地知识库；
  - **Footer 生态外链**：收录 `APIVALE Cloud (LLM Gateway) ↗`，双向传递技术站权重；
  - **多层归因闭环**：携带专用落地路径与追踪参数 `https://apivale.com/hackertube?utm_source=hackertube&utm_medium=referral&utm_campaign=ai_study_notes&utm_content=inference_badge`，确保 APIVALE 的 GA4、前端会话与专属 Landing Page 100% 精确捕获来自 HackerTube 的极客流量。

#### (4) 极客裂变分享与直达深度链接 (Viral Deep-Linking & Geek Outflow System)
- **定位**：基于“极客社交货币”（反算法劣质内容、高信噪比技术硬核）与“工程工作流效用”，实现自然的口碑裂变自增长。
- **直达深度链接机制 (URL Query Deep-Linking)**：
  - 支持 `?v=${videoId}`（以及 `&tab=study` 与 `&ref=${channel}`），访客访问链接可直接呼起对应演讲视频及 AI 伴读笔记；
  - 用户打开弹窗、关闭弹窗、切换 Tab 时，页面通过 `window.history.replaceState` 无刷新动态同步浏览器地址栏，用户复制 URL 即自动携带视频 ID；
  - 页面初次加载检测到 `?v=` 参数时自动派发 `viral_deep_link_land` 埋点，记录裂变回流率。
- **一键极客分享中心 (`ShareModal.tsx`)**：
  - **触发入口**：Hero 推荐位 `[ ↗ Share Talk ]`、视频卡片操作行 `[ ↗ Share ]`、播放器顶部工具栏 `[ ↗ Share Talk ]`；
  - **预览摘要**：50% 真实中帧缩略图、HN 点赞数、所属主题与核心技术要点；
  - **1-Click 复制直链**：内置专属 `&ref=share` 参数，一键写入剪贴板；
  - **1-Click 开发者社区广播**：支持一键跳转 𝕏 / Twitter（预填高信噪比反算法文案）、Reddit（r/programming、r/MachineLearning）、Hacker News 及 LinkedIn；
  - **Markdown 嵌入卡片**：提供专为 GitHub README、技术博客、开发笔记设计的 Markdown 卡片代码，一键复制；
  - **遥测上报**：每次分享行为均上报 `share_talk`，细分渠道平台分布。
- **第二大脑知识沉淀回流 (Second-Brain Knowledge Outflow)**：
  - 导出至 Obsidian / Notion 的 Markdown frontmatter 与底部链接均包含对应视频的专属反向回流深度链接 `https://www.hacker-tube.net/?v=${video.id}&ref=obsidian_notes`，当笔记被团队共享或提交至公开 GitHub 仓库时持续形成自然反向链接。

#### (2) 视频卡片 (Video Card)
- **缩略图**：采用视频中段（50% 时间点）生成的真实画面，悬浮时轻微放大并显示播放指示器。
- **标识徽章**：
  - `HN 推荐频次`（如 `🔥 18 Mentions`）；
  - `时长标签`（如 `42:15`）；
  - `所属主题`（如 `Systems`）。
- **快捷操作**：支持快捷键键盘浏览（`j/k` 下一首/上一首，`Enter` 播放，`s` 稍后观看）。

#### (3) 本地无状态保护 (Privacy-first)
- 无需注册登录。
- 用户播放历史、稍后观看、收藏点赞均持久化于浏览器 `localStorage` 中。

---

## 4. 技术架构与选型 (Technical Specifications)

| 层级 | 选用技术 / 方案 | 选型理由 |
| :--- | :--- | :--- |
| **前端框架** | **Next.js (App Router)** | 原生支持 SSG / SSR，确保大模型爬虫抓取到完整语义 HTML。 |
| **样式与美化** | **Vanilla CSS / CSS Modules** | 极度轻量、完全掌控极客黑客风设计、极致性能加载。 |
| **数据层** | **静态 JSON + SQLite/Supabase** | 视频元数据提前生成静态索引，毫秒级响应，零数据库并发压力。 |
| **播放核心** | **YouTube IFrame API** | 严格遵守 YouTube API 服务条款（TOS），CDN 流量由 Google 承载。 |
| **数据巡检管线** | **Node.js / Python 每日脚本** | 自动轮询校验视频 HTTP/API 状态，剔除 404/私享/禁止嵌入视频。 |
| **日志与访客遥测** | **Umami Analytics (自建) + First-Party API** | 零 Cookie、GDPR/CCPA 合规、原生免疫 AdBlock，精准捕获真实访客、来源国家与极客事件。 |
| **部署托管** | **Cloudflare Pages / Vercel** | 全球边缘极速分发，免费 HTTPS，完全免疫高并发流量冲击。 |

### 4.1 核心合规与配额规避机制
1. **YouTube API 每日 10,000 配额保护**：全站绝不对前端请求实时打 YouTube API；所有元数据（标题、时长、缩略图）均在后台离线脚本中预先缓存，前端纯静态消费。
2. **嵌入播放合规**：绝不反编译下载视频源文件，全量使用官方 YouTube 响应式 IFrame 播放器，保留作者版权与播放控制。

---

## 5. 项目落地演进路线 (Roadmap)

### Phase 1：MVP 核心版本（当前阶段）
- [x] 完成全网痛点研究、用户原话调研与商业可行性评估。
- [x] 完成产品开发需求文档（PRD）。
- [ ] 搭建 Next.js 极客风格响应式骨架（深色模式、键盘快捷键支持）。
- [ ] 导入并清洗 6,000+ 条经过状态验证的优质视频数据。
- [ ] 部署 `/llms.txt`、`robots.txt`、JSON-LD 结构化数据，完成 SEO/GEO 优化配置。
- [ ] 上线发布至 Cloudflare Pages / Vercel。

### Phase 2：AI 效率赋能与极客商业化意向验证
- [x] 上线 **极客微问卷与产品路线图共建系统 (`GeekMicroSurveyModal` & `/api/survey`)**，30秒轻量调研极客对“任意视频笔记提取”、“Obsidian/Notion 自动同步”及“$3~$5/月订阅 vs 按需用量付费”的真实意愿。
- [x] 深度联动 Umami Analytics 与服务端第一方日志，实现问卷点击与提交遥测。
- [ ] 接入轻量 LLM Pipeline，为 Top 1,000 热门长视频自动生成分段核心笔记与 Key Takeaways。
- [ ] 搭建自动化增量抓取流：每周自动同步 HN 最热帖子中的新视频推荐。

### Phase 3：商业化与生态闭环
- [ ] 开放跨端书签与知识库自动同步（Obsidian / Notion Vault Auto-Sync 订阅制）。
- [ ] 探索 HackerTube Pro：支持极客任意输入 YouTube 链接，调用 APIVALE 大模型网关快速生成技术研读笔记。
- [ ] 联合优质技术大会、开源基金会及硬核开发者招聘，探索无干扰赞助变现模式。

---

## 6. 极客商业化意向验证与后续复盘准则 (Monetization Validation & Debrief Guidelines)

### 6.1 核心战略：精益验证（先意愿，后开发，零反噬）
1. **品牌护城河**：HackerTube 核心定位为“反算法、高信噪比、致敬 Karpathy”。过早加入强制付费墙（Paywall）易激起 Hacker News 与 Twitter 极客圈反感。因此采取“30秒微调研让社区共建 Roadmap”的方式，既保护极客口碑，又以零研发成本探明商业真实水温。
2. **种子付费客户沉淀**：问卷选填栏留下的 Email / GitHub Handle 且勾选愿意付费的极客，作为首批高价值 Alpha 种子用户（Early Adopters / Whales），后续新功能上线时直接进行定向内测邀请（预估转化率 30%~50%）。

### 6.2 样本积累门槛与数据复盘决策矩阵 (Go / No-Go Decision Matrix)

| 阶段指标 | 观察目标值 | 决策路径与行动指引 |
| :--- | :---: | :--- |
| **复盘启动阈值** | **50 ~ 100 份** 有效微问卷 | 具备统计学代表性，正式召开商业化复盘与立项评审。 |
| **分支 A：明确付费信号** | **付费意愿占比 > 35%**<br/>(选择 $3~$15/月或按次付费) | **果断立项 HackerTube Pro**：<br/>1. 聚焦投票最高的单一杀手级功能（如“任意 YouTube 链接自动提取 LaTeX 笔记”）；<br/>2. 接入 Stripe / LemonSqueezy 及轻量鉴权系统；<br/>3. 定向激活留邮箱的早期种子极客。 |
| **分支 B：纯开源与工具偏好** | **免费开源倾向 > 65%**<br/>(选择“保持开源免费，靠赞助维持”) | **坚守 100% 免费开源，不做 C 端付费墙**：<br/>1. 强化 **APIVALE 大模型网关生态推荐**，通过开发者 API 调用分成变现；<br/>2. 探索优质技术大会、开源基金会及硬核研发岗位无干扰招聘赞助；<br/>3. 最大化保留全网高口碑与社区极客推荐势能。 |

### 6.3 审计与数据源留存
- **服务端运行时日志**：`[HT-SURVEY] { ... }`
- **本地与分析审计快照**：[`reports/survey_responses.jsonl`](file:///e:/SaaS-Tool/hacker-tube/reports/survey_responses.jsonl)
- **遥测归因与事件漏斗**：Umami Analytics (`survey_modal_open`, `survey_submit`)
- **定期分析自动化命令**：`node scripts/analyze_crawlers.mjs`

