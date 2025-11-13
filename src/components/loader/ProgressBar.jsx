"use client";

const ProgressBar = ({ progress, isLastSection = false }) => {
  const isComplete = progress >= 100;
  const bgColor = isComplete && isLastSection ? "bg-gray-500" : "bg-indigo-500";
  const showBar = !isComplete || isLastSection; // Always show for last section, hide others when complete

  return (
    <div className="flex flex-col w-full justify-center h-3 gap-2 rounded-full">
      {/* Outer Bar - always rendered to prevent shrinking */}
      <div className="w-full h-3 rounded-full overflow-hidden relative">
        {/* Filled portion - hidden when complete but container remains */}
        {showBar && (
          <div
            className={`h-full ${bgColor} border-3 border-primary-500 rounded-full shadow-primary-500 transition-all duration-300 ease-out ${
              isComplete && isLastSection ? "progress-bar-moving-stripe" : ""
            }`}
            style={{
              width: `${progress}%`,
              backgroundImage:
                isComplete && isLastSection
                  ? "repeating-linear-gradient(120deg, rgba(255,255,255,0.25) 0 6px, rgba(128,128,128,0) 6px 18px)"
                  : "repeating-linear-gradient(120deg, rgba(255,255,255,0.25) 0 6px, rgba(255,255,255,0) 6px 18px)",
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
