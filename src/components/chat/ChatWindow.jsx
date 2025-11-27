"use client";

import React, { useState, useEffect, useRef } from "react";
import Chat from "./Chat";
import ProgressbarLoader from "@/components/loader";
import { graphqlClient } from "@/lib/graphql-client";
import { useRouter } from "next/navigation";

export default function ChatWindow({
  initialInput = null,
  userQuestions = null,
  inputType = "comet_data_update",
  onResponseReceived = null,
  allMessages = [],
  welcomeMessage = [],
  setAllMessages = () => {},
  sessionData,
  cometManager = false,
  externalLoading = false,
}) {
  const router = useRouter();
  const processedInitialInputRef = useRef(false);

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

  console.log("allMessages", allMessages);

  // Initialize sessionId from localStorage so subscription can start even if other components send messages
  useEffect(() => {
    if (sessionId) return;
    try {
      const existing = localStorage.getItem("sessionId");
      if (existing) {
        setSessionId(existing);
      }
    } catch {}
  }, [sessionId]);

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
    const objectivesMatch = responseText.match(
      /Learning Objectives?:\s*([^\n]+)/i
    );
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

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("initialInput");
        url.searchParams.delete("userQuestions");
        window.history.replaceState({}, "", url.pathname);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInput]);

  const handleSuggestionClick = (suggestionText) => {
    setInputValue(suggestionText);
  };

  const handleInputChange = (value) => {
    setInputValue(value);
  };

  const handleSubmit = async (text) => {
    try {
      setIsLoading(true);
      setError(null);
      let currentSessionId = sessionId;

      if (!currentSessionId) {
        currentSessionId = localStorage.getItem("sessionId");
      }

      if (!currentSessionId) {
        const sessionResponse = await graphqlClient.createSession();
        currentSessionId = sessionResponse.createSession.sessionId;
        localStorage.setItem("sessionId", currentSessionId);
      }

      setSessionId(currentSessionId);

      let parsedUserQuestions = [];
      if (userQuestions) {
        try {
          parsedUserQuestions = JSON.parse(decodeURIComponent(userQuestions));
        } catch (e) {
          console.error("Error parsing userQuestions:", e);
        }
      }

      const initialUserInput = initialInput || text;
      // setAllMessages((prev) => [...prev, { from: "user", content: initialUserInput }]);

      // if (parsedUserQuestions.length > 0 && initialInput) {
      //   const welcomeConversation = [];
      //   welcomeConversation.push({ from: "user", content: initialInput });
      //   parsedUserQuestions.forEach((item) => {
      //     if (item.question) {
      //       welcomeConversation.push({ from: "bot", content: item.question });
      //     }
      //     if (item.answer) {
      //       welcomeConversation.push({ from: "user", content: item.answer });
      //     }
      //   });
      //   setAllMessages((prev) => [...prev, ...welcomeConversation]);
      // }

      // OLD CODE 
      // const chatbotConversation = [{ user: initialUserInput }];
      // parsedUserQuestions.forEach((item) => {
      //   if (item.question) {
      //     chatbotConversation.push({ agent: item.question });
      //   }
      //   if (item.answer) {
      //     chatbotConversation.push({ user: item.answer });
      //   }
      // });

      // NEW CODE 
      const existingConversation = sessionData?.chatbot_conversation || [];

      // Build new conversation entries
      const newEntries = [{ user: initialUserInput }];
      parsedUserQuestions.forEach((item) => {
        if (item.question) {
          newEntries.push({ agent: item.question });
        }
        if (item.answer) {
          newEntries.push({ user: item.answer });
        }
      });

      const chatbotConversation = [...existingConversation, ...newEntries];

      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: inputType,
        comet_creation_data: sessionData?.comet_creation_data || {},
        response_outline: sessionData?.response_outline || {},
        response_path: sessionData?.response_path || {},
        chatbot_conversation: chatbotConversation,
        to_modify: {},
      });

      await graphqlClient.sendMessage(cometJsonForMessage);

      setAllMessages((prev) => [...prev, { from: "user", content: text }]);

      setInputValue("");
    } catch (error) {
      console.error("Error creating session or sending message:", error);
      setError(error.message);
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
          localStorage.setItem("sessionData", JSON.stringify(sessionData));

          if (sessionData.chatbot_conversation) {
            // OLD CODE 
            // const agentMessage = sessionData?.chatbot_conversation?.find(
            //   (conv) => conv?.agent
            // )?.agent;
            //
            // setAllMessages((prev) => {
            //   const lastMessage = prev[prev.length - 1];
            //   if (
            //     lastMessage?.from === "bot" &&
            //     lastMessage?.content === agentMessage
            //   ) {
            //     return prev;
            //   }
            //   return [...prev, { from: "bot", content: agentMessage }];
            // });

            // NEW CODE
            const conversation = sessionData.chatbot_conversation;
            const allMessages = [];

            conversation.forEach((entry) => {
              if (entry.user) {
                allMessages.push({ from: "user", content: entry.user });
              }
              if (entry.agent) {
                allMessages.push({ from: "bot", content: entry.agent });
              }
            });

            // Update with all messages
            if (allMessages.length > 0) {
              setAllMessages(allMessages);
            }
            setIsLoading(false);
          }

          // Notify parent component if needed
          if (onResponseReceived) {
            onResponseReceived(sessionData);
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

  if (isGeneratingOutline) {
    return <ProgressbarLoader />;
  }

  return (
    <div className="bg-white h-full w-full p-2 rounded-2xl">
      <Chat
        cometManager={cometManager}
        messages={allMessages}
        welcomeMessage={welcomeMessage}
        isLoading={isLoading || isInitialLoading || externalLoading}
        onSuggestionClick={handleSuggestionClick}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        error={error}
      />
    </div>
  );
}
