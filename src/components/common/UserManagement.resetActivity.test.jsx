import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserManagement from "./UserManagement";
import { getUserById } from "@/api/User/getUserById";
import { getUserInfo } from "@/api/cohort/getCohorts";
import { wipeClientUserActions } from "@/api/User/wipeClientUserActions";
import { toast } from "@/components/ui/toast";

vi.mock("@/api/User/getUserById", () => ({
  getUserById: vi.fn(async () => ({
    response: [
      {
        id: 42,
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@example.com",
        cohort_id: null,
        is_sso: false,
      },
    ],
  })),
}));

vi.mock("@/api/cohort/getCohortPaths", () => ({
  getCohortPaths: vi.fn(async () => ({ response: [] })),
  getClientPaths: vi.fn(async () => ({ response: [] })),
}));

vi.mock("@/api/cohort/getCohorts", () => ({
  getCohorts: vi.fn(async () => ({ response: [] })),
  getUserInfo: vi.fn(async () => ({
    response: {
      id: 42,
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      cohort_id: null,
      is_sso: false,
      paths: [],
    },
  })),
}));

vi.mock("@/api/User/registerClientUser", () => ({
  registerClientUser: vi.fn(),
}));

vi.mock("@/api/User/updateClientUser", () => ({
  updateClientUser: vi.fn(),
}));

vi.mock("@/api/User/deleteClientUser", () => ({
  deleteClientUser: vi.fn(),
}));

vi.mock("@/api/User/wipeClientUserActions", () => ({
  wipeClientUserActions: vi.fn(async () => ({ success: true })),
}));

vi.mock("@/api/comet/getPathUsers", () => ({
  getPathUsers: vi.fn(async () => ({ response: { users: [] } })),
}));

vi.mock("@/api/comet/getPathById", () => ({
  getPathById: vi.fn(),
}));

vi.mock("@/api/comet/assignPathUsers", () => ({
  assignPathUsers: vi.fn(),
}));

vi.mock("@/api/bulkUploadUsers", () => ({
  bulkUploadUsers: vi.fn(),
}));

vi.mock("@/api/cohort/createCohort", () => ({
  createCohort: vi.fn(),
}));

vi.mock("@/api/cohort/updateCohort", () => ({
  updateCohort: vi.fn(),
}));

vi.mock("@/api/cohort/updateCohortPaths", () => ({
  updateCohortPaths: vi.fn(),
}));

vi.mock("@/api/cohort/deleteCohort", () => ({
  deleteCohort: vi.fn(),
}));

vi.mock("@/components/ui/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("./BulkUploadDialog", () => ({
  default: () => null,
}));

vi.mock("@/lib/spellcheck/spellcheckService", () => ({
  findMisspelledWords: vi.fn(async () => []),
  getWordSuggestions: vi.fn(async () => []),
  preloadSpellChecker: vi.fn(),
  onSpellCheckerReady: (listener) => {
    listener();
    return () => {};
  },
}));

describe("UserManagement reset user activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const openEditUserForm = async (user) => {
    render(
      <UserManagement clientId="client-1" open isActive usePathUsers={false} />,
    );

    await waitFor(() => {
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });

    const row = screen.getByText("jane@example.com").closest("tr");
    const menuButton = row.querySelector('button[aria-haspopup="menu"]');
    expect(menuButton).toBeTruthy();
    await user.click(menuButton);
    await user.click(screen.getByRole("menuitem", { name: /^edit$/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Edit User", { selector: "h2" }),
      ).toBeInTheDocument();
    });
  };

  const openResetActivityConfirm = async (user) => {
    await openEditUserForm(user);
    await user.click(
      screen.getByRole("button", { name: /reset user's activity/i }),
    );
    const dialog = await screen.findByRole("dialog");
    return dialog;
  };

  it("shows a confirmation modal when Reset User's Activity is clicked", async () => {
    const user = userEvent.setup();
    const dialog = await openResetActivityConfirm(user);

    expect(
      within(dialog).getByRole("heading", { name: /are you sure\?/i }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        /this will delete this user's path progress and all in-app activity\./i,
      ),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: /^cancel$/i }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: /^confirm$/i }),
    ).toBeInTheDocument();
  });

  it("does not reset activity when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const dialog = await openResetActivityConfirm(user);

    await user.click(within(dialog).getByRole("button", { name: /^cancel$/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(wipeClientUserActions).not.toHaveBeenCalled();
  });

  it("resets user activity when Confirm is clicked", async () => {
    const user = userEvent.setup();
    const dialog = await openResetActivityConfirm(user);

    await user.click(within(dialog).getByRole("button", { name: /^confirm$/i }));

    await waitFor(() => {
      expect(wipeClientUserActions).toHaveBeenCalledWith(42);
    });
    expect(toast.success).toHaveBeenCalledWith(
      "User's activities are resetted successfully",
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
