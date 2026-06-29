import axios from "axios";
import { endpoints } from "./endpoint";
import { toast } from "@/components/ui/toast";
import { clearAuthSession } from "@/lib/clear-auth-session";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://kyper-stage.1st90.com";

// Prevent duplicate "Session expired" toasts when multiple API calls return 401 at once
let sessionExpiredToastShown = false;

/**
 * Call this before an intentional logout to prevent in-flight 401 responses
 * from showing the "Session expired" toast.
 */
export const suppressNextSessionExpiredToast = () => {
  sessionExpiredToastShown = true;
};

export const apiService = async ({
  endpoint,
  method = "GET",
  data,
  params,
  token: _token,
  headers = {},
  customUrl,
  removeToken = false,
  signal,
}) => {
  let token = _token;

  // 🔹 Resolve token safely (client-only)
  if (!token && typeof window !== "undefined") {
    try {
      const state =
        window.__PRELOADED_STATE__ || window.store?.getState?.();
      token = state?.auth?.token || localStorage.getItem("access_token");
    } catch {
      // ignore token resolution errors
    }
  }

  // 🔹 Build headers
  const requestHeaders = {
    "ngrok-skip-browser-warning": "true",

   
    kyperaccessycgsfwe: "true",

    ...headers,
  };

  // Track whether this request was sent with an auth token.
  // A 401 on an unauthenticated request is never a session expiry
  // (e.g. a failed login attempt returns 401 with wrong credentials).
  const requestHadToken = !removeToken && !!token;

  if (!removeToken && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const requestObj = {
      url: `${customUrl || BACKEND_URL}/${endpoint}`,
      method,
      params,
      data,
      headers: requestHeaders,

      // 🔑 Do NOT throw on 401
      validateStatus: (status) => status < 500,

      ...(signal && { signal }),
    };

    const response = await axios.request(requestObj);

    // ✅ Handle 401 manually
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        try {
          // Only clear session when the original request carried a token.
          // A 401 without a token means wrong credentials (e.g. failed login).
          // clearAuthSession is idempotent — concurrent 401s only fire
          // auth-changed once because tokens are removed on the first call.
          if (requestHadToken) {
            clearAuthSession();
          }
          if (requestHadToken && !sessionExpiredToastShown) {
            sessionExpiredToastShown = true;
            toast.error("Session expired. Please login again.", {
              id: "session-expired",
              duration: 3000,
            });
          }
        } catch {
          // ignore storage/event issues
        }
      }

      return {
        success: false,
        unauthorized: true,
        status: 401,
        response: response.data,
      };
    }

    // ✅ 2xx = success; reset the toast guard so it can fire again after re-login
    const isSuccess = response.status >= 200 && response.status < 300;
    if (isSuccess && requestHadToken) {
      sessionExpiredToastShown = false;
    }

    return {
      success: isSuccess,
      response: response.data,
      status: response.status,
    };
  } catch (error) {
    // 🚨 Only network / unexpected errors
    console.error("Unexpected API error:", error);

    return {
      success: false,
      error: true,
      message: error?.message || "Something went wrong",
    };
  }
};
