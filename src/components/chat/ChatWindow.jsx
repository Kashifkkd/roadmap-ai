"use client";

import React, { useState, useEffect, useRef } from "react";
import Chat from "./Chat";
import Loader from "@/components/loader3";
import { graphqlClient } from "@/lib/graphql-client";
import { useRouter } from "next/navigation";
import { useSessionSubscription } from "@/hooks/useSessionSubscription";

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
  pageIdentifier = 1,
}) {
  const router = useRouter();
  const processedInitialInputRef = useRef(false);
  const initialMessageCountRef = useRef(null);
  const previousSessionIdRef = useRef(null);
  const welcomeAnimationCheckedRef = useRef(false);
  const welcomeAnimationStateRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [shouldAnimateWelcome, setShouldAnimateWelcome] = useState(false);

  // Note: WebSocket cleanup is now handled by SubscriptionManager

  // Initialize sessionId from localStorage so subscription can start even if other components send messages
  // useEffect(() => {
  //   if (sessionId) return;
  //   try {
  //     const existing = localStorage.getItem("sessionId");
  //     if (existing) {
  //       setSessionId(existing);
  //       previousSessionIdRef.current = existing;
  //       // Reset welcome animation check when sessionId is first loaded
  //       welcomeAnimationCheckedRef.current = false;
  //       welcomeAnimationStateRef.current = false;
  //     }
  //   } catch {}
  // }, [sessionId]);

  // // Clear welcome message flags when sessionId changes (new session)
  // useEffect(() => {
  //   const currentSessionId = sessionId || localStorage.getItem("sessionId");

  //   if (currentSessionId) {
  //     // If we have a previous sessionId and it's different, clear old flags
  //     if (
  //       previousSessionIdRef.current &&
  //       currentSessionId !== previousSessionIdRef.current
  //     ) {
  //       // Session changed - clear all welcome message flags for the old session
  //       const pages = ["dashboard", "outline-manager", "comet-manager"];
  //       pages.forEach((page) => {
  //         localStorage.removeItem(
  //           `welcomeMessageShown_${previousSessionIdRef.current}_${page}`
  //         );
  //       });
  //       // Reset the animation check ref when session changes
  //       welcomeAnimationCheckedRef.current = false;
  //       welcomeAnimationStateRef.current = false;
  //     }

  //     // Update the ref to track current session
  //     if (
  //       !previousSessionIdRef.current ||
  //       previousSessionIdRef.current !== currentSessionId
  //     ) {
  //       previousSessionIdRef.current = currentSessionId;
  //     }
  //   }
  // }, [sessionId]);

  // useEffect(() => {
  //   const flag = sessionData?.flag;
  //   const hasFlag =
  //     flag?.comet_created || flag?.outline_created || flag?.path_created;

  //   if (!hasFlag) {
  //     initialMessageCountRef.current = null;
  //     welcomeAnimationCheckedRef.current = false;
  //     welcomeAnimationStateRef.current = false;
  //     setShowWelcomeMessage(false);
  //     setShouldAnimateWelcome(false);
  //     return;
  //   }

  //   // Track initial message count
  //   if (initialMessageCountRef.current === null) {
  //     initialMessageCountRef.current = allMessages.length;
  //   } else if (initialMessageCountRef.current === 0 && allMessages.length > 0) {
  //     initialMessageCountRef.current = allMessages.length;
  //   }

  //   const isUpdateMode =
  //     inputType === "outline_updation" ||
  //     inputType === "path_updation" ||
  //     inputType === "comet_data_update";
  //   const hasNewMessages = allMessages.length > initialMessageCountRef.current;

  //   const shouldShow = !(isUpdateMode && hasNewMessages);
  //   setShowWelcomeMessage(shouldShow);

  //   // Determine if we should animate the welcome message
  //   if (shouldShow) {
  //     const currentSessionId = sessionId || localStorage.getItem("sessionId");
  //     if (!currentSessionId) {
  //       setShouldAnimateWelcome(false);
  //       return;
  //     }

  //     let pageName = "dashboard";
  //     if (inputType === "outline_updation") {
  //       pageName = "outline-manager";
  //     } else if (inputType === "path_updation") {
  //       pageName = "comet-manager";
  //     } else if (
  //       inputType === "comet_data_update" ||
  //       inputType === "comet_data_creation"
  //     ) {
  //       pageName = "dashboard";
  //     }

  //     // Create a unique key
  //     const checkKey = `${currentSessionId}_${pageName}`;

  //     // Check if welcome message was already shown for this session and page
  //     const welcomeKey = `welcomeMessageShown_${currentSessionId}_${pageName}`;
  //     const wasShown = localStorage.getItem(welcomeKey) === "true";

  //     if (welcomeAnimationCheckedRef.current !== checkKey) {
  //       welcomeAnimationCheckedRef.current = checkKey;

  //       if (!wasShown) {
  //         // First time showing - animate it
  //         welcomeAnimationStateRef.current = true;
  //         setShouldAnimateWelcome(true);
  //         // Mark as shown
  //         localStorage.setItem(welcomeKey, "true");
  //       } else {
  //         // if Already shown before donot animate
  //         welcomeAnimationStateRef.current = false;
  //         setShouldAnimateWelcome(false);
  //       }
  //     } else {
  //       setShouldAnimateWelcome(welcomeAnimationStateRef.current);
  //     }
  //   } else {
  //     setShouldAnimateWelcome(false);
  //     welcomeAnimationCheckedRef.current = false;
  //     welcomeAnimationStateRef.current = false;
  //   }
  // }, [sessionData, allMessages, inputType, sessionId]);

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

      // Only create new session if one doesn't exist
      if (!currentSessionId) {
        const sessionResponse = await graphqlClient.createSession();
        currentSessionId = sessionResponse.createSession.sessionId;
        localStorage.setItem("sessionId", currentSessionId);
        // Notify source material card
        window.dispatchEvent(new Event("sessionIdChanged"));
        console.log("New session created:", currentSessionId);
      } else {
        console.log("Using existing session:", currentSessionId);
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
      console.log("chatbotConversation>>>>>>>>>>", chatbotConversation);

      // build complete payload
      const executionId = Math.floor(Math.random() * 10000).toString();
      const traceId = crypto.randomUUID().replace(/-/g, "");
      const receivedAt = new Date().toISOString();

      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: inputType,
        comet_creation_data: sessionData?.comet_creation_data ?? {},
        response_outline: sessionData?.response_outline ?? {},
        response_path: sessionData?.response_path ?? {},
        additional_data: sessionData?.additional_data ?? {
          personalization_enabled: false,
          habit_enabled: false,
          habit_description: "",
        },
        chatbot_conversation: chatbotConversation,
        to_modify: sessionData?.to_modify ?? {},
        source_material_uid: null,
        execution_id: executionId,
        retry_count: 0,
        error_history: [],
        is_retry: false,
        metadata: JSON.stringify({
          trace_id: traceId,
          received_at: receivedAt,
          execution_id: executionId,
        }),
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

  // Subscribe to session updates - ChatWindow uses the shared subscription
  // It will be persistent if on a persistent screen, temporary otherwise
  useSessionSubscription(
    sessionId,
    (sessionData) => {
      console.log("Session update received:", sessionData);

      if (onResponseReceived) {
        onResponseReceived(sessionData);
      }
      localStorage.setItem("sessionData", JSON.stringify(sessionData));

      if (sessionData.chatbot_conversation) {
        const conversation = sessionData.chatbot_conversation;
        const allMessages = [];

        conversation.forEach((entry) => {
          if (entry.user) {
            allMessages.push({
              from: "user",
              content: entry.user,
              status: entry.status,
              identifier: entry.identifier,
            });
          }
          if (entry.agent) {
            allMessages.push({
              from: "bot",
              content: entry.agent,
              status: entry.status,
              identifier: entry.identifier,
            });
          }
        });

        console.log("allMessages with status:", allMessages);
        console.log("conversation:", conversation);

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

  if (isGeneratingOutline) {
    return <Loader />;
  }

  return (
    <div className="bg-white h-full w-full p-2 rounded-2xl">
      <Chat
        cometManager={cometManager}
        messages={allMessages}
        // showWelcomeMessage={showWelcomeMessage}
        // welcomeMessage={welcomeMessage}
        // shouldAnimateWelcome={shouldAnimateWelcome}
        isLoading={isLoading || isInitialLoading || externalLoading}
        onSuggestionClick={handleSuggestionClick}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        error={error}
        pageIdentifier={pageIdentifier}
      />
    </div>
  );
}
