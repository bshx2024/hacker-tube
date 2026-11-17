#!/usr/bin/env node
/**
 * HackerTube Daily PVUV Morning Check
 * Connects directly to PVUV API to audit traffic quality, page bounce rates, and drop-off funnels.
 */

const SITE_ID = process.env.PVUV_SITE_ID || "R67vgNeg";
const TOKEN = process.env.PVUV_TOKEN || "pvuv_dU8WfFuawG4wX6c96UG-zibSKBc4rTDOcBuxw8C0arI";
const BASE_URL = "https://api.pvuv.ai/v1/sites";

async function fetchReport(endpoint, qs = "") {
  const url = `${BASE_URL}/${SITE_ID}/${endpoint}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  if (!res.ok) {
    throw new Error(`PVUV API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function runMorningCheck() {
  console.log("==================================================");
  console.log("       HackerTube PVUV Morning Health Check       ");
  console.log("==================================================");

  try {
    const overview = await fetchReport("overview", "period=24h");
    const pages = await fetchReport("breakdown", "period=24h&dim=page");
    const sources = await fetchReport("breakdown", "period=24h&dim=source");
    const quality = await fetchReport("quality", "period=24h");

    console.log(`\n[1] 24H Traffic Overview:`);
    console.log(`- PV: ${overview.pv} | UV: ${overview.uv} (Clean UV: ${overview.uv_clean})`);
    console.log(`- Sessions: ${overview.sessions}`);
    console.log(`- Overall Bounce Rate: ${(overview.bounce_rate * 100).toFixed(1)}%`);
    console.log(`- Single-Page Bounce Rate: ${(overview.bounce_rate_single * 100).toFixed(1)}%`);
    console.log(`- Avg Dwell Time: ${(overview.avg_duration_ms / 1000).toFixed(1)}s (Median Session: ${(overview.visit_duration_ms / 1000).toFixed(1)}s)`);

    console.log(`\n[2] Traffic Quality & Bot Filtering:`);
    console.log(`- Clean Visits: ${quality.totals?.clean || 0}`);
    console.log(`- Suspect Visits: ${quality.totals?.suspect || 0}`);
    console.log(`- Bot Visits: ${quality.totals?.bot || 0}`);
    console.log(`- Crawlers: ${quality.totals?.crawler || 0}`);

    console.log(`\n[3] Traffic Acquisition Sources:`);
    (sources.rows || []).slice(0, 5).forEach((s) => {
      console.log(`- ${s.key.padEnd(24)}: ${s.pv} PV | ${s.uv} UV (Clean: ${s.pv_clean} PV)`);
    });

    console.log(`\n[4] Page-Level Bounce Rate Breakdown:`);
    (pages.rows || []).forEach((p) => {
      const rate = p.sessions > 0 ? ((p.bounces / p.sessions) * 100).toFixed(1) : "0.0";
      console.log(`- ${p.path.padEnd(42)} | Sessions: ${String(p.sessions).padStart(2)} | Bounces: ${String(p.bounces).padStart(2)} (${rate}%) | Dwell: ${(p.total_duration_ms / 1000).toFixed(1)}s`);
    });

    console.log("\n==================================================");
    console.log("Morning check completed successfully.");
    console.log("==================================================");
  } catch (err) {
    console.error("Failed to run morning check:", err.message);
    process.exit(1);
  }
}

runMorningCheck();

