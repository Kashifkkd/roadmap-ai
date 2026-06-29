import fs from "fs";
import nspell from "nspell";
import { describe, expect, it } from "vitest";
import { isAcceptedWordForm, isDictionaryMatch } from "./wordFormFallback";

function createChecker() {
  const aff = fs.readFileSync("public/spellcheck/en-US/index.aff", "utf8");
  const dic = fs.readFileSync("public/spellcheck/en-US/index.dic", "utf8");
  return nspell({ aff, dic });
}

describe("isDictionaryMatch", () => {
  it("matches direct and lowercase dictionary entries", () => {
    const checker = createChecker();
    expect(isDictionaryMatch(checker, "workflow")).toBe(true);
    expect(isDictionaryMatch(checker, "Workflow")).toBe(true);
    expect(isDictionaryMatch(checker, "teh")).toBe(false);
  });
});

describe("isAcceptedWordForm", () => {
  it("accepts plurals when the singular is in the dictionary", () => {
    const checker = createChecker();
    expect(isAcceptedWordForm(checker, "wearables")).toBe(true);
  });

  it("accepts -ity words when the stem is in the dictionary", () => {
    const checker = createChecker();
    expect(isAcceptedWordForm(checker, "modularity")).toBe(true);
  });

  it("accepts hyphen variants when parts or the joined form is valid", () => {
    const checker = createChecker();
    expect(isAcceptedWordForm(checker, "spell-check")).toBe(true);
    expect(isAcceptedWordForm(checker, "hands-on")).toBe(true);
  });

  it("accepts abbreviations and short forms", () => {
    const checker = createChecker();
    expect(isAcceptedWordForm(checker, "IMD")).toBe(true);
    expect(isAcceptedWordForm(checker, "CRM")).toBe(true);
    expect(isAcceptedWordForm(checker, "KPIs")).toBe(true);
    expect(isAcceptedWordForm(checker, "B2B")).toBe(true);
    expect(isAcceptedWordForm(checker, "ffs")).toBe(true);
  });

  it("accepts closed compounds and agent nouns missing from the base dictionary", () => {
    const checker = createChecker();
    expect(isAcceptedWordForm(checker, "roadmap")).toBe(true);
    expect(isAcceptedWordForm(checker, "Goldstar")).toBe(true);
    expect(isAcceptedWordForm(checker, "Biometric")).toBe(true);
    expect(isAcceptedWordForm(checker, "matcher")).toBe(true);
  });

  it("still flags obvious misspellings", () => {
    const checker = createChecker();
    expect(isAcceptedWordForm(checker, "teh")).toBe(false);
    expect(isAcceptedWordForm(checker, "wrold")).toBe(false);
    expect(isAcceptedWordForm(checker, "modularty")).toBe(false);
    expect(isAcceptedWordForm(checker, "teachs")).toBe(false);
    expect(isAcceptedWordForm(checker, "techer")).toBe(false);
    expect(isAcceptedWordForm(checker, "thequick")).toBe(false);
  });
});
