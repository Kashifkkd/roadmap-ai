"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CreateComet from "@/components/create-comet";
import ChatWindow from "@/components/chat/ChatWindow";

export default function DashboardLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const suggestion = searchParams.get("suggestion");
  const initialInput = searchParams.get("initialInput");

  // State for session data (simplified for UI demo)
  const [sessionData, setSessionData] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Handle form submission and navigation
  const handleFormSubmit = (formData) => {
    console.log("Form submitted with data:", formData);
    // Here you would typically save the form data and navigate
    // For demo purposes, we'll just log it
  };

  // Handle chat interactions
  const handleChatSubmit = (message) => {
    console.log("Chat message:", message);
    // Here you would typically send the message to your chat service
  };

  return (
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
          />
        </div>
      </div>
    </div>
  );
}
