import { tokenManager } from "@/lib/api-client";
import { clearAuthSession } from "@/lib/clear-auth-session";
import { toast } from "@/components/ui/toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://kyper-stage.1st90.com";

export function getSessionDetailsErrorMessage(status) {
  if (status >= 500) return "Server error. Please try again later.";
  if (status === 404) return "Session not found.";
  if (status === 403) return "Access denied.";
  if (status === 401) return "Session expired. Please login again.";
  if (status === 400) return "Invalid request.";
  return "Failed to fetch session details";
}

/**
 * Returns false when there is no usable auth token. Clears stale session and
 * notifies the app so the header updates on All Cycles without extra clicks.
 */
export function ensureCycleAuth() {
  if (tokenManager.isAuthenticated()) return true;

  handleUnauthorized();
  return false;
}

function handleUnauthorized() {
  clearAuthSession();
  toast.error("Session expired. Please login again.", { id: "session-expired" });
}

async function verifyAuthActive() {
  if (!tokenManager.isAuthenticated()) {
    handleUnauthorized();
    return false;
  }

  const token = tokenManager.getToken();
  try {
    const response = await fetch(`${API_URL}/api/auth/v1/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        kyperaccessycgsfwe: "true",
      },
    });

    if (response.status === 401) {
      handleUnauthorized();
      return false;
    }

    return response.ok;
  } catch {
    return true;
  }
}

/**
 * Fetch cycle session details with Authorization. Blocks navigation when auth
 * is missing or the server returns 401 (e.g. logged in from another browser).
 */
export async function fetchCycleSessionDetails(sessionId) {
  if (!sessionId) {
    return { ok: false, message: "Invalid session id" };
  }

  if (!ensureCycleAuth()) {
    return { ok: false, unauthorized: true };
  }

  const authOk = await verifyAuthActive();
  if (!authOk) {
    return { ok: false, unauthorized: true };
  }

  const token = tokenManager.getToken();
  const response = await fetch(
    `${API_URL}/api/comet/session_details/${sessionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status === 401) {
    handleUnauthorized();
    return { ok: false, unauthorized: true };
  }

  if (!response.ok) {
    const message = getSessionDetailsErrorMessage(response.status);
    toast.error(message, response.status === 401 ? { id: "session-expired" } : {});
    return { ok: false, status: response.status, message };
  }

  const result = await response.json();
  return { ok: true, result };
}
