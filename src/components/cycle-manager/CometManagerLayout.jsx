"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import CometManager from "./CometManager";
import { usePreviewMode } from "@/contexts/PreviewModeContext";
import { graphqlClient } from "@/lib/graphql-client";
// import { sampleSessionData } from "@/hooks/sampleSessionData";
// import { temp2 } from "@/hooks/temp2";

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
  const savePromiseRef = useRef(Promise.resolve());
  const outlineRef = useRef(null);
  const initializedSessionIdRef = useRef(null);
  /** Match useCometManager: only apply response_path when the server snapshot actually changed — not when it differs from outlineRef (local edits are often ahead of sessionData). */
  const lastServerResponsePathJsonRef = useRef(null);

  useEffect(() => {
    const currentSessionId = sessionData?.session_id;

    if (
      currentSessionId &&
      initializedSessionIdRef.current !== currentSessionId
    ) {
      initializedSessionIdRef.current = null;
      setPrevOutline(null);
      lastServerResponsePathJsonRef.current = null;
    }

    if (sessionData?.response_path) {
      const pathJson = JSON.stringify(sessionData.response_path);
      if (lastServerResponsePathJsonRef.current === pathJson) {
        return;
      }
      lastServerResponsePathJsonRef.current = pathJson;

      const currentOutline = sessionData.response_path;
      setOutline(currentOutline);
      setPrevOutline(currentOutline);
      outlineRef.current = currentOutline;
      initializedSessionIdRef.current = currentSessionId;
    }
  }, [sessionData?.response_path, sessionData?.session_id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("sessionData");
    if (stored && !sessionData) {
      setSessionData(JSON.parse(stored));
    }
  }, []);

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

  const saveOutlineImmediately = useCallback(
    async (outlineToSave) => {
      if (!outlineToSave) {
        return false;
      }

      const executeSave = async () => {
        try {
          isSavingRef.current = true;

          const sessionId =
            sessionData?.session_id ||
            (typeof window !== "undefined" &&
              localStorage.getItem("sessionId")) ||
            null;

          if (!sessionId) {
            console.warn("No session ID available for auto-save");
            return false;
          }

          const cometJsonForSave = JSON.stringify({
            session_id: sessionId,
            input_type: "source_material_based_outliner",
            cycle_creation_data: sessionData?.cycle_creation_data || {},
            response_outline: sessionData?.response_outline || {},
            response_path: outlineToSave || sessionData?.response_path || {},
            chatbot_conversation: sessionData?.chatbot_conversation || [],
            to_modify: sessionData?.to_modify || {},
            webpage_url: sessionData?.webpage_url || [],
          });

          const response = await graphqlClient.autoSaveComet(cometJsonForSave);
          if (response && response.autoSaveComet) {
            try {
              let savedData;
              if (typeof response.autoSaveComet === "string") {
                const parsedResponse = JSON.parse(response.autoSaveComet);
                savedData = {
                  ...sessionData,
                  ...parsedResponse,
                  chatbot_conversation:
                    parsedResponse.chatbot_conversation ||
                    sessionData?.chatbot_conversation ||
                    [],
                };
                savedData.response_path = {
                  ...sessionData?.response_path,
                  ...(parsedResponse?.response_path ||
                    savedData?.response_path ||
                    {}),
                };
              } else {
                savedData = {
                  ...sessionData,
                  response_path: outlineToSave,
                };
              }

              localStorage.setItem("sessionData", JSON.stringify(savedData));
              setPrevOutline(outlineToSave);
            } catch (parseError) {
              console.error("Error parsing auto-save response:", parseError);
              const updatedSessionData = {
                ...sessionData,
                response_path: outlineToSave,
                chatbot_conversation: sessionData?.chatbot_conversation || [],
              };
              localStorage.setItem(
                "sessionData",
                JSON.stringify(updatedSessionData),
              );
              setPrevOutline(outlineToSave);
            }
          }

          return true;
        } catch (error) {
          console.error("Error during auto-save:", error);
          return false;
        } finally {
          isSavingRef.current = false;
        }
      };

      savePromiseRef.current = savePromiseRef.current.then(executeSave);
      return savePromiseRef.current;
    },
    [sessionData],
  );
  // Immediate save — call after structural changes (delete screen/step, reorder)
  // so Redis is always in sync and no downstream operation reads stale data.
  const flushSave = async (outlineToSave) => {
    const target = outlineToSave || outlineRef.current || outline;
    if (!target || isSavingRef.current) return;

    const sessionId =
      sessionData?.session_id ||
      (typeof window !== "undefined" && localStorage.getItem("sessionId")) ||
      null;
    if (!sessionId) return;

    try {
      isSavingRef.current = true;
      const cometJsonForSave = JSON.stringify({
        session_id: sessionId,
        input_type: sessionData?.input_type || "source_material_based_outliner",
        cycle_creation_data: sessionData?.cycle_creation_data || {},
        response_outline: sessionData?.response_outline || {},
        response_path: target,
        chatbot_conversation: sessionData?.chatbot_conversation || [],
        to_modify: sessionData?.to_modify || {},
        webpage_url: sessionData?.webpage_url || [],
      });
      await graphqlClient.autoSaveComet(cometJsonForSave);
      setPrevOutline(target);
    } catch (error) {
      console.error("Error during flush save:", error);
    } finally {
      isSavingRef.current = false;
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
        await saveOutlineImmediately(currentOutline);
      }
    }, 5000);
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [sessionData, outline, prevOutline, saveOutlineImmediately]);

  useEffect(() => {
    if (outline !== null) {
      outlineRef.current = outline;
    }
  }, [outline]);

  // Memoize welcomeMessage to prevent re-renders when auto-save updates
  // const welcomeMessage = useMemo(() => {
  //   if (sessionData?.flag?.path_created) {
  //     return [
  //       "Comet Manager Review the Basic Information and Audience & Objectives sections, based on what you've shared so far.",
  //       "Add Source Materials for your Comet. This means any documents that will help me draft the right learning and behavior change journey for your audience.",
  //       "Configure your Comet in the Experience Design section.",
  //     ];
  //   }
  // }, [sessionData?.flag?.path_created]);

  return (
    <div className="flex h-full w-full bg-primary-50 overflow-hidden">
      <div className="flex flex-1 flex-col lg:flex-row gap-2 p-1 sm:p-2 overflow-hidden">
        <div className="hidden lg:block w-full lg:w-[18em] xl:w-[20em] h-full shrink-0 overflow-hidden">
          <ChatWindow
            inputType="path_updation"
            pageIdentifier={3}
            onResponseReceived={(updatedSessionData) => {
              // Update sessionData state when socket response comes in
              setSessionData(updatedSessionData);
              // Also set prefillData for backward compatibility if needed
              setPrefillData(updatedSessionData);
            }}
            // welcomeMessage={welcomeMessage}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            sessionData={sessionData}
            cometManager={true}
            externalLoading={isAskingKyper}
          />
        </div>

        <div data-comet-pane className="flex-1 min-w-0 h-full overflow-hidden">
          <CometManager
            sessionData={sessionData}
            setSessionData={setSessionData}
            prefillData={prefillData}
            setAllMessages={setAllMessages}
            isPreviewMode={isPreviewMode}
            setIsPreviewMode={setIsPreviewMode}
            onOutlineChange={handleOutlineChange}
            saveOutlineImmediately={saveOutlineImmediately}
            onFlushSave={flushSave}
            isAskingKyper={isAskingKyper}
            setIsAskingKyper={setIsAskingKyper}
          />
        </div>
      </div>
    </div>
  );
}
