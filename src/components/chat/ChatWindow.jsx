"use client";

import React, { useState } from "react";
import Chat from "./Chat";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSuggestionClick = (suggestionText) => {
    setInputValue(suggestionText);
  };

  const handleInputChange = (value) => {
    setInputValue(value);
  };

  const handleSubmit = (text) => {
    console.log("Message submitted:", text);
    // Add your message handling logic here
    setInputValue("");
  };

  return (
    <Chat
      messages={messages}
      isLoading={isLoading}
      onSuggestionClick={handleSuggestionClick}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
    />
  );
}
