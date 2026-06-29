import nspell from "nspell";
import {
  SPELLCHECK_DICTIONARY_PATH,
  SPELLCHECK_LANG,
} from "./constants";
import {
  getCompoundFallbackSuggestions,
  ignoreWordForSession,
  isSessionIgnoredWord,
  registerCustomWords,
} from "./customWords";
import { tokenizeWords } from "./tokenize";
import { isAcceptedWordForm } from "./wordFormFallback";

let spellCheckerPromise = null;
let spellCheckerInstance = null;

export const SPELLCHECK_READY_EVENT = "kyper-spellcheck-ready";

const spellCheckerReadyListeners = new Set();

function notifySpellCheckerReady() {
  spellCheckerReadyListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      /* ignore */
    }
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SPELLCHECK_READY_EVENT));
  }
}

export function onSpellCheckerReady(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }

  spellCheckerReadyListeners.add(listener);

  if (spellCheckerInstance) {
    listener();
  }

  return () => {
    spellCheckerReadyListeners.delete(listener);
  };
}

const decodeDictionary = (buffer) =>
  new TextDecoder("utf-8").decode(buffer);

async function loadDictionary() {
  const [affResponse, dicResponse] = await Promise.all([
    fetch(`${SPELLCHECK_DICTIONARY_PATH}/index.aff`),
    fetch(`${SPELLCHECK_DICTIONARY_PATH}/index.dic`),
  ]);

  if (!affResponse.ok || !dicResponse.ok) {
    throw new Error("Failed to load EN-US spell check dictionary");
  }

  const [affBuffer, dicBuffer] = await Promise.all([
    affResponse.arrayBuffer(),
    dicResponse.arrayBuffer(),
  ]);

  return {
    aff: decodeDictionary(affBuffer),
    dic: decodeDictionary(dicBuffer),
  };
}

export function getSpellCheckLanguage() {
  return SPELLCHECK_LANG;
}

export async function getSpellChecker() {
  if (spellCheckerInstance) {
    return spellCheckerInstance;
  }

  if (!spellCheckerPromise) {
    spellCheckerPromise = loadDictionary()
      .then((dictionary) => {
        spellCheckerInstance = nspell(dictionary);
        registerCustomWords(spellCheckerInstance);
        notifySpellCheckerReady();
        return spellCheckerInstance;
      })
      .catch((error) => {
        spellCheckerPromise = null;
        throw error;
      });
  }

  return spellCheckerPromise;
}

export function isCustomCorrectWord(word) {
  return isSessionIgnoredWord(word);
}

export async function isWordCorrect(word) {
  if (!word || !/[a-zA-Z]/.test(word)) {
    return true;
  }

  if (isSessionIgnoredWord(word)) {
    return true;
  }

  try {
    const checker = await getSpellChecker();
    return isAcceptedWordForm(checker, word);
  } catch {
    return true;
  }
}

export async function getWordSuggestions(word, limit = 10) {
  if (!word || !/[a-zA-Z]/.test(word)) {
    return [];
  }

  if (isSessionIgnoredWord(word)) {
    return [];
  }

  try {
    const checker = await getSpellChecker();
    if (isAcceptedWordForm(checker, word)) {
      return [];
    }

    const suggestions = checker.suggest(word).slice(0, limit);
    if (suggestions.length > 0) {
      return suggestions;
    }

    const lowerWord = word.toLowerCase();
    if (lowerWord !== word && !checker.correct(lowerWord)) {
      const lowerSuggestions = checker.suggest(lowerWord).slice(0, limit);
      if (lowerSuggestions.length > 0) {
        return lowerSuggestions;
      }
    }

    return getCompoundFallbackSuggestions(word).slice(0, limit);
  } catch {
    return getCompoundFallbackSuggestions(word).slice(0, limit);
  }
}

export async function findMisspelledWords(text) {
  const words = tokenizeWords(text);

  if (words.length === 0) {
    return [];
  }

  try {
    const checker = await getSpellChecker();
    return words.filter(({ word }) => {
      if (isSessionIgnoredWord(word)) {
        return false;
      }
      return !isAcceptedWordForm(checker, word);
    });
  } catch {
    return [];
  }
}

export function preloadSpellChecker() {
  void getSpellChecker();
}

export async function ignoreWord(word) {
  if (!word) return;

  ignoreWordForSession(word);

  try {
    const checker = await getSpellChecker();
    checker.add(word);
  } catch {
    /* ignore */
  }
}
