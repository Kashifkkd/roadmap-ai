"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const loadingMessages = [
  "Interpreting your question…",
  "Checking your progress and data source…",
  "Synthesizing index data…",
  "Crafting your answer…",
];

const TypingText = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(completeTimer);
    }
  }, [currentIndex, text, onComplete]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-blink" />
      )}
    </span>
  );
};

const SequentialLoader = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const handleMessageComplete = () => {
    if (currentMessageIndex < loadingMessages.length - 1) {
      setCurrentMessageIndex((prev) => prev + 1);
    }
  };

  const currentMessage = loadingMessages[currentMessageIndex];

  return (
    <div className={cn("flex mb-4 justify-start")}>
      <div
        className={cn(
          "max-w-[90%] rounded-lg px-4 py-2 font-medium text-wrap font-sans",
          "text-gray-700 dark:bg-gray-800 dark:text-gray-100 text-sm sm:text-xs text-left"
        )}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0 bg-primary animate-pulse" />
            <span className="text-gray-700">
              <TypingText
                key={currentMessageIndex}
                text={currentMessage}
                onComplete={handleMessageComplete}
              />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SequentialLoader;
