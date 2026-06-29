import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserManagement from "./UserManagement";
import { getUserById } from "@/api/User/getUserById";
import { getUserInfo } from "@/api/cohort/getCohorts";
import { updateClientUser } from "@/api/User/updateClientUser";
import { toast } from "@/components/ui/toast";
import {
  confirmPasswordLabel,
  getPasswordFieldByLabel,
  passwordLabel,
} from "@/test/passwordVisibilityHelpers";

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
  updateClientUser: vi.fn(async () => ({ success: true })),
}));

vi.mock("@/api/User/deleteClientUser", () => ({
  deleteClientUser: vi.fn(),
}));

vi.mock("@/api/User/wipeClientUserActions", () => ({
  wipeClientUserActions: vi.fn(),
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
}));

describe("UserManagement edit user password reset", () => {
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
      expect(screen.getByText("Edit User", { selector: "h2" })).toBeInTheDocument();
    });
  };

  it("shows password and confirm password fields on the edit user screen", async () => {
    const user = userEvent.setup();
    await openEditUserForm(user);

    expect(getPasswordFieldByLabel(passwordLabel).input).toBeInTheDocument();
    expect(getPasswordFieldByLabel(confirmPasswordLabel).input).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Leave blank to keep current"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirm new password"),
    ).toBeInTheDocument();
  });

  it("shows an inline error when passwords do not match on edit", async () => {
    const user = userEvent.setup();
    await openEditUserForm(user);

    const passwordField = getPasswordFieldByLabel(passwordLabel);
    const confirmField = getPasswordFieldByLabel(confirmPasswordLabel);

    await user.type(passwordField.input, "newpassword123");
    await user.type(confirmField.input, "different123");
    await user.click(screen.getByRole("button", { name: /update user/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(updateClientUser).not.toHaveBeenCalled();
  });

  it("shows an inline error when password is shorter than 8 characters on edit", async () => {
    const user = userEvent.setup();
    await openEditUserForm(user);

    const passwordField = getPasswordFieldByLabel(passwordLabel);
    const confirmField = getPasswordFieldByLabel(confirmPasswordLabel);

    await user.type(passwordField.input, "short1");
    await user.type(confirmField.input, "short1");
    await user.click(screen.getByRole("button", { name: /update user/i }));

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
    expect(updateClientUser).not.toHaveBeenCalled();
  });

  it("updates the user password without requiring the current password", async () => {
    const user = userEvent.setup();
    await openEditUserForm(user);

    const passwordField = getPasswordFieldByLabel(passwordLabel);
    const confirmField = getPasswordFieldByLabel(confirmPasswordLabel);

    await user.type(passwordField.input, "newpassword123");
    await user.type(confirmField.input, "newpassword123");
    await user.click(screen.getByRole("button", { name: /update user/i }));

    await waitFor(() => {
      expect(updateClientUser).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          password: "newpassword123",
          email: "jane@example.com",
        }),
      );
    });
    expect(toast.success).toHaveBeenCalledWith("User updated successfully");
  });
});
