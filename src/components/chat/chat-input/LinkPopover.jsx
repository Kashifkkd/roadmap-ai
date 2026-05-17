"use client";

import React from "react";
import { X, Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Link-attach popover. Two rows: URL input, then comment + Add/Close.
 * Position/style is supplied by the parent via `useUpwardPopover`.
 */
export default function LinkPopover({
  popover, inputRef, url, setUrl, comment, setComment, onAdd, onClose, uploading,
}) {
  const handleUrlKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); onAdd(); }
    else if (e.key === "Escape") onClose();
  };
  const handleCommentKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); onAdd(); }
  };

  return (
    <div
      id={popover.id}
      style={popover.style}
      className="z-50 bg-primary-50 border border-primary-400 rounded-2xl p-1 shadow-[0_4px_24px_rgba(0,0,0,0.10)] overflow-y-auto"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1 bg-primary-50 rounded-xl py-1 mb-0.5">
        <div className="flex items-center gap-1 bg-gray-200 p-2 rounded-lg">
          <Link2 className="w-5 h-5 text-gray-500 shrink-0" />
        </div>
        <input
          ref={inputRef}
          type="url"
          placeholder="Paste link here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleUrlKey}
          className="flex-1 bg-white rounded-lg p-2 text-sm outline-none placeholder:text-gray-400 min-w-0"
        />
      </div>

      <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1">
        <input
          type="text"
          placeholder="Add Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleCommentKey}
          className="flex-1 bg-transparent text-sm py-1.5 outline-none placeholder:text-gray-400 min-w-0"
        />
        <Button
          variant="outline"
          onClick={onAdd}
          disabled={!url.trim() || uploading}
          className="px-4 py-1.5 text-sm bg-primary text-white hover:bg-primary/90 h-8 rounded-lg shrink-0 disabled:opacity-50"
        >
          {uploading ? "Adding..." : "Add"}
        </Button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close link panel"
          className="text-gray-400 hover:text-gray-600 p-0.5 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
