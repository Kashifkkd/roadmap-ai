"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { endpoints } from "@/api/endpoint";
import { getClients } from "@/api/client";
import { toast } from "@/components/ui/toast";
import SourceMaterialCard from "@/components/create-comet/SourceMaterialCard";
import { getSourceMaterials } from "@/api/getSourceMaterials";
import { resolveSourceMaterialLinkUrl } from "@/lib/sourceMaterialLinkUrl";
import { subscribeToVariantReadyWithToast } from "@/lib/variant-ready-notify";

function isValidPathId(n) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export default function CreateCycleRemixModal({
  open,
  onOpenChange,
  numericPathId = null,
  sessionId = "",
  onSuccess,
  cycleName = "",
}) {
  const [copyClientValue, setCopyClientValue] = useState("");
  const [clients, setClients] = useState([]);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceFiles, setSourceFiles] = useState([]);
  const [webpageUrls, setWebpageUrls] = useState([]);
  const [isUploadingSources, setIsUploadingSources] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTitle(cycleName || "");
    setSourceFiles([]);
    setWebpageUrls([]);
  }, [open, cycleName]);

  useEffect(() => {
    if (!open) return;

    const currentSessionId =
      sessionId ||
      (typeof window !== "undefined" ? localStorage.getItem("sessionId") : null);
    if (!currentSessionId) return;

    const preloadSourceMaterials = async () => {
      try {
        const materials = await getSourceMaterials(currentSessionId);
        if (!Array.isArray(materials) || materials.length === 0) return;

        const preloadedFiles = [];
        const preloadedLinks = [];

        materials.forEach((material) => {
          if (material?.type === "link") {
            const linkUrl = resolveSourceMaterialLinkUrl(material);
            if (!linkUrl) return;
            preloadedLinks.push({
              id: material?.id ?? material?.material_id ?? null,
              url: linkUrl.trim(),
              title: material?.source_name || "",
              comment: material?.comment ?? "",
              isUploaded: true,
            });
            return;
          }

          preloadedFiles.push({
            id: material?.id ?? material?.material_id ?? null,
            name: material?.source_name || "Unknown File",
            comment: material?.comment ?? "",
            isUploaded: true,
            output_presigned_url: material?.output_presigned_url,
          });
        });

        if (preloadedFiles.length > 0) setSourceFiles(preloadedFiles);
        if (preloadedLinks.length > 0) setWebpageUrls(preloadedLinks);
      } catch (error) {
        console.error("Failed to preload source materials for remix:", error);
      }
    };

    preloadSourceMaterials();
  }, [open, sessionId]);

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

    const timer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
    setCopyClientValue("");
    setClients([]);
    setTitle("");
    setInstructions("");
    setSourceFiles([]);
    setWebpageUrls([]);
    setIsSubmitting(false);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const pathId = numericPathId;
      if (!isValidPathId(pathId)) {
        toast.error("Cannot remix cycle", {
          description:
            "No path id for this session. Ensure the sessions list includes path_id or id.",
        });
        return;
      }

      const targetClientId = parseInt(copyClientValue, 10);
      if (!Number.isFinite(targetClientId) || targetClientId < 0) {
        toast.error("Cannot remix cycle", {
          description: "Please select a valid target client.",
        });
        return;
      }

      const trimmedTitle = title.trim();
      const trimmedInstructions = instructions.trim();

      if (
        typeof window !== "undefined" &&
        typeof window.uploadAllFiles === "function"
      ) {
        setIsUploadingSources(true);
        try {
          await window.uploadAllFiles();
        } finally {
          setIsUploadingSources(false);
        }
      }

      const hasBody = Boolean(trimmedTitle || trimmedInstructions);
      const payload = {};
      if (trimmedTitle) payload.title = trimmedTitle;
      if (trimmedInstructions) payload.instructions = trimmedInstructions;
      const params = {
        count: 1,
        persist_to_redis: true,
        client_id: targetClientId,
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
      if (!result?.success) {
        const detail =
          (typeof result.response === "object" && result.response?.detail) ||
          (typeof result.response === "object" && result.response?.message) ||
          (typeof result.response === "string" ? result.response : null);
        toast.error("Could not remix cycle", {
          description:
            detail ||
            (result.status
              ? `Request failed (${result.status})`
              : "Unexpected response"),
        });
        return;
      }

      toast.success("Cycle remixed successfully");
      subscribeToVariantReadyWithToast(result.response?.session_id, title.trim() || cycleName);
      onSuccess?.(result.response);
      handleClose();
    } catch (e) {
      toast.error("Could not remix cycle", {
        description: e?.message || "Unexpected error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSaveDisabled = isSubmitting || isUploadingSources || !copyClientValue;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[min(1024px,calc(100vw-2rem))] max-h-[85vh] gap-3 overflow-hidden rounded-[24px] border-0 bg-white p-0 pt-3 pb-2 px-2 shadow-xl [&>button]:hidden">
        <div className="flex h-[47px] items-center justify-between gap-2 px-2">
          <DialogTitle className="text-left text-[18px] font-semibold leading-7 text-[#181D27]">
            Remix Cycle
          </DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="flex h-6 w-6 shrink-0 items-center justify-center "
              aria-label="Close"
            >
              <CircleX className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </DialogClose>
        </div>

        <div className="flex flex-col items-stretch gap-[2px] rounded-2xl bg-[#F5F5F5] p-2">
          <div className="flex max-h-[calc(85vh-150px)] min-h-[280px] flex-col overflow-hidden rounded-t-lg bg-white p-2 md:min-h-[320px]">
            <div className="flex min-h-0 flex-1 flex-col gap-0 divide-y divide-[#E9EAEB] md:flex-row md:divide-x md:divide-y-0">
              {/* Left: cycle + remix form */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-2 md:max-w-[50%] md:pr-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium leading-5 text-[#181D27]">
                    Comet Title
                  </p>
                  <p className="text-base font-semibold leading-6 text-[#181D27]">
                    {cycleName || "—"}
                  </p>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl bg-[#F5F5F5] p-4">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="cycle-remix-title"
                      className="text-sm font-medium leading-5 text-[#181D27]"
                    >
                      New Comet Title
                    </Label>
                    <Input
                      id="cycle-remix-title"
                      ref={titleInputRef}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Comet title"
                      className="h-9 min-h-9 rounded-lg border border-[#D5D7DA] bg-white px-3 py-[7.5px] text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="cycle-remix-instructions"
                      className="text-sm font-medium leading-5 text-[#181D27]"
                    >
                      Instruction
                    </Label>
                    <Textarea
                      id="cycle-remix-instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Add instructions for remix"
                      className="min-h-[88px] resize-y rounded-lg border border-[#D5D7DA] bg-white px-3 py-2 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl bg-[#F5F5F5] p-4">
                  <p className="text-sm font-medium leading-5 text-[#181D27]">
                    Remix to
                  </p>
                  <div className="h-px w-full bg-[#D5D7DA]" aria-hidden />
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
                </div>
              </div>

              {/* Right: source materials */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-2 pt-3 md:max-w-[50%] md:pl-3 md:pt-2">
                {/* <p className="mb-2 shrink-0 text-sm font-medium leading-5 text-[#181D27]">
                  Source materials
                </p>
                 */}
                <div className="min-h-0 flex-1 rounded-2xl bg-[#F5F5F5] p-3">
                  <SourceMaterialCard
                    files={sourceFiles}
                    setFiles={setSourceFiles}
                    isNewComet
                    webpageUrls={webpageUrls}
                    setWebpageUrls={setWebpageUrls}
                    onUploadingChange={setIsUploadingSources}
                  />
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
