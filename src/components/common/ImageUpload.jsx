"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Plus, X, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";
import { uploadAssetFile } from "@/api/uploadAssets";

export default function ImageUpload({
  label = "Upload Image/Icon",
  sessionId = "",
  chapterId = "",
  stepId = "",
  screenId = "",
  onUploadSuccess,
  onAIGenerateSuccess,
  existingAssets = [],
  onRemoveAsset,
  showSavedImages = true,
}) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadErrorImage, setUploadErrorImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  // AI Generate Image Dialog State
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiArtStyle, setAiArtStyle] = useState("Photorealistic");
  const [aiSize, setAiSize] = useState("1024x1024");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiGenerateError, setAiGenerateError] = useState(null);

  const artStyles = [
    "Photorealistic",
    "Hyper-real",
    "Watercolor",
    "Line art",
    "Pixel art",
    "Flat illustration",
    "Anime",
    "3D render",
    "Oil painting",
    "Charcoal",
    "Sketch",
    "Minimalist",
  ];

  const imageSizes = ["1024x1024", "512x512", "256x256"];

  const handleFileUpload = async (file) => {
    setIsUploadingImage(true);
    setUploadErrorImage(null);

    try {
      const uploadResponse = await uploadAssetFile(
        file,
        "image",
        sessionId || "",
        chapterId || "",
        stepId || "",
        screenId || ""
      );

      if (uploadResponse?.response) {
        const assetData = {
          status: "success",
          image_url: uploadResponse.response.s3_url,
          asset_id: uploadResponse.response.id,
        };
        if (onUploadSuccess) {
          onUploadSuccess(assetData);
        }
        setUploadedImage(file.name);
      }
    } catch (error) {
      setUploadErrorImage("Upload failed. Please try again.");
      console.error("Error uploading image:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) {
      setAiGenerateError("Please enter a prompt");
      return;
    }

    setIsGeneratingImage(true);
    setAiGenerateError(null);

    try {
      const payload = {
        prompt: aiPrompt,
        art_style: aiArtStyle,
        size: aiSize,
        session_id: sessionId || "",
        chapter_id: chapterId ? parseInt(chapterId) : 0,
        step_id: stepId ? parseInt(stepId) : 0,
        screen_id: screenId ? parseInt(screenId) : 0,
      };

      const { response, error } = await apiService({
        endpoint: endpoints.generateDalleImage,
        method: "POST",
        data: payload,
      });

      if (error) {
        throw new Error("Failed to generate image");
      }

      if (response) {
        const assetToSave = {
          status: response.status || "success",
          image_url: response.image_url,
          asset_id: response.asset_id,
          style: response.style,
          prompt_used: response.prompt_used,
        };

        if (onAIGenerateSuccess) {
          onAIGenerateSuccess(assetToSave);
        }

        setIsAIDialogOpen(false);
        setAiPrompt("");
      }
    } catch (error) {
      setAiGenerateError("Failed to generate image. Please try again.");
      console.error("Error generating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-4">
          {label}
        </Label>

        {/* Three Option Container */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-3 gap-4">
            {/* Option 1: Upload from Computer */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white flex flex-col items-center">
              <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                Upload from Computer
              </h3>
              <div className="relative inline-block">
                <Input
                  type="file"
                  accept="image/*"
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
                <div className="border border-primary rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-primary text-sm font-medium pointer-events-none">
                  <Plus className="h-4 w-4" />
                  Browse
                </div>
              </div>
            </div>

            {/* Option 2: Select from Assets */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white flex flex-col items-center">
              <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                Select from Assets
              </h3>
              <button
                type="button"
                className="border border-primary rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-primary text-sm font-medium"
                onClick={() => {
                  // TODO: Implement asset selection functionality
                  console.log("Select from assets clicked");
                }}
              >
                <Plus className="h-4 w-4" />
                Select
              </button>
            </div>

            {/* Option 3: AI-Generate Image */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white flex flex-col items-center">
              <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                AI-Generate Image
              </h3>
              <button
                type="button"
                className="border border-primary rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-primary text-sm font-medium"
                onClick={() => setIsAIDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create
              </button>
            </div>
          </div>
        </div>

        {/* Loading/Error display */}
        {(isUploadingImage || uploadErrorImage) && (
          <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200">
            {isUploadingImage ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : uploadErrorImage ? (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <X className="h-4 w-4" />
                <span>{uploadErrorImage}</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Display All Saved Images */}
        {showSavedImages && existingAssets.length > 0 && (
          <div className="mt-4">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Saved Images
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {existingAssets.map((asset, index) => {
                const imageUrl =
                  asset.s3_url ||
                  asset.image_url ||
                  asset.imageUrl ||
                  asset.url;
                const assetName =
                  asset.name ||
                  asset.prompt_used ||
                  asset.file ||
                  `Image ${index + 1}`;
                const assetId = asset.id || asset.asset_id;
                return (
                  <div
                    key={assetId || asset.id || index}
                    className="relative border border-gray-300 rounded-lg overflow-hidden group"
                  >
                    {typeof imageUrl === "string" &&
                    imageUrl.startsWith("http") ? (
                      <img
                        src={imageUrl}
                        alt={assetName}
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-xs text-gray-500 p-2 text-center">
                        {assetName}
                      </div>
                    )}
                    {onRemoveAsset && (
                      <button
                        type="button"
                        onClick={() => onRemoveAsset(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    {assetId && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                        ID: {assetId}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* AI Generate Image Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI-Generate Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Prompt Field */}
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Prompt</Label>
              <Input
                id="ai-prompt"
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter a description for the image..."
                className="w-full"
              />
            </div>

            {/* Art Style Field */}
            <div className="space-y-2">
              <Label htmlFor="ai-art-style">Art Style</Label>
              <Select value={aiArtStyle} onValueChange={setAiArtStyle}>
                <SelectTrigger id="ai-art-style" className="w-full">
                  <SelectValue placeholder="Select art style" />
                </SelectTrigger>
                <SelectContent>
                  {artStyles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size Field */}
            <div className="space-y-2">
              <Label htmlFor="ai-size">Size</Label>
              <Select value={aiSize} onValueChange={setAiSize}>
                <SelectTrigger id="ai-size" className="w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {imageSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {aiGenerateError && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <X className="h-4 w-4" />
                <span>{aiGenerateError}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAIDialogOpen(false);
                setAiPrompt("");
                setAiGenerateError(null);
              }}
              disabled={isGeneratingImage}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !aiPrompt.trim()}
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Image"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

