"use client";

import React, { useState, useEffect } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import OutlineMannerCreateComet from "./OutlineMannerCreateComet.jsx.jsx";

export default function OutlineManagerLayout() {
  const [sessionData, setSessionData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [prefillData, setPrefillData] = useState(null);

  useEffect(() => {
    // Access localStorage only on the client
    const storedSessionData = typeof window !== 'undefined' ? localStorage.getItem("sessionData") : null;
    if (storedSessionData && !sessionData) {
      setSessionData(JSON.parse(storedSessionData));
    }
  }, []);

  useEffect(() => {
    if (!sessionData) return;
    const userMessage = sessionData?.chatbot_conversation?.find(conv => conv?.user)?.user;
    const agentMessage = sessionData?.chatbot_conversation?.find(conv => conv?.agent)?.agent;

    if (agentMessage) {
      setAllMessages(prev => {
        const lastUser = prev.length > 1 ? prev[prev.length - 2]?.content : null;
        const lastAgent = prev.length > 0 ? prev[prev.length - 1]?.content : null;
        if (lastUser === userMessage && lastAgent === agentMessage) {
          return prev;
        }
        return [
          ...prev,
          { from: "user", content: userMessage },
          { from: "bot", content: agentMessage }
        ];
      });
    }
  }, [sessionData]);

  return (
    <div className="flex h-full w-full bg-primary-50">
      <div className="flex flex-1 gap-2 p-2 overflow-y-auto">
        <div className="hidden lg:block w-full lg:w-1/4 h-full">
          <ChatWindow
            inputType="outline_updation"
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            onResponseReceived={setPrefillData}
            sessionData={sessionData}
          />
        </div>
        <div className="w-full lg:w-3/4 h-full">
          <OutlineMannerCreateComet sessionData={sessionData} prefillData={prefillData} />
        </div>
      </div>
    </div>
  );
}
