"use client";

import React, { useState, useEffect } from "react";
import { CircleX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";
import { toast } from "@/components/ui/toast";

function isValidPathStepId(n) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export default function CreateStepVariantModal({
  open,
  onOpenChange,
  /** From session (useCometManager pathStepId); POST …/steps/{id}/variant */
  numericStepId = null,
  onSuccess,
  currentCycleName = "",
  sourcePhaseName = "",
  sourceStepName = "",
}) {
  const [copyClientValue, setCopyClientValue] = useState("Current Client");
  const [copyCycleValue, setCopyCycleValue] = useState("Current Cycle");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualStepIdInput, setManualStepIdInput] = useState("");

  useEffect(() => {
    if (!open) return;
    if (isValidPathStepId(numericStepId)) {
      setManualStepIdInput(String(Math.trunc(numericStepId)));
    } else {
      setManualStepIdInput("");
    }
  }, [open, numericStepId]);

  const handleClose = () => {
    onOpenChange(false);
    setCopyClientValue("Current Client");
    setCopyCycleValue("Current Cycle");
    setTitle("");
    setInstructions("");
    setManualStepIdInput("");
    setIsSubmitting(false);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      let pathId = numericStepId;
      if (manualStepIdInput.trim() !== "") {
        const manualParsed = parseInt(manualStepIdInput.trim(), 10);
        if (Number.isFinite(manualParsed) && manualParsed >= 0) {
          pathId = manualParsed;
        }
      }
      if (!isValidPathStepId(pathId)) {
        toast.error("Cannot create variant", {
          description:
            "No numeric step id for this step. Ensure response_path includes step_id, #welcome_step_N, or step position—or enter an id below.",
        });
        return;
      }

      const trimmedTitle = title.trim();
      const trimmedInstructions = instructions.trim();
      const hasBody = Boolean(trimmedTitle || trimmedInstructions);
      const payload = {};
      if (trimmedTitle) payload.title = trimmedTitle;
      if (trimmedInstructions) payload.instructions = trimmedInstructions;

      const result = await apiService({
        endpoint: endpoints.stepVariant(String(Math.trunc(pathId))),
        method: "POST",
        ...(hasBody
          ? {
              data: payload,
              headers: { "Content-Type": "application/json" },
            }
          : {}),
      });

      if (result.success) {
        toast.success("Step variant created", {
          description: "The variant was created successfully.",
        });
        onSuccess?.(result.response);
        handleClose();
        return;
      }

      const detail =
        (typeof result.response === "object" && result.response?.detail) ||
        (typeof result.response === "object" && result.response?.message) ||
        (typeof result.response === "string" ? result.response : null);
      toast.error("Could not create variant", {
        description:
          detail ||
          (result.status
            ? `Request failed (${result.status})`
            : "Unexpected response"),
      });
    } catch (e) {
      toast.error("Could not create variant", {
        description: e?.message || "Unexpected error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent
        customPosition
        overlayClassName="top-[4.5rem] bg-black/50 backdrop-blur-[2px] lg:left-[calc(18em+1rem)] xl:left-[calc(20em+1rem)]"
        className="left-1/2 top-[calc(50%+2.25rem)] w-[calc(100vw-2rem)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl lg:left-[calc(50%+9.5rem)] xl:left-[calc(50%+10.5rem)] [&>button]:hidden"
      >
        <div className="relative px-6 pt-6 ">
          <DialogTitle className="text-[18px] font-semibold leading-6 text-[#181D27]">
            Create Step Variant
          </DialogTitle>
          <div className="absolute right-5 top-5">
            <DialogClose asChild>
              <button
                type="button"
                className=" flex items-center justify-center "
                aria-label="Close"
              >
                <CircleX className="h-4 w-4 text-gray-600" />
              </button>
            </DialogClose>
          </div>
        </div>

        <div className=" border-gray-200 px-5 py-3.5">
          <div className="p-2 bg-[#F5F6F8] rounded-2xl">
            <div className="bg-white rounded-t-2xl px-5 py-4 mb-1">
              <div className="">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-gray-600">
                      Current Cycle Name
                    </p>
                    <p className="text-sm font-medium text-[#181D27]">
                      {currentCycleName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-gray-600">
                      Phase Name
                    </p>
                    <p className="text-sm font-medium text-[#181D27]">
                      {sourcePhaseName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-gray-600">
                      Step Name
                    </p>
                    <p className="text-sm font-medium text-[#181D27]">
                      {sourceStepName || "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="step-variant-numeric-id"
                      className="text-[11px] font-medium text-gray-600"
                    >
                      Numeric step id
                    </Label>
                    <Input
                      id="step-variant-numeric-id"
                      inputMode="numeric"
                      value={manualStepIdInput}
                      onChange={(e) => setManualStepIdInput(e.target.value)}
                      placeholder="Override only — usually filled from session"
                      className="h-9 rounded-lg border-gray-200 bg-gray-50 text-sm"
                      disabled={isSubmitting}
                    />
                    <p className="text-[11px] leading-snug text-gray-500">
                      Parsed from session when possible (#welcome_step_1 → 1, or
                      step position). Override only if needed for the API.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="step-variant-title"
                      className="text-[11px] font-medium text-gray-600"
                    >
                      Variant title{" "}
                      <span className="font-normal text-gray-400">(optional)</span>
                    </Label>
                    <Input
                      id="step-variant-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Stakeholder Mapping for HR"
                      className="h-9 rounded-lg border-gray-200 bg-gray-50 text-sm"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="step-variant-instructions"
                      className="text-[11px] font-medium text-gray-600"
                    >
                      Instructions{" "}
                      <span className="font-normal text-gray-400">(optional)</span>
                    </Label>
                    <Textarea
                      id="step-variant-instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="e.g. Replace finance stakeholders with HR examples."
                      className="min-h-[88px] rounded-lg border-gray-200 bg-gray-50 text-sm"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2 bg-[#F3F4F6] rounded-xl p-2 mt-4">
                  <p className="text-xs font-semibold text-gray-900">Copy to</p>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-gray-600">
                      Client
                    </p>
                    <Select
                      value={copyClientValue}
                      onValueChange={setCopyClientValue}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Current Client">
                          Current Client
                        </SelectItem>
                        <SelectItem value="Client A">Client A</SelectItem>
                        <SelectItem value="Client B">Client B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-gray-600">
                      Cycle
                    </p>
                    <Select
                      value={copyCycleValue}
                      onValueChange={setCopyCycleValue}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Current Cycle">
                          Current Cycle
                        </SelectItem>
                        <SelectItem value="Cycle A">Cycle A</SelectItem>
                        <SelectItem value="Cycle B">Cycle B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end bg-white rounded-b-2xl p-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-lg"
                onClick={handleClose}
                type="button"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-9 rounded-lg min-w-[88px] inline-flex items-center justify-center gap-1.5"
                onClick={handleSave}
                type="button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    Saving
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
