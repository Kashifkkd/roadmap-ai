import { createClient } from "graphql-ws";

class WebSocketGraphQLClient {
  constructor() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kyper-stage.1st90.com";
    // Convert HTTP/HTTPS URL to WebSocket URLs
    const wsUrl = apiUrl.replace(/^https:\/\//, "wss://").replace(/^http:\/\//, "ws://");
    this.wsUrl = `${wsUrl}/graphql`;
    this.client = null;
    this.subscriptions = new Map();

    // Reset the WS client whenever auth changes so the next subscription
    // gets a fresh connection with the up-to-date token.
    if (typeof window !== "undefined") {
      window.addEventListener("auth-changed", () => {
        this.resetClient();
      });
    }
  }

  getToken() {
    let token = null;
    if (typeof window !== "undefined") {
      try {
        const state = window.__PRELOADED_STATE__ || window.store?.getState?.();
        if (state && state.auth && state.auth.token) {
          token = state.auth.token;
        }
      } catch {}
      if (!token) {
        token = localStorage.getItem("access_token");
      }
    }
    return token;
  }

  initializeClient() {
    if (this.client) {
      return this.client;
    }

    // connectionParams as a function so graphql-ws reads the token fresh
    // on every new WebSocket connection (including reconnects after token refresh).
    this.client = createClient({
      url: this.wsUrl,
      connectionParams: () => {
        const token = this.getToken();
        return { Authorization: `Bearer ${token}` };
      },
      shouldRetry: () => true,
      retryAttempts: Infinity,
      on: {
        connected: () => {
          console.log("WebSocket GraphQL client connected");
        },
        closed: () => {
          console.log("WebSocket GraphQL client disconnected");
        },
        error: (error) => {
          console.error("WebSocket GraphQL client error:", error);
        },
      },
    });

    return this.client;
  }

  /**
   * Dispose the current WS client and clear all tracked subscriptions so that
   * the next call to initializeClient() creates a fresh connection with the
   * current token. Called on auth-changed (login / logout / token refresh).
   */
  resetClient() {
    console.log("WebSocket GraphQL client: resetting due to auth change");
    this.subscriptions.clear();
    if (this.client) {
      try {
        this.client.dispose();
      } catch (err) {
        console.warn("WebSocket GraphQL client: error during dispose:", err);
      }
      this.client = null;
    }
  }

  subscribeToSessionUpdates(sessionId, onUpdate, onError) {
    const client = this.initializeClient();

    const subscription = `
      subscription {
        sessionUpdates(sessionId: "${sessionId}")
      }
    `;

    const unsubscribe = client.subscribe(
      {
        query: subscription,
      },
      {
        next: (data) => {
          console.log("WebSocket subscription data received:", data);
          if (data.data && data.data.sessionUpdates) {
            try {
              const sessionData = JSON.parse(data.data.sessionUpdates);
              onUpdate(sessionData);
            } catch (error) {
              console.error("Error parsing session data:", error);
              onError(error);
            }
          }
        },
        error: (error) => {
          console.error("WebSocket subscription error:", error);
          onError(error);
        },
        complete: () => {
          console.log("WebSocket subscription completed");
        },
      }
    );

    const subscriptionId = `session-${sessionId}`;
    this.subscriptions.set(subscriptionId, unsubscribe);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      this.subscriptions.delete(subscriptionId);
    };
  }

  subscribeToVariantReady(sessionId, onUpdate, onError) {
    const client = this.initializeClient();

    const subscription = `
      subscription {
        variantReady(sessionId: "${sessionId}")
      }
    `;

    const unsubscribe = client.subscribe(
      {
        query: subscription,
      },
      {
        next: (data) => {
          console.log("WebSocket variantReady data received:", data);
          const payload =
            data?.data?.variantReady ??
            data?.data?.variant_ready ??
            data?.variantReady ??
            data?.variant_ready ??
            null;

          if (payload !== null && payload !== undefined) {
            onUpdate(payload, data);
            return;
          }

          // Keep callback informed even for unexpected response shapes so
          // callers can inspect/log and decide how to handle it.
          onUpdate(data, data);
        },
        error: (error) => {
          console.error("WebSocket variantReady subscription error:", error);
          onError(error);
        },
        complete: () => {
          console.log("WebSocket variantReady subscription completed");
        },
      }
    );

    const subscriptionId = `variant-ready-${sessionId}`;
    this.subscriptions.set(subscriptionId, unsubscribe);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      this.subscriptions.delete(subscriptionId);
    };
  }

  cleanup() {
    this.subscriptions.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.subscriptions.clear();

    if (this.client) {
      this.client.dispose();
      this.client = null;
    }
  }

  close() {
    this.cleanup();
  }
}

export const wsGraphQLClient = new WebSocketGraphQLClient();
