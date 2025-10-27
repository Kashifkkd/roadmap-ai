/**
 * API Client utilities
 * Handles token management and API configuration
 */

class TokenManager {
  constructor() {
    this.tokenKey = "access_token";
  }

  setToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey);
    }
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export const tokenManager = new TokenManager();
