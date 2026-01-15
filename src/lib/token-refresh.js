/**
 * Token Refresh Utility
 * Handles automatic token refresh with request queue to prevent multiple simultaneous refresh calls
 */

import { tokenManager } from "./api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://kyper-stage.1st90.com";

// Singleton promise to prevent multiple simultaneous refresh calls
let refreshPromise = null;

/**
 * Refresh the access token using the stored refresh token
 * @returns {Promise<string|null>} New access token or null if refresh failed
 */
export async function refreshAccessToken() {

    // If already refreshing, return the existing promise to avoid multiple calls
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        const refreshToken = tokenManager.getRefreshToken();

        if (!refreshToken) {
            return null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/v1/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });


            if (!response.ok) {
                try {
                    const errorData = await response.text();
                } catch (e) {
                }
                logout();
                return null;
            }

            const data = await response.json();

            // Update tokens in storage
            tokenManager.setTokens(data.access_token, data.refresh_token);

            // Update user info if provided
            if (data.full_name) {
                localStorage.setItem("user_name", data.full_name);
            }
            if (data.token_type) {
                localStorage.setItem("token_type", data.token_type);
            }

            return data.access_token;
        } catch (error) {
            logout();
            return null;
        }
    })();

    try {
        return await refreshPromise;
    } finally {
        // Reset the promise so future refresh attempts start fresh
        refreshPromise = null;
    }
}

/**
 * Check if a token refresh is currently in progress
 * @returns {boolean}
 */
export function isRefreshing() {
    return refreshPromise !== null;
}

/**
 * Logout the user - clear all tokens and redirect to login
 */
export function logout() {

    if (typeof window === "undefined") return;

    // Log current tokens before clearing
    const currentAccessToken = localStorage.getItem("access_token");
    const currentRefreshToken = localStorage.getItem("refresh_token");

    // Clear all tokens
    tokenManager.clearAllTokens();

    // Clear other auth-related data
    localStorage.removeItem("user_name");
    localStorage.removeItem("token_type");

    // Dispatch auth-changed event
    window.dispatchEvent(new Event("auth-changed"));

    // Redirect to home/login page
    window.location.href = "/";
}
