import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Stars from "../icons/Stars";

export default function CreateCometFooter({
  reset,
  handleSubmit,
  isFormValid,
  hasChanges = false,
  dirtyCount = 0,
  isUpdating = false,
  error = null,
}) {
  const [isReviewingWithKyper, setIsReviewingWithKyper] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  const handleBackClick = () => {
    setIsNavigatingBack(true);

    // Reset form if reset function is provided
    if (reset) {
      reset();
    }

    // Navigate back in history after a short delay to show loader  
    setTimeout(() => {
      window.history.back();
    }, 100);
    router.push("/");
  };

  const isLoading = isUpdating;
  const canSubmit = isFormValid && !isLoading;

  const handleReviewWithKyperClick = () => {
    console.log("Review with Kyper");
    if (isReviewingWithKyper === true) {
      setIsReviewingWithKyper(false);
    } else {
      setIsReviewingWithKyper(true);
    }
  };

  return (
    <div className="border-t p-2 sm:p-4 bg-background w-full rounded-b-2xl">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left side - Back button */}
        <Button
          className="bg-muted text-primary w-32 sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50"
          onClick={handleBackClick}
          disabled={isNavigatingBack || isLoading}
        >
          {isNavigatingBack ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ArrowLeft size={16} />
          )}
          <span>{isNavigatingBack ? "Going back..." : "Back"}</span>
        </Button>

        {/* Right side container */}
        <div className="flex flex-row items-center gap-2 sm:gap-3">
          <Button
            variant="default"
            className={`bg-white border border-primary text-primary w-32 sm:w-auto flex items-center justify-center gap-2 ${
              isReviewingWithKyper
                ? "bg-primary-600 text-white"
                : "hover:cursor-pointer  hover:bg-primary-100 hover:text-primary"
            }`}
            onClick={handleReviewWithKyperClick}
            // disabled={isReviewingWithKyper}
          >
            {/* <Brain size={16} /> */}
            <span>Review With Kyper</span>
          </Button>
          {hasChanges && (
            <div className="text-xs sm:text-sm text-muted-foreground text-right">
              {dirtyCount} unsaved changes
            </div>
          )}
          <Button
            variant="default"
            className="w-40 sm:w-auto flex items-center justify-center gap-2 p-3 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            <Stars size={16} />
            {/* <span>{isLoading ? "Saving..." : "Create Outline"}</span> */}
            <span>Create Outline</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
