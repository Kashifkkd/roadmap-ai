"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { findMisspelledWords, getWordSuggestions } from "@/lib/spellcheck/spellcheckService";
import {
  cacheSuggestions,
  findClosestMisspelledWord,
  findMisspelledWordAtIndex,
  findMisspelledWordForWordInfo,
  getFieldMisspelledWords,
  setFieldMisspelledWords,
} from "@/lib/spellcheck/fieldMisspelledStore";
import { buildMisspelledMarkup } from "@/lib/spellcheck/tokenize";
import {
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

  return (
    findMisspelledWordForWordInfo(field, fromPoint ?? fromSelection) ??
    findMisspelledWordAtIndex(field, caretIndex) ??
    findClosestMisspelledWord(field, caretIndex, Number.POSITIVE_INFINITY) ??
    (misspelled.length === 1 ? misspelled[0] : null)
  );
}

export function useSpellCheckOverlay(enabled, multiline = false) {
  const fieldRef = useRef(null);
  const backdropRef = useRef(null);
  const debounceRef = useRef(null);
  const runSpellCheckRef = useRef(null);
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

  const runSpellCheck = useCallback(async () => {
    const field = fieldRef.current;
    if (!field || !enabled) {
      return;
    }

    const text = field.value ?? "";
    const misspelled = await findMisspelledWords(text);
    setFieldMisspelledWords(field, misspelled);
    setMarkup(buildMisspelledMarkup(text, misspelled));
    syncBackdropStyles();

    await Promise.all(
      [...new Set(misspelled.map(({ word }) => word.toLowerCase()))].map(
        async (wordKey) => {
          const sourceWord =
            misspelled.find(({ word }) => word.toLowerCase() === wordKey)
              ?.word ?? wordKey;
          const suggestions = await getWordSuggestions(sourceWord);
          cacheSuggestions(sourceWord, suggestions);
        }
      )
    );
  }, [enabled, syncBackdropStyles]);

  runSpellCheckRef.current = runSpellCheck;

  const scheduleSpellCheck = useCallback(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      void runSpellCheck();
    }, 200);
  }, [runSpellCheck]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || !enabled) {
      return undefined;
    }

    const handleInput = () => scheduleSpellCheck();
    const handleScroll = () => {
      if (backdropRef.current) {
        backdropRef.current.scrollTop = field.scrollTop;
        backdropRef.current.scrollLeft = field.scrollLeft;
      }
    };

    const handleContextMenu = (event) => {
      const existingMisspelled = getFieldMisspelledWords(field);

      if (existingMisspelled.length > 0) {
        event.preventDefault();
        event.stopPropagation();
      }

      void (async () => {
        await runSpellCheckRef.current?.();

        const wordInfo = resolveMisspelledWordAtClick(
          field,
          event.clientX,
          event.clientY
        );

        if (!wordInfo?.word) {
          return;
        }

        if (!existingMisspelled.length) {
          event.preventDefault();
          event.stopPropagation();
        }

        dispatchSpellcheckMenu(field, wordInfo, event.clientX, event.clientY);
      })();
    };

    syncBackdropStyles();
    void runSpellCheck();

    field.addEventListener("input", handleInput);
    field.addEventListener("change", handleInput);
    field.addEventListener("focus", handleInput);
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
      field.removeEventListener("focus", handleInput);
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
