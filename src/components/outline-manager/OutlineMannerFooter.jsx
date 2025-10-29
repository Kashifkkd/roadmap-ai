import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Stars from "@/components/icons/Stars";
import Loading from "@/components/common/Loading";
import { graphqlClient } from "@/lib/graphql-client";

export default function OutlineMannerFooter() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isGenerating || !sessionId) return;

    let cleanup;
    const subscribe = async () => {
      cleanup = await graphqlClient.subscribeToSessionUpdates(
        sessionId,
        (sessionData) => {
          try {
            localStorage.setItem("sessionData", JSON.stringify(sessionData));
          } catch {}
          setIsGenerating(false);
          router.push("/comet-manager");
        },
        (err) => {
          console.error("Subscription error:", err);
          setError(err?.message || "Subscription failed");
          setIsGenerating(false);
        }
      );
    };

    subscribe();

    return () => {
      if (cleanup) cleanup();
    };
  }, [isGenerating, sessionId, router]);

  const handleSubmit = async () => {
    try {
      setError(null);

      // Ensure session exists
      let currentSessionId = localStorage.getItem("sessionId");
      if (!currentSessionId) {
        const sessionResponse = await graphqlClient.createSession();
        currentSessionId = sessionResponse.createSession.sessionId;
        localStorage.setItem("sessionId", currentSessionId);
        const cometJson = sessionResponse.createSession.cometJson;
        if (cometJson) {
          try {
            localStorage.setItem(
              "sessionData",
              JSON.stringify(JSON.parse(cometJson))
            );
          } catch {}
        }
      }

      setSessionId(currentSessionId);

      // Send a message to trigger server-side processing similar to outline creation
      let parsedSessionData = null;
      try {
        const raw = localStorage.getItem("sessionData");
        if (raw) parsedSessionData = JSON.parse(raw);
      } catch {}

      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: "path_creation",
        comet_creation_data: parsedSessionData?.comet_creation_data || {},
        response_outline: {},
        response_path: {},
        chatbot_conversation: parsedSessionData?.chatbot_conversation || [],
        to_modify: {},
      });

      await graphqlClient.sendMessage(cometJsonForMessage);

      // Start listening for updates, then navigate on data
      setIsGenerating(true);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(error?.message || "Unexpected error");
      setIsGenerating(false);
    }
  };

  const handleBackClick = () => {
    try {
      router?.push("/");
    } catch (error) {
      console.error("Error navigating back:", error);
    }
  };

  return (
    <>
      <Loading isOpen={isGenerating} message="Generating your comet..." />
      <div className="border-t p-4 bg-background w-full rounded-b-xl">
        <div className="flex items-center justify-between">
          <Button className="bg-muted text-primary" onClick={handleBackClick}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
          <Button
            variant="default"
            className="w-fit flex items-center justify-center gap-2 p-3 disabled:opacity-50"
            onClick={handleSubmit}
          >
            <Stars />
            <span>Create Comet</span>
          </Button>
        </div>
      </div>
    </>
  );
}
