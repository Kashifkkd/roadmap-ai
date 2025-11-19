"use client";

import React from "react";
import { cn } from "@/lib/utils";

const ChatMessage = ({ role, text }) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[90%] rounded-lg px-4 py-2 font-medium text-wrap font-sans",
          isUser
            ? "bg-primary-50 text-primary-700 text-sm sm:text-xs text-right"
            : " text-gray-700 dark:bg-gray-800 dark:text-gray-100 text-sm sm:text-xs text-left "
        )}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
