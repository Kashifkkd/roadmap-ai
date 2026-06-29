import { describe, expect, it } from "vitest";
import {
  filterDynamicTags,
  matchDynamicTagAtCursor,
  PATH_EMAIL_DYNAMIC_TAGS,
} from "./pathEmailDynamicTags";

describe("matchDynamicTagAtCursor", () => {
  it("returns a match while typing a partial tag", () => {
    const text = "Hello @user_n";
    const result = matchDynamicTagAtCursor(text, text.length);
    expect(result).toEqual({
      query: "user_n",
      atIndex: 6,
      replaceLength: 7,
    });
  });

  it("returns null when cursor is after a complete tag", () => {
    for (const tag of PATH_EMAIL_DYNAMIC_TAGS) {
      const text = `Hello ${tag}`;
      expect(matchDynamicTagAtCursor(text, text.length)).toBeNull();
    }
  });

  it("returns null when there is no @ token at the cursor", () => {
    expect(matchDynamicTagAtCursor("Hello world", 11)).toBeNull();
  });
});

describe("filterDynamicTags", () => {
  it("returns all tags for an empty query", () => {
    expect(filterDynamicTags("")).toEqual(PATH_EMAIL_DYNAMIC_TAGS);
  });

  it("filters tags by prefix", () => {
    expect(filterDynamicTags("user")).toEqual(["@user_name", "@user_activity"]);
  });
});
