"use client";

import { toast } from "@/components/ui/toast";

const DEFAULT_EXPIRY_HOURS = 24;
const DEFAULT_MIN_REFRESH_GAP_MS = 60 * 1000;
const FAILURE_TOAST_COOLDOWN_MS = 30 * 1000;

let inflightRefreshPromise = null;
let lastRefreshAt = 0;
let lastFailureToastAt = 0;

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "https://kyper-stage.1st90.com";
}

function getAccessToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("access_token");
  } catch {
    return null;
  }
}

function applyCookiePayload(data) {
  if (typeof document === "undefined") return;

  if (data?.cookies && typeof data.cookies === "object") {
    Object.entries(data.cookies).forEach(([name, value]) => {
      document.cookie = `${name}=${value}; path=/; secure; samesite=lax`;
    });
    return;
  }

  if (typeof data?.cookie_header === "string") {
    const parts = data.cookie_header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);

    parts.forEach((kv) => {
      document.cookie = `${kv}; path=/; secure; samesite=lax`;
    });
  }
}

export function appendCacheBuster(url) {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}cf_retry=${Date.now()}`;
}

export async function refreshCloudfrontCookies({
  accessToken,
  force = false,
  minRefreshGapMs = DEFAULT_MIN_REFRESH_GAP_MS,
  expiresInHours = DEFAULT_EXPIRY_HOURS,
  showFailureToast = false,
  failureToastMessage = "Media session expired. Please log in again.",
} = {}) {
  if (typeof window === "undefined") {
    return { ok: false, skipped: true, reason: "non-browser" };
  }

  const token = accessToken || getAccessToken();
  if (!token) {
    return { ok: false, skipped: true, reason: "no-token" };
  }

  const now = Date.now();
  if (!force && now - lastRefreshAt < minRefreshGapMs) {
    return { ok: true, skipped: true, reason: "recently-refreshed" };
  }

  if (inflightRefreshPromise) return inflightRefreshPromise;

  inflightRefreshPromise = (async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(
        `${apiUrl}/api/auth/v1/cloudfront-cookies?expires_in_hours=${expiresInHours}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const contentType = response.headers.get("content-type") || "";
      let payload = null;

      if (contentType.includes("application/json")) {
        payload = await response.json();
      } else {
        const raw = await response.text();
        payload = { raw };
      }

      if (!response.ok) {
        throw new Error(payload?.message || "CloudFront cookie refresh failed");
      }

      applyCookiePayload(payload);
      lastRefreshAt = Date.now();
      window.dispatchEvent(new Event("cloudfront-cookies-refreshed"));

      return { ok: true, payload };
    } catch (error) {
      if (showFailureToast && Date.now() - lastFailureToastAt > FAILURE_TOAST_COOLDOWN_MS) {
        lastFailureToastAt = Date.now();
        toast.error(failureToastMessage, { duration: 4000 });
      }
      return {
        ok: false,
        error: true,
        message: error?.message || "CloudFront cookie refresh failed",
      };
    } finally {
      inflightRefreshPromise = null;
    }
  })();

  return inflightRefreshPromise;
}
