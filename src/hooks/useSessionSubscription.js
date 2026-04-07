import { useEffect, useRef, useState } from "react";
import { subscriptionManager } from "@/lib/subscription-manager";
import { usePathname } from "next/navigation";

// Persistent screens that should keep subscriptions alive
const PERSISTENT_SCREENS = {
  "/dashboard": "dashboard",
  "/outline-manager": "outline-manager",
  "/cycle-manager": "cycle-manager",
};

/**
 * Hook to subscribe to session updates
 * Automatically handles persistent vs temporary subscriptions based on current route
 *
 * @param {string} sessionId - The session ID to subscribe to
 * @param {Function} onUpdate - Callback when session data updates
 * @param {Function} onError - Callback when subscription errors
 * @param {Object} options - Additional options
 * @param {boolean} options.forcePersistent - Force this as a persistent subscription
 * @param {boolean} options.forceTemporary - Force this as a temporary subscription
 */
export function useSessionSubscription(
  sessionId,
  onUpdate,
  onError,
  options = {}
) {
  const pathname = usePathname();
  const callbacksRef = useRef({ onUpdate, onError });
  const cleanupRef = useRef(null);

  // Incremented on every auth-changed event so the subscription useEffect
  // re-runs and creates a fresh subscription over the new WS connection.
  const [authVersion, setAuthVersion] = useState(0);

  // Keep callbacks ref updated so they're always current
  useEffect(() => {
    callbacksRef.current = { onUpdate, onError };
  }, [onUpdate, onError]);

  // Track auth changes so we can force re-subscription with the new token.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAuthChanged = () => {
      setAuthVersion((v) => v + 1);
    };

    window.addEventListener("auth-changed", handleAuthChanged);
    return () => window.removeEventListener("auth-changed", handleAuthChanged);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    // Determine if this is a persistent screen
    const screenName = PERSISTENT_SCREENS[pathname];
    const isPersistentScreen =
      options.forcePersistent ||
      (screenName && !options.forceTemporary);

    // Create wrapper callbacks that use the ref
    const handleUpdate = (data) => {
      if (callbacksRef.current.onUpdate) {
        callbacksRef.current.onUpdate(data);
      }
    };

    const handleError = (error) => {
      if (callbacksRef.current.onError) {
        callbacksRef.current.onError(error);
      }
    };

    // Subscribe using the subscription manager
    cleanupRef.current = subscriptionManager.subscribe(
      sessionId,
      handleUpdate,
      handleError,
      {
        isPersistentScreen,
        screenName: screenName || null,
      }
    );

    // Cleanup on unmount or when sessionId/pathname/authVersion changes
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
    // authVersion is intentionally included: when auth changes, the WS client
    // and subscription manager are both reset, so we must re-subscribe here.
  }, [sessionId, pathname, options.forcePersistent, options.forceTemporary, authVersion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);
}
