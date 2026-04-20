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

function isValidPathId(n) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export default function CreateCycleVariantModal({
  open,
  onOpenChange,
  /** From session list (path_id); POST …/paths/{id}/variant */
  numericPathId = null,
  onSuccess,
  cycleName = "",
}) {
  const [copyClientValue, setCopyClientValue] = useState("Current Client");
  const [copyCycleValue, setCopyCycleValue] = useState("Current Cycle");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualPathIdInput, setManualPathIdInput] = useState("");
  /** Required when copying to another client (cross-client). */
  const [targetClientIdInput, setTargetClientIdInput] = useState("");

  useEffect(() => {
    if (!open) return;
    if (isValidPathId(numericPathId)) {
      setManualPathIdInput(String(Math.trunc(numericPathId)));
    } else {
      setManualPathIdInput("");
    }
  }, [open, numericPathId]);

  const handleClose = () => {
    onOpenChange(false);
    setCopyClientValue("Current Client");
    setCopyCycleValue("Current Cycle");
    setTitle("");
    setInstructions("");
    setManualPathIdInput("");
    setTargetClientIdInput("");
    setIsSubmitting(false);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      let pathId = numericPathId;
      if (manualPathIdInput.trim() !== "") {
        const manualParsed = parseInt(manualPathIdInput.trim(), 10);
        if (Number.isFinite(manualParsed) && manualParsed >= 0) {
          pathId = manualParsed;
        }
      }
      if (!isValidPathId(pathId)) {
        toast.error("Cannot create variant", {
          description:
            "No numeric path id for this cycle. Enter the path id from your backend (e.g. from session or URL)—or ensure the list provides path_id.",
        });
        return;
      }

      const crossClient = copyClientValue !== "Current Client";
      let targetClientId = null;
      if (crossClient) {
        const parsed = parseInt(targetClientIdInput.trim(), 10);
        if (!Number.isFinite(parsed) || parsed < 0) {
          toast.error("Cannot create variant", {
            description:
              "Cross-client copy needs a target client id (e.g. 42) in the field below.",
          });
          return;
        }
        targetClientId = parsed;
      }

      const trimmedTitle = title.trim();
      const trimmedInstructions = instructions.trim();
      const hasBody = Boolean(trimmedTitle || trimmedInstructions);
      const payload = {};
      if (trimmedTitle) payload.title = trimmedTitle;
      if (trimmedInstructions) payload.instructions = trimmedInstructions;

      const params = {
        count: 1,
        persist_to_redis: Boolean(crossClient),
        ...(crossClient && targetClientId != null
          ? { client_id: targetClientId }
          : {}),
      };

      const result = await apiService({
        endpoint: endpoints.pathVariant(String(Math.trunc(pathId))),
        method: "POST",
        params,
        ...(hasBody
          ? {
              data: payload,
              headers: { "Content-Type": "application/json" },
            }
          : {}),
      });

      if (result.success) {
        toast.success("Cycle variant created", {
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

  const showTargetClientField = copyClientValue !== "Current Client";

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[620px] overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl [&>button]:hidden">
        <div className="relative px-6 pt-6 ">
          <DialogTitle className="text-[18px] font-semibold leading-6 text-[#181D27]">
            Create Cycle Variant
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
                      Cycle name
                    </p>
                    <p className="text-sm font-medium text-[#181D27]">
                      {cycleName}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cycle-variant-numeric-id"
                      className="text-[11px] font-medium text-gray-600"
                    >
                      Numeric path id
                    </Label>
                    <Input
                      id="cycle-variant-numeric-id"
                      inputMode="numeric"
                      value={manualPathIdInput}
                      onChange={(e) => setManualPathIdInput(e.target.value)}
                      placeholder="From session / API (e.g. 1504)"
                      className="h-9 rounded-lg border-gray-200 bg-gray-50 text-sm"
                      disabled={isSubmitting}
                    />
                    <p className="text-[11px] leading-snug text-gray-500">
                      We fill this from the comet list when{" "}
                      <span className="font-medium">path_id</span> is present.
                      Otherwise enter the path id for{" "}
                      <span className="font-mono text-[10px]">POST …/paths/…/variant</span>.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cycle-variant-title"
                      className="text-[11px] font-medium text-gray-600"
                    >
                      Variant title{" "}
                      <span className="font-normal text-gray-400">(optional)</span>
                    </Label>
                    <Input
                      id="cycle-variant-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder='e.g. "HR Business Partners Cycle"'
                      className="h-9 rounded-lg border-gray-200 bg-gray-50 text-sm"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cycle-variant-instructions"
                      className="text-[11px] font-medium text-gray-600"
                    >
                      Instructions{" "}
                      <span className="font-normal text-gray-400">(optional)</span>
                    </Label>
                    <Textarea
                      id="cycle-variant-instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Describe how this variant differs (stored for downstream AI)."
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

                  {showTargetClientField && (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="cycle-variant-target-client"
                        className="text-[11px] font-medium text-gray-600"
                      >
                        Target client id
                      </Label>
                      <Input
                        id="cycle-variant-target-client"
                        inputMode="numeric"
                        value={targetClientIdInput}
                        onChange={(e) => setTargetClientIdInput(e.target.value)}
                        placeholder="e.g. 42 (required for cross-client)"
                        className="h-9 rounded-lg border-gray-200 bg-gray-50 text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                  )}

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
