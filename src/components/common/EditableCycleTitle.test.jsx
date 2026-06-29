import { act, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import EditableCycleTitle from "./EditableCycleTitle";
import { installSessionDataChangeNotifier } from "@/lib/cycleTitle";

vi.mock("@/lib/graphql-client", () => ({
  graphqlClient: {
    autoSaveComet: vi.fn(),
  },
}));

vi.mock("@/components/ui/toast", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

beforeAll(() => {
  // Installed by the root layout in the app; required for same-tab sync.
  installSessionDataChangeNotifier();
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const sessionDataFor = (title) =>
  JSON.stringify({
    cycle_creation_data: {
      "Basic Information": { "Cycle Title": title },
    },
  });

describe("EditableCycleTitle session sync", () => {
  it("shows the cycle title from sessionData on mount", () => {
    localStorage.setItem("sessionData", sessionDataFor("Initial Cycle"));

    render(<EditableCycleTitle />);

    expect(
      screen.getByRole("heading", { name: "Initial Cycle" })
    ).toBeInTheDocument();
  });

  it("falls back to Untitled Cycle without session data", () => {
    render(<EditableCycleTitle />);

    expect(
      screen.getByRole("heading", { name: "Untitled Cycle" })
    ).toBeInTheDocument();
  });

  it("updates when sessionData is written directly to localStorage", () => {
    localStorage.setItem("sessionData", sessionDataFor("Before"));
    render(<EditableCycleTitle />);
    expect(
      screen.getByRole("heading", { name: "Before" })
    ).toBeInTheDocument();

    // Regression: many call sites write sessionData directly without
    // dispatching events; the header title must still pick it up.
    act(() => {
      localStorage.setItem("sessionData", sessionDataFor("After"));
    });

    expect(screen.getByRole("heading", { name: "After" })).toBeInTheDocument();
  });

  it("resets when the session is cleared", () => {
    localStorage.setItem("sessionData", sessionDataFor("Some Cycle"));
    render(<EditableCycleTitle />);

    act(() => {
      localStorage.removeItem("sessionData");
    });

    expect(
      screen.getByRole("heading", { name: "Untitled Cycle" })
    ).toBeInTheDocument();
  });
});
