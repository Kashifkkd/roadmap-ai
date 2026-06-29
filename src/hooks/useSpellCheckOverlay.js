"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  findMisspelledWords,
  getWordSuggestions,
  onSpellCheckerReady,
} from "@/lib/spellcheck/spellcheckService";
import {
  cacheSuggestions,
  findClosestMisspelledWord,
  findMisspelledWordAtIndex,
  findMisspelledWordForWordInfo,
  getCachedSuggestions,
  getFieldMisspelledWords,
  setFieldMisspelledWords,
} from "@/lib/spellcheck/fieldMisspelledStore";
import { buildMisspelledMarkup } from "@/lib/spellcheck/tokenize";
import {
  excludeWordAtCaret,
  getCaretIndexFromPoint,
  getWordFromTextControl,
  getWordFromTextControlAtPoint,
} from "@/lib/spellcheck/utils";

export const SPELLCHECK_MENU_EVENT = "kyper-spellcheck-menu";

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
      detail: {
        field,
        wordInfo,
        clientX,
        clientY,
      },
    })
  );
}

function resolveMisspelledWordAtClick(field, clientX, clientY) {
  const misspelled = getFieldMisspelledWords(field);
  if (!misspelled.length) {
    return null;
  }

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

export function useSpellCheckOverlay(enabled, multiline = false, watchValue) {
  const fieldRef = useRef(null);
  const backdropRef = useRef(null);
  const debounceRef = useRef(null);
  const runSpellCheckRef = useRef(null);
  // Whether the last interactive check hid the caret word (typing) or not
  // (click/focus). Ambient re-checks (interval, resize) inherit this so they
  // never flip the underline state under the user.
  const lastHideCaretWordRef = useRef(false);
  const pendingInputCheckRef = useRef(false);
  const [markup, setMarkup] = useState("&nbsp;");

  const syncBackdropStyles = useCallback(() => {
    const field = fieldRef.current;
    const backdrop = backdropRef.current;
    if (!field || !backdrop) {
      return;
    }

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
  }, [multiline]);

  const runSpellCheck = useCallback(async (options) => {
    const field = fieldRef.current;
    if (!field || !enabled) {
      return;
    }

    const hideCaretWord =
      options?.hideCaretWord ?? lastHideCaretWordRef.current;
    lastHideCaretWordRef.current = hideCaretWord;

    const text = field.value ?? "";
    const misspelled = await findMisspelledWords(text);
    setFieldMisspelledWords(field, misspelled);
    // While typing, don't underline the word still being typed (caret inside
    // it). Checks triggered by clicks/focus must NOT hide the caret word,
    // otherwise clicking on a red word makes its underline disappear.
    const visibleWords = hideCaretWord
      ? excludeWordAtCaret(field, misspelled)
      : misspelled;
    setMarkup(buildMisspelledMarkup(text, visibleWords));
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
  }, [enabled, syncBackdropStyles]);

  runSpellCheckRef.current = runSpellCheck;

  const scheduleSpellCheck = useCallback(
    (options) => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }

      debounceRef.current = window.setTimeout(() => {
        void runSpellCheck(options);
      }, 200);
    },
    [runSpellCheck]
  );

  // Controlled fields can change value programmatically (reload, navigation).
  // Re-check on value changes; only hide the caret word while the user types.
  useEffect(() => {
    if (!enabled || watchValue === undefined) {
      return;
    }

    if (pendingInputCheckRef.current) {
      pendingInputCheckRef.current = false;
      return;
    }

    scheduleSpellCheck({ hideCaretWord: false });
  }, [enabled, watchValue, scheduleSpellCheck]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    return onSpellCheckerReady(() => {
      void runSpellCheck({ hideCaretWord: false });
    });
  }, [enabled, runSpellCheck]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || !enabled) {
      return undefined;
    }

    const handleInput = () => {
      pendingInputCheckRef.current = true;
      scheduleSpellCheck({ hideCaretWord: true });
    };
    // Focus/blur are click-driven: show every underline, including the word
    // the caret landed in.
    const handleFocusBlur = () => scheduleSpellCheck({ hideCaretWord: false });
    const handleScroll = () => {
      if (backdropRef.current) {
        backdropRef.current.scrollTop = field.scrollTop;
        backdropRef.current.scrollLeft = field.scrollLeft;
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

    field.addEventListener("input", handleInput);
    field.addEventListener("change", handleInput);
    field.addEventListener("focus", handleFocusBlur);
    field.addEventListener("blur", handleFocusBlur);
    field.addEventListener("scroll", handleScroll);
    field.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("resize", syncBackdropStyles);

    const resizeObserver = new ResizeObserver(() => {
      syncBackdropStyles();
      void runSpellCheckRef.current?.();
    });
    resizeObserver.observe(field);

    const preloadIntervalId = window.setInterval(() => {
      void runSpellCheckRef.current?.();
    }, 400);
    window.setTimeout(() => window.clearInterval(preloadIntervalId), 5000);

    return () => {
      field.removeEventListener("input", handleInput);
      field.removeEventListener("change", handleInput);
      field.removeEventListener("focus", handleFocusBlur);
      field.removeEventListener("blur", handleFocusBlur);
      field.removeEventListener("scroll", handleScroll);
      field.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("resize", syncBackdropStyles);
      resizeObserver.disconnect();
      window.clearInterval(preloadIntervalId);
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [enabled, runSpellCheck, scheduleSpellCheck, syncBackdropStyles]);

  return {
    fieldRef,
    backdropRef,
    markup,
  };
}
