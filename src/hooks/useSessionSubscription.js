import { useEffect, useRef } from "react";
import { subscriptionManager } from "@/lib/subscription-manager";
import { usePathname } from "next/navigation";

// Persistent screens that should keep subscriptions alive
const PERSISTENT_SCREENS = {
  "/dashboard": "dashboard",
  "/outline-manager": "outline-manager",
  "/comet-manager": "comet-manager",
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

  // Keep callbacks ref updated so they're always current
  useEffect(() => {
    callbacksRef.current = { onUpdate, onError };
  }, [onUpdate, onError]);

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

    // Cleanup on unmount or when sessionId/pathname changes
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [sessionId, pathname, options.forcePersistent, options.forceTemporary]);

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
