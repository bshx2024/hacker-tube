#!/usr/bin/env python3
"""
HackerTube GSC Autopilot Analyzer
---------------------------------
Automated data-driven SEO analyzer connecting GSC API with Gefei SEO methodology.
Categorizes queries into 4 opportunity quadrants, cross-references local Next.js
codebase, and generates actionable optimization recommendations.
"""

import os
import sys
import json
import re
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build

KEY_PATH = '/root/Company_HQ/airap-video-513708-02c9c84cdaab.json'
SITE_URL = 'sc-domain:hacker-tube.net'
VIDEOS_FILE = '/root/hacker-tube/src/data/videos.ts'
PAGE_FILE = '/root/hacker-tube/src/app/v/[id]/page.tsx'
NOTES_FILE = '/root/hacker-tube/src/data/studyNotes.ts'
FOOTER_FILE = '/root/hacker-tube/src/components/Footer.tsx'

def load_codebase_context():
    """Extract existing alias routes, video IDs, and footer links from codebase."""
    context = {
        'aliases': set(),
        'video_ids': set(),
        'footer_links': set()
    }
    
    if os.path.exists(PAGE_FILE):
        with open(PAGE_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'const ALIAS_MAP: Record<string, string> = \{([^}]+)\};', content, re.DOTALL)
            if match:
                for line in match.group(1).split('\n'):
                    parts = re.findall(r'"([^"]+)"', line)
                    if len(parts) >= 1:
                        context['aliases'].add(parts[0])

    if os.path.exists(VIDEOS_FILE):
        with open(VIDEOS_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            ids = re.findall(r'id:\s*"([^"]+)"', content)
            context['video_ids'].update(ids)

    if os.path.exists(FOOTER_FILE):
        with open(FOOTER_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            links = re.findall(r'href="([^"]+)"', content)
            context['footer_links'].update(links)

    return context

def fetch_gsc_data(days=14):
    """Fetch search analytics from Google Search Console API."""
    if not os.path.exists(KEY_PATH):
        raise FileNotFoundError(f"GSC service account key not found at {KEY_PATH}")

    creds = service_account.Credentials.from_service_account_file(
        KEY_PATH, scopes=['https://www.googleapis.com/auth/webmasters.readonly']
    )
    service = build('searchconsole', 'v1', credentials=creds)

    end_date = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
    start_date = (datetime.utcnow() - timedelta(days=days)).strftime('%Y-%m-%d')

    # Fetch query + page matrix
    res_qp = service.searchanalytics().query(
        siteUrl=SITE_URL,
        body={
            'startDate': start_date,
            'endDate': end_date,
            'dimensions': ['query', 'page'],
            'rowLimit': 500
        }
    ).execute()

    return res_qp.get('rows', []), start_date, end_date

def analyze_opportunities(rows, context):
    """Segment GSC query data into Gefei 4-Quadrant Opportunity Matrix."""
    q1_high_imp_low_ctr = []   # High impression, CTR < 2.0%
    q2_striking_distance = []  # Pos 4~10, CTR >= 2.0%
    q3_niche_longtail = []     # Non-brand specific longtail keywords
    q4_top_performers = []     # Pos <= 3, High CTR

    for r in rows:
        query = r['keys'][0].strip()
        page = r['keys'][1].strip()
        clicks = r['clicks']
        imp = r['impressions']
        ctr = r['ctr']
        pos = r['position']

        item = {
            'query': query,
            'page': page,
            'clicks': clicks,
            'impressions': imp,
            'ctr': ctr,
            'position': pos,
            'ctr_pct': ctr * 100
        }

        # Quadrant 1: High Imp, Low CTR (The biggest traffic unlock)
        if imp >= 30 and ctr < 0.02 and pos <= 15:
            q1_high_imp_low_ctr.append(item)

        # Quadrant 2: Striking Distance (Pos 3.5 ~ 10, Healthy CTR >= 2.0%)
        elif 3.5 <= pos <= 10 and imp >= 15 and ctr >= 0.02:
            q2_striking_distance.append(item)

        # Quadrant 3: Long-tail / Content opportunities
        elif imp >= 10 and not any(b in query for b in ['hackertube', 'hacker tube', 'hacktube']):
            q3_niche_longtail.append(item)

        # Quadrant 4: Top Performers (Pos < 3.5, CTR >= 5%)
        elif pos < 3.5 and ctr >= 0.05:
            q4_top_performers.append(item)

    # Sort each quadrant by impressions descending
    q1_high_imp_low_ctr.sort(key=lambda x: -x['impressions'])
    q2_striking_distance.sort(key=lambda x: -x['impressions'])
    q3_niche_longtail.sort(key=lambda x: -x['impressions'])
    q4_top_performers.sort(key=lambda x: -x['impressions'])

    return {
        'q1': q1_high_imp_low_ctr,
        'q2': q2_striking_distance,
        'q3': q3_niche_longtail,
        'q4': q4_top_performers
    }

def print_autopilot_report(matrix, start_date, end_date, context):
    print("=" * 88)
    print("HACKERTUBE SEO AUTOPILOT: GSC 4-QUADRANT OPPORTUNITY AUDIT")
    print(f"Date Range: {start_date} to {end_date} | Source: Google Search Console API")
    print("=" * 88)

    print("\n[QUADRANT 1: HIGH IMPRESSION, LOW CTR] 👉 Highest Traffic Unlock via Title & Snippet")
    print(f"{'Query':<30} | {'Landing Page':<32} | {'Imp':<6} | {'Clicks':<6} | {'CTR':<7} | {'Pos':<5}")
    print("-" * 88)
    for item in matrix['q1'][:10]:
        page_short = item['page'].replace('https://www.hacker-tube.net', '') or '/'
        print(f"{item['query']:<30} | {page_short:<32} | {item['impressions']:<6} | {item['clicks']:<6} | {item['ctr_pct']:>5.2f}% | {item['position']:>4.1f}")

    print("\n[QUADRANT 2: STRIKING DISTANCE (POS 4-10)] 👉 Climb to Top 3 via Gefei Internal Links")
    print(f"{'Query':<30} | {'Landing Page':<32} | {'Imp':<6} | {'Clicks':<6} | {'CTR':<7} | {'Pos':<5}")
    print("-" * 88)
    for item in matrix['q2'][:10]:
        page_short = item['page'].replace('https://www.hacker-tube.net', '') or '/'
        print(f"{item['query']:<30} | {page_short:<32} | {item['impressions']:<6} | {item['clicks']:<6} | {item['ctr_pct']:>5.2f}% | {item['position']:>4.1f}")

    print("\n[QUADRANT 3: EMERGING NICHE & LONG-TAIL QUERIES] 👉 New Page / Alias / FAQ Candidates")
    print(f"{'Query':<30} | {'Landing Page':<32} | {'Imp':<6} | {'Clicks':<6} | {'CTR':<7} | {'Pos':<5}")
    print("-" * 88)
    if matrix['q3']:
        for item in matrix['q3'][:10]:
            page_short = item['page'].replace('https://www.hacker-tube.net', '') or '/'
            print(f"{item['query']:<30} | {page_short:<32} | {item['impressions']:<6} | {item['clicks']:<6} | {item['ctr_pct']:>5.2f}% | {item['position']:>4.1f}")
    else:
        print("  No long-tail queries >= 10 impressions currently detected outside brand terms.")

    print("\n[QUADRANT 4: TOP PERFORMING DEFENSIVE MOATS] 👉 Current Top 3 Positions")
    print(f"{'Query':<30} | {'Landing Page':<32} | {'Imp':<6} | {'Clicks':<6} | {'CTR':<7} | {'Pos':<5}")
    print("-" * 88)
    for item in matrix['q4'][:10]:
        page_short = item['page'].replace('https://www.hacker-tube.net', '') or '/'
        print(f"{item['query']:<30} | {page_short:<32} | {item['impressions']:<6} | {item['clicks']:<6} | {item['ctr_pct']:>5.2f}% | {item['position']:>4.1f}")

    print("\n" + "=" * 88)
    print("ACTIONABLE GEFEI SEO AUTOPILOT RECOMMENDATIONS:")
    print("=" * 88)

    # Automated recommendation generation
    rec_count = 1
    if matrix['q1']:
        top_q1 = matrix['q1'][0]
        print(f"{rec_count}. [P0 Snippet Optimization] Target Query: '{top_q1['query']}'")
        print(f"   - Current Metrics: {top_q1['impressions']} impressions, CTR {top_q1['ctr_pct']:.2f}%, Pos {top_q1['position']:.1f}")
        print(f"   - Proposed Action: Deploy action-oriented Hook in Title and Description for landing page '{top_q1['page']}'.")
        rec_count += 1

    if matrix['q2']:
        top_q2 = matrix['q2'][0]
        print(f"{rec_count}. [P1 Internal Link Boost] Target Query: '{top_q2['query']}'")
        print(f"   - Current Metrics: {top_q2['impressions']} impressions, CTR {top_q2['ctr_pct']:.2f}%, Pos {top_q2['position']:.1f}")
        print(f"   - Proposed Action: Elevate internal in-degree for '{top_q2['page']}' by adding it to Featured Cards or Universal Footer.")
        rec_count += 1

    print("=" * 88)

def main():
    context = load_codebase_context()
    rows, start_date, end_date = fetch_gsc_data(days=14)
    matrix = analyze_opportunities(rows, context)
    print_autopilot_report(matrix, start_date, end_date, context)

if __name__ == '__main__':
    main()
