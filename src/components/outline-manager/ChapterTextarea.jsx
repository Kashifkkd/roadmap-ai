"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { graphqlClient } from "@/lib/graphql-client";

export default function ChapterTextarea({ sessionData, setAllMessages, onClose }) {
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
          localStorage.setItem("sessionData", JSON.stringify(JSON.parse(cometJson)));
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

      const cometJsonForMessage = JSON.stringify({
        session_id: sessionId,
        input_type: "outline_updation",
        comet_creation_data: sessionData?.comet_creation_data || {},
        response_outline: sessionData?.response_outline || {},
        response_path: sessionData?.response_path || {},
        chatbot_conversation: [
          {
            user: `add a chapter,  description: ${text}`,
          },
        ],
        to_modify: {},
      });

      const messageResponse = await graphqlClient.sendMessage(cometJsonForMessage);

      setAllMessages((prev) => [
        ...prev,
        { from: "user", content: text },
        { from: "bot", content: messageResponse.sendMessage },
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
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}


