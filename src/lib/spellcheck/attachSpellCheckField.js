import { findMisspelledWords, getWordSuggestions, onSpellCheckerReady } from "./spellcheckService";
import {
  cacheSuggestions,
  findClosestMisspelledWord,
  findMisspelledWordAtIndex,
  findMisspelledWordForWordInfo,
  getCachedSuggestions,
  getFieldMisspelledWords,
  setFieldMisspelledWords,
} from "./fieldMisspelledStore";
import { buildMisspelledMarkup } from "./tokenize";
import {
  applySpellcheckAttributes,
  excludeWordAtCaret,
  getCaretIndexFromPoint,
  getWordFromTextControl,
  getWordFromTextControlAtPoint,
  isSpellcheckEligible,
  shouldUseImperativeSpellCheckOverlay,
} from "./utils";

const SPELLCHECK_MENU_EVENT = "kyper-spellcheck-menu";

const MIRROR_STYLE_PROPS = [
  "direction",
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "fontFamily",
  "lineHeight",
  "letterSpacing",
  "textTransform",
  "textIndent",
  "textDecoration",
  "wordSpacing",
  "textAlign",
  "whiteSpace",
  "wordBreak",
  "overflowWrap",
  "tabSize",
];

function dispatchSpellcheckMenu(field, wordInfo, clientX, clientY) {
  window.dispatchEvent(
    new CustomEvent(SPELLCHECK_MENU_EVENT, {
      detail: { field, wordInfo, clientX, clientY },
    })
  );
}

function resolveMisspelledWordAtClick(field, clientX, clientY) {
  const misspelled = getFieldMisspelledWords(field);
  if (!misspelled.length) return null;

  const caretIndex =
    getCaretIndexFromPoint(field, clientX, clientY) ??
    field.selectionStart ??
    0;
  const fromPoint = getWordFromTextControlAtPoint(field, clientX, clientY);
  const fromSelection = getWordFromTextControl(field);

  // Only match a word at (or very near) the click point. Falling back to
  // far-away words shows suggestions for a different word than clicked.
  return (
    findMisspelledWordForWordInfo(field, fromPoint ?? fromSelection) ??
    findMisspelledWordAtIndex(field, caretIndex) ??
    findClosestMisspelledWord(field, caretIndex)
  );
}

export function attachSpellCheckField(field, { multiline = false } = {}) {
  if (!field || !shouldUseImperativeSpellCheckOverlay(field)) {
    return () => {};
  }

  if (
    field.dataset.kyperSpellcheckManaged === "react" ||
    field.dataset.kyperSpellcheckAttached === "true"
  ) {
    return field.__kyperSpellcheckCleanup ?? (() => {});
  }

  if (
    field.closest(".spellcheck-field")?.querySelector(
      ".spellcheck-backdrop:not(.spellcheck-backdrop-auto)"
    )
  ) {
    return () => {};
  }

  applySpellcheckAttributes(field);
  field.dataset.kyperSpellcheckAttached = "true";

  const parent = field.parentElement;
  if (!parent) return () => {};

  let backdrop = parent.querySelector(":scope > .spellcheck-backdrop-auto");
  if (!parent.classList.contains("spellcheck-field")) {
    parent.classList.add("relative", "w-full", "spellcheck-field", "bg-background");
  }

  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "spellcheck-backdrop spellcheck-backdrop-auto";
    backdrop.setAttribute("aria-hidden", "true");
    parent.insertBefore(backdrop, field);
    field.classList.add("relative", "z-[1]", "bg-transparent");
  }

  let debounceId = null;
  // Whether the last interactive check hid the caret word (typing) or not
  // (click/focus). Ambient re-checks (interval, resize) inherit this so they
  // never flip the underline state under the user.
  let lastHideCaretWord = false;

  const syncBackdropStyles = () => {
    if (!backdrop) return;
    const style = window.getComputedStyle(field);
    MIRROR_STYLE_PROPS.forEach((prop) => {
      backdrop.style[prop] = style[prop];
    });
    backdrop.style.borderTopColor = "transparent";
    backdrop.style.borderRightColor = "transparent";
    backdrop.style.borderBottomColor = "transparent";
    backdrop.style.borderLeftColor = "transparent";
    backdrop.style.position = "absolute";
    backdrop.style.top = "0";
    backdrop.style.left = "0";
    backdrop.style.width = `${field.clientWidth}px`;
    backdrop.style.height = `${field.clientHeight}px`;
    backdrop.style.pointerEvents = "none";
    backdrop.style.overflow = "hidden";
    backdrop.style.color = "transparent";
    backdrop.style.whiteSpace = multiline ? "pre-wrap" : "pre";
    backdrop.style.wordBreak = multiline ? "break-word" : "normal";
    backdrop.style.zIndex = "0";
    backdrop.scrollTop = field.scrollTop;
    backdrop.scrollLeft = field.scrollLeft;
  };

  const runSpellCheck = async (options) => {
    const hideCaretWord = options?.hideCaretWord ?? lastHideCaretWord;
    lastHideCaretWord = hideCaretWord;

    const text = field.value ?? "";
    const misspelled = await findMisspelledWords(text);
    setFieldMisspelledWords(field, misspelled);
    if (backdrop) {
      // While typing, don't underline the word still being typed (caret
      // inside it). Click/focus-driven checks must NOT hide the caret word,
      // otherwise clicking on a red word makes its underline disappear.
      const visibleWords = hideCaretWord
        ? excludeWordAtCaret(field, misspelled)
        : misspelled;
      backdrop.innerHTML = buildMisspelledMarkup(text, visibleWords);
    }
    syncBackdropStyles();

    // nspell's suggest() is heavy synchronous work; running it inline blocks
    // the browser from painting the fresh underlines. Defer the prefetch to a
    // macrotask and only compute suggestions once per word (cached).
    const wordsToPrefetch = [
      ...new Set(misspelled.map(({ word }) => word.toLowerCase())),
    ].filter((wordKey) => !getCachedSuggestions(wordKey));

    if (wordsToPrefetch.length) {
      window.setTimeout(() => {
        wordsToPrefetch.forEach((wordKey) => {
          const sourceWord =
            misspelled.find(({ word }) => word.toLowerCase() === wordKey)
              ?.word ?? wordKey;
          void getWordSuggestions(sourceWord).then((suggestions) =>
            cacheSuggestions(sourceWord, suggestions)
          );
        });
      }, 50);
    }
  };

  const scheduleSpellCheck = (options) => {
    if (debounceId) window.clearTimeout(debounceId);
    debounceId = window.setTimeout(() => void runSpellCheck(options), 200);
  };

  const handleTyping = () => scheduleSpellCheck({ hideCaretWord: true });
  // Focus/blur are click-driven: show every underline, including the word
  // the caret landed in.
  const handleFocusBlur = () => scheduleSpellCheck({ hideCaretWord: false });

  const handleScroll = () => {
    if (backdrop) {
      backdrop.scrollTop = field.scrollTop;
      backdrop.scrollLeft = field.scrollLeft;
    }
  };

  const handleContextMenu = (event) => {
    const wordInfo = resolveMisspelledWordAtClick(
      field,
      event.clientX,
      event.clientY
    );

    if (!wordInfo?.word) {
      // Not on a misspelled word: leave the native context menu alone.
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dispatchSpellcheckMenu(field, wordInfo, event.clientX, event.clientY);
  };

  syncBackdropStyles();
  void runSpellCheck();

  const unsubscribeReady = onSpellCheckerReady(() => {
    void runSpellCheck({ hideCaretWord: false });
  });

  field.addEventListener("input", handleTyping);
  field.addEventListener("change", handleTyping);
  field.addEventListener("focus", handleFocusBlur);
  field.addEventListener("blur", handleFocusBlur);
  field.addEventListener("scroll", handleScroll);
  field.addEventListener("contextmenu", handleContextMenu);
  window.addEventListener("resize", syncBackdropStyles);

  const resizeObserver = new ResizeObserver(() => {
    syncBackdropStyles();
    void runSpellCheck();
  });
  resizeObserver.observe(field);

  const preloadIntervalId = window.setInterval(() => void runSpellCheck(), 400);
  window.setTimeout(() => window.clearInterval(preloadIntervalId), 5000);

  const cleanup = () => {
    field.removeEventListener("input", handleTyping);
    field.removeEventListener("change", handleTyping);
    field.removeEventListener("focus", handleFocusBlur);
    field.removeEventListener("blur", handleFocusBlur);
    field.removeEventListener("scroll", handleScroll);
    field.removeEventListener("contextmenu", handleContextMenu);
    window.removeEventListener("resize", syncBackdropStyles);
    resizeObserver.disconnect();
    unsubscribeReady();
    window.clearInterval(preloadIntervalId);
    if (debounceId) window.clearTimeout(debounceId);
    delete field.dataset.kyperSpellcheckAttached;
    delete field.__kyperSpellcheckCleanup;
  };

  field.__kyperSpellcheckCleanup = cleanup;
  return cleanup;
}

function isSpellcheckObserverNode(node) {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  if (
    node.classList?.contains("spellcheck-backdrop") ||
    node.classList?.contains("spellcheck-backdrop-auto")
  ) {
    return false;
  }

  if (node.closest?.("[data-kyper-no-imperative-spellcheck]")) {
    return false;
  }

  return true;
}

export function attachSpellCheckToTree(root = document.body) {
  if (!root || !isSpellcheckObserverNode(root)) return;

  const selector =
    "input:not([type='password']):not([type='email']):not([type='number']):not([type='tel']):not([type='url']):not([type='date']):not([type='time']):not([type='datetime-local']):not([type='month']):not([type='week']):not([type='color']):not([type='range']):not([type='file']):not([type='hidden']):not([type='checkbox']):not([type='radio']):not([type='button']):not([type='submit']):not([type='reset']), textarea";

  const elements = [];
  if (root.matches?.(selector) && shouldUseImperativeSpellCheckOverlay(root)) {
    elements.push(root);
  }
  root.querySelectorAll?.(selector).forEach((el) => {
    if (shouldUseImperativeSpellCheckOverlay(el)) elements.push(el);
  });

  elements.forEach((field) => {
    attachSpellCheckField(field, {
      multiline: field instanceof HTMLTextAreaElement,
    });
  });
}
