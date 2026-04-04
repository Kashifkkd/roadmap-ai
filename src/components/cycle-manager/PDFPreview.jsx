"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PDFPreview({ material, onClose }) {
  const [txtContent, setTxtContent] = useState(null);
  const [txtError, setTxtError] = useState(false);

  if (!material) return null;

  const fileUrl = material.output_presigned_url || null;
  const fileName = material.source_name || "Document";
  const extension =
    fileName.split(".").pop()?.toLowerCase() || "";

  const isTxt = extension === "txt";
  const isVideo = ["mp4", "webm"].includes(extension);
  const isAudio = ["mp3", "wav", "m4a", "flac"].includes(extension);
  const isPdf = extension === "pdf";
  const isDoc = ["doc", "docx"].includes(extension);

  const videoType = extension === "webm" ? "video/webm" : "video/mp4";
  const audioType =
    extension === "wav"
      ? "audio/wav"
      : extension === "m4a"
        ? "audio/mp4"
        : extension === "flac"
          ? "audio/flac"
          : "audio/mpeg";

  // Fetch .txt content for display
  useEffect(() => {
    if (!isTxt || !fileUrl) return;
    setTxtContent(null);
    setTxtError(false);
    fetch(fileUrl)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error("Failed to fetch"))))
      .then(setTxtContent)
      .catch(() => setTxtError(true));
  }, [isTxt, fileUrl]);
  // const fileSize = material.file_size || material.size;
  // const uploadedDate =
  //   material.uploaded_at || material.created_at || material.upload_date;
  // const description = material.description || "";

  // const formatFileSize = (bytes) => {
  //   if (!bytes && bytes !== 0) return null;
  //   if (bytes < 1024) return `${bytes} B`;
  //   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  //   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  // };

  // Format date
  // const formatDate = (dateString) => {
  //   if (!dateString) return null;
  //   try {
  //     const date = new Date(dateString);
  //     const months = [
  //       "Jan",
  //       "Feb",
  //       "Mar",
  //       "Apr",
  //       "May",
  //       "Jun",
  //       "Jul",
  //       "Aug",
  //       "Sept",
  //       "Oct",
  //       "Nov",
  //       "Dec",
  //     ];
  //     return `Uploaded ${months[date.getMonth()]} ${date.getDate()}`;
  //   } catch {
  //     return null;
  //   }
  // };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg overflow-hidden shadow-md">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-gray-200 bg-white flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate mb-1">
            {fileName}
          </h2>
          {material.comment && (
            <p className="text-sm text-gray-600 mb-2">{material.comment}</p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              {/* <span className="text-sm text-gray-700">
                {fileSize ? `${formatFileSize(fileSize)} - ` : ""}
                Processed
              </span> */}
            </div>
            {/* {uploadedDate && (
              <span className="text-sm text-gray-500">
                {formatDate(uploadedDate)}
              </span>
            )} */}
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      {/* File Viewer */}
      <div className="flex-1 overflow-hidden bg-gray-100">
        {!fileUrl ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <FileIcon size={64} className="text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Preview Not Available
            </p>
            <p className="text-sm text-gray-500">
              Unable to load file. The file URL may not be available.
            </p>
            {material.source_name && (
              <p className="text-xs text-gray-400 mt-2">
                File: {material.source_name}
              </p>
            )}
          </div>
        ) : isTxt ? (
          <div className="flex-1 overflow-auto p-4 bg-white">
            {txtError ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <FileIcon size={64} className="text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Unable to load text file
                </p>
                <p className="text-sm text-gray-500">
                  The file could not be fetched. It may be unavailable or blocked.
                </p>
              </div>
            ) : txtContent ? (
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
                {txtContent}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            )}
          </div>
        ) : isVideo ? (
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            <video
              key={fileUrl}
              className="w-full max-h-[600px]"
              controls
              playsInline
              preload="metadata"
            >
              <source src={fileUrl} type={videoType} />
            </video>
          </div>
        ) : isAudio ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
            <audio
              key={fileUrl}
              className="w-full max-w-md"
              controls
              preload="metadata"
            >
              <source src={fileUrl} type={audioType} />
            </audio>
            <p className="text-sm text-gray-500 mt-4">{fileName}</p>
          </div>
        ) : isPdf || isDoc ? (
          <iframe
            src={
              isPdf
                ? `${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
                : fileUrl
            }
            title={fileName}
            className="w-full h-[600px] border-none bg-white"
          />
        ) : (
          <iframe
            src={fileUrl}
            title={fileName}
            className="w-full h-[600px] border-none bg-white"
          />
        )}
      </div>
    </div>
  );
}
