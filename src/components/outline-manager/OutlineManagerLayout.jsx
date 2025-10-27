"use client";

import React, { useState } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import OutlineMannerCreateComet from "./OutlineMannerCreateComet.jsx.jsx";

export default function OutlineManagerLayout() {
  const [sessionData, setSessionData] = useState(null);

  // Handle chat interactions
  const handleChatSubmit = (message) => {
    console.log("Chat message:", message);
    // Handle chat message and potentially update sessionData
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-1 gap-2 p-2 overflow-y-auto">
        {/* Chat Window - Hidden on small screens, Desktop: 25% width */}
        <div className="hidden lg:block w-full lg:w-1/4 h-full">
          <ChatWindow />
        </div>

        {/* Outline Manager - Mobile: Full width, Desktop: 75% width */}
        <div className="w-full lg:w-3/4 h-full">
          <OutlineMannerCreateComet sessionData={sessionData} />
        </div>
      </div>
    </div>
  );
}
