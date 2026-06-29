import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Textarea } from "./Textarea";

// Deterministic spell checker: only the words below are "misspelled".
vi.mock("@/lib/spellcheck/spellcheckService", () => {
  const MISSPELLED = new Set(["teh", "wrold", "speling", "assxsessment", "currexntly"]);

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
    onSpellCheckerReady: (listener) => {
      listener();
      return () => {};
    },
  };
});

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const getBackdrop = (container) =>
  container.querySelector(".spellcheck-backdrop");

describe("Textarea spell check", () => {
  it("enables the custom spell check overlay by default", () => {
    const { container } = render(<Textarea />);

    const textarea = container.querySelector("textarea");
    expect(textarea).toBeInTheDocument();
    // Native browser spell check is off; the overlay handles it instead.
    expect(textarea).toHaveAttribute("spellcheck", "false");
    expect(textarea).toHaveAttribute("data-kyper-spellcheck-managed", "react");

    expect(container.querySelector(".spellcheck-field")).toBeInTheDocument();
    expect(getBackdrop(container)).toBeInTheDocument();
  });

  it("renders a bare textarea without overlay when spellCheck is false", () => {
    const { container } = render(<Textarea spellCheck={false} />);

    expect(container.querySelector("textarea")).toBeInTheDocument();
    expect(container.querySelector(".spellcheck-field")).not.toBeInTheDocument();
    expect(getBackdrop(container)).not.toBeInTheDocument();
  });

  it("applies wrapperClassName to the overlay wrapper", () => {
    const { container } = render(
      <Textarea wrapperClassName="h-full rounded-xl" />
    );

    const wrapper = container.querySelector(".spellcheck-field");
    expect(wrapper).toHaveClass("h-full");
    expect(wrapper).toHaveClass("rounded-xl");
  });

  it("keeps the textarea transparent so the overlay shows through", () => {
    const { container } = render(<Textarea />);

    expect(container.querySelector("textarea")).toHaveClass("bg-transparent");
  });

  it("underlines misspelled words in the backdrop", async () => {
    const user = userEvent.setup();
    const { container } = render(<Textarea />);

    await user.type(container.querySelector("textarea"), "teh quick fox");

    await waitFor(() => {
      const error = getBackdrop(container).querySelector(".kyper-spell-error");
      expect(error).not.toBeNull();
      expect(error).toHaveTextContent("teh");
    });

    // Correctly spelled words are not flagged.
    expect(
      getBackdrop(container).querySelectorAll(".kyper-spell-error")
    ).toHaveLength(1);
  });

  it("does not flag correctly spelled text", async () => {
    const user = userEvent.setup();
    const { container } = render(<Textarea />);

    await user.type(container.querySelector("textarea"), "the quick fox");

    // Wait for the debounced spell check pass to complete.
    await waitFor(() => {
      expect(getBackdrop(container)).toHaveTextContent("the quick fox");
    });
    expect(
      getBackdrop(container).querySelector(".kyper-spell-error")
    ).toBeNull();
  });

  it("flags multiple misspelled words", async () => {
    const user = userEvent.setup();
    const { container } = render(<Textarea />);

    await user.type(container.querySelector("textarea"), "teh wrold is big");

    await waitFor(() => {
      const errors = [
        ...getBackdrop(container).querySelectorAll(".kyper-spell-error"),
      ];
      expect(errors.map((el) => el.textContent)).toEqual(["teh", "wrold"]);
    });
  });

  it("does not underline the word still being typed", async () => {
    const user = userEvent.setup();
    const { container } = render(<Textarea />);

    // Caret stays at the end of "teh" — the word is still being typed.
    await user.type(container.querySelector("textarea"), "teh");

    await waitFor(() => {
      expect(getBackdrop(container)).toHaveTextContent("teh");
    });
    expect(
      getBackdrop(container).querySelector(".kyper-spell-error")
    ).toBeNull();
  });

  it("underlines the word once a space is typed after it", async () => {
    const user = userEvent.setup();
    const { container } = render(<Textarea />);

    await user.type(container.querySelector("textarea"), "teh ");

    await waitFor(() => {
      const error = getBackdrop(container).querySelector(".kyper-spell-error");
      expect(error).not.toBeNull();
      expect(error).toHaveTextContent("teh");
    });
  });

  it("underlines the word being typed after the field loses focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<Textarea />);

    await user.type(container.querySelector("textarea"), "teh");
    await user.tab();

    await waitFor(() => {
      const error = getBackdrop(container).querySelector(".kyper-spell-error");
      expect(error).not.toBeNull();
      expect(error).toHaveTextContent("teh");
    });
  });

  it("underlines misspelled words in pre-filled controlled values", async () => {
    const text =
      "This assxsessment helps you reflect on where you currexntly stand.";
    const { container } = render(<Textarea value={text} readOnly />);

    await waitFor(() => {
      const errors = [
        ...getBackdrop(container).querySelectorAll(".kyper-spell-error"),
      ];
      expect(errors.map((el) => el.textContent)).toEqual([
        "assxsessment",
        "currexntly",
      ]);
    });
  });

  it("forwards props and onChange to the underlying textarea", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <Textarea placeholder="Type here" onChange={onChange} />
    );

    const textarea = container.querySelector("textarea");
    expect(textarea).toHaveAttribute("placeholder", "Type here");

    await user.type(textarea, "ab");
    expect(onChange).toHaveBeenCalled();
    expect(textarea).toHaveValue("ab");
  });
});
