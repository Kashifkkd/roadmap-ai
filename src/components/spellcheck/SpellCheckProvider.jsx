"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getWordSuggestions,
  ignoreWord,
  isWordCorrect,
  preloadSpellChecker,
} from "@/lib/spellcheck/spellcheckService";
import {
  cacheSuggestions,
  findMisspelledWordForWordInfo,
  getCachedSuggestions,
  resolveSpellcheckTarget,
  setFieldMisspelledWords,
} from "@/lib/spellcheck/fieldMisspelledStore";
import {
  applySpellcheckAttributes,
  collectSpellcheckElements,
  getWordFromContentEditable,
  getWordFromTextControl,
  getWordFromTextControlAtPoint,
  isSpellcheckEligible,
  replaceWordInContentEditable,
  replaceWordInTextControl,
} from "@/lib/spellcheck/utils";
import { attachSpellCheckToTree } from "@/lib/spellcheck/attachSpellCheckField";
import SpellCheckContextMenu from "./SpellCheckContextMenu";
import { SPELLCHECK_MENU_EVENT } from "@/hooks/useSpellCheckOverlay";

const OBSERVER_DEBOUNCE_MS = 120;

function resolveWordAtContextMenu(target, clientX, clientY) {
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    const fromPoint = getWordFromTextControlAtPoint(target, clientX, clientY);
    const fromSelection = getWordFromTextControl(target);
    const fromStore = findMisspelledWordForWordInfo(
      target,
      fromPoint ?? fromSelection
    );

    return fromStore ?? fromPoint ?? fromSelection;
  }

  if (target.isContentEditable) {
    return getWordFromContentEditable(target, clientX, clientY);
  }

  return null;
}

export default function SpellCheckProvider({ children }) {
  const [menuState, setMenuState] = useState({
    open: false,
    loading: false,
    position: { x: 0, y: 0 },
    word: "",
    suggestions: [],
    target: null,
    replacementContext: null,
  });

  const menuStateRef = useRef(menuState);
  menuStateRef.current = menuState;
  const rightClickRef = useRef(null);

  const applySpellcheckToTree = useCallback((root = document.body) => {
    collectSpellcheckElements(root).forEach(applySpellcheckAttributes);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuState((current) => ({
      ...current,
      open: false,
      loading: false,
      target: null,
      replacementContext: null,
      suggestions: [],
      word: "",
    }));
  }, []);

  const handleSuggestionSelect = useCallback(
    (replacement) => {
      const { replacementContext, target, word } = menuStateRef.current;
      if (!replacementContext || !target) {
        closeMenu();
        return;
      }

      if (replacementContext.type === "text-control") {
        replaceWordInTextControl(
          target,
          replacementContext.start,
          replacementContext.end,
          replacement,
          word
        );
      } else if (replacementContext.type === "contenteditable") {
        replaceWordInContentEditable(replacementContext.range, replacement);
      }

      closeMenu();
    },
    [closeMenu]
  );

  const handleIgnoreWord = useCallback(async () => {
    const { word, target } = menuStateRef.current;
    if (!word) {
      closeMenu();
      return;
    }

    await ignoreWord(word);
    if (target) {
      setFieldMisspelledWords(target, []);
      target.dispatchEvent(new Event("input", { bubbles: true }));
    }
    closeMenu();
  }, [closeMenu]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    preloadSpellChecker();
    applySpellcheckToTree();

    const attachId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        attachSpellCheckToTree();
      });
    });

    let debounceId = null;
    const observer = new MutationObserver((mutations) => {
      if (debounceId) {
        window.clearTimeout(debounceId);
      }

      debounceId = window.setTimeout(() => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) {
              return;
            }
            if (
              node.classList?.contains("spellcheck-backdrop") ||
              node.classList?.contains("spellcheck-backdrop-auto")
            ) {
              return;
            }
            applySpellcheckToTree(node);
            attachSpellCheckToTree(node);
          });
        });
      }, OBSERVER_DEBOUNCE_MS);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const handleMouseDown = (event) => {
      if (event.button !== 2) {
        return;
      }

      const target = resolveSpellcheckTarget(event.target);
      if (!target || !isSpellcheckEligible(target)) {
        rightClickRef.current = null;
        return;
      }

      rightClickRef.current = {
        target,
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handleContextMenu = (event) => {
      const target = resolveSpellcheckTarget(event.target);

      if (!target || !isSpellcheckEligible(target)) {
        return;
      }

      const clickPoint =
        rightClickRef.current?.target === target
          ? rightClickRef.current
          : { x: event.clientX, y: event.clientY };

      const wordInfo = resolveWordAtContextMenu(
        target,
        clickPoint.x,
        clickPoint.y
      );

      if (!wordInfo?.word) {
        return;
      }

      const isTextControl =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement;

      const storedMatch = isTextControl
        ? findMisspelledWordForWordInfo(target, wordInfo)
        : null;
      const activeWordInfo = storedMatch ?? wordInfo;
      const cachedSuggestions = getCachedSuggestions(activeWordInfo.word);

      const openMenu = (suggestions, loading = false) => {
        setMenuState({
          open: true,
          loading,
          position: { x: event.clientX, y: event.clientY },
          word: activeWordInfo.word,
          suggestions,
          target,
          replacementContext:
            "start" in activeWordInfo
              ? {
                  type: "text-control",
                  start: activeWordInfo.start,
                  end: activeWordInfo.end,
                }
              : {
                  type: "contenteditable",
                  range: activeWordInfo.range,
                },
        });
      };

      const showSuggestionsMenu = async () => {
        if (cachedSuggestions?.length) {
          openMenu(cachedSuggestions, false);
          return;
        }

        openMenu([], true);

        const suggestions = await getWordSuggestions(activeWordInfo.word);
        cacheSuggestions(activeWordInfo.word, suggestions);
        openMenu(suggestions, false);
      };

      if (isTextControl) {
        if (storedMatch) {
          event.preventDefault();
          event.stopPropagation();
          void showSuggestionsMenu();
          return;
        }

        if (cachedSuggestions?.length) {
          event.preventDefault();
          event.stopPropagation();
          openMenu(cachedSuggestions, false);
          return;
        }

        void (async () => {
          const correct = await isWordCorrect(activeWordInfo.word);
          if (correct) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          await showSuggestionsMenu();
        })();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      void (async () => {
        const correct = await isWordCorrect(activeWordInfo.word);
        if (correct) {
          closeMenu();
          return;
        }

        await showSuggestionsMenu();
      })();
    };

    const handleSpellcheckMenuEvent = (event) => {
      const { field, wordInfo, clientX, clientY } = event.detail ?? {};
      if (!field || !wordInfo?.word) {
        return;
      }

      const cachedSuggestions = getCachedSuggestions(wordInfo.word);

      const openMenu = (suggestions, loading = false) => {
        setMenuState({
          open: true,
          loading,
          position: { x: clientX, y: clientY },
          word: wordInfo.word,
          suggestions,
          target: field,
          replacementContext:
            "start" in wordInfo
              ? {
                  type: "text-control",
                  start: wordInfo.start,
                  end: wordInfo.end,
                }
              : {
                  type: "contenteditable",
                  range: wordInfo.range,
                },
        });
      };

      if (cachedSuggestions?.length) {
        openMenu(cachedSuggestions, false);
        return;
      }

      openMenu([], true);
      void getWordSuggestions(wordInfo.word).then((suggestions) => {
        cacheSuggestions(wordInfo.word, suggestions);
        openMenu(suggestions, false);
      });
    };

    window.addEventListener(SPELLCHECK_MENU_EVENT, handleSpellcheckMenuEvent);
    document.addEventListener("mousedown", handleMouseDown, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("scroll", closeMenu, true);

    return () => {
      window.cancelAnimationFrame(attachId);
      observer.disconnect();
      if (debounceId) {
        window.clearTimeout(debounceId);
      }
      document.removeEventListener("mousedown", handleMouseDown, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener(SPELLCHECK_MENU_EVENT, handleSpellcheckMenuEvent);
    };
  }, [applySpellcheckToTree, closeMenu]);

  return (
    <>
      {children}
      <SpellCheckContextMenu
        open={menuState.open}
        loading={menuState.loading}
        position={menuState.position}
        word={menuState.word}
        suggestions={menuState.suggestions}
        onSelect={handleSuggestionSelect}
        onIgnore={handleIgnoreWord}
        onClose={closeMenu}
      />
    </>
  );
}
