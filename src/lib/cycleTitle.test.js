import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  getCycleDisplayTitle,
  installSessionDataChangeNotifier,
  readSessionDataFromStorage,
} from "./cycleTitle";

vi.mock("@/lib/graphql-client", () => ({
  graphqlClient: {
    autoSaveComet: vi.fn(),
  },
}));

const sessionDataFor = (title) =>
  JSON.stringify({
    cycle_creation_data: {
      "Basic Information": { "Cycle Title": title },
    },
  });

describe("getCycleDisplayTitle", () => {
  it("reads the cycle title from Basic Information", () => {
    expect(
      getCycleDisplayTitle(JSON.parse(sessionDataFor("My Cycle")))
    ).toBe("My Cycle");
  });

  it("falls back to Comet Title and cometTitle", () => {
    expect(
      getCycleDisplayTitle({
        cycle_creation_data: {
          "Basic Information": { "Comet Title": "Old Title" },
        },
      })
    ).toBe("Old Title");
    expect(getCycleDisplayTitle({ cometTitle: "Legacy" })).toBe("Legacy");
    expect(getCycleDisplayTitle({})).toBe("");
  });
});

describe("installSessionDataChangeNotifier", () => {
  beforeAll(() => {
    installSessionDataChangeNotifier();
  });

  const captureEvents = () => {
    const listener = vi.fn();
    window.addEventListener("sessionDataChanged", listener);
    return {
      listener,
      dispose: () =>
        window.removeEventListener("sessionDataChanged", listener),
    };
  };

  it("dispatches sessionDataChanged when sessionData is written directly", () => {
    const { listener, dispose } = captureEvents();

    localStorage.setItem("sessionData", sessionDataFor("Synced Title"));

    expect(listener).toHaveBeenCalledTimes(1);
    // The write itself still goes through.
    expect(readSessionDataFromStorage()).toMatchObject({
      cycle_creation_data: {
        "Basic Information": { "Cycle Title": "Synced Title" },
      },
    });
    dispose();
  });

  it("does not dispatch for unrelated keys", () => {
    const { listener, dispose } = captureEvents();

    localStorage.setItem("sessionId", "abc");
    localStorage.setItem("cometStatus", "draft");

    expect(listener).not.toHaveBeenCalled();
    dispose();
  });

  it("dispatches when sessionData is removed or storage is cleared", () => {
    const { listener, dispose } = captureEvents();

    localStorage.setItem("sessionData", sessionDataFor("X"));
    localStorage.removeItem("sessionData");
    localStorage.clear();

    expect(listener).toHaveBeenCalledTimes(3);
    dispose();
  });

  it("is idempotent: installing twice does not double-dispatch", () => {
    installSessionDataChangeNotifier();
    const { listener, dispose } = captureEvents();

    localStorage.setItem("sessionData", sessionDataFor("Once"));

    expect(listener).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("does not dispatch for sessionStorage writes", () => {
    const { listener, dispose } = captureEvents();

    sessionStorage.setItem("sessionData", sessionDataFor("Other store"));

    expect(listener).not.toHaveBeenCalled();
    dispose();
  });
});
