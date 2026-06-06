import { toast } from "@/components/ui/toast";
import { wsGraphQLClient } from "@/lib/ws-graphql-client";

const seenVariantSessions = new Set();
const PENDING_SUBSCRIPTIONS_KEY = "pendingVariantSubscriptions";

const getPendingSubscriptions = () => {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(PENDING_SUBSCRIPTIONS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const savePendingSubscriptions = (subscriptions) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  } catch {
    // ignore
  }
};

const addPendingSubscription = (sessionId, data) => {
  const subs = getPendingSubscriptions();
  subs[sessionId] = data;
  savePendingSubscriptions(subs);
};

const removePendingSubscription = (sessionId) => {
  const subs = getPendingSubscriptions();
  delete subs[sessionId];
  savePendingSubscriptions(subs);
};

const activeSubscriptions = new Map();

if (typeof window !== "undefined") {
  window.addEventListener("auth-changed", () => {
    seenVariantSessions.clear();
    localStorage.removeItem(PENDING_SUBSCRIPTIONS_KEY);
  });
}

const parseJsonIfString = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizePayload = (rawPayload) => {
  let normalized = parseJsonIfString(rawPayload);
  normalized = parseJsonIfString(normalized);
  return normalized;
};

const extractSessionId = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  return (
    payload.session_id ||
    payload.sessionId ||
    payload.variant_session_id ||
    payload.variantSessionId ||
    payload.data?.session_id ||
    payload.data?.sessionId ||
    payload.response?.session_id ||
    payload.response?.sessionId ||
    null
  );
};

export function subscribeToVariantReadyWithToast(sessionId, cycleName, options = {}) {
  if (!sessionId) return;
  if (activeSubscriptions.has(sessionId)) return activeSubscriptions.get(sessionId);

  const remixType = options.type || "cycle";
  addPendingSubscription(sessionId, { name: cycleName, type: remixType });

  const handleUpdate = (rawPayload, envelope) => {
    try {
      const parsedPayload = normalizePayload(rawPayload);
      const variantSessionId = extractSessionId(parsedPayload);

      console.log("variantReady normalized payload:", parsedPayload, envelope);

      if (variantSessionId && seenVariantSessions.has(variantSessionId)) {
        return;
      }

      if (variantSessionId) {
        seenVariantSessions.add(variantSessionId);
      }

      const typeLabel = remixType.charAt(0).toUpperCase() + remixType.slice(1);
      toast.success("Variant is ready", {
        description: cycleName
          ? `${typeLabel} "${cycleName}" remixed successfully`
          : `${typeLabel} remixed successfully`,
        duration: Infinity,
        closeButton: true,
      });

      removePendingSubscription(sessionId);
      activeSubscriptions.delete(sessionId);
      if (variantSessionId) {
        seenVariantSessions.delete(variantSessionId);
      }

      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    } catch (error) {
      console.error("Error parsing variantReady payload:", error, rawPayload);
    }
  };

  const handleError = (error) => {
    console.error("variantReady subscription error:", error);
  };

  const unsubscribe = wsGraphQLClient.subscribeToVariantReady(
    sessionId,
    handleUpdate,
    handleError
  );

  activeSubscriptions.set(sessionId, unsubscribe);
  return unsubscribe;
}


if (typeof window !== "undefined") {
  const pending = getPendingSubscriptions();
  Object.keys(pending).forEach((sessionId) => {
    const entry = pending[sessionId];
    // Backward compat: old entries are plain strings (the cycle name)
    if (typeof entry === "string") {
      subscribeToVariantReadyWithToast(sessionId, entry);
    } else {
      subscribeToVariantReadyWithToast(sessionId, entry.name, { type: entry.type });
    }
  });
}
