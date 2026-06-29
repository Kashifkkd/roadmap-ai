import { describe, expect, it } from "vitest";
import { SPELLCHECK_IMPERATIVE_SKIP_ATTR } from "./constants";
import {
  applySpellcheckAttributes,
  collectSpellcheckElements,
  excludeWordAtCaret,
  getWordAtIndex,
  getWordFromTextControl,
  isExplicitlyDisabled,
  isSpellcheckEligible,
  replaceWordInTextControl,
  shouldUseImperativeSpellCheckOverlay,
} from "./utils";

describe("isExplicitlyDisabled", () => {
  it("returns true when spellcheck is opted out", () => {
    const input = document.createElement("input");
    input.setAttribute("spellcheck", "false");
    expect(isExplicitlyDisabled(input)).toBe(true);

    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-spellcheck", "false");
    wrapper.appendChild(input);
    expect(isExplicitlyDisabled(input)).toBe(true);
  });

  it("allows react-managed fields inside a spellcheck opt-out zone", () => {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-spellcheck", "false");
    const textarea = document.createElement("textarea");
    textarea.dataset.kyperSpellcheckManaged = "react";
    wrapper.appendChild(textarea);

    expect(isExplicitlyDisabled(textarea)).toBe(false);
    expect(isSpellcheckEligible(textarea)).toBe(true);
  });

  it("returns false for eligible plain inputs", () => {
    const input = document.createElement("input");
    expect(isExplicitlyDisabled(input)).toBe(false);
  });
});

describe("isSpellcheckEligible", () => {
  it("allows text inputs and textareas", () => {
    expect(isSpellcheckEligible(document.createElement("input"))).toBe(true);
    expect(isSpellcheckEligible(document.createElement("textarea"))).toBe(
      true
    );
  });

  it("excludes password and other non-text input types", () => {
    const password = document.createElement("input");
    password.type = "password";
    expect(isSpellcheckEligible(password)).toBe(false);

    const email = document.createElement("input");
    email.type = "email";
    expect(isSpellcheckEligible(email)).toBe(false);
  });

  it("collectSpellcheckElements finds nested textareas", () => {
    const root = document.createElement("div");
    const textarea = document.createElement("textarea");
    root.appendChild(textarea);

    expect(collectSpellcheckElements(root)).toContain(textarea);
  });
});

describe("shouldUseImperativeSpellCheckOverlay", () => {
  it("skips react-managed and imperative-skip zones", () => {
    const input = document.createElement("input");
    expect(shouldUseImperativeSpellCheckOverlay(input)).toBe(true);

    input.dataset.kyperSpellcheckManaged = "react";
    expect(shouldUseImperativeSpellCheckOverlay(input)).toBe(false);

    delete input.dataset.kyperSpellcheckManaged;
    const skipZone = document.createElement("div");
    skipZone.setAttribute(SPELLCHECK_IMPERATIVE_SKIP_ATTR, "");
    skipZone.appendChild(input);
    expect(shouldUseImperativeSpellCheckOverlay(input)).toBe(false);
  });
});

describe("applySpellcheckAttributes", () => {
  it("sets native spellcheck and lang on eligible fields", () => {
    const input = document.createElement("input");
    expect(applySpellcheckAttributes(input)).toBe(true);
    expect(input.spellcheck).toBe(false);
    expect(input.getAttribute("spellcheck")).toBe("false");
    expect(input.getAttribute("lang")).toBe("en-US");
  });

  it("returns false for ineligible fields", () => {
    const password = document.createElement("input");
    password.type = "password";
    expect(applySpellcheckAttributes(password)).toBe(false);
  });
});

describe("getWordAtIndex", () => {
  it("extracts word at caret position", () => {
    expect(getWordAtIndex("hello world", 7)).toEqual({
      word: "world",
      start: 6,
      end: 11,
    });
  });

  it("returns null when caret is on whitespace only", () => {
    expect(getWordAtIndex("   ", 1)).toBeNull();
    expect(getWordAtIndex("", 0)).toBeNull();
  });

  it("returns the full hyphenated token when caret is on the hyphen", () => {
    const text = "mindset to hands-on execution";
    const hyphenIndex = text.indexOf("-");

    expect(getWordAtIndex(text, hyphenIndex)).toEqual({
      word: "hands-on",
      start: text.indexOf("hands-on"),
      end: text.indexOf("hands-on") + "hands-on".length,
    });
  });

  it("returns the full hyphenated token when caret is before the hyphen", () => {
    const text = "mindset to hands-on execution";
    const beforeHyphen = text.indexOf("-") - 1;

    expect(getWordAtIndex(text, beforeHyphen)?.word).toBe("hands-on");
  });
});

describe("getWordFromTextControl", () => {
  it("uses selection when a word is highlighted", () => {
    const input = document.createElement("input");
    input.value = "fix teh typo";
    input.setSelectionRange(4, 7);
    expect(getWordFromTextControl(input)).toEqual({
      word: "teh",
      start: 4,
      end: 7,
    });
  });

  it("uses caret position when there is no selection", () => {
    const input = document.createElement("input");
    input.value = "hello";
    input.setSelectionRange(3, 3);
    expect(getWordFromTextControl(input)).toEqual({
      word: "hello",
      start: 0,
      end: 5,
    });
  });
});

describe("excludeWordAtCaret", () => {
  const makeFocusedField = (value, caret) => {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.value = value;
    textarea.focus();
    textarea.setSelectionRange(caret, caret);
    return textarea;
  };

  it("hides the word currently being typed", () => {
    // "goo|" — caret at the end of the unfinished word.
    const field = makeFocusedField("goo", 3);
    const words = [{ word: "goo", start: 0, end: 3 }];

    expect(excludeWordAtCaret(field, words)).toEqual([]);
    field.remove();
  });

  it("keeps words the caret has moved past", () => {
    // "teh |" — caret after the trailing space.
    const field = makeFocusedField("teh ", 4);
    const words = [{ word: "teh", start: 0, end: 3 }];

    expect(excludeWordAtCaret(field, words)).toEqual(words);
    field.remove();
  });

  it("keeps every word when the field is not focused", () => {
    const field = makeFocusedField("teh", 3);
    field.blur();
    const words = [{ word: "teh", start: 0, end: 3 }];

    expect(excludeWordAtCaret(field, words)).toEqual(words);
    field.remove();
  });

  it("only hides the word containing the caret", () => {
    // "teh wrold|" — caret inside the second word only.
    const field = makeFocusedField("teh wrold", 9);
    const words = [
      { word: "teh", start: 0, end: 3 },
      { word: "wrold", start: 4, end: 9 },
    ];

    expect(excludeWordAtCaret(field, words)).toEqual([
      { word: "teh", start: 0, end: 3 },
    ]);
    field.remove();
  });
});

describe("replaceWordInTextControl", () => {
  it("replaces word and dispatches input/change events", () => {
    const input = document.createElement("input");
    input.value = "teh quick";
    const events = [];
    input.addEventListener("input", () => events.push("input"));
    input.addEventListener("change", () => events.push("change"));

    replaceWordInTextControl(input, 0, 3, "the");

    expect(input.value).toBe("the quick");
    expect(input.selectionStart).toBe(3);
    expect(events).toEqual(["input", "change"]);
  });

  it("relocates replacement when expected word drifted", () => {
    const input = document.createElement("input");
    input.value = "well teh end";
    replaceWordInTextControl(input, 0, 3, "the", "teh");
    expect(input.value).toBe("well the end");
  });
});
