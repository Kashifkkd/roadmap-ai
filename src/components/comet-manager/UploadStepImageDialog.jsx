"use client";

import React, { useState, useRef } from "react";
import {
  Loader2,
  Check,
  X,
  Upload,
  ImageIcon,
  Trash2,
} from "lucide-react";
import { replaceStepImage } from "@/api/replaceStepImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

export default function UploadStepImageDialog({
  open,
  onOpenChange,
  sessionId,
  stepUid,
  onSuccess,
  onError,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleCloseDialog = () => {
    onOpenChange(false);
    // Reset state when closing
    setSelectedFile(null);
    setPreviewUrl(null);
    setStatus(null);
    setErrorMessage("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    e.target.value = "";

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setErrorMessage("Please select an image file");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setSelectedFile(file);
    setStatus(null);
    setErrorMessage("");

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      setStatus("error");
      setErrorMessage("Please select an image first");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setIsUploading(true);
    setStatus(null);
    setErrorMessage("");

    try {
      const response = await replaceStepImage({
        file: selectedFile,
        step_uid: stepUid,
        sessionId: sessionId || "",
      });

      if (response?.success && response?.response) {
        setStatus("success");
        if (onSuccess) {
          onSuccess(response.response);
        }
        setTimeout(() => {
          handleCloseDialog();
        }, 1500);
      } else {
        throw new Error(response?.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading step image:", error);
      setStatus("error");
      setErrorMessage(error?.message || "Upload failed");
      if (onError) {
        onError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Upload Step Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Image Preview */}
          <div className="relative">
            {previewUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary-50/30 transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload image
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {status === "error" && errorMessage && (
            <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 text-sm rounded-md">
              <X className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 text-sm rounded-md">
              <Check className="w-4 h-4 shrink-0" />
              <span>Image uploaded successfully!</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseDialog}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUploadImage}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
