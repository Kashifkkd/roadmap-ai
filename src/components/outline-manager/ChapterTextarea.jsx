"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { graphqlClient } from "@/lib/graphql-client";

export default function ChapterTextarea({
  sessionData,
  setAllMessages,
  onClose,
}) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const sessionIdRef = useRef(null);

  const ensureSessionId = async () => {
    if (sessionIdRef.current) return sessionIdRef.current;
    let currentSessionId = null;
    try {
      currentSessionId = localStorage.getItem("sessionId");
    } catch {}
    if (!currentSessionId) {
      const sessionResponse = await graphqlClient.createSession();
      currentSessionId = sessionResponse.createSession.sessionId;
      try {
        localStorage.setItem("sessionId", currentSessionId);
      } catch {}
      const cometJson = sessionResponse.createSession.cometJson;
      if (cometJson) {
        try {
          localStorage.setItem(
            "sessionData",
            JSON.stringify(JSON.parse(cometJson)),
          );
        } catch {}
      }
    }
    sessionIdRef.current = currentSessionId;
    return currentSessionId;
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const sessionId = await ensureSessionId();

      // Always get the freshest sessionData from localStorage to avoid stale data issues
      let freshSessionData = sessionData;
      try {
        const stored = localStorage.getItem("sessionData");
        if (stored) {
          freshSessionData = JSON.parse(stored);
        }
      } catch {}

      // Append to existing conversation instead of overwriting
      const existingConversation = freshSessionData?.chatbot_conversation || [];
      const newEntry = { user: `add a chapter,  description: ${text}` };
      const chatbotConversation = [...existingConversation, newEntry];

      const cometJsonForMessage = JSON.stringify({
        session_id: sessionId,
        input_type: "outline_updation",
        comet_creation_data: freshSessionData?.comet_creation_data || {},
        response_outline: freshSessionData?.response_outline || {},
        response_path: freshSessionData?.response_path || {},
        // additional_data: {
        //   personalization_enabled: sessionData?.additional_data?.personalization_enabled || false,
        //   habit_enabled: sessionData?.additional_data?.habit_enabled || false,
        //   habit_description: sessionData?.additional_data?.habit_description || "",
        // },
        chatbot_conversation: chatbotConversation,
        to_modify: {},
        webpage_url: freshSessionData?.webpage_url || [],
      });
      /*
        const conversationMessage = `{ 'chapter': '${chapter 3}', 'value': '${currentFieldValue}', 'instruction': '${query}' }`;
         const conversationMessage = `{ 'field': '${fieldLabel}', 'value': '${currentFieldValue}', 'instruction': '${query}' }`;
   */
      const messageResponse =
        await graphqlClient.sendMessage(cometJsonForMessage);

      const botMessage = messageResponse.sendMessage;
      const processingMessages = [
        "copilot is still processing",
        "copilot is processing",
        "processing your request",
        "still processing",
      ];
      const isProcessingMessage =
        typeof botMessage === "string" &&
        processingMessages.some((msg) =>
          botMessage.toLowerCase().includes(msg.toLowerCase()),
        );

      setAllMessages((prev) => [
        ...prev,
        { from: "user", content: text },
        ...(isProcessingMessage ? [] : [{ from: "bot", content: botMessage }]),
      ]);

      // Close textarea after submit per requirement
      if (onClose) onClose();
    } catch (e) {
      setError(e?.message || "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 border rounded-md bg-white">
      <Label className="text-sm">Add Chapter Description</Label>
      <textarea
        className="w-full min-h-28 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe the new chapter..."
      />
      {error ? <p className="text-red-500 text-xs">{error}</p> : null}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
