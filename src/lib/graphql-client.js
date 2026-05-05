import { wsGraphQLClient } from "./ws-graphql-client";
import { refreshAccessToken } from "./token-refresh";

class GraphQLClient {
  constructor() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kyper-stage.1st90.com";
    this.baseURL = `${apiUrl}/graphql`;
    // Single-flight chain for autoSaveComet.  Prevents two auto-save
    // mutations from being in flight at the same time, which is what
    // caused deleted steps/phases to reappear 2-3 seconds later: a stale
    // payload sometimes landed AFTER a fresh one and overwrote the
    // deletion.  Every caller of autoSaveComet now queues behind the
    // previous call, so saves leave this client in strict order and the
    // network can't reorder them.
    this._autoSaveChain = Promise.resolve();
  }



  async request(query, variables = {}, isRetry = false) {
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

    // console.log("token", localStorage.getItem("auth_token"));
    // if (!token) {
    //   throw new Error("No authentication token found");
    // }

    const response = await fetch(this.baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      if (response.status === 401 && !isRetry) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return this.request(query, variables, true);
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors?.length) {
      const firstMessage =
        result.errors.find((e) => e?.message)?.message ||
        "Something went wrong. Please try again.";
      if (typeof window !== "undefined") {
        import("@/components/ui/toast").then(({ toast }) => {
          toast.error(firstMessage, { id: "graphql-client-error" });
        });
      }
      throw new Error(firstMessage);
    }

    return result.data;
  }

  async createSession() {
    const clientId = localStorage.getItem("Client id");
    console.log("clientId", clientId);
    const query = `
      mutation {
        createSession(clientId: ${clientId}) {
          sessionId
          cometJson
        }
      }
    `;

    return await this.request(query);
  }

  async sendMessage(cometJson) {
    const query = `
      mutation {
        sendMessage(
          cometJson: """
          ${cometJson}
          """
        )
      }
    `;

    return await this.request(query);
  }

  async autoSaveComet(cometJson) {
    // Enqueue this save onto the chain.  The .catch() prevents a previous
    // failed save from breaking subsequent ones, while still letting THIS
    // call's caller see its own error normally (because the returned
    // promise — the new tail of the chain — only rejects if _sendAutoSave
    // rejects for THIS payload, not for an earlier one).
    const next = this._autoSaveChain
      .catch(() => {})
      .then(() => this._sendAutoSave(cometJson));
    this._autoSaveChain = next;
    return next;
  }

  async _sendAutoSave(cometJson) {
    const query = `
      mutation {
        autoSaveComet(
          cometJson: """
          ${cometJson}
          """
        )
      }
    `;
    return await this.request(query);
  }

  /**
   * Resolves once every queued autoSaveComet call has settled.
   * Useful before navigation / unload so in-flight saves aren't lost.
   */
  flushAutoSaves() {
    return this._autoSaveChain.catch(() => {});
  }

  subscribeToSessionUpdates(sessionId, onUpdate, onError) {
    // wsGraphQLClient.subscribeToSessionUpdates is synchronous, so no need for async
    return wsGraphQLClient.subscribeToSessionUpdates(
      sessionId,
      onUpdate,
      onError
    );
  }
  cleanup() {
    wsGraphQLClient.cleanup();
  }
}

export const graphqlClient = new GraphQLClient();
