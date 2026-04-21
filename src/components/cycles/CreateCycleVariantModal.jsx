"use client";

import React, { useEffect, useState } from "react";
import { CircleX, Loader2, X } from "lucide-react";
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

function isValidPathId(n) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export default function CreateCycleVariantModal({
  open,
  onOpenChange,
  /** From session list: path_id when set, else session row id; POST …/paths/{id}/variant */
  numericPathId = null,
  onSuccess,
  cycleName = "",
}) {
  const [copyClientValue, setCopyClientValue] = useState("current");
  const [clients, setClients] = useState([]);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleClose = () => {
    onOpenChange(false);
    setCopyClientValue("current");
    setClients([]);
    setTitle("");
    setInstructions("");
    setIsSubmitting(false);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const currentClientIdRaw =
        typeof window !== "undefined"
          ? localStorage.getItem("Client id")
          : null;
      const currentClientId = parseInt((currentClientIdRaw || "").trim(), 10);
      if (!Number.isFinite(currentClientId) || currentClientId < 0) {
        toast.error("Cannot create variant", {
          description:
            "Missing client id. Please select a client again and retry.",
        });
        return;
      }

      const pathId = numericPathId;
      if (!isValidPathId(pathId)) {
        toast.error("Cannot create variant", {
          description:
            "No path id for this session. Ensure the sessions list includes path_id or id.",
        });
        return;
      }

      const crossClient = copyClientValue !== "current";
      const targetClientId = crossClient
        ? parseInt(copyClientValue.replace("client:", ""), 10)
        : null;
      if (
        crossClient &&
        (!Number.isFinite(targetClientId) || targetClientId < 0)
      ) {
        toast.error("Cannot create variant", {
          description: "Please select a valid target client.",
        });
        return;
      }

      const trimmedTitle = title.trim();
      const trimmedInstructions = instructions.trim();
      const hasBody = Boolean(trimmedTitle || trimmedInstructions);
      const payload = {};
      if (trimmedTitle) payload.title = trimmedTitle;
      if (trimmedInstructions) payload.instructions = trimmedInstructions;

      const effectiveClientId =
        crossClient && targetClientId != null
          ? targetClientId
          : currentClientId;

      const params = {
        count: 1,
        persist_to_redis: true,
        client_id: effectiveClientId,
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

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[728px] gap-4 overflow-hidden rounded-[24px] border-0 bg-white p-0 pt-4 pb-2 px-2 shadow-xl [&>button]:hidden">
        {/* Header */}
        <div className="flex h-[47px] items-center justify-between gap-2 px-2">
          <DialogTitle className="text-left text-[18px] font-semibold leading-7 text-[#181D27]">
            Create Cycle Variant
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

        {/* Outer gray panel */}
        <div className="flex flex-col items-stretch gap-[2px] rounded-2xl bg-[#F5F5F5] p-2">
          {/* Top white section (content) */}
          <div className="rounded-t-lg bg-white p-2">
            <div className="flex flex-col gap-2 rounded-t-lg bg-white p-2">
              {/* Cycle title */}
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium leading-5 text-[#181D27]">
                  Cycle Title
                </p>
                <p className="text-base font-semibold leading-6 text-[#181D27]">
                  {cycleName || "—"}
                </p>
              </div>

              {/* Inputs card */}
              <div className="flex flex-col gap-2 rounded-2xl bg-[#F5F5F5] p-4">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="cycle-variant-title"
                    className="text-sm font-medium leading-5 text-[#181D27]"
                  >
                    New Cycle Title
                  </Label>
                  <Input
                    id="cycle-variant-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder=""
                    className="h-9 min-h-9 rounded-lg border border-[#D5D7DA] bg-white px-3 py-[7.5px] text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="cycle-variant-instructions"
                    className="text-sm font-medium leading-5 text-[#181D27]"
                  >
                    Instruction
                  </Label>
                  <Textarea
                    id="cycle-variant-instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder=""
                    className="min-h-[76px] resize-y rounded-lg border border-[#D5D7DA] bg-white px-3 py-2 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Copy to card */}
              <div className="flex flex-col gap-2 rounded-2xl bg-[#F5F5F5] p-4">
                <p className="text-sm font-medium leading-5 text-[#181D27]">
                  Copy to
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Client</SelectItem>
                      {clients.map((client) => (
                        <SelectItem
                          key={client.id}
                          value={`client:${client.id}`}
                        >
                          {client.name || `Client ${client.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
      </DialogContent>
    </Dialog>
  );
}
