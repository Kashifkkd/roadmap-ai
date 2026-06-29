import { findMisspelledWords, getWordSuggestions } from "./spellcheckService";
import {
  cacheSuggestions,
  findClosestMisspelledWord,
  findMisspelledWordAtIndex,
  findMisspelledWordForWordInfo,
  getFieldMisspelledWords,
  setFieldMisspelledWords,
} from "./fieldMisspelledStore";
import { buildMisspelledMarkup } from "./tokenize";
import {
  applySpellcheckAttributes,
  getWordFromContentEditable,
} from "./utils";

const MIRROR_STYLE_PROPS = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
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
    backdrop.className = "spellcheck-backdrop spellcheck-backdrop-quill";
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
    backdrop.style.whiteSpace = "pre-wrap";
    backdrop.style.wordBreak = "break-word";
    backdrop.style.zIndex = "0";
    backdrop.scrollTop = root.scrollTop;
  };

  const runSpellCheck = async () => {
    const text = editor.getText()?.replace(/\n$/, "") ?? "";
    const misspelled = await findMisspelledWords(text);
    setFieldMisspelledWords(root, misspelled);
    if (backdrop) {
      backdrop.innerHTML = buildMisspelledMarkup(text, misspelled);
    }
    syncBackdropStyles();

    await Promise.all(
      [...new Set(misspelled.map(({ word }) => word.toLowerCase()))].map(
        async (wordKey) => {
          const sourceWord =
            misspelled.find(({ word }) => word.toLowerCase() === wordKey)
              ?.word ?? wordKey;
          cacheSuggestions(sourceWord, await getWordSuggestions(sourceWord));
        }
      )
    );
  };

  const scheduleSpellCheck = () => {
    if (debounceId) window.clearTimeout(debounceId);
    debounceId = window.setTimeout(() => {
      void runSpellCheck();
    }, 200);
  };

  editor.on("text-change", scheduleSpellCheck);
  root.addEventListener("scroll", () => {
    if (backdrop) backdrop.scrollTop = root.scrollTop;
  });

  void runSpellCheck();

  const handleContextMenu = (event) => {
    const existingMisspelled = getFieldMisspelledWords(root);
    if (existingMisspelled.length > 0) {
      event.preventDefault();
      event.stopPropagation();
    }

    void (async () => {
      await runSpellCheck();
      const wordInfo =
        getWordFromContentEditable(root, event.clientX, event.clientY) ??
        findMisspelledWordAtIndex(root, 0) ??
        findClosestMisspelledWord(root, 0, Number.POSITIVE_INFINITY);

      if (!wordInfo?.word) return;

      if (!existingMisspelled.length) {
        event.preventDefault();
        event.stopPropagation();
      }

      window.dispatchEvent(
        new CustomEvent("kyper-spellcheck-menu", {
          detail: {
            field: root,
            wordInfo,
            clientX: event.clientX,
            clientY: event.clientY,
          },
        })
      );
    })();
  };

  root.addEventListener("contextmenu", handleContextMenu);

  const preloadIntervalId = window.setInterval(() => {
    void runSpellCheck();
  }, 400);
  window.setTimeout(() => window.clearInterval(preloadIntervalId), 5000);

  return () => {
    editor.off("text-change", scheduleSpellCheck);
    root.removeEventListener("contextmenu", handleContextMenu);
    window.clearInterval(preloadIntervalId);
    if (debounceId) window.clearTimeout(debounceId);
  };
}
