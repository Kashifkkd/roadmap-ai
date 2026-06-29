import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CometSettingsDialog from "./CometSettingsDialog";

vi.mock("@/lib/graphql-client", () => ({
  graphqlClient: {
    request: vi.fn(),
  },
}));

vi.mock("@/lib/cycleTitle", () => ({
  writeSessionDataToStorage: vi.fn(),
}));

vi.mock("@/api/uploadAssets", () => ({
  uploadAssetFile: vi.fn(),
}));

vi.mock("@/api/uploadPathImage", () => ({
  uploadPathImage: vi.fn(),
}));

vi.mock("@/api/publishComet", () => ({
  publishComet: vi.fn(),
}));

vi.mock("@/components/ui/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/common/UserManagement", () => ({
  default: () => <div>User Management</div>,
}));

vi.mock("@/components/cycle-manager/PathEmailSettingsPanel", () => ({
  default: () => <div>Path Email Settings</div>,
}));

vi.mock("@/components/cycle-manager/forms/FormFields", () => ({
  RichTextArea: ({ label }) => (
    <textarea aria-label={label} data-testid={`rich-text-${label}`} />
  ),
}));

const seedSessionStorage = () => {
  localStorage.setItem("cometStatus", "draft");
  localStorage.setItem(
    "sessionData",
    JSON.stringify({
      session_id: "test-session",
      cycle_creation_data: {
        "Basic Information": {
          "Cycle Title": "Test Cycle",
          Description: "Test description",
        },
      },
      response_path: {
        id: 1,
        enabled_attributes: {},
        notification_settings: {
          send_via_email: [],
          send_via_push: [],
        },
      },
    }),
  );
};

describe("CometSettingsDialog ad hoc notifications", () => {
  let scrollIntoViewMock;
  let rafQueue;

  beforeEach(() => {
    seedSessionStorage();
    scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    rafQueue = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      rafQueue.push(callback);
      return rafQueue.length;
    });
  });

  const flushAnimationFrames = (count = 2) => {
    for (let i = 0; i < count; i += 1) {
      const callbacks = [...rafQueue];
      rafQueue = [];
      callbacks.forEach((callback) => callback(0));
    }
  };

  const openNotificationTab = async (user) => {
    await user.click(screen.getByRole("button", { name: /notification/i }));
  };

  it("shows the notification type dropdown when creating an ad hoc notification", async () => {
    const user = userEvent.setup();

    render(<CometSettingsDialog open onOpenChange={vi.fn()} />);
    await openNotificationTab(user);

    expect(screen.queryByText("Notification Type")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /create ad hoc notification/i }),
    );

    expect(screen.getByText("Notification Type")).toBeInTheDocument();
    expect(screen.getByText("Select type")).toBeInTheDocument();
  });

  it("smoothly scrolls to the ad hoc draft panel after opening it", async () => {
    const user = userEvent.setup();

    render(<CometSettingsDialog open onOpenChange={vi.fn()} />);
    await openNotificationTab(user);

    await user.click(
      screen.getByRole("button", { name: /create ad hoc notification/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Notification Type")).toBeInTheDocument();
    });

    flushAnimationFrames(2);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });
});
