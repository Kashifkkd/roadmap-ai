"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, Sparkles, X, CircleCheck, ImageIcon } from "lucide-react";
import GradientLoader from "@/components/ui/GradientLoader";
import {
  generateStepImages,
  getImageAttributes,
  setImageAttributes,
  getStepPrompts,
  getStepStatus,
} from "@/api/generateStepImages";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ART_STYLE_PROMPTS, ART_STYLE_KEYS } from "@/constants/artStyles";

// Re-export for consumers that imported from this file
export { ART_STYLE_PROMPTS };

export default function GenerateStepImageButton({
  sessionId,
  sessionData,
  setSessionData,
  chapterUid,
  stepUid,
  onGeneratingStart,
  onGeneratingComplete,
  onSuccess,
  onError,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [attributesError, setAttributesError] = useState(null);
  const [generateError, setGenerateError] = useState(null);

  // Attribute fields
  const [artStyle, setArtStyle] = useState("Editorial Illustration");
  const [imageGuidance, setImageGuidance] = useState("");

  // Prompt fields
  const [prompt, setPrompt] = useState("");
  const [isSuggestingPrompt, setIsSuggestingPrompt] = useState(false);

  // Determine if button should be disabled (only check for missing required props)
  const isDisabled = !sessionId || !chapterUid || !stepUid;

  // Derive whether this step has been enqueued (show status instead of generate button)
  const isEnqueued = useMemo(() => {
    if (!sessionData || !stepUid) return false;
    const path = sessionData.response_path;
    const outline = sessionData.response_outline;
    const sources = [
      path?.chapters ? { chapters: path.chapters } : null,
      outline?.chapters ? { chapters: outline.chapters } : null,
      Array.isArray(outline) ? { chapters: outline } : null,
      Array.isArray(path) ? { chapters: path } : null,
    ].filter(Boolean);
    for (const source of sources) {
      const chapters = source.chapters ?? [];
      for (const chapter of Array.isArray(chapters) ? chapters : []) {
        for (const item of chapter.steps || []) {
          const step = item?.step;
          if (!step) continue;
          const match = step.uuid === stepUid || step.id === stepUid;
          if (match && step.image_generation_enqueued) return true;
        }
      }
    }
    return false;
  }, [sessionData, stepUid]);

  // Status: only fetch when user clicks the status button (no auto-polling)
  const [stepStatus, setStepStatus] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const fetchStepStatus = async () => {
    if (!sessionId || !chapterUid || !stepUid) return;
    setIsLoadingStatus(true);
    setStatusError(null);
    try {
      const res = await getStepStatus({ sessionId, chapterUid, stepUid });
      if (res?.success) {
        setStepStatus(res?.response ?? null);
        setStatusError(null);
      } else {
        setStatusError(res?.message || "Failed to load status");
      }
    } catch (e) {
      setStatusError(e?.message || "Failed to load status");
    } finally {
      setIsLoadingStatus(false);
    }
  };

  /** Fetch in background without showing loading spinner (for polling). */
  const fetchStepStatusSilent = async () => {
    if (!sessionId || !chapterUid || !stepUid) return;
    try {
      const res = await getStepStatus({ sessionId, chapterUid, stepUid });
      if (res?.success) {
        const status = res?.response ?? null;
        setStepStatus(status);
        setStatusError(null);
        if (status?.images?.is_complete) {
          onGeneratingComplete?.(stepUid);
        }
      } else {
        setStatusError(res?.message || "Failed to load status");
      }
    } catch (e) {
      setStatusError(e?.message || "Failed to load status");
    }
  };

  // Poll status while enqueued and not yet complete
  useEffect(() => {
    if (!isEnqueued || !sessionId || !chapterUid || !stepUid) return;
    if (stepStatus?.images?.is_complete) return;
    fetchStepStatusSilent();
    const interval = setInterval(fetchStepStatusSilent, 10000);
    return () => clearInterval(interval);
  }, [
    isEnqueued,
    sessionId,
    chapterUid,
    stepUid,
    stepStatus?.images?.is_complete,
    isStatusDialogOpen,
  ]);

  const handleOpenStatusDialog = () => {
    setIsStatusDialogOpen(true);
    fetchStepStatus();
  };

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
        throw new Error(
          response?.error?.message || "Failed to fetch image attributes",
        );
      }

      // Handle different response structures
      const attributes = response?.response || response || {};

      // Set the fields from the API response
      if (attributes.art_style) {
        setArtStyle(attributes.art_style);
      }
      // Don't pre-fill Image Guidance so it starts fresh each time
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
          : (data?.step_wallpaper_prompt ??
            data?.prompt ??
            data?.suggested_prompt ??
            data?.text ??
            (typeof data === "object" ? "" : String(data)));

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
      const outlineChapters =
        updatedSessionData.response_outline?.chapters ||
        (Array.isArray(updatedSessionData.response_outline)
          ? updatedSessionData.response_outline
          : []);

      for (const chapter of Array.isArray(outlineChapters)
        ? outlineChapters
        : []) {
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
        throw new Error(
          setAttributesResponse?.error?.message ||
            "Failed to set image attributes",
        );
      }

      // Then, enqueue step image generation (fire-and-forget)
      const response = await generateStepImages({
        sessionId,
        chapterUid,
        stepUid,
        prompt: prompt || "",
      });

      const isSuccess =
        response?.success ||
        response?.status === "enqueued" ||
        response?.response?.status === "enqueued";
      if (isSuccess) {
        await markAsEnqueued();
        onGeneratingStart?.(stepUid);
        if (onSuccess) {
          onSuccess(response?.response || response);
        }
        setIsDialogOpen(false);
        setArtStyle("Editorial Illustration");
        setImageGuidance("");
        setPrompt("");
      } else {
        throw new Error(
          response?.message || "Failed to enqueue image generation",
        );
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

  // Check completion
  const imagesComplete = useMemo(() => {
    if (!isEnqueued) return false;
    if (stepStatus?.images?.is_complete) return true;
    
    // Check if step has image in sessionData 
    const allChapters = [
      ...(sessionData?.response_path?.chapters || []),
      ...(sessionData?.response_outline?.chapters || []),
    ];
    
    return allChapters.some(ch => 
      ch.steps?.some(item => 
        (item?.step?.uuid === stepUid || item?.step?.id === stepUid) && item?.step?.image
      )
    );
  }, [isEnqueued, stepStatus?.images?.is_complete, sessionData, stepUid]);

  return (
    <>
      {imagesComplete ? (
        /* Images Generated state button */
        <button
          type="button"
          disabled
          className="w-full flex items-center gap-2.5 rounded-full px-4 py-2.5 bg-[#12B76A] sticky bottom-0 cursor-not-allowed disabled:opacity-100"
        >
          <CircleCheck className="w-5 h-5 text-white shrink-0" />
          <span className="text-sm font-semibold text-white">
            Images Generated
          </span>
        </button>
      ) : isEnqueued ? (
        /* Generating Images state button */
        <button
          type="button"
          onClick={handleOpenStatusDialog}
          className="w-full flex items-center gap-3 rounded-full px-3 py-2 bg-[#C7C2F9] hover:bg-[#cfc7f5] transition-colors sticky bottom-0 cursor-pointer"
        >
          <span className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <GradientLoader size={18} />
          </span>
          <span className="flex-1 text-sm font-semibold text-[#352F6E]">
            Generating Images
          </span>
          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-white text-sm font-semibold text-[#574EB6]">
            {stepStatus?.images?.generated ?? 0}/
            {stepStatus?.images?.expected ?? 0}
          </span>
        </button>
      ) : (
        /* Generate Step Images state button */
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
      )}

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
                <p className="text-sm text-gray-600">
                  Loading image attributes...
                </p>
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
                  <p className="text-xs text-gray-500 mt-1">
                    {attributesError}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Prompt Field */}
                {/* <div className="space-y-2">
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
                </div> */}

                {/* Art Style Field */}
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

                {/* Image Guidance Field */}
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
                setArtStyle("Editorial Illustration");
                setImageGuidance("");
                setPrompt("");
              }}
              disabled={isGenerating || isLoadingAttributes}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateImage}
              disabled={
                isGenerating || isLoadingAttributes || !!attributesError
              }
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

      {/* Step image status dialog – shown when status button is clicked */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Step image status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isLoadingStatus && !stepStatus ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-gray-600">Loading status...</p>
              </div>
            ) : statusError ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <p className="text-sm text-amber-600">{statusError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchStepStatus}
                  disabled={isLoadingStatus}
                >
                  {isLoadingStatus ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Try again"
                  )}
                </Button>
              </div>
            ) : stepStatus ? (
              <div className="space-y-4 text-sm">
                {/* Images: expected, generated, in_progress, is_complete (from GET .../status/step) */}
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary-400 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Images</p>
                    <p className="text-gray-600">
                      {stepStatus.images?.generated ?? 0} /{" "}
                      {stepStatus.images?.expected ?? 0} generated
                      {(stepStatus.images?.in_progress ?? 0) > 0 && (
                        <span className="ml-1.5 inline-flex items-center gap-1 text-primary-500">
                          · <Loader2 className="h-3 w-3 animate-spin" />{" "}
                          {stepStatus.images?.in_progress ?? 0} in progress
                        </span>
                      )}
                      {stepStatus.images?.is_complete && (
                        <span className="ml-1.5 text-green-600">
                          · Complete
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Close
            </Button>
            {stepStatus && (
              <Button
                variant="default"
                onClick={fetchStepStatus}
                disabled={isLoadingStatus}
              >
                {isLoadingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Refresh
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
