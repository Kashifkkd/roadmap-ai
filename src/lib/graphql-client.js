import { wsGraphQLClient } from "./ws-graphql-client";

class GraphQLClient {
  constructor() {
    this.baseURL = "https://kyper-stage.1st90.com/graphql";
  }

  

  async request(query, variables = {}) {
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
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
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

  async subscribeToSessionUpdates(sessionId, onUpdate, onError) {
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
