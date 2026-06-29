import {
  SPELLCHECK_APPLIED_ATTR,
  SPELLCHECK_EXCLUDED_INPUT_TYPES,
  SPELLCHECK_IMPERATIVE_SKIP_ATTR,
  SPELLCHECK_LANG,
  SPELLCHECK_SKIP_ATTR,
} from "./constants";
import { tokenizeWords } from "./tokenize";

const WORD_PATTERN = /[a-zA-Z]+(?:'[a-zA-Z]+)*(?:-[a-zA-Z]+(?:'[a-zA-Z]+)*)*/;

export function isExplicitlyDisabled(element) {
  if (!element) return true;

  // React-managed overlays opt in explicitly; ancestor opt-out must not block them.
  if (element.dataset?.kyperSpellcheckManaged === "react") {
    return false;
  }

  if (element.closest?.("[data-spellcheck='false']")) {
    return true;
  }

  if (element.getAttribute(SPELLCHECK_SKIP_ATTR) === "false") {
    return true;
  }

  if (element.getAttribute("spellcheck") === "false") {
    return true;
  }

  if (element.dataset?.spellcheck === "false") {
    return true;
  }

  return false;
}

export function isInsideImperativeSpellcheckSkipZone(element) {
  return Boolean(element?.closest?.(`[${SPELLCHECK_IMPERATIVE_SKIP_ATTR}]`));
}

export function shouldUseImperativeSpellCheckOverlay(element) {
  if (!isSpellcheckEligible(element)) {
    return false;
  }

  if (element?.dataset?.kyperSpellcheckManaged === "react") {
    return false;
  }

  if (isInsideImperativeSpellcheckSkipZone(element)) {
    return false;
  }

  return true;
}

export function isSpellcheckEligible(element) {
  if (!element || typeof element.matches !== "function") {
    return false;
  }

  if (isExplicitlyDisabled(element)) {
    return false;
  }

  if (element instanceof HTMLInputElement) {
    const type = (element.type || "text").toLowerCase();
    if (SPELLCHECK_EXCLUDED_INPUT_TYPES.has(type)) {
      return false;
    }

    if (element.readOnly && type !== "text" && type !== "search") {
      return false;
    }

    return true;
  }

  if (element instanceof HTMLTextAreaElement) {
    return true;
  }

  if (element.isContentEditable) {
    return true;
  }

  return false;
}

export function applySpellcheckAttributes(element) {
  if (!isSpellcheckEligible(element)) {
    return false;
  }

  // Native browser spellcheck must stay off — we render errors on the backdrop.
  // Leaving spellcheck on causes double red underlines (browser + .kyper-spell-error).
  element.spellcheck = false;
  element.setAttribute("spellcheck", "false");
  element.setAttribute("lang", SPELLCHECK_LANG);
  element.setAttribute(SPELLCHECK_APPLIED_ATTR, "true");

  return true;
}

/**
 * Hide the misspelling underline for the word the caret is currently inside,
 * mirroring native browser behavior: a word is not flagged until the user
 * finishes typing it (moves the caret out, types a space, or blurs).
 */
export function excludeWordAtCaret(field, misspelledWords) {
  if (
    !field ||
    !Array.isArray(misspelledWords) ||
    misspelledWords.length === 0 ||
    typeof document === "undefined" ||
    document.activeElement !== field
  ) {
    return misspelledWords ?? [];
  }

  const caret = field.selectionStart;
  if (caret == null || caret !== field.selectionEnd) {
    return misspelledWords;
  }

  return misspelledWords.filter(
    ({ start, end }) => caret < start || caret > end
  );
}

export function collectSpellcheckElements(root = document.body) {
  if (!root) return [];

  const selector = [
    "input:not([type='password']):not([type='email']):not([type='number']):not([type='tel']):not([type='url']):not([type='date']):not([type='time']):not([type='datetime-local']):not([type='month']):not([type='week']):not([type='color']):not([type='range']):not([type='file']):not([type='hidden']):not([type='checkbox']):not([type='radio']):not([type='button']):not([type='submit']):not([type='reset'])",
    "textarea",
    "[contenteditable='true']",
    ".ql-editor",
  ].join(", ");

  const elements = [];

  if (root.matches?.(selector) && isSpellcheckEligible(root)) {
    elements.push(root);
  }

  root.querySelectorAll?.(selector).forEach((element) => {
    if (isSpellcheckEligible(element)) {
      elements.push(element);
    }
  });

  return elements;
}

export function getWordAtIndex(text, index) {
  if (typeof text !== "string" || index == null || index < 0) {
    return null;
  }

  const caret = Math.min(index, text.length);
  const words = tokenizeWords(text);

  return (
    words.find(({ start, end }) => caret >= start && caret < end) ??
    words.find(({ start, end }) => caret === end && end > start) ??
    null
  );
}

function getQuillBlockElements(root) {
  const blocks = [...root.children];
  return blocks.length ? blocks : [root];
}

export function buildQuillPlainTextFromRoot(root) {
  return getQuillBlockElements(root)
    .map((block) => block.textContent ?? "")
    .join("\n")
    .replace(/\n$/, "");
}

function getQuillTextOffsetInRoot(root, targetNode, targetOffset) {
  let offset = 0;

  for (const block of getQuillBlockElements(root)) {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      if (node === targetNode) {
        return offset + targetOffset;
      }
      offset += node.textContent?.length ?? 0;
      node = walker.nextNode();
    }

    offset += 1;
  }

  return getTextOffsetInElement(root, targetNode, targetOffset);
}

export function createQuillRangeFromTextOffsets(root, start, end) {
  let offset = 0;
  const range = document.createRange();
  let startSet = false;

  for (const block of getQuillBlockElements(root)) {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      const length = node.textContent?.length ?? 0;

      if (!startSet && offset + length >= start) {
        range.setStart(node, Math.max(0, start - offset));
        startSet = true;
      }

      if (startSet && offset + length >= end) {
        range.setEnd(node, Math.max(0, end - offset));
        return range;
      }

      offset += length;
      node = walker.nextNode();
    }

    offset += 1;
  }

  return startSet ? range : null;
}

function isQuillEditor(element) {
  return element?.classList?.contains("ql-editor");
}

export function enrichWordInfoForContentEditable(element, wordInfo) {
  if (!wordInfo?.word) {
    return null;
  }

  if (wordInfo.range) {
    return wordInfo;
  }

  if (!("start" in wordInfo) || !("end" in wordInfo)) {
    return wordInfo;
  }

  const range = isQuillEditor(element)
    ? createQuillRangeFromTextOffsets(element, wordInfo.start, wordInfo.end)
    : createRangeFromTextOffsets(element, wordInfo.start, wordInfo.end);

  if (!range) {
    return null;
  }

  return {
    ...wordInfo,
    range,
  };
}

export function getWordFromTextControl(element) {
  if (
    !(element instanceof HTMLInputElement) &&
    !(element instanceof HTMLTextAreaElement)
  ) {
    return null;
  }

  const value = element.value ?? "";
  const selectionStart = element.selectionStart ?? 0;
  const selectionEnd = element.selectionEnd ?? 0;

  if (selectionStart !== selectionEnd) {
    const selectedWord = value.slice(selectionStart, selectionEnd);
    if (WORD_PATTERN.test(selectedWord)) {
      return {
        word: selectedWord,
        start: selectionStart,
        end: selectionEnd,
      };
    }
  }

  return getWordAtIndex(value, selectionStart);
}

export function getCaretIndexFromPoint(element, x, y) {
  if (
    !(element instanceof HTMLInputElement) &&
    !(element instanceof HTMLTextAreaElement)
  ) {
    return null;
  }

  if (element instanceof HTMLInputElement) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
    const relativeX = Math.max(0, x - rect.left - paddingLeft);
    const text = element.value ?? "";

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return element.selectionStart ?? 0;
    }

    context.font = style.font;
    let index = 0;
    for (let i = 0; i <= text.length; i += 1) {
      const width = context.measureText(text.slice(0, i)).width;
      if (width > relativeX) {
        index = i;
        break;
      }
      index = i;
    }

    return index;
  }

  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  const mirror = document.createElement("div");
  const properties = [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "letterSpacing",
    "textTransform",
    "wordSpacing",
    "textIndent",
    "whiteSpace",
    "wordBreak",
    "overflowWrap",
    "lineHeight",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "boxSizing",
  ];

  properties.forEach((property) => {
    mirror.style[property] = style[property];
  });

  mirror.style.position = "fixed";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";
  mirror.style.overflow = "auto";
  mirror.style.width = `${element.clientWidth}px`;
  mirror.style.height = `${element.clientHeight}px`;
  mirror.style.top = `${rect.top}px`;
  mirror.style.left = `${rect.left}px`;
  mirror.style.zIndex = "-9999";
  mirror.textContent = element.value ?? "";

  document.body.appendChild(mirror);
  mirror.scrollTop = element.scrollTop;
  mirror.scrollLeft = element.scrollLeft;

  let index = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i <= mirror.textContent.length; i += 1) {
    const range = document.createRange();
    const textNode = mirror.firstChild;
    if (!textNode) {
      break;
    }

    range.setStart(textNode, i);
    range.setEnd(textNode, i);
    const rangeRect = range.getBoundingClientRect();
    const distance =
      Math.abs(rangeRect.left - x) + Math.abs(rangeRect.top - y);

    if (distance < closestDistance) {
      closestDistance = distance;
      index = i;
    }
  }

  document.body.removeChild(mirror);
  return index;
}

export function getWordFromTextControlAtPoint(element, x, y) {
  if (
    !(element instanceof HTMLInputElement) &&
    !(element instanceof HTMLTextAreaElement)
  ) {
    return null;
  }

  const caretIndex = getCaretIndexFromPoint(element, x, y);
  if (caretIndex == null) {
    return getWordFromTextControl(element);
  }

  return getWordAtIndex(element.value ?? "", caretIndex);
}

function getTextOffsetInElement(element, targetNode, targetOffset) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let node = walker.nextNode();

  while (node) {
    if (node === targetNode) {
      return offset + targetOffset;
    }
    offset += node.textContent?.length ?? 0;
    node = walker.nextNode();
  }

  return offset;
}

function createRangeFromTextOffsets(element, start, end) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let startSet = false;
  const range = document.createRange();
  let node = walker.nextNode();

  while (node) {
    const length = node.textContent?.length ?? 0;

    if (!startSet && offset + length >= start) {
      range.setStart(node, Math.max(0, start - offset));
      startSet = true;
    }

    if (startSet && offset + length >= end) {
      range.setEnd(node, Math.max(0, end - offset));
      return range;
    }

    offset += length;
    node = walker.nextNode();
  }

  return startSet ? range : null;
}

export function getWordFromContentEditable(element, x, y) {
  if (!element?.isContentEditable) {
    return null;
  }

  let range = null;

  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
  } else if (document.caretPositionFromPoint) {
    const position = document.caretPositionFromPoint(x, y);
    if (position) {
      range = document.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.collapse(true);
    }
  }

  if (!range || !element.contains(range.startContainer)) {
    return null;
  }

  const quillEditor = isQuillEditor(element);
  const text = quillEditor
    ? buildQuillPlainTextFromRoot(element)
    : element.innerText || element.textContent || "";
  const caretOffset = quillEditor
    ? getQuillTextOffsetInRoot(
        element,
        range.startContainer,
        range.startOffset
      )
    : getTextOffsetInElement(
        element,
        range.startContainer,
        range.startOffset
      );
  const wordInfo = getWordAtIndex(text, caretOffset);

  if (!wordInfo) {
    return null;
  }

  const wordRange = quillEditor
    ? createQuillRangeFromTextOffsets(element, wordInfo.start, wordInfo.end)
    : createRangeFromTextOffsets(element, wordInfo.start, wordInfo.end);

  if (!wordRange) {
    return null;
  }

  return {
    word: wordInfo.word,
    start: wordInfo.start,
    end: wordInfo.end,
    range: wordRange,
  };
}

function setNativeInputValue(element, value) {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

  if (descriptor?.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }
}

export function replaceWordInTextControl(
  element,
  start,
  end,
  replacement,
  expectedWord = null
) {
  const value = element.value ?? "";
  let wordStart = start;
  let wordEnd = end;

  const slice = value.slice(wordStart, wordEnd);
  if (expectedWord && slice !== expectedWord) {
    const searchFrom = Math.max(0, wordStart - expectedWord.length);
    const found = value.indexOf(expectedWord, searchFrom);
    if (found >= 0) {
      wordStart = found;
      wordEnd = found + expectedWord.length;
    }
  }

  const nextValue =
    value.slice(0, wordStart) + replacement + value.slice(wordEnd);
  setNativeInputValue(element, nextValue);

  const caretPosition = wordStart + replacement.length;
  element.setSelectionRange(caretPosition, caretPosition);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

export function enableQuillSpellcheck(editor) {
  if (editor?.root) {
    applySpellcheckAttributes(editor.root);
    void import("./attachQuillSpellCheck").then(({ attachQuillSpellCheck }) => {
      attachQuillSpellCheck(editor);
    });
  }
}

export function replaceWordInContentEditable(range, replacement) {
  if (!range) return;

  const selection = window.getSelection();
  if (!selection) return;

  range.deleteContents();
  const textNode = document.createTextNode(replacement);
  range.insertNode(textNode);

  const newRange = document.createRange();
  newRange.setStartAfter(textNode);
  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);

  const editable = range.commonAncestorContainer?.parentElement?.closest?.(
    "[contenteditable='true'], .ql-editor"
  );

  editable?.dispatchEvent(new Event("input", { bubbles: true }));
}
