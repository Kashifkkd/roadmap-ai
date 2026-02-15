"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { generateStepImages, getImageAttributes, setImageAttributes, getStepPrompts } from "@/api/generateStepImages";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
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
  sessionData,
  setSessionData,
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

  // Prompt fields
  const [prompt, setPrompt] = useState("");
  const [isSuggestingPrompt, setIsSuggestingPrompt] = useState(false);

  // Determine if button should be disabled (only check for missing required props)
  const isDisabled = !sessionId || !chapterUid || !stepUid;

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

  const handleSuggestPrompt = async () => {
    if (!sessionId || !chapterUid || !stepUid) return;

    setIsSuggestingPrompt(true);
    setGenerateError(null);
    try {
      const response = await getStepPrompts({
        sessionId,
        chapterUid,
        stepUid,
      });

      // API may return data directly or wrapped in response.response
      const data = response?.response ?? response;
      if (!data) {
        throw new Error(response?.message || "Failed to get suggested prompt");
      }

      // Use step_wallpaper_prompt from API response for the prompt text field
      const suggestedPrompt =
        typeof data === "string"
          ? data
          : data?.step_wallpaper_prompt ??
            data?.prompt ??
            data?.suggested_prompt ??
            data?.text ??
            (typeof data === "object" ? "" : String(data));

      if (suggestedPrompt) {
        setPrompt(suggestedPrompt);
      } else {
        throw new Error("No step wallpaper prompt in response");
      }
    } catch (error) {
      console.error("Error fetching suggested prompt:", error);
      setGenerateError(error?.message || "Failed to get suggested prompt");
    } finally {
      setIsSuggestingPrompt(false);
    }
  };

  const markAsEnqueued = async () => {
    if (!sessionData || !setSessionData || !stepUid) return;

    try {
      const updatedSessionData = JSON.parse(JSON.stringify(sessionData));
      let stepFound = false;

      // Update in response_path
      if (updatedSessionData.response_path?.chapters) {
        for (const chapter of updatedSessionData.response_path.chapters) {
          for (const stepItem of chapter.steps || []) {
            if (stepItem.step?.uuid === stepUid) {
              stepItem.step.image_generation_enqueued = true;
              stepFound = true;
              break;
            }
          }
          if (stepFound) break;
        }
      }

      // Also update in response_outline to be consistent
      const outlineChapters = updatedSessionData.response_outline?.chapters ||
        (Array.isArray(updatedSessionData.response_outline) ? updatedSessionData.response_outline : []);

      for (const chapter of (Array.isArray(outlineChapters) ? outlineChapters : [])) {
        if (chapter.steps) {
          for (const stepData of chapter.steps) {
            if (stepData.step?.uuid === stepUid) {
              stepData.step.image_generation_enqueued = true;
              break;
            }
          }
        }
      }

      if (stepFound) {
        setSessionData(updatedSessionData);
        localStorage.setItem("sessionData", JSON.stringify(updatedSessionData));

        // Persist to backend using autoSaveComet
        const cometJsonForSave = JSON.stringify({
          session_id: sessionId,
          input_type: "source_material_based_outliner",
          comet_creation_data: updatedSessionData.comet_creation_data || {},
          response_outline: updatedSessionData.response_outline || {},
          response_path: updatedSessionData.response_path || {},
          chatbot_conversation: updatedSessionData.chatbot_conversation || [],
          to_modify: updatedSessionData.to_modify || {},
          webpage_url: updatedSessionData.webpage_url || [],
        });

        const { graphqlClient } = await import("@/lib/graphql-client");
        await graphqlClient.autoSaveComet(cometJsonForSave);
      }
    } catch (error) {
      console.error("Error marking step as enqueued:", error);
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
      // Always include prompt in payload, even if empty (user may have typed without clicking Suggest Prompt)
      const response = await generateStepImages({
        sessionId,
        chapterUid,
        stepUid,
        prompt: prompt || "", // Ensure prompt is always included, default to empty string
      });

      if (response?.success || response?.status === "enqueued" || response?.response?.status === "enqueued") {
        // Successfully enqueued or started generating
        await markAsEnqueued();

        if (onSuccess) {
          onSuccess(response.response || response);
        }
        setIsDialogOpen(false);
        // Reset fields
        setArtStyle("Photorealistic");
        setImageGuidance("simple");
        setPrompt("");
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
        disabled={isDisabled}
        variant="default"
        size="sm"
        className="bg-white hover:bg-primary-100 text-primary-400 border border-primary-400 flex items-center justify-center gap-2 px-4 py-3 w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer sticky bottom-0"
        title={
          !sessionId
            ? "Session ID is required"
            : !chapterUid
            ? "Chapter information is missing"
            : !stepUid
            ? "Step information is missing"
            : "Generate step images"
        }
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
                {/* Prompt Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="step-prompt">Prompt</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSuggestPrompt}
                      disabled={isSuggestingPrompt || !chapterUid || !stepUid}
                      className="flex items-center gap-1.5 text-xs h-7 px-2.5 border-primary-300 text-primary-500 hover:bg-primary-50"
                    >
                      {isSuggestingPrompt ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Suggesting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          Suggest Prompt
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="step-prompt"
                    placeholder="Describe the image you want to generate for this step..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                    disabled={isSuggestingPrompt}
                  />
                </div>

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
                setPrompt("");
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
