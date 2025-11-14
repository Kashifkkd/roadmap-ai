"use client";

import React from "react";
import { X } from "lucide-react";

export default function ImagePreview({ asset, category, onClose }) {
  if (!asset) return null;

  const assetUrl = asset?.asset_url || "";
  const assetName = asset?.name || asset?.asset_name || "Image";
  
  // Get file name from URL if name is not available
  const getFileNameFromUrl = (url) => {
    if (!url) return "Untitled Image";
    const urlPath = url.split("?")[0];
    const fileName = urlPath.split("/").pop();
    return fileName || "Untitled Image";
  };

  const displayName = assetName !== "Image" ? assetName : getFileNameFromUrl(assetUrl);

  // Extract text overlay information from asset if available
  const overlayText = asset?.overlay_text || asset?.text || null;
  const overlayDefinition = asset?.overlay_definition || asset?.definition || null;

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg overflow-hidden">
      {/* Header with Title and Close Button */}
      <div className="shrink-0 p-4 bg-white flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 capitalize">
          {category?.name || "Images & graphics"}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Image Display Area - Full height with overlay */}
      <div className="flex-1 overflow-hidden relative bg-gray-50">
        {assetUrl ? (
          <div className="relative w-full h-full">
            <img
              src={assetUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/error-img.png";
              }}
            />
            {/* Text Overlay if available - positioned like in Figma */}
            {(overlayText || overlayDefinition) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/20">
                <div className="text-center px-4">
                  {overlayText && (
                    <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] mb-3 md:mb-4">
                      {overlayText}
                    </h1>
                  )}
                  {overlayDefinition && (
                    <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] max-w-4xl mx-auto">
                      {overlayDefinition}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <p className="text-lg font-medium text-gray-700 mb-2">
              Image Not Available
            </p>
            <p className="text-sm text-gray-500">
              Unable to load image. The file URL may not be available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

