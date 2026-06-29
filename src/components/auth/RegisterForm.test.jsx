import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "./RegisterForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/api/register", () => ({
  registerUser: vi.fn(),
}));

vi.mock("@/lib/spellcheck/spellcheckService", () => ({
  findMisspelledWords: vi.fn(async () => []),
  getWordSuggestions: vi.fn(async () => []),
  preloadSpellChecker: vi.fn(),
}));

describe("RegisterForm password visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getPasswordInput = () => screen.getByLabelText(/^Password \*$/i);
  const getConfirmPasswordInput = () =>
    screen.getByLabelText(/^Confirm Password \*$/i);

  const getPasswordToggle = () => {
    const input = getPasswordInput();
    return input.parentElement.querySelector('button[type="button"]');
  };

  const getConfirmPasswordToggle = () => {
    const input = getConfirmPasswordInput();
    return input.parentElement.querySelector('button[type="button"]');
  };

  it("renders password fields masked by default with spell check disabled", () => {
    render(<RegisterForm />);

    expect(getPasswordInput()).toHaveAttribute("type", "password");
    expect(getPasswordInput()).toHaveAttribute("spellcheck", "false");
    expect(getConfirmPasswordInput()).toHaveAttribute("type", "password");
    expect(getConfirmPasswordInput()).toHaveAttribute("spellcheck", "false");
  });

  it("toggles the password field between hidden and visible", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = getPasswordInput();
    const passwordToggle = getPasswordToggle();

    await user.type(passwordInput, "Secret123");
    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(passwordToggle);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(passwordInput).toHaveValue("Secret123");

    await user.click(passwordToggle);
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveValue("Secret123");
  });

  it("toggles the confirm password field independently", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = getPasswordInput();
    const confirmInput = getConfirmPasswordInput();
    const confirmToggle = getConfirmPasswordToggle();

    await user.type(passwordInput, "Secret123");
    await user.type(confirmInput, "Secret456");

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("type", "password");

    await user.click(confirmToggle);
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("type", "text");
    expect(confirmInput).toHaveValue("Secret456");

    await user.click(confirmToggle);
    expect(confirmInput).toHaveAttribute("type", "password");
  });
});
