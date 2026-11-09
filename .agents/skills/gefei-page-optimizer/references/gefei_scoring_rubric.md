# Gefei On-Page SEO Scoring Rubric & Deductions Matrix

This reference documents the exact deduction engine, scoring rules, and optimization thresholds used by **Gefei Page Coach (页面军师)** and **On-Page SEO 体检**.

---

## 1. Score Deductions Matrix (扣分项详解)

| Deducted Metric | Penalty | Root Cause | Exact Fix |
| :--- | :--- | :--- | :--- |
| **关键词出现在 H1 (丢分最高)** | **-8 分** | 页面推断词在 `<h1>` 标签中未完整命中（命中率 < 100%）。 | 将 H1 与 Title 严格对齐，或将主词完整嵌入 H1。例：`<h1>Simple Made Easy — Rich Hickey</h1>`。 |
| **关键词出现在 Title** | **-2 分** | Title 标签缺少目标词或缺少关键修饰词。 | 目标词置于 Title 最前端：`[Core Keyword]: [High-Signal Subtitle] \| [Brand]`。控制在 50~60 字符内。 |
| **关键词出现在 Description** | **-1 分** | Meta Description 前半段缺少目标关键词。 | 目标词必须出现在描述的前 80 个字符内，总长度 140~160 字符。 |
| **关键词出现在 URL 路径** | **-0.5 分** | URL slug 未包含完整关键词 token。 | 使用短横线分隔的关键词 URL（如 `/v/fast-inverse-square-root`）。若有历史 ID，通过 `ALIAS_MAP` 建立别名。 |
| **密度榜位置加权覆盖 (1~5 词榜)** | **-4 分** | 1~5 词高频密度榜前排充斥无关噪音词，目标词未霸榜。 | 优化文案，在 FAQ、模块标题、引用小结中提高核心词出现频次（目标词出现 15~25 次），压低噪音词频次。 |
| **薄内容 / 词数不达标** | **-5 ~ -15 分** | 页面词数低于 1,200 词，被搜索引擎判定为薄页面 (Thin Content)。 | 扩充内容至 **1,600 ~ 2,000+ 英文单词**（6 大高价值模块）。 |
| **纯跳转落地页 (P0 致命)** | **P0 警告** | 核心功能不在当页，用户进站必须再次跳转。 | 承接页即落地页，当页提供即时可消费的内容、试听、公式与解析。 |

---

## 2. TDK 字符长度黄金规范

- **Title 标题**:
  - 英文：**45 ~ 60 字符**（超 60 字符在 Google SERP 会被截断 `...`）。
  - 中文：**25 ~ 30 汉字**。
  - **避坑提示**：Next.js App Router 模版若配置了 `%s | Brand`，子页面必须使用 `title: { absolute: pageTitle }`，防止双重拼接导致超长。
- **Description 描述**:
  - 英文：**140 ~ 160 字符**（前 80 字符必含核心词与用户痛点转化词）。
  - 中文：**70 ~ 80 汉字**。
- **H1 主标题**:
  - 页面全局仅保留一个 `<h1>` 标签。
  - 必须 100% 包含目标核心推断词。

---

## 3. 六大内链原则 (Internal Linking Standards)

1. **零孤岛页面 (No Orphan Pages)**:
   - 全站所有 Canonical 与 Alias 路由入度（In-Degree）必须 $\ge 3$。
   - 严禁出现仅有静态路由但站内无链接的幽灵页面。
2. **抓取深度扁平化 (Crawl Depth $\le 2$)**:
   - 从首页 `/` 出发，通过广度优先搜索 (BFS) 计算的最短跳数必须 $\le 2$。
   - 核心分类与精读专页必须实现 Depth = 1（首页直达）。
3. **消除终端死胡同 (No Dead Ends)**:
   - 任何详情页出度（Out-Degree）必须 $\ge 12$。
   - 单视频或单文章的主题分类，必须引入跨分类高权兜底推荐（保证每页推荐 3+ 篇相关精读），严禁隐藏或空置相关推荐区块。
4. **全站统一通用权威底栏 (Universal Footer)**:
   - 首页、分类归档页、详情页、别名页必须挂载完全一致的全局底栏。
   - 底栏必须包含：全部分类 Hub 链接、核心精读专页直链、Sitemap.xml、Robots.txt、开源数据集。
5. **描述性精准锚文本 (Descriptive Anchors)**:
   - 严禁出现空文本 `<a>` 标签。
   - 严禁出现“点击这里”、“查看更多”、“read more”、“click here”等无语义泛词。
   - 锚文本必须是文章完整标题、实体人名、技术关键词或分类名称。
6. **双向流动桥接 (Bidirectional Link Flow)**:
   - 规范 URL 与搜索别名 URL 之间必须在正文提供互通桥接标签（如 `Canonical: id` 和 `Guide: /alias`）。
   - Spoke 页面必须提供 Breadcrumbs 面包屑直回 Hub 页面。
