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
import SourceMaterialCard from "@/components/create-comet/SourceMaterialCard";
import {
  preloadRemixSourceMaterials,
  uploadPendingRemixSourceMaterials,
} from "@/lib/remixSourceMaterialsPreload";

function isValidPathStepId(n) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export default function CreateRemixStepModal({
  open,
  onOpenChange,
  numericStepId = null,
  sessionId = "",
  sourceChapterUid = "",
  currentCycleName = "",
  sourcePhaseName = "",
  sourceStepName = "",
}) {
  const [copyClientValue, setCopyClientValue] = useState("");
  const [clients, setClients] = useState([]);
  const [copyCycleValue, setCopyCycleValue] = useState("");
  const [copyPhaseValue, setCopyPhaseValue] = useState("");
  const [cycles, setCycles] = useState([]);
  const [phases, setPhases] = useState([]);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  const [isLoadingPhases, setIsLoadingPhases] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceFiles, setSourceFiles] = useState([]);
  const [webpageUrls, setWebpageUrls] = useState([]);
  const [isUploadingSources, setIsUploadingSources] = useState(false);
  const titleInputRef = useRef(null);

  const materialUploadSessionId =
    copyCycleValue.trim() || (typeof sessionId === "string" ? sessionId.trim() : "");

  useEffect(() => {
    if (!open) return;
    setTitle(sourceStepName || "");
    setSourceFiles([]);
    setWebpageUrls([]);
  }, [open, sourceStepName]);

  useEffect(() => {
    if (!open) return;
    const targetId =
      copyCycleValue.trim() ||
      (typeof sessionId === "string" ? sessionId.trim() : "");
    if (!targetId) return;

    let cancelled = false;
    const load = async () => {
      try {
        const { files, links } = await preloadRemixSourceMaterials(targetId);
        if (!cancelled) {
          setSourceFiles(files);
          setWebpageUrls(links);
        }
      } catch (error) {
        console.error("Failed to preload source materials for remix step:", error);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, sessionId, copyCycleValue]);

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
    setPhases([]);
    setCopyPhaseValue("");
  }, [open, copyClientValue]);

  useEffect(() => {
    if (!open) return;
    setCopyPhaseValue("");
  }, [open, copyCycleValue]);

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

  useEffect(() => {
    if (!open) return;

    const fetchPhasesForCycle = async () => {
      const targetSessionId = copyCycleValue.trim();

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
  }, [open, copyCycleValue]);

  const handleClose = () => {
    onOpenChange(false);
    setCopyClientValue("");
    setClients([]);
    setCopyCycleValue("");
    setCopyPhaseValue("");
    setCycles([]);
    setPhases([]);
    setTitle("");
    setInstructions("");
    setSourceFiles([]);
    setWebpageUrls([]);
    setIsLoadingCycles(false);
    setIsLoadingPhases(false);
    setIsUploadingSources(false);
    setIsSubmitting(false);
  };

  const handleSave = async () => {
    const trimmedSessionId = copyCycleValue.trim();
    const trimmedChapterUid = copyPhaseValue.trim();
    if (!trimmedSessionId || !trimmedChapterUid) {
      toast.error("Cannot remix step", {
        description: "Select client, cycle, and phase to remix into.",
      });
      return;
    }

    const pathId = numericStepId;
    if (!isValidPathStepId(pathId)) {
      toast.error("Cannot remix step", {
        description:
          "No numeric step id for this step. Ensure the session includes step_id on this step.",
      });
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedInstructions = instructions.trim();
    if (!trimmedInstructions) {
      toast.error("Cannot remix step", {
        description: "Add instructions so the remix knows what to change.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await uploadPendingRemixSourceMaterials(setIsUploadingSources);

      const payload = { instructions: trimmedInstructions };
      if (trimmedTitle) payload.title = trimmedTitle;

      const result = await apiService({
        endpoint: endpoints.stepVariant(String(Math.trunc(pathId))),
        method: "POST",
        params: {
          session_id: trimmedSessionId,
          chapter_uid: trimmedChapterUid,
        },
        data: payload,
        headers: { "Content-Type": "application/json" },
      });

      if (!result?.success) {
        const detail =
          (typeof result.response === "object" && result.response?.detail) ||
          (typeof result.response === "object" && result.response?.message) ||
          (typeof result.response === "string" ? result.response : null);
        toast.error("Could not start step remix", {
          description:
            detail ||
            (result.status
              ? `Request failed (${result.status})`
              : "Unexpected response"),
        });
        return;
      }

      toast.success(
        "Step remix has started. This step will update when processing finishes.",
      );
      handleClose();
    } catch (e) {
      toast.error("Could not start step remix", {
        description: e?.message || "Unexpected error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const areAllDropdownsSelected = Boolean(
    copyClientValue && copyCycleValue && copyPhaseValue,
  );
  const selectedCycleHasNoPhases =
    Boolean(copyCycleValue) && !isLoadingPhases && phases.length === 0;
  const isSaveDisabled =
    isSubmitting ||
    isUploadingSources ||
    isLoadingCycles ||
    isLoadingPhases ||
    !instructions.trim() ||
    !areAllDropdownsSelected ||
    selectedCycleHasNoPhases ||
    !materialUploadSessionId;

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
        className="left-1/2 top-[calc(50%+2.25rem)] w-[calc(100vw-2rem)] max-w-[min(1024px,calc(100vw-2rem))] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 gap-3 overflow-hidden rounded-[24px] border-0 bg-white p-0 pt-4 pb-2 px-2 shadow-xl lg:left-[calc(50%+9.5rem)] xl:left-[calc(50%+10.5rem)] [&>button]:hidden"
      >
        <div className="flex h-[47px] items-center justify-between gap-2 px-2">
          <DialogTitle className="text-left text-[18px] font-semibold leading-7 text-[#181D27]">
            Remix Step
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

        <div className="flex flex-col items-stretch gap-[2px] rounded-2xl bg-[#F5F5F5] p-2">
          <div className="flex max-h-[calc(85vh-150px)] min-h-[280px] flex-col overflow-hidden rounded-t-lg bg-white p-2 md:min-h-[320px]">
            <div className="flex min-h-0 flex-1 flex-col gap-0 divide-y divide-[#E9EAEB] md:flex-row md:divide-x md:divide-y-0">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-2 md:max-w-[50%] md:pr-3">
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
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-medium leading-5 text-[#181D27]">
                    Step Name
                  </p>
                  <p className="text-base font-semibold leading-6 text-[#181D27]">
                    {sourceStepName || "—"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl bg-[#F5F5F5] p-4">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="remix-step-title"
                    className="text-sm font-medium leading-5 text-[#181D27]"
                  >
                    New Step Title
                  </Label>
                  <Input
                    id="remix-step-title"
                    ref={titleInputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Step name"
                    disabled={isSubmitting}
                    className="h-9 min-h-9 rounded-lg border border-[#D5D7DA] bg-white px-3 py-[7.5px] text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="remix-step-instructions"
                    className="text-sm font-medium leading-5 text-[#181D27]"
                  >
                    Instructions
                  </Label>
                  <Textarea
                    id="remix-step-instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Add remix instructions…"
                    disabled={isSubmitting}
                    className="min-h-[76px] resize-y rounded-lg border border-[#D5D7DA] bg-white px-3 py-2 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl bg-[#F5F5F5] p-4">
                <p className="text-sm font-medium leading-5 text-[#181D27]">
                  Copy to
                </p>
                <div className="h-px w-full bg-[#D5D7DA]" aria-hidden />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="flex flex-col gap-2">
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

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium leading-5 text-[#181D27]">
                      Cycle
                    </p>
                    <Select
                      value={copyCycleValue}
                      onValueChange={setCopyCycleValue}
                      disabled={
                        isSubmitting || isLoadingCycles || !copyClientValue
                      }
                    >
                      <SelectTrigger className="h-9 min-h-9 w-full rounded-lg border border-[#D5D7DA] bg-white px-3 py-[7.5px] text-sm text-[#181D27] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        <SelectValue placeholder="Select a cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        {cycles.map((cycle) => (
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

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium leading-5 text-[#181D27]">
                      Phase
                    </p>
                    <Select
                      value={copyPhaseValue}
                      onValueChange={setCopyPhaseValue}
                      disabled={
                        isSubmitting ||
                        isLoadingPhases ||
                        !copyCycleValue ||
                        selectedCycleHasNoPhases
                      }
                    >
                      <SelectTrigger className="h-9 min-h-9 w-full rounded-lg border border-[#D5D7DA] bg-white px-3 py-[7.5px] text-sm text-[#181D27] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        <SelectValue placeholder="Select a phase" />
                      </SelectTrigger>
                      <SelectContent>
                        {phases.map((phase) => (
                          <SelectItem key={phase.uid} value={phase.uid}>
                            {phase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCycleHasNoPhases ? (
                      <p className="text-xs text-red-600">
                        Selected cycle has no phases. Save is disabled.
                      </p>
                    ) : null}
                  </div>
                </div>

              </div>
              </div>

              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-2 pt-3 md:max-w-[50%] md:pl-3 md:pt-2">
                <div className="min-h-0 flex-1 rounded-2xl bg-[#F5F5F5] p-3">
                  {materialUploadSessionId ? (
                    <SourceMaterialCard
                      sessionId={materialUploadSessionId}
                      files={sourceFiles}
                      setFiles={setSourceFiles}
                      isNewComet
                      webpageUrls={webpageUrls}
                      setWebpageUrls={setWebpageUrls}
                      onUploadingChange={setIsUploadingSources}
                      localDeleteOnly
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      Select a client and cycle to add source materials and web
                      links.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

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
