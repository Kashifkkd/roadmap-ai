import { screen } from "@testing-library/react";
import { expect } from "vitest";

function isLabelElement(element) {
  return element?.tagName === "LABEL";
}

/**
 * Finds a password field group by its visible label text.
 * Works for forms where the label is not wired with htmlFor.
 */
export function getPasswordFieldByLabel(labelMatcher) {
  const labels = screen.getAllByText(labelMatcher);
  const label = labels.find(isLabelElement);
  if (!label) {
    throw new Error(`No label found for matcher: ${labelMatcher}`);
  }

  const group = label.closest("div");
  const input = group?.querySelector("input");
  const toggle = group?.querySelector('button[type="button"]');

  if (!input || !toggle) {
    throw new Error(`Password field group incomplete for matcher: ${labelMatcher}`);
  }

  return { input, toggle, label };
}

export const passwordLabel = (content, element) =>
  isLabelElement(element) &&
  /^Password/.test(content.trim()) &&
  !content.includes("Confirm");

export const confirmPasswordLabel = (content, element) =>
  isLabelElement(element) && /Confirm Password/.test(content);

/**
 * Asserts show/hide toggle behavior for a password field pair.
 */
export async function expectPasswordToggleWorks(user, { input, toggle }, value) {
  expect(input).toHaveAttribute("type", "password");
  expect(input).toHaveAttribute("spellcheck", "false");

  await user.type(input, value);
  expect(input).toHaveValue(value);

  await user.click(toggle);
  expect(input).toHaveAttribute("type", "text");
  expect(input).toHaveValue(value);

  await user.click(toggle);
  expect(input).toHaveAttribute("type", "password");
  expect(input).toHaveValue(value);
}
