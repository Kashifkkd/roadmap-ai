"use client";

import React, { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

export default function ChatInput({
  placeholder,
  disabled = false,
  onSubmit,
  value = "",
  onChange,
}) {
  const [text, setText] = useState("");

  // Use external value if provided, otherwise use internal state
  const currentValue = value !== undefined ? value : text;
  const setCurrentValue = onChange || setText;

  const handleSubmit = (e) => {
    e.preventDefault();
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
      <div className="relative w-full">
        <Textarea
          placeholder={placeholder || "Ask me anything..."}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          disabled={disabled}
          className={`p-3 text-sm shadow-none rounded-xl bg-background w-full min-h-20 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSubmit}
            disabled={disabled || !currentValue.trim()}
            className={`p-2 flex items-center gap-2 bg-primary text-background rounded-full ${
              disabled || !currentValue.trim()
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <ArrowUp size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
