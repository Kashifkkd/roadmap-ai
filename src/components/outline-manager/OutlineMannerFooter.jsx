import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Stars from "@/components/icons/Stars";
import Loader from "@/components/loader2";
import { graphqlClient } from "@/lib/graphql-client";
import { tokenManager } from "@/lib/api-client";

export default function OutlineMannerFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const loginButtonRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Check authentication status

  useEffect(() => {
    const checkAuth = () => {
      const auth = tokenManager.isAuthenticated();
      setIsAuthenticated(auth);
    };
    checkAuth();

    if (typeof window === "undefined") return;

    window.addEventListener("auth-changed", checkAuth);
    return () => {
      window.removeEventListener("auth-changed", checkAuth);
    };
  }, []);

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
          router.push("/comet-manager");
          setIsGenerating(false);
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
    // Check if user is authenticated
    if (!tokenManager.isAuthenticated()) {
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            "postLoginRedirect",
            pathname || "/outline-manager"
          );
        } catch {}

        const buttonRect = loginButtonRef.current?.getBoundingClientRect();
        let buttonPosition = null;

        if (buttonRect) {
          const dialogWidth = 350;
          let top = 70;
          let left = buttonRect.left + window.scrollX;

          if (left + dialogWidth > window.innerWidth + window.scrollX) {
            left = window.innerWidth + window.scrollX - dialogWidth - 16;
          }

          if (left < window.scrollX) {
            left = window.scrollX + 16;
          }

          buttonPosition = {
            top,
            left,
            width: buttonRect.width,
          };
        }

        window.dispatchEvent(
          new CustomEvent("open-login-dialog", {
            detail: {
              buttonPosition,
              source: "outline-footer",
              redirectPath: pathname || "/outline-manager",
            },
          })
        );
      }
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);

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

      console.log(
        "parsedSessionData>>>>>>>>>>>>>>>>>>>>>>>",
        parsedSessionData.chatbot_conversation
      );

      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: "path_creation",
        // comet_creation_data: parsedSessionData?.comet_creation_data || {},
        comet_creation_data: parsedSessionData?.comet_creation_data || {},
        additional_data: {
          personalization_enabled:
            parsedSessionData?.additional_data?.personalization_enabled ||
            false,
          habit_enabled:
            parsedSessionData?.additional_data?.habit_enabled || false,
          habit_description:
            parsedSessionData?.additional_data?.habit_description || "",
        },
        response_outline: parsedSessionData?.response_outline || {},
        response_path: {},
        chatbot_conversation: parsedSessionData?.chatbot_conversation || [],
        to_modify: {},
      });

      await graphqlClient.sendMessage(cometJsonForMessage);
      console.log(
        "cometJsonForMessage>>>>>>>>>>>>>>>>>>>>>>>",
        parsedSessionData.chatbot_conversation
      );

      // Start listening for updates, then navigate on data
      // isGenerating is already set to true at the start
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(error?.message || "Unexpected error");
      setIsGenerating(false);
    }
  };

  const handleBackClick = () => {
    try {
      router?.push("/dashboard");
    } catch (error) {
      console.error("Error navigating back:", error);
    }
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-x-0 top-[64px] bottom-0 z-50 bg-primary-50">
        <div className="w-full h-full flex items-center justify-center p-2 overflow-auto">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border-t p-4 bg-background w-full rounded-b-xl">
        <div className="flex items-center justify-between">
          <Button className="bg-muted text-primary" onClick={handleBackClick}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
          {isAuthenticated ? (
            <Button
              variant="default"
              className="w-fit flex items-center justify-center gap-2 p-3 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isGenerating}
              ref={loginButtonRef}
            >
              <Stars />
              <span>Create Comet</span>
            </Button>
          ) : (
            <Button
              variant="default"
              className="w-fit flex items-center justify-center gap-2 p-3 disabled:opacity-50"
              onClick={handleSubmit}
              ref={loginButtonRef}
            >
              <Stars />
              <span>Login to Create Comet</span>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
