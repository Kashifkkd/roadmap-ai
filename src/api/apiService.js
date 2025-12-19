// import axios from "axios";
// import { endpoints } from "./endpoint";

// const BACKEND_URL = "https://kyper-stage.1st90.com";

// export const apiService = async ({
//   endpoint,
//   method = "GET",
//   data,
//   params,
//   token: _token,
//   headers = {},
//   customUrl,
//   removeToken = false,
//   signal,
// }) => {
//   try {
//     let token = _token;
//     if (!token && typeof window !== "undefined") {
//       try {
//         const state = window.__PRELOADED_STATE__ || window.store?.getState?.();
//         if (state && state.auth && state.auth.token) {
//           token = state.auth.token;
//         }
//       } catch {}
//       if (!token) {
//         token = localStorage.getItem("access_token");
//       }
//     }

//     const requestHeaders = {
//       "ngrok-skip-browser-warning": "true",
//       ...headers,
//     };
//     if (!removeToken && token) {
//       requestHeaders.Authorization = `Bearer ${token}`;
//     }
//     const requestObj = {
//       url: `${customUrl ? customUrl : BACKEND_URL}/${endpoint}`,
//       method,
//       params,
//       data,
//       headers: requestHeaders,
//     };
//     if (signal) {
//       requestObj.signal = signal;
//     }
//     const { data: res } = await axios.request(requestObj);
//     return { response: res };
//   } catch (error) {
//     // Handle 401 errors without redirecting
//     if (error?.response?.status === 401) {
//       // console.error("Unauthorized access - token may be expired or invalid");

//       if (typeof window !== "undefined") {
//         try {
//           localStorage.removeItem("access_token");
//           window.dispatchEvent(new Event("auth-changed"));
//         } catch {
//           // ignore storage/event errors
//         }
//       }
//     }
//     console.error(error, "backend endpoint error");
//     return { success: false, error: true, ...(error || {}) };
//   }
// };

import axios from "axios";
import { endpoints } from "./endpoint";

const BACKEND_URL = "https://kyper-stage.1st90.com";

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
    ...headers,
  };

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

      // 🔑 IMPORTANT: Do NOT throw on 401
      validateStatus: (status) => status < 500,

      ...(signal && { signal }),
    };

    const response = await axios.request(requestObj);

    // ✅ Handle 401 manually (EXPECTED auth case)
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("access_token");
          window.dispatchEvent(new Event("auth-changed"));
        } catch {
          // ignore storage/event issues
        }
      }

      return {
        success: false,
        unauthorized: true,
        status: 401,
      };
    }

    // ✅ Success response
    return {
      success: true,
      response: response.data,
      status: response.status,
    };
  } catch (error) {
    // 🚨 Only REAL errors reach here (network / 5xx / code issues)
    console.error("Unexpected API error:", error);

    return {
      success: false,
      error: true,
      message: error?.message || "Something went wrong",
    };
  }
};

