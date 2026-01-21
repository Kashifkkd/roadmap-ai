"use client";

import React from "react";
import Image from "next/image";
import { ArrowLeft, Sparkles } from "lucide-react";

const Loader = ({
    inputText = "Input",
    onBack,
    backLabel = "Back",
    pillText = "Building Welcome Chapter",
}) => {
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
                    <div className="revealPill" aria-label={pillText}>
                        <div className="pillContent">
                            <div className="pillIcon" aria-hidden="true">
                                <Sparkles size={16} className="text-[#6C63FF]" />
                            </div>

                            <div className="pillDivider" aria-hidden="true" />

                            <div className="pillText">
                                <span className="text-sm font-semibold text-gray-900">
                                    {pillText}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ GLOBAL CSS (Fix for not applying issue) */}
            <style jsx global>{`
        .kyperSpin {
          animation: kyperSpin 8s linear infinite;
        }

        @keyframes kyperSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* ✅ pill wrapper */
        .revealPill {
          height: 52px;
          border-radius: 9999px;
          border: 2px solid #bdb5ff;
          background: #f6f5ff;
          overflow: hidden;
          width: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0px 4px 12px rgba(124, 92, 255, 0.08);
          animation: pillExpand 2.4s ease-in-out infinite;
        }

        .pillContent {
          position: relative;
          height: 52px;
          width: 100%;
        }

        /* ✅ icon circle */
        .pillIcon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          border: 1.5px solid #bdb5ff;
          background: #edeaff;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: iconMove 2.4s ease-in-out infinite;
        }

        /* ✅ divider line */
        .pillDivider {
          position: absolute;
          top: 50%;
          left: 70px;
          transform: translateY(-50%);
          height: 22px;
          width: 1px;
          background: #c7c2f9;
          opacity: 0;
          animation: dividerFade 2.4s ease-in-out infinite;
        }

        /* ✅ text reveal */
        .pillText {
          position: absolute;
          top: 50%;
          left: 86px;
          transform: translateY(-50%);
          white-space: nowrap;
          opacity: 0;
          filter: blur(2px);
          animation: textReveal 2.4s ease-in-out infinite;
        }

        /* ✅ pill expand-collapse */
        @keyframes pillExpand {
          0% {
            width: 62px;
          }
          18% {
            width: 62px;
          }
          36% {
            width: 310px;
          }
          72% {
            width: 310px;
          }
          90% {
            width: 62px;
          }
          100% {
            width: 62px;
          }
        }

        /* ✅ icon moves from center to left */
        @keyframes iconMove {
          0% {
            left: 50%;
          }
          18% {
            left: 50%;
          }
          36% {
            left: 32px;
          }
          72% {
            left: 32px;
          }
          90% {
            left: 50%;
          }
          100% {
            left: 50%;
          }
        }

        /* ✅ divider only visible when expanded */
        @keyframes dividerFade {
          0%,
          22% {
            opacity: 0;
          }
          40%,
          70% {
            opacity: 1;
          }
          86%,
          100% {
            opacity: 0;
          }
        }

        /* ✅ text fade + blur effect */
        @keyframes textReveal {
          0%,
          24% {
            opacity: 0;
            transform: translateY(-50%) translateX(-6px);
            filter: blur(2px);
          }
          42%,
          70% {
            opacity: 1;
            transform: translateY(-50%) translateX(0px);
            filter: blur(0px);
          }
          86%,
          100% {
            opacity: 0;
            transform: translateY(-50%) translateX(-6px);
            filter: blur(2px);
          }
        }
      `}</style>
        </div>
    );
};

export default Loader;
