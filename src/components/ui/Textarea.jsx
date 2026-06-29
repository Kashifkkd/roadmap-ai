"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { SPELLCHECK_LANG } from "@/lib/spellcheck/constants";
import { useSpellCheckOverlay } from "@/hooks/useSpellCheckOverlay";

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

const Textarea = React.forwardRef(function Textarea(
  { className, wrapperClassName, spellCheck = true, lang, ...props },
  forwardedRef
) {
  const { ref: registerRef, ...restProps } = props;
  const { fieldRef, backdropRef, markup } = useSpellCheckOverlay(
    spellCheck,
    true,
    props.value
  );

  const textareaElement = (
    <textarea
      spellCheck={false}
      lang={lang ?? SPELLCHECK_LANG}
      data-kyper-spellcheck-managed="react"
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        spellCheck ? "relative z-[1] bg-transparent" : "bg-background",
        className
      )}
      ref={mergeRefs(fieldRef, forwardedRef, registerRef)}
      {...restProps}
    />
  );

  if (!spellCheck) {
    return textareaElement;
  }

  return (
    <div
      className={cn(
        "relative w-full rounded-md bg-background spellcheck-field",
        wrapperClassName
      )}
    >
      <div
        ref={backdropRef}
        className="spellcheck-backdrop"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
      {textareaElement}
    </div>
  );
});
Textarea.displayName = "Textarea";
export { Textarea };
