"use client";

import React from "react";
import { X, CheckCircle2, Download, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export default function PDFPreview({ material, onClose }) {
  if (!material) return null;

  console.log(">>>>>", material);
  const pdfUrl = material.output_presigned_url || null;

  const fallbackPdfUrl = "/Get_Started_with_Smallpdf.pdf";

  const finalPdfUrl =
    pdfUrl && pdfUrl.toLowerCase().endsWith(".pdf") ? pdfUrl : fallbackPdfUrl;

  const fileName = material.source_name || material.name || "Document";
  const fileSize = material.file_size || material.size;
  const uploadedDate =
    material.uploaded_at || material.created_at || material.upload_date;
  const description = material.description || "";

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `Uploaded ${months[date.getMonth()]} ${date.getDate()}`;
    } catch {
      return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg overflow-hidden shadow-md">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-gray-200 bg-white flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate mb-1">
            {fileName}
          </h2>
          {description && (
            <p className="text-sm text-gray-600 mb-2">{description}</p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              <span className="text-sm text-gray-700">
                {fileSize ? `${formatFileSize(fileSize)} - ` : ""}
                Processed
              </span>
            </div>
            {uploadedDate && (
              <span className="text-sm text-gray-500">
                {formatDate(uploadedDate)}
              </span>
            )}
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

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden bg-gray-100">
        {finalPdfUrl ? (
          <iframe
            src={`${finalPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            title={fileName}
            className="w-full h-[600px] border-none bg-white"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <FileIcon size={64} className="text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              PDF Preview Not Available
            </p>
            <p className="text-sm text-gray-500">
              Unable to load PDF. The file URL may not be available.
            </p>
            {material.source_name && (
              <p className="text-xs text-gray-400 mt-2">
                File: {material.source_name}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
