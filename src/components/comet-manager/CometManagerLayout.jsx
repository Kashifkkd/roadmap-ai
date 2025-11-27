"use client";

import React, { useEffect, useState, useRef } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import CometManager from "./CometManager";
import { usePreviewMode } from "@/contexts/PreviewModeContext";
import { graphqlClient } from "@/lib/graphql-client";
// import { sampleSessionData } from "@/hooks/sampleSessionData";
import { temp2 } from "@/hooks/temp2";

export default function CometManagerLayout() {
  const { isPreviewMode, setIsPreviewMode } = usePreviewMode();
  const [sessionData, setSessionData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [prefillData, setPrefillData] = useState(null);
  const [isAskingKyper, setIsAskingKyper] = useState(false);

  const [outline, setOutline] = useState(null);
  const [prevOutline, setPrevOutline] = useState(null);
  const autoSaveTimerRef = useRef(null);
  const isSavingRef = useRef(false);
  const outlineRef = useRef(null);
  const initializedSessionIdRef = useRef(null);

  console.log("sessionData", sessionData);

  useEffect(() => {
    const currentSessionId = sessionData?.session_id;

    if (
      currentSessionId &&
      initializedSessionIdRef.current !== currentSessionId
    ) {
      initializedSessionIdRef.current = null;
      setPrevOutline(null);
    }

    // Update outline when response_path changes (either new session or updated path)
    if (sessionData?.response_path) {
      const currentOutline = sessionData.response_path;
      const outlineChanged =
        JSON.stringify(currentOutline) !== JSON.stringify(outlineRef.current);

      // Update if it's a new session OR if the outline has actually changed
      if (
        initializedSessionIdRef.current !== currentSessionId ||
        outlineChanged
      ) {
        setOutline(currentOutline);

        setPrevOutline(currentOutline);
        outlineRef.current = currentOutline;
        initializedSessionIdRef.current = currentSessionId;
      }
    }
  }, [sessionData?.response_path, sessionData?.session_id]);

  console.log("allMessages", allMessages);

  useEffect(() => {
    const storedSessionData =
      typeof window !== "undefined"
        ? localStorage.getItem("sessionData")
        : null;

    if (storedSessionData && !sessionData) {
      setSessionData(JSON.parse(storedSessionData));
    }
    // sample data for testing
    // if (!storedSessionData && !sessionData) {
    //   setSessionData(temp2[0]);
    // }
  }, [sessionData]);

  // Load ALL chat messages from sessionData.chatbot_conversation
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

  const handleOutlineChange = (newOutline) => {
    if (newOutline !== null) {
      const outlineChanged =
        JSON.stringify(newOutline) !== JSON.stringify(outlineRef.current);

      if (outlineChanged) {
        outlineRef.current = newOutline;
        setOutline(newOutline);
      }
    }
  };

  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
    if (!sessionData || !sessionData.session_id) {
      return;
    }

    // Auto-save functionality - check every 30 seconds if data changed
    autoSaveTimerRef.current = setInterval(async () => {
      if (isSavingRef.current) {
        return;
      }

      const currentOutline = outlineRef.current || outline;

      const outlineChanged =
        JSON.stringify(currentOutline) !== JSON.stringify(prevOutline);

      if (outlineChanged && currentOutline !== null) {
        try {
          isSavingRef.current = true;

          const sessionId =
            sessionData?.session_id ||
            (typeof window !== "undefined" &&
              localStorage.getItem("sessionId")) ||
            null;

          if (!sessionId) {
            console.warn("No session ID available for auto-save");
            return;
          }

          const cometJsonForSave = JSON.stringify({
            session_id: sessionId,
            input_type: "source_material_based_outliner",
            comet_creation_data: sessionData?.comet_creation_data || {},
            response_outline: sessionData?.response_outline || {},
            response_path: currentOutline || sessionData?.response_path || {},
            chatbot_conversation: sessionData?.chatbot_conversation || [],
            to_modify: sessionData?.to_modify || {},
          });

          const response = await graphqlClient.autoSaveComet(cometJsonForSave);
          if (response && response.autoSaveComet) {
            try {
              let savedData;
              if (typeof response.autoSaveComet === "string") {
                // savedData = JSON.parse(response.autoSaveComet);
                const parsedResponse = JSON.parse(response.autoSaveComet);
                savedData = {
                  ...sessionData,
                  ...parsedResponse,
                  chatbot_conversation:
                    parsedResponse.chatbot_conversation ||
                    sessionData?.chatbot_conversation ||
                    [],
                };
              } else {
                savedData = {
                  ...sessionData,
                  response_path: currentOutline,
                };
              }

              localStorage.setItem("sessionData", JSON.stringify(savedData));

              setPrevOutline(currentOutline);
            } catch (parseError) {
              console.error("Error parsing auto-save response:", parseError);
              const updatedSessionData = {
                ...sessionData,
                response_path: currentOutline,
                chatbot_conversation: sessionData?.chatbot_conversation || [],
              };
              localStorage.setItem(
                "sessionData",
                JSON.stringify(updatedSessionData)
              );
              setPrevOutline(currentOutline);
            }
          }
        } catch (error) {
          console.error("Error during auto-save:", error);
        } finally {
          isSavingRef.current = false;
        }
      }
    }, 5000);
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [sessionData, outline, prevOutline]);

  useEffect(() => {
    if (outline !== null) {
      outlineRef.current = outline;
    }
  }, [outline]);

  const welcomeMessage = [
    "Comet Manager Review the Basic Information and Audience & Objectives sections, based on what you've shared so far.",
    "Add Source Materials for your Comet. This means any documents that will help me draft the right learning and behavior change journey for your audience.",
    "Configure your Comet in the Experience Design section.",
  ];

  return (
    <div className="flex h-full w-full bg-primary-50 overflow-y-auto">
      <div className="flex flex-1 lg:flex-row flex-col gap-2 p-2 overflow-y-auto">
        <div className="lg:block w-full lg:w-[360px] h-full">
          <ChatWindow
            inputType="path_updation"
            onResponseReceived={(updatedSessionData) => {
              // Update sessionData state when socket response comes in
              setSessionData(updatedSessionData);
              // Also set prefillData for backward compatibility if needed
              setPrefillData(updatedSessionData);
            }}
            welcomeMessage={welcomeMessage}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            sessionData={sessionData}
            cometManager={true}
            externalLoading={isAskingKyper}
          />
        </div>

        <div className="w-full lg:w-3/4 h-full">
          <CometManager
            sessionData={sessionData}
            prefillData={prefillData}
            setAllMessages={setAllMessages}
            isPreviewMode={isPreviewMode}
            setIsPreviewMode={setIsPreviewMode}
            onOutlineChange={handleOutlineChange}
            isAskingKyper={isAskingKyper}
            setIsAskingKyper={setIsAskingKyper}
          />
        </div>
      </div>
    </div>
  );
}
