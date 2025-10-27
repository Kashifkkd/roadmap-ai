import { createClient } from 'graphql-ws';

class WebSocketGraphQLClient {
  constructor() {
    this.wsUrl = 'https://kyper-stage.1st90.com/graphql';
    this.client = null;
    this.subscriptions = new Map();
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
        token = localStorage.getItem("token");
      }
    }
    return token;
  }

  initializeClient() {
    if (this.client) {
      return this.client;
    }

    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    this.client = createClient({
      url: this.wsUrl,
      connectionParams: {
        Authorization: `Bearer ${token}`,
      },
      on: {
        connected: () => {
          console.log('WebSocket GraphQL client connected');
        },
        closed: () => {
          console.log('WebSocket GraphQL client disconnected');
        },
        error: (error) => {
          console.error('WebSocket GraphQL client error:', error);
        },
      },
    });

    return this.client;
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
          console.log('WebSocket subscription data received:', data);
          if (data.data && data.data.sessionUpdates) {
            try {
              const sessionData = JSON.parse(data.data.sessionUpdates);
              onUpdate(sessionData);
            } catch (error) {
              console.error('Error parsing session data:', error);
              onError(error);
            }
          }
        },
        error: (error) => {
          console.error('WebSocket subscription error:', error);
          onError(error);
        },
        complete: () => {
          console.log('WebSocket subscription completed');
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
