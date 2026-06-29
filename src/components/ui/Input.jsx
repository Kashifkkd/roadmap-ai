"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SPELLCHECK_LANG } from "@/lib/spellcheck/constants";
import { useSpellCheckOverlay } from "@/hooks/useSpellCheckOverlay";

const SPELLCHECK_DISABLED_TYPES = new Set([
  "password",
  "email",
  "number",
  "tel",
  "url",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "color",
  "range",
  "file",
  "hidden",
  "checkbox",
  "radio",
  "button",
  "submit",
  "reset",
]);

function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    });
  };
}

const Input = React.forwardRef(function Input(
  { className, type, spellCheck, lang, ...props },
  forwardedRef
) {
  const normalizedType = (type || "text").toLowerCase();
  const defaultSpellCheck = !SPELLCHECK_DISABLED_TYPES.has(normalizedType);
  const isSpellCheckEnabled = spellCheck ?? defaultSpellCheck;
  const { ref: registerRef, ...restProps } = props;
  const { fieldRef, backdropRef, markup } = useSpellCheckOverlay(
    isSpellCheckEnabled,
    false
  );

  const inputElement = (
      <input
        type={type}
        spellCheck={false}
        lang={lang ?? SPELLCHECK_LANG}
        data-kyper-spellcheck-managed="react"
      className={cn(
        "flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary-400 focus:border-primary-400",
        isSpellCheckEnabled
          ? "relative z-[1] bg-transparent"
          : "bg-background",
        className
      )}
      ref={mergeRefs(fieldRef, forwardedRef, registerRef)}
      {...restProps}
    />
  );

  if (!isSpellCheckEnabled) {
    return inputElement;
  }

  return (
    <div className="relative w-full rounded-md bg-background spellcheck-field">
      <div
        ref={backdropRef}
        className="spellcheck-backdrop"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
      {inputElement}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
