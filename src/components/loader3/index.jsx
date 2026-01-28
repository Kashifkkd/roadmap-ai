"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useSessionSubscription } from "@/hooks/useSessionSubscription";

const Loader = ({
  inputText = "Input",
  onBack,
  backLabel = "Back",
  pillText = "",
}) => {
  const [sessionData, setSessionData] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Initialize sessionId and sessionData from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }

    const storedSessionData = localStorage.getItem("sessionData");
    if (storedSessionData) {
      try {
        const parsed = JSON.parse(storedSessionData);
        setSessionData(parsed);
      } catch (error) {
        console.error("Error parsing sessionData:", error);
      }
    }
  }, []);

  // Subscribe to session updates for real-time meta state changes
  useSessionSubscription(
    sessionId,
    (updatedSessionData) => {
      try {
        localStorage.setItem("sessionData", JSON.stringify(updatedSessionData));
        setSessionData(updatedSessionData);
      } catch (error) {
        console.error("Error updating sessionData:", error);
      }
    },
    (error) => {
      console.error("Subscription error in Loader:", error);
    },
    { forceTemporary: true },
  );

  // if meta available use it otherwise use pillText prop
  const displayPillText = sessionData?.meta?.state || pillText;

  return (
    <div className="w-full h-full flex flex-col rounded-2xl p-2 bg-white relative">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
        >
          <ArrowLeft size={16} />
          <span>{backLabel}</span>
        </button>
      )}

      {/* Main Container */}
      <div className="w-full pt-14 h-full flex flex-col items-center rounded-lg px-2 sm:px-2 md:px-6 border border-[#C7C2F9]">
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-4 rounded mt-10">
          {/* Logo */}
          <div className="mb-2">
            <Image
              src="/logo2.svg"
              alt="Kyper Logo"
              width={70}
              height={70}
              className="rounded-full kyperSpin"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
            Your Comet Is Taking Shape
          </h1>

          <p className="text-sm sm:text-base text-gray-700 mb-12 text-center max-w-xl">
            Extracting insights, drafting early ideas, and preparing your{" "}
            <span className="font-medium">{inputText}</span> Screen.
          </p>

          {/* Pill Loader */}
          <div className="revealPill mx-auto" aria-label={displayPillText}>
            <div className="pillContent">
              <div className="pillIcon" aria-hidden="true">
                <Sparkles size={16} className="text-[#6C63FF]" />
              </div>

              <div className="pillDivider" aria-hidden="true" />

              <div className="pillText">
                <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                  {displayPillText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
