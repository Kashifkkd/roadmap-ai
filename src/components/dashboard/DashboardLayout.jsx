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

  // Cleanup WebSocket connections on unmount
  useEffect(() => {
    return () => {
      graphqlClient.cleanup();
    };
  }, []);

  // Handle form submission and navigation
  const handleFormSubmit = async (formData) => {
    console.log("Form submitted with data:", formData);
    
    try {
      setIsLoading(true);
      setError(null);
      const sessionResponse = await graphqlClient.createSession();
      const { sessionId: newSessionId, cometJson } = sessionResponse.createSession;
      
      setSessionId(newSessionId);
      setSessionData(JSON.parse(cometJson));
      const formattedCometData = {
        "Basic Information": {
          "Comet Title": formData.cometTitle || "",
          "Description": formData.specialInstructions || ""
        },
        "Audience & Objectives": {
          "Target Audience": formData.targetAudience || "",
          "Learning Objectives": formData.learningObjectives ? 
            formData.learningObjectives.split('\n').filter(obj => obj.trim()) : []
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
        input_type: "comet_creation",
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
      
      // Step 3: Show loading and start subscription
      setIsGeneratingOutline(true);
      
      // Subscribe to session updates
      const cleanup = await graphqlClient.subscribeToSessionUpdates(
        newSessionId,
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

  // Handle chat interactions
  const handleChatSubmit = (message) => {
    console.log("Chat message:", message);
    // Here you would typically send the message to your chat service
  };

  return (
    <>
      <Loading isOpen={isGeneratingOutline} />
      <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)]">
      <div className="flex flex-1 gap-2 p-2 flex-col lg:flex-row overflow-y-auto">
        {/* Chat Window - Hidden on small screens, Desktop: 25% width */}
        <div className="hidden lg:block w-full lg:w-1/4 h-full lg:h-full">
          <ChatWindow />
        </div>

        {/* Create Comet Form - Mobile: Full width, Desktop: 75% width */}
        <div className="w-full lg:w-3/4 h-full lg:h-full">
          <CreateComet
            suggestion={suggestion}
            initialInput={initialInput}
            cometData={null}
            sessionData={sessionData}
            sessionId={sessionId}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
    </>
  );
}
