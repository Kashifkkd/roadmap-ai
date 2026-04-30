"use client";

import { useEffect } from "react";
import { refreshCloudfrontCookies } from "@/lib/cloudfront-cookies";

const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;

export default function CloudfrontCookieManager() {
  useEffect(() => {
    const refresh = ({ force = false } = {}) =>
      refreshCloudfrontCookies({
        force,
        minRefreshGapMs: 60 * 1000,
        showFailureToast: false,
      });

    refresh({ force: true });

    const intervalId = window.setInterval(() => {
      refresh();
    }, REFRESH_INTERVAL_MS);

    const onFocus = () => refresh();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onAuthChanged = () => refresh({ force: true });
    const onExplicitRefreshRequest = () =>
      refreshCloudfrontCookies({
        force: true,
        showFailureToast: true,
      });

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("auth-changed", onAuthChanged);
    window.addEventListener("cloudfront-refresh-request", onExplicitRefreshRequest);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener("cloudfront-refresh-request", onExplicitRefreshRequest);
    };
  }, []);

  return null;
}
