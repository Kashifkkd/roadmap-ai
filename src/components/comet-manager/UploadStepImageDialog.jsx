"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Check,
  X,
  Upload,
  ImageIcon,
  Trash2,
  Sparkles,
} from "lucide-react";
import { replaceStepImage } from "@/api/replaceStepImage";
import {
  getImageAttributes,
  setImageAttributes,
  generateStepImagesAndWait,
} from "@/api/generateStepImages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ART_STYLE_KEYS } from "@/constants/artStyles";

export default function UploadStepImageDialog({
  open,
  onOpenChange,
  sessionId,
  stepUid,
  chapterUid,
  sessionData,
  setSessionData,
  existingImageUrl,
  onSuccess,
  onError,
}) {
  const [mode, setMode] = useState("upload"); // 'upload' | 'generate'

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // After generate success, show the new image from response before closing
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  // Generate state
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [attributesError, setAttributesError] = useState(null);
  const [generateError, setGenerateError] = useState(null);
  const [artStyle, setArtStyle] = useState("Editorial Illustration");
  const [imageGuidance, setImageGuidance] = useState("");

  const handleCloseDialog = () => {
    onOpenChange(false);
    setMode("upload");
    setSelectedFile(null);
    setPreviewUrl(null);
    setGeneratedImageUrl(null);
    setStatus(null);
    setErrorMessage("");
    setAttributesError(null);
    setGenerateError(null);
    setArtStyle("Editorial Illustration");
    setImageGuidance("");
  };

  // Load image attributes when opening dialog in generate mode or switching to generate
  useEffect(() => {
    if (!open || mode !== "generate" || !sessionId) return;
    let cancelled = false;
    setIsLoadingAttributes(true);
    setAttributesError(null);
    getImageAttributes({ sessionId })
      .then((response) => {
        if (cancelled) return;
        if (response?.error) {
          throw new Error(response?.error?.message || "Failed to fetch image attributes");
        }
        const attributes = response?.response || response || {};
        if (attributes.art_style) setArtStyle(attributes.art_style);
        // Don't pre-fill Image Guidance from API so it starts fresh each time
      })
      .catch((err) => {
        if (!cancelled) {
          setAttributesError(err?.message || "Failed to load image attributes");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAttributes(false);
      });
    return () => { cancelled = true; };
  }, [open, mode, sessionId]);

  /** Update step.image in sessionData (response_path + response_outline) and persist. */
  const updateStepImage = (imageUrl) => {
    if (!sessionData || !setSessionData || !stepUid || !imageUrl) return;
    try {
      const updated = JSON.parse(JSON.stringify(sessionData));
      let stepFound = false;
      if (updated.response_path?.chapters) {
        for (const ch of updated.response_path.chapters) {
          for (const stepItem of ch.steps || []) {
            if (stepItem.step?.uuid === stepUid) {
              stepItem.step.image = imageUrl;
              stepFound = true;
              break;
            }
          }
          if (stepFound) break;
        }
      }
      const outlineChapters = updated.response_outline?.chapters ?? (Array.isArray(updated.response_outline) ? updated.response_outline : []);
      for (const chapter of Array.isArray(outlineChapters) ? outlineChapters : []) {
        for (const stepData of chapter.steps || []) {
          if (stepData.step?.uuid === stepUid) {
            stepData.step.image = imageUrl;
            break;
          }
        }
      }
      if (stepFound) {
        setSessionData(updated);
        localStorage.setItem("sessionData", JSON.stringify(updated));
        const cometJsonForSave = JSON.stringify({
          session_id: sessionId,
          input_type: "source_material_based_outliner",
          comet_creation_data: updated.comet_creation_data || {},
          response_outline: updated.response_outline || {},
          response_path: updated.response_path || {},
          chatbot_conversation: updated.chatbot_conversation || [],
          to_modify: updated.to_modify || {},
          webpage_url: updated.webpage_url || [],
        });
        import("@/lib/graphql-client").then(({ graphqlClient }) =>
          graphqlClient.autoSaveComet(cometJsonForSave),
        );
      }
    } catch (err) {
      console.error("Error updating step image:", err);
    }
  };

  const handleGenerateImage = async () => {
    if (!sessionId || !chapterUid || !stepUid) {
      setGenerateError("Missing required parameters");
      return;
    }
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const setRes = await setImageAttributes({
        sessionId,
        artStyle,
        imageGuidance,
      });
      if (setRes?.error) {
        throw new Error(setRes?.error?.message || "Failed to set image attributes");
      }
      const response = await generateStepImagesAndWait({
        sessionId,
        chapterUid,
        stepUid,
        prompt: "",
      });
      // API returns { url: "..." } or wrapped as response.response / response.url
      const imageUrl = response?.url ?? response?.response?.url;
      const isSuccess =
        imageUrl ||
        response?.success ||
        response?.status === "enqueued" ||
        response?.response?.status === "enqueued";
      if (isSuccess) {
        if (imageUrl) {
          updateStepImage(imageUrl);
        }
        if (onSuccess) {
          onSuccess(imageUrl ? { url: imageUrl } : response?.response || response);
        }
        if (imageUrl) {
          setGeneratedImageUrl(imageUrl);
          setTimeout(handleCloseDialog, 1500);
        } else {
          handleCloseDialog();
        }
      } else {
        throw new Error(response?.message || "Failed to generate image");
      }
    } catch (err) {
      setGenerateError(err?.message || "Failed to generate image");
      if (onError) onError(err);
    } finally {
      setIsGenerating(false);
    }
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

  const canGenerate = sessionId && chapterUid && stepUid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Step Image
          </DialogTitle>
        </DialogHeader>

        {/* Tabs: Upload | Generate - always allow switching */}
        <div className="flex gap-1 p-1 rounded-lg bg-gray-100 border border-gray-200">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === "upload"
                ? "bg-white text-primary shadow-sm border border-gray-200"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Upload className="w-4 h-4 inline-block mr-1.5 align-middle" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("generate")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === "generate"
                ? "bg-white text-primary shadow-sm border border-gray-200"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Sparkles className="w-4 h-4 inline-block mr-1.5 align-middle" />
            Generate
          </button>
        </div>

        <div className="space-y-4 py-2">
          {mode === "upload" && (
            <>
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
                ) : existingImageUrl ? (
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-500 px-2 py-1 border-b border-gray-100">Current step image</p>
                    <img
                      src={existingImageUrl}
                      alt="Current step"
                      className="w-full h-48 object-contain"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-t border-gray-100 p-2 text-center cursor-pointer text-sm text-primary hover:bg-primary-50/30"
                    >
                      Click to replace with new image
                    </div>
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
            </>
          )}

          {mode === "generate" && (
            <>
              {!canGenerate ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  Session and step information is required to generate images. Make sure a step is selected.
                </div>
              ) : isLoadingAttributes ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-gray-600">Loading image attributes...</p>
                </div>
              ) : attributesError ? (
                <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
                  <div className="rounded-full bg-red-50 p-3">
                    <X className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="text-sm text-gray-700">{attributesError}</p>
                </div>
              ) : (
                <>
                  {/* Existing or newly generated step image preview */}
                  {(existingImageUrl || generatedImageUrl) && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <p className="text-xs text-gray-500 px-2 py-1 border-b border-gray-100">
                        {generatedImageUrl ? "New step image" : "Current step image"}
                      </p>
                      <img
                        src={generatedImageUrl || existingImageUrl}
                        alt={generatedImageUrl ? "New step" : "Current step"}
                        className="w-full h-48 object-contain"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="art-style">Art Style</Label>
                    <Select value={artStyle} onValueChange={setArtStyle}>
                      <SelectTrigger id="art-style" className="w-full">
                        <SelectValue placeholder="Select art style" />
                      </SelectTrigger>
                      <SelectContent>
                        {ART_STYLE_KEYS.map((style) => (
                          <SelectItem key={style} value={style}>
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image-guidance">Image Guidance</Label>
                    <Input
                      id="image-guidance"
                      type="text"
                      value={imageGuidance}
                      onChange={(e) => setImageGuidance(e.target.value)}
                      placeholder="Enter image guidance"
                      className="w-full"
                    />
                  </div>
                  {generateError && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <X className="h-4 w-4" />
                      <span>{generateError}</span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseDialog}
            disabled={isUploading || isGenerating}
          >
            Cancel
          </Button>
          {mode === "upload" && (
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
          )}
          {mode === "generate" && (
            <Button
              type="button"
              onClick={handleGenerateImage}
              disabled={!canGenerate || isGenerating || isLoadingAttributes || !!attributesError}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Step Image
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
