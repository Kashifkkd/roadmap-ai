"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { Drawer } from "@mui/material";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import SequentialLoader from "./SequentialLoader";
import TypingText from "./TypingText";

/**
 * ✅ StructuredText
 * Automatically converts messages that contain "- " lines into a bullet list.
 * Example:
 * "Hello\n- item1\n- item2"
 */
const StructuredText = ({ text }) => {
  if (!text) return null;

  // Split by new lines
  const rawLines = text.split("\n");

  // Clean lines (remove extra spaces)
  const lines = rawLines.map((l) => l.trim()).filter(Boolean);

  // Find all bullet lines
  const bulletLines = lines.filter((l) => l.startsWith("- "));

  // If there are bullet lines, show intro + bullets
  if (bulletLines.length > 0) {
    const firstBulletIndex = lines.findIndex((l) => l.startsWith("- "));
    const intro = lines.slice(0, firstBulletIndex).join(" ").trim();

    return (
      <div className="space-y-2">
        {intro && <p>{intro}</p>}

        <ul className="list-disc pl-5 space-y-1">
          {bulletLines.map((item, index) => (
            <li key={index}>{item.replace("- ", "")}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Normal text
  return <p>{text}</p>;
};

const TypingWelcomeMessage = React.memo(({ messages, onTyping }) => {
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [typingMessageIndex, setTypingMessageIndex] = useState(-1);
  const prevMessagesRef = useRef("");

  useEffect(() => {
    const currentMessages = JSON.stringify(messages);
    if (currentMessages !== prevMessagesRef.current) {
      prevMessagesRef.current = currentMessages;
      setVisibleMessages([]);
      setTypingMessageIndex(messages.length > 0 ? 0 : -1);
    }
  }, [messages]);

  const handleMessageComplete = () => {
    if (typingMessageIndex < messages.length) {
      setVisibleMessages((prev) => [...prev, typingMessageIndex]);
      setTypingMessageIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col space-y-2 p-2 mr-6 mb-2 bg-[#ECF7F6] rounded-lg">
      {visibleMessages.map((idx) => (
        <div key={idx} className="bg-[#D9F0EC] rounded-lg p-2">
          <div className="text-[#399C8D] text-xs sm:text-sm font-md leading-relaxed whitespace-pre-wrap">
            <StructuredText text={messages[idx]} />
          </div>
        </div>
      ))}

      {typingMessageIndex >= 0 && typingMessageIndex < messages.length && (
        <div className="bg-[#D9F0EC] rounded-lg p-2">
          <div className="text-[#399C8D] text-xs sm:text-sm font-md leading-relaxed whitespace-pre-wrap">
            <TypingText
              key={typingMessageIndex}
              text={messages[typingMessageIndex]}
              onComplete={handleMessageComplete}
              onTyping={onTyping}
              cursorColor="bg-[#399C8D]"
              completeDelay={100}
              resetOnChange={false}
              renderText={(typedText) => <StructuredText text={typedText} />}
            />
          </div>
        </div>
      )}
    </div>
  );
});

const welcomeMessageChat = ({ messages, animate = false, onTyping }) => {
  if (animate) {
    return <TypingWelcomeMessage messages={messages} onTyping={onTyping} />;
  }

  return (
    <div className="flex flex-col space-y-2 p-2 mr-6 mb-2 bg-[#ECF7F6] rounded-lg">
      {messages.length > 0 &&
        messages.map((msg, idx) => {
          return (
            <div key={idx} className="bg-[#D9F0EC] rounded-lg p-2">
              <div className="text-[#399C8D] text-xs sm:text-sm font-md leading-relaxed whitespace-pre-wrap">
                <StructuredText text={msg} />
              </div>
            </div>
          );
        })}
    </div>
  );
};

// Main Chat Component
const Chat = ({
  messages = [],
  isLoading = false,
  onSuggestionClick,
  inputValue = "",
  onInputChange,
  onSubmit,
  cometManager = false,
  error = null,
  pageIdentifier = 1,
}) => {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Handle suggestion click
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

  // Memoize message so that it do not re render to prevent re-render when input changes
  const renderedMessages = useMemo(() => {
    if (!hasMessages) return null;

    // Convert the messages into segments either a green info group or a regular chat message
    const segments = [];

    messages.forEach((msg, idx) => {
      const isGreen = msg.status === "green";
      const matchesPage =
        typeof msg.identifier !== "undefined"
          ? msg.identifier === pageIdentifier
          : true;

      if (isGreen) {
        const shouldAnimate = matchesPage;
        const contentArray = Array.isArray(msg.content)
          ? msg.content
          : [msg.content];

        const lastSegment = segments[segments.length - 1];

        if (
          lastSegment &&
          lastSegment.type === "green" &&
          lastSegment.animate === shouldAnimate
        ) {
          lastSegment.messages.push(...contentArray);
        } else {
          segments.push({
            type: "green",
            animate: shouldAnimate,
            messages: [...contentArray],
          });
        }
      } else {
        // Regular chat message segment
        segments.push({ type: "chat", msg, idx });
      }
    });

    return segments.map((segment, Idx) => {
      if (segment.type === "green") {
        return (
          <div key={`green-group-${Idx}`}>
            {welcomeMessageChat({
              messages: segment.messages,
              animate: segment.animate,
              onTyping: () => {
                if (bottomRef.current) {
                  bottomRef.current.scrollIntoView({ behavior: "smooth" });
                }
              },
            })}
          </div>
        );
      }

      const { msg, idx } = segment;
      return <ChatMessage key={idx} role={msg.from} text={msg.content} />;
    });
  }, [messages, hasMessages, pageIdentifier]);

  return (
    <div className="h-full bg-background flex flex-col border-2 border-[#C7C2F9] rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 sm:p-2 pb-4">
        {hasMessages ? (
          <div className="max-w-4xl mx-auto w-full">
            {renderedMessages}
            {isLoading && <SequentialLoader />}
          </div>
        ) : cometManager ? (
          <div className="max-w-4xl mx-auto w-full">
            {isLoading && <SequentialLoader />}
          </div>
        ) : isLoading ? (
          <div className="max-w-4xl mx-auto w-full">
            <SequentialLoader />
          </div>
        ) : null}

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
