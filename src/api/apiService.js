import axios from "axios";
import { endpoints } from "./endpoint";
import { toast } from "@/components/ui/toast";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://kyper-stage.1st90.com";

// Prevent duplicate "Session expired" toasts when multiple API calls return 401 at once
let sessionExpiredToastShown = false;

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

  if (!removeToken && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
    sessionExpiredToastShown = false; // Reset so toast can show again after re-login
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
          localStorage.removeItem("access_token");
          window.dispatchEvent(new Event("auth-changed"));
          if (!sessionExpiredToastShown) {
            sessionExpiredToastShown = true;
            toast.error("Session expired. Please login again.", { duration: 3000 });
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

    // ✅ 2xx = success; 4xx (404, etc.) and 5xx = failure
    const isSuccess = response.status >= 200 && response.status < 300;
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
