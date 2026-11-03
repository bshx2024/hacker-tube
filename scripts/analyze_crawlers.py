#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
HackerTube GEO Crawler Radar & Geek Visitor Analysis Engine (Python / VPS Edition)
Inspired by APIVALE's vps_analysis_24h.py.
Designed for Linux VPS / Cron / CI-CD execution.
"""

import sys
import os
import re
import json
from datetime import datetime, timedelta, timezone

AI_CRAWLER_RULES = [
    {"name": "PerplexityBot", "pattern": re.compile(r"perplexitybot", re.I), "org": "Perplexity AI", "role": "Real-time AI Search & Citation Engine"},
    {"name": "OAI-SearchBot", "pattern": re.compile(r"oai-searchbot", re.I), "org": "OpenAI", "role": "SearchGPT Search Engine"},
    {"name": "GPTBot", "pattern": re.compile(r"gptbot", re.I), "org": "OpenAI", "role": "Model Pretraining & Retrieval Pipeline"},
    {"name": "ChatGPT-User", "pattern": re.compile(r"chatgpt-user", re.I), "org": "OpenAI", "role": "ChatGPT Live User Browsing Action"},
    {"name": "ClaudeBot", "pattern": re.compile(r"claudebot|claude-web|anthropic-ai", re.I), "org": "Anthropic", "role": "Claude Search & Knowledge Indexer"},
    {"name": "Google-Extended", "pattern": re.compile(r"google-extended", re.I), "org": "Google", "role": "Gemini AI & Google AI Overviews"},
    {"name": "Applebot-Extended", "pattern": re.compile(r"applebot-extended", re.I), "org": "Apple", "role": "Apple Intelligence Siri & Spotlight AI"},
    {"name": "Bytespider", "pattern": re.compile(r"bytespider", re.I), "org": "ByteDance", "role": "Doubao / Seedance LLM Web Crawl"},
    {"name": "Amazonbot", "pattern": re.compile(r"amazonbot", re.I), "org": "Amazon", "role": "Amazon Q / Bedrock Indexing"},
    {"name": "Meta-ExternalAgent", "pattern": re.compile(r"meta-externalagent|facebookbot", re.I), "org": "Meta", "role": "Meta AI & LLaMA Training Data"},
]

SCANNER_PATH_PATTERNS = [
    re.compile(r"\.env", re.I),
    re.compile(r"\.git", re.I),
    re.compile(r"wp-admin|wp-login", re.I),
    re.compile(r"xmlrpc\.php", re.I),
    re.compile(r"setup\.php|phpinfo", re.I),
    re.compile(r"etc/passwd", re.I),
    re.compile(r"docker-compose", re.I),
    re.compile(r"actuator", re.I),
]

def main():
    log_path = sys.argv[1] if len(sys.argv) > 1 else None
    output_path = "reports/daily_geo_and_visitor_report.md"
    
    print(f"HackerTube GEO Crawler Analysis Engine running...")
    if log_path and os.path.exists(log_path):
        print(f"Reading log file: {log_path}")
    else:
        print("Tip: Run `node scripts/analyze_crawlers.mjs` for immediate execution and sample report.")

if __name__ == "__main__":
    main()

