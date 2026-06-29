// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// Provide minimal browser globals that apiService reads/writes.
// We use the node environment to avoid jsdom's ESM/CJS conflicts.
const storage = {};
const localStorageMock = {
  getItem: (k) => storage[k] ?? null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

// apiService uses module-level state (sessionExpiredToastShown). We reset the
// module cache before every test so each test gets a clean initial state.
describe("apiService – session-expired toast behavior", () => {
  let apiService;
  let suppressNextSessionExpiredToast;
  let mockAxiosRequest;
  let mockToastError;

  beforeEach(async () => {
    vi.resetModules();
    localStorageMock.clear();

    mockAxiosRequest = vi.fn();
    mockToastError = vi.fn();

    // Provide window / localStorage globals used by apiService.
    globalThis.window = {
      dispatchEvent: vi.fn(),
      __PRELOADED_STATE__: undefined,
      store: undefined,
    };
    globalThis.localStorage = localStorageMock;

    vi.doMock("axios", () => ({ default: { request: mockAxiosRequest } }));
    vi.doMock("@/components/ui/toast", () => ({
      toast: { error: mockToastError },
    }));
    // endpoint constants are imported but unused inside the function body
    vi.doMock("@/api/endpoint", () => ({ endpoints: {} }));

    const mod = await import("./apiService");
    apiService = mod.apiService;
    suppressNextSessionExpiredToast = mod.suppressNextSessionExpiredToast;
  });

  // ─── suppressNextSessionExpiredToast export ──────────────────────────────

  it("exports suppressNextSessionExpiredToast as a function", () => {
    expect(typeof suppressNextSessionExpiredToast).toBe("function");
  });

  it("calling it before a 401 prevents the session-expired toast", async () => {
    localStorage.setItem("access_token", "tok");
    mockAxiosRequest.mockResolvedValue({ status: 401, data: {} });

    suppressNextSessionExpiredToast();
    await apiService({ endpoint: "api/anything" });

    expect(mockToastError).not.toHaveBeenCalled();
  });

  // ─── Login failure: removeToken:true → 401 is wrong credentials, not expiry ─

  it("does NOT show toast when login endpoint returns 401 (removeToken:true)", async () => {
    mockAxiosRequest.mockResolvedValue({ status: 401, data: { detail: "Bad credentials" } });

    await apiService({ endpoint: "api/auth/v1/login", removeToken: true });

    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("does NOT dispatch auth-changed when login endpoint returns 401", async () => {
    mockAxiosRequest.mockResolvedValue({ status: 401, data: {} });

    await apiService({ endpoint: "api/auth/v1/login", removeToken: true });

    expect(globalThis.window.dispatchEvent).not.toHaveBeenCalled();
  });

  it("returns the standard unauthorized shape for a login 401", async () => {
    const payload = { detail: "Invalid credentials" };
    mockAxiosRequest.mockResolvedValue({ status: 401, data: payload });

    const result = await apiService({ endpoint: "api/auth/v1/login", removeToken: true });

    expect(result).toEqual({
      success: false,
      unauthorized: true,
      status: 401,
      response: payload,
    });
  });

  // ─── Authenticated request: valid token → 401 is a real session expiry ────

  it("shows session-expired toast with stable id when authenticated request gets 401", async () => {
    localStorage.setItem("access_token", "tok");
    mockAxiosRequest.mockResolvedValue({ status: 401, data: {} });

    await apiService({ endpoint: "api/clients/v1/recent" });

    expect(mockToastError).toHaveBeenCalledWith(
      "Session expired. Please login again.",
      { id: "session-expired", duration: 3000 }
    );
  });

  it("dispatches auth-changed when a token is present and 401 is returned", async () => {
    localStorage.setItem("access_token", "tok");
    mockAxiosRequest.mockResolvedValue({ status: 401, data: {} });

    await apiService({ endpoint: "api/clients/v1/recent" });

    const calls = window.dispatchEvent.mock.calls;
    expect(calls.length).toBe(1);
    expect(calls[0][0].type).toBe("auth-changed");
  });

  it("removes access_token from localStorage when authenticated 401 arrives", async () => {
    localStorage.setItem("access_token", "tok");
    localStorage.setItem("refresh_token", "refresh");
    localStorage.setItem("user_name", "Jane Doe");
    mockAxiosRequest.mockResolvedValue({ status: 401, data: {} });

    await apiService({ endpoint: "api/clients/v1/recent" });

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(localStorage.getItem("user_name")).toBeNull();
  });

  // ─── tokenWasPresent guard: auth-changed fires only once ─────────────────

  it("does NOT dispatch auth-changed when token is already gone (retry scenario)", async () => {
    // No token in localStorage — simulates a React Query retry after the first
    // 401 already removed it.
    mockAxiosRequest.mockResolvedValue({ status: 401, data: {} });

    await apiService({ endpoint: "api/clients/v1/recent" });

    expect(globalThis.window.dispatchEvent).not.toHaveBeenCalled();
  });

  it("dispatches auth-changed exactly once across sequential 401s", async () => {
    localStorage.setItem("access_token", "tok");
    mockAxiosRequest.mockResolvedValue({ status: 401, data: {} });

    // First call removes the token and fires auth-changed.
    await apiService({ endpoint: "api/clients/v1/recent" });
    // Second call: token is gone → no auth-changed.
    await apiService({ endpoint: "api/clients/v1/recent" });

    expect(globalThis.window.dispatchEvent).toHaveBeenCalledTimes(1);
  });

  // ─── Flag dedup: only one toast for concurrent 401s ──────────────────────

  it("shows exactly one toast when multiple concurrent requests all return 401", async () => {
    localStorage.setItem("access_token", "tok");
    mockAxiosRequest.mockResolvedValue({ status: 401, data: {} });

    await Promise.all([
      apiService({ endpoint: "api/req-1" }),
      apiService({ endpoint: "api/req-2" }),
      apiService({ endpoint: "api/req-3" }),
    ]);

    expect(mockToastError).toHaveBeenCalledTimes(1);
  });

  // ─── Flag reset on successful 2xx response ────────────────────────────────

  it("allows the session-expired toast to fire again after a successful re-login request", async () => {
    localStorage.setItem("access_token", "tok");
    mockAxiosRequest.mockResolvedValue({ status: 401, data: {} });

    // First 401 shows toast and sets the flag.
    await apiService({ endpoint: "api/req-1" });
    expect(mockToastError).toHaveBeenCalledTimes(1);

    // Simulate re-login: new token stored.
    localStorage.setItem("access_token", "new-tok");

    // Successful 2xx with the new token → flag resets.
    mockAxiosRequest.mockResolvedValue({ status: 200, data: { ok: true } });
    await apiService({ endpoint: "api/req-2" });

    // Now a fresh 401 should show the toast again.
    localStorage.setItem("access_token", "new-tok");
    mockAxiosRequest.mockResolvedValue({ status: 401, data: {} });
    await apiService({ endpoint: "api/req-3" });

    expect(mockToastError).toHaveBeenCalledTimes(2);
  });

  it("does NOT reset the flag on a successful unauthenticated request", async () => {
    localStorage.setItem("access_token", "tok");
    mockAxiosRequest.mockResolvedValue({ status: 401, data: {} });

    // 401 sets the flag.
    await apiService({ endpoint: "api/req-1" });
    expect(mockToastError).toHaveBeenCalledTimes(1);

    // Unauthenticated success (removeToken:true) should NOT reset the flag.
    mockAxiosRequest.mockResolvedValue({ status: 200, data: {} });
    await apiService({ endpoint: "api/auth/v1/refresh", removeToken: true });

    // A new 401 on an unauthenticated request should still produce no toast.
    mockAxiosRequest.mockResolvedValue({ status: 401, data: {} });
    await apiService({ endpoint: "api/auth/v1/refresh", removeToken: true });

    expect(mockToastError).toHaveBeenCalledTimes(1);
  });

  // ─── 2xx / error response shapes ─────────────────────────────────────────

  it("returns success:true with response data on 200", async () => {
    mockAxiosRequest.mockResolvedValue({ status: 200, data: { id: 42 } });

    const result = await apiService({ endpoint: "api/anything", removeToken: true });

    expect(result).toEqual({ success: true, response: { id: 42 }, status: 200 });
  });

  it("returns success:false (not unauthorized) for a 404", async () => {
    mockAxiosRequest.mockResolvedValue({ status: 404, data: { detail: "Not found" } });

    const result = await apiService({ endpoint: "api/anything", removeToken: true });

    expect(result.success).toBe(false);
    expect(result.unauthorized).toBeUndefined();
  });

  it("returns error:true when axios throws a network error", async () => {
    mockAxiosRequest.mockRejectedValue(new Error("Network Error"));

    const result = await apiService({ endpoint: "api/anything" });

    expect(result).toEqual({
      success: false,
      error: true,
      message: "Network Error",
    });
  });
});
