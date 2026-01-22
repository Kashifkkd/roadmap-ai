"use client";

import React, { useEffect, useState } from "react";

export default function TypingText({
  text = "",
  onComplete,
  onTyping,
  cursorColor = "bg-black",
  completeDelay = 300,
  resetOnChange = true,
  speed = 15,
  renderText,
}) {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (resetOnChange) {
      setDisplayText("");
      setIndex(0);
    }
  }, [text, resetOnChange]);

  useEffect(() => {
    if (!text) return;

    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);

        if (onTyping) onTyping();
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      const doneTimeout = setTimeout(() => {
        if (onComplete) onComplete();
      }, completeDelay);

      return () => clearTimeout(doneTimeout);
    }
  }, [text, index, onComplete, onTyping, completeDelay, speed]);

  return (
    <span className="inline">
      {renderText ? renderText(displayText) : displayText}
    </span>
  );
}
