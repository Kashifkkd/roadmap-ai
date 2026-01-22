"use client";

import React, { useState, useEffect } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import OutlineMannerCreateComet from "./OutlineMannerCreateComet.jsx";
import { useSessionSubscription } from "@/hooks/useSessionSubscription";

export default function OutlineManagerLayout() {
  const [sessionData, setSessionData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [prefillData, setPrefillData] = useState(null);
  const [isAskingKyper, setIsAskingKyper] = useState(false);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [sessionId, setSessionId] = useState(null);

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
