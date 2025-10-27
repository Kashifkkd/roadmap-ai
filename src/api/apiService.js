import axios from "axios";
import { endpoints } from "./endpoint";

const BACKEND_URL = "https://kyper-stage.1st90.com/api/auth/v1";

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
  try {
    let token = _token;
    if (!token && typeof window !== "undefined") {
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
    const requestHeaders = {
      "ngrok-skip-browser-warning": "true",
      ...headers,
    };
    if (!removeToken && token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
    const requestObj = {
      url: `${customUrl ? customUrl : BACKEND_URL}/${endpoint}`,
      method,
      params,
      data,
      headers: requestHeaders,
    };
    if (signal) {
      requestObj.signal = signal;
    }
    const { data: res } = await axios.request(requestObj);
    return { response: res };
  } catch (error) {
    if (error?.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    console.error(error, "backend endpoint error");
    return { success: false, error: true, ...(error || {}) };
  }
};
