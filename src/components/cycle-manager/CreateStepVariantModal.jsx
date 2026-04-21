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

function isValidPathStepId(n) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export default function CreateStepVariantModal({
  open,
  onOpenChange,
  /** From session (useCometManager pathStepId); POST …/steps/{id}/variant */
  numericStepId = null,
  sessionId = "",
  sourceChapterUid = "",
  onSuccess,
  currentCycleName = "",
  sourcePhaseName = "",
  sourceStepName = "",
}) {
  const [copyClientValue, setCopyClientValue] = useState("current");
  const [clients, setClients] = useState([]);
  const [copyCycleValue, setCopyCycleValue] = useState("current");
  const [copyPhaseValue, setCopyPhaseValue] = useState("Current Phase");
  const [cycles, setCycles] = useState([]);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  const [phases, setPhases] = useState([]);
  const [isLoadingPhases, setIsLoadingPhases] = useState(false);
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
    setCopyPhaseValue("Current Phase");
  }, [open, copyClientValue, copyCycleValue]);

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

  useEffect(() => {
    if (!open) return;

    const fetchPhasesForCycle = async () => {
      const targetSessionId =
        copyCycleValue !== "current"
          ? copyCycleValue.replace("session:", "").trim()
          : (typeof sessionId === "string" ? sessionId.trim() : "");

      if (!targetSessionId) {
        setPhases([]);
        return;
      }

      setIsLoadingPhases(true);
      setPhases([]);
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "https://kyper-stage.1st90.com";
        const response = await fetch(
          `${apiUrl}/api/comet/session_details/${targetSessionId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );
        if (!response.ok) {
          toast.error("Unable to load phases");
          return;
        }

        const result = await response.json();
        const chapters = Array.isArray(result?.response_path?.chapters)
          ? result.response_path.chapters
          : [];
        const nextPhases = chapters
          .map((chapter) => ({
            uid:
              (typeof chapter?.uuid === "string" && chapter.uuid.trim()) ||
              (typeof chapter?.uid === "string" && chapter.uid.trim()) ||
              (typeof chapter?.chapter_uid === "string" &&
                chapter.chapter_uid.trim()) ||
              (typeof chapter?.chapterUid === "string" &&
                chapter.chapterUid.trim()) ||
              (typeof chapter?.id === "string" && chapter.id.trim()) ||
              "",
            name:
              (typeof chapter?.name === "string" && chapter.name.trim()) ||
              (typeof chapter?.chapter === "string" && chapter.chapter.trim()) ||
              "Untitled Phase",
          }))
          .filter((phase) => phase.uid);
        setPhases(nextPhases);
      } catch {
        toast.error("Unable to load phases");
      } finally {
        setIsLoadingPhases(false);
      }
    };

    fetchPhasesForCycle();
  }, [open, copyCycleValue, sessionId]);

  const handleClose = () => {
    onOpenChange(false);
    setCopyClientValue("current");
    setClients([]);
    setCopyCycleValue("current");
    setCopyPhaseValue("Current Phase");
    setCycles([]);
    setPhases([]);
    setTitle("");
    setInstructions("");
    setManualStepIdInput("");
    setIsSubmitting(false);
    setIsLoadingCycles(false);
    setIsLoadingPhases(false);
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

      const trimmedSessionId =
        copyCycleValue !== "current"
          ? copyCycleValue.replace("session:", "").trim()
          : (typeof sessionId === "string" ? sessionId.trim() : "");
      const trimmedChapterUid =
        copyPhaseValue !== "Current Phase"
          ? copyPhaseValue.replace("phase:", "").trim()
          : (typeof sourceChapterUid === "string" ? sourceChapterUid.trim() : "");
      const shouldInjectToSession = Boolean(trimmedSessionId && trimmedChapterUid);
      const endpoint = endpoints.stepVariant(String(Math.trunc(pathId)));
      const requestParams = shouldInjectToSession
        ? {
            session_id: trimmedSessionId,
            chapter_uid: trimmedChapterUid,
          }
        : undefined;
      if (!shouldInjectToSession) {
        console.warn("[CreateStepVariantModal] missing injection params", {
          hasSessionId: Boolean(trimmedSessionId),
          hasChapterUid: Boolean(trimmedChapterUid),
          sessionId: trimmedSessionId || null,
          chapterUid: trimmedChapterUid || null,
        });
      }

      const requestDebug = {
        endpoint,
        method: "POST",
        params: requestParams ?? null,
        data: hasBody ? payload : null,
      };
      console.log("[CreateStepVariantModal] request", requestDebug);
      if (typeof window !== "undefined") {
        window.__STEP_VARIANT_DEBUG__ = {
          ...requestDebug,
          at: new Date().toISOString(),
        };
      }
      toast.info?.("Step variant debug", {
        description: `params=${JSON.stringify(requestDebug.params ?? {})} data=${JSON.stringify(requestDebug.data ?? {})}`,
        duration: 6000,
      });

      const result = await apiService({
        endpoint,
        method: "POST",
        ...(shouldInjectToSession
          ? {
              params: {
                session_id: trimmedSessionId,
                chapter_uid: trimmedChapterUid,
              },
            }
          : {}),
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
        className="left-1/2 top-[calc(50%+2.25rem)] w-[calc(100vw-2rem)] max-w-[720px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl lg:left-[calc(50%+9.5rem)] xl:left-[calc(50%+10.5rem)] [&>button]:hidden"
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
              <div>
                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3 sm:gap-5">
                  <div className="min-w-0 space-y-1">
                    <p className="text-[11px] font-medium text-gray-600">
                      Current Cycle Name
                    </p>
                    <p className="break-words text-sm font-medium leading-snug text-[#181D27]">
                      {currentCycleName}
                    </p>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="text-[11px] font-medium text-gray-600">
                      Current Phase Name
                    </p>
                    <p className="break-words text-sm font-medium leading-snug text-[#181D27]">
                      {sourcePhaseName}
                    </p>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="text-[11px] font-medium text-gray-600">
                      Step Name
                    </p>
                    <p className="break-words text-sm font-medium leading-snug text-[#181D27]">
                      {sourceStepName || "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 rounded-xl bg-[#F3F4F6] p-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="step-variant-title"
                      className="text-[11px] font-medium text-gray-600"
                    >
                      New Step Title
                    </Label>
                    <Input
                      id="step-variant-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder=""
                      className="h-9 rounded-lg border border-gray-200 bg-white text-sm"
                      disabled={isSubmitting}
                    />
                  </div>
                  {/* <div className="space-y-1.5">
                    <Label
                      htmlFor="step-variant-instructions"
                      className="text-[11px] font-medium text-gray-600"
                    >
                      Instruction
                    </Label>
                    <Textarea
                      id="step-variant-instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder=""
                      className="min-h-[88px] rounded-lg border border-gray-200 bg-white text-sm sm:min-h-[100px]"
                      disabled={isSubmitting}
                    />
                  </div> */}
                </div>

                <div className="mt-4 space-y-3 rounded-xl bg-[#F3F4F6] p-3">
                  <p className="text-xs font-semibold text-gray-900">Copy to</p>
                  <div className="h-px bg-gray-200" aria-hidden />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                    <div className="min-w-0 space-y-1">
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

                    <div className="min-w-0 space-y-1">
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

                    <div className="min-w-0 space-y-1">
                      <p className="text-[11px] font-medium text-gray-600">
                        Phase
                      </p>
                      <Select
                        value={copyPhaseValue}
                        onValueChange={setCopyPhaseValue}
                        disabled={isSubmitting || isLoadingPhases}
                      >
                        <SelectTrigger className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Current Phase">
                            Current Phase
                          </SelectItem>
                          {phases.map((phase) => (
                            <SelectItem
                              key={phase.uid}
                              value={`phase:${phase.uid}`}
                            >
                              {phase.name}
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
