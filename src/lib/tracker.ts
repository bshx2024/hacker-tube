/**
 * HackerTube First-Party Event Tracker
 * AdBlock-immune tracking via same-origin sendBeacon & keepalive fetch.
 * Also mirrors events to Google Analytics (gtag) if present and unblocked.
 */

import { getAttributionPayload } from "./attribution";

export interface TrackEventPayload {
  event_name: string;
  anonymous_id: string;
  properties?: Record<string, unknown>;
  page_url: string;
  referrer: string;
  timestamp: number;
  first_source?: string;
  first_medium?: string;
  first_campaign?: string;
  last_source?: string;
  geek_source?: string;
}

// Global declaration for window.gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
  }
}

/**
 * Core event dispatcher
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !eventName) return;

  try {
    const attr = getAttributionPayload();
    const payload: TrackEventPayload = {
      event_name: eventName,
      anonymous_id: attr.anonymous_id || "anonymous",
      properties: properties || {},
      page_url: `${window.location.pathname}${window.location.search}`,
      referrer: document.referrer || "",
      timestamp: Math.floor(Date.now() / 1000),
      first_source: attr.first_source,
      first_medium: attr.first_medium,
      first_campaign: attr.first_campaign,
      last_source: attr.last_source,
      geek_source: attr.geek_source,
    };

    const body = JSON.stringify(payload);

    // 1. Primary: navigator.sendBeacon (Same-origin, immune to AdBlock, survives page close)
    let beaconSent = false;
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      try {
        const blob = new Blob([body], { type: "application/json" });
        beaconSent = navigator.sendBeacon("/api/track", blob);
      } catch {
        beaconSent = false;
      }
    }

    // 2. Secondary: fetch with keepalive fallback
    if (!beaconSent) {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Silently swallow network drops
      });
    }

    // 3. Dual-dispatch to GA4 if active (and not blocked by uBlock Origin)
    if (typeof window.gtag === "function") {
      try {
        window.gtag("event", eventName, {
          ...properties,
          anonymous_id: attr.anonymous_id,
          first_source: attr.first_source,
          geek_source: attr.geek_source,
        });

        // If engagement_time_msec is provided (heartbeat), explicitly ping GA4 user_engagement
        if (properties?.engagement_time_msec && typeof properties.engagement_time_msec === "number") {
          window.gtag("event", "user_engagement", {
            engagement_time_msec: properties.engagement_time_msec,
          });
        }
      } catch {
        // Ignore gtag failure
      }
    }
  } catch (err) {
    console.debug("Track event error", err);
  }
}

/**
 * Pre-defined Golden Conversion Funnel Events
 */

export function trackPageView(pageUrl?: string): void {
  trackEvent("page_view", {
    path: pageUrl || (typeof window !== "undefined" ? window.location.pathname : "/"),
  });
}

export function trackVideoPlay(video: {
  id: string;
  title: string;
  topic: string;
  hnMentions: number;
  duration: string;
}): void {
  trackEvent("video_play", {
    video_id: video.id,
    video_title: video.title,
    topic: video.topic,
    hn_mentions: video.hnMentions,
    duration: video.duration,
  });
}

export function trackStudyOpen(video: {
  id: string;
  title: string;
  topic: string;
}): void {
  trackEvent("study_companion_open", {
    video_id: video.id,
    video_title: video.title,
    topic: video.topic,
  });
}

export function trackHnClick(videoId: string, hnUrl: string): void {
  trackEvent("click_hn_discussion", {
    video_id: videoId,
    hn_url: hnUrl,
  });
}

export function trackExportNotes(
  videoId: string,
  format: "markdown" | "obsidian" | "notion"
): void {
  trackEvent("export_study_notes", {
    video_id: videoId,
    format,
  });
}

export function trackOutboundClick(
  target: "github" | "dataset" | "apple_tv" | "karpathy_blog" | "apivale",
  context?: string
): void {
  trackEvent("outbound_click", {
    target,
    context: context || "navbar",
  });
}

export function trackFilterTopic(topic: string): void {
  trackEvent("filter_topic", {
    topic,
  });
}

export function trackBookmark(videoId: string, action: "save" | "unsave"): void {
  trackEvent("toggle_bookmark", {
    video_id: videoId,
    action,
  });
}

export function trackSearch(query: string, resultCount: number): void {
  if (!query.trim()) return;
  trackEvent("search_query", {
    query: query.trim(),
    result_count: resultCount,
  });
}

/**
 * Active Engagement Heartbeat
 * Solves GA4 YouTube iframe focus loss & tracks real foreground reading/studying dwell time.
 */
export function trackEngagementHeartbeat(
  context: "video_modal" | "page_reading",
  seconds: number,
  details?: Record<string, unknown>
): void {
  trackEvent("user_engagement_heartbeat", {
    context,
    seconds_active: seconds,
    engagement_time_msec: seconds * 1000,
    ...details,
  });
}

/**
 * Viral Growth & Referral Sharing Telemetry
 */
export function trackShare(
  videoId: string,
  platform: "twitter" | "reddit" | "hackernews" | "linkedin" | "copy_link" | "markdown_embed"
): void {
  trackEvent("share_talk", {
    video_id: videoId,
    platform,
  });
}

export function trackDeepLinkLanding(videoId: string, refParam?: string): void {
  trackEvent("viral_deep_link_land", {
    video_id: videoId,
    ref: refParam || "direct_link",
  });
}


