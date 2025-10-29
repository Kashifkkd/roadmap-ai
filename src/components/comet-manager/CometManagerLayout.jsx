"use client";

import React, { useEffect, useState } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import CometManager from "./CometManager";

export default function CometManagerLayout() {
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("sessionData");
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        console.log("parsedData in CometManagerLayout:", parsedData);
        setTimeout(() => {
          setSessionData(parsedData);
        }, 0);
      } catch {}
    }
  }, []);

  // Handle chat interactions
  const handleChatSubmit = (message) => {
    console.log("Chat message:", message);
    // Handle chat message and potentially update sessionData
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-1 gap-2 p-2 overflow-y-auto">
        {/* Chat Window - Hidden on small screens, Desktop: 25% width */}
        <div className="lg:block w-full lg:w-1/4 h-full">
          <ChatWindow inputType="path_updation" />
        </div>

        {/* Comet Manager - Mobile: Full width, Desktop: 75% width */}
        <div className="w-full lg:w-3/4 h-full">
          <CometManager sessionData={sessionData} />
        </div>
      </div>
    </div>
  );
}
