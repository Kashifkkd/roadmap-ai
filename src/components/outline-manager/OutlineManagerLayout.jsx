"use client";

import React, { useState, useEffect, useRef } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import OutlineMannerCreateComet from "./OutlineMannerCreateComet.jsx";
import { useSessionSubscription } from "@/hooks/useSessionSubscription";
import { graphqlClient } from "@/lib/graphql-client";

export default function OutlineManagerLayout() {
  const [sessionData, setSessionData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [prefillData, setPrefillData] = useState(null);
  const [isAskingKyper, setIsAskingKyper] = useState(false);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  // Auto-save refs
  const autoSaveTimerRef = useRef(null);
  const isSavingRef = useRef(false);
  const prevOutlineRef = useRef(null);

  useEffect(() => {
    // Access localStorage only on the client
    if (typeof window === "undefined") return;

    const storedSessionData = localStorage.getItem("sessionData");
    if (storedSessionData && !sessionData) {
      setSessionData(JSON.parse(storedSessionData));
    }

    // Get sessionId from localStorage
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }

    // Listen for sessionId changes (e.g., when a new session is created)
    const handleStorageChange = (e) => {
      if (e.key === "sessionId" && e.newValue) {
        setSessionId(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Subscribe to session updates - persistent subscription for outline-manager
  useSessionSubscription(
    sessionId,
    (updatedSessionData) => {
      try {
        localStorage.setItem("sessionData", JSON.stringify(updatedSessionData));
        // Create a new object reference to ensure React detects the change
        const updatedData = { ...updatedSessionData };
        setSessionData(updatedData);
        // Also update prefillData so child components receive the updates
        setPrefillData(updatedData);
      } catch (error) {
        console.error("Error updating session data:", error);
      }
    },
    (error) => {
      console.error("Subscription error in OutlineManagerLayout:", error);
    }
  );

  useEffect(() => {
    if (!sessionData?.chatbot_conversation) return;

    const conversation = sessionData.chatbot_conversation;
    if (!Array.isArray(conversation) || conversation.length === 0) return;

    // OLD CODE
    // const userMessage = sessionData?.chatbot_conversation?.find(
    //   (conv) => conv?.user
    // )?.user;
    // const agentMessage = sessionData?.chatbot_conversation?.find(
    //   (conv) => conv?.agent
    // )?.agent;
    //
    // if (agentMessage || userMessage) {
    //   setAllMessages((prev) => {
    //     const lastUser =
    //       prev.length > 1 ? prev[prev.length - 2]?.content : null;
    //     const lastAgent =
    //       prev.length > 0 ? prev[prev.length - 1]?.content : null;
    //     if (lastUser === userMessage && lastAgent === agentMessage) {
    //       return prev;
    //     }
    //     return [
    //       ...prev,
    //       { from: "user", content: userMessage },
    //       { from: "bot", content: agentMessage },
    //     ];
    //   });
    // }

    // NEW CODE
    const messagesToDisplay = [];

    conversation.forEach((entry) => {
      if (entry.user) {
        messagesToDisplay.push({
          from: "user",
          content: entry.user,
          status: entry.status,
          identifier: entry.identifier,
        });
      }
      if (entry.agent) {
        messagesToDisplay.push({
          from: "bot",
          content: entry.agent,
          status: entry.status,
          identifier: entry.identifier,
        });
      }
    });

    if (messagesToDisplay.length > 0) {
      setAllMessages(messagesToDisplay);
    }
  }, [sessionData]);

  // Auto-save functionality for outline changes
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
    
    // Get sessionId from state or localStorage
    const currentSessionId = sessionId || (typeof window !== "undefined" ? localStorage.getItem("sessionId") : null);
    
    if (!currentSessionId) {
      console.log("Auto-save (outline): No sessionId available, skipping auto-save setup");
      return;
    }

    console.log("Auto-save (outline): Setting up auto-save with sessionId:", currentSessionId);

    // Initialize prevOutlineRef on first run
    if (prevOutlineRef.current === null && sessionData?.response_outline) {
      prevOutlineRef.current = JSON.stringify(sessionData.response_outline);
    }

    // Auto-save functionality - check every 5 seconds if outline changed
    console.log("Auto-save (outline): Starting interval timer (5 seconds)");
    autoSaveTimerRef.current = setInterval(async () => {
      if (isSavingRef.current) {
        console.log("Auto-save (outline): Already saving, skipping...");
        return;
      }

      // Get current outline from localStorage (most up-to-date)
      let currentOutline = null;
      try {
        const stored = localStorage.getItem("sessionData");
        if (stored) {
          const parsed = JSON.parse(stored);
          currentOutline = parsed?.response_outline || null;
        }
      } catch (error) {
        console.error("Auto-save (outline): Error reading from localStorage:", error);
        return;
      }

      if (!currentOutline) {
        return;
      }

      const currentOutlineString = JSON.stringify(currentOutline);
      const prevOutlineString = prevOutlineRef.current;

      const outlineChanged = currentOutlineString !== prevOutlineString;

      if (outlineChanged && prevOutlineString !== null) {
        console.log("Auto-save (outline): Outline changed detected, triggering auto-save...");
        
        try {
          isSavingRef.current = true;

          const currentSessionIdForSave =
            currentSessionId ||
            (typeof window !== "undefined" &&
              localStorage.getItem("sessionId")) ||
            null;

          if (!currentSessionIdForSave) {
            console.warn("Auto-save (outline): No session ID available for auto-save");
            return;
          }

          // Get existing session data
          let parsedSessionData = null;
          try {
            const raw = localStorage.getItem("sessionData");
            if (raw) parsedSessionData = JSON.parse(raw);
          } catch {}

          const cometJsonForSave = JSON.stringify({
            session_id: currentSessionIdForSave,
            input_type: "outline_updation",
            comet_creation_data: parsedSessionData?.comet_creation_data || {},
            response_outline: currentOutline,
            response_path: parsedSessionData?.response_path || {},
            chatbot_conversation: parsedSessionData?.chatbot_conversation || [],
            to_modify: parsedSessionData?.to_modify || {},
          });

          console.log("Auto-save (outline): Calling autoSaveComet with updated outline");

          const response = await graphqlClient.autoSaveComet(cometJsonForSave);
          if (response && response.autoSaveComet) {
            try {
              let savedData;
              if (typeof response.autoSaveComet === "string") {
                const parsedResponse = JSON.parse(response.autoSaveComet);
                savedData = {
                  ...parsedSessionData,
                  ...parsedResponse,
                  response_outline: currentOutline,
                  chatbot_conversation:
                    parsedResponse.chatbot_conversation ||
                    parsedSessionData?.chatbot_conversation ||
                    [],
                };
              } else {
                savedData = {
                  ...parsedSessionData,
                  response_outline: currentOutline,
                };
              }

              localStorage.setItem("sessionData", JSON.stringify(savedData));
              prevOutlineRef.current = currentOutlineString;
              console.log("Auto-save (outline): Successful");
            } catch (parseError) {
              console.error("Auto-save (outline): Error parsing auto-save response:", parseError);
              const updatedSessionData = {
                ...parsedSessionData,
                response_outline: currentOutline,
                chatbot_conversation: parsedSessionData?.chatbot_conversation || [],
              };
              localStorage.setItem(
                "sessionData",
                JSON.stringify(updatedSessionData),
              );
              prevOutlineRef.current = currentOutlineString;
              console.log("Auto-save (outline): Saved to localStorage");
            }
          }
        } catch (error) {
          console.error("Auto-save (outline): Error during auto-save:", error);
        } finally {
          isSavingRef.current = false;
        }
      } else if (prevOutlineRef.current === null && currentOutline) {
        // Initialize prevOutlineRef on first run
        prevOutlineRef.current = currentOutlineString;
      }
    }, 5000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        console.log("Auto-save (outline): Cleaned up interval");
      }
    };
  }, [sessionId, sessionData]);

  // Update prevOutlineRef when sessionData changes (from subscription)
  useEffect(() => {
    if (sessionData?.response_outline) {
      const currentOutlineString = JSON.stringify(sessionData.response_outline);
      if (prevOutlineRef.current !== currentOutlineString) {
        prevOutlineRef.current = currentOutlineString;
      }
    }
  }, [sessionData?.response_outline]);

  // const welcomeMessage = [
  //   "Review the Basic Information and Audience & Objectives sections, based on what you've shared so far.",
  //   "Add Source Materials for your Comet. This means any documents that will help me draft the right learning and behavior change journey for your audience.",
  //   "Configure your Comet in the Experience Design section.",
  // ];

  return (
    <div className="flex h-full w-full bg-primary-50">
      <div className="flex flex-1 gap-2 p-2 overflow-y-auto">
        <div className="hidden lg:block w-full lg:w-[360px] h-full">
          <ChatWindow
            inputType="outline_updation"
            pageIdentifier={2}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            // welcomeMessage={welcomeMessage}
            onResponseReceived={setPrefillData}
            sessionData={prefillData || sessionData}
            externalLoading={isAskingKyper || isSubmittingStep}
          />
        </div>
        <div className="w-full lg:flex-1 h-full">
          <OutlineMannerCreateComet
            sessionData={sessionData}
            prefillData={prefillData}
            setAllMessages={setAllMessages}
            isAskingKyper={isAskingKyper}
            setIsAskingKyper={setIsAskingKyper}
            isSubmittingStep={isSubmittingStep}
            setIsSubmittingStep={setIsSubmittingStep}
          />
        </div>
      </div>
    </div>
  );
}
