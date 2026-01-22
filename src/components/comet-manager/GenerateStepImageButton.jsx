"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { generateStepImages, getImageAttributes, setImageAttributes } from "@/api/generateStepImages";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const imageGuidanceOptions = [
  { value: "simple", label: "Simple" },
  { value: "detailed", label: "Detailed" },
  { value: "complex", label: "Complex" },
  { value: "very_detailed", label: "Very Detailed" },
];

export default function GenerateStepImageButton({
  sessionId,
  chapterUid,
  stepUid,
  onSuccess,
  onError,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [attributesError, setAttributesError] = useState(null);
  const [generateError, setGenerateError] = useState(null);
  
  // Attribute fields
  const [artStyle, setArtStyle] = useState("Photorealistic");
  const [imageGuidance, setImageGuidance] = useState("simple");

  const handleOpenDialog = async () => {
    if (!sessionId) {
      if (onError) {
        onError(new Error("Session ID is required"));
      }
      return;
    }

    setIsDialogOpen(true);
    setIsLoadingAttributes(true);
    setAttributesError(null);
    setGenerateError(null);

    try {
      const response = await getImageAttributes({ sessionId });

      if (response?.error) {
        throw new Error(response?.error?.message || "Failed to fetch image attributes");
      }

      // Handle different response structures
      const attributes = response?.response || response || {};
      
      // Set the fields from the API response
      if (attributes.art_style) {
        setArtStyle(attributes.art_style);
      }
      if (attributes.image_guidance) {
        setImageGuidance(attributes.image_guidance);
      }
    } catch (error) {
      console.error("Error fetching image attributes:", error);
      setAttributesError(error.message || "Failed to load image attributes");
    } finally {
      setIsLoadingAttributes(false);
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
      // First, set the image attributes
      const setAttributesResponse = await setImageAttributes({
        sessionId,
        artStyle,
        imageGuidance,
      });

      if (setAttributesResponse?.error) {
        throw new Error(setAttributesResponse?.error?.message || "Failed to set image attributes");
      }

      // Then, generate the step images
      const response = await generateStepImages({
        sessionId,
        chapterUid,
        stepUid,
      });

      if (response?.success && response?.response) {
        if (onSuccess) {
          onSuccess(response.response);
        }
        setIsDialogOpen(false);
        // Reset fields
        setArtStyle("Photorealistic");
        setImageGuidance("simple");
      } else if (response?.status === "enqueued" || response?.response?.status === "enqueued") {
        // Handle enqueued status
        if (onSuccess) {
          onSuccess(response.response || response);
        }
        setIsDialogOpen(false);
        setArtStyle("Photorealistic");
        setImageGuidance("simple");
      } else {
        throw new Error(response?.message || "Failed to generate image");
      }
    } catch (error) {
      console.error("Error generating step image:", error);
      setGenerateError(error.message || "Failed to generate image");
      if (onError) {
        onError(error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleOpenDialog}
        disabled={isGenerating}
        variant="default"
        size="sm"
        className="bg-white hover:bg-primary-100 text-primary-400 border border-primary-400 flex items-center justify-center gap-2 px-4 py-3 w-full disabled:opacity-50 cursor-pointer sticky bottom-0 "
      >
        <Sparkles className="w-3.5 h-3.5 text-primary-400" />
        <span className="hidden sm:inline">Generate Step Images</span>
      </Button>

      {/* Generate Step Images Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Step Images</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isLoadingAttributes ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-gray-600">Loading image attributes...</p>
              </div>
            ) : attributesError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <div className="rounded-full bg-red-50 p-3">
                  <X className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Unable to load image attributes
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{attributesError}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Art Style Field */}
                <div className="space-y-2">
                  <Label htmlFor="art-style">Art Style</Label>
                  <Select value={artStyle} onValueChange={setArtStyle}>
                    <SelectTrigger id="art-style" className="w-full">
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

                {/* Image Guidance Field */}
                <div className="space-y-2">
                  <Label htmlFor="image-guidance">Image Guidance</Label>
                  <Select value={imageGuidance} onValueChange={setImageGuidance}>
                    <SelectTrigger id="image-guidance" className="w-full">
                      <SelectValue placeholder="Select image guidance" />
                    </SelectTrigger>
                    <SelectContent>
                      {imageGuidanceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Error Message */}
                {generateError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <X className="h-4 w-4" />
                    <span>{generateError}</span>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setAttributesError(null);
                setGenerateError(null);
                setArtStyle("Photorealistic");
                setImageGuidance("simple");
              }}
              disabled={isGenerating || isLoadingAttributes}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateImage}
              disabled={isGenerating || isLoadingAttributes || !!attributesError}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Step Images"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
