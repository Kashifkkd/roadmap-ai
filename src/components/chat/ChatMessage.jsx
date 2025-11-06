"use client";

import React from "react";
import { cn } from "@/lib/utils";

const ChatMessage = ({ role, text }) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-2 py-2",
          isUser
            ? "bg-primary-100 text-primary-700 font-medium text-xs"
            : " text-[#414651] dark:bg-gray-800 dark:text-gray-100 font-medium"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
