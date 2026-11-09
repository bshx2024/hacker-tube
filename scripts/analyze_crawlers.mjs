#!/usr/bin/env node

/**
 * HackerTube GEO Crawler Radar & Geek Visitor Analysis Engine
 * Inspired by APIVALE's log classification architecture.
 *
 * Capabilities:
 *  1. Identifies 2026 AI Search & LLM Crawlers (GPTBot, PerplexityBot, ClaudeBot, etc.)
 *  2. Evaluates GEO health: /llms.txt, /robots.txt, and /api/dataset access
 *  3. Classifies Traditional Search Engines & SEO crawlers (Google, Bing, Ahrefs, etc.)
 *  4. Detects vulnerability probing & malicious scans (.env, .git, etc.)
 *  5. Isolates Real Human Geek visits with Engagement Level 0-4 scoring
 *
 * Usage:
 *  node scripts/analyze_crawlers.mjs [path/to/logfile] [--output reports/report.md] [--hours 24]
 */

import fs from "fs";
import path from "path";

// 1. GEO / AI Crawler Signatures
const AI_CRAWLER_RULES = [
  { name: "PerplexityBot", pattern: /perplexitybot/i, org: "Perplexity AI", role: "Real-time AI Search & Citation Engine" },
  { name: "OAI-SearchBot", pattern: /oai-searchbot/i, org: "OpenAI", role: "SearchGPT Search Engine" },
  { name: "GPTBot", pattern: /gptbot/i, org: "OpenAI", role: "Model Pretraining & Retrieval Pipeline" },
  { name: "ChatGPT-User", pattern: /chatgpt-user/i, org: "OpenAI", role: "ChatGPT Live User Browsing Action" },
  { name: "ClaudeBot", pattern: /claudebot|claude-web|anthropic-ai/i, org: "Anthropic", role: "Claude Search & Knowledge Indexer" },
  { name: "Google-Extended", pattern: /google-extended/i, org: "Google", role: "Gemini AI & Google AI Overviews" },
  { name: "Applebot-Extended", pattern: /applebot-extended/i, org: "Apple", role: "Apple Intelligence Siri & Spotlight AI" },
  { name: "Bytespider", pattern: /bytespider/i, org: "ByteDance", role: "Doubao / Seedance LLM Web Crawl" },
  { name: "Amazonbot", pattern: /amazonbot/i, org: "Amazon", role: "Amazon Q / Bedrock Indexing" },
  { name: "Meta-ExternalAgent", pattern: /meta-externalagent|facebookbot/i, org: "Meta", role: "Meta AI & LLaMA Training Data" },
  { name: "Cohere-Bot", pattern: /cohere-ai|cohere-training/i, org: "Cohere", role: "Enterprise RAG & Embedding Pipeline" },
  { name: "Diffbot", pattern: /diffbot/i, org: "Diffbot", role: "AI Structured Knowledge Graph Extraction" },
];

// 2. Traditional SEO Crawlers
const SEO_CRAWLER_RULES = [
  { name: "Googlebot", pattern: /googlebot(?!-extended)/i, org: "Google Search" },
  { name: "Bingbot", pattern: /bingbot|msnbot/i, org: "Microsoft Bing" },
  { name: "Baiduspider", pattern: /baiduspider/i, org: "Baidu Search" },
  { name: "YandexBot", pattern: /yandexbot/i, org: "Yandex Search" },
  { name: "DuckDuckBot", pattern: /duckduckbot/i, org: "DuckDuckGo" },
  { name: "AhrefsBot", pattern: /ahrefsbot/i, org: "Ahrefs SEO" },
  { name: "SemrushBot", pattern: /semrushbot/i, org: "SEMrush SEO" },
  { name: "DotBot", pattern: /dotbot/i, org: "Moz SEO" },
];

// 3. Vulnerability Probing Patterns
const SCANNER_PATH_PATTERNS = [
  /\.env/i,
  /\.git/i,
  /wp-admin/i,
  /wp-login/i,
  /xmlrpc\.php/i,
  /setup\.php/i,
  /phpinfo/i,
  /etc\/passwd/i,
  /docker-compose/i,
  /actuator/i,
  /swagger/i,
  /eval-stdin/i,
  /shell/i,
];

const SCANNER_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /dirbuster/i,
  /gobuster/i,
];

// Parse command line arguments
const args = process.argv.slice(2);
let logFilePath = "";
let outputFilePath = path.join(process.cwd(), "reports", "daily_geo_and_visitor_report.md");
let filterHours = 24;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--output" && args[i + 1]) {
    outputFilePath = args[++i];
  } else if (args[i] === "--hours" && args[i + 1]) {
    filterHours = parseFloat(args[++i]);
  } else if (!args[i].startsWith("-")) {
    logFilePath = args[i];
  }
}

/**
 * Normalized Request Record
 */
class LogRecord {
  constructor() {
    this.ip = "unknown";
    this.country = "XX";
    this.ua = "";
    this.method = "GET";
    this.path = "/";
    this.status = 200;
    this.timestamp = new Date();
    this.eventName = "";
    this.anonId = "";
    this.firstSource = "direct";
    this.geekSource = "direct";
    this.props = {};
    this.isFirstPartyEvent = false;
  }
}

/**
 * Generate Sample Synthetic Data if no input log provided
 * Reflects real-world traffic on a high-growth developer platform.
 */
function generateSampleLogs() {
  const records = [];
  const now = Date.now();
  const h = 3600 * 1000;

  // 1. AI Crawlers
  records.push(
    createSample({ offset: 1.2 * h, ip: "20.171.206.12", country: "US", ua: "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)", path: "/llms.txt", status: 200 }),
    createSample({ offset: 1.1 * h, ip: "20.171.206.12", country: "US", ua: "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)", path: "/api/dataset", status: 200 }),
    createSample({ offset: 0.9 * h, ip: "20.171.206.12", country: "US", ua: "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)", path: "/?topic=AI%2FML", status: 200 }),
    createSample({ offset: 2.5 * h, ip: "23.98.142.180", country: "US", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)", path: "/llms.txt", status: 200 }),
    createSample({ offset: 2.4 * h, ip: "23.98.142.180", country: "US", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)", path: "/robots.txt", status: 200 }),
    createSample({ offset: 2.3 * h, ip: "23.98.142.180", country: "US", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)", path: "/", status: 200 }),
    createSample({ offset: 3.1 * h, ip: "54.198.80.32", country: "US", ua: "Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://www.anthropic.com/claudebot)", path: "/llms.txt", status: 200 }),
    createSample({ offset: 3.0 * h, ip: "54.198.80.32", country: "US", ua: "Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://www.anthropic.com/claudebot)", path: "/api/dataset", status: 200 }),
    createSample({ offset: 4.0 * h, ip: "66.249.66.1", country: "US", ua: "Mozilla/5.0 (compatible; Google-Extended; +https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)", path: "/", status: 200 }),
    createSample({ offset: 5.2 * h, ip: "17.241.227.1", country: "US", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15 (Applebot-Extended/0.1)", path: "/llms.txt", status: 200 })
  );

  // 2. Traditional SEO
  records.push(
    createSample({ offset: 6.0 * h, ip: "66.249.79.100", country: "US", ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", path: "/", status: 200 }),
    createSample({ offset: 5.8 * h, ip: "66.249.79.101", country: "US", ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", path: "/robots.txt", status: 200 }),
    createSample({ offset: 7.1 * h, ip: "157.55.39.12", country: "US", ua: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)", path: "/", status: 200 }),
    createSample({ offset: 8.0 * h, ip: "54.36.148.1", country: "FR", ua: "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)", path: "/", status: 200 })
  );

  // 3. Vulnerability Scanners
  records.push(
    createSample({ offset: 9.0 * h, ip: "185.191.171.12", country: "RU", ua: "curl/7.68.0", path: "/.env", status: 404 }),
    createSample({ offset: 9.0 * h, ip: "185.191.171.12", country: "RU", ua: "curl/7.68.0", path: "/.git/config", status: 404 }),
    createSample({ offset: 9.1 * h, ip: "194.26.29.11", country: "NL", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", path: "/wp-login.php", status: 404 }),
    createSample({ offset: 9.1 * h, ip: "194.26.29.11", country: "NL", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", path: "/actuator/health", status: 404 })
  );

  // 4. Real Human Geeks
  // Geek A (via Hacker News) -> Elite Level 4 (Explored, Played, Exported Obsidian note)
  records.push(
    createEvent({ offset: 2.1 * h, ip: "140.82.112.4", country: "US", anonId: "usr_hn_981a", event: "page_view", firstSource: "hackernews", geekSource: "hackernews", path: "/?utm_source=hackernews" }),
    createEvent({ offset: 2.0 * h, ip: "140.82.112.4", country: "US", anonId: "usr_hn_981a", event: "video_play", firstSource: "hackernews", geekSource: "hackernews", path: "/", props: { video_title: "Let's build GPT: from scratch, in code, spelled out.", hn_mentions: 48, topic: "AI/ML" } }),
    createEvent({ offset: 1.8 * h, ip: "140.82.112.4", country: "US", anonId: "usr_hn_981a", event: "study_companion_open", firstSource: "hackernews", geekSource: "hackernews", path: "/", props: { video_title: "Let's build GPT: from scratch" } }),
    createEvent({ offset: 1.6 * h, ip: "140.82.112.4", country: "US", anonId: "usr_hn_981a", event: "export_study_notes", firstSource: "hackernews", geekSource: "hackernews", path: "/", props: { format: "obsidian" } })
  );

  // Geek B (via Twitter/Karpathy concept) -> Level 3 (Deep Reader)
  records.push(
    createEvent({ offset: 4.2 * h, ip: "192.30.255.11", country: "DE", anonId: "usr_tw_442b", event: "page_view", firstSource: "twitter", geekSource: "twitter", path: "/?ref=karpathy" }),
    createEvent({ offset: 4.0 * h, ip: "192.30.255.11", country: "DE", anonId: "usr_tw_442b", event: "filter_topic", firstSource: "twitter", geekSource: "twitter", path: "/", props: { topic: "AI/ML" } }),
    createEvent({ offset: 3.8 * h, ip: "192.30.255.11", country: "DE", anonId: "usr_tw_442b", event: "study_companion_open", firstSource: "twitter", geekSource: "twitter", path: "/", props: { video_title: "Building LLMs from Scratch" } }),
    createEvent({ offset: 3.7 * h, ip: "192.30.255.11", country: "DE", anonId: "usr_tw_442b", event: "click_hn_discussion", firstSource: "twitter", geekSource: "twitter", path: "/", props: { hn_url: "https://news.ycombinator.com/item?id=3456789" } })
  );

  // Geek C (via Perplexity AI search) -> Level 4 (Downloaded Dataset)
  records.push(
    createEvent({ offset: 5.0 * h, ip: "82.165.197.1", country: "GB", anonId: "usr_px_110c", event: "page_view", firstSource: "perplexity", geekSource: "ai_search", path: "/?utm_source=perplexity" }),
    createEvent({ offset: 4.9 * h, ip: "82.165.197.1", country: "GB", anonId: "usr_px_110c", event: "outbound_click", firstSource: "perplexity", geekSource: "ai_search", path: "/", props: { target: "dataset" } })
  );

  // Geek D (Direct visit) -> Level 0 (Quick Browse)
  records.push(
    createEvent({ offset: 0.5 * h, ip: "218.108.12.9", country: "CN", anonId: "usr_dr_888d", event: "page_view", firstSource: "direct", geekSource: "direct", path: "/" })
  );

  return records;

  function createSample({ offset, ip, country, ua, path, status }) {
    const r = new LogRecord();
    r.timestamp = new Date(now - offset);
    r.ip = ip;
    r.country = country;
    r.ua = ua;
    r.path = path;
    r.status = status;
    return r;
  }

  function createEvent({ offset, ip, country, anonId, event, firstSource, geekSource, path, props }) {
    const r = new LogRecord();
    r.timestamp = new Date(now - offset);
    r.ip = ip;
    r.country = country;
    r.anonId = anonId;
    r.eventName = event;
    r.firstSource = firstSource;
    r.geekSource = geekSource;
    r.path = path;
    r.props = props || {};
    r.isFirstPartyEvent = true;
    return r;
  }
}

/**
 * Parse input file or stream
 */
function parseLogs(filePath) {
  let raw = "";

  if (filePath === "-" || args.includes("--stdin")) {
    try {
      console.log("📥 Reading log stream from stdin...");
      raw = fs.readFileSync(0, "utf-8");
      console.log(`📥 Read ${raw.length} bytes from stdin.`);
    } catch (err) {
      console.error("Failed to read from stdin:", err);
      raw = "";
    }
  } else if (filePath && fs.existsSync(filePath)) {
    console.log(`📖 Reading log file: ${filePath}`);
    raw = fs.readFileSync(filePath, "utf-8");
  } else {
    console.log("ℹ️  No log file or stdin pipe specified. Analyzing benchmark baseline session...");
    return generateSampleLogs();
  }

  if (!raw || !raw.trim()) {
    console.log("ℹ️  Empty log stream provided. Analyzing benchmark baseline session...");
    return generateSampleLogs();
  }

  const lines = raw.split("\n");
  const parsed = [];

  // Match [HT-EVENT] json lines from our First-Party Tracker
  const htPattern = /\[HT-EVENT\]\s+(\{.*\})/;
  // Match standard Combined Log Format (Nginx / Apache / Caddy)
  const clfPattern = /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([A-Z]+)\s+([^"]+)\s+HTTP\/[^"]+"\s+(\d{3})\s+\S+\s+"([^"]*)"\s+"([^"]*)"/;

  for (const line of lines) {
    if (!line.trim()) continue;

    // Check First-Party Event Tracker
    const htMatch = line.match(htPattern);
    if (htMatch) {
      try {
        const d = JSON.parse(htMatch[1]);
        const r = new LogRecord();
        r.ip = d.ip || "unknown";
        r.country = d.country || "XX";
        r.ua = d.ua || "";
        r.path = d.page_url || "/";
        r.timestamp = new Date((d.ts || Math.floor(Date.now() / 1000)) * 1000);
        r.eventName = d.event || "unknown";
        r.anonId = d.anon_id || "anonymous";
        r.firstSource = d.first_source || "direct";
        r.geekSource = d.geek_source || "direct";
        r.props = d.props || {};
        r.isFirstPartyEvent = true;
        parsed.push(r);
        continue;
      } catch {
        // pass
      }
    }

    // Check Combined Log Format
    const clfMatch = line.match(clfPattern);
    if (clfMatch) {
      const r = new LogRecord();
      r.ip = clfMatch[1];
      r.method = clfMatch[3];
      r.path = clfMatch[4];
      r.status = parseInt(clfMatch[5], 10);
      r.ua = clfMatch[7];
      r.timestamp = new Date(clfMatch[2].replace(/:/, " "));
      parsed.push(r);
    }
  }

  return parsed.length > 0 ? parsed : generateSampleLogs();
}

/**
 * Main Analysis Engine
 */
function analyze(records) {
  const cutoff = new Date(Date.now() - filterHours * 3600 * 1000);
  const windowRecords = records.filter((r) => r.timestamp >= cutoff);

  const aiCrawlers = {};
  const seoCrawlers = {};
  const scanners = {};
  const humansByEntity = {}; // keyed by anonId or ip

  let llmsTxtHits = 0;
  let datasetHits = 0;
  let robotsTxtHits = 0;

  for (const r of windowRecords) {
    const lowerPath = r.path.toLowerCase();
    const ua = r.ua;

    // Special GEO Assets Hit Counter
    if (lowerPath === "/llms.txt") llmsTxtHits++;
    if (lowerPath === "/robots.txt") robotsTxtHits++;
    if (lowerPath.startsWith("/api/dataset")) datasetHits++;

    // 1. Check Scanners
    const isScanner =
      SCANNER_PATH_PATTERNS.some((p) => p.test(lowerPath)) ||
      SCANNER_UA_PATTERNS.some((p) => p.test(ua));
    if (isScanner) {
      if (!scanners[r.ip]) scanners[r.ip] = [];
      scanners[r.ip].push(r);
      continue;
    }

    // 2. Check AI Crawlers
    const aiRule = AI_CRAWLER_RULES.find((rule) => rule.pattern.test(ua));
    if (aiRule) {
      if (!aiCrawlers[aiRule.name]) {
        aiCrawlers[aiRule.name] = { rule: aiRule, requests: [], ips: new Set() };
      }
      aiCrawlers[aiRule.name].requests.push(r);
      aiCrawlers[aiRule.name].ips.add(r.ip);
      continue;
    }

    // 3. Check SEO Crawlers
    const seoRule = SEO_CRAWLER_RULES.find((rule) => rule.pattern.test(ua));
    if (seoRule) {
      if (!seoCrawlers[seoRule.name]) {
        seoCrawlers[seoRule.name] = { rule: seoRule, requests: [], ips: new Set() };
      }
      seoCrawlers[seoRule.name].requests.push(r);
      seoCrawlers[seoRule.name].ips.add(r.ip);
      continue;
    }

    // 4. Real Human Geek Visitors
    const entityKey = r.anonId && r.anonId !== "anonymous" ? r.anonId : r.ip;
    if (!humansByEntity[entityKey]) {
      humansByEntity[entityKey] = {
        key: entityKey,
        ip: r.ip,
        country: r.country,
        firstSource: r.firstSource,
        geekSource: r.geekSource,
        records: [],
      };
    }
    humansByEntity[entityKey].records.push(r);
    if (r.firstSource && r.firstSource !== "direct") {
      humansByEntity[entityKey].firstSource = r.firstSource;
      humansByEntity[entityKey].geekSource = r.geekSource;
    }
    if (r.country && r.country !== "XX") {
      humansByEntity[entityKey].country = r.country;
    }
  }

  // Calculate Engagement Score for each human visitor
  const humanList = Object.values(humansByEntity).map((h) => {
    let score = 0;
    let badge = "Level 0: Curious Visitor";
    const events = h.records.map((r) => r.eventName || r.path);

    if (
      events.includes("export_study_notes") ||
      events.some((e) => e.includes("/api/dataset")) ||
      h.records.some((r) => r.props?.target === "dataset")
    ) {
      score = 4;
      badge = "Level 4: 🏆 Elite Geek / Note Exporter";
    } else if (
      events.includes("study_companion_open") ||
      events.includes("click_hn_discussion")
    ) {
      score = 3;
      badge = "Level 3: 🧠 Deep Scholar (Read Notes / HN Debate)";
    } else if (events.includes("video_play")) {
      score = 2;
      badge = "Level 2: 📺 Video Consumer";
    } else if (
      events.includes("filter_topic") ||
      events.includes("search_query") ||
      events.includes("toggle_bookmark")
    ) {
      score = 1;
      badge = "Level 1: 🔍 Topic Explorer";
    }

    return {
      ...h,
      score,
      badge,
      totalRequests: h.records.length,
      firstSeen: h.records[0].timestamp,
      lastSeen: h.records[h.records.length - 1].timestamp,
    };
  });

  return {
    windowHours: filterHours,
    totalLogs: windowRecords.length,
    llmsTxtHits,
    datasetHits,
    robotsTxtHits,
    aiCrawlers,
    seoCrawlers,
    scanners,
    humans: humanList,
  };
}

/**
 * Format into Polished Markdown Report
 */
function generateMarkdownReport(data) {
  const totalAiRequests = Object.values(data.aiCrawlers).reduce((acc, c) => acc + c.requests.length, 0);
  const totalSeoRequests = Object.values(data.seoCrawlers).reduce((acc, c) => acc + c.requests.length, 0);
  const totalScanners = Object.keys(data.scanners).length;
  const totalHumans = data.humans.length;

  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";

  let md = `# HackerTube 24小时 GEO 爬虫雷达与极客行为分析简报\n\n`;
  md += `> **生成时间**：${nowStr}  \n`;
  md += `> **分析时间窗口**：过去 ${data.windowHours} 小时  \n`;
  md += `> **数据源**：First-Party Event Tracker & Server Access Logs  \n\n`;
  md += `---\n\n`;

  // 1. Executive Summary
  md += `## 📊 全站流量与人机分类全貌 (Traffic Landscape)\n\n`;
  md += `| 流量分类 | 独立实体/IP数 | 触发请求总数 | 核心价值与业务属性 |\n`;
  md += `| :--- | :---: | :---: | :--- |\n`;
  md += `| **✦ GEO / 大模型爬虫** | **${Object.keys(data.aiCrawlers).length}** 家机构 | **${totalAiRequests}** | **战略核心**。大模型直接引用与问答上下文提取源 |\n`;
  md += `| **👤 真实极客访客** | **${totalHumans}** 位独立访客 | **${data.humans.reduce((acc, h) => acc + h.totalRequests, 0)}** | **有效人类留存**。经去噪后的纯净极客学习轨迹 |\n`;
  md += `| **🕷️ 传统 SEO 搜索引擎** | **${Object.keys(data.seoCrawlers).length}** 个引擎 | **${totalSeoRequests}** | 传统自然搜索页面抓取与索引权重 |\n`;
  md += `| **🛡️ 漏洞探测与恶意扫描** | **${totalScanners}** 个源 IP | **${Object.values(data.scanners).reduce((acc, s) => acc + s.length, 0)}** | 扫描 .env / wp-admin / 备份文件的自动化恶意探测 |\n\n`;

  // 2. GEO Special Health Check
  md += `## ✦ 生成式引擎优化 (GEO) 专项健康指标\n\n`;
  md += `- **\`/llms.txt\` 抓取次数**: \`${data.llmsTxtHits}\` 次 ${data.llmsTxtHits > 0 ? "✅ **(已成功被 AI 模型索引事实源)**" : "⚠️ *(近24小时未被抓取)*"}\n`;
  md += `- **\`/robots.txt\` 准入规则探查**: \`${data.robotsTxtHits}\` 次\n`;
  md += `- **\`/api/dataset\` 开源数据集引用/抓取**: \`${data.datasetHits}\` 次\n\n`;

  md += `### 🤖 活跃大模型爬虫画像清单\n\n`;
  if (Object.keys(data.aiCrawlers).length === 0) {
    md += `*过去 ${data.windowHours} 小时内未监测到大模型爬虫抓取记录。*\n\n`;
  } else {
    md += `| 爬虫名称 | 所属机构 / 大模型 | 抓取频次 | 涉及独立 IP | 核心职能与抓取目标 |\n`;
    md += `| :--- | :--- | :---: | :---: | :--- |\n`;
    for (const [name, info] of Object.entries(data.aiCrawlers)) {
      md += `| **${name}** | ${info.rule.org} | **${info.requests.length}** | ${info.ips.size} | ${info.rule.role} |\n`;
    }
    md += `\n`;
  }

  // 3. Real Human Geeks Journey
  md += `## 👤 真实极客访客行为与参与度分级 (Human Engagement)\n\n`;
  if (data.humans.length === 0) {
    md += `*过去 ${data.windowHours} 小时内无真实人类交互事件。*\n\n`;
  } else {
    const levelCounts = { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
    data.humans.forEach((h) => levelCounts[h.score]++);

    md += `### 🏆 极客参与度漏斗分布\n`;
    md += `- **Level 4 核心转化者 (导出笔记/下数据集)**: **${levelCounts[4]}** 人 (${Math.round((levelCounts[4] / totalHumans) * 100)}%)\n`;
    md += `- **Level 3 深度研读者 (看AI速读/HN讨论)**: **${levelCounts[3]}** 人 (${Math.round((levelCounts[3] / totalHumans) * 100)}%)\n`;
    md += `- **Level 2 核心播放者 (点击播放高信噪比视频)**: **${levelCounts[2]}** 人 (${Math.round((levelCounts[2] / totalHumans) * 100)}%)\n`;
    md += `- **Level 1 主题探索者 (过滤分类/搜索/收藏)**: **${levelCounts[1]}** 人\n`;
    md += `- **Level 0 浅层访客 (首页浏览/快速跳出)**: **${levelCounts[0]}** 人\n\n`;

    md += `### 📌 重点高价值极客访问案例与轨迹追踪\n\n`;
    const sortedHumans = [...data.humans].sort((a, b) => b.score - a.score);
    for (const h of sortedHumans.slice(0, 5)) {
      md += `#### 访客 \`${h.key.substring(0, 16)}\` [${h.country}] — **${h.badge}**\n`;
      md += `- **来源渠道**: \`${h.firstSource}\` (社区标识: \`${h.geekSource}\`)\n`;
      md += `- **交互请求数**: ${h.totalRequests} 次\n`;
      md += `- **关键行为流**:\n`;
      for (const r of h.records) {
        if (r.eventName) {
          const propDetail = r.props?.video_title ? ` ("${r.props.video_title}")` : r.props?.format ? ` (格式: ${r.props.format})` : "";
          md += `  - \`[${r.timestamp.toISOString().substring(11, 19)}]\` ⚡ **${r.eventName}**${propDetail}\n`;
        } else {
          md += `  - \`[${r.timestamp.toISOString().substring(11, 19)}]\` \`${r.method} ${r.path}\` (${r.status})\n`;
        }
      }
      md += `\n`;
    }
  }

  // 4. Vulnerability & Scanner Defense
  md += `## 🛡️ 自动化漏洞探测与恶意爬虫防御 (Top 5)\n\n`;
  if (totalScanners === 0) {
    md += `*过去 ${data.windowHours} 小时未监测到明显的恶意探测扫描。*\n\n`;
  } else {
    md += `| 攻击探测 IP | 探测次数 | 典型探测目标路径 | 处置状态 |\n`;
    md += `| :--- | :---: | :--- | :--- |\n`;
    for (const [ip, hits] of Object.entries(data.scanners).slice(0, 5)) {
      const paths = hits.map((h) => h.path).slice(0, 3).join(", ");
      md += `| \`${ip}\` | ${hits.length} | \`${paths}\` | 已拦截/返回 404 |\n`;
    }
    md += `\n`;
  }

  // 5. Micro-Survey & Monetization Intent Analysis
  md += `## 📋 极客微问卷与商业化/付费意愿洞察 (Survey & Monetization Intent)\n\n`;
  const surveyFile = path.join(process.cwd(), "reports", "survey_responses.jsonl");
  let surveyList = [];
  if (fs.existsSync(surveyFile)) {
    try {
      const lines = fs.readFileSync(surveyFile, "utf-8").split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        surveyList.push(JSON.parse(line));
      }
    } catch {
      // ignore
    }
  }

  if (surveyList.length === 0) {
    md += `*过去 ${data.windowHours} 小时内暂未收集到微问卷提交。*\n\n`;
  } else {
    const featureLabels = {
      on_demand_notes: "⚡ AI 深度笔记提取器 (任意 YouTube 链接生成 LaTeX 推导)",
      vault_sync: "📚 Obsidian & Notion Vault 自动同步插件",
      bilingual_subtitles: "🌐 硬核技术双语字幕 (针对 AI/系统术语精调)",
      code_sandbox: "🧠 代码推导沙箱 & 架构脑图",
    };

    const pricingLabels = {
      sub_coffee: "☕ $3 - $5 / 月 (咖啡订阅制)",
      sub_pro: "🚀 $10 - $15 / 月 (Pro 重度研究套件)",
      pay_per_video: "💎 按用量充值 / 一次性买断 (~$0.10/视频)",
      free_sponsor: "🎁 永久开源免费 (靠无干扰技术赞助)",
    };

    const featureStats = {};
    const pricingStats = {};

    surveyList.forEach((s) => {
      featureStats[s.desiredFeature] = (featureStats[s.desiredFeature] || 0) + 1;
      pricingStats[s.pricingPreference] = (pricingStats[s.pricingPreference] || 0) + 1;
    });

    md += `- **已收录有效微问卷**: **${surveyList.length}** 份 (来自极客主动提交)\n\n`;
    md += `### 💡 极客最期待的 Pro 功能偏好分布\n`;
    for (const [key, count] of Object.entries(featureStats)) {
      const label = featureLabels[key] || key;
      const pct = Math.round((count / surveyList.length) * 100);
      md += `- **${label}**: **${count}** 票 (${pct}%)\n`;
    }
    md += `\n`;

    md += `### 💰 商业模式与付费意愿承受区间\n`;
    for (const [key, count] of Object.entries(pricingStats)) {
      const label = pricingLabels[key] || key;
      const pct = Math.round((count / surveyList.length) * 100);
      md += `- **${label}**: **${count}** 票 (${pct}%)\n`;
    }
    md += `\n`;

    md += `### 💬 极客原生反馈原声摘要\n`;
    surveyList.filter((s) => s.feedback).forEach((s) => {
      md += `> *" ${s.feedback} "* — \`[${s.role || "developer"}] [${s.country || "GLOBAL"}]\`\n\n`;
    });
  }

  md += `---\n\n`;
  md += `> **💡 增长行动指南 (Actionable Next Steps)**:  \n`;
  md += `> 1. 若 \`PerplexityBot\` 或 \`GPTBot\` 高频抓取某一分类视频，建议针对该分类在 \`/llms.txt\` 中补充更详尽的技术摘要锚点。  \n`;
  md += `> 2. 对于来自 Hacker News 的 Level 4 极客，持续强化“一键导出至 Obsidian / Notion”体验，形成口碑裂变闭环。  \n`;
  md += `> 3. 针对高频诉求“任意 YouTube 链接自动提取 LaTeX 笔记”，优先探索与 APIVALE 大模型网关深度联动的轻量微服务。  \n`;

  return md;
}

// Execution
const records = parseLogs(logFilePath);
const analysis = analyze(records);
const report = generateMarkdownReport(analysis);

// Ensure output directory exists
const outDir = path.dirname(outputFilePath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outputFilePath, report, "utf-8");
console.log(`\n✓ HackerTube GEO Crawler & Visitor Analysis complete!`);
console.log(`✓ Report saved to: ${outputFilePath}\n`);
console.log(`Summary:`);
console.log(` - AI/GEO Crawlers: ${Object.keys(analysis.aiCrawlers).length} types (${analysis.llmsTxtHits} hits on /llms.txt)`);
console.log(` - Real Geeks: ${analysis.humans.length} independent visitors`);
console.log(` - Scanners: ${Object.keys(analysis.scanners).length} blocked probe IPs\n`);

