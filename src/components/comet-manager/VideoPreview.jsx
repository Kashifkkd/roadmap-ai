"use client";

import React, { useState } from "react";
import { X, ExternalLink } from "lucide-react";

export default function VideoPreview({ asset, category, onClose }) {
  const [hasError, setHasError] = useState(false);

  if (!asset) return null;

  const assetUrl = asset?.asset_url || "";
  const title = category?.name || "Video and Animation";

  const fileName =
    asset?.name ||
    asset?.asset_name ||
    assetUrl.split("?")[0].split("/").pop() ||
    "Video";

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {title}
          </h2>
          <p className="text-xs text-gray-500 truncate" title={fileName}>
            {fileName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {assetUrl && (
            <a
              href={assetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              title="Open in new tab"
            >
              <ExternalLink size={18} />
            </a>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Video */}
      <div className="flex-1 bg-black">
        {assetUrl && !hasError ? (
          <video
            key={assetUrl}
            className="w-full h-full"
            controls
            playsInline
            preload="metadata"
            onError={() => setHasError(true)}
          >
            <source src={assetUrl} />
          </video>
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center bg-gray-50">
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Video Not Available
              </p>
              <p className="text-sm text-gray-500">
                Unable to load this video. URL may be missing/expired or format
                not supported.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
