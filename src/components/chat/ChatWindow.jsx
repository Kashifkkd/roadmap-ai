"use client";

import React, { useState, useEffect, useRef } from "react";
import Chat from "./Chat";
import Loading from "@/components/common/Loading";
import { graphqlClient } from "@/lib/graphql-client";
import { useRouter } from "next/navigation";

export default function ChatWindow({ initialInput = null, onResponseReceived = null }) {
  const router = useRouter();
  const processedInitialInputRef = useRef(false);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
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

  // Function to parse response and extract form data
  const parseResponseForFormData = (responseText) => {
    const data = {
      cometTitle: "",
      description: responseText,
      targetAudience: "",
      learningObjectives: "",
      cometFocus: "",
      sourceMaterialFidelity: "",
      engagementFrequency: "",
      lengthFrequency: "",
    };

    // Try to extract structured data from the response
    // Extract title
    const titlePatterns = [
      /Title:\s*([^\n]+)/i,
      /Comet Title:\s*([^\n]+)/i,
      /"cometTitle":\s*"([^"]+)"/i,
    ];
    for (const pattern of titlePatterns) {
      const match = responseText.match(pattern);
      if (match) {
        data.cometTitle = match[1].trim();
        break;
      }
    }

    // Extract target audience
    const audiencePatterns = [
      /Target Audience:\s*([^\n]+)/i,
      /Audience:\s*([^\n]+)/i,
      /"targetAudience":\s*"([^"]+)"/i,
    ];
    for (const pattern of audiencePatterns) {
      const match = responseText.match(pattern);
      if (match) {
        data.targetAudience = match[1].trim();
        break;
      }
    }

    // Extract learning objectives
    const objectivesMatch = responseText.match(/Learning Objectives?:\s*([^\n]+)/i);
    if (objectivesMatch) {
      data.learningObjectives = objectivesMatch[1].trim();
    }

    // Extract description/special instructions if the whole response is descriptive
    if (!data.cometTitle && responseText.length > 0) {
      data.description = responseText;
      data.specialInstructions = responseText;
    }

    return data;
  };

  // Handle initial input on load
  useEffect(() => {
    if (initialInput && !processedInitialInputRef.current) {
      processedInitialInputRef.current = true;
      setInputValue(initialInput);

      handleSubmit(initialInput);

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('initialInput');
        window.history.replaceState({}, '', url.pathname);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInput]);

  const handleSuggestionClick = (suggestionText) => {
    setInputValue(suggestionText);
  };

  console.log(">>MESSAGES", messages);

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
        currentSessionId = localStorage.getItem('sessionId');
      }

      if (!currentSessionId) {
        const sessionResponse = await graphqlClient.createSession();
        currentSessionId = sessionResponse.createSession.sessionId;
        localStorage.setItem('sessionId', currentSessionId);
      }

      setSessionId(currentSessionId);
      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: "comet_data_creation",
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

      // Add messages in a single setState call to avoid duplicates
      setMessages(prev => [
        ...prev,
        { from: "user", content: text },
        { from: "bot", content: messageResponse.sendMessage }
      ]);

      setInputValue("");

    } catch (error) {
      console.error("Error creating session or sending message:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cleanup;
    const subscribeToUpdates = async () => {
      cleanup = await graphqlClient.subscribeToSessionUpdates(
        sessionId,
        (sessionData) => {
          console.log("Session update received:", sessionData);

          if (onResponseReceived) {
            onResponseReceived(sessionData);
          }
          if (sessionData.chatbot_conversation) {
            const agentMessage = sessionData.chatbot_conversation.find(conv => conv.agent)?.agent;
            if (agentMessage) {
              setMessages(prev => {
                // Remove the last message (processing message) and add the agent message
                const updatedMessages = prev.slice(0, -1);
                return [...updatedMessages, { from: "bot", content: agentMessage }];
              });
            }
          }
        },
        (error) => {
          console.error("Subscription error:", error);
          setError(error.message);
        }
      );
    };

    subscribeToUpdates();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [sessionId, onResponseReceived]);

  return (
    <div className="bg-white h-full p-2 rounded-2xl">
      <Chat
        messages={messages}
        isLoading={isLoading || isInitialLoading}
        onSuggestionClick={handleSuggestionClick}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        error={error}
      />
      <Loading isOpen={isGeneratingOutline} />
    </div>
  );
}
