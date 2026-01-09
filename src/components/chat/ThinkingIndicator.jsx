"use client";

import React from "react";

const ThinkingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[90%] rounded-lg px-4 py-3 text-gray-700 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">
            Kyper is thinking...
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
