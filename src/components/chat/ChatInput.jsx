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

  // Use external value if provided, otherwise use internal state
  const currentValue = value !== undefined ? value : text;
  const setCurrentValue = onChange || setText;

  const handleSubmit = (e) => {
    e.preventDefault();
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

  return (
    <div className="w-full p-2 bg-accent flex flex-col items-center gap-2 rounded-xl">
      <div className="relative w-full rounded-xl  text-[#717680]">
        <Search className="absolute top-3 left-2 w-4 h-4 text-[#717680]" />
        <Textarea
          placeholder={placeholder || "Ask me anything"}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          disabled={disabled}
          className={`pl-[30px] pt-2 pb-3 pr-3 text-sm text-gray-900 placeholder:text-[#717680] shadow-none border-0 rounded-xl bg-background w-full min-h-20 focus-visible:ring-primary-300 focus-visible:ring-1 focus-visible:ring-offset-2 leading-5 ${
            disabled ? " cursor-not-allowed" : ""
          }`}
        />
        <div className="absolute top-2 right-2">
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
        <div className="absolute bottom-0 left-0 flex flex-1 p-2 items-center gap-2 text-[#717680">
          <Paperclip className="w-4 h-4" />
          <span className="text-xs font-normal text-[#717680]">Attach</span>
        </div>
      </div>
    </div>
  );
}
