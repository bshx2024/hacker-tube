/**
 * HackerTube Channel Attribution Engine
 * Inspired by APIVALE's first-party attribution design.
 * Designed for developer audience with zero third-party leakage & AdBlock immunity.
 */

export type GeekSourceType =
  | "hackernews"
  | "twitter"
  | "reddit"
  | "github"
  | "ai_search"
  | "search"
  | "direct"
  | "referral";

export interface TouchAttribution {
  source: string;
  medium: string;
  campaign: string;
  referrer: string;
  landing: string;
  timestamp: number;
  geekSource: GeekSourceType;
}

export interface AttributionPayload {
  first_source?: string;
  first_medium?: string;
  first_campaign?: string;
  first_referrer?: string;
  first_landing?: string;
  first_touch_at?: number;

  last_source?: string;
  last_medium?: string;
  last_campaign?: string;

  geek_source?: GeekSourceType;
  anonymous_id?: string;
}

const STORAGE_FT_KEY = "ht_attr_first_touch";
const STORAGE_LT_KEY = "ht_attr_last_touch";
const STORAGE_ANON_ID_KEY = "ht_anon_id";

const COOKIE_FT_KEY = "ht_ft";
const COOKIE_LT_KEY = "ht_lt";

const FT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const LT_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Cookie Helpers (safe for browser environment)
 */
function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
  } catch {
    // Ignore in restrictive cookie contexts
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  } catch {
    return null;
  }
}

/**
 * Generate or retrieve persistent anonymous visitor ID
 */
export function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(STORAGE_ANON_ID_KEY);
    if (!id) {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        id = crypto.randomUUID();
      } else {
        id = `ht_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      }
      localStorage.setItem(STORAGE_ANON_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

/**
 * Parse incoming visitor traffic source with developer community recognition
 */
export function parseTrafficSource(): {
  source: string;
  medium: string;
  campaign: string;
  referrer: string;
  geekSource: GeekSourceType;
  hasExplicitMarketing: boolean;
} {
  if (typeof window === "undefined") {
    return {
      source: "direct",
      medium: "none",
      campaign: "",
      referrer: "",
      geekSource: "direct",
      hasExplicitMarketing: false,
    };
  }

  const urlParams = new URLSearchParams(window.location.search);

  // 1. Check UTM and custom tracking parameters
  const utmSource = urlParams.get("utm_source")?.trim();
  const utmMedium = urlParams.get("utm_medium")?.trim();
  const utmCampaign = urlParams.get("utm_campaign")?.trim();
  const refParam = urlParams.get("ref")?.trim();
  const fromParam = urlParams.get("from")?.trim();
  const channelParam = urlParams.get("channel")?.trim();

  let source = utmSource || channelParam || refParam || fromParam || "";
  let medium = utmMedium || "";
  const campaign = utmCampaign || "";

  if (source || medium || campaign) {
    if (!medium) medium = "campaign";
    let geekSource: GeekSourceType = "referral";
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes("hn") || lowerSource.includes("hacker") || lowerSource.includes("ycombinator")) {
      geekSource = "hackernews";
    } else if (lowerSource.includes("twitter") || lowerSource.includes("x.com") || lowerSource.includes("karpathy")) {
      geekSource = "twitter";
    } else if (lowerSource.includes("reddit")) {
      geekSource = "reddit";
    } else if (lowerSource.includes("github")) {
      geekSource = "github";
    } else if (lowerSource.includes("perplexity") || lowerSource.includes("chatgpt") || lowerSource.includes("claude") || lowerSource.includes("ai")) {
      geekSource = "ai_search";
    }

    return {
      source,
      medium,
      campaign,
      referrer: document.referrer || "",
      geekSource,
      hasExplicitMarketing: true,
    };
  }

  // 2. Parse Document Referrer
  const rawReferrer = document.referrer ? document.referrer.trim() : "";
  if (!rawReferrer) {
    return {
      source: "direct",
      medium: "none",
      campaign: "",
      referrer: "",
      geekSource: "direct",
      hasExplicitMarketing: false,
    };
  }

  try {
    const refUrl = new URL(rawReferrer);
    const currentHost = window.location.hostname;

    // Internal referrer check
    if (refUrl.hostname === currentHost || refUrl.hostname.endsWith(`.${currentHost}`)) {
      return {
        source: "",
        medium: "",
        campaign: "",
        referrer: rawReferrer,
        geekSource: "direct",
        hasExplicitMarketing: false,
      };
    }

    const host = refUrl.hostname.toLowerCase();
    let geekSource: GeekSourceType = "referral";

    if (host.includes("news.ycombinator.com")) {
      source = "hackernews";
      medium = "community";
      geekSource = "hackernews";
    } else if (host.includes("t.co") || host.includes("twitter.com") || host.includes("x.com")) {
      source = "twitter";
      medium = "social";
      geekSource = "twitter";
    } else if (host.includes("reddit.com")) {
      source = "reddit";
      medium = "community";
      geekSource = "reddit";
    } else if (host.includes("github.com")) {
      source = "github";
      medium = "repo";
      geekSource = "github";
    } else if (host.includes("perplexity.ai") || host.includes("chatgpt.com") || host.includes("openai.com") || host.includes("claude.ai")) {
      source = host.split(".")[0];
      medium = "ai_search";
      geekSource = "ai_search";
    } else if (host.includes("google.")) {
      source = "google";
      medium = "organic";
      geekSource = "search";
    } else if (host.includes("bing.")) {
      source = "bing";
      medium = "organic";
      geekSource = "search";
    } else if (host.includes("duckduckgo.")) {
      source = "duckduckgo";
      medium = "organic";
      geekSource = "search";
    } else {
      source = refUrl.hostname;
      medium = "referral";
      geekSource = "referral";
    }

    return {
      source,
      medium,
      campaign: "",
      referrer: rawReferrer,
      geekSource,
      hasExplicitMarketing: true,
    };
  } catch {
    return {
      source: "referral",
      medium: "referral",
      campaign: "",
      referrer: rawReferrer,
      geekSource: "referral",
      hasExplicitMarketing: true,
    };
  }
}

function saveTouch(storageKey: string, cookieKey: string, data: TouchAttribution, maxAge: number): void {
  try {
    const serialized = JSON.stringify(data);
    window.localStorage.setItem(storageKey, serialized);
    setCookie(cookieKey, serialized, maxAge);
  } catch {
    // Ignore storage quota/security errors
  }
}

function getStoredTouch(storageKey: string, cookieKey: string): TouchAttribution | null {
  try {
    const fromStorage = window.localStorage.getItem(storageKey);
    if (fromStorage) {
      return JSON.parse(fromStorage);
    }
    const fromCookie = getCookie(cookieKey);
    if (fromCookie) {
      return JSON.parse(fromCookie);
    }
  } catch {
    // Ignore deserialization error
  }
  return null;
}

/**
 * Initialize Attribution Tracker on Page Mount
 */
export function initAttributionTracker(): void {
  if (typeof window === "undefined") return;

  try {
    const traffic = parseTrafficSource();
    const now = Math.floor(Date.now() / 1000);
    const landing = `${window.location.pathname}${window.location.search}`;

    // 1. First Touch (Only record once per user)
    const existingFT = getStoredTouch(STORAGE_FT_KEY, COOKIE_FT_KEY);
    if (!existingFT && traffic.source) {
      const ft: TouchAttribution = {
        source: traffic.source,
        medium: traffic.medium,
        campaign: traffic.campaign,
        referrer: traffic.referrer,
        landing,
        timestamp: now,
        geekSource: traffic.geekSource,
      };
      saveTouch(STORAGE_FT_KEY, COOKIE_FT_KEY, ft, FT_MAX_AGE);
    }

    // 2. Last Touch (Update on explicit external visit)
    if (traffic.hasExplicitMarketing && traffic.source) {
      const lt: TouchAttribution = {
        source: traffic.source,
        medium: traffic.medium,
        campaign: traffic.campaign,
        referrer: traffic.referrer,
        landing,
        timestamp: now,
        geekSource: traffic.geekSource,
      };
      saveTouch(STORAGE_LT_KEY, COOKIE_LT_KEY, lt, LT_MAX_AGE);
    }
  } catch (err) {
    console.debug("Attribution tracker init error", err);
  }
}

/**
 * Get current attribution payload for tracking events
 */
export function getAttributionPayload(): AttributionPayload {
  if (typeof window === "undefined") return {};

  const ft = getStoredTouch(STORAGE_FT_KEY, COOKIE_FT_KEY);
  const lt = getStoredTouch(STORAGE_LT_KEY, COOKIE_LT_KEY) || ft;

  const payload: AttributionPayload = {
    anonymous_id: getAnonymousId(),
  };

  if (ft) {
    payload.first_source = ft.source;
    payload.first_medium = ft.medium;
    payload.first_campaign = ft.campaign;
    payload.first_referrer = ft.referrer;
    payload.first_landing = ft.landing;
    payload.first_touch_at = ft.timestamp;
    payload.geek_source = ft.geekSource;
  }

  if (lt) {
    payload.last_source = lt.source;
    payload.last_medium = lt.medium;
    payload.last_campaign = lt.campaign;
    if (!payload.geek_source) {
      payload.geek_source = lt.geekSource;
    }
  }

  return payload;
}

/**
 * Get detected source for UI adaptation (e.g. customized welcome banner)
 */
export function getDetectedGeekSource(): {
  type: GeekSourceType;
  sourceName: string;
} | null {
  if (typeof window === "undefined") return null;

  const traffic = parseTrafficSource();
  if (traffic.geekSource) {
    return {
      type: traffic.geekSource,
      sourceName: traffic.source || "direct",
    };
  }

  const stored = getStoredTouch(STORAGE_LT_KEY, COOKIE_LT_KEY) || getStoredTouch(STORAGE_FT_KEY, COOKIE_FT_KEY);
  if (stored && stored.geekSource) {
    return {
      type: stored.geekSource,
      sourceName: stored.source || "direct",
    };
  }

  return {
    type: "direct",
    sourceName: "direct",
  };
}
