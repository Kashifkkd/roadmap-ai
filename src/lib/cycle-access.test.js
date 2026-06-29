// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = {};
const localStorageMock = {
  getItem: (k) => storage[k] ?? null,
  setItem: (k, v) => {
    storage[k] = String(v);
  },
  removeItem: (k) => {
    delete storage[k];
  },
  clear: () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  },
};

describe("cycle-access", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorageMock.clear();
    globalThis.window = { dispatchEvent: vi.fn() };
    globalThis.localStorage = localStorageMock;
    globalThis.fetch = vi.fn();
  });

  it("blocks fetchCycleSessionDetails when no token is stored", async () => {
    const { fetchCycleSessionDetails } = await import("./cycle-access");

    const result = await fetchCycleSessionDetails("session-1");

    expect(result.ok).toBe(false);
    expect(result.unauthorized).toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(localStorageMock.getItem("access_token")).toBeNull();
  });

  it("clears auth and blocks navigation when /users/me returns 401", async () => {
    localStorageMock.setItem("access_token", "stale-token");
    globalThis.fetch.mockResolvedValueOnce({ status: 401, ok: false });

    const { fetchCycleSessionDetails } = await import("./cycle-access");

    const result = await fetchCycleSessionDetails("session-1");

    expect(result.ok).toBe(false);
    expect(result.unauthorized).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(localStorageMock.getItem("access_token")).toBeNull();
    expect(globalThis.window.dispatchEvent).toHaveBeenCalled();
  });
});
