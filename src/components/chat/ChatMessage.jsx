"use client";

import React from "react";
import { cn } from "@/lib/utils";
import TypingText from "./TypingText";
import { AnimatedDots } from "./ThinkingIndicator";

const renderTextWithAnimatedDots = (text) => {
  if (typeof text === "string" && text.trimEnd().endsWith("...")) {
    const base = text.trimEnd().slice(0, -3);
    return (
      <>
        {base}
        <AnimatedDots />
      </>
    );
  }
  return text;
};

const ChatMessage = ({ role, text, animate = false, onTypingComplete }) => {
  const isUser = role === "user";
  const showAnimatedDots =
    !isUser && typeof text === "string" && text.trimEnd().endsWith("...");

  return (
    <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[90%] rounded-lg px-4 py-2 font-medium text-wrap font-sans",
          isUser
            ? "bg-primary-50 text-primary-700 text-sm sm:text-xs text-right"
            : " text-gray-700 dark:bg-gray-800 dark:text-gray-100 text-sm sm:text-xs text-left ",
        )}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {!isUser && animate ? (
            <TypingText
              text={text}
              onComplete={onTypingComplete}
              renderText={
                showAnimatedDots ? renderTextWithAnimatedDots : undefined
              }
            />
          ) : showAnimatedDots ? (
            renderTextWithAnimatedDots(text)
          ) : (
            text
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
