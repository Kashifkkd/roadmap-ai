"use client";

import React, { useState, useEffect } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import OutlineMannerCreateComet from "./OutlineMannerCreateComet.jsx";

export default function OutlineManagerLayout() {
  const [sessionData, setSessionData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [prefillData, setPrefillData] = useState(null);
  const [isAskingKyper, setIsAskingKyper] = useState(false);

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

  const welcomeMessage = [
    "Review the Basic Information and Audience & Objectives sections, based on what you've shared so far.",
    "Add Source Materials for your Comet. This means any documents that will help me draft the right learning and behavior change journey for your audience.",
    "Configure your Comet in the Experience Design section.",
  ];

  return (
    <div className="flex h-full w-full bg-primary-50">
      <div className="flex flex-1 gap-2 p-2 overflow-y-auto">
        <div className="hidden lg:block w-full lg:w-[360px] h-full">
          <ChatWindow
            inputType="outline_updation"
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            welcomeMessage={welcomeMessage}
            onResponseReceived={setPrefillData}
            sessionData={sessionData}
            externalLoading={isAskingKyper}
          />
        </div>
        <div className="w-full lg:flex-1 h-full">
          <OutlineMannerCreateComet
            sessionData={sessionData}
            prefillData={prefillData}
            setAllMessages={setAllMessages}
            isAskingKyper={isAskingKyper}
            setIsAskingKyper={setIsAskingKyper}
          />
        </div>
      </div>
    </div>
  );
}
