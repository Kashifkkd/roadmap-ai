"use client";

import React, { useRef, useEffect, useState } from "react";
import { Drawer } from "@mui/material";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

// Main Chat Component
const Chat = ({
  messages = [],
  isLoading = false,
  onSuggestionClick,
  inputValue = "",
  onInputChange,
  onSubmit,
  error = null,
}) => {
  const bottomRef = useRef(null);
  const handleSuggestionClick = async (suggestionText) => {
    try {
      if (onSuggestionClick) {
        onSuggestionClick(suggestionText);
      }
    } catch (error) {
      console.error("Failed to send suggestion:", error);
    }
  };

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="h-full bg-background flex flex-col border-2 border-[#C7C2F9] rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 sm:p-2 pb-4">
        {hasMessages ? (
          <div className="max-w-4xl mx-auto w-full">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} role={msg.from} text={msg.content} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center pt-10 sm:space-y-6 max-w-4xl mx-auto w-full">
            <div className="w-full flex justify-center items-center">
              <Image
                src="/logo2.svg"
                alt="Kyper Logo"
                width={60}
                height={60}
                className="rounded-full animate-spin sm:w-20 sm:h-20"
                style={{
                  animation: "spin 8s linear infinite",
                }}
              />
            </div>
            <div className="text-center space-y-1 sm:space-y-2 w-full">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary ">
                Welcome!
              </h1>
              <h2 className="text-xl sm:text-2xl font-semibold text-primary">
                Let&apos;s build your next
                <br />
                Comet together.
              </h2>
            </div>
            {/* Description */}
            <p className="text-center text-base sm:text-lg text-gray-600 w-full max-w-2xl px-2">
              You can type your idea below, or pick one of the suggestions to
              get started.
            </p>
            {/* Heading for suggestions */}
            <h3 className="text-lg sm:text-xl font-medium text-primary w-full text-center">
              Pick an idea to get started
            </h3>
            <div className="space-y-2 sm:space-y-3 w-full max-w-2xl">
              <button
                onClick={() =>
                  handleSuggestionClick(
                    "Create a go-to microlearning experience for new managers"
                  )
                }
                disabled={isLoading}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 text-left bg-primary-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <span className="text-primary-700">
                  Create a go-to microlearning experience for new managers
                </span>
              </button>

              <button
                onClick={() =>
                  handleSuggestionClick(
                    "Get store managers ready for the holiday season"
                  )
                }
                disabled={isLoading}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 text-left bg-primary-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <span className="text-primary-700">
                  Get store managers ready for the holiday season
                </span>
              </button>

              <button
                onClick={() =>
                  handleSuggestionClick("Help sales leaders reinforce the SKO")
                }
                disabled={isLoading}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 text-left bg-primary-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <span className="text-primary-700">
                  Help sales leaders reinforce the SKO
                </span>
              </button>

              <button
                onClick={() =>
                  handleSuggestionClick(
                    "Add reinforcement & application to a training"
                  )
                }
                disabled={isLoading}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 text-left bg-primary-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <span className="text-primary-700">
                  Add reinforcement & application to a training
                </span>
              </button>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="bg-background border-gray-200 p-2 sm:p-2">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput
            disabled={isLoading}
            value={inputValue}
            onChange={onInputChange}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
