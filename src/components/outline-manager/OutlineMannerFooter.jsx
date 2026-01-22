import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Stars from "@/components/icons/Stars";
import Loader from "@/components/loader2";
import { graphqlClient } from "@/lib/graphql-client";
import { tokenManager } from "@/lib/api-client";
import { useSessionSubscription } from "@/hooks/useSessionSubscription";

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

  const getChaptersCount = (sessionData) => {
    const chaptersA = sessionData?.response_path?.chapters;
    const chaptersB = sessionData?.chapters;

    if (Array.isArray(chaptersA)) return chaptersA.length;
    if (Array.isArray(chaptersB)) return chaptersB.length;

    // sometimes it can be an object like { 0: {...}, 1: {...} }
    if (chaptersA && typeof chaptersA === "object") return Object.keys(chaptersA).length;
    if (chaptersB && typeof chaptersB === "object") return Object.keys(chaptersB).length;

    return 0;
  };

  // Subscribe to session updates - persistent subscription for outline-manager
  useSessionSubscription(
    sessionId,
    (sessionData) => {
      try {
        localStorage.setItem("sessionData", JSON.stringify(sessionData));
      } catch {}

      // Only navigate when generating and chapters > 1
      if (isGenerating) {
        const chaptersCount = getChaptersCount(sessionData);
        if (chaptersCount > 1) {
          router.push("/comet-manager");
        }
      }
    },
    (err) => {
      console.error("Subscription error:", err);
      setError(err?.message || "Subscription failed");
      setIsGenerating(false);
    }
  );


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

      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: "initial_chapter_creation",
        // comet_creation_data: parsedSessionData?.comet_creation_data || {},
        comet_creation_data: parsedSessionData?.comet_creation_data || {},
        // additional_data: {
        //   personalization_enabled:
        //     parsedSessionData?.additional_data?.personalization_enabled ||
        //     false,
        //   habit_enabled:
        //     parsedSessionData?.additional_data?.habit_enabled || false,
        //   habit_description:
        //     parsedSessionData?.additional_data?.habit_description || "",
        // },
        response_outline: parsedSessionData?.response_outline || {},
        response_path: parsedSessionData?.response_path || {},
        chatbot_conversation: parsedSessionData?.chatbot_conversation || [],
        to_modify: {},
      });

      await graphqlClient.sendMessage(cometJsonForMessage);
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

  const handleBackFromLoading = () => {
    router?.push("/outline-manager");
    setIsGenerating(false);
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-x-0 top-[64px] bottom-0 z-50 bg-primary-50">
        <div className="w-full h-full flex items-center justify-center p-2 overflow-auto">
          <Loader
            inputText="Comet"
            onBack={handleBackFromLoading}
            backLabel="Back to Outline Manager"
          />
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
