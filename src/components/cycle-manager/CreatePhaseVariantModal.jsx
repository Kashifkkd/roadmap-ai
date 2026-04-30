"use client";

import React, { useState, useEffect, useRef } from "react";
import { CircleX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
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
  const [copyClientValue, setCopyClientValue] = useState("");
  const [clients, setClients] = useState([]);
  const [copyCycleValue, setCopyCycleValue] = useState("");
  const [cycles, setCycles] = useState([]);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** When the session has no integer chapter id, user can paste the DB id for POST …/chapters/{id}/variant. */
  const [manualChapterIdInput, setManualChapterIdInput] = useState("");
  const titleInputRef = useRef(null);

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
    setTitle(sourcePhaseName || "");
  }, [open, sourcePhaseName]);

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
    setCopyCycleValue("");
  }, [open, copyClientValue]);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const fetchCycles = async () => {
      const clientId = parseInt(copyClientValue, 10);
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
              typeof item?.session_id === "string"
                ? item.session_id.trim()
                : "",
            status:
              typeof item?.status === "string"
                ? item.status.trim().toLowerCase()
                : "",
            name:
              (typeof item?.session_name === "string" &&
                item.session_name.trim()) ||
              "Untitled Cycle",
          }))
          .filter((item) => item.sessionId);

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
    setCopyClientValue("");
    setClients([]);
    setCopyCycleValue("");
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

      const trimmedSessionId = copyCycleValue.trim();
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
      // toast.info?.("Phase variant debug", {
      //   description: `params=${JSON.stringify(requestDebug.params ?? {})} data=${JSON.stringify(requestDebug.data ?? {})}`,
      //   duration: 6000,
      // });

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
        toast.success("Phase copied successfully");
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

  const areAllDropdownsSelected = Boolean(copyClientValue && copyCycleValue);
  const isSaveDisabled =
    isSubmitting || isLoadingCycles || !areAllDropdownsSelected;

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
        className="left-1/2 top-[calc(50%+2.25rem)] w-[calc(100vw-2rem)] max-w-[968px] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-hidden rounded-[24px] border-0 bg-white p-0 pt-4 pb-2 px-2 shadow-xl lg:left-[calc(50%+9.5rem)] xl:left-[calc(50%+10.5rem)] [&>button]:hidden"
      >
        {/* Header */}
        <div className="flex h-[47px] items-center justify-between gap-2 px-2">
          <DialogTitle className="text-left text-[18px] font-semibold leading-7 text-[#181D27]">
            Copy Phase
          </DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="flex h-6 w-6 shrink-0 items-center justify-center"
              aria-label="Close"
            >
              <CircleX className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </DialogClose>
        </div>

        {/* Outer gray panel */}
        <div className="flex flex-col items-stretch gap-[2px] rounded-2xl bg-[#F5F5F5] p-2">
          {/* Top white section (content) */}
          <div className="rounded-t-lg bg-white p-2">
            <div className="flex flex-col gap-4 rounded-t-lg bg-white p-2">
              {/* Row: Current Cycle Name + Phase Name */}
              <div className="flex flex-row items-start gap-4">
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-medium leading-5 text-[#181D27]">
                    Current Cycle Name
                  </p>
                  <p className="text-base font-semibold leading-6 text-[#181D27]">
                    {currentCycleName || "—"}
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-medium leading-5 text-[#181D27]">
                    Phase Name
                  </p>
                  <p className="text-base font-semibold leading-6 text-[#181D27]">
                    {sourcePhaseName || "—"}
                  </p>
                </div>
              </div>

              {/* Inputs card */}
              <div className="flex flex-col gap-2 rounded-2xl bg-[#FNew Step Title5F5F5] p-4">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="phase-variant-title"
                    className="text-sm font-medium leading-5 text-[#181D27]"
                  >
                    New Phase Title
                  </Label>
                  <Input
                    id="phase-variant-title"
                    ref={titleInputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Phase name"
                    className="h-9 min-h-9 rounded-lg border border-[#D5D7DA] bg-white px-3 py-[7.5px] text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    disabled={isSubmitting}
                  />
                </div>
                {/* <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="phase-variant-instructions"
                    className="text-sm font-medium leading-5 text-[#181D27]"
                  >
                    Instruction
                  </Label>
                  <Textarea
                    id="phase-variant-instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder=""
                    className="min-h-[76px] resize-y rounded-lg border border-[#D5D7DA] bg-white px-3 py-2 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    disabled={isSubmitting}
                  />
                </div> */}
              </div>

              {/* Copy to card */}
              <div className="flex flex-col gap-2 rounded-2xl bg-[#F5F5F5] p-4">
                <p className="text-sm font-medium leading-5 text-[#181D27]">
                  Copy to
                </p>
                <div className="h-px w-full bg-[#D5D7DA]" aria-hidden />
                <div className="flex flex-row items-start gap-2">
                  <div className="flex flex-1 flex-col gap-2">
                    <p className="text-sm font-medium leading-5 text-[#181D27]">
                      Client
                    </p>
                    <Select
                      value={copyClientValue}
                      onValueChange={setCopyClientValue}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-9 min-h-9 w-full rounded-lg border border-[#D5D7DA] bg-white px-3 py-[7.5px] text-sm text-[#181D27] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem
                            key={client.id}
                            value={String(client.id)}
                          >
                            {client.name || `Client ${client.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <p className="text-sm font-medium leading-5 text-[#181D27]">
                      Cycle
                    </p>
                    <Select
                      value={copyCycleValue}
                      onValueChange={setCopyCycleValue}
                      disabled={isSubmitting || isLoadingCycles || !copyClientValue}
                    >
                      <SelectTrigger className="h-9 min-h-9 w-full rounded-lg border border-[#D5D7DA] bg-white px-3 py-[7.5px] text-sm text-[#181D27] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        <SelectValue placeholder="Select a cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        {cycles
                          .filter((cycle) => cycle.sessionId !== sessionId)
                          .map((cycle) => (
                            <SelectItem
                              key={cycle.sessionId}
                              value={cycle.sessionId}
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

          {/* Bottom white footer */}
          <div className="flex items-center justify-end rounded-b-lg bg-white p-2">
            <Button
              className="inline-flex h-9 min-h-9 items-center justify-center gap-2 rounded-lg bg-[#7367F0] px-4 py-[7.5px] text-sm font-medium leading-5 text-white hover:bg-[#625acc] active:bg-[#574fb3]"
              onClick={handleSave}
              type="button"
              disabled={isSaveDisabled}
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
      </DialogContent>
    </Dialog>
  );
}
