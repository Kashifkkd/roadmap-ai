import React from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

const Loader = ({ inputText, onBack, backLabel = "Back" }) => {
  const steps = [
    "Reading your documents",
    "Extracting key insights",
    "Understanding your prompt",
    "Analyzing audience context",
    "Identifying core themes",
    "Detecting behavioral goals",
    "Mapping learning needs",
    "Recognizing major topics",
    "Interpreting org language",
    "Clustering related ideas",
    "Filtering noise out",
    "Finding essential patterns",
    "Distilling main points",
    "Connecting concept threads",
    "Structuring step logic",
    "Sequencing chapter flow",
    "Drafting path outline",
    "Defining Aha moments",
    "Shaping action items",
    "Selecting helpful tools",
    "Checking learning alignment",
    "Ensuring behavioral relevance",
    "Organizing content groups",
    "Mapping transformation arc",
    "Reviewing source material",
    "Understanding context clues",
    "Creating learning blueprint",
    "Crafting user journey",
    "Refining content logic",
    "Building Comet skeleton",
    "Generating actionable steps",
    "Strengthening core messaging",
    "Transforming input data",
    "Preparing draft outline",
    "Finalizing outline structure",
  ];

  const itemHeight = 40;
  const totalHeight = steps.length * itemHeight;
  const animationDuration = steps.length * 1;

  return (
    <div className="w-full h-full flex flex-col rounded-2xl p-2 bg-white relative">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
        >
          <ArrowLeft size={16} />
          <span>{backLabel}</span>
        </button>
      )}
      <div className="w-full pt-14 h-full flex flex-col items-center rounded-lg px-2 sm:px-2 md:px-6 border border-[#C7C2F9]">
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-4 rounded mt-10">
          {/* Logo */}
          <div className="mb-2">
            <Image
              src="/logo2.svg"
              alt="Kyper Logo"
              width={70}
              height={70}
              className="rounded-full animate-spin"
              style={{
                animation: "spin 8s linear infinite",
              }}
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
            Your Comet Is Taking Shape
          </h1>

          <p className="text-sm sm:text-base text-gray-700 mb-12 text-center max-w-xl">
            Extracting insights, drafting early ideas, and preparing your{" "}
            {inputText} Screen.
          </p>

          <div className="w-full  relative">
            <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-white via-white/80 to-transparent z-10 pointer-events-none " />

            <div className="relative h-42 overflow-hidden flex justify-center">
              <div
                className="animate-scroll flex flex-col items-start gap-2"
                style={{
                  "--scroll-distance": `-${totalHeight}px`,
                  "--scroll-duration": `${animationDuration}s`,
                }}
              >
                {steps.map((step, index) => (
                  <div
                    key={`step-a-${index}`}
                    className="flex items-center gap-4 text-gray-700"
                  >
                    <div className="shrink-0 opacity-80">
                      <Image
                        src="/bulb.svg"
                        alt="bulb"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                    </div>
                    <span className="text-base sm:text-sm font-medium whitespace-nowrap">
                      {step}
                    </span>
                  </div>
                ))}

                {steps.map((step, index) => (
                  <div
                    key={`step-b-${index}`}
                    className="flex items-center gap-6 text-gray-700"
                    aria-hidden="true"
                  >
                    <div className="shrink-0 opacity-80">
                      <Image
                        src="/bulb.svg"
                        alt="bulb"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                    </div>
                    <span className="text-base sm:text-sm font-medium whitespace-nowrap">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white via-white/80 to-transparent z-10 pointer-events-none" />
          </div>
        </div>

        {/* CSS Animation Styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .animate-scroll {
            animation: continuousScroll var(--scroll-duration) linear infinite;
          }
          
          @keyframes continuousScroll {
            0% {
              transform: translateY(var(--scroll-distance));
            }
            100% {
              transform: translateY(0);
            }
          }
        `,
          }}
        />
      </div>
    </div>
  );
};

export default Loader;
