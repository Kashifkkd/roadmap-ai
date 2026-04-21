"use client";

import React, { useState, useEffect } from "react";
import { CircleX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
import { getClients } from "@/api/client";
import { endpoints } from "@/api/endpoint";
import { toast } from "@/components/ui/toast";

function isValidPathChapterId(n) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export default function CreatePhaseVariantModal({
  open,
  onOpenChange,
  /** From session (useCometManager pathChapterId); POST …/chapters/{id}/variant */
  numericChapterId = null,
  sessionId = "",
  onSuccess,
  currentCycleName = "",
  sourcePhaseName = "",
}) {
  const [copyClientValue, setCopyClientValue] = useState("current");
  const [clients, setClients] = useState([]);
  const [copyCycleValue, setCopyCycleValue] = useState("current");
  const [cycles, setCycles] = useState([]);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** When the session has no integer chapter id, user can paste the DB id for POST …/chapters/{id}/variant. */
  const [manualChapterIdInput, setManualChapterIdInput] = useState("");

  useEffect(() => {
    if (!open) return;
    if (isValidPathChapterId(numericChapterId)) {
      setManualChapterIdInput(String(Math.trunc(numericChapterId)));
    } else {
      setManualChapterIdInput("");
    }
  }, [open, numericChapterId]);

  useEffect(() => {
    if (!open) return;

    const fetchClients = async () => {
      const res = await getClients({ skip: 0, limit: 500, enabledOnly: true });
      if (res?.success) {
        setClients(Array.isArray(res.response) ? res.response : []);
      } else {
        toast.error("Unable to load clients");
      }
    };

    fetchClients();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCopyCycleValue("current");
  }, [open, copyClientValue]);

  useEffect(() => {
    if (!open) return;

    const fetchCycles = async () => {
      const currentClientIdRaw =
        typeof window !== "undefined" ? localStorage.getItem("Client id") : null;
      const currentClientId = parseInt((currentClientIdRaw || "").trim(), 10);
      const selectedClientId =
        copyClientValue !== "current"
          ? parseInt(copyClientValue.replace("client:", ""), 10)
          : null;
      const clientId =
        copyClientValue === "current" ? currentClientId : selectedClientId;
      if (!Number.isFinite(clientId) || clientId < 0) {
        setCycles([]);
        return;
      }

      setIsLoadingCycles(true);
      setCycles([]);
      try {
        const result = await apiService({
          endpoint: endpoints.fetchList,
          method: "GET",
          params: {
            client_id: clientId,
            sort_order: "created_at",
            sort_by: "desc",
          },
        });
        if (!result?.success) {
          toast.error("Unable to load cycles");
          setCycles([]);
          return;
        }

        const sessions = Array.isArray(result.response)
          ? result.response
          : Array.isArray(result.response?.data)
            ? result.response.data
            : Array.isArray(result.response?.results)
              ? result.response.results
              : [];

        const nextCycles = sessions
          .map((item) => ({
            sessionId:
              typeof item?.session_id === "string" ? item.session_id.trim() : "",
            status:
              typeof item?.status === "string"
                ? item.status.trim().toLowerCase()
                : "",
            name:
              (typeof item?.session_name === "string" &&
                item.session_name.trim()) ||
              "Untitled Cycle",
          }))
          .filter((item) => item.sessionId && item.status === "published");

        setCycles(nextCycles);
      } catch {
        toast.error("Unable to load cycles");
        setCycles([]);
      } finally {
        setIsLoadingCycles(false);
      }
    };

    fetchCycles();
  }, [open, copyClientValue]);

  const handleClose = () => {
    onOpenChange(false);
    setCopyClientValue("current");
    setClients([]);
    setCopyCycleValue("current");
    setCycles([]);
    setTitle("");
    setInstructions("");
    setManualChapterIdInput("");
    setIsSubmitting(false);
    setIsLoadingCycles(false);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      let pathId = numericChapterId;
      if (manualChapterIdInput.trim() !== "") {
        const manualParsed = parseInt(manualChapterIdInput.trim(), 10);
        if (Number.isFinite(manualParsed) && manualParsed >= 0) {
          pathId = manualParsed;
        }
      }
      if (!isValidPathChapterId(pathId)) {
        toast.error("Cannot create variant", {
          description:
            "No numeric chapter id for this phase. Ensure response_path chapters include chapter_id, #chapter_N, or position—or enter an id below.",
        });
        return;
      }

      const trimmedTitle = title.trim();
      const trimmedInstructions = instructions.trim();
      const hasBody = Boolean(trimmedTitle || trimmedInstructions);
      const payload = {};
      if (trimmedTitle) payload.title = trimmedTitle;
      if (trimmedInstructions) payload.instructions = trimmedInstructions;

      const trimmedSessionId =
        copyCycleValue !== "current"
          ? copyCycleValue.replace("session:", "").trim()
          : (typeof sessionId === "string" ? sessionId.trim() : "");
      const endpoint = endpoints.chapterVariant(String(Math.trunc(pathId)));
      const requestParams = trimmedSessionId
        ? { session_id: trimmedSessionId }
        : undefined;
      if (!trimmedSessionId) {
        console.warn("[CreatePhaseVariantModal] missing session_id", {
          sessionId: trimmedSessionId || null,
        });
      }
      const requestDebug = {
        endpoint,
        method: "POST",
        params: requestParams ?? null,
        data: hasBody ? payload : null,
      };
      console.log("[CreatePhaseVariantModal] request", requestDebug);
      if (typeof window !== "undefined") {
        window.__PHASE_VARIANT_DEBUG__ = {
          ...requestDebug,
          at: new Date().toISOString(),
        };
      }
      toast.info?.("Phase variant debug", {
        description: `params=${JSON.stringify(requestDebug.params ?? {})} data=${JSON.stringify(requestDebug.data ?? {})}`,
        duration: 6000,
      });

      const result = await apiService({
        endpoint,
        method: "POST",
        ...(requestParams ? { params: requestParams } : {}),
        ...(hasBody
          ? {
              data: payload,
              headers: { "Content-Type": "application/json" },
            }
          : {}),
      });

      if (result.success) {
        toast.success("Phase variant created", {
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
            Create Phase Variant
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
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
                </div>

                <div className="mt-4 space-y-1.5">
                  <Label
                    htmlFor="phase-variant-title"
                    className="text-[11px] font-medium text-gray-600"
                  >
                    New Phase Title{" "}
                    {/* <span className="font-normal text-gray-400">(optional)</span> */}
                  </Label>
                  <Input
                    id="phase-variant-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder=""
                    className="h-9 rounded-lg border-gray-200 bg-gray-50 text-sm"
                    disabled={isSubmitting}
                  />
                </div>
                {/* <div className="space-y-1.5">
                  <Label
                    htmlFor="phase-variant-instructions"
                    className="text-[11px] font-medium text-gray-600"
                  >
                    Instruction{" "}
                    <span className="font-normal text-gray-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="phase-variant-instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Reframe scenarios from finance to HR context."
                    className="min-h-[120px] rounded-lg border-gray-200 bg-gray-50 text-sm sm:min-h-[132px]"
                    disabled={isSubmitting}
                  />
                </div> */}

                <div className="mt-4 space-y-3 rounded-xl bg-[#F3F4F6] p-3">
                  <p className="text-xs font-semibold text-gray-900">Copy to</p>
                  <div className="h-px bg-gray-200" aria-hidden />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-gray-600">
                        Client
                      </p>
                      <Select
                        value={copyClientValue}
                        onValueChange={setCopyClientValue}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current">
                            Current Client
                          </SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={`client:${client.id}`}>
                              {client.name || `Client ${client.id}`}
                            </SelectItem>
                          ))}
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
                        disabled={isSubmitting || isLoadingCycles}
                      >
                        <SelectTrigger className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current">
                            Current Cycle
                          </SelectItem>
                          {cycles
                            .filter((cycle) => cycle.sessionId !== sessionId)
                            .map((cycle) => (
                              <SelectItem
                                key={cycle.sessionId}
                                value={`session:${cycle.sessionId}`}
                              >
                                {cycle.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
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
