"use client";

import React, { useState } from "react";
import { ArrowUp, Loader2, Search, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

export default function ChatInput({
  placeholder,
  disabled = false,
  onSubmit,
  value = "",
  onChange,
  isLoading,
}) {
  const [text, setText] = useState("");
  const [isClicked, setIsClicked] = useState(false);
  const [isAttachActive, setIsAttachActive] = useState(false);

  const currentValue = value !== undefined ? value : text;
  const setCurrentValue = onChange || setText;

  const handleAttach = () => {
    setIsAttachActive(!isAttachActive);
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 1000);
    if (!currentValue.trim() || disabled) {
      return;
    }
    if (onSubmit) {
      onSubmit(currentValue);
    }
    // Only clear if using internal state
    if (value === undefined) {
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full p-2 bg-accent flex flex-col items-center gap-2 rounded-xl h-[96px] sm:h-[116px]">
      <div className="relative w-full h-full rounded-xl  text-[#717680]">
        <Search className="absolute top-3 left-2 w-4 h-4 text-[#717680]" />
        <Textarea
          placeholder={placeholder || "Ask me anything"}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`pl-[30px] pt-2 pb-3 pr-3 text-sm text-gray-900 placeholder:text-[#717680] shadow-none border-0 rounded-xl bg-background w-full min-h-full focus-visible:ring-primary-300 focus-visible:ring-1 focus-visible:ring-offset-2 leading-5 resize-none ${
            disabled ? " cursor-not-allowed" : ""
          }`}
        />
        <div className="absolute bottom-2 right-2">
          <Button
            variant="default"
            size="icon"
            onClick={handleSubmit}
            // disabled={disabled || !currentValue.trim()}
            className="p-2 flex items-center gap-2 bg-primary text-background rounded-full hover:cursor-pointer group"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp
                size={16}
                className={`text-white transition-transform duration-300 ease-in-out ${
                  isClicked ? "rotate-90" : "group-hover:rotate-45"
                }`}
              />
            )}
          </Button>
        </div>
        <Button
          variant="default"
          size="xs"
          className={`absolute p-1 bottom-2 left-2 cursor-pointer flex text-center gap-0 rounded-sm ${
            isAttachActive
              ? "text-white bg-primary-600"
              : "text-placeholder-gray-500 bg-white  hover:text-primary-600 hover:bg-primary-50"
          }`}
          onClick={handleAttach}
        >
          <Paperclip className="w-2 h-2" />
          <span className="text-xs">Attach</span>
        </Button>
      </div>
    </div>
  );
}
