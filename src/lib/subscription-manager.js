import { graphqlClient } from "./graphql-client";

class SubscriptionManager {
  constructor() {
    // Map: sessionId -> { unsubscribe, callbacks, screenRefs }
    this.activeSubscriptions = new Map();
  }

  /**
   * Subscribe to session updates for a given sessionId
   * @param {string} sessionId - The session ID to subscribe to
   * @param {Function} onUpdate - Callback when session data updates
   * @param {Function} onError - Callback when subscription errors
   * @param {Object} options - Options object
   * @param {boolean} options.isPersistentScreen - Whether this is a persistent screen subscription
   * @param {string} options.screenName - Name of the screen (for persistent screens)
   * @returns {Function} Cleanup function to unsubscribe
   */
  subscribe(sessionId, onUpdate, onError, options = {}) {
    if (!sessionId) {
      console.warn("SubscriptionManager: No sessionId provided");
      return () => {};
    }

    const { isPersistentScreen = false, screenName = null } = options;
    const key = sessionId;

    // If subscription already exists, just add callback
    if (this.activeSubscriptions.has(key)) {
      const sub = this.activeSubscriptions.get(key);
      const callbackId = `${Date.now()}-${Math.random()}`;
      const callback = {
        id: callbackId,
        onUpdate,
        onError,
        isPersistentScreen,
        screenName,
      };

      sub.callbacks.push(callback);

      // Track persistent screen reference
      if (isPersistentScreen && screenName) {
        sub.screenRefs.add(screenName);
      }

      console.log(
        `SubscriptionManager: Added callback to existing subscription for sessionId: ${key}, total callbacks: ${sub.callbacks.length}`
      );

      return () => this.unsubscribe(key, callbackId);
    }

    // Create new subscription (only happens once per sessionId)
    console.log(
      `SubscriptionManager: Creating new subscription for sessionId: ${key}`
    );

    const cleanup = graphqlClient.subscribeToSessionUpdates(
      sessionId,
      (data) => {
        // Broadcast to ALL callbacks (persistent + temporary)
        const sub = this.activeSubscriptions.get(key);
        if (sub) {
          sub.callbacks.forEach((cb) => {
            try {
              cb.onUpdate(data);
            } catch (err) {
              console.error("SubscriptionManager: Callback error:", err);
              if (cb.onError) {
                try {
                  cb.onError(err);
                } catch (errorCallbackErr) {
                  console.error(
                    "SubscriptionManager: Error callback error:",
                    errorCallbackErr
                  );
                }
              }
            }
          });
        }
      },
      (error) => {
        const sub = this.activeSubscriptions.get(key);
        if (sub) {
          sub.callbacks.forEach((cb) => {
            try {
              if (cb.onError) {
                cb.onError(error);
              }
            } catch (err) {
              console.error("SubscriptionManager: Error callback error:", err);
            }
          });
        }
      }
    );

    const screenRefs = new Set();
    if (isPersistentScreen && screenName) {
      screenRefs.add(screenName);
    }

    const callbackId = `${Date.now()}-${Math.random()}`;
    const callback = {
      id: callbackId,
      onUpdate,
      onError,
      isPersistentScreen,
      screenName,
    };

    this.activeSubscriptions.set(key, {
      unsubscribe: cleanup,
      callbacks: [callback],
      screenRefs,
    });

    console.log(
      `SubscriptionManager: Created subscription for sessionId: ${key} with ${screenRefs.size} persistent screen(s)`
    );

    return () => this.unsubscribe(key, callbackId);
  }

  /**
   * Unsubscribe a specific callback from a sessionId
   * @param {string} sessionId - The session ID
   * @param {string} callbackId - The callback ID to remove
   */
  unsubscribe(sessionId, callbackId) {
    const key = sessionId;
    const sub = this.activeSubscriptions.get(key);

    if (!sub) {
      console.warn(
        `SubscriptionManager: No subscription found for sessionId: ${key}`
      );
      return;
    }

    // Find and remove this specific callback
    const callbackIndex = sub.callbacks.findIndex(
      (cb) => cb.id === callbackId
    );

    if (callbackIndex === -1) {
      console.warn(
        `SubscriptionManager: Callback ${callbackId} not found for sessionId: ${key}`
      );
      return;
    }

    const removedCallback = sub.callbacks[callbackIndex];
    sub.callbacks.splice(callbackIndex, 1);

    // Remove screen reference if it was a persistent screen
    if (removedCallback.isPersistentScreen && removedCallback.screenName) {
      sub.screenRefs.delete(removedCallback.screenName);
    }

    console.log(
      `SubscriptionManager: Removed callback from sessionId: ${key}, remaining callbacks: ${sub.callbacks.length}, persistent screens: ${sub.screenRefs.size}`
    );

    // Only close subscription if no persistent screens are using it
    // AND no other callbacks remain
    const hasPersistentScreens = sub.screenRefs.size > 0;
    const hasOtherCallbacks = sub.callbacks.length > 0;

    if (!hasPersistentScreens && !hasOtherCallbacks) {
      console.log(
        `SubscriptionManager: Closing subscription for sessionId: ${key} (no more callbacks)`
      );
      if (sub.unsubscribe && typeof sub.unsubscribe === 'function') {
        try {
          sub.unsubscribe();
        } catch (err) {
          console.error(`SubscriptionManager: Error during unsubscribe for sessionId: ${key}`, err);
        }
      } else {
        console.warn(
          `SubscriptionManager: Cleanup function not available or invalid for sessionId: ${key}, type: ${typeof sub.unsubscribe}`
        );
      }
      this.activeSubscriptions.delete(key);
    } else if (hasPersistentScreens) {
      console.log(
        `SubscriptionManager: Keeping subscription alive for sessionId: ${key} (persistent screens active: ${Array.from(sub.screenRefs).join(", ")})`
      );
    }
  }

  /**
   * Check if any persistent screen has subscription for this sessionId
   * @param {string} sessionId - The session ID
   * @returns {boolean}
   */
  hasPersistentSubscription(sessionId) {
    const sub = this.activeSubscriptions.get(sessionId);
    return sub && sub.screenRefs.size > 0;
  }

  /**
   * Get subscription info for debugging
   * @param {string} sessionId - The session ID
   * @returns {Object|null}
   */
  getSubscriptionInfo(sessionId) {
    const sub = this.activeSubscriptions.get(sessionId);
    if (!sub) return null;

    return {
      sessionId,
      callbackCount: sub.callbacks.length,
      persistentScreens: Array.from(sub.screenRefs),
      callbacks: sub.callbacks.map((cb) => ({
        id: cb.id,
        isPersistentScreen: cb.isPersistentScreen,
        screenName: cb.screenName,
      })),
    };
  }

  /**
   * Force cleanup all subscriptions (for logout, etc.)
   */
  cleanup() {
    console.log(
      `SubscriptionManager: Cleaning up ${this.activeSubscriptions.size} subscription(s)`
    );
    this.activeSubscriptions.forEach((sub) => {
      try {
        if (sub.unsubscribe && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      } catch (err) {
        console.error("SubscriptionManager: Error during cleanup:", err);
      }
    });
    this.activeSubscriptions.clear();
  }
}

export const subscriptionManager = new SubscriptionManager();
