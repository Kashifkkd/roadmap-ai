import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import ChatInput from "./ChatInput";

// Deterministic spell checker: only the words below are "misspelled".
vi.mock("@/lib/spellcheck/spellcheckService", () => {
  const MISSPELLED = new Set(["teh", "wrold", "speling"]);

  return {
    findMisspelledWords: async (text) => {
      const words = [];
      const regex = /[a-zA-Z']+/g;
      let match;
      while ((match = regex.exec(text ?? ""))) {
        if (MISSPELLED.has(match[0].toLowerCase())) {
          words.push({
            word: match[0],
            start: match.index,
            end: match.index + match[0].length,
          });
        }
      }
      return words;
    },
    getWordSuggestions: async () => ["the"],
  };
});

// Avoid pulling the real API/graphql clients into the test.
vi.mock("./chat-input/uploadAttachment", () => ({
  ACCEPT: ".pdf,.txt",
  FORMATS_TEXT: ".pdf, .txt",
  ALLOWED_EXTS: ["pdf", "txt"],
  isValidUrl: (s) => {
    try {
      new URL(s);
      return true;
    } catch {
      return false;
    }
  },
  ensureSessionId: vi.fn(async () => "session-1"),
  uploadFile: vi.fn(),
  uploadLink: vi.fn(),
  classifyFiles: vi.fn(() => ({
    supported: [],
    unsupported: [],
    duplicates: [],
  })),
}));

vi.mock("@/components/ui/toast", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

/**
 * ChatInput is controlled in the app (ChatWindow), and the parent clears the
 * value programmatically after a message is sent; mirror that here.
 */
function ControlledChatInput({ onSubmit, ...props }) {
  const [value, setValue] = useState("");
  return (
    <ChatInput
      value={value}
      onChange={setValue}
      onSubmit={(payload) => {
        onSubmit?.(payload);
        setValue("");
      }}
      {...props}
    />
  );
}

const getComposer = () => screen.getByPlaceholderText("Ask me anything");
const getBackdrop = (container) =>
  container.querySelector(".spellcheck-backdrop");

describe("ChatInput (copilot composer) spell check", () => {
  it("renders the composer with the spell check overlay enabled", () => {
    const { container } = render(<ControlledChatInput />);

    const textarea = getComposer();
    expect(textarea).toHaveAttribute("data-kyper-spellcheck-managed", "react");
    // Native spell check stays off; the overlay renders the underlines.
    expect(textarea).toHaveAttribute("spellcheck", "false");

    expect(container.querySelector(".spellcheck-field")).toBeInTheDocument();
    expect(getBackdrop(container)).toBeInTheDocument();
  });

  it("sizes the overlay wrapper to fill the composer", () => {
    const { container } = render(<ControlledChatInput />);

    const wrapper = container.querySelector(".spellcheck-field");
    expect(wrapper).toHaveClass("h-full");
    expect(wrapper).toHaveClass("rounded-xl");
    // The textarea must be transparent so the underline backdrop is visible.
    expect(getComposer()).not.toHaveClass("bg-background");
  });

  it("underlines a misspelled word typed into the composer", async () => {
    const user = userEvent.setup();
    const { container } = render(<ControlledChatInput />);

    await user.type(getComposer(), "fix teh button");

    await waitFor(() => {
      const error = getBackdrop(container).querySelector(".kyper-spell-error");
      expect(error).not.toBeNull();
      expect(error).toHaveTextContent("teh");
    });
  });

  it("does not underline correctly spelled text", async () => {
    const user = userEvent.setup();
    const { container } = render(<ControlledChatInput />);

    await user.type(getComposer(), "fix the button");

    await waitFor(() => {
      expect(getBackdrop(container)).toHaveTextContent("fix the button");
    });
    expect(
      getBackdrop(container).querySelector(".kyper-spell-error")
    ).toBeNull();
  });

  it("still submits on Enter with the overlay enabled", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ControlledChatInput onSubmit={onSubmit} />);

    await user.type(getComposer(), "hello there{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ text: "hello there" })
    );
  });

  it("does not submit empty messages", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ControlledChatInput onSubmit={onSubmit} />);

    await user.type(getComposer(), "{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps the underline when the caret is placed inside a misspelled word", async () => {
    const user = userEvent.setup();
    const { container } = render(<ControlledChatInput />);

    const composer = getComposer();
    await user.type(composer, "fix teh button");
    await waitFor(() => {
      expect(
        getBackdrop(container).querySelector(".kyper-spell-error")
      ).not.toBeNull();
    });

    // Simulate clicking into the middle of "teh": caret inside the word,
    // followed by the focus-driven re-check.
    composer.setSelectionRange(5, 5);
    fireEvent.blur(composer);
    fireEvent.focus(composer);

    // Wait past the 200ms debounce; the word the caret sits in must stay
    // underlined because the user is not typing it.
    await new Promise((resolve) => setTimeout(resolve, 400));
    const error = getBackdrop(container).querySelector(".kyper-spell-error");
    expect(error).not.toBeNull();
    expect(error).toHaveTextContent("teh");
  });

  it("clears stale underlines after the message is sent", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { container } = render(<ControlledChatInput onSubmit={onSubmit} />);

    await user.type(getComposer(), "fix teh button");
    await waitFor(() => {
      expect(
        getBackdrop(container).querySelector(".kyper-spell-error")
      ).not.toBeNull();
    });

    // Enter submits; the controlled value is cleared programmatically,
    // which does not fire an input event on the textarea.
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(getComposer()).toHaveValue("");

    await waitFor(() => {
      expect(
        getBackdrop(container).querySelector(".kyper-spell-error")
      ).toBeNull();
    });
  });

  it("keeps the composer editable while spell check runs", async () => {
    const user = userEvent.setup();
    render(<ControlledChatInput />);

    await user.type(getComposer(), "teh wrold");
    expect(getComposer()).toHaveValue("teh wrold");
  });
});
