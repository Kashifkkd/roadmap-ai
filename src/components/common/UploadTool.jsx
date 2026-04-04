"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import {
  Plus,
  X,
  Loader2,
  FileText,
  FileSpreadsheet,
  FileImage,
  Presentation,
  Link2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { uploadToolfile } from "@/api/uploadToolfile";

// ─── helpers ─────────────────────────────────────────────────────────────────

function getFileInfo(url) {
  try {
    const pathname = new URL(url).pathname;
    const raw = pathname.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(raw))
      return { type: "image", ext: raw.toUpperCase() };
    if (raw === "pdf") return { type: "pdf", ext: "PDF" };
    if (["doc", "docx"].includes(raw))
      return { type: "word", ext: raw.toUpperCase() };
    if (["xls", "xlsx", "csv"].includes(raw))
      return { type: "excel", ext: raw.toUpperCase() };
    if (["ppt", "pptx"].includes(raw))
      return { type: "ppt", ext: raw.toUpperCase() };
    if (raw) return { type: "file", ext: raw.toUpperCase() };
  } catch {
    // fall through
  }
  return { type: "link", ext: "URL" };
}

// Colors & icons used in the info-bar badge and fallback preview
const TYPE_STYLE = {
  pdf:   { badgeBg: "#DC2626", previewBg: "#FEF2F2", Icon: FileText,        iconColor: "#DC2626" },
  word:  { badgeBg: "#2563EB", previewBg: "#EFF6FF", Icon: FileText,        iconColor: "#2563EB" },
  excel: { badgeBg: "#16A34A", previewBg: "#F0FDF4", Icon: FileSpreadsheet, iconColor: "#16A34A" },
  ppt:   { badgeBg: "#EA580C", previewBg: "#FFF7ED", Icon: Presentation,    iconColor: "#EA580C" },
  image: { badgeBg: "#7C3AED", previewBg: "#F5F3FF", Icon: FileImage,       iconColor: "#7C3AED" },
  link:  { badgeBg: "#6D28D9", previewBg: "#F5F3FF", Icon: Link2,           iconColor: "#6D28D9" },
  file:  { badgeBg: "#4B5563", previewBg: "#F9FAFB", Icon: FileText,        iconColor: "#4B5563" },
};

// ─── preview area ─────────────────────────────────────────────────────────────

function PreviewArea({ url, name }) {
  const { type } = getFileInfo(url);
  const style = TYPE_STYLE[type] || TYPE_STYLE.file;

  if (type === "image") {
    return (
      <img
        src={url}
        alt={name || "preview"}
        className="w-full h-full object-cover"
        onError={(e) => {
          // swap to fallback div on broken image
          const parent = e.currentTarget.parentElement;
          e.currentTarget.remove();
          parent.style.background = style.previewBg;
          parent.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;color:${style.iconColor}"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
        }}
      />
    );
  }

  if (type === "pdf") {
    return (
      <object
        data={`${url}#toolbar=0&navpanes=0&view=FitH`}
        type="application/pdf"
        className="w-full h-full"
        aria-label="PDF preview"
      >
        <FallbackIcon style={style} />
      </object>
    );
  }

  return <FallbackIcon style={style} />;
}

function FallbackIcon({ style }) {
  const { Icon, iconColor, previewBg } = style;
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{ background: previewBg }}
    >
      <Icon size={52} style={{ color: iconColor }} strokeWidth={1.5} />
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function UploadTool({
  label = "Upload Tool",
  sessionId = "",
  pathId = "",
  chapterId = "",
  stepId = "",
  screenId = "",
  screenContentId = "",
  toolName = "",
  onUploadSuccess,
  currentUrl = "",
  currentName = "",
  onClearTool,
}) {
  const [isUploadingTool, setIsUploadingTool] = useState(false);
  const [uploadErrorTool, setUploadErrorTool] = useState(null);
  const [uploadedTool, setUploadedTool] = useState(null);

  const handleFileUpload = async (file) => {
    setIsUploadingTool(true);
    setUploadErrorTool(null);
    try {
      const uploadResponse = await uploadToolfile(
        file,
        sessionId,
        pathId,
        chapterId,
        stepId,
        screenId,
        screenContentId,
        toolName
      );

      console.log("Upload response:", uploadResponse);

      if (uploadResponse?.success && uploadResponse?.response) {
        const toolData = {
          status: "success",
          url:
            uploadResponse.response.s3_url ||
            uploadResponse.response.presigned_url ||
            uploadResponse.response.s3_path,
          name: uploadResponse.response.name || file.name,
          id: uploadResponse.response.id,
        };
        if (onUploadSuccess) onUploadSuccess(toolData);
        setUploadedTool(file.name);
      } else {
        setUploadErrorTool(
          uploadResponse?.message || "Upload failed. Please try again."
        );
      }
    } catch (error) {
      setUploadErrorTool("Upload failed. Please try again.");
      console.error("Error uploading tool:", error);
    } finally {
      setIsUploadingTool(false);
    }
  };

  const getDisplayName = () => {
    if (currentName) return currentName;
    try {
      const filename = new URL(currentUrl).pathname.split("/").pop();
      return decodeURIComponent(filename) || currentUrl;
    } catch {
      return currentUrl;
    }
  };

  // ── Tool present → WhatsApp-style card ───────────────────────────────────
  if (currentUrl) {
    const { type, ext } = getFileInfo(currentUrl);
    const style = TYPE_STYLE[type] || TYPE_STYLE.file;
    const displayName = getDisplayName();
    // strip extension from display name for the bold title (like WhatsApp does)
    const titleName = displayName.replace(/\.[^/.]+$/, "") || displayName;

    return (
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </Label>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md w-full">

          {/* ── Preview area with overlaid action buttons ── */}
          <div className="relative w-full" style={{ height: 180 }}>
            <PreviewArea url={currentUrl} name={displayName} />

            {/* Replace & Remove — top-right overlay */}
            <div className="absolute top-2 right-2 flex gap-1">
              {/* Replace */}
              <div className="relative">
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  title="Replace file"
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer transition-colors"
                >
                  <RefreshCw size={13} />
                </div>
              </div>

              {/* Remove */}
              {onClearTool && (
                <button
                  type="button"
                  onClick={onClearTool}
                  title="Remove tool"
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Uploading overlay */}
            {isUploadingTool && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* ── Info bar (WhatsApp bottom strip) ── */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border-t border-gray-100">
            {/* Colored file-type badge */}
            <div
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold tracking-wide"
              style={{ background: style.badgeBg }}
            >
              {ext.slice(0, 4)}
            </div>

            {/* File name + meta */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                {titleName}
              </p>
              <p className="text-xs text-gray-400 leading-tight mt-0.5">
                {ext.toLowerCase()}
              </p>
            </div>

            {/* Open button */}
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open"
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <ExternalLink size={16} />
            </a>
          </div>

          {/* Error feedback */}
          {uploadErrorTool && (
            <div className="flex items-center gap-2 px-3 pb-2 text-xs text-red-600 bg-white">
              <X size={12} />
              <span>{uploadErrorTool}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── No tool → upload UI ───────────────────────────────────────────────────
  return (
    <div className="mb-6">
      <Label className="block text-sm font-medium text-gray-700 mb-4">
        {label}
      </Label>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white flex flex-col items-center cursor-pointer">
          <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
            Upload from Computer
          </h3>
          <div className="relative inline-block">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) handleFileUpload(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border border-primary rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-primary text-sm font-medium cursor-pointer">
              <Plus className="h-4 w-4" />
              Browse
            </div>
          </div>
        </div>
      </div>

      {(isUploadingTool || uploadErrorTool || uploadedTool) && (
        <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200">
          {isUploadingTool ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : uploadErrorTool ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <X className="h-4 w-4" />
              <span>{uploadErrorTool}</span>
            </div>
          ) : uploadedTool ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <span>Uploaded: {uploadedTool}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
