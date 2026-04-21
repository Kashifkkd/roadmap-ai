"use client";

import React, { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
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
        typeof window !== "undefined" ? localStorage.getItem("Client id") : null;
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
      if (crossClient && (!Number.isFinite(targetClientId) || targetClientId < 0)) {
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
        crossClient && targetClientId != null ? targetClientId : currentClientId;

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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[520px] gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl [&>button]:hidden">
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
          <DialogTitle className="text-left text-lg font-semibold leading-tight text-[#181D27]">
            Create Cycle Variant
          </DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </DialogClose>
        </div>

        <div className="space-y-4 px-6 pb-2">
          {/* Cycle details */}
          <div className="rounded-xl bg-[#F8F9FA] p-4">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-gray-600">Cycle Title</p>
              <p className="text-base font-semibold leading-snug text-[#181D27]">
                {cycleName || "—"}
              </p>
            </div>

            <div className="mt-4 space-y-3 rounded-xl bg-[#F3F4F6] p-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="cycle-variant-title"
                  className="text-[11px] font-medium text-gray-600"
                >
                  New Cycle Title{" "}
                  {/* <span className="font-normal text-gray-400">(optional)</span> */}
                </Label>
                <Input
                  id="cycle-variant-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder=""
                  className="h-10 rounded-[10px] border border-gray-200 bg-white text-sm shadow-sm"
                  disabled={isSubmitting}
                />
              </div>
              {/* Instruction (optional)
              <div className="space-y-1.5">
                <Label
                  htmlFor="cycle-variant-instructions"
                  className="text-[11px] font-medium text-gray-600"
                >
                  Instruction{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </Label>
                <Textarea
                  id="cycle-variant-instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder=""
                  className="min-h-[100px] resize-y rounded-[10px] border border-gray-200 bg-white text-sm shadow-sm"
                  disabled={isSubmitting}
                />
              </div>
              */}
            </div>
          </div>

          {/* Copy to */}
          <div className="rounded-xl bg-[#F8F9FA] p-4">
            <p className="text-xs font-semibold text-[#181D27]">Copy to</p>
            <div className="my-3 h-px w-full bg-gray-200" aria-hidden />

            <div className="space-y-1">
              <p className="text-[11px] font-medium text-gray-600">Client</p>
              <Select
                value={copyClientValue}
                onValueChange={setCopyClientValue}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-10 w-full rounded-[10px] border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={`client:${client.id}`}>
                      {client.name || `Client ${client.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              className="h-10 min-w-[96px] rounded-[10px] px-5 text-sm font-medium inline-flex items-center justify-center gap-1.5"
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
