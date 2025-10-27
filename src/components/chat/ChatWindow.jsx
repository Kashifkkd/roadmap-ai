"use client";

import React, { useState, useEffect } from "react";
import Chat from "./Chat";
import Loading from "@/components/common/Loading";
import { graphqlClient } from "@/lib/graphql-client";
import { useRouter } from "next/navigation";

export default function ChatWindow() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  // Cleanup WebSocket connections on unmount
  useEffect(() => {
    return () => {
      graphqlClient.cleanup();
    };
  }, []);

  const handleSuggestionClick = (suggestionText) => {
    setInputValue(suggestionText);
  };

  const handleInputChange = (value) => {
    setInputValue(value);
  };

  const handleSubmit = async (text) => {
    console.log("Message submitted:", text);
    
    try {
      setIsLoading(true);
      setError(null);
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const sessionResponse = await graphqlClient.createSession();
        currentSessionId = sessionResponse.createSession.sessionId;
        setSessionId(currentSessionId);
      }
      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: "comet_creation",
        comet_creation_data: {},
        response_outline: {},
        response_path: {},
        chatbot_conversation: [
          { user: text }
        ],
        to_modify: {}
      });
      
      const messageResponse = await graphqlClient.sendMessage(cometJsonForMessage);
      console.log("Message sent:", messageResponse.sendMessage);
      setMessages(prev => [...prev, { from: "user", content: text }]);
      setMessages(prev => [...prev, { from: "bot", content: messageResponse.sendMessage }]);
      
      setInputValue("");
      
      // Step 3: Show loading and start subscription
      setIsGeneratingOutline(true);
      
      // Subscribe to session updates
      const cleanup = await graphqlClient.subscribeToSessionUpdates(
        currentSessionId,
        (sessionData) => {
          console.log("Session update received:", sessionData);
          setIsGeneratingOutline(false);
          
          // Store session data in localStorage for outline-manager
          localStorage.setItem('outlineData', JSON.stringify(sessionData));
          
          // Redirect to outline-manager
          router.push('/outline-manager');
        },
        (error) => {
          console.error("Subscription error:", error);
          setError(error.message);
          setIsGeneratingOutline(false);
        }
      );
      
    } catch (error) {
      console.error("Error creating session or sending message:", error);
      setError(error.message);
      setIsGeneratingOutline(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Loading isOpen={isGeneratingOutline} />
      <Chat
        messages={messages}
        isLoading={isLoading}
        onSuggestionClick={handleSuggestionClick}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        error={error}
      />
    </>
  );
}
