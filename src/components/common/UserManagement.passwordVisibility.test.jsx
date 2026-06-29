import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserManagement from "./UserManagement";
import {
  confirmPasswordLabel,
  expectPasswordToggleWorks,
  getPasswordFieldByLabel,
  passwordLabel,
} from "@/test/passwordVisibilityHelpers";

vi.mock("@/api/User/getUserById", () => ({
  getUserById: vi.fn(async () => ({ response: [] })),
}));

vi.mock("@/api/cohort/getCohortPaths", () => ({
  getCohortPaths: vi.fn(async () => ({ response: [] })),
  getClientPaths: vi.fn(async () => ({ response: [] })),
}));

vi.mock("@/api/cohort/getCohorts", () => ({
  getCohorts: vi.fn(async () => ({ response: [] })),
  getUserInfo: vi.fn(async () => ({ response: [] })),
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

describe("UserManagement add user password visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const openAddUserForm = async (user) => {
    render(
      <UserManagement clientId="client-1" open isActive usePathUsers={false} />,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /add user/i })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: /add user/i }));

    await waitFor(() => {
      expect(screen.getByText("Add User", { selector: "h2" })).toBeInTheDocument();
    });
  };

  it("shows password and confirm password fields masked in the add user form", async () => {
    const user = userEvent.setup();
    await openAddUserForm(user);

    const passwordField = getPasswordFieldByLabel(passwordLabel);
    const confirmField = getPasswordFieldByLabel(confirmPasswordLabel);

    expect(passwordField.input).toHaveAttribute("type", "password");
    expect(passwordField.input).toHaveAttribute("spellcheck", "false");
    expect(confirmField.input).toHaveAttribute("type", "password");
    expect(confirmField.input).toHaveAttribute("spellcheck", "false");
  });

  it("toggles password visibility independently for both fields", async () => {
    const user = userEvent.setup();
    await openAddUserForm(user);

    const passwordField = getPasswordFieldByLabel(passwordLabel);
    const confirmField = getPasswordFieldByLabel(confirmPasswordLabel);

    await expectPasswordToggleWorks(user, passwordField, "Password123");

    await user.type(confirmField.input, "Password123");
    expect(confirmField.input).toHaveAttribute("type", "password");

    await user.click(confirmField.toggle);
    expect(confirmField.input).toHaveAttribute("type", "text");
    expect(passwordField.input).toHaveAttribute("type", "password");
  });
});
