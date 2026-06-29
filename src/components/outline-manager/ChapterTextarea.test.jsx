import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import ChapterTextarea from "./ChapterTextarea";

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

vi.mock("@/lib/graphql-client", () => ({
  graphqlClient: {
    createSession: vi.fn(),
    autoSaveComet: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const getBackdrop = (container) =>
  container.querySelector(".spellcheck-backdrop");

describe("ChapterTextarea (outline manager) spell check", () => {
  it("renders the phase description field with the spell check overlay", () => {
    const { container } = render(<ChapterTextarea />);

    const textarea = container.querySelector("textarea");
    expect(textarea).toHaveAttribute("data-kyper-spellcheck-managed", "react");
    expect(textarea).toHaveAttribute("spellcheck", "false");

    expect(container.querySelector(".spellcheck-field")).toBeInTheDocument();
    expect(getBackdrop(container)).toBeInTheDocument();
  });

  it("underlines misspelled words typed into the phase description", async () => {
    const user = userEvent.setup();
    const { container } = render(<ChapterTextarea />);

    await user.type(
      container.querySelector("textarea"),
      "teh onboarding phase"
    );

    await waitFor(() => {
      const error = getBackdrop(container).querySelector(".kyper-spell-error");
      expect(error).not.toBeNull();
      expect(error).toHaveTextContent("teh");
    });
  });

  it("does not flag correctly spelled descriptions", async () => {
    const user = userEvent.setup();
    const { container } = render(<ChapterTextarea />);

    await user.type(container.querySelector("textarea"), "a new phase");

    await waitFor(() => {
      expect(getBackdrop(container)).toHaveTextContent("a new phase");
    });
    expect(
      getBackdrop(container).querySelector(".kyper-spell-error")
    ).toBeNull();
  });
});
