"use client";

import React from "react";
import Image from "next/image";

export default function DevicePreview({ selectedScreen }) {
  if (!selectedScreen) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-500">No screen selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Mobile Device Frame */}
      <div className="relative w-24 h-40 bg-gray-800 rounded-2xl p-1 shadow-lg">
        <div className="w-full h-full bg-white rounded-xl overflow-hidden">
          {/* Screen Content */}
          <div className="p-2 h-full flex flex-col">
            {/* Header */}
            <div className="shrink-0 mb-2">
              <h3 className="text-xs font-semibold text-gray-900 truncate">
                {selectedScreen.title || "Untitled"} hfhfh
              </h3>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col justify-center">
              {selectedScreen.formData?.heading && (
                <h4 className="text-xs font-medium text-gray-700 mb-1">
                  {selectedScreen.formData.heading}
                </h4>
              )}

              {selectedScreen.formData?.bodyContent && (
                <p className="text-xs text-gray-600 line-clamp-3">
                  {selectedScreen.formData.bodyContent}
                </p>
              )}

              {selectedScreen.formData?.question && (
                <p className="text-xs text-gray-700 font-medium">
                  {selectedScreen.formData.question}
                </p>
              )}

              {selectedScreen.formData?.options &&
                selectedScreen.formData.options.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {selectedScreen.formData.options
                      .slice(0, 2)
                      .map((option, index) => (
                        <div
                          key={index}
                          className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1"
                        >
                          {option}
                        </div>
                      ))}
                    {selectedScreen.formData.options.length > 2 && (
                      <div className="text-xs text-gray-400">
                        +{selectedScreen.formData.options.length - 2} more
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Screen Type Indicator */}
            <div className="shrink-0 mt-1">
              <span className="inline-block px-1 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
                {selectedScreen.type}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Info */}
      <div className="mt-2 text-center">
        <p className="text-xs font-medium text-gray-900">
          {selectedScreen.name}
        </p>
        <p className="text-xs text-gray-500">{selectedScreen.type}</p>
      </div>
    </div>
  );
}
