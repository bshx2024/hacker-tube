#!/usr/bin/env python3
"""
Gefei SEO Internal Link Graph Auditor
Audits static HTML builds for:
1. In-Degree & Out-Degree distribution
2. BFS Crawl Depth from homepage (Depth <= 2 compliance)
3. Zero Orphan Pages (In-Degree >= 1, unreachable = 0)
4. Dead Ends (Out-Degree >= 5 on content pages)
5. Descriptive Anchor Text Quality (0 empty, 0 generic)
6. Canonical Tag Consistency
"""

import os
import sys
import argparse
from html.parser import HTMLParser
from collections import defaultdict, deque

GENERIC_ANCHOR_TERMS = {
    "click here", "read more", "here", "more", "link", "this",
    "learn more", "view more", "details", "check here", "点击这里", "查看更多", "详情"
}

class LinkGraphParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.canonical = None
        self.title = []
        self.h1 = []
        self.in_title = False
        self.in_h1 = False
        self.current_a = None
        self.current_a_text = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "link" and attrs_dict.get("rel") == "canonical":
            self.canonical = attrs_dict.get("href")
        elif tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.in_h1 = True
        elif tag == "a":
            self.current_a = attrs_dict.get("href")
            self.current_a_text = []

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "h1":
            self.in_h1 = False
        elif tag == "a":
            if self.current_a:
                anchor_text = " ".join("".join(self.current_a_text).split())
                self.links.append((self.current_a, anchor_text))
            self.current_a = None
            self.current_a_text = []

    def handle_data(self, data):
        if self.in_title:
            self.title.append(data)
        elif self.in_h1:
            self.h1.append(data)
        elif self.current_a is not None:
            self.current_a_text.append(data)

def audit_link_graph(app_dir, base_domain="https://www.hacker-tube.net", min_out_degree=5):
    if not os.path.exists(app_dir):
        print(f"Error: Directory {app_dir} does not exist.")
        sys.exit(1)

    html_files = {}
    for root, dirs, files in os.walk(app_dir):
        for f in files:
            if f.endswith(".html") and not f.startswith("_"):
                rel_path = os.path.relpath(os.path.join(root, f), app_dir)
                route = "/" + rel_path.replace(".html", "")
                if route == "/index":
                    route = "/"
                html_files[route] = os.path.join(root, f)

    if not html_files:
        print(f"No HTML files found in {app_dir}.")
        sys.exit(1)

    graph = defaultdict(set)
    anchor_registry = defaultdict(list)
    generic_anchors = []
    page_data = {}

    for route, filepath in html_files.items():
        with open(filepath, "r", encoding="utf-8") as fp:
            content = fp.read()

        parser = LinkGraphParser()
        parser.feed(content)

        for href, text in parser.links:
            clean = href.strip()
            if clean.startswith(base_domain):
                clean = clean.replace(base_domain, "")
                if not clean.startswith("/"):
                    clean = "/" + clean
            if clean.startswith("/") and not clean.startswith("//"):
                clean = clean.split("#")[0].split("?")[0]
                if clean == "":
                    clean = "/"

                if not text:
                    generic_anchors.append((route, clean, "<EMPTY>"))
                elif text.lower() in GENERIC_ANCHOR_TERMS:
                    generic_anchors.append((route, clean, text))

                if clean in html_files:
                    graph[route].add(clean)
                    anchor_registry[(route, clean)].append(text)

        page_data[route] = {
            "canonical": parser.canonical,
            "title": "".join(parser.title).strip(),
            "h1": "".join(parser.h1).strip(),
            "out_targets": len(graph[route])
        }

    # Calculate in-degree
    in_degree = defaultdict(int)
    for src, targets in graph.items():
        for dst in targets:
            in_degree[dst] += 1

    # BFS from root "/"
    dist = {r: float("inf") for r in html_files}
    if "/" in html_files:
        dist["/"] = 0
        queue = deque(["/"])
        while queue:
            curr = queue.popleft()
            for neighbor in graph[curr]:
                if dist[neighbor] == float("inf"):
                    dist[neighbor] = dist[curr] + 1
                    queue.append(neighbor)

    # Defect Checks
    orphans = [r for r in html_files if in_degree[r] == 0]
    unreachable = [r for r in html_files if dist[r] == float("inf")]
    deep_pages = [r for r in html_files if dist[r] > 2]
    dead_ends = [r for r in html_files if r != "/" and len(graph[r]) < min_out_degree]

    print("=" * 80)
    print("GEFEI SEO INTERNAL LINK GRAPH AUDIT REPORT")
    print("=" * 80)
    print(f"{'Route':<42} | {'In':<4} | {'Out':<4} | {'Depth':<5} | {'Canonical'}")
    print("-" * 80)
    for r in sorted(html_files.keys(), key=lambda x: (dist[x], -in_degree[x], x)):
        canon = page_data[r]['canonical'] or "MISSING"
        print(f"{r:<42} | {in_degree[r]:<4} | {len(graph[r]):<4} | {str(dist[r]):<5} | {canon}")

    print("\n" + "=" * 80)
    print("DEFECT SUMMARY:")
    print("-" * 80)
    print(f"1. Total Scanned Pages:        {len(html_files)}")
    print(f"2. Orphan Pages (In-Degree=0): {len(orphans)} {orphans if orphans else '✓ None'}")
    print(f"3. Unreachable from Root '/':  {len(unreachable)} {unreachable if unreachable else '✓ None'}")
    print(f"4. Deep Pages (Depth > 2):     {len(deep_pages)} {deep_pages if deep_pages else '✓ None'}")
    print(f"5. Dead Ends (Out < {min_out_degree}):       {len(dead_ends)} {dead_ends if dead_ends else '✓ None'}")
    print(f"6. Empty/Generic Anchors:      {len(generic_anchors)} {generic_anchors if generic_anchors else '✓ None'}")
    print("=" * 80)

    is_clean = not orphans and not unreachable and not deep_pages and not dead_ends and not generic_anchors
    if is_clean:
        print("RESULT: PASS — All internal linking requirements meet Gefei SEO Standards!")
        return 0
    else:
        print("RESULT: FAIL — Remediation required for detected internal linking defects.")
        return 1

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Audit internal link graph of static HTML pages")
    parser.add_argument("--dir", default="/root/hacker-tube/.next/server/app", help="Path to static HTML root")
    parser.add_argument("--domain", default="https://www.hacker-tube.net", help="Base production domain")
    parser.add_argument("--min-out", type=int, default=5, help="Minimum internal outbound links per content page")
    args = parser.parse_args()

    sys.exit(audit_link_graph(args.dir, args.domain, args.min_out))
