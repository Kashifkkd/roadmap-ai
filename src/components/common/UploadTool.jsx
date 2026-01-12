"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Plus, X, Loader2 } from "lucide-react";
import { uploadToolfile } from "@/api/uploadToolfile";

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

        if (onUploadSuccess) {
          onUploadSuccess(toolData);
        }

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

  return (
    <div className="mb-6">
      <Label className="block text-sm font-medium text-gray-700 mb-4">
        {label}
      </Label>

      {/* Upload Option Container */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white flex flex-col items-center cursor-pointer">
          <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
            Upload from Computer
          </h3>
          <div className="relative inline-block">
            <Input
              type="file"
              onChange={(e) => {
                const file =
                  e.target.files && e.target.files[0]
                    ? e.target.files[0]
                    : null;
                if (file) {
                  handleFileUpload(file);
                }
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

      {/* Loading/Error display */}
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
