/**
 * API Client utilities
 * Handles token management and API configuration
 */

class TokenManager {
  constructor() {
    this.tokenKey = "access_token";
    this.refreshTokenKey = "refresh_token";
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

  // Refresh token methods
  setRefreshToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.refreshTokenKey, token);
    }
  }

  getRefreshToken() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(this.refreshTokenKey);
      return token;
    }
    return null;
  }

  removeRefreshToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.refreshTokenKey);
    }
  }

  setTokens(accessToken, refreshToken) {
    this.setToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  clearAllTokens() {
    this.removeToken();
    this.removeRefreshToken();
  }
}

export const tokenManager = new TokenManager();
