"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { generateStepImages } from "@/api/generateStepImages";
import { Button } from "@/components/ui/Button";

export default function GenerateStepImageButton({
  sessionId,
  chapterUid,
  stepUid,
  onSuccess,
  onError,
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async () => {
    if (!sessionId || !chapterUid || !stepUid) {
      if (onError) {
        onError(new Error("Missing required parameters"));
      }
      return;
    }

    setIsGenerating(true);

    try {
      const response = await generateStepImages({
        sessionId,
        chapterUid,
        stepUid,
      });

      if (response?.success && response?.response) {
        if (onSuccess) {
          onSuccess(response.response);
        }
      } else {
        throw new Error(response?.message || "Failed to generate image");
      }
    } catch (error) {
      console.error("Error generating step image:", error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleGenerateImage}
      disabled={isGenerating}
      variant="default"
      size="sm"
      className="bg-black hover:bg-primary-600 text-white hover:text-white border-0 flex items-center justify-center gap-2 px-4 py-3 w-full disabled:opacity-50 cursor-pointer sticky bottom-0 "
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="hidden sm:inline">Generating...</span>
        </>
      ) : (
        <>
          <span className="hidden sm:inline">Generate Image</span>
        </>
      )}
    </Button>
  );
}
