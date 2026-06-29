import { tokenManager } from "@/lib/api-client";

/**
 * Clear stored auth credentials and notify the app (header, guards, subscriptions).
 * Returns true when a session was present and cleared.
 */
export function clearAuthSession() {
  if (typeof window === "undefined") return false;

  const hadSession =
    !!localStorage.getItem("access_token") ||
    !!localStorage.getItem("refresh_token");

  if (!hadSession) return false;

  tokenManager.clearAllTokens();
  localStorage.removeItem("user_name");
  localStorage.removeItem("token_type");

  window.dispatchEvent(new Event("auth-changed"));
  return true;
}
