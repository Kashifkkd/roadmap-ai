"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CreateComet from "@/components/create-comet";
import ChatWindow from "@/components/chat/ChatWindow";
import Loading from "@/components/common/Loading";
import { graphqlClient } from "@/lib/graphql-client";

export default function DashboardLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const suggestion = searchParams.get("suggestion");
  const initialInput = searchParams.get("initialInput");

  // State for session data
  const [sessionData, setSessionData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [error, setError] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);

  // Cleanup WebSocket connections on unmount
  useEffect(() => {
    return () => {
      graphqlClient.cleanup();
    };
  }, []);

  // Listen for socket response when generating outline
  useEffect(() => {
    if (!isGeneratingOutline || !sessionId) return;

    let cleanup;
    const subscribeToUpdates = async () => {
      cleanup = await graphqlClient.subscribeToSessionUpdates(
        sessionId,
        (sessionData) => {
          setIsGeneratingOutline(false);
          localStorage.setItem('sessionData', JSON.stringify(sessionData));
          router.push('/outline-manager');
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
      let newSessionId = localStorage.getItem('sessionId');
      let cometJson;

      // If no sessionId exists, create a new session
      if (!newSessionId) {
        const sessionResponse = await graphqlClient.createSession();
        newSessionId = sessionResponse.createSession.sessionId;
        cometJson = sessionResponse.createSession.cometJson;
        localStorage.setItem('sessionId', newSessionId);
        setSessionData(JSON.parse(cometJson));
      }

      setSessionId(newSessionId);
      if (cometJson) {
        setSessionData(JSON.parse(cometJson));
      }
      const formattedCometData = {
        "Basic Information": {
          "Comet Title": formData.cometTitle || "",
          "Description": formData.specialInstructions || ""
        },
        "Audience & Objectives": {
          "Target Audience": formData.targetAudience || "",
          "Learning Objectives": Array.isArray(formData.learningObjectives)
            ? formData.learningObjectives.map(String).map(obj => obj.trim()).filter(Boolean)
            : (typeof formData.learningObjectives === 'string'
              ? formData.learningObjectives.split(',').map(obj => obj.trim()).filter(Boolean)
              : [])
        },
        "Experience Design": {
          "Focus": formData.cometFocus || "",
          "Source Alignment": formData.sourceMaterialFidelity || "",
          "Engagement Frequency": formData.engagementFrequency || "",
          "Duration": formData.lengthFrequency || "",
          "Special Instructions": formData.specialInstructions || ""
        }
      };
      const messageText = initialInput || formData.cometTitle || "Create a new comet";

      const cometJsonForMessage = JSON.stringify({
        session_id: newSessionId,
        input_type: "outline_creation",
        comet_creation_data: formattedCometData,
        response_outline: {},
        response_path: {},
        chatbot_conversation: [
          { user: messageText }
        ],
        to_modify: {}
      });

      const messageResponse = await graphqlClient.sendMessage(cometJsonForMessage);
      console.log("Message sent:", messageResponse.sendMessage);

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



  return (
    <>
      <Loading isOpen={isGeneratingOutline} />
      <div className="flex flex-col bg-primary-50 px-4 py-2 lg:flex-row h-full">
        <div className="flex flex-1 gap-2 flex-col lg:flex-row overflow-y-auto">
          {/* Chat Window - Hidden on small screens, Desktop: 25% width */}
          <div className="lg:block w-full lg:w-1/4 h-full lg:h-full">
            <ChatWindow
              initialInput={initialInput}
              onResponseReceived={setPrefillData}
              allMessages={allMessages}
              setAllMessages={setAllMessages}
            />
          </div>

          {/* Create Comet Form - Mobile: Full width, Desktop: 75% width */}
          <div className="w-full lg:w-3/4 h-full lg:h-full">
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
            />
          </div>
        </div>
      </div>
    </>
  );
}
