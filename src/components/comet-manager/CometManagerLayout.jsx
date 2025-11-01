"use client";

import React, { useEffect, useState } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import CometManager from "./CometManager";
import { usePreviewMode } from "@/contexts/PreviewModeContext";

export default function CometManagerLayout() {
  const { isPreviewMode } = usePreviewMode();
  const [sessionData, setSessionData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [prefillData, setPrefillData] = useState(null);

  
  
  console.log("isPreviewMode444", isPreviewMode);

  useEffect(() => {
    // Access localStorage only on the client
    const storedSessionData =
      typeof window !== "undefined"
        ? localStorage.getItem("sessionData")
        : null;
    if (storedSessionData && !sessionData) {
      setSessionData(JSON.parse(storedSessionData));
    }
  }, []);

  useEffect(() => {
    if (!sessionData) return;
    const userMessage = sessionData?.chatbot_conversation?.find(
      (conv) => conv?.user
    )?.user;
    const agentMessage = sessionData?.chatbot_conversation?.find(
      (conv) => conv?.agent
    )?.agent;

    if (agentMessage || userMessage) {
      setAllMessages((prev) => {
        const lastUser =
          prev.length > 1 ? prev[prev.length - 2]?.content : null;
        const lastAgent =
          prev.length > 0 ? prev[prev.length - 1]?.content : null;
        if (lastUser === userMessage && lastAgent === agentMessage) {
          return prev;
        }
        return [
          ...prev,
          { from: "user", content: userMessage },
          { from: "bot", content: agentMessage },
        ];
      });
    }
  }, [sessionData]);

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-1 gap-2 p-2 overflow-y-auto">
        {/* Chat Window - Hidden on small screens, Desktop: 25% width */}
        <div className="lg:block w-full lg:w-1/4 h-full">
          <ChatWindow
            inputType="path_updation"
            onResponseReceived={setPrefillData}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            sessionData={sessionData}
          />
        </div>

        {/* Comet Manager - Mobile: Full width, Desktop: 75% width */}
        <div className="w-full lg:w-3/4 h-full">
          <CometManager
            sessionData={sessionData}
            prefillData={prefillData}
            setAllMessages={setAllMessages}
            isPreviewMode={isPreviewMode}
          />
        </div>
      </div>
    </div>
  );
}
