import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CycleCreationBreadcrumb from "./CycleCreationBreadcrumb";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("CycleCreationBreadcrumb", () => {
  it("highlights the active step and disables future steps without session data", () => {
    render(<CycleCreationBreadcrumb activeStep="configure" />);

    expect(screen.getByText("Configure Cycle")).toHaveAttribute(
      "aria-current",
      "step"
    );

    expect(
      screen.queryByRole("link", { name: "Outline Manager" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Cycle Manager" })
    ).not.toBeInTheDocument();

    expect(screen.getByText("Outline Manager")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.getByText("Cycle Manager")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("enables outline manager when outline exists", () => {
    render(
      <CycleCreationBreadcrumb
        activeStep="configure"
        sessionData={{ response_outline: [{ title: "Phase 1" }] }}
      />
    );

    expect(screen.getByRole("link", { name: "Outline Manager" })).toHaveAttribute(
      "href",
      "/outline-manager"
    );
    expect(
      screen.queryByRole("link", { name: "Cycle Manager" })
    ).not.toBeInTheDocument();
  });

  it("styles completed steps as gray links on later pages", () => {
    render(
      <CycleCreationBreadcrumb
        activeStep="outline"
        sessionData={{ response_outline: [{ title: "Phase 1" }] }}
      />
    );

    expect(screen.getByText("Outline Manager")).toHaveAttribute(
      "aria-current",
      "step"
    );

    expect(screen.getByRole("link", { name: "Configure Cycle" })).toHaveClass(
      "text-gray-500"
    );
    expect(screen.getByText("Cycle Manager")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("links completed steps in gray on the cycle manager step", () => {
    render(
      <CycleCreationBreadcrumb
        activeStep="cycle"
        sessionData={{
          response_outline: [{ title: "Phase 1" }],
          response_path: { chapters: [{ title: "Phase 1" }] },
        }}
      />
    );

    expect(screen.getByText("Cycle Manager")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(screen.getByRole("link", { name: "Configure Cycle" })).toHaveClass(
      "text-gray-500"
    );
    expect(screen.getByRole("link", { name: "Outline Manager" })).toHaveClass(
      "text-gray-500"
    );
  });

  it("shows pointer cursor only on navigable steps", () => {
    render(
      <CycleCreationBreadcrumb
        activeStep="configure"
        sessionData={{ response_outline: [{ title: "Phase 1" }] }}
      />
    );

    expect(screen.getByRole("link", { name: "Outline Manager" })).toHaveClass(
      "cursor-pointer"
    );
    expect(screen.getByText("Cycle Manager")).toHaveClass("cursor-default");
  });
});
