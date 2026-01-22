"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CreateComet from "@/components/create-comet";
import ChatWindow from "@/components/chat/ChatWindow";
// import ProgressbarLoader from "@/components/loader";
import { graphqlClient } from "@/lib/graphql-client";
import Loader from "../loader3";
import { useSessionSubscription } from "@/hooks/useSessionSubscription";

export default function DashboardLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const suggestion = searchParams.get("suggestion");
  // const initialInput = searchParams.get("initialInput");
  const userQuestionsParam = searchParams.get("userQuestions");

  // const isNewCometRef = useRef(!!initialInput);

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

  // Note: WebSocket cleanup is now handled by SubscriptionManager

  // Initialize sessionId and sessionData from localStorage on mount
  useEffect(() => {
    // Load sessionId
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      console.log("No sessionId found in localStorage");
    }

    // Load sessionData
    const storedSessionData = localStorage.getItem("sessionData");
    if (storedSessionData) {
      try {
        const parsed = JSON.parse(storedSessionData);
        setSessionData(parsed);
        setPrefillData(parsed);
      } catch (e) {
        console.error("Error parsing sessionData:", e);
      }
    } else {
      console.log(" No sessionData found in localStorage");
    }
  }, []); // Run only once on mount

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

  // Subscribe to session updates - persistent subscription for dashboard
  useSessionSubscription(
    sessionId,
    (sessionData) => {
      localStorage.setItem("sessionData", JSON.stringify(sessionData));
      // Create a new object reference to ensure React detects the change
      const updatedSessionData = { ...sessionData };
      setSessionData(updatedSessionData);
      // Also update prefillData so CreateComet component receives the updates
      // Using a new object reference ensures the useEffect in CreateComet triggers
      setPrefillData(updatedSessionData);
      
      // Navigate to outline-manager when outline is generated
      if (isGeneratingOutline) {
        router.push("/outline-manager");
      }
    },
    (error) => {
      console.error("Subscription error:", error);
      setError(error.message);
      setIsGeneratingOutline(false);
    }
  );

  // Handle form submission and navigation
  const handleFormSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if sessionId already exists in localStorage
      let currentSessionId = sessionId || localStorage.getItem("sessionId");
      let cometJson;

      // Only create new session if one doesn't exist
      if (!currentSessionId) {
        const sessionResponse = await graphqlClient.createSession();
        currentSessionId = sessionResponse.createSession.sessionId;
        cometJson = sessionResponse.createSession.cometJson;
        localStorage.setItem("sessionId", currentSessionId);
        setSessionData(JSON.parse(cometJson));
      } else {
        console.log("Reusing existing session:", currentSessionId);
      }

      setSessionId(currentSessionId);
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
          "Learning and Behaviour Objectives": Array.isArray(
            formData.learningObjectives
          )
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
      const messageText = formData.cometTitle || "Generate outline";

      // Initialize enabled_attributes object
      const enabled_attributes = {
        ...(parsedSessionData?.response_path?.enabled_attributes || {}),
        path_personalization: formData.personalizationEnabled || false,
        habit_enabled: formData.habitEnabled || false,
        habit_description: formData.habitText || "",
      };

      // Ensure response_path exists before assigning enabled_attributes
      if (!parsedSessionData) {
        parsedSessionData = {};
      }
      if (!parsedSessionData.response_path) {
        parsedSessionData.response_path = {};
      }
      parsedSessionData.response_path.enabled_attributes = enabled_attributes;

      console.log(formData);

      const executionId = Math.floor(Math.random() * 10000).toString();
      const traceId = crypto.randomUUID().replace(/-/g, "");
      const receivedAt = new Date().toISOString();

      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: "outline_creation",
        comet_creation_data: formattedCometData,
        response_outline: {},
        response_path: parsedSessionData?.response_path || {},
        // additional_data: {
        //   personalization_enabled: formData.personalizationEnabled || false,
        //   habit_enabled: formData.habitEnabled || false,
        //   habit_description: formData.habitText || "",
        // },
        chatbot_conversation: [...chatbotConversation, { user: messageText }],
        to_modify: parsedSessionData?.to_modify ?? {},
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

  const handleBackFromLoading = () => {
    router.push("/dashboard");
    setIsGeneratingOutline(false);
  };

  if (isGeneratingOutline) {
    return (
      <div className="fixed inset-x-0 top-[64px] bottom-0 z-50 bg-primary-50">
        <div className="w-full h-full flex items-center justify-center p-2 overflow-auto">
          <Loader
            inputText="outline"
            onBack={handleBackFromLoading}
            backLabel="Back to Dashboard"
          />
        </div>
      </div>
    );
  }
  // const welcomeMessage = [
  //   "Review the Basic Information and Audience & Objectives sections, which I drafted based on what you've shared so far.",
  //   "Then, add Source Materials for your Comet. This means any documents that will help me draft the right learning and behavior change journey for your audience.",
  //   "Finally, configure your Comet in the Experience Design section. When you're ready, move to the next step to review your Comet Outline.",
  // ];

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
              cometManager={false}
              inputType="comet_data_update"
              pageIdentifier={1}
              initialInput={null}
              userQuestions={null}
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
              initialInput={null}
              isNewComet={false}
              cometData={null}
              sessionId={sessionId}
              prefillData={prefillData || sessionData}
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
