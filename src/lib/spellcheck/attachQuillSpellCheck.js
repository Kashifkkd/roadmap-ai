import { findMisspelledWords, getWordSuggestions, onSpellCheckerReady } from "./spellcheckService";
import {
  cacheSuggestions,
  findMisspelledWordForWordInfo,
  getCachedSuggestions,
  setFieldMisspelledWords,
} from "./fieldMisspelledStore";
import { renderQuillSpellcheckBackdrop } from "./quillSpellcheckBackdrop";
import { applySpellcheckAttributes, excludeWordAtCaret, getWordFromContentEditable } from "./utils";

const SPELLCHECK_MENU_EVENT = "kyper-spellcheck-menu";

function dispatchSpellcheckMenu(field, wordInfo, clientX, clientY) {
  window.dispatchEvent(
    new CustomEvent(SPELLCHECK_MENU_EVENT, {
      detail: { field, wordInfo, clientX, clientY },
    })
  );
}
const MIRROR_STYLE_PROPS = [
  "boxSizing",
  "width",
  "height",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "fontVariant",
  "lineHeight",
  "letterSpacing",
  "wordSpacing",
  "textAlign",
  "textIndent",
  "textTransform",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "whiteSpace",
  "wordBreak",
  "overflowWrap",
  "tabSize",
];

export function attachQuillSpellCheck(editor) {
  if (!editor?.root || editor.root.dataset.kyperQuillSpellcheckAttached === "true") {
    return () => {};
  }

  const root = editor.root;
  const container = root.closest(".ql-container") ?? root.parentElement;
  if (!container) {
    return () => {};
  }

  applySpellcheckAttributes(root);
  root.dataset.kyperQuillSpellcheckAttached = "true";

  container.classList.add("relative", "spellcheck-field");
  if (!container.querySelector(".spellcheck-backdrop-quill")) {
    const backdrop = document.createElement("div");
    backdrop.className = "spellcheck-backdrop spellcheck-backdrop-quill ql-editor";
    backdrop.setAttribute("aria-hidden", "true");
    container.insertBefore(backdrop, root);
    root.classList.add("relative", "z-[1]", "bg-transparent");
  }

  const backdrop = container.querySelector(".spellcheck-backdrop-quill");
  let debounceId = null;

  const syncBackdropStyles = () => {
    if (!backdrop) return;
    const style = window.getComputedStyle(root);
    MIRROR_STYLE_PROPS.forEach((prop) => {
      backdrop.style[prop] = style[prop];
    });
    backdrop.style.position = "absolute";
    backdrop.style.top = "0";
    backdrop.style.left = "0";
    backdrop.style.width = "100%";
    backdrop.style.height = "100%";
    backdrop.style.pointerEvents = "none";
    backdrop.style.overflow = "hidden";
    backdrop.style.color = "transparent";
    backdrop.style.whiteSpace = "normal";
    backdrop.style.wordBreak = style.wordBreak || "break-word";
    backdrop.style.zIndex = "0";
    backdrop.scrollTop = root.scrollTop;
  };

  const runSpellCheck = async (options) => {
    const hideCaretWord = options?.hideCaretWord ?? false;
    const text = editor.getText()?.replace(/\n$/, "") ?? "";
    const misspelled = await findMisspelledWords(text);
    setFieldMisspelledWords(root, misspelled);
    if (backdrop) {
      const visibleWords = hideCaretWord
        ? excludeWordAtCaret(root, misspelled)
        : misspelled;
      renderQuillSpellcheckBackdrop(root, backdrop, visibleWords);
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
    debounceId = window.setTimeout(() => {
      void runSpellCheck(options);
    }, 200);
  };

  const handleTextChange = () => scheduleSpellCheck({ hideCaretWord: true });
  const handleFocusBlur = () => scheduleSpellCheck({ hideCaretWord: false });

  editor.on("text-change", handleTextChange);
  root.addEventListener("focus", handleFocusBlur);
  root.addEventListener("blur", handleFocusBlur);

  const handleContextMenu = (event) => {
    const wordInfo = getWordFromContentEditable(root, event.clientX, event.clientY);
    if (!wordInfo?.word) {
      return;
    }

    const misspelled = findMisspelledWordForWordInfo(root, wordInfo);
    if (!misspelled?.word) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dispatchSpellcheckMenu(root, misspelled, event.clientX, event.clientY);
  };

  root.addEventListener("contextmenu", handleContextMenu);
  root.addEventListener("scroll", () => {
    if (backdrop) backdrop.scrollTop = root.scrollTop;
  });

  void runSpellCheck();

  const unsubscribeReady = onSpellCheckerReady(() => {
    void runSpellCheck({ hideCaretWord: false });
  });

  const preloadIntervalId = window.setInterval(() => {
    void runSpellCheck({ hideCaretWord: false });
  }, 400);
  window.setTimeout(() => window.clearInterval(preloadIntervalId), 5000);

  return () => {
    editor.off("text-change", handleTextChange);
    root.removeEventListener("focus", handleFocusBlur);
    root.removeEventListener("blur", handleFocusBlur);
    root.removeEventListener("contextmenu", handleContextMenu);
    unsubscribeReady();
    window.clearInterval(preloadIntervalId);
    if (debounceId) window.clearTimeout(debounceId);
  };
}
