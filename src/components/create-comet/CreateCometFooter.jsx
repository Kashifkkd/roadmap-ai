import React from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function CreateCometFooter({
  reset,
  handleSubmit,
  isFormValid,
  hasChanges = false,
  dirtyCount = 0,
  isUpdating = false,
  error = null,
}) {
  const handleBackClick = () => {
    // Navigate back or reset form
    if (reset) {
      reset();
    }
  };

  const isLoading = isUpdating;
  const canSubmit = isFormValid && !isLoading;

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
          className="bg-muted text-primary w-32 sm:w-auto flex items-center justify-center gap-2"
          onClick={handleBackClick}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>

        {/* Right side container */}
        <div className="flex flex-row items-center gap-2 sm:gap-3">
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
            <span>{isLoading ? "Saving..." : "Create Outline"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
