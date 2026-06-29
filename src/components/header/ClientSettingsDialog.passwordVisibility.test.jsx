import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientSettingsDialog from "./ClientSettingsDialog";
import {
  confirmPasswordLabel,
  expectPasswordToggleWorks,
  getPasswordFieldByLabel,
  passwordLabel,
} from "@/test/passwordVisibilityHelpers";

vi.mock("@/api/client", () => ({
  getClientDetails: vi.fn(async () => ({
    response: { id: 1, name: "Acme", enabled: true, is_kyper_enabled: true },
  })),
  getClients: vi.fn(async () => ({
    response: [{ id: 1, name: "Acme", enabled: true, is_kyper_enabled: true }],
  })),
  updateClientDetails: vi.fn(),
}));

vi.mock("@/api/User/getCreatorsByClientId", () => ({
  getCreatorsByClientId: vi.fn(async () => ({
    response: [
      {
        id: 42,
        user_id: 42,
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@example.com",
        role: "creator",
        enabled: true,
      },
    ],
  })),
}));

vi.mock("@/api/User/getCreatorDetails", () => ({
  getCreatorDetails: vi.fn(async () => ({
    response: {
      id: 42,
      user_id: 42,
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      role: "creator",
      client_id: 1,
    },
  })),
}));

vi.mock("@/api/User/updateCreator", () => ({
  updateCreator: vi.fn(),
}));

vi.mock("@/api/register", () => ({
  registerUser: vi.fn(),
}));

vi.mock("@/api/User/uploadProfile", () => ({
  uploadProfile: vi.fn(),
}));

vi.mock("@/hooks/useQueryData", () => ({
  useRefreshData: () => ({ refreshClients: vi.fn() }),
  useUpsertClient: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/components/common/ClientFormFields", () => ({
  default: () => <div>Client form fields</div>,
}));

vi.mock("@/components/common/UserManagement", () => ({
  default: () => <div>User Management</div>,
}));

vi.mock("@/components/ui/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/spellcheck/spellcheckService", () => ({
  findMisspelledWords: vi.fn(async () => []),
  getWordSuggestions: vi.fn(async () => []),
  preloadSpellChecker: vi.fn(),
}));

const selectedClient = { id: 1, name: "Acme" };

describe("ClientSettingsDialog creator password visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const openCreatorsTab = async (user) => {
    render(
      <ClientSettingsDialog
        open
        onOpenChange={vi.fn()}
        selectedClient={selectedClient}
      />,
    );

    await user.click(screen.getByRole("button", { name: /creators/i }));
  };

  const openAddCreatorForm = async (user) => {
    await openCreatorsTab(user);
    await user.click(screen.getByRole("button", { name: /add creator/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Add Creator", { selector: "h2" }),
      ).toBeInTheDocument();
    });
  };

  const openEditCreatorForm = async (user) => {
    await openCreatorsTab(user);

    await waitFor(() => {
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });

    const actionMenus = screen.getAllByRole("button");
    const moreActionsButton = actionMenus.find((button) =>
      button.querySelector(".lucide-ellipsis"),
    );
    expect(moreActionsButton).toBeTruthy();
    await user.click(moreActionsButton);

    await user.click(screen.getByRole("menuitem", { name: /edit/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Edit Creator", { selector: "h2" }),
      ).toBeInTheDocument();
    });
  };

  it("masks add-creator password fields by default", async () => {
    const user = userEvent.setup();
    await openAddCreatorForm(user);

    const passwordField = getPasswordFieldByLabel(passwordLabel);
    const confirmField = getPasswordFieldByLabel(confirmPasswordLabel);

    expect(passwordField.input).toHaveAttribute("type", "password");
    expect(passwordField.input).toHaveAttribute("spellcheck", "false");
    expect(confirmField.input).toHaveAttribute("type", "password");
    expect(confirmField.input).toHaveAttribute("spellcheck", "false");
  });

  it("toggles add-creator password visibility independently", async () => {
    const user = userEvent.setup();
    await openAddCreatorForm(user);

    const passwordField = getPasswordFieldByLabel(passwordLabel);
    const confirmField = getPasswordFieldByLabel(confirmPasswordLabel);

    await expectPasswordToggleWorks(user, passwordField, "CreatorPass1");

    await user.type(confirmField.input, "CreatorPass1");
    await user.click(confirmField.toggle);
    expect(confirmField.input).toHaveAttribute("type", "text");
    expect(passwordField.input).toHaveAttribute("type", "password");
  });

  it("masks edit-creator password fields by default", async () => {
    const user = userEvent.setup();
    await openEditCreatorForm(user);

    const passwordField = getPasswordFieldByLabel(passwordLabel);
    const confirmField = getPasswordFieldByLabel(confirmPasswordLabel);

    expect(passwordField.input).toHaveAttribute("type", "password");
    expect(confirmField.input).toHaveAttribute("type", "password");
    expect(passwordField.input).toHaveAttribute(
      "placeholder",
      "Leave blank to keep current",
    );
  });

  it("toggles edit-creator password visibility independently", async () => {
    const user = userEvent.setup();
    await openEditCreatorForm(user);

    const passwordField = getPasswordFieldByLabel(passwordLabel);
    const confirmField = getPasswordFieldByLabel(confirmPasswordLabel);

    await expectPasswordToggleWorks(user, passwordField, "NewPass99");

    await user.type(confirmField.input, "NewPass99");
    await user.click(confirmField.toggle);
    expect(confirmField.input).toHaveAttribute("type", "text");
    expect(passwordField.input).toHaveAttribute("type", "password");
  });
});
