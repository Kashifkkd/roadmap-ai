"use client";

import React from "react";

export const AnimatedDots = () => (
  <span className="thinking-dots">
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <style>{`
      .thinking-dots span {
        opacity: 0;
        animation: dotFade 1.5s infinite;
      }

      .thinking-dots span:nth-child(1) {
        animation-delay: 0s;
      }

      .thinking-dots span:nth-child(2) {
        animation-delay: 0.3s;
      }

      .thinking-dots span:nth-child(3) {
        animation-delay: 0.6s;
      }

      @keyframes dotFade {
        0% {
          opacity: 0;
        }
        20% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
    `}</style>
  </span>
);

const ThinkingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[90%] rounded-lg px-4 py-3 text-gray-700 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">
            Kyper is thinking
            <AnimatedDots />
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
