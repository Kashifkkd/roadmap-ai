"use client";

import React, { useState, useEffect } from "react";

const TypingText = ({
  text,
  onComplete,
  onTyping,
  speed = 20,
  completeDelay = 300,
  cursorColor = "bg-primary",
  resetOnChange = true,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (resetOnChange) {
      setDisplayedText("");
      setCurrentIndex(0);
    }
  }, [text, resetOnChange]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
        // Notify parent component that typing is happening
        if (onTyping) {
          onTyping();
        }
      }, speed);

      return () => clearTimeout(timer);
    } else if (
      onComplete &&
      currentIndex >= text.length &&
      displayedText.length >= text.length
    ) {
      const completeTimer = setTimeout(() => {
        onComplete();
      }, completeDelay);
      return () => clearTimeout(completeTimer);
    }
  }, [
    currentIndex,
    text,
    onComplete,
    onTyping,
    displayedText.length,
    speed,
    completeDelay,
  ]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <span
          className={`inline-block w-0.5 h-4 ${cursorColor} ml-0.5 animate-blink`}
        />
      )}
    </span>
  );
};

export default TypingText;
