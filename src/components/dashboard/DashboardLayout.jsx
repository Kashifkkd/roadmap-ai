"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CreateComet from "@/components/create-comet";
import ChatWindow from "@/components/chat/ChatWindow";
// import ProgressbarLoader from "@/components/loader";
import { graphqlClient } from "@/lib/graphql-client";
import Loader from "../loader2";

export default function DashboardLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const suggestion = searchParams.get("suggestion");
  const initialInput = searchParams.get("initialInput");
  const userQuestionsParam = searchParams.get("userQuestions");

  // State for session data
  const [sessionData, setSessionData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [error, setError] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [formProgress, setFormProgress] = useState(0);
  const [isAskingKyper, setIsAskingKyper] = useState(false);

  // Cleanup WebSocket connections on unmount
  useEffect(() => {
    return () => {
      graphqlClient.cleanup();
    };
  }, []);

  useEffect(() => {
    const storedSessionData =
      typeof window !== "undefined"
        ? localStorage.getItem("sessionData")
        : null;

    if (storedSessionData && !sessionData) {
      setSessionData(JSON.parse(storedSessionData));
    }
  }, [sessionData]);

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
        messagesToDisplay.push({ from: "user", content: entry.user });
      }
      if (entry.agent) {
        messagesToDisplay.push({ from: "bot", content: entry.agent });
      }
    });

    if (messagesToDisplay.length > 0) {
      setAllMessages(messagesToDisplay);
    }
  }, [sessionData]);

  // Listen for socket response when generating outline
  useEffect(() => {
    if (!isGeneratingOutline || !sessionId) return;

    let cleanup;
    const subscribeToUpdates = async () => {
      cleanup = await graphqlClient.subscribeToSessionUpdates(
        sessionId,
        (sessionData) => {
          localStorage.setItem("sessionData", JSON.stringify(sessionData));
          router.push("/outline-manager");
          setIsGeneratingOutline(false);
        },
        (error) => {
          console.error("Subscription error:", error);
          setError(error.message);
          setIsGeneratingOutline(false);
        }
      );
    };

    subscribeToUpdates();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isGeneratingOutline, sessionId, router]);

  // Handle form submission and navigation
  const handleFormSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if sessionId already exists in localStorage
      let newSessionId = localStorage.getItem("sessionId");
      let cometJson;

      // If no sessionId exists, create a new session
      if (!newSessionId) {
        const sessionResponse = await graphqlClient.createSession();
        newSessionId = sessionResponse.createSession.sessionId;
        cometJson = sessionResponse.createSession.cometJson;
        localStorage.setItem("sessionId", newSessionId);
        setSessionData(JSON.parse(cometJson));
      }

      setSessionId(newSessionId);
      if (cometJson) {
        setSessionData(JSON.parse(cometJson));
      }
      const formattedCometData = {
        "Basic Information": {
          "Comet Title": formData.cometTitle || "",
          Description: formData.specialInstructions || "",
        },
        "Audience & Objectives": {
          "Target Audience": formData.targetAudience || "",
          "Learning Objectives": Array.isArray(formData.learningObjectives)
            ? formData.learningObjectives
                .map(String)
                .map((obj) => obj.trim())
                .filter(Boolean)
            : typeof formData.learningObjectives === "string"
            ? formData.learningObjectives
                .split(",")
                .map((obj) => obj.trim())
                .filter(Boolean)
            : [],
        },
        "Experience Design": {
          Focus: formData.cometFocus || "",
          "Source Alignment": formData.sourceMaterialFidelity || "",
          "Engagement Frequency": formData.engagementFrequency || "",
          Duration: formData.lengthFrequency || "",
          "Special Instructions": formData.specialInstructions || "",
        },
      };

      let parsedSessionData = null;
      try {
        const raw = localStorage.getItem("sessionData");
        if (raw) parsedSessionData = JSON.parse(raw);
      } catch {}

      const chatbotConversation = parsedSessionData?.chatbot_conversation || [];
      const messageText =
        initialInput || formData.cometTitle || "Create a new comet";

      console.log(formData);

      const cometJsonForMessage = JSON.stringify({
        session_id: newSessionId,
        input_type: "outline_creation",
        comet_creation_data: formattedCometData,
        response_outline: {},
        response_path: {},
        additional_data: {
          personalization_enabled: formData.personalizationEnabled || false,
          habit_enabled: formData.habitEnabled || false,
          habit_description: formData.habitText || "",
        },
        chatbot_conversation: [...chatbotConversation, { user: messageText }],
        to_modify: {},
      });

      const messageResponse = await graphqlClient.sendMessage(
        cometJsonForMessage
      );

      // Step 3: Show loading - useEffect will handle the subscription
      setIsGeneratingOutline(true);
    } catch (error) {
      console.error("Error creating session or sending message:", error);
      setError(error.message);
      setIsGeneratingOutline(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isGeneratingOutline) {
    return (
      <div className="fixed inset-x-0 top-[64px] bottom-0 z-50 bg-primary-50">
        <div className="w-full h-full flex items-center justify-center p-2 overflow-auto">
          {/* <ProgressbarLoader /> */}
          <Loader />
        </div>
      </div>
    );
  }
  const welcomeMessage = [
    "Manager Review the Basic Information and Audience & Objectives sections, based on what you've shared so far.",
    "Add Source Materials for your Comet. This means any documents that will help me draft the right learning and behavior change journey for your audience.",
    "Configure your Comet in the Experience Design section.",
  ];

  return (
    <>
      <div className="flex flex-col bg-primary-50 px-2 py-2 h-full">
        <div className="h-[6px] sm:h-2 rounded-full bg-white overflow-hidden shadow-inner">
          <div
            className="h-full bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 transition-[width] duration-500 ease-out shadow-[0_6px_18px_rgba(79,70,229,0.35)]"
            style={{ width: `${formProgress}%` }}
          />
        </div>
        <div className="flex flex-1 gap-2 mt-2 flex-col lg:flex-row overflow-y-auto">
          {/* Chat Window - Hidden on small screens, Desktop: 360px width */}
          <div className="lg:block w-full lg:w-[360px] h-full lg:h-full">
            <ChatWindow
              inputType={
                prefillData ? "comet_data_update" : "comet_data_creation"
              }
              welcomeMessage={welcomeMessage}
              initialInput={initialInput}
              userQuestions={userQuestionsParam}
              onResponseReceived={(updatedSessionData) => {
                setSessionData(updatedSessionData);
                setPrefillData(updatedSessionData);
              }}
              allMessages={allMessages}
              setAllMessages={setAllMessages}
              sessionData={prefillData || sessionData}
              externalLoading={isAskingKyper}
            />
          </div>

          {/* Create Comet Form - Mobile: Full width, Desktop: flex-1 */}
          <div className="w-full lg:flex-1 h-full lg:h-full">
            <CreateComet
              suggestion={suggestion}
              initialInput={initialInput}
              cometData={null}
              sessionId={sessionId}
              prefillData={prefillData}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              error={error}
              setAllMessages={setAllMessages}
              onProgressChange={setFormProgress}
              isAskingKyper={isAskingKyper}
              setIsAskingKyper={setIsAskingKyper}
            />
          </div>
        </div>
      </div>
    </>
  );
}
