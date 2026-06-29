"use client";

import React from "react";
import { X, FileText, Info } from "lucide-react";
import { FORMATS_TEXT } from "./uploadAttachment";

/**
 * File-attach popover. Drop zone + per-file comment list + Add/Close bar.
 * Position/style is supplied by the parent via `useUpwardPopover`.
 */
export default function AttachPopover({
  popover, pending, setPending, onPick, onDrop, onConfirm, onClose, uploading,
}) {
  const updateComment = (idx, comment) =>
    setPending((p) => p.map((x, i) => (i === idx ? { ...x, comment } : x)));
  const removeAt = (idx) =>
    setPending((p) => p.filter((_, i) => i !== idx));

  return (
    <div
      id={popover.id}
      style={popover.style}
      className="z-50 bg-primary-50 border border-primary-400 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] overflow-y-auto"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="m-1 border-2 border-dashed border-gray-300 bg-white rounded-xl py-5 px-3 text-center cursor-pointer hover:border-primary-400 transition-all"
        onClick={onPick}
        onDrop={(e) => { e.preventDefault(); onDrop(e.dataTransfer?.files); }}
        onDragOver={(e) => e.preventDefault()}
      >
        {pending.length ? (
          <PendingList
            pending={pending}
            onCommentChange={updateComment}
            onRemove={removeAt}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      <div className="mx-2 mb-2 rounded-xl flex justify-end items-center gap-2 bg-white px-3 py-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={uploading}
          className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 shrink-0 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Add"}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close attach panel"
          className="text-gray-400 hover:text-gray-600 shrink-0 p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <>
      <div className="flex items-center justify-center mb-3">
        <img src="/upload2.png" alt="Upload" className="w-12 h-12" />
      </div>
      <p className="text-[14px] font-semibold text-gray-700">
        Drag files here or click to upload
      </p>
      <p className="text-[12px] text-gray-400 mt-1.5">
        Image, Document, Video &amp; Audio Formats{" "}
        <span className="group relative inline-flex items-center align-middle">
          <Info
            size={14}
            className="shrink-0 text-gray-400 cursor-help"
            aria-label={`Supported: ${FORMATS_TEXT}`}
          />
          <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 bottom-full z-50 mb-1 w-max max-w-[280px] -translate-x-1/2 rounded-md bg-popover px-2 py-1.5 text-[11px] leading-snug text-popover-foreground shadow-lg ring-1 ring-black/10 opacity-0 invisible transition-opacity group-hover:visible group-hover:opacity-100"
          >
            {FORMATS_TEXT}
          </span>
        </span>
        <br />Max Size: 50MB
      </p>
    </>
  );
}

function PendingList({ pending, onCommentChange, onRemove }) {
  return (
    <>
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div
        className="space-y-3 max-h-48 overflow-y-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {pending.map(({ file, comment }, idx) => (
          <div key={`${file.name}-${idx}`} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium text-gray-800 truncate flex-1 min-w-0">
                {file.name}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                aria-label="Remove file"
                className="shrink-0 text-gray-400 hover:text-red-500 p-0.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Add Comment"
              value={comment}
              onChange={(e) => onCommentChange(idx, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="text-[12px] bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none placeholder:text-gray-400 text-gray-700 w-full hover:border-primary-400 focus:border-primary-400"
            />
          </div>
        ))}
      </div>
      <p className="text-[12px] text-gray-400 mt-3 font-medium">
        Click to add more files
      </p>
    </>
  );
}
