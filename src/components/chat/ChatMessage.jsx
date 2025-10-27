"use client";

import React from "react";
import { cn } from "@/lib/utils";

const ChatMessage = ({ role, text }) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
